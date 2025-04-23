import { defineNuxtPlugin, useAuth } from '#imports';

export default defineNuxtPlugin(async (nuxtApp) => {
  // 在伺服器端，如果 cookie 存在，嘗試預先獲取使用者資訊
  // 這有助於 SSR 時就能渲染出登入狀態
  const { fetchUser, token } = useAuth();

  if (token.value) { // 檢查 cookie 是否存在
    await fetchUser(); // 嘗試獲取使用者
  }
});