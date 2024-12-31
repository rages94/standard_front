<template>
    <div class="signup-container">
      <div class="signup-box">
        <h2>Регистрация</h2>
        <b-form @submit.prevent="handleSignUp">
          <!-- Username Input -->
          <b-form-group label="Никнейм" label-for="username">
            <b-form-input
              id="username"
              v-model="username"
              type="text"
              placeholder="Введи никнейм"
              required
            ></b-form-input>
          </b-form-group>
  
          <!-- Password Input -->
          <b-form-group label="Пароль" label-for="password">
            <b-form-input
              id="password"
              v-model="password"
              type="password"
              placeholder="Введи пароль"
              required
            ></b-form-input>
          </b-form-group>
  
          <!-- Confirm Password Input -->
          <b-form-group class="mb-5" label="Подтверждение пароля" label-for="confirm-password">
            <b-form-input 
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              placeholder="Повтори пароль"
              required
            ></b-form-input>
          </b-form-group>
  
          <!-- Sign Up Button -->
          <b-button type="submit" variant="primary" class="signup-button">
            Зарегистрироваться
          </b-button>

          <b-button
            variant="secondary"
            class="back-button mt-2"
            @click="navigateToLogin"
          >
            Назад
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
        confirmPassword: '',
      };
    },
    methods: {
      async handleSignUp() {
        // Validate passwords match
        if (this.password !== this.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
  
        try {
          // Call the sign-up API
          await api.post('/users/register/', {
            username: this.username,
            password: this.password,
            password2: this.confirmPassword,
          });
  
          // Call the login API if sign-up is successful
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
          alert('Sign up failed. Please try again.');
        }
      },
      navigateToLogin() {
        // Redirect to the Sign Up page
        this.$router.push('/login');
      },
    },
  };
  </script>
  
  <style scoped>
  .signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8f9fa;
  }
  
  .signup-box {
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
  
  .signup-button {
    width: 100%;
  }

  .back-button {
    width: 100%;
  }
  </style>
  