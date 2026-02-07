import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DesignerDashboardLayout } from '@/components/dashboard/DesignerDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { logError } from '@/lib/logger';
import { portfolioSchema } from '@/lib/validation';

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  before_image_url: string | null;
  after_image_url: string;
  category: string | null;
  tags: string[] | null;
  is_featured: boolean | null;
  created_at: string;
}

export default function Portfolio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    before_image_url: '',
    after_image_url: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  const fetchPortfolio = async () => {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('designer_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleImageUpload = async (file: File, type: 'before' | 'after') => {
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}_${type}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('dress-images')
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    const { data: urlData } = await supabase.storage
      .from('dress-images')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    setFormData((prev) => ({
      ...prev,
      [type === 'before' ? 'before_image_url' : 'after_image_url']: urlData?.signedUrl || '',
    }));
    setUploading(false);
  };

  const handleSubmit = async () => {
    const validation = portfolioSchema.safeParse({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
    });

    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (!formData.after_image_url) {
      toast({
        title: 'Missing fields',
        description: 'Please provide an after image',
        variant: 'destructive',
      });
      return;
    }

    const portfolioData = {
      designer_id: user?.id,
      title: formData.title,
      description: formData.description || null,
      category: formData.category || null,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : null,
      before_image_url: formData.before_image_url || null,
      after_image_url: formData.after_image_url,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('portfolio_items')
        .update(portfolioData)
        .eq('id', editingItem.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Portfolio item updated' });
        fetchPortfolio();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('portfolio_items').insert(portfolioData);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Portfolio item added' });
        fetchPortfolio();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Portfolio item removed' });
      fetchPortfolio();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: '',
      before_image_url: '',
      after_image_url: '',
    });
    setEditingItem(null);
    setDialogOpen(false);
  };

  const openEditDialog = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || '',
      tags: item.tags?.join(', ') || '',
      before_image_url: item.before_image_url || '',
      after_image_url: item.after_image_url,
    });
    setDialogOpen(true);
  };

  return (
    <DesignerDashboardLayout title="Portfolio" subtitle="Showcase your best dress transformations">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} in your portfolio
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingItem(null); resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Vintage Saree to Modern Gown"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the transformation..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Wedding, Casual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., saree, gown, silk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Before Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {formData.before_image_url ? (
                      <div className="relative">
                        <img
                          src={formData.before_image_url}
                          alt="Before"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => setFormData({ ...formData, before_image_url: '' })}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload before image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'before')}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>After Image *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {formData.after_image_url ? (
                      <div className="relative">
                        <img
                          src={formData.after_image_url}
                          alt="After"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => setFormData({ ...formData, after_image_url: '' })}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload after image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'after')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={uploading} className="flex-1">
                  {uploading ? 'Uploading...' : editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 card-luxury rounded-xl">
          <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">No portfolio items yet</h3>
          <p className="text-muted-foreground mb-6">Start showcasing your dress transformations</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="card-luxury rounded-xl overflow-hidden group">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={item.after_image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" onClick={() => openEditDialog(item)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif font-semibold text-lg mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DesignerDashboardLayout>
  );
}
