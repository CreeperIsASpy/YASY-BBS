// src/app/api/comment/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const formData = await request.formData();
    const content = String(formData.get('content'));
    const thread_id = Number(formData.get('thread_id')); // 将字符串转换为数字

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
        cookies: () => Promise.resolve(cookieStore)
    });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 第一步：插入评论
    const { data: comment, error: insertError } = await supabase.from('comments')
        .insert({
            content,
            thread_id,
            user_id: session.user.id,
        })
        .select()
        .single();

    if (insertError) {
        console.error('Error inserting comment:', insertError);
        return NextResponse.json({ error: '评论失败' }, { status: 500 });
    }

    // 第二步：获取作者信息
    const { data: author, error: authorError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

    if (authorError) {
        console.error('Error fetching author:', authorError);
        // 即使获取作者信息失败，我们仍然返回评论数据
        return NextResponse.json({
            data: { ...comment, author: null }
        });
    }

    // 返回完整的评论数据
    return NextResponse.json({
        data: {
            ...comment,
            author: { username: author.username }
        }
    });
}