// 'use client';

// import React, { useState, useEffect } from 'react';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { useAllProducts } from '@/hooks/products/useGetAllProducts';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from '@/components/ui/button';
// import { X, ChevronLeft, ChevronRight, Phone, User, MapPin, Package } from 'lucide-react';

// interface MarketListing {
//   id: string;
//   cropName: string;
//   quantity: number;
//   unit: string;
//   price: number;
//   location: string;
//   userId: string;
//   description: string;
//   isAvailable: boolean;
//   images?: string[];
//   name: string;
//   phoneNumber: string;
// }

// const UNITS = ['kg', 'lbs', 'bags', 'bundles', 'pieces'];

// const Market: React.FC = () => {
//   const { data, isPending } = useAllProducts();
//   const AllProducts = data?.data || [];
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [success, setSuccess] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [token, setToken] = useState<string | null>(null);
//   const [selectedProduct, setSelectedProduct] = useState<MarketListing | null>(null);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
//   const [selectedSeller, setSelectedSeller] = useState<{ name: string; phoneNumber: string } | null>(null);

//   const [newListing, setNewListing] = useState({
//     cropName: '',
//     quantity: '',
//     unit: 'kg',
//     price: '',
//     location: '',
//     description: '',
//   });

//   useEffect(() => {
//     setToken(localStorage.getItem('access_token'));
//   }, []);

//   const handleCreateListing = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!token) {
//       alert('Please login to create a market listing');
//       return;
//     }
//     setSuccess('Market listing created successfully!');
//     setNewListing({
//       cropName: '',
//       quantity: '',
//       unit: 'kg',
//       price: '',
//       location: '',
//       description: '',
//     });
//     setShowCreateForm(false);
//     setTimeout(() => setSuccess(''), 3000);
//   };

//   const openProductDetails = (product: MarketListing) => {
//     setSelectedProduct(product);
//     setCurrentImageIndex(0);
//   };

//   const closeProductDetails = () => {
//     setSelectedProduct(null);
//     setCurrentImageIndex(0);
//   };

//   const nextImage = () => {
//     if (selectedProduct?.images) {
//       setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images!.length);
//     }
//   };

//   const prevImage = () => {
//     if (selectedProduct?.images) {
//       setCurrentImageIndex((prev) => 
//         (prev - 1 + selectedProduct.images!.length) % selectedProduct.images!.length
//       );
//     }
//   };

//   const handleContactSeller = (listing: MarketListing) => {
//     setSelectedSeller({
//       name: listing.name,
//       phoneNumber: listing.phoneNumber
//     });
//     setIsContactDialogOpen(true);
//   };

//   const filteredListings = AllProducts.filter((listing: MarketListing) => {
//     const matchesSearch = listing.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       listing.description.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesSearch && listing.isAvailable;
//   });

//   return (
//     <>
//       <div className="min-h-screen py-28 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Header */}
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold text-yellow-600 mb-4">
//               🛒 Agricultural Marketplace
//             </h1>
//             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//               Connect directly with farmers and buyers. Find fresh produce at fair prices 
//               or list your harvest to reach more customers.
//             </p>
//           </div>

//           {success && (
//             <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
//               <div className="flex items-center">
//                 <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span className="text-green-800">{success}</span>
//               </div>
//               <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           )}

