import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PostsPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string };
}) {
    // 等待 searchParams
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.search || '';
    const postsPerPage = 10;

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
        cookies: () => Promise.resolve(cookieStore)
    });

    // 修改查询语句，先获取帖子数据
    let query = supabase
        .from('threads')
        .select(`
            id,
            title,
            content,
            created_at,
            user_id,
            comments(count),
            likes(count)
        `, { count: 'exact' });

    // 如果有搜索词，添加搜索条件
    if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // 获取分页数据
    const { data: threads, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * postsPerPage, page * postsPerPage - 1);

    // 如果有帖子数据，获取作者信息
    let threadsWithAuthors: {
        id: string;
        title: string;
        content: string;
        created_at: string;
        user_id: string;
        comments: { count: number }[];
        likes: { count: number }[];
        author: string;
    }[] = [];
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

    if (error) {
        console.error('Error fetching threads:', error);
    }

    const totalPages = Math.ceil((count || 0) / postsPerPage);

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-4">全部帖子</h1>
                <form className="flex gap-2">
                    <input
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="搜索帖子标题或内容..."
                        className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        搜索
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                {threadsWithAuthors.map((thread) => (
                    <div key={thread.id} className="border p-4 rounded-lg hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                        <Link href={`/post/${thread.id}`} className="block">
                            <h2 className="text-xl font-bold mb-2 hover:text-blue-500">{thread.title}</h2>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span>作者: {thread.author}</span>
                                <span className="mx-2">•</span>
                                <span>评论: {thread.comments?.[0]?.count || 0}</span>
                                <span className="mx-2">•</span>
                                <span>点赞: {thread.likes?.[0]?.count || 0}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(thread.created_at).toLocaleString()}</span>
                            </div>
                            {/* 将内容部分从 <p> 改为 <div> */}
                            <div className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-2 whitespace-pre-wrap">
                                {thread.content}
                            </div>
                        </Link>
                    </div>
                ))}

                {threadsWithAuthors.length === 0 && (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        {search ? '没有找到匹配的帖子' : '还没有任何帖子'}
                    </div>
                )}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {page > 1 && (
                        <Link
                            href={`/posts?page=${page - 1}${search ? `&search=${search}` : ''}`}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            上一页
                        </Link>
                    )}
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <Link
                            key={pageNum}
                            href={`/posts?page=${pageNum}${search ? `&search=${search}` : ''}`}
                            className={`px-4 py-2 rounded ${
                                pageNum === page
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                            }`}
                        >
                            {pageNum}
                        </Link>
                    ))}

                    {page < totalPages && (
                        <Link
                            href={`/posts?page=${page + 1}${search ? `&search=${search}` : ''}`}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            下一页
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}