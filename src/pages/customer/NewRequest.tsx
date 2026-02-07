import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
 import { Upload, X, Loader2, Image as ImageIcon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomerDashboardLayout } from '@/components/dashboard/CustomerDashboardLayout';
import { AIDesignStudio } from '@/components/ai/AIDesignStudio';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { logError } from '@/lib/logger';
import { requestSchema } from '@/lib/validation';

const styleOptions = [
  { value: 'modern', label: 'Modern', description: 'Clean lines, contemporary silhouettes' },
  { value: 'traditional', label: 'Traditional', description: 'Classic elegance, timeless designs' },
  { value: 'fusion', label: 'Fusion', description: 'Mix of cultural and modern elements' },
  { value: 'custom', label: 'Custom', description: 'Your unique vision' },
];

const budgetOptions = [
  { min: 500, max: 1500, label: '₹500 - ₹1,500' },
  { min: 1500, max: 3000, label: '₹1,500 - ₹3,000' },
  { min: 3000, max: 5000, label: '₹3,000 - ₹5,000' },
  { min: 5000, max: 10000, label: '₹5,000+' },
];

const timelineOptions = [
  { weeks: 1, label: '1 Week (Rush)' },
  { weeks: 2, label: '2 Weeks (Standard)' },
  { weeks: 4, label: '4 Weeks (Flexible)' },
];

