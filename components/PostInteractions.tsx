// src/components/PostInteractions.tsx

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // 移除未使用的 useTransition
import { User } from '@supabase/supabase-js'; // 确保导入 User 类型

// 定义传入这个组件的数据类型
// 定义一条评论的数据类型
type CommentWithAuthor = {
    id: number;
    created_at: string;
    content: string;
    user_id: string;
    author: {
        username: string;
    } | null;
};

// 定义整个组件的 props 类型
// 在 PostInteractionsProps 类型定义中添加 thread 和 deletePost
type PostInteractionsProps = {
    threadId: number;
    initialComments: CommentWithAuthor[];
    initialLikeCount: number;
    userHasLiked: boolean;
    user: User | null;
    thread: {
        user_id: string;
    };
    deletePost: (formData: FormData) => Promise<void>;
};

// 添加 Session 类型定义
type Session = {
    user: {
        id: string;
    };
};

export default function PostInteractions({
    threadId,
    initialComments,
    initialLikeCount,
    userHasLiked,
    user,
    thread,
    deletePost,
}: PostInteractionsProps) {
    const supabase = createClientComponentClient();
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };
        getSession();
    }, [supabase.auth]); // 添加 supabase.auth 到依赖数组

    const router = useRouter();
    const [comments, setComments] = useState(initialComments);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [hasLiked, setHasLiked] = useState(userHasLiked);
    const [isLiking, setIsLiking] = useState(false);

    // const [isPending, startTransition] = useTransition(); 没用到

    const handleLike = async () => {
        if (!user) {
            return router.push('/login');
        }

        setIsLiking(true);
        const supabase = createClientComponentClient();

        if (hasLiked) {
            setHasLiked(false);
            setLikeCount(likeCount - 1);
            await supabase.from('likes').delete().match({ user_id: user.id, thread_id: threadId });
        } else {
            setHasLiked(true);
            setLikeCount(likeCount + 1);
            await supabase.from('likes').insert({ user_id: user.id, thread_id: threadId });
        }
        setIsLiking(false);
    };

    const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) {
            return router.push('/login');
        }
    
        const formData = new FormData(event.currentTarget);
        // 使用 content 变量或移除它
        const content = String(formData.get('content'));
        if (!content.trim()) {
            alert('评论内容不能为空');
            return;
        }
        formData.append('thread_id', String(threadId));
        const formElement = event.currentTarget;
    
        try {
            const response = await fetch('/api/comment', {
                method: 'POST',
                body: formData
            });
    
            if (!response.ok) {
                throw new Error('评论失败');
            }
    
            const { data } = await response.json();
            setComments([...comments, data]);
            formElement.reset();
        } catch (error) {
            alert('评论失败：' + error);
        }
    };

    const handleCommentDelete = async (commentId: number) => {
        if (!user) return;
        if (!confirm("确定要删除这条评论吗？")) return;
        
        const supabase = createClientComponentClient();
        const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id);
        
        if (!error) {
            setComments(comments.filter(comment => comment.id !== commentId));
        } else {
            alert("删除失败: " + error.message);
        }
    };

    return (
        <div>
            {/* 点赞按钮 */}
            <div className="mt-6">
                <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`px-6 py-2 rounded-full font-bold transition-colors ${hasLiked ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'
                        } ${isLiking ? 'opacity-50' : ''}`}
                >
                    👍 {hasLiked ? '取消点赞' : '点赞'} ({likeCount})
                </button>
            </div>

            <hr className="my-8" />

            {/* 评论区 */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">评论区</h2>

                {/* 评论列表 */}
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-gray-100 rounded-lg dark:bg-gray-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-sm">
                                        {comment.author?.username || '匿名用户'}
                                    </p>
                                    <p className="mt-1">{comment.content}</p>
                                </div>
                                {user?.id === comment.user_id && (
                                    <button
                                        onClick={() => handleCommentDelete(comment.id)}
                                        className="text-xs text-red-500 hover:underline flex-shrink-0 ml-4"
                                    >
                                        删除
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                                {new Date(comment.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))}
                    {comments.length === 0 && <p>还没有评论，快来抢沙发吧！</p>}
                </div>

                {/* 发表评论表单 */}
                {user ? (
                    <form onSubmit={handleCommentSubmit} className="mt-6">
                        <textarea
                            name="content"
                            className="w-full p-2 border rounded"
                            placeholder="写下你的评论..."
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            发表评论
                        </button>
                    </form>
                ) : (
                    <p className="mt-6 text-gray-600">
                        请先 <a href="/login" className="text-blue-500 underline">登录</a> 后再发表评论。
                    </p>
                )}
            </div>
            <div className="mt-8">
                {/* 帖子操作按钮 */}
                {session?.user.id === thread.user_id && (
                    <div className="mt-4 flex gap-4">
                        <a href={`/edit-post/${threadId}`} className="text-sm text-blue-500 hover:underline">
                            编辑帖子
                        </a>
                        <form action={deletePost}>
                            <input type="hidden" name="postId" value={threadId} />
                            <button type="submit" className="text-sm text-red-500 hover:underline">
                                删除帖子
                            </button>
                        </form>
                    </div>
                )} 
            </div>
        </div>
    );
}