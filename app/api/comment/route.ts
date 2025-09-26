// src/app/api/comment/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const formData = await request.formData();
    const content = String(formData.get('content'));
    const thread_id = String(formData.get('thread_id'));

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { error } = await supabase.from('comments').insert({
        content,
        thread_id,
        user_id: session.user.id,
    });

    if (error) {
        console.error('Error inserting comment:', error);
        return NextResponse.redirect(new URL(`/post/${thread_id}?error=评论失败`, request.url), { status: 302 });
    }

    // 评论成功后，重定向回帖子页面
    return NextResponse.redirect(new URL(`/post/${thread_id}`, request.url), {
        status: 302,
    });
}