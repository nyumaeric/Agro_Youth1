// // import { useState } from "react";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";

// // interface CreateProductDialogProps {
// //   open: boolean;
// //   onOpenChange: (open: boolean) => void;
// // }

// // export default function CreateProductDialog({
// //   open,
// //   onOpenChange,
// // }: CreateProductDialogProps) {
// //   const [formData, setFormData] = useState({
// //     cropName: "",
// //     quantity: "",
// //     unit: "kg",
// //     price: "",
// //     description: "",
// //     isAvailable: true,
// //   });

// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const handleInputChange = (
// //     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
// //   ) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const handleSubmit = async () => {
// //     setIsSubmitting(true);

// //     try {
// //       // Add your API call here
// //       // await createProduct(formData);
      
// //       console.log("Product data:", formData);
      
// //       // Reset form and close dialog
// //       setFormData({
// //         cropName: "",
// //         quantity: "",
// //         unit: "kg",
// //         price: "",
// //         description: "",
// //         isAvailable: true,
// //       });
      
// //       onOpenChange(false);
// //     } catch (error) {
// //       console.error("Error creating product:", error);
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
// //         <DialogHeader>
// //           <DialogTitle className="text-2xl font-bold text-gray-900">
// //             Create New Product
// //           </DialogTitle>
// //           <DialogDescription className="text-gray-500">
// //             Add a new product to your inventory. Fill in all the required details.
// //           </DialogDescription>
// //         </DialogHeader>

// //         <div className="space-y-6 mt-4">
// //           {/* Crop Name */}
// //           <div className="space-y-2">
// //             <Label htmlFor="cropName" className="text-sm font-medium text-gray-700">
// //               Crop Name *
// //             </Label>
// //             <Input
// //               id="cropName"
// //               name="cropName"
// //               value={formData.cropName}
// //               onChange={handleInputChange}
// //               placeholder="e.g., Tomatoes, Wheat, Corn"
// //               required
// //               className="w-full"
// //             />
// //           </div>

// //           {/* Quantity and Unit */}
// //           <div className="grid grid-cols-2 gap-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
// //                 Quantity *
// //               </Label>
// //               <Input
// //                 id="quantity"
// //                 name="quantity"
// //                 type="number"
// //                 value={formData.quantity}
// //                 onChange={handleInputChange}
// //                 placeholder="0"
// //                 required
// //                 min="0"
// //                 step="0.01"
// //                 className="w-full"
// //               />
// //             </div>

// //             <div className="space-y-2">
// //               <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
// //                 Unit *
// //               </Label>
// //               <Select
// //                 value={formData.unit}
// //                 onValueChange={(value) =>
// //                   setFormData((prev) => ({ ...prev, unit: value }))
// //                 }
// //               >
// //                 <SelectTrigger>
// //                   <SelectValue placeholder="Select unit" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="kg">Kilograms (kg)</SelectItem>
// //                   <SelectItem value="lbs">Pounds (lbs)</SelectItem>
// //                   <SelectItem value="tons">Tons</SelectItem>
// //                   <SelectItem value="units">Units</SelectItem>
// //                   <SelectItem value="bags">Bags</SelectItem>
// //                   <SelectItem value="boxes">Boxes</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //             </div>
// //           </div>

// //           {/* Price */}
// //           <div className="space-y-2">
// //             <Label htmlFor="price" className="text-sm font-medium text-gray-700">
// //               Price (per unit) *
// //             </Label>
// //             <div className="relative">
// //               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
// //                 $
// //               </span>
// //               <Input
// //                 id="price"
// //                 name="price"
// //                 type="number"
// //                 value={formData.price}
// //                 onChange={handleInputChange}
// //                 placeholder="0"
// //                 required
// //                 min="0"
// //                 step="1"
// //                 className="pl-7"
// //               />
// //             </div>
// //             <p className="text-xs text-gray-500">Enter price in cents (e.g., 100 for $1.00)</p>
// //           </div>

// //           {/* Description */}
// //           <div className="space-y-2">
// //             <Label htmlFor="description" className="text-sm font-medium text-gray-700">
// //               Description
// //             </Label>
// //             <Textarea
// //               id="description"
// //               name="description"
// //               value={formData.description}
// //               onChange={handleInputChange}
// //               placeholder="Provide additional details about the product..."
// //               rows={4}
// //               className="w-full resize-none"
// //             />
// //           </div>