export default function NewRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
   const [inspirationImages, setInspirationImages] = useState<{ file: File; preview: string }[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stylePreference: 'modern',
    budgetMin: 500,
    budgetMax: 1500,
    timelineWeeks: 2,
    pickupAddress: '',
    deliveryAddress: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };
 
   const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(e.target.files || []);
     const newImages = files.map((file) => ({
       file,
       preview: URL.createObjectURL(file),
     }));
     setInspirationImages([...inspirationImages, ...newImages].slice(0, 3)); // Max 3 inspiration images
   };
 
   const removeInspirationImage = (index: number) => {
     const newImages = [...inspirationImages];
     URL.revokeObjectURL(newImages[index].preview);
     newImages.splice(index, 1);
     setInspirationImages(newImages);
   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form data
    const validation = requestSchema.safeParse({
      title: formData.title,
      description: formData.description,
      pickupAddress: formData.pickupAddress,
      deliveryAddress: formData.deliveryAddress,
    });

    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: 'Images required',
        description: 'Please upload at least one photo of your dress.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create the redesign request
      const { data: request, error: requestError } = await supabase
        .from('redesign_requests')
        .insert({
          customer_id: user.id,
          title: formData.title,
          description: formData.description,
          style_preference: formData.stylePreference,
          budget_min: formData.budgetMin,
          budget_max: formData.budgetMax,
          timeline_weeks: formData.timelineWeeks,
          pickup_address: formData.pickupAddress,
          delivery_address: formData.deliveryAddress,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Upload images
      setUploadingImages(true);
      for (const image of images) {
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${user.id}/${request.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('dress-images')
          .upload(fileName, image.file);

        if (uploadError) throw uploadError;

        const { data: signedUrlData } = await supabase.storage
          .from('dress-images')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

        await supabase.from('dress_images').insert({
          request_id: request.id,
          image_url: signedUrlData?.signedUrl || fileName,
          image_type: 'original',
        });
      }
 
       // Upload inspiration images
       for (const image of inspirationImages) {
         const fileExt = image.file.name.split('.').pop();
         const fileName = `${user.id}/${request.id}/inspiration-${Date.now()}.${fileExt}`;
         
         const { error: uploadError } = await supabase.storage
           .from('dress-images')
           .upload(fileName, image.file);
 
         if (uploadError) throw uploadError;
 
        const { data: signedUrlData } = await supabase.storage
          .from('dress-images')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

        await supabase.from('dress_images').insert({
          request_id: request.id,
          image_url: signedUrlData?.signedUrl || fileName,
          image_type: 'inspiration',
        });
       }

      toast({
        title: 'Request submitted!',
        description: 'Designers will start sending you quotes soon.',
      });

      navigate('/dashboard/orders');
    } catch (error) {
      logError('NewRequest.submit', error);
      toast({
        title: 'Error',
        description: 'Failed to create request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <CustomerDashboardLayout title="New Redesign Request" subtitle="Tell us about your dress transformation">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* Image Upload */}
        <div className="card-luxury rounded-xl p-6">
          <h3 className="text-lg font-serif font-semibold mb-4">Upload Dress Photos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add up to 5 photos showing different angles of your dress
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={image.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
 
       {/* Desired Design / Inspiration Upload */}
       <div className="card-luxury rounded-xl p-6">
         <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
           <Palette className="w-5 h-5 text-accent" />
           Upload Design Inspiration (Optional)
         </h3>
         <p className="text-sm text-muted-foreground mb-4">
           Share reference images of styles you love. Add up to 3 inspiration photos.
         </p>
 
         <div className="grid grid-cols-3 gap-4">
           {inspirationImages.map((image, index) => (
             <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-accent/30">
               <img src={image.preview} alt="" className="w-full h-full object-cover" />
               <button
                 type="button"
                 onClick={() => removeInspirationImage(index)}
                 className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
               >
                 <X className="w-4 h-4" />
               </button>
               <div className="absolute bottom-0 left-0 right-0 bg-accent/80 text-accent-foreground text-xs py-1 text-center">
                 Inspiration
               </div>
             </div>
           ))}
           
           {inspirationImages.length < 3 && (
             <label className="aspect-square rounded-lg border-2 border-dashed border-accent/50 hover:border-accent cursor-pointer flex flex-col items-center justify-center transition-colors bg-accent/5">
               <Palette className="w-6 h-6 text-accent mb-2" />
               <span className="text-xs text-muted-foreground">Add Inspiration</span>
               <input
                 type="file"
                 accept="image/*"
                 multiple
                 onChange={handleInspirationUpload}
                 className="hidden"
               />
             </label>
           )}
         </div>
       </div>

        {/* Details */}
        <div className="card-luxury rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-serif font-semibold">Request Details</h3>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Transform my blue silk dress"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what kind of transformation you're looking for..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

           {/* AI Design Studio — suggestions + visualizer */}
           <AIDesignStudio
             title={formData.title}
             description={formData.description}
             stylePreference={formData.stylePreference}
             originalImages={images.map((img, i) => ({ url: img.preview, label: `Photo ${i + 1}` }))}
             inspirationImages={inspirationImages.map((img, i) => ({ url: img.preview, label: `Inspiration ${i + 1}` }))}
             onSuggestionApply={(suggestion) => {
               const currentDescription = formData.description;
               setFormData({
                 ...formData,
                 description: currentDescription 
                   ? `${currentDescription}\n\n--- AI Suggestions ---\n${suggestion}`
                   : suggestion,
               });
             }}
           />
         </div>
 
        {/* Style Preference */}
        <div className="card-luxury rounded-xl p-6">
          <h3 className="text-lg font-serif font-semibold mb-4">Style Preference</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {styleOptions.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setFormData({ ...formData, stylePreference: style.value })}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.stylePreference === style.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{style.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Budget & Timeline */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-luxury rounded-xl p-6">
            <h3 className="text-lg font-serif font-semibold mb-4">Budget</h3>
            <div className="space-y-3">
              {budgetOptions.map((budget) => (
                <button
                  key={budget.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, budgetMin: budget.min, budgetMax: budget.max })}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    formData.budgetMin === budget.min
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {budget.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card-luxury rounded-xl p-6">
            <h3 className="text-lg font-serif font-semibold mb-4">Timeline</h3>
            <div className="space-y-3">
              {timelineOptions.map((timeline) => (
                <button
                  key={timeline.weeks}
                  type="button"
                  onClick={() => setFormData({ ...formData, timelineWeeks: timeline.weeks })}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    formData.timelineWeeks === timeline.weeks
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {timeline.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card-luxury rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-serif font-semibold">Pickup & Delivery</h3>

          <div className="space-y-2">
            <Label htmlFor="pickupAddress">Pickup Address</Label>
            <Textarea
              id="pickupAddress"
              placeholder="Enter your pickup address..."
              rows={2}
              value={formData.pickupAddress}
              onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea
              id="deliveryAddress"
              placeholder="Enter your delivery address (or same as pickup)..."
              rows={2}
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {uploadingImages ? 'Uploading Images...' : 'Submitting...'}
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
        </div>
      </form>
    </CustomerDashboardLayout>
  );
}