//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//               <div className="flex flex-col sm:flex-row gap-4 flex-1">
//                 <div className="flex-1 relative">
//                   <input
//                     type="text"
//                     placeholder="Search products, locations..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                   <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//               </div>
//               {token && (
//                 <button
//                   onClick={() => setShowCreateForm(!showCreateForm)}
//                   className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   {showCreateForm ? 'Cancel' : '📦 List Product'}
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Loading State */}
//           {isPending && (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {[1, 2, 3, 4, 5, 6].map((i) => (
//                 <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                   <Skeleton height={200} />
//                   <div className="p-6">
//                     <Skeleton width="80%" height={24} className="mb-2" />
//                     <Skeleton width="60%" height={20} className="mb-4" />
//                     <Skeleton count={2} height={16} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Market Listings */}
//           {!isPending && filteredListings.length === 0 ? (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//               <div className="text-6xl mb-4">🛒</div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 {AllProducts.length === 0 ? 'No Products Available' : 'No Matching Products'}
//               </h3>
//               <p className="text-gray-600">
//                 {AllProducts.length === 0 
//                   ? 'Be the first to list a product in the marketplace!' 
//                   : 'Try adjusting your search to find products.'}
//               </p>
//             </div>
//           ) : !isPending && (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredListings.map((listing: MarketListing) => {
//                 const images = listing.images || [];
//                 return (
//                   <div 
//                     key={listing.id} 
//                     onClick={() => openProductDetails(listing)}
//                     className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
//                   >
//                     {/* Product Image */}
//                     <div className="relative h-56 bg-gray-100 overflow-hidden">
//                       {images.length > 0 ? (
//                         <>
//                           <img
//                             src={images[0]}
//                             alt={listing.cropName}
//                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                           />
//                           {images.length > 1 && (
//                             <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
//                               +{images.length - 1} more
//                             </div>
//                           )}
//                         </>
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200">
//                           <Package className="w-20 h-20 text-green-600 opacity-50" />
//                         </div>
//                       )}
//                       <div className="absolute top-3 left-3">
//                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                           listing.isAvailable 
//                             ? 'bg-green-500 text-white' 
//                             : 'bg-gray-500 text-white'
//                         }`}>
//                           {listing.isAvailable ? 'Available' : 'Sold Out'}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Product Info */}
//                     <div className="p-6">
//                       <div className="flex items-start justify-between mb-3">
//                         <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
//                           {listing.cropName}
//                         </h3>
//                         <div className="text-right ml-3">
//                           <div className="text-2xl font-bold text-green-600">
//                             ${listing.price}
//                           </div>
//                           <div className="text-xs text-gray-500">per {listing.unit}</div>
//                         </div>
//                       </div>

//                       <div className="space-y-2 mb-4">
//                         <div className="flex items-center text-sm text-gray-600">
//                           <Package className="w-4 h-4 mr-2 text-gray-400" />
//                           <span className="font-medium">{listing.quantity} {listing.unit}</span>
//                           <span className="ml-1">available</span>
//                         </div>
//                         <div className="flex items-center text-sm text-gray-600">
//                           <MapPin className="w-4 h-4 mr-2 text-gray-400" />
//                           <span className="line-clamp-1">{listing.location}</span>
//                         </div>
//                       </div>

//                       <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
//                         {listing.description}
//                       </p>

//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleContactSeller(listing);
//                         }}
//                         className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={!listing.isAvailable}
//                       >
//                         Contact Seller
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Product Details Sidebar */}
//       {selectedProduct && (
//         <div className="fixed inset-0 z-50 flex">
//           <div 
//             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={closeProductDetails}
//           />
          
//           <div className="ml-auto relative w-full max-w-2xl bg-white shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300">
//             <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//               <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
//               <button
//                 onClick={closeProductDetails}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <X className="w-6 h-6 text-gray-600" />
//               </button>
//             </div>

//             <div className="p-6 space-y-6">
//               {selectedProduct.images && selectedProduct.images.length > 0 && (
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                  
//                   <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
//                     <img
//                       src={selectedProduct.images[currentImageIndex]}
//                       alt={`${selectedProduct.cropName} - Image ${currentImageIndex + 1}`}
//                       className="w-full h-full object-contain"
//                     />
                    
//                     {selectedProduct.images.length > 1 && (
//                       <>
//                         <button
//                           onClick={prevImage}
//                           className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
//                         >
//                           <ChevronLeft className="w-6 h-6" />
//                         </button>
//                         <button
//                           onClick={nextImage}
//                           className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
//                         >
//                           <ChevronRight className="w-6 h-6" />
//                         </button>
                        
//                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
//                           {currentImageIndex + 1} / {selectedProduct.images.length}
//                         </div>
//                       </>
//                     )}
//                   </div>

//                   {selectedProduct.images.length > 1 && (
//                     <div className="grid grid-cols-4 gap-3">
//                       {selectedProduct.images.map((image: string, index: number) => (
//                         <button
//                           key={index}
//                           onClick={() => setCurrentImageIndex(index)}
//                           className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
//                             currentImageIndex === index
//                               ? "border-green-500 ring-2 ring-green-200"
//                               : "border-gray-200 hover:border-gray-300"
//                           }`}
//                         >
//                           <img
//                             src={image}
//                             alt={`Thumbnail ${index + 1}`}
//                             className="w-full h-full object-cover"
//                           />
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-2xl font-bold text-gray-900 mb-2">
//                     {selectedProduct.cropName}
//                   </h3>
//                   <span
//                     className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${
//                       selectedProduct.isAvailable
//                         ? "bg-green-100 text-green-700"
//                         : "bg-gray-100 text-gray-600"
//                     }`}
//                   >
//                     {selectedProduct.isAvailable ? "Available" : "Sold Out"}
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p className="text-sm text-gray-500 mb-1">Quantity</p>
//                     <p className="text-xl font-bold text-gray-900">
//                       {selectedProduct.quantity} {selectedProduct.unit}
//                     </p>
//                   </div>
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p className="text-sm text-gray-500 mb-1">Price</p>
//                     <p className="text-xl font-bold text-green-600">
//                       ${selectedProduct.price}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500 mb-1">Location</p>
//                   <p className="text-lg font-semibold text-gray-900">
//                     {selectedProduct.location}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-gray-500 mb-2">Description</p>
//                   <p className="text-gray-700 leading-relaxed">
//                     {selectedProduct.description}
//                   </p>
//                 </div>
//               </div>

