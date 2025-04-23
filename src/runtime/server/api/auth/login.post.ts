// src/runtime/server/api/auth/login.post.ts
import { defineEventHandler, readBody, H3Error, setCookie } from 'h3';
import { $fetch } from 'ofetch'; // ofetch 是 $fetch 的底層庫
import { useRuntimeConfig } from '#imports'; // Nuxt 自動注入

export default defineEventHandler(async (event) => {
    console.log("login post")
  const config = useRuntimeConfig(event).myAuth; // 獲取伺服器端配置
  const body = await readBody(event); // 讀取請求 body (username, password)

  if (!config.apiBaseUrl) {
     throw createError({ statusCode: 500, statusMessage: 'Auth API base URL not configured'});
  }

  try {
    // 呼叫實際的後端登入 API
    const loginResponse = await $fetch<{ token: string; user: any }>( // 假設後端回應包含 token 和 user
      `${config.apiBaseUrl}${useRuntimeConfig(event).public.myAuth.loginEndpoint}`, // 使用 public 的 endpoint 路徑
      {
        method: 'POST',
        body: body, // 將收到的 body 傳遞給後端
        headers: {
          'Accept': 'application/json',
          // 可能需要的其他 headers
        },
      }
    );

    // 檢查後端回應是否成功且包含 token
    if (!loginResponse || !loginResponse.token) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid credentials or missing token' });
    }

    // 設定 HttpOnly Cookie
    setCookie(event, config.cookieName!, loginResponse.token, {
      ...config.cookieOptions, // 使用配置中的 cookie 選項
      httpOnly: true, // 強制為 HttpOnly
    });

    // 返回使用者資訊給客戶端 composable
    return {
      user: loginResponse.user,
    };

  } catch (error: any) {
    console.error('Login API error:', error);
    // 返回後端錯誤或通用錯誤
    throw createError({
        statusCode: error.response?.status || 500,
        statusMessage: error.response?._data?.message || 'Login failed',
        data: error.response?._data // 傳遞額外錯誤資訊 (如果有的話)
    });
  }
});