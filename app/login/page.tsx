'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (!error) {
            router.push('/dashboard'); // 登录成功后跳转到仪表盘
            router.refresh();
        } else {
            alert('登录失败: ' + error.message);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-sm">
            <h1 className="text-2xl font-bold mb-4">登录</h1>
            <form onSubmit={handleSignIn}>
                <input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                    登录
                </button>
            </form>
        </div>
    );
}