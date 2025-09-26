// 首先，在文件顶部我们需要告诉Next.js这是一个客户端组件
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 使用环境变量初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 定义一下帖子的数据类型
type Thread = {
    id: number;
    created_at: string;
    title: string;
    content: string | null;
};

export default function Home() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchThreads() {
            setLoading(true);
            // 从 'threads' 表中选择所有数据，按创建时间倒序排列
            const { data, error } = await supabase
                .from('threads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching threads:', error);
            } else if (data) {
                setThreads(data);
            }
            setLoading(false);
        }

        fetchThreads();
    }, []);

    return (
        <main className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">我的 BBS 论坛</h1>

            {loading ? (
                <p>正在加载帖子...</p>
            ) : (
                <div className="space-y-4">
                    {threads.length > 0 ? (
                        threads.map((thread) => (
                            <div key={thread.id} className="p-4 border rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold">{thread.title}</h2>
                                <p className="text-gray-700 mt-2">{thread.content}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    发布于: {new Date(thread.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>还没有帖子，快去 Supabase 后台添加一些吧！</p>
                    )}
                </div>
            )}
        </main>
    );
}