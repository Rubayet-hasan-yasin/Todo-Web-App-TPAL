'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

const signupSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        try {
            
            const user = await apiService.signup({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: data.password,
            });

            
            const tokens = await apiService.login({
                email: data.email,
                password: data.password,
            });

            login(tokens, user);
            toast.success('Account created successfully!');
            router.push('/dashboard');
        } catch (error: unknown) {
            console.error('Signup error:', error);
            let message = 'Failed to create account. Please try again.';

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { detail?: string; email?: string[]; password?: string[] } } };
                message = axiosError.response?.data?.detail ||
                    axiosError.response?.data?.email?.[0] ||
                    axiosError.response?.data?.password?.[0] ||
                    message;
            }

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Illustration */}
            <div className="hidden lg:flex lg:w-5/12 bg-linear-to-br from-blue-100 to-indigo-100 items-center justify-center p-12">

                <Image
                    src="/images/Sign up-amico.svg"
                    alt="Woman holding blue box - Todo illustration"
                    width={320}
                    height={320}
                    className="w-full object-cover"
                    priority
                />
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center py-8 bg-white">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Create your account
                        </h2>
                        <p className="text-gray-600">
                            Start managing your tasks efficiently
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Name Fields Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* First Name */}
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    {...register('first_name')}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="first name"
                                />
                                {errors.first_name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.first_name.message}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    {...register('last_name')}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="last name"
                                />
                                {errors.last_name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.last_name.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                    Creating account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>

                        {/* Login Link */}
                        <div className="text-center">
                            <span className="text-gray-600">Already have an account? </span>
                            <Link
                                href="/login"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Log in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}