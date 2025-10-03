// src/app/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type TopThread = {
    id: number;
    created_at: string;
    title: string;
    content: string;
    like_count: number;
};

function createPreview(markdown: string, length: number = 50) {
    const plainText = markdown.replace(/!\[.*\]\(.*\)|[#*`[\]()]/g, '');
    if (plainText.length <= length) {
        return plainText;
    }
    return plainText.substring(0, length) + '...';
}

export default async function Home() {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
        cookies: () => Promise.resolve(cookieStore),
    });

    const { data: threads, error } = await supabase.rpc('get_top_5_liked_threads');

    if (error) {
        console.error('Error fetching top threads from server:', error);
    }

    const topThreads = threads as TopThread[] || [];

    return (
        <main className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">热门帖子</h1>
            <div className="space-y-4">
                {topThreads.length > 0 ? (
                    topThreads.map((thread) => (
                        <Link
                            href={`/post/${thread.id}`}
                            key={thread.id}
                            className="block p-4 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{thread.title}</h2>
                                <span className="font-bold text-lg">👍 {thread.like_count}</span>
                            </div>
                            <p className="text-gray-700 mt-2 dark:text-gray-300">
                                {createPreview(thread.content)}
                            </p>
                        </Link>
                    ))
                ) : (
                    <p>当前没有热门帖子。</p>
                )}
            </div>
            {/* 在热门帖子列表下方添加 */}
            <div className="mt-8 text-center">
                <Link
                    href="/posts"
                    className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <span>查看全部帖子</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </main>
    );
}