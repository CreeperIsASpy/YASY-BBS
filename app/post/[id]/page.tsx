// src/app/post/[id]/page.tsx

// 在文件顶部添加 createServerActionClient 和 redirect
import { createServerActionClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PostInteractions from '@/components/PostInteractions'; // 引入我们刚创建的组件
import { Components } from 'react-markdown';

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
    const postId = parseInt(postIdTemp.id, 10); // 将字符串转换为数字

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

    // 先获取评论数据
    const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('thread_id', postId)
        .order('created_at', { ascending: true });

    console.log('commentsError:', commentsError);
    console.log('commentsData:', commentsData);

    // 如果有评论数据，获取对应的用户信息
    let comments: {
        id: number;
        created_at: string;
        content: string;
        user_id: string;
        author: { username: string };
    }[] = [];
    if (commentsData && commentsData.length > 0) {
        // 获取所有评论作者的用户信息
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', commentsData.map(c => c.user_id));

        // 将用户信息与评论数据合并
        comments = commentsData.map(comment => {
            const author = profilesData?.find(p => p.id === comment.user_id);
            return {
                id: comment.id,
                created_at: comment.created_at,
                content: comment.content,
                user_id: comment.user_id,
                author: author ? { username: author.username } : { username: '匿名用户' }
            };
        });
    }

    console.log('处理后的评论数据:', comments);
    
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
    // 定义代码块组件的 props 类型
    type CodeBlockProps = {
        node?: any;
        inline?: boolean;
        className?: string;
        children?: React.ReactNode;
    } & React.HTMLAttributes<HTMLElement>;
    

    // --- 页面渲染区 (只负责展示) ---
    

    return (
        <div className="container mx-auto p-4">
            {/* 帖子正文 (Markdown) */}
            <article className="prose lg:prose-xl dark:prose-invert max-w-none">
                <h1>{thread.title}</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    由 {authorName} 发布于 {new Date(thread.created_at).toLocaleString()} 
                </div>
                

                // 在 ReactMarkdown 组件中
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code: ({ inline, className, children, ...props }: CodeBlockProps) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                                <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            ) : (
                                <code className="bg-gray-200 dark:bg-gray-700 rounded px-1" {...props}>
                                    {children}
                                </code>
                            );
                        },
                        // 引用
                        blockquote: ({node, children}) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic">
                                {children}
                            </blockquote>
                        ),
                        // 图片
                        img: ({node, ...props}) => (
                            <img className="max-w-full h-auto rounded-lg shadow-lg" {...props} />
                        ),
                        // 表格
                        table: ({children}) => (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    {children}
                                </table>
                            </div>
                        ),
                    }}
                >
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
                thread={thread}
                deletePost={deletePost}
            />
        </div>
    );
}

