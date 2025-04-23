// src/runtime/composables/useAuth.ts
import { useState, useCookie, useRuntimeConfig, useRouter, navigateTo } from '#imports'; // Nuxt 自動注入
import type { Ref } from 'vue'; // 導入 Ref 類型

// 定義 User 類型 (最好與後端 API 一致)
interface User {
  id: number | string;
  username: string;
  // 其他使用者屬性...
}

interface UseAuthReturn {
  user: Ref<User | null>;
  loggedIn: Ref<boolean>;
  login: (credentials: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>; // 新增：用於初始化或刷新使用者狀態
  token: Ref<string | null | undefined>; // 讓外部可以觀察 token 狀態 (但不能修改 HttpOnly)
}

export const useAuth = (): UseAuthReturn => {
  const config = useRuntimeConfig().public.myAuth;
  const router = useRouter();

  // 1. 使用者狀態 (SSR 安全)
  const userState = useState<User | null>('auth-user', () => null);

  // 2. Token 狀態 (主要是為了檢查存在性，值對於 HttpOnly cookie 無法直接讀取)
  // 我們仍然創建它，因為 useCookie 知道 cookie 的存在，即使值是 undefined (對於 HttpOnly)
  // 這有助於 loggedIn 的計算和觸發 fetchUser
  const tokenState = useCookie<string | null>(config.cookieName);

  // 3. 登入狀態計算屬性
  const loggedIn = computed(() => !!tokenState.value && !!userState.value); // 必須 token 和 user 都存在

  // 4. 登入函數
  const login = async (credentials: Record<string, any>) => {
    console.log("login")
    // 清除舊狀態，以防萬一
    userState.value = null;
    // tokenState.value = null; // 客戶端無法直接清除 HttpOnly cookie

    try {
        // 呼叫我們在模組中定義的內部 API 路由
        const response = await $fetch<{ user: User }>(`/api${config.loginEndpoint}`, {
            method: 'POST',
            body: credentials,
        });

        // 內部 API 成功後會設置 cookie 並返回 user data
        if (response && response.user) {
            userState.value = response.user;
            // tokenState.value 會在下次請求或頁面刷新時由瀏覽器自動更新 (因為 cookie 已設置)
            // 登入成功後，可以選擇重定向或做其他事情
            // await navigateTo('/dashboard'); // 範例：重定向到儀表板
        } else {
            // 雖然 $fetch 會在非 2xx 時拋出錯誤，但以防萬一
             throw new Error('Login failed: No user data returned');
        }
    } catch (error: any) {
        console.error('Login failed:', error);
        userState.value = null; // 確保登入失敗時 user 為 null
        // tokenState.value = null; // 同上
        // 向上拋出錯誤，讓呼叫者可以處理 (例如顯示錯誤訊息)
        throw error;
    }
  };

  // 5. 登出函數
  const logout = async () => {
    try {
        // 呼叫內部登出 API 來清除 HttpOnly cookie
        await $fetch(`/api${config.logoutEndpoint}`, {
            method: 'POST',
        });
    } catch (error) {
        console.error('Logout API call failed:', error);
        // 即使 API 呼叫失敗，我們仍然嘗試清除客戶端狀態
    } finally {
        // 清除客戶端狀態
        userState.value = null;
        tokenState.value = null; // 清除 useCookie 的狀態

        // 重定向到首頁或指定頁面
        await navigateTo(config.redirectOnLogout || '/');
    }
  };

  // 6. 獲取使用者函數 (用於插件或需要時手動調用)
  const fetchUser = async () => {
    // 如果已經有使用者資訊，則不重新獲取 (除非強制)
    if (userState.value) return;

    // 檢查 token 是否存在 (即使是 HttpOnly，useCookie 也能感知其存在)
    if (!tokenState.value) {
        // console.log('No token found, cannot fetch user.');
        return;
    }

    try {
        // 呼叫內部獲取使用者 API
        const response = await $fetch<{ user: User }>(`/api${config.userEndpoint}`, {
            method: 'GET',
            // 不需要手動加 token header，因為瀏覽器會自動帶上 cookie
            // 但要注意 CSRF 保護（如果後端有要求）
        });

        if (response && response.user) {
            userState.value = response.user;
        } else {
             userState.value = null; // 獲取失敗
        }
    } catch (error: any) {
        console.error('Failed to fetch user:', error);
        // 如果錯誤是 401 (Unauthorized)，表示 token 無效，清除客戶端狀態
        if (error.statusCode === 401) {
             userState.value = null;
             tokenState.value = null; // 清除 useCookie 狀態
             // 這裡不需要調用 logout API，因為伺服器端 fetch user 可能已經清除了 cookie
        } else {
             // 其他錯誤，只清除 user state
             userState.value = null;
        }

    }
  };

  return {
    user: userState,
    loggedIn,
    login,
    logout,
    fetchUser,
    token: tokenState // 返回 token 狀態供觀察
  };
};