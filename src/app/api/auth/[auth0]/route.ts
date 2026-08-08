// @ts-nocheck
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

const authHandler = handleAuth({
  login: handleLogin({
    authorizationParams: {
      connection: 'line'
    }
  })
});

export async function GET(req: NextRequest, ctx) {
  // ① 展開（アンラップ）するコード
  const resolvedParams = await ctx.params;
  
  console.log("【API通信テスト】 叩かれたURL:", req.url);
  console.log("【API通信テスト】 展開済みパラメータ:", resolvedParams);
  
  try {
    // ② 展開したものをAuth0に渡す
    return await authHandler(req, { params: resolvedParams });
  } catch (error) {
    console.error("【Auth0エラー発生】:", error);
    return new Response("Auth0 Error", { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx) {
  const resolvedParams = await ctx.params;
  
  try {
    return await authHandler(req, { params: resolvedParams });
  } catch (error) {
    return new Response("Auth0 Error", { status: 500 });
  }
}