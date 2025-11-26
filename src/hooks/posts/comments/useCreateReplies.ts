import { createCommentReplies } from "@/services/posts/comments/replyComments";
import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

interface ReplyFormData {
  commentReplies: string;
  isAnonymous: boolean;
}

const initialData: ReplyFormData = {
  commentReplies: "",
  isAnonymous: false
};

export const useCreateRepliesComment = () => {
  const [formData, setFormData] = useState<ReplyFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ 
      courseId, 
      postId, 
      commentId,
      commentReplies,
      isAnonymous 
    }: {
      courseId: string;
      postId: string;
      commentId: string;
      commentReplies: string;
      isAnonymous: boolean;
    }) => {
      return createCommentReplies({
        id: courseId,
        ids: postId,
        commentId,
        commentReplies,
        isAnonymous
      });
    },
    onSuccess: (response, variables) => {
      showToast('Reply posted successfully!', 'success');
      setFormData(initialData);
      setErrors({});
      
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['Posts']
      });
      queryClient.invalidateQueries({
        queryKey: ['Posts', variables.courseId]
      });
      queryClient.invalidateQueries({
        queryKey: ['Posts', variables.courseId, variables.postId]
      });
      queryClient.invalidateQueries({
        queryKey: ['commentReplies', variables.courseId, variables.postId, variables.commentId]
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to post reply. Please try again.';
      showToast(errorMessage, 'error');
      console.error('Reply submission error:', error);
    },
  });

  const handleSubmit = async (courseId: string, postId: string, commentId: string) => {
    if (!formData.commentReplies?.trim()) {
      setErrors({ commentReplies: 'Reply content is required' });
      return;
    }

    try {
      await mutate({
        courseId,
        postId,
        commentId,
        commentReplies: formData.commentReplies,
        isAnonymous: formData.isAnonymous
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.reduce(
          (acc: Record<string, string>, curr) => {
            if (curr.path && curr.path.length > 0 && typeof curr.path[0] === 'string') {
              acc[curr.path[0]] = curr.message;
            }
            return acc;
          },
          {} as Record<string, string>
        );
        setErrors(fieldErrors);
      }
    }
  };

  const handleInputField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { id: string; value: any } }
  ) => {
    const { id, value } = e.target;
    
    const processedValue = id === 'isAnonymous' ? Boolean(value) : value;
    
    setFormData({ ...formData, [id]: processedValue });
    
    if (errors[id]) {
      setErrors((prevErrors) => {
        const { [id]: _, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  return {
    mutate,
    formData,
    setFormData,
    isPending,
    errors,
    setErrors,
    handleSubmit,
    handleInputField
  };
};