// import { ModuleData, updateModules } from "@/services/modules";
// import showToast from "@/utils/showToast";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// export const useUpdateModules = () => {
//     const queryClient = useQueryClient();
    
//     const { mutate, isPending } = useMutation({
//       mutationFn: ({ id, ids, data }: { id: string; ids: string; data: ModuleData }) => 
//         updateModules(id, ids, data),
//       onSuccess: (response, variables) => {
//         showToast(response.message || "Module updated successfully", "success");
        
//         queryClient.invalidateQueries({ 
//           queryKey: ["course-module", variables.id, variables.ids] 
//         });
        
//         queryClient.invalidateQueries({ 
//           queryKey: ["course", variables.id] 
//         });
        
//         queryClient.invalidateQueries({ 
//           queryKey: ["course-progress", variables.id] 
//         });
//       },
//       onError: (err: unknown) => {
//         const error = err as Error;
//         const errorMessage = error.message || "An error occurred while updating the module";
//         showToast(errorMessage, "error");
//       }
//     });
  
//     return { mutate, isPending };
// };

import { ModuleData, updateModules } from "@/services/modules";
import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getFromCache, saveToCache, removeFromCache } from "@/utils/db";

interface PendingUpdate {
  id: string;
  ids: string;
  data: ModuleData;
  timestamp: number;
}

const PENDING_UPDATES_KEY = "pending_module_updates";

export const useUpdateModules = () => {
  const queryClient = useQueryClient();
  const syncInProgressRef = useRef(false);

  // Get pending updates from cache
  const getPendingUpdates = (): PendingUpdate[] => {
    return getFromCache<PendingUpdate[]>(PENDING_UPDATES_KEY) || [];
  };

  // Save pending update to cache
  const savePendingUpdate = (update: PendingUpdate) => {
    try {
      const pending = getPendingUpdates();
      const existingIndex = pending.findIndex(
        (p) => p.id === update.id && p.ids === update.ids
      );

      if (existingIndex >= 0) {
        pending[existingIndex] = update;
      } else {
        pending.push(update);
      }

      saveToCache(PENDING_UPDATES_KEY, pending);
    } catch (error) {
      console.error("Failed to save pending update:", error);
    }
  };

  // Remove pending update after successful sync
  const removePendingUpdate = (id: string, ids: string) => {
    try {
      const pending = getPendingUpdates();
      const filtered = pending.filter((p) => !(p.id === id && p.ids === ids));
      
      if (filtered.length === 0) {
        removeFromCache(PENDING_UPDATES_KEY);
      } else {
        saveToCache(PENDING_UPDATES_KEY, filtered);
      }
    } catch (error) {
      console.error("Failed to remove pending update:", error);
    }
  };

  // Sync pending updates when back online
  const syncPendingUpdates = async () => {
    if (syncInProgressRef.current) return;

    const pending = getPendingUpdates();
    if (pending.length === 0) return;

    syncInProgressRef.current = true;

    try {
      for (const update of pending) {
        try {
          const response = await updateModules(update.id, update.ids, update.data);

          showToast(
            response.message || "Module updated and synced successfully",
            "success"
          );

          // Remove from pending after successful sync
          removePendingUpdate(update.id, update.ids);

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["course-module", update.id, update.ids],
          });
          queryClient.invalidateQueries({
            queryKey: ["course", update.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["course-progress", update.id],
          });
        } catch (error) {
          console.error("Failed to sync update:", error);
          // Keep in pending queue to retry later
        }
      }
    } finally {
      syncInProgressRef.current = false;
    }
  };

  // Listen for online event
  useEffect(() => {
    const handleOnline = () => {
      console.log("[useUpdateModules] Back online! Syncing pending updates...");
      syncPendingUpdates();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, ids, data }: { id: string; ids: string; data: ModuleData }) => {
      const isOnline = navigator.onLine;

      if (!isOnline) {
        // Offline - save to pending and update cache optimistically
        const pendingUpdate: PendingUpdate = {
          id,
          ids,
          data,
          timestamp: Date.now(),
        };

        savePendingUpdate(pendingUpdate);

        // Optimistically update the course-module cache
        queryClient.setQueryData(
          ["course-module", id, ids],
          (oldData: any) => ({
            ...oldData,
            data: {
              ...oldData?.data,
              ...data,
            },
          })
        );

        // Optimistically update the course cache
        queryClient.setQueryData(["course", id], (oldData: any) => ({
          ...oldData,
          data: {
            ...oldData?.data,
            modules: oldData?.data?.modules?.map((m: any) =>
              m.id === ids ? { ...m, ...data } : m
            ),
          },
        }));

        console.log("[useUpdateModules] Saved offline update:", { id, ids, data });

        return Promise.resolve({
          status: "success",
          message: "Changes saved offline. Will sync when online.",
        });
      }

      // Online - make the actual API call
      console.log("[useUpdateModules] Making API call for update:", { id, ids, data });
      return updateModules(id, ids, data);
    },

    onSuccess: (response, variables) => {
      showToast(response.message || "Module updated successfully", "success");
      
      queryClient.invalidateQueries({
        queryKey: ["course-module", variables.id, variables.ids],
      });
      queryClient.invalidateQueries({
        queryKey: ["course", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["course-progress", variables.id],
      });

      if (navigator.onLine) {
        removePendingUpdate(variables.id, variables.ids);
      }
    },

    onError: (err: unknown) => {
      const error = err as Error;
      const errorMessage =
        error.message || "An error occurred while updating the module";
      showToast(errorMessage, "error");
    },
  });

  return { mutate, isPending };
};