// //           {/* Availability */}
// //           <div className="flex items-center gap-3">
// //             <input
// //               type="checkbox"
// //               id="isAvailable"
// //               checked={formData.isAvailable}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({
// //                   ...prev,
// //                   isAvailable: e.target.checked,
// //                 }))
// //               }
// //               className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
// //             />
// //             <Label
// //               htmlFor="isAvailable"
// //               className="text-sm font-medium text-gray-700 cursor-pointer"
// //             >
// //               Product is available for sale
// //             </Label>
// //           </div>

// //           {/* Action Buttons */}
// //           <div className="flex items-center gap-3 pt-4 border-t">
// //             <Button
// //               type="button"
// //               variant="outline"
// //               onClick={() => onOpenChange(false)}
// //               className="flex-1"
// //               disabled={isSubmitting}
// //             >
// //               Cancel
// //             </Button>
// //             <Button
// //               type="button"
// //               onClick={handleSubmit}
// //               className="flex-1 bg-emerald-600 hover:bg-emerald-700"
// //               disabled={isSubmitting}
// //             >
// //               {isSubmitting ? (
// //                 <span className="flex items-center gap-2">
// //                   <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
// //                     <circle
// //                       className="opacity-25"
// //                       cx="12"
// //                       cy="12"
// //                       r="10"
// //                       stroke="currentColor"
// //                       strokeWidth="4"
// //                     />
// //                     <path
// //                       className="opacity-75"
// //                       fill="currentColor"
// //                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
// //                     />
// //                   </svg>
// //                   Creating...
// //                 </span>
// //               ) : (
// //                 "Create Product"
// //               )}
// //             </Button>
// //           </div>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }




// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// // Create Product API function
// const createProduct = async (productData: any) => {
//   const response = await fetch("/api/products", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(productData),
//   });

//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.message || "Failed to create product");
//   }

//   return response.json();
// };

// // Create Product Dialog Component
// export default function CreateProductDialog({
//   open,
//   onOpenChange,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }) {
//   const queryClient = useQueryClient();
//   const [formData, setFormData] = useState({
//     cropName: "",
//     quantity: "",
//     unit: "kg",
//     price: "",
//     description: "",
//     location: "",
//     isAvailable: true,
//   });

//   const createProductMutation = useMutation({
//     mutationFn: createProduct,
//     onSuccess: () => {
//       // Invalidate and refetch products
//       queryClient.invalidateQueries({ queryKey: ["products"] });
      
//       // Reset form
//       setFormData({
//         cropName: "",
//         quantity: "",
//         unit: "kg",
//         price: "",
//         description: "",
//         location: "",
//         isAvailable: true,
//       });
      
//       // Close dialog
//       onOpenChange(false);
//     },
//     onError: (error: Error) => {
//       console.error("Error creating product:", error);
//       alert(error.message || "Failed to create product");
//     },
//   });

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     // Basic validation
//     if (!formData.cropName || !formData.quantity || !formData.price || !formData.location) {
//       alert("Please fill in all required fields");
//       return;
//     }

//     // Convert string values to numbers
//     const productData = {
//       cropName: formData.cropName,
//       quantity: parseFloat(formData.quantity),
//       unit: formData.unit,
//       price: parseFloat(formData.price),
//       description: formData.description,
//       location: formData.location,
//       isAvailable: formData.isAvailable,
//     };

//     createProductMutation.mutate(productData);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold text-gray-900">
//             Create New Product
//           </DialogTitle>
//           <DialogDescription className="text-gray-500">
//             Add a new product to your inventory. Fill in all the required details.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6 mt-4">
//           {/* Crop Name */}
//           <div className="space-y-2">
//             <Label htmlFor="cropName" className="text-sm font-medium text-gray-700">
//               Crop Name *
//             </Label>
//             <Input
//               id="cropName"
//               name="cropName"
//               value={formData.cropName}
//               onChange={handleInputChange}
//               placeholder="e.g., Tomatoes, Wheat, Corn"
//               required
//               className="w-full"
//             />
//           </div>

