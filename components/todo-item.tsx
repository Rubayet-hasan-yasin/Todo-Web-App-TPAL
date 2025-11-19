'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Edit, Trash2, Check, X, Calendar, Flag } from 'lucide-react';
import { Todo, UpdateTodoRequest } from '@/lib/types';

const editTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'moderate', 'extreme']),
  todo_date: z.string().min(1, 'Date is required'),
});

type EditTodoFormData = z.infer<typeof editTodoSchema>;

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, data: UpdateTodoRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleComplete: (id: number, completed: boolean) => Promise<void>;
}

export function TodoItem({ todo, onUpdate, onDelete, onToggleComplete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTodoFormData>({
    resolver: zodResolver(editTodoSchema),
    defaultValues: {
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      todo_date: todo.todo_date,
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      todo_date: todo.todo_date,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  const handleSave = async (data: EditTodoFormData) => {
    setIsLoading(true);
    try {
      await onUpdate(todo.id!, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      setIsLoading(true);
      try {
        await onDelete(todo.id!);
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      await onToggleComplete(todo.id!, !todo.is_completed);
    } catch (error) {
      console.error('Toggle complete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'extreme':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = () => {
    return <Flag className="h-4 w-4" />;
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <form onSubmit={handleSubmit(handleSave)} className="space-y-3">
          <div>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Todo title"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Todo description"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <div className="flex-1">
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
            <div className="flex-1">
              <input
                {...register('todo_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm text-green-600 hover:text-green-800 transition-colors"
              disabled={isLoading}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md ${
      todo.is_completed ? 'opacity-60' : ''
    } ${isLoading ? 'pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={handleToggleComplete}
              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                todo.is_completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-500'
              }`}
              disabled={isLoading}
            >
              {todo.is_completed && <Check className="h-3 w-3" />}
            </button>
            <h3 className={`text-lg font-medium ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {todo.title}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
              {getPriorityIcon()}
              <span className="ml-1 capitalize">{todo.priority}</span>
            </span>
          </div>
          
          <p className={`text-sm mb-2 ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-600'}`}>
            {todo.description}
          </p>
          
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(todo.todo_date), 'MMM dd, yyyy')}
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            disabled={isLoading}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}