'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 调用我们自己创建的 Edge Function
            const { error } = await supabase.functions.invoke('sign-up-with-validation', {
                body: { email, password, username },
            });

            if (error) throw error;

            alert('注册成功！请登录。');
            router.push('/login');
        } catch (error) {
            if (error instanceof Error) {
                alert('注册失败: ' + error.message);
            } else {
                alert('发生未知错误');
            }
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-sm">
            <h1 className="text-2xl font-bold mb-4">注册</h1>
            <form onSubmit={handleSignUp}>
                <input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                />
                <input
                    type="text"
                    placeholder="你的真实姓名 (必须在允许列表内)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                />
                <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
                    注册
                </button>
            </form>
        </div>
    );
}