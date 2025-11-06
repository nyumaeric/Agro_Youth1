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

// interface CreateProductDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export default function CreateProductDialog({
//   open,
//   onOpenChange,
// }: CreateProductDialogProps) {
//   const [formData, setFormData] = useState({
//     cropName: "",
//     quantity: "",
//     unit: "kg",
//     price: "",
//     description: "",
//     isAvailable: true,
//   });

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     setIsSubmitting(true);

//     try {
//       // Add your API call here
//       // await createProduct(formData);
      
//       console.log("Product data:", formData);
      
//       // Reset form and close dialog
//       setFormData({
//         cropName: "",
//         quantity: "",
//         unit: "kg",
//         price: "",
//         description: "",
//         isAvailable: true,
//       });
      
//       onOpenChange(false);
//     } catch (error) {
//       console.error("Error creating product:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
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
//                 min="0"
//                 step="0.01"
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
//                 placeholder="0"
//                 required
//                 min="0"
//                 step="1"
//                 className="pl-7"
//               />
//             </div>
//             <p className="text-xs text-gray-500">Enter price in cents (e.g., 100 for $1.00)</p>
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description" className="text-sm font-medium text-gray-700">
//               Description
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
//               disabled={isSubmitting}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               onClick={handleSubmit}
//               className="flex-1 bg-emerald-600 hover:bg-emerald-700"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
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




import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Create Product API function
const createProduct = async (productData: any) => {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create product");
  }

  return response.json();
};

// Create Product Dialog Component
export default function CreateProductDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    unit: "kg",
    price: "",
    description: "",
    location: "",
    isAvailable: true,
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      // Reset form
      setFormData({
        cropName: "",
        quantity: "",
        unit: "kg",
        price: "",
        description: "",
        location: "",
        isAvailable: true,
      });
      
      // Close dialog
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Error creating product:", error);
      alert(error.message || "Failed to create product");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.cropName || !formData.quantity || !formData.price || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    // Convert string values to numbers
    const productData = {
      cropName: formData.cropName,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      price: parseFloat(formData.price),
      description: formData.description,
      location: formData.location,
      isAvailable: formData.isAvailable,
    };

    createProductMutation.mutate(productData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Create New Product
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Add a new product to your inventory. Fill in all the required details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Crop Name */}
          <div className="space-y-2">
            <Label htmlFor="cropName" className="text-sm font-medium text-gray-700">
              Crop Name *
            </Label>
            <Input
              id="cropName"
              name="cropName"
              value={formData.cropName}
              onChange={handleInputChange}
              placeholder="e.g., Tomatoes, Wheat, Corn"
              required
              className="w-full"
            />
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Quantity *
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0"
                required
                min="1"
                step="1"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                Unit *
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, unit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                  <SelectItem value="tons">Tons</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                  <SelectItem value="bags">Bags</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700">
              Price (per unit) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                className="pl-7"
              />
            </div>
            <p className="text-xs text-gray-500">Enter price per unit (e.g., 1.50 for $1.50)</p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Location *
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Farm A, Warehouse B"
              required
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide additional details about the product..."
              rows={4}
              className="w-full resize-none"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isAvailable: e.target.checked,
                }))
              }
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <Label
              htmlFor="isAvailable"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Product is available for sale
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={createProductMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}