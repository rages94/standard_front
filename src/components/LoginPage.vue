<template>
    <div class="login-container">
      <div class="login-box">
        <h2>Вход</h2>
        <b-form @submit.prevent="handleLogin">
          <b-form-group label="Никнейм" label-for="username">
            <b-form-input
              id="username"
              v-model="username"
              type="text"
              placeholder="Введи свой никнейм"
              required
            ></b-form-input>
          </b-form-group>
  
          <b-form-group class="mb-5" label="Пароль" label-for="password">
            <b-form-input
              id="password"
              v-model="password"
              type="password"
              placeholder="Введи свой пароль"
              required
            ></b-form-input>
          </b-form-group>
  
          <b-button type="submit" size="sm" variant="primary" class="login-button">
            Войти
          </b-button>
  
          <b-button
            variant="secondary"
            size="sm"
            class="signup-button mt-2"
            @click="navigateToSignUp"
          >
            Зарегистрироваться
          </b-button>
        </b-form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import api from '../api/axios.js'
  import { useAuthStore } from '@/stores/auth'
  
  const auth = useAuthStore()
  const router = useRouter()
  
  const username = ref('')
  const password = ref('')
  
  const handleLogin = async () => {
    try {
      const response = await api.post('/users/login/', {
        username: username.value,
        password: password.value,
      })
  
      const { access_token, refresh_token } = response.data
      auth.login(access_token, refresh_token)
  
      router.push('/')
    } catch (error) {
      console.error(error)
      alert('Login failed. Please check your username and password.')
    }
  }
  
  const navigateToSignUp = () => {
    router.push('/signup')
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8f9fa;
  }
  
  .login-box {
    width: 100%;
    max-width: 500px;
    min-width: 400px;
    padding: 20px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .login-button {
    width: 100%;
  }
  
  .signup-button {
    width: 100%;
  }
  </style>
  