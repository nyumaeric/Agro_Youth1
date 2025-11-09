"use client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllUser } from "@/hooks/users/useGetUsers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import showToast from "@/utils/showToast";

interface User {
  id: string;
  fullName: string;
  phoneNumber?: string;
  role: string | null;
  roleName?: string | null;
  userType: string;
  isAnonymous: boolean;
  anonymousName: string | null;
  createdAt?: string;
  created?: string;
}

interface UpdateUserPayload {
  userId: string;
  roleId?: string;
  userType?: string;
}

type UpdateType = 'role' | 'userType';

interface UpdatingState {
  [userId: string]: {
    role?: boolean;
    userType?: boolean;
  };
}

const TableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-left"><Skeleton width={80} /></th>
            <th className="px-4 py-3 text-left"><Skeleton width={100} /></th>
            <th className="px-4 py-3 text-left"><Skeleton width={100} /></th>
            <th className="px-4 py-3 text-left"><Skeleton width={80} /></th>
            <th className="px-4 py-3 text-left"><Skeleton width={80} /></th>
            <th className="px-4 py-3 text-left"><Skeleton width={100} /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(6)].map((_, i) => (
            <tr key={i} className="border-b border-slate-200">
              <td className="px-4 py-3"><Skeleton width={150} /></td>
              <td className="px-4 py-3"><Skeleton width={100} /></td>
              <td className="px-4 py-3"><Skeleton width={120} /></td>
              <td className="px-4 py-3"><Skeleton width={80} /></td>
              <td className="px-4 py-3"><Skeleton width={80} /></td>
              <td className="px-4 py-3"><Skeleton width={90} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function UserList() {
  const { data, isLoading, isError, error } = useAllUser();
  const queryClient = useQueryClient();
  const [updatingState, setUpdatingState] = useState<UpdatingState>({});

  const updateUserMutation = useMutation({
    mutationFn: async (payload: UpdateUserPayload & { updateType: UpdateType }) => {
      const { updateType, ...apiPayload } = payload;
      const response = await axios.put("/api/users", apiPayload);
      return { ...response.data, updateType };
    },
    onMutate: async (variables) => {
      const { userId, updateType } = variables;
      
      setUpdatingState((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [updateType]: true,
        },
      }));
      
      await queryClient.cancelQueries({ queryKey: ["users"] });
      
      const previousUsers = queryClient.getQueryData(["users"]);
      
      queryClient.setQueryData(["users"], (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map((user: User) =>
            user.id === variables.userId
              ? {
                  ...user,
                  ...(variables.roleId && { role: variables.roleId }),
                  ...(variables.userType && { userType: variables.userType }),
                }
              : user
          ),
        };
      });
      
      return { previousUsers, updateType };
    },
    onError: (error, variables, context) => {
      const { userId, updateType } = variables;
      
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }
      
      const errorMessage =
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to update user"
          : "An unexpected error occurred";
      
      showToast(errorMessage, "error");
      
      setUpdatingState((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [updateType]: false,
        },
      }));
    },
    onSuccess: (data, variables) => {
      const { userId, updateType } = variables;
      
      queryClient.setQueryData(["users"], (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map((user: User) =>
            user.id === userId
              ? {
                  ...user,
                  ...data.data,
                  roleName: data.data.roleName || user.roleName,
                }
              : user
          ),
        };
      });
      
      showToast(data.message || "User updated successfully", "success");
      
      setUpdatingState((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [updateType]: false,
        },
      }));
    },
  });

  const handleRoleChange = (userId: string, roleId: string) => {
    updateUserMutation.mutate({ userId, roleId, updateType: 'role' });
  };

  const handleUserTypeChange = (userId: string, userType: string) => {
    updateUserMutation.mutate({ userId, userType, updateType: 'userType' });
  };

  if (isLoading) {
    return (
      <div className="w-full pt-6 pr-40">
        <div className="mb-6">
          <Skeleton width={200} height={32} className="mb-2" />
          <Skeleton width={300} height={16} />
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
          <p className="text-slate-700 font-medium">Failed to load users</p>
          <p className="text-slate-500 text-sm mt-1">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  const users: User[] = data?.data || [];

  return (
    <div className="w-full pt-6 px-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-600 mt-1">
          Total: {users.length} {users.length === 1 ? "user" : "users"}
        </p>
      </div>

      {users.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-600">No users found</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    User Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isUpdatingRole = updatingState[user.id]?.role || false;
                  const isUpdatingUserType = updatingState[user.id]?.userType || false;
                  
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {user.isAnonymous && user.anonymousName
                          ? user.anonymousName
                          : user.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {user.phoneNumber || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {user.role ? (
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              handleRoleChange(user.id, value)
                            }
                            disabled={isUpdatingRole}
                          >
                            <SelectTrigger className="w-[180px] border-slate-200 h-9">
                              <SelectValue>
                                {isUpdatingRole ? (
                                  <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                  </span>
                                ) : (
                                  user.roleName || "Select role"
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5d8fde84-524e-4f07-bdf5-f64ed3cb3720">
                                Admin
                              </SelectItem>
                              <SelectItem value="5d8fde84-524e-4f07-bdf5-f64ed3cb3723">
                                User
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select
                            onValueChange={(value) =>
                              handleRoleChange(user.id, value)
                            }
                            disabled={isUpdatingRole}
                          >
                            <SelectTrigger className="w-[180px] border-slate-200 h-9">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5d8fde84-524e-4f07-bdf5-f64ed3cb3720">
                                Admin
                              </SelectItem>
                              <SelectItem value="5d8fde84-524e-4f07-bdf5-f64ed3cb3723">
                                User
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={user.userType}
                          onValueChange={(value) =>
                            handleUserTypeChange(user.id, value)
                          }
                          disabled={isUpdatingUserType}
                        >
                          <SelectTrigger className="w-[140px] border-slate-200 h-9">
                            <SelectValue>
                              {isUpdatingUserType ? (
                                <span className="flex items-center gap-2">
                                  <span className="h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                  Updating...
                                </span>
                              ) : (
                                user.userType.charAt(0).toUpperCase() +
                                user.userType.slice(1)
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="investor">Investor</SelectItem>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="farmer">Farmer</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        {user.isAnonymous ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            Anonymous
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(
                          user.createdAt || user.created || ""
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}