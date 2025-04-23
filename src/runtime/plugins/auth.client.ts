// src/runtime/plugins/auth.client.ts
import { defineNuxtPlugin, useAuth } from '#imports';

export default defineNuxtPlugin(async (nuxtApp) => {
  // 在客戶端，如果 token 存在但 user 狀態為 null (可能發生在 SSR 失敗或頁面跳轉後)
  // 再次嘗試獲取使用者資訊以同步狀態
  const { fetchUser, user, token } = useAuth();

  // 僅在 token 存在但 user 不存在時執行
  // 這避免了每次客戶端導航都重新 fetch user
  if (token.value && !user.value) {
     // console.log('Client plugin: Token exists, user missing. Fetching user...');
     await fetchUser();
  }

  // (可選) 監聽 token 變化，如果 token 變為 null (例如手動清除或過期)，則清除 user 狀態
  // watch(token, (newToken) => {
  //   if (!newToken && user.value) {
  //      console.log('Client plugin: Token removed, clearing user state.');
  //      user.value = null;
  //   }
  // });
});