//           {/* Quantity and Unit */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
//                 Quantity *
//               </Label>
//               <Input
//                 id="quantity"
//                 name="quantity"
//                 type="number"
//                 value={formData.quantity}
//                 onChange={handleInputChange}
//                 placeholder="0"
//                 required
//                 min="1"
//                 step="1"
//                 className="w-full"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
//                 Unit *
//               </Label>
//               <Select
//                 value={formData.unit}
//                 onValueChange={(value) =>
//                   setFormData((prev) => ({ ...prev, unit: value }))
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select unit" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="kg">Kilograms (kg)</SelectItem>
//                   <SelectItem value="lbs">Pounds (lbs)</SelectItem>
//                   <SelectItem value="tons">Tons</SelectItem>
//                   <SelectItem value="units">Units</SelectItem>
//                   <SelectItem value="bags">Bags</SelectItem>
//                   <SelectItem value="boxes">Boxes</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Price */}
//           <div className="space-y-2">
//             <Label htmlFor="price" className="text-sm font-medium text-gray-700">
//               Price (per unit) *
//             </Label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
//                 $
//               </span>
//               <Input
//                 id="price"
//                 name="price"
//                 type="number"
//                 value={formData.price}
//                 onChange={handleInputChange}
//                 placeholder="0.00"
//                 required
//                 min="0"
//                 step="0.01"
//                 className="pl-7"
//               />
//             </div>
//             <p className="text-xs text-gray-500">Enter price per unit (e.g., 1.50 for $1.50)</p>
//           </div>

//           {/* Location */}
//           <div className="space-y-2">
//             <Label htmlFor="location" className="text-sm font-medium text-gray-700">
//               Location *
//             </Label>
//             <Input
//               id="location"
//               name="location"
//               value={formData.location}
//               onChange={handleInputChange}
//               placeholder="e.g., Farm A, Warehouse B"
//               required
//               className="w-full"
//             />
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description" className="text-sm font-medium text-gray-700">
//               Description *
//             </Label>
//             <Textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               placeholder="Provide additional details about the product..."
//               rows={4}
//               className="w-full resize-none"
//             />
//           </div>

//           {/* Availability */}
//           <div className="flex items-center gap-3">
//             <input
//               type="checkbox"
//               id="isAvailable"
//               checked={formData.isAvailable}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   isAvailable: e.target.checked,
//                 }))
//               }
//               className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
//             />
//             <Label
//               htmlFor="isAvailable"
//               className="text-sm font-medium text-gray-700 cursor-pointer"
//             >
//               Product is available for sale
//             </Label>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex items-center gap-3 pt-4 border-t">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               className="flex-1"
//               disabled={createProductMutation.isPending}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               onClick={handleSubmit}
//               className="flex-1 bg-emerald-600 hover:bg-emerald-700"
//               disabled={createProductMutation.isPending}
//             >
//               {createProductMutation.isPending ? (
//                 <span className="flex items-center gap-2">
//                   <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     />
//                   </svg>
//                   Creating...
//                 </span>
//               ) : (
//                 "Create Product"
//               )}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
import { useState, useRef } from "react";
import { Upload, X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const units = ["kg", "g", "lbs", "pieces", "bundles", "bags"];

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newImages: ImagePreview[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size is 5MB`);
        continue;
      }

      // Check total images limit
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

  // Handle drag and drop
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

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle select change
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      unit: value,
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isAvailable: checked,
    }));
  };

  // Validate form
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data with base64 images
      const productData = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        images: images.map(img => img.base64 || ""),
      };

      // Replace with your actual API call
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      alert("Product created successfully!");
      
      // Reset form
      clearForm();
      onOpenChange(false);
    } catch (error) {
      alert("Failed to create product. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
          <DialogTitle className="text-2xl">Create New Product</DialogTitle>
          <DialogDescription>Add a new product to your inventory</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>
              Product Images <span className="text-red-500">*</span>
              <span className="text-muted-foreground font-normal ml-2">(Max 10 images, 5MB each)</span>
            </Label>

            {/* Drag and Drop Area */}
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

            {/* Image Previews */}
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

          {/* Crop Name */}
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

          {/* Quantity and Unit */}
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

          {/* Price */}
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

          {/* Location */}
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

          {/* Description */}
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

          {/* Availability */}
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

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating Product..." : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}