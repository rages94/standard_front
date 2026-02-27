<template>
  <nav class="navbar">
    <div class="navbar-left">
      <b-button
        v-if="isAuthenticated"
        variant="link"
        class="sidebar-toggle-button"
        @click="$emit('toggle-sidebar')"
      >
        <i class="fa fa-bars"></i>
      </b-button>
      <img v-if="!isAuthenticated" src="@/assets/logo.png" alt="Logo" class="navbar-logo" />
    </div>
    <div class="navbar-right">
      <template v-if="isAuthenticated">
        <b-button variant="link" class="text-danger logout-btn" @click="logOut">
          <i class="fa fa-sign-out"></i> Выйти
        </b-button>
      </template>
      <template v-else>
        <router-link to="/login" class="nav-btn">Войти</router-link>
        <router-link to="/signup" class="nav-btn">Регистрация</router-link>
      </template>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: "NavBar",
  emits: ['toggle-sidebar'],
  setup() {
    const auth = useAuthStore();
    const router = useRouter();

    const isAuthenticated = auth.isAuthenticated;

    const logOut = () => {
      auth.logout();
      router.push('/login');
    };

    return {
      isAuthenticated,
      logOut,
    };
  },
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1050;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-toggle-button {
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.sidebar-toggle-button:hover {
  background-color: #f0f0f0;
}

.navbar-logo {
  height: 50px;
}

.nav-btn {
  padding: 0.5rem 1rem;
  font-weight: 500;
  color: #007bff;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background-color: #e7f1ff;
  color: #0056b3;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #ffeaea;
}
</style>
