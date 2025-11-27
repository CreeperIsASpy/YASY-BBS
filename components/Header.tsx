// src/components/Header.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Header() {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
        cookies: () => Promise.resolve(cookieStore)
    });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    return (
        <header className="bg-gray-800 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <Link href="/" className="flex items-center space-x-2 hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-xl font-bold">甲辰级论坛</span>
                    </Link>
                    <Link href="/posts" className="hover:text-gray-300">
                        全部帖子
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    {session ? (
                        <>
                            <Link href="/create-post" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>发新帖</span>
                            </Link>
                            <Link href="/dashboard" className="hover:text-gray-300 flex items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>仪表盘</span>
                            </Link>
                            <form action="/auth/sign-out" method="post">
                                <button type="submit" className="hover:text-gray-300 flex items-center space-x-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>登出</span>
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-gray-300">
                                登录
                            </Link>
                            <Link href="/register" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
                                注册
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}