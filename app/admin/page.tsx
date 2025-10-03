import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DeleteButton } from './DeleteButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
        cookies: () => Promise.resolve(cookieStore)
    });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // 检查用户是否是管理员
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

    if (!profile?.is_admin) {
        redirect('/');
    }

    // 获取所有帖子
    const { data: threads } = await supabase
        .from('threads')
        .select(`
            id,
            title,
            content,
            created_at,
            user_id,
            comments(count)
        `)
        .order('created_at', { ascending: false });

    // 如果有帖子数据，获取作者信息
    let threadsWithAuthors: Array<{
        id: number;
        title: string;
        content: string;
        created_at: string;
        user_id: string;
        comments?: { count: number }[];
        author: string;
    }> = [];

    if (threads && threads.length > 0) {
        // 获取所有作者的用户信息
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', threads.map(t => t.user_id));

        // 将作者信息与帖子数据合并
        threadsWithAuthors = threads.map(thread => ({
            ...thread,
            author: profiles?.find(p => p.id === thread.user_id)?.username || '匿名用户'
        }));
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">管理员控制台</h1>
            
            <div className="space-y-4">
                {threadsWithAuthors.map((thread) => (
                    <div key={thread.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">{thread.title}</h2>
                                <div className="text-sm text-gray-600">
                                    <span>作者: {thread.author}</span>
                                    <span className="mx-2">•</span>
                                    <span>评论: {thread.comments?.[0]?.count || 0}</span>
                                    <span className="mx-2">•</span>
                                    <span>{new Date(thread.created_at).toLocaleString()}</span>
                                </div>
                                <div className="mt-2 text-gray-700 whitespace-pre-wrap line-clamp-3">
                                    {thread.content}
                                </div>
                            </div>
                            <DeleteButton threadId={thread.id} />
                        </div>
                    </div>
                ))}

                {(!threads || threads.length === 0) && (
                    <div className="text-center py-8 text-gray-600">
                        暂无帖子
                    </div>
                )}
            </div>
        </div>
    );
}