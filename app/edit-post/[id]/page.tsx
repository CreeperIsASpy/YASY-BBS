// src/app/edit-post/[id]/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type EditPostPageProps = {
    params: {
        id: string;
    };
};

async function updatePost(formData: FormData) {
    'use server';
    const postId = formData.get('postId');
    const title = String(formData.get('title'));
    const content = String(formData.get('content'));

    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

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
        return redirect(`/post/${postId}`);
    }

    // 更新帖子
    await supabase
        .from('threads')
        .update({ title, content })
        .eq('id', postId);

    return redirect(`/post/${postId}`);
}

export default async function EditPostPage({ params }: EditPostPageProps) {
    const supabase = createServerComponentClient({ cookies });
    const postId = params.id;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }

    // 获取帖子数据
    const { data: thread } = await supabase
        .from('threads')
        .select('*')
        .eq('id', postId)
        .single();

    if (!thread) {
        notFound();
    }

    // 验证用户是否是帖子作者
    if (thread.user_id !== session.user.id) {
        redirect(`/post/${postId}`);
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">编辑帖子</h1>

            <form action={updatePost}>
                <input type="hidden" name="postId" value={thread.id} />
                
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium mb-1">标题</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        defaultValue={thread.title}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium mb-1">内容 (支持 Markdown)</label>
                    <textarea
                        id="content"
                        name="content"
                        defaultValue={thread.content}
                        rows={10}
                        required
                        className="w-full p-2 border rounded font-mono"
                    ></textarea>
                </div>

                <div className="flex gap-4">
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                        更新帖子
                    </button>
                    <a href={`/post/${thread.id}`} className="px-4 py-2 bg-gray-500 text-white rounded inline-block">
                        取消
                    </a>
                </div>
            </form>
        </div>
    );
}