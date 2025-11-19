'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { apiService } from '@/lib/api-service';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      
      await apiService.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      });

      toast.success('Password updated successfully!');
      reset();
      
      // Optionally redirect to profile or dashboard
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
      
    } catch (error: unknown) {
      console.error('Password change error:', error);
      
      const axiosError = error as { response?: { data?: { old_password?: string; new_password?: string } } };
      
      if (axiosError.response?.data?.old_password) {
        toast.error('Current password is incorrect');
      } else if (axiosError.response?.data?.new_password) {
        toast.error('New password does not meet requirements');
      } else {
        toast.error('Failed to update password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Change Password</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  {...register('old_password')}
                  type={showOldPassword ? 'text' : 'password'}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.old_password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.old_password && (
                <p className="mt-1 text-sm text-red-600">{errors.old_password.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register('new_password')}
                  type={showNewPassword ? 'text' : 'password'}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.new_password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...register('confirm_password')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Security Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Password Security Tips:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use at least 8 characters</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Add numbers and special characters</li>
              <li>• Avoid using personal information</li>
              <li>• Don&apos;t reuse passwords from other accounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}