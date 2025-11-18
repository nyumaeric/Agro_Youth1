"use client";
import { getAllProducts, getAllProductsByUser } from "@/services/products/getProducts";
import { getFromCache, removeFromCache, saveToCache } from "@/utils/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect } from "react";

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
  name: string;
  phoneNumber: string;
}

interface ProductsResponse {
  data: Product[];
}

interface OfflineQueueItem {
  id: string;
  data: any;
  action: 'create';
  timestamp: number;
}

export const useSyncOfflineProducts = () => {
  const queryClient = useQueryClient();
  const isClient = typeof window !== 'undefined';

  const syncOfflineQueue = useCallback(async () => {
    if (!isClient || !navigator.onLine) return;

    const offlineQueue = getFromCache<OfflineQueueItem[]>('offline-queue-products');
    if (!offlineQueue || offlineQueue.length === 0) return;




    
    const myProducts = getFromCache<ProductsResponse>('my-products') || { data: [] };
    const syncedIds: string[] = [];

    for (const queueItem of offlineQueue) {
      try {
        const existingProducts = await axios.get('/api/products');
        const isDuplicate = existingProducts.data.data?.some(
          (p: any) => 
            p.cropName === queueItem.data.cropName &&
            p.quantity === queueItem.data.quantity &&
            Math.abs(p.createdAt - queueItem.timestamp) < 60000
        );

        if (isDuplicate) {
          console.log(`Product ${queueItem.id} already exists, skipping...`);
          syncedIds.push(queueItem.id);
          
          myProducts.data = myProducts.data.map(p => 
            p.id === queueItem.id ? { ...p, _pending: false } : p
          );
          continue;
        }

        const response = await axios.post('/api/products', queueItem.data);
        console.log(`Synced product ${queueItem.id} successfully`);

        myProducts.data = myProducts.data.map(p => 
          p.id === queueItem.id ? response.data.data : p
        );

        syncedIds.push(queueItem.id);
      } catch (error) {
        console.error(`Failed to sync product ${queueItem.id}:`, error);
      }
    }

    const remainingQueue = offlineQueue.filter(
      item => !syncedIds.includes(item.id)
    );
    
    if (remainingQueue.length === 0) {
      removeFromCache('offline-queue-products');
    } else {
      saveToCache('offline-queue-products', remainingQueue);
    }

    saveToCache('my-products', myProducts);

    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['all-products'] });

    console.log(`Sync complete. ${syncedIds.length} products synced, ${remainingQueue.length} remaining.`);
  }, [queryClient, isClient]);

  useEffect(() => {
    if (!isClient) return;

    const handleOnline = () => {
      syncOfflineQueue();
    };

    window.addEventListener('online', handleOnline);

    if (navigator.onLine) {
      syncOfflineQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncOfflineQueue, isClient]);

  return { syncOfflineQueue };
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { syncOfflineQueue } = useSyncOfflineProducts();
  const isClient = typeof window !== 'undefined';

  return useMutation({
    mutationFn: async (productData: any) => {
      const isOnline = isClient ? navigator.onLine : true;
      
      if (!isOnline) {
        const offlineQueue = getFromCache<OfflineQueueItem[]>('offline-queue-products') || [];
        const queueItem: OfflineQueueItem = {
          id: `temp-${Date.now()}`,
          data: productData,
          action: 'create',
          timestamp: Date.now(),
        };

        offlineQueue.push(queueItem);
        saveToCache('offline-queue-products', offlineQueue);

        const myProducts = getFromCache<ProductsResponse>('my-products') || { data: [] };
        myProducts.data.unshift({
          ...productData,
          id: queueItem.id,
          _pending: true,
        });
        saveToCache('my-products', myProducts);
        saveToCache('all-products', myProducts);

        return { data: { ...productData, id: queueItem.id }, _pending: true };
      }

      const response = await axios.post('/api/products', productData);

      const myProducts = getFromCache<ProductsResponse>('my-products') || { data: [] };
      myProducts.data.unshift(response.data.data);
      saveToCache('my-products', myProducts);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['all-products'] });
      
      if (isClient && navigator.onLine) {
        syncOfflineQueue();
      }
    },
    retry: false,
  });
};

export const useAllProductsByUser = () => {
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const cacheKey = 'my-products';
      const cached = getFromCache<ProductsResponse>(cacheKey);
      
      if (!isOnline) {
        console.log('Using cached user products (offline)');
        return cached || { data: [] };
      }

      try {
        const response = await getAllProductsByUser();
        saveToCache(cacheKey, response);
  
        return response;
      } catch (error) {
        if (cached) {
          return cached;
        }
        throw error;
      }
    },
    retry: isOnline ? 1 : false,
    refetchOnWindowFocus: isOnline,
  });
};

export const useAllProducts = () => {
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const cacheKey = 'all-products';
      const cached = getFromCache<ProductsResponse>(cacheKey);
      
      if (!isOnline) {
        console.log('Using cached products (offline mode)');
        return cached || { data: [] };
      }

      try {
        const products = await getAllProducts();
        
        saveToCache(cacheKey, products);
        
        return products;
      } catch (error) {
        if (cached) {
          console.log('Using cached products due to network error');
          return cached;
        }
        throw error;
      }
    },
    retry: (failureCount) => {
      if (isClient && !navigator.onLine) return false;
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, 
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: isOnline,
  });
};
