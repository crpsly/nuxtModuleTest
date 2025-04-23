import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
  addServerHandler,
  extendViteConfig // 如果需要 build 步驟
} from '@nuxt/kit';
import { defu } from 'defu'; // 用於合併預設選項
import type { ModuleOptions } from './types';

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-auth-module', // 你的模組名稱
    configKey: 'myAuth',   // 在 nuxt.config.ts 中使用的 key
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  // 模組的預設選項
  defaults: {
    apiBaseUrl: '', // 強制使用者提供
    loginEndpoint: '/auth/login',
    logoutEndpoint: '/auth/logout',
    userEndpoint: '/auth/user',
    cookieName: 'auth-token',
    cookieOptions: { path: '/', maxAge: 60 * 60 * 24 * 7, httpOnly: true, sameSite: 'lax' },
    redirectOnLogout: '/',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // 1. 檢查必要的配置
    if (!options.apiBaseUrl) {
      console.warn('[@nuxtjs/my-auth-module] `apiBaseUrl` is required.');
      // 可以選擇拋出錯誤停止 build
      // throw new Error('[@nuxtjs/my-auth-module] `apiBaseUrl` is required.');
    }

    // 2. 將合併後的選項注入到 runtimeConfig
    // 使用 defu 合併使用者選項和預設選項
    const runtimeConfig = nuxt.options.runtimeConfig;
    runtimeConfig.public.myAuth = defu(runtimeConfig.public.myAuth, {
        // 將需要在客戶端存取的選項放在 public 下
        loginEndpoint: options.loginEndpoint,
        logoutEndpoint: options.logoutEndpoint, // 登出路徑給客戶端用來呼叫內部 API
        userEndpoint: options.userEndpoint,
        cookieName: options.cookieName, // cookie 名稱給客戶端檢查是否存在 (雖然無法讀取 HttpOnly)
        redirectOnLogout: options.redirectOnLogout,
    });
    // 將只在伺服器端使用的選項放在私有 runtimeConfig 下 (如果需要)
    // 注意：cookieOptions 包含 httpOnly，主要由伺服器路由使用
    // apiBaseUrl 也通常在伺服器端使用來呼叫後端 API
    runtimeConfig.myAuth = defu(runtimeConfig.myAuth, {
        apiBaseUrl: options.apiBaseUrl,
        cookieName: options.cookieName, // 伺服器也需要
        cookieOptions: options.cookieOptions, // 伺服器需要設置 cookie
    });


    // 3. 自動導入 composables
    addImportsDir(resolver.resolve('./runtime/composables'));

    // 4. 註冊伺服器 API 路由 (處理登入、登出、獲取使用者)
    // 這些路由會處理實際的後端 API 呼叫和 HttpOnly cookie 操作
    addServerHandler({
        route: `/api${options.loginEndpoint}`, // 內部 API 路由
        handler: resolver.resolve('./runtime/server/api/auth/login.post'),
    });
    addServerHandler({
        route: `/api${options.logoutEndpoint}`, // 內部 API 路由
        handler: resolver.resolve('./runtime/server/api/auth/logout.post'),
    });
     addServerHandler({
        route: `/api${options.userEndpoint}`, // 內部 API 路由
        handler: resolver.resolve('./runtime/server/api/auth/user.get'),
    });

    // 5. (可選) 註冊插件，例如用於初始化時檢查 cookie 並獲取使用者資訊
    addPlugin(resolver.resolve('./runtime/plugins/auth.server')); // 伺服器端初始化
    addPlugin(resolver.resolve('./runtime/plugins/auth.client')); // 客戶端初始化/同步狀態
  },
});