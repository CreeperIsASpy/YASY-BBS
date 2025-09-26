// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header'; // 引入我们刚创建的 Header 组件

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: '甲辰级 BBS',
    description: '由 Next.js 和 Supabase 强力驱动，黄正源同学和 Gemini 携手开发',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <body className={inter.className}>
                {/* 将 Header 组件放在这里，它将出现在每个页面的顶部 */}
                <Header />

                {/* children 就是你每个页面的具体内容 (page.tsx) */}
                <main>{children}</main>

                {/* 如果需要，你也可以在这里添加一个全局的 Footer */}
            </body>
        </html>
    );
}
