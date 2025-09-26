// supabase/functions/sign-up-with-validation/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    // 处理浏览器的 CORS 预检请求
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, password, username } = await req.json();

        // 创建一个特殊的 Supabase 客户端，它拥有管理员权限
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. 验证用户名是否在允许的列表中
        const { data: allowedUser, error: checkError } = await supabaseAdmin
            .from('allowed_usernames')
            .select('username')
            .eq('username', username)
            .single();

        if (checkError || !allowedUser) {
            return new Response(
                JSON.stringify({ error: '此用户名不允许注册' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        // 2. 如果验证通过，则创建用户
        const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // 自动确认邮箱，简化流程
        });

        if (signUpError) {
            throw signUpError;
        }

        return new Response(
            JSON.stringify({ user }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
