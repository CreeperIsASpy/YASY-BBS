// src/app/post/[id]/page.tsx

// 在文件顶部添加 createServerActionClient 和 redirect
import { createServerActionClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PostInteractions from '@/components/PostInteractions'; // 引入我们刚创建的组件

export const dynamic = 'force-dynamic';

type PostPageProps = {
    params: {
        id: string;
    };
};

// 添加删除帖子的 server action
async function deletePost(formData: FormData) {
    'use server';
    const postId = formData.get('postId');
    
    const cookieStore = cookies();
    const supabase = createServerActionClient({ 
        cookies: () => Promise.resolve(cookieStore)
    });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return redirect('/login');
    }

    // 验证用户是否是帖子作者
    const { data: thread } = await supabase
        .from('threads')
        .select('user_id')
        .eq('id', postId)
        .single();

    if (!thread || thread.user_id !== session.user.id) {
        throw new Error('没有权限删除此帖子');
    }

    // 删除帖子
    const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', postId);

    if (error) {
        throw new Error('删除帖子失败：' + error.message);
    }

    // 删除成功后重定向到首页
    redirect('/');
}

export default async function PostPage({ params }: PostPageProps) {
    
    const postIdTemp = await Promise.resolve(params)
    const postId = postIdTemp.id;

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
        cookies: () => Promise.resolve(cookieStore)
    });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // --- 数据获取区 (只负责拿数据) ---

    const { data: thread } = await supabase
        .from('threads')
        .select('*')
        .eq('id', postId)
        .single();

    if (!thread) {
        notFound();
    }

    const { data: commentsData } = await supabase
        .from('comments')
        .select(`id, created_at, content, user_id, author:profiles(username)`)
        .eq('thread_id', postId)
        .order('created_at', { ascending: true });
    const comments = commentsData?.map(c => ({ ...c, author: Array.isArray(c.author) ? c.author[0] : c.author })) || [];

    // 获取帖子作者信息
    const { data: authorData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', thread.user_id)
        .single();
    const authorName = authorData?.username || '匿名用户';

    const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', postId);

    let userHasLiked = false;
    if (session) {
        const { data: like } = await supabase
            .from('likes')
            .select('id')
            .eq('thread_id', postId)
            .eq('user_id', session.user.id)
            .single();
        userHasLiked = !!like;
    }

    // --- 页面渲染区 (只负责展示) ---
    

    return (
        <div className="container mx-auto p-4">
            {/* 帖子正文 (Markdown) */}
            <article className="prose lg:prose-xl max-w-none">
                <h1>{thread.title}</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    由 {authorName} 发布于 {new Date(thread.created_at).toLocaleString()} 
                </div>
            
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        a: ({ ...props }) => {
                            const href = props.href || '';
                            // 检查链接是否包含协议，如果不包含，添加 https://
                            const fullHref = href.match(/^https?:\/\//) ? href : `https://${href}`;
                            return <a {...props} href={fullHref} target="_blank" rel="noopener noreferrer" />;
                        }
                    }}
                >
                    {thread.content}
                </ReactMarkdown>
            </article>

            {/* 将所有交互逻辑和数据都交给客户端组件处理 */}
            <PostInteractions
                threadId={thread.id}
                initialComments={comments || []}
                initialLikeCount={likeCount || 0}
                userHasLiked={userHasLiked}
                user={session?.user || null}
                thread={thread}
                deletePost={deletePost}
            />
        </div>
    );
}

