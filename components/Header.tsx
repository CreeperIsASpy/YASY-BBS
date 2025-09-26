// src/components/Header.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Header() {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    return (
        <header className="bg-gray-800 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold hover:text-gray-300">
                    甲辰级 BBS
                </Link>

                <div className="flex items-center space-x-4">
                    {session ? (
                        <>
                            {/* === 新增代码 START === */}
                            <Link href="/create-post" className="bg-green-500 px-3 py-1 rounded hover:bg-green-600">
                                发新帖
                            </Link>
                            {/* === 新增代码 END === */}
                            <span className="text-sm">欢迎, {session.user.email}</span>
                            <Link href="/dashboard" className="hover:text-gray-300">
                                仪表盘
                            </Link>
                            <form action="/auth/sign-out" method="post">
                                <button type="submit" className="hover:text-gray-300">
                                    登出
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-gray-300">
                                登录
                            </Link>
                            <Link href="/register" className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600">
                                注册
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}