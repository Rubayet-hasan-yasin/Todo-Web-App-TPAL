'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, User, LogOut, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { LiaCalendarWeekSolid } from 'react-icons/lia';
import moment from 'moment';

interface DashboardLayoutProps {
    children: ReactNode;
    activeTab: 'todos' | 'profile';
}

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Filter className="h-6 w-6 text-gray-600" />
                        </button>

                        <Image
                            src={'/images/logo.png'}
                            width={200}
                            height={200}
                            alt='dreamy logo'
                            className='h-7 w-full'
                        />
                    </div>
                    {/* <h1 className="text-lg font-bold text-gray-900">{title}</h1> */}
                </div>
            </div>

            {/* Main Layout Container */}
            <div className="flex min-h-screen pt-16 lg:pt-0">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-blue-900 text-white flex flex-col
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-300 ease-in-out
        `}>
                    {/* Mobile Close Button */}
                    <div className="lg:hidden flex justify-end p-4 border-b border-blue-800">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            <Filter className="h-6 w-6 text-white transform rotate-45" />
                        </button>
                    </div>

                    {/* User Profile Section */}
                    <div className="p-6 text-center border-b border-blue-800">
                        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 bg-blue-800">
                            {user?.profile_image ? (
                                <Image
                                    src={user.profile_image}
                                    alt="Profile"
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="h-10 w-10 text-blue-300" />
                                </div>
                            )}
                        </div>
                        <h3 className="text-lg font-medium">{user?.first_name || 'User'}</h3>
                        <p className="text-blue-200 text-sm">{user?.email}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-6">
                        <div className="space-y-2">
                            <Link
                                href="/dashboard"
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'todos'
                                        ? 'bg-blue-800'
                                        : 'hover:bg-blue-800'
                                    }`}
                            >
                                <CheckSquare className="h-5 w-5" />
                                <span>Todos</span>
                            </Link>
                            <Link
                                href="/profile"
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile'
                                        ? 'bg-blue-800'
                                        : 'hover:bg-blue-800'
                                    }`}
                            >
                                <User className="h-5 w-5" />
                                <span>Account Information</span>
                            </Link>
                        </div>
                    </nav>

                    {/* Logout */}
                    <div className="p-6 border-t border-blue-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors w-full text-left"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-0 lg:min-h-screen">
                    {/* Desktop Header */}
                    <header className="hidden lg:block bg-white border-b border-gray-200 px-6 lg:px-8 py-4 lg:py-6 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Image
                                    src={'/images/logo.png'}
                                    width={200}
                                    height={200}
                                    alt='dreamy logo'
                                    className='h-7 w-full'
                                />
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <IoIosNotificationsOutline className='size-8 bg-blue-500 text-white p-1 rounded-lg'/>
                                <LiaCalendarWeekSolid className='size-8 bg-blue-500 text-white p-1 rounded-lg'/>
                                <span>{moment().format('dddd')}</span>
                                <span>{moment().format('MM/DD/YYYY')}</span>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 bg-[#EEF7FF] overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}