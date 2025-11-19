'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { CreateTodoRequest } from '@/lib/types';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'moderate', 'extreme']),
  todo_date: z.string().min(1, 'Date is required'),
});

type TodoFormData = z.infer<typeof todoSchema>;

interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTodoRequest) => Promise<void>;
  isLoading?: boolean;
}

export function CreateTodoModal({ isOpen, onClose, onSubmit, isLoading = false }: CreateTodoModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      priority: 'moderate',
      todo_date: new Date().toISOString().split('T')[0],
    },
  });

  const handleFormSubmit = async (data: TodoFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Todo</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter todo title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter todo description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="extreme">Extreme</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="todo_date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              {...register('todo_date')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.todo_date && (
              <p className="mt-1 text-sm text-red-600">{errors.todo_date.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Creating...
                </>
              ) : (
                'Create Todo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}