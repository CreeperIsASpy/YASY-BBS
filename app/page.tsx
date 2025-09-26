// src/app/page.tsx

// 注意这里的 import 语句，我们使用新的 @supabase/ssr 包来确保兼容性
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

// 我们不再需要 force-dynamic，因为 Next.js 会自动检测动态函数的使用
// export const dynamic = 'force-dynamic';

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
    // === 这是修正的部分 START ===
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
    // === 这是修正的部分 END ===

    const { data: threads, error } = await supabase.rpc('get_top_5_liked_threads');

    // 这行日志会打印在运行 `npm run dev` 的那个命令行窗口里
    // console.log('Fetched threads:', threads);
    // console.log('Fetch error:', error);

    if (error) {
        console.error('Error fetching top threads:', error);
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
        </main>
    );
}