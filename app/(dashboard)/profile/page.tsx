'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/api-service';
import { UpdateProfileRequest } from '@/lib/types';

import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { FaCamera, FaUpload } from 'react-icons/fa';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  address: z.string().optional(),
  contact_number: z.string().optional(),
  birthday: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfileContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { user, updateUser } = useAuth();

  console.log(previewImage);
  

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        address: user.address || '',
        contact_number: user.contact_number || '',
        birthday: user.birthday || '',
      });
      if (user.profile_image) {
        setPreviewImage(user.profile_image);
      }
    }
  }, [user, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);

      const updateData: UpdateProfileRequest = {
        first_name: data.first_name,
        last_name: data.last_name,
        address: data.address || undefined,
        contact_number: data.contact_number || undefined,
        birthday: data.birthday || undefined,
        profile_image: selectedFile || undefined,
      };

      const updatedUser = await apiService.updateProfile(updateData);

      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:p-6 p-2" >
      <div className="">
        {/* Profile Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
              <hr className='w-32 border-blue-500 mt-1' />
            </div>
            <Link
              href="/change-password"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Change Password
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                  {previewImage ? (
                    <Image
                      src={previewImage as string}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-xl font-medium text-gray-600">
                        {user?.first_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Icon */}
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaCamera className="h-3 w-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                className="px-4 pl-2 py-2 flex items-center gap-2 text-sm font-medium text-white bg-blue-500 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                <FaUpload className="h-3 w-3 text-white" />
                Upload New Photo
              </button>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  {...register('first_name')}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder=""
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  {...register('last_name')}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder=""
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                value={user?.email || ''}
                type="email"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder=""
              />
            </div>

            {/* Address and Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  {...register('address')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  {...register('contact_number')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder=""
                />
              </div>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthday
              </label>
              <div className="relative">
                <input
                  {...register('birthday')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-4">
              <div className='w-fit mx-auto flex gap-5'>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 md:w-52 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-6 py-2 md:w-52 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}