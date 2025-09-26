// src/components/PostInteractions.tsx

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { User } from '@supabase/supabase-js';

// 定义传入这个组件的数据类型
type PostInteractionsProps = {
    threadId: number;
    initialComments: {
        id: number;
        created_at: string;
        content: string;
    }[];
    initialLikeCount: number;
    userHasLiked: boolean;
    user: User | null; // 传入当前登录的用户信息
};

export default function PostInteractions({
    threadId,
    initialComments,
    initialLikeCount,
    userHasLiked,
    user,
}: PostInteractionsProps) {
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
        const content = String(formData.get('content'));
        const formElement = event.currentTarget;

        const supabase = createClientComponentClient();

        // 插入评论
        const { data, error } = await supabase.from('comments').insert({
            content,
            thread_id: threadId,
            user_id: user.id,
        }).select().single();

        if (!error && data) {
            // 成功后，将新评论添加到现有评论列表的末尾，实现实时更新
            setComments([...comments, data]);
            // 清空输入框
            formElement.reset();
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
                            <p>{comment.content}</p>
                            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                发布于: {new Date(comment.created_at).toLocaleString()}
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
        </div>
    );
}