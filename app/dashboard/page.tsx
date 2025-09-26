// src/app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">仪表盘</h1>
            <p className="mt-4">欢迎回来, {session.user.email}!</p>
            <p>这是你的个人页面，你可以在这里管理你的帖子等。</p>

            {/* 登出按钮 */}
            <form action="/auth/sign-out" method="post">
                <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" type="submit">
                    登出
                </button>
            </form>
        </div>
    );
}