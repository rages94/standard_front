<template>
    <div class="login-container">
      <div class="login-box">
        <h2>Вход</h2>
        <b-form @submit.prevent="handleLogin">
          <!-- Username Input -->
          <b-form-group label="Никнейм" label-for="username">
            <b-form-input
              id="username"
              v-model="username"
              type="text"
              placeholder="Введи свой никнейм"
              required
            ></b-form-input>
          </b-form-group>
  
          <!-- Password Input -->
          <b-form-group class="mb-5" label="Пароль" label-for="password">
            <b-form-input
              id="password"
              v-model="password"
              type="password"
              placeholder="Введи свой пароль"
              required
            ></b-form-input>
          </b-form-group>
  
          <!-- Login Button -->
          <b-button type="submit" variant="primary" class="login-button">
            Войти
          </b-button>
  
          <!-- Sign Up Button -->
          <b-button
            variant="secondary"
            class="signup-button mt-2"
            @click="navigateToSignUp"
          >
            Зарегистрироваться
          </b-button>
        </b-form>
      </div>
    </div>
  </template>
  
  <script>
  import api from '../api/axios.js';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
      };
    },
    methods: {
      async handleLogin() {
        try {
          const response = await api.post('/users/login/', {
            username: this.username,
            password: this.password,
          });
          const { access_token, refresh_token } = response.data;
          // Save tokens in localStorage or Vuex for later use
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          // Redirect to another page (e.g., Table Page)
          this.$router.push('/');
        } catch (error) {
          console.error(error);
          alert('Login failed. Please check your username and password.');
        }
      },
      navigateToSignUp() {
        // Redirect to the Sign Up page
        this.$router.push('/signup');
      },
    },
  };
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
    width: 400px;
    padding: 20px;
    border: 1px solid #ddd;
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
  