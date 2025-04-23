// src/types.ts
export interface ModuleOptions {
    /**
     * 後端 API 的基本 URL
     * @example 'http://localhost:8000/api'
     */
    apiBaseUrl: string;
  
    /**
     * 登入 API 的路徑 (相對於 apiBaseUrl)
     * @default '/auth/login'
     */
    loginEndpoint?: string;
  
    /**
     * 登出 API 的路徑 (內部使用，用於清除 cookie)
     * @default '/auth/logout'
     */
    logoutEndpoint?: string;
  
    /**
     * 獲取使用者資訊 API 的路徑 (用於在頁面刷新後驗證 token 並獲取使用者)
     * @default '/auth/user'
     */
    userEndpoint?: string;
  
    /**
     * 儲存 token 的 cookie 名稱
     * @default 'auth-token'
     */
    cookieName?: string;
  
    /**
     * useCookie 的選項
     * @see https://nuxt.com/docs/api/composables/use-cookie#options
     * @default { path: '/', maxAge: 60 * 60 * 24 * 7, httpOnly: true, sameSite: 'lax' } // 預設 7 天
     */
    cookieOptions?: CookieOptions; // 從 nuxt/app 導入 CookieOptions 或手動定義
  
    /**
     * 登出後重定向的路徑
     * @default '/'
     */
    redirectOnLogout?: string;
  }
  
  // 如果需要，可以手動定義 CookieOptions 的基本類型
  interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    domain?: string;
    path?: string;
    sameSite?: 'lax' | 'strict' | 'none';
  }