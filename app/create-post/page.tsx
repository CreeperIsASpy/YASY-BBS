// src/app/create-post/page.tsx

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// --- 这是 Server Action 函数 ---
// 它会在服务器上运行，处理我们的表单提交
async function createPost(formData: FormData) {
    'use server'; // 声明这是一个 Server Action

    const title = String(formData.get('title'));
    const content = String(formData.get('content'));

    const supabase = createServerActionClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return redirect('/login');
    }

    // 将新帖子插入数据库，并立即取回它的 id
    const { data: newPost, error } = await supabase
        .from('threads')
        .insert({
            title,
            content,
            user_id: session.user.id,
        })
        .select('id')
        .single();

    if (error) {
        // 简单处理错误，你可以在这里做得更复杂
        console.error('Error creating post:', error);
        return redirect('/create-post?error=无法创建帖子');
    }

    // 如果成功，重定向到新帖子的详情页
    redirect(`/post/${newPost.id}`);
}
// --- Server Action 函数结束 ---


// --- 这是页面组件 ---
export default function CreatePostPage() {
    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">发布一个新帖子</h1>

            {/* 表单的 action 直接绑定我们上面定义的 Server Action 函数 */}
            <form action={createPost}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-lg font-medium mb-2">
                        标题
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        className="w-full p-2 border rounded-md text-black"
                        placeholder="给你的帖子起个名字"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="content" className="block text-lg font-medium mb-2">
                        内容 (支持 Markdown)
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        required
                        rows={10}
                        className="w-full p-2 border rounded-md text-black"
                        placeholder="尽情发挥吧..."
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700"
                >
                    发布
                </button>
            </form>
        </div>
    );
}