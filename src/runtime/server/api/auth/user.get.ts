// src/runtime/server/api/auth/user.get.ts
import { defineEventHandler, parseCookies, H3Error } from 'h3';
import { $fetch } from 'ofetch';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event).myAuth;
  const cookies = parseCookies(event);
  const token = cookies[config.cookieName!];

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated: No token found' });
  }

  if (!config.apiBaseUrl) {
     throw createError({ statusCode: 500, statusMessage: 'Auth API base URL not configured'});
  }

  try {
    // 呼叫實際的後端 API 來驗證 token 並獲取使用者資訊
    const userResponse = await $fetch<any>( // 假設後端回應包含 user 物件
      `${config.apiBaseUrl}${useRuntimeConfig(event).public.myAuth.userEndpoint}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`, // 將 token 放在 Header 中
        },
      }
    );

    if (!userResponse) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid token or user not found'});
    }

    // 返回使用者資訊
    return {
      user: userResponse,
    };

  } catch (error: any) {
    console.error('Fetch user API error:', error);
     // 如果是因為 token 無效 (例如後端回傳 401)，則返回 401
    if (error.response?.status === 401) {
         // 可以選擇在這裡清除無效的 cookie
         deleteCookie(event, config.cookieName!, { ...config.cookieOptions, httpOnly: true, maxAge: -1 });
         throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
    }
    // 其他錯誤
    throw createError({
        statusCode: error.response?.status || 500,
        statusMessage: error.response?._data?.message || 'Failed to fetch user',
        data: error.response?._data
    });
  }
});