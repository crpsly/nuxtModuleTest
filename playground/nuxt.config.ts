import { defineNuxtConfig } from 'nuxt/config';
import MyAuthModule from '../src/module'; // 直接引入本地模組

export default defineNuxtConfig({
  modules: [
    MyAuthModule, // 註冊你的模組
  ],

  // 如果你的後端 API 在不同域且需要 Cookie，可能需要配置 CORS 或代理
  // 範例：使用 Nitro 代理 (如果後端在 localhost:3001)
  // routeRules: {
  //   '/api/auth/**': { proxy: 'http://localhost:3001/api/auth/**' }
  // },
  // vite: { // 如果後端不在同一個域，Vite 開發伺服器也可能需要代理
  //   server: {
  //     proxy: {
  //       '/api': { // 將前端 /api 請求代理到後端
  //         target: 'http://localhost:3001',
  //         changeOrigin: true,
  //       }
  //     }
  //   }
  // }
  myAuth: { // 配置你的模組選項
    apiBaseUrl: 'http://localhost:3001', // **換成你的實際後端 API 地址**
    // 可以覆蓋其他預設值，例如：
    // loginEndpoint: '/api/v1/auth/login',
    // cookieName: 'myapp-session',
  },

  compatibilityDate: '2025-04-23'
});