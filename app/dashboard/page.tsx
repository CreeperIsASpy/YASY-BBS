// src/app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // 获取用户的帖子
    const { data: userThreads } = await supabase
        .from('threads')
        .select('id, title, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    // 获取用户的评论
    const { data: userComments } = await supabase
        .from('comments')
        .select('id, content, created_at, thread_id, threads(title)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    // 获取用户资料，包括用户名
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">仪表盘</h1>
            <p className="mt-4">欢迎回来, {userProfile?.username || session.user.email}!</p>
            
            {/* 用户的帖子 */}
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">我的帖子</h2>
                {userThreads && userThreads.length > 0 ? (
                    <div className="space-y-2">
                        {userThreads.map((thread) => (
                            <div key={thread.id} className="p-3 bg-gray-100 rounded-lg dark:bg-gray-800">
                                <Link href={`/post/${thread.id}`} className="text-blue-500 hover:underline">
                                    {thread.title}
                                </Link>
                                <p className="text-xs text-gray-500 mt-1">
                                    发布于: {new Date(thread.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>您还没有发布过帖子</p>
                )}
            </div>

            {/* 用户的评论 */}
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">我的评论</h2>
                {userComments && userComments.length > 0 ? (
                    <div className="space-y-2">
                        {userComments.map((comment) => (
                            <div key={comment.id} className="p-3 bg-gray-100 rounded-lg dark:bg-gray-800">
                                <p>{comment.content}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    评论于: <Link href={`/post/${comment.thread_id}`} className="text-blue-500 hover:underline">
                                        {comment.threads?.title || '帖子'}
                                    </Link> - {new Date(comment.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>您还没有发表过评论</p>
                )}
            </div>

            {/* 登出按钮 */}
            <form action="/auth/sign-out" method="post">
                <button className="mt-8 px-4 py-2 bg-red-500 text-white rounded" type="submit">
                    登出
                </button>
            </form>
        </div>
    );
}