import { useMutation, useQueryClient } from '@tanstack/react-query';
import showToast from '@/utils/showToast';
import { useState } from 'react';
import { z } from 'zod'; 
import { createComment } from '@/services/posts/comments/postComments';

interface CreatePostsCommentInterface {
    content: string;
    isAnonymous: boolean;
}

interface CommentMutationParams {
    courseId: string; 
    postId: string;   
    data: CreatePostsCommentInterface;
}

const initialData: CreatePostsCommentInterface = {
    content: "",
    isAnonymous: false
};

export const useCreateComment = (courseId: string) => {
    const [formData, setFormData] = useState<CreatePostsCommentInterface>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: ({ courseId, postId, data }: CommentMutationParams) => {
            return createComment({
                ids: postId,      // postId maps to ids in API
                id: courseId,     // courseId maps to id in API
                content: data.content,
                isAnonymous: data.isAnonymous 
            });
        },
        onSuccess: (response, variables) => {
            showToast('Comment posted successfully!', 'success');
            
            setFormData(initialData);
            setErrors({});
            
            // Invalidate all relevant queries
            queryClient.invalidateQueries({
                queryKey: ["Posts", variables.courseId]
            });
            queryClient.invalidateQueries({ 
                queryKey: ["Posts", variables.courseId, variables.postId] 
            });
            queryClient.invalidateQueries({ 
                queryKey: ['Posts'] 
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to post comment. Please try again.';
            showToast(errorMessage, 'error');
            console.error('Comment submission error:', error);
        },
    });

    const handleSubmit = async (postId: string, courseId: string) => {
        // Validate before submitting
        if (!formData.content?.trim()) {
            setErrors({ content: 'Comment content is required' });
            return;
        }

        try {
            await mutate({
                courseId,
                postId,
                data: formData
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