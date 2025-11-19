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
import Cookies from 'js-cookie';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
    remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const tokens = await apiService.login(data);

            if (!tokens.access) {
                toast.error('Invalid email or password.');
                return;
            }

            Cookies.set('access_token', JSON.stringify(tokens.access), {
                expires: 1 / 24,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            const user = await apiService.getProfile();


            login(tokens, user);
            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (error: unknown) {
            console.error('Login error:', error);
            const axiosError = error as { response?: { data?: { detail?: string; non_field_errors?: string[] } } };
            const message =
                axiosError.response?.data?.detail ||
                axiosError.response?.data?.non_field_errors?.[0] ||
                'Invalid email or password.';

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Illustration */}
            <div className="hidden lg:flex lg:w-5/12 bg-linear-to-br from-blue-50 to-indigo-100 items-center justify-center p-12">
                <div className="max-w-lg w-full">
                    <Image
                        src="/images/Computer login-pana.svg"
                        alt="Login illustration"
                        width={400}
                        height={400}
                        className="w-full h-auto object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Log in to your account
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Start managing your tasks efficiently
                        </p>
                    </div>

                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                autoComplete="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 text-sm"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    {...register('remember')}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                    Signing in...
                                </>
                            ) : (
                                'Log In'
                            )}
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <span className="text-gray-600 text-sm">Don&apos;t have an account? </span>
                            <Link
                                href="/signup"
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                Register now
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}