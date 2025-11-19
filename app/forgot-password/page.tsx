'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            console.log('Forgot password request:', data);
            
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setIsSubmitted(true);
            toast.success('Reset link sent to your email!');
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-50 to-indigo-100 items-center justify-center p-12">
                <div className="max-w-lg w-full">
                    <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
                        <Image
                            src="/images/Computer login-pana.svg"
                            alt="Forgot password illustration"
                            width={400}
                            height={400}
                            className="w-full h-auto object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full space-y-6">
                    {!isSubmitted ? (
                        <>
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Forgot your password?
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    Enter your email address and we&apos;ll send you a reset link
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>

                                {/* Back to Login */}
                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="text-gray-600 hover:text-gray-800 text-sm"
                                    >
                                        ← Back to Login
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Check your email
                            </h1>
                            <p className="text-gray-600 text-sm mb-6">
                                We&apos;ve sent a password reset link to<br />
                                <span className="font-medium">{getValues('email')}</span>
                            </p>
                            <Link
                                href="/login"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}