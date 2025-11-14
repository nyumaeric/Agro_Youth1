"use client";
import { getAllProducts, getAllProductsByUser } from "@/services/products/getProducts";
import { getFromCache, saveToCache } from "@/utils/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// export const useAllProductsByUser = () => {
//     return useQuery({
//         queryKey: ["products"],
//         queryFn: () => getAllProductsByUser(),
//         retry: false,
//       });
// }


interface Product {
  id: string;
  cropName: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  description: string;
  isAvailable: boolean;
  images: string[];
  userId?: string;
  _pending?: boolean;
}

interface ProductsResponse {
  data: Product[];
}

interface OfflineQueueItem {
  id: string;
  productId?: string;
  data?: any;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
}



// Create product mutation with offline queue
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: any) => {
      // Check if online
      if (!navigator.onLine) {
        // Save to offline queue
        const offlineQueue = (await getFromCache<OfflineQueueItem[]>('offline-queue-products')) || [];
        const queueItem: OfflineQueueItem = {
          id: `temp-${Date.now()}`,
          data: productData,
          action: 'create',
          timestamp: Date.now(),
        };
        
        offlineQueue.push(queueItem);
        await saveToCache('offline-queue-products', offlineQueue);
        
        // Add to local cache optimistically
        const myProducts = (await getFromCache<ProductsResponse>('my-products')) || { data: [] };
        myProducts.data.unshift({
          ...productData,
          id: queueItem.id,
          _pending: true, // Mark as pending sync
        });
        await saveToCache('my-products', myProducts);
        
        return { data: productData, _pending: true };
      }

      // If online, send to server
      const response = await axios.post('/api/products', productData);
      
      // Update cache with server response
      const myProducts = (await getFromCache<ProductsResponse>('my-products')) || { data: [] };
      myProducts.data.unshift(response.data.data);
      await saveToCache('my-products', myProducts);
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['all-products'] });
    },
    retry: false,
  });
};


export const useAllProductsByUser = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const cacheKey = 'my-products';
      
      // Try to get from cache first
      const cached = await getFromCache(cacheKey);
      
      // If offline, return cached data immediately
      if (!navigator.onLine && cached) {
        console.log('Using cached user products (offline)');
        return cached;
      }

      try {
        // Fetch from API
        const response = await getAllProductsByUser();
        
        // Save to cache for offline use
        await saveToCache(cacheKey, response);
        
        return response;
      } catch (error) {
        // If fetch fails and we have cache, use it as fallback
        if (cached) {
          console.log('Using cached user products due to network error');
          return cached;
        }
        throw error;
      }
    },
    retry: navigator.onLine ? 1 : false,
    refetchOnWindowFocus: navigator.onLine,
  });
};



// Create product mutation with offline queue


// export const useAllProducts = () => {
//     return useQuery({
//         queryKey: ["all-products"],
//         queryFn: () => getAllProducts(),
//         retry: false,
//       });
// }



export const useAllProducts = () => {
  return useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const cacheKey = 'all-products';
      
      // Try to get from cache first
      const cached = await getFromCache(cacheKey);
      
      // If offline, return cached data immediately
      if (!navigator.onLine && cached) {
        console.log('Using cached products (offline)');
        return cached;
      }

      try {
        // Fetch from API (replace with your actual API call)
        // const response = await axios.get<{ data: Product[] }>('/api/products');
        const products = getAllProducts();
        
        // Save to cache for offline use
        await saveToCache(cacheKey, products);
        
        return products;
      } catch (error) {
        // If fetch fails and we have cache, use it as fallback
        if (cached) {
          console.log('Using cached products due to network error');
          return cached;
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if offline
      if (!navigator.onLine) return false;
      // Retry once if online
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    // refetchOnWindowFocus: navigator.onLine, // Only refetch when online
  });
};