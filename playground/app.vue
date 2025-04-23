<template>
  <div>
    <h1>Auth Module Playground</h1>

    <div v-if="loggedIn">
      <p>Welcome, {{ user?.username }}!</p>
      <button @click="handleLogout">Logout</button>
    </div>
    <div v-else>
      <form @submit.prevent="handleLogin">
        <div>
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="credentials.username" required>
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="credentials.password" required>
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error" style="color: red;">{{ error }}</p>
      </form>
    </div>
    <hr>
    <pre>User State: {{ user }}</pre>
    <pre>Logged In: {{ loggedIn }}</pre>
    <pre>Token Exists (client-side check): {{ !!token }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuth } from '#imports'; // 自動引入

const { user, loggedIn, login, logout, token } = useAuth();

const credentials = reactive({
  username: '',
  password: '',
});
const loading = ref(false);
const error = ref<string | null>(null);

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  try {
    await login(credentials);
    // 登入成功後清空表單
    credentials.username = '';
    credentials.password = '';
  } catch (err: any) {
    console.error('Login page error:', err);
    error.value = err.data?.message || err.message || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  await logout();
};

// 初始加載時，插件會嘗試 fetchUser，這裡不需要再次調用，
// 但可以監聽 user 變化或 loggedIn 狀態
</script>