import { useState, useRef, useEffect } from "react";
import { Upload, X, Plus, Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateProduct } from "@/hooks/products/useGetAllProducts";

interface ImagePreview {
  file: File;
  preview: string;
  base64?: string;
}

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const createProductMutation = useCreateProduct();
  const [isOnline, setIsOnline] = useState(true);
  
  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    unit: "kg",
    price: "",
    description: "",
    location: "",
    isAvailable: true,
  });
  
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const units = ["kg", "g", "lbs", "pieces", "bundles", "bags"];

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newImages: ImagePreview[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size is 5MB`);
        continue;
      }

      if (images.length + newImages.length >= 10) {
        alert("Maximum 10 images allowed");
        break;
      }

      const preview = URL.createObjectURL(file);
      const base64 = await fileToBase64(file);
      
      newImages.push({
        file,
        preview,
        base64,
      });
    }

    setImages(prev => [...prev, ...newImages]);
    if (errors.images) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      unit: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isAvailable: checked,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cropName.trim()) {
      newErrors.cropName = "Crop name is required";
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = "Valid quantity is required";
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const productData = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        images: images.map(img => img.base64 || ""),
      };

      await createProductMutation.mutateAsync(productData);
      
      if (!isOnline) {
        alert("Product will be created when you come back online!");
      } else {
        alert("Product created successfully!");
      }
      
      clearForm();
      onOpenChange(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create product. Please try again.");
      console.error(error);
    }
  };

  const clearForm = () => {
    setFormData({
      cropName: "",
      quantity: "",
      unit: "kg",
      price: "",
      description: "",
      location: "",
      isAvailable: true,
    });
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Create New Product
            {!isOnline && <WifiOff className="w-5 h-5 text-orange-600" />}
          </DialogTitle>
          <DialogDescription>
            {isOnline 
              ? 'Add a new product to your inventory'
              : 'Working offline - Changes will be saved and synced when online'}
          </DialogDescription>
        </DialogHeader>

        {!isOnline && (
          <Alert className="border-orange-200 bg-orange-50">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You're offline. Your product will be saved locally and automatically created when you reconnect.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>
              Product Images <span className="text-red-500">*</span>
              <span className="text-muted-foreground font-normal ml-2">(Max 10 images, 5MB each)</span>
            </Label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : errors.images 
                  ? "border-destructive"
                  : "border-input hover:border-primary/50 hover:bg-accent"
              }`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-foreground mb-2">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-muted-foreground">PNG, JPG, JPEG, WebP (max. 5MB)</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {errors.images && (
              <Alert variant="destructive">
                <AlertDescription>{errors.images}</AlertDescription>
              </Alert>
            )}

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-border">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}

                {images.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed hover:border-primary hover:bg-accent flex flex-col items-center justify-center h-auto"
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm">Add More</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cropName">
              Crop Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cropName"
              name="cropName"
              value={formData.cropName}
              onChange={handleInputChange}
              placeholder="e.g., Organic Tomatoes"
              className={errors.cropName ? "border-destructive" : ""}
            />
            {errors.cropName && (
              <p className="text-sm text-destructive">{errors.cropName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="100"
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Unit <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.unit} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              Price per Unit ($) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="10.99"
              className={errors.price ? "border-destructive" : ""}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Kigali, Rwanda"
              className={errors.location ? "border-destructive" : ""}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe your product..."
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={handleCheckboxChange}
            />
            <Label
              htmlFor="isAvailable"
              className="text-sm font-normal cursor-pointer"
            >
              Product is available for sale
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={createProductMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {createProductMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {!isOnline && !createProductMutation.isPending && <WifiOff className="w-4 h-4" />}
              {createProductMutation.isPending 
                ? "Creating Product..." 
                : isOnline 
                  ? "Create Product" 
                  : "Save Offline"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearForm();
                onOpenChange(false);
              }}
              disabled={createProductMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}