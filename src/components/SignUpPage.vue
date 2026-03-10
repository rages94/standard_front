<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Регистрация</h2>
      
      <form @submit.prevent="handleSignUp" class="auth-form">
        <div class="form-group">
          <label for="username">Никнейм</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-input"
            placeholder="Придумайте никнейм"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Придумайте пароль"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirm-password">Подтверждение пароля</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            placeholder="Повторите пароль"
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          <span v-else>Зарегистрироваться</span>
        </button>

        <button type="button" class="secondary-btn" @click="navigateToLogin">
          Назад
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import api from '../api/axios.js'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const handleSignUp = async () => {
  if (password.value !== confirmPassword.value) {
    toast.error('Пароли не совпадают', {
      position: toast.POSITION.BOTTOM_RIGHT,
      autoClose: 3000,
    })
    return
  }

  loading.value = true
  try {
    await api.post('/users/register/', {
      username: username.value,
      password: password.value,
      password2: confirmPassword.value,
    })

    const response = await api.post('/users/login/', {
      username: username.value,
      password: password.value,
    })

    const { access_token, refresh_token } = response.data
    auth.login(access_token, refresh_token)

    router.push('/')
  } catch (error) {
    console.error(error)
    toast.error('Ошибка при регистрации', {
      position: toast.POSITION.BOTTOM_RIGHT,
      autoClose: 3000,
    })
  } finally {
    loading.value = false
  }
}

const navigateToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin: 0 0 24px 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #007bff;
}

.form-input::placeholder {
  color: #9ca3af;
}

.submit-btn {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-btn {
  width: 100%;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
