// src/app/post/[id]/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PostInteractions from '@/components/PostInteractions'; // 引入我们刚创建的组件

export const dynamic = 'force-dynamic';

type PostPageProps = {
    params: {
        id: string;
    };
};

export default async function PostPage({ params }: PostPageProps) {
    const supabase = createServerComponentClient({ cookies });
    const postId = params.id;

    const { data: { session } } = await supabase.auth.getSession();

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
        .select('id, created_at, content')
        .eq('thread_id', postId)
        .order('created_at', { ascending: true });
    const comments = commentsData || [];

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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {thread.content}
                </ReactMarkdown>
            </article>

            {/* 将所有交互逻辑和数据都交给客户端组件处理 */}
            <PostInteractions
                threadId={thread.id}
                initialComments={comments}
                initialLikeCount={likeCount || 0}
                userHasLiked={userHasLiked}
                user={session?.user || null}
            />
        </div>
    );
}