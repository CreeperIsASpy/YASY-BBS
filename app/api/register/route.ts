// src/app/api/register/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
        cookies: () => Promise.resolve(cookieStore)
    });
    
    // 1. 验证用户名是否在允许列表中
    const { data: allowedUser, error: checkError } = await supabase
      .from('allowed_usernames')
      .select('username')
      .eq('username', username)
      .single();
    
    if (checkError || !allowedUser) {
      return NextResponse.json(
        { error: '此用户名不允许注册' },
        { status: 400 }
      );
    }
    
    // 2. 创建用户
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    });
    
    if (signUpError) {
      throw signUpError;
    }
    
    // 3. 创建用户资料
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username,
      });

      if (profileError) {
        // 如果创建资料失败，删除刚创建的用户
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('创建用户资料失败：' + profileError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '注册失败';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}