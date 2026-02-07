import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Lightbulb, RefreshCw, ImageIcon, Download, Image as ImgIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { logError } from '@/lib/logger';

interface ImageOption {
  url: string;
  label?: string;
}

interface AIDesignStudioProps {
  title?: string;
  description?: string;
  stylePreference?: string;
  originalImages?: ImageOption[];
  inspirationImages?: ImageOption[];
  onSuggestionApply?: (suggestion: string) => void;
  onImageGenerated?: (imageUrl: string) => void;
}

export function AIDesignStudio({
  title = '',
  description = '',
  stylePreference = '',
  originalImages = [],
  inspirationImages = [],
  onSuggestionApply,
  onImageGenerated,
}: AIDesignStudioProps) {
  const { toast } = useToast();

  // Suggestions state
  const [sugLoading, setSugLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [sugPrompt, setSugPrompt] = useState('');

  // Image gen state
  const [imgLoading, setImgLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [imgPrompt, setImgPrompt] = useState('');

  // Image selection state
  const [selectedOriginalIdx, setSelectedOriginalIdx] = useState(0);
  const [selectedInspirationIdx, setSelectedInspirationIdx] = useState(0);

  // Reset selection when images change
  useEffect(() => {
    if (selectedOriginalIdx >= originalImages.length) setSelectedOriginalIdx(0);
  }, [originalImages.length, selectedOriginalIdx]);

  useEffect(() => {
    if (selectedInspirationIdx >= inspirationImages.length) setSelectedInspirationIdx(0);
  }, [inspirationImages.length, selectedInspirationIdx]);

  // Auto-populate the visualizer prompt when form context changes
  useEffect(() => {
    if (!imgPrompt && (title || description)) {
      const parts: string[] = [];
      if (title) parts.push(title);
      if (description) parts.push(description);
      setImgPrompt(parts.join(' — '));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);

  const generateSuggestion = async (additionalContext?: string) => {
    setSugLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-design-suggestions', {
        body: {
          description: additionalContext || description || sugPrompt,
          stylePreference,
        },
      });
      if (error) throw error;
      if (data.success && data.suggestion) {
        setSuggestion(data.suggestion);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      logError('AIDesignStudio.suggestion', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate design suggestions.',
        variant: 'destructive',
      });
    } finally {
      setSugLoading(false);
    }
  };

  const selectedOriginalUrl = originalImages[selectedOriginalIdx]?.url;
  const selectedInspirationUrl = inspirationImages[selectedInspirationIdx]?.url;

  const generateImage = async () => {
    if (!imgPrompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please describe the design you want to generate.',
        variant: 'destructive',
      });
      return;
    }
    setImgLoading(true);
    setGeneratedDescription(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-design', {
        body: {
          prompt: imgPrompt,
          title,
          description,
          stylePreference,
          originalImageUrl: selectedOriginalUrl,
          inspirationImageUrl: selectedInspirationUrl,
        },
      });
      if (error) throw error;
      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setGeneratedDescription(data.description || null);
        onImageGenerated?.(data.imageUrl);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      logError('AIDesignStudio.image', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate design image.',
        variant: 'destructive',
      });
    } finally {
      setImgLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'ai-design-suggestion.png';
    link.click();
  };

  const hasOriginals = originalImages.length > 0;
  const hasInspirations = inspirationImages.length > 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Design Studio
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get creative suggestions and generate visual previews powered by AI.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="suggestions" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="visualizer" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Visualizer
            </TabsTrigger>
          </TabsList>

          {/* --- Suggestions Tab --- */}
          <TabsContent value="suggestions" className="space-y-4 mt-0">
            {!suggestion && (
              <>
                <Textarea
                  placeholder="Describe your vision… (e.g., 'I want to transform my grandmother's vintage saree into a modern cocktail dress')"
                  value={sugPrompt}
                  onChange={(e) => setSugPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  onClick={() => generateSuggestion(sugPrompt)}
                  disabled={sugLoading}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {sugLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating Ideas…
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Get Design Suggestions
                    </>
                  )}
                </Button>
              </>
            )}

            <AnimatePresence mode="wait">
              {suggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert rounded-lg bg-background/50 p-4 border border-border">
                    <ReactMarkdown>{suggestion}</ReactMarkdown>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => generateSuggestion()} disabled={sugLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${sugLoading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                    {onSuggestionApply && (
                      <Button size="sm" onClick={() => onSuggestionApply(suggestion)}>
                        Apply to Description
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setSuggestion(null); setSugPrompt(''); }}>
                      Clear
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* --- Visualizer Tab --- */}
          <TabsContent value="visualizer" className="space-y-4 mt-0">
            {/* Image selectors */}
            {(hasOriginals || hasInspirations) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original image selector */}
                {hasOriginals && (
                  <ImageSelector
                    label="Original Cloth"
                    images={originalImages}
                    selectedIndex={selectedOriginalIdx}
                    onSelect={setSelectedOriginalIdx}
                    borderColor="border-primary/30"
                    activeBorderColor="ring-primary"
                    badgeColor="bg-primary/80 text-primary-foreground"
                  />
                )}

                {/* Inspiration image selector */}
                {hasInspirations && (
                  <ImageSelector
                    label="Inspiration Design"
                    images={inspirationImages}
                    selectedIndex={selectedInspirationIdx}
                    onSelect={setSelectedInspirationIdx}
                    borderColor="border-accent/30"
                    activeBorderColor="ring-accent"
                    badgeColor="bg-accent/80 text-accent-foreground"
                  />
                )}
              </div>
            )}

            {/* Status chips */}
            {(hasOriginals || hasInspirations) && (
              <div className="flex flex-wrap gap-2">
                {hasOriginals && (
                  <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary rounded-full px-3 py-1.5 border border-primary/20">
                    <ImgIcon className="w-3 h-3" />
                    Using cloth photo {originalImages.length > 1 ? `${selectedOriginalIdx + 1}/${originalImages.length}` : ''}
                  </div>
                )}
                {hasInspirations && (
                  <div className="flex items-center gap-1.5 text-xs bg-accent/10 text-accent-foreground rounded-full px-3 py-1.5 border border-accent/20">
                    <ImgIcon className="w-3 h-3" />
                    Using inspiration {inspirationImages.length > 1 ? `${selectedInspirationIdx + 1}/${inspirationImages.length}` : ''}
                  </div>
                )}
              </div>
            )}

            <Textarea
              placeholder="Describe your dream design… (e.g., 'A flowing maxi dress with floral embroidery, off-shoulder sleeves, and a bohemian vibe')"
              value={imgPrompt}
              onChange={(e) => setImgPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />

            {!hasOriginals && !hasInspirations && (
              <p className="text-xs text-muted-foreground italic">
                Tip: Upload dress photos and inspiration images above for better results — the AI will use them as reference.
              </p>
            )}

            <Button
              onClick={generateImage}
              disabled={imgLoading || !imgPrompt.trim()}
              className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
            >
              {imgLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating Design…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Design Preview
                </>
              )}
            </Button>

            <AnimatePresence mode="wait">
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={generatedImage} alt="AI Generated Design" className="w-full h-auto" />
                  </div>

                  {/* AI Design Description */}
                  {generatedDescription && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-lg bg-background/50 border border-border p-4"
                    >
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Design Notes
                      </h4>
                      <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
                        <ReactMarkdown>{generatedDescription}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={generateImage} disabled={imgLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${imgLoading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                    <Button size="sm" variant="secondary" onClick={downloadImage}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setGeneratedImage(null); setGeneratedDescription(null); setImgPrompt(''); }}>
                      Clear
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Image Selector — lets users pick which image to use for AI gen    */
/* ------------------------------------------------------------------ */

interface ImageSelectorProps {
  label: string;
  images: ImageOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  borderColor: string;
  activeBorderColor: string;
  badgeColor: string;
}

function ImageSelector({ label, images, selectedIndex, onSelect, borderColor, activeBorderColor, badgeColor }: ImageSelectorProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(idx)}
            className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${borderColor} ${
              idx === selectedIndex ? `ring-2 ${activeBorderColor} ring-offset-1 ring-offset-background` : 'opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img.url} alt={img.label || `${label} ${idx + 1}`} className="w-full h-full object-cover" />
            {idx === selectedIndex && (
              <div className={`absolute bottom-0 left-0 right-0 ${badgeColor} text-[9px] py-0.5 text-center font-medium`}>
                Selected
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
