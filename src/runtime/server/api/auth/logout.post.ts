// src/runtime/server/api/auth/logout.post.ts
import { defineEventHandler, deleteCookie } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event).myAuth;

  // 刪除 HttpOnly Cookie
  deleteCookie(event, config.cookieName!, {
    ...config.cookieOptions, // 需要提供 path, domain 等選項才能正確刪除
    httpOnly: true, // 確保指定 httpOnly
    maxAge: -1, // 告訴瀏覽器立即刪除
  });

  return { success: true }; // 或返回空物件 {}
});