//               <div className="pt-4 border-t border-gray-200">
//                 <Button 
//                   className="w-full bg-green-600 hover:bg-green-700"
//                   onClick={() => {
//                     handleContactSeller(selectedProduct);
//                     closeProductDetails();
//                   }}
//                   disabled={!selectedProduct.isAvailable}
//                 >
//                   Contact Seller
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Contact Seller Dialog */}
//       <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-semibold">Seller Contact Information</DialogTitle>
//             <DialogDescription>
//               Use the information below to contact the seller directly.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
//               <div className="flex-shrink-0">
//                 <User className="w-6 h-6 text-green-600" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-gray-500">Seller Name</p>
//                 <p className="text-base font-semibold text-gray-900">{selectedSeller?.name}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
//               <div className="flex-shrink-0">
//                 <Phone className="w-6 h-6 text-green-600" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-gray-500">Phone Number</p>
//                 <a 
//                   href={`tel:${selectedSeller?.phoneNumber}`}
//                   className="text-base font-semibold text-green-600 hover:text-green-700"
//                 >
//                   {selectedSeller?.phoneNumber}
//                 </a>
//               </div>
//             </div>
//           </div>
//           <div className="flex justify-end">
//             <Button
//               variant="outline"
//               onClick={() => setIsContactDialogOpen(false)}
//             >
//               Close
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default Market;


'use client';

import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAllProducts } from '@/hooks/products/useGetAllProducts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Phone, User, MapPin, Package, WifiOff } from 'lucide-react';

interface MarketListing {
  id: string;
  cropName: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  userId: string;
  description: string;
  isAvailable: boolean;
  images?: string[];
  name: string;
  phoneNumber: string;
}

const UNITS = ['kg', 'lbs', 'bags', 'bundles', 'pieces'];

