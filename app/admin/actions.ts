'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function deleteThread(formData: FormData) {
    const threadId = formData.get('threadId');
    if (!threadId || typeof threadId !== 'string') {
        throw new Error('Invalid thread ID');
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
        cookies: () => Promise.resolve(cookieStore)
    });

    // 验证用户是否是管理员
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

    if (!profile?.is_admin) {
        redirect('/');
    }

    // 删除帖子
    await supabase
        .from('threads')
        .delete()
        .eq('id', parseInt(threadId, 10));

    redirect('/admin');
}