const Market: React.FC = () => {
  const { data, isPending, isError } = useAllProducts();
  const AllProducts = data?.data || [];
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MarketListing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<{ name: string; phoneNumber: string } | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const [newListing, setNewListing] = useState({
    cropName: '',
    quantity: '',
    unit: 'kg',
    price: '',
    location: '',
    description: '',
  });

  // Check online status
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

  useEffect(() => {
    setToken(localStorage.getItem('access_token'));
  }, []);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to create a market listing');
      return;
    }
    if (!isOnline) {
      alert('You need to be online to create a listing');
      return;
    }
    setSuccess('Market listing created successfully!');
    setNewListing({
      cropName: '',
      quantity: '',
      unit: 'kg',
      price: '',
      location: '',
      description: '',
    });
    setShowCreateForm(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const openProductDetails = (product: MarketListing) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images!.length);
    }
  };

  const prevImage = () => {
    if (selectedProduct?.images) {
      setCurrentImageIndex((prev) => 
        (prev - 1 + selectedProduct.images!.length) % selectedProduct.images!.length
      );
    }
  };

  const handleContactSeller = (listing: MarketListing) => {
    setSelectedSeller({
      name: listing.name,
      phoneNumber: listing.phoneNumber
    });
    setIsContactDialogOpen(true);
  };

  const filteredListings = AllProducts.filter((listing: MarketListing) => {
    const matchesSearch = listing.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && listing.isAvailable;
  });

  return (
    <>
      <div className="min-h-screen py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-yellow-600 mb-4">
              🛒 Agricultural Marketplace
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect directly with farmers and buyers. Find fresh produce at fair prices 
              or list your harvest to reach more customers.
            </p>
          </div>

          {/* Offline Banner */}
          {!isOnline && (
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-lg flex items-center gap-3">
              <WifiOff className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">You're currently offline</p>
                <p className="text-sm">
                  {AllProducts.length > 0 
                    ? 'Showing cached products. You cannot create listings or contact sellers while offline.'
                    : 'No cached products available. Please connect to the internet.'}
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800">{success}</span>
              </div>
              <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search products, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              {token && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  disabled={!isOnline}
                  className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {!isOnline && <WifiOff className="w-4 h-4" />}
                  {showCreateForm ? 'Cancel' : '📦 List Product'}
                </button>
              )}
            </div>

            {/* Product Count */}
            <div className="text-gray-600 text-sm mt-4">
              Showing {filteredListings.length} product{filteredListings.length !== 1 ? 's' : ''}
              {!isOnline && AllProducts.length > 0 && ' (from cache)'}
            </div>
          </div>

          {/* Loading State */}
          {isPending && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <Skeleton height={200} />
                  <div className="p-6">
                    <Skeleton width="80%" height={24} className="mb-2" />
                    <Skeleton width="60%" height={20} className="mb-4" />
                    <Skeleton count={2} height={16} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State with Cached Data Check */}
          {isError && AllProducts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {!isOnline ? 'No Cached Products Available' : 'Error Loading Products'}
              </h3>
              <p className="text-gray-600">
                {!isOnline 
                  ? 'Please connect to the internet to load products.' 
                  : 'There was an error loading products. Please try again later.'}
              </p>
            </div>
          )}

          {/* Market Listings */}
          {!isPending && !isError && filteredListings.length === 0 && AllProducts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matching Products</h3>
              <p className="text-gray-600">Try adjusting your search to find products.</p>
            </div>
          )}

          {!isPending && !isError && AllProducts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
              <p className="text-gray-600">
                {!isOnline 
                  ? 'No cached products. Connect to the internet to load products.'
                  : 'Be the first to list a product in the marketplace!'}
              </p>
            </div>
          )}

          {!isPending && filteredListings.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing: MarketListing) => {
                const images = listing.images || [];
                return (
                  <div 
                    key={listing.id} 
                    onClick={() => openProductDetails(listing)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                  >
                    {/* Product Image */}
                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                      {images.length > 0 ? (
                        <>
                          <img
                            src={images[0]}
                            alt={listing.cropName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {images.length > 1 && (
                            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              +{images.length - 1} more
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200">
                          <Package className="w-20 h-20 text-green-600 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          listing.isAvailable 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}>
                          {listing.isAvailable ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                          {listing.cropName}
                        </h3>
                        <div className="text-right ml-3">
                          <div className="text-2xl font-bold text-green-600">
                            ${listing.price}
                          </div>
                          <div className="text-xs text-gray-500">per {listing.unit}</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">{listing.quantity} {listing.unit}</span>
                          <span className="ml-1">available</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="line-clamp-1">{listing.location}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                        {listing.description}
                      </p>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOnline) {
                            alert('You need to be online to contact sellers');
                            return;
                          }
                          handleContactSeller(listing);
                        }}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={!listing.isAvailable || !isOnline}
                      >
                        {!isOnline && <WifiOff className="w-4 h-4" />}
                        {!isOnline ? 'Offline Mode' : 'Contact Seller'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Sidebar */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeProductDetails}
          />
          
          <div className="ml-auto relative w-full max-w-2xl bg-white shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
              <button
                onClick={closeProductDetails}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                  
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedProduct.images[currentImageIndex]}
                      alt={`${selectedProduct.cropName} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                    
                    {selectedProduct.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {selectedProduct.images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {selectedProduct.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? "border-green-500 ring-2 ring-green-200"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.cropName}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${
                      selectedProduct.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedProduct.isAvailable ? "Available" : "Sold Out"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedProduct.quantity} {selectedProduct.unit}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-xl font-bold text-green-600">
                      ${selectedProduct.price}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProduct.location}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={() => {
                    if (!isOnline) {
                      alert('You need to be online to contact sellers');
                      return;
                    }
                    handleContactSeller(selectedProduct);
                    closeProductDetails();
                  }}
                  disabled={!selectedProduct.isAvailable || !isOnline}
                >
                  {!isOnline && <WifiOff className="w-4 h-4" />}
                  {!isOnline ? 'Offline - Cannot Contact' : 'Contact Seller'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Seller Contact Information</DialogTitle>
            <DialogDescription>
              Use the information below to contact the seller directly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Seller Name</p>
                <p className="text-base font-semibold text-gray-900">{selectedSeller?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <a 
                  href={`tel:${selectedSeller?.phoneNumber}`}
                  className="text-base font-semibold text-green-600 hover:text-green-700"
                >
                  {selectedSeller?.phoneNumber}
                </a>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsContactDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Market;