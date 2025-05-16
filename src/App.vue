<template>
  <div class="app-layout">
    <!-- Кнопка открытия меню -->
    <b-button
      v-if="auth.isAuthenticated"
      variant="link"
      class="menu-toggle"
      data-bs-toggle="offcanvas"
      data-bs-target="#sidebarMenu"
    >
      ☰ 
    </b-button>

    <!-- Боковое меню -->
    <div
        v-if="auth.isAuthenticated"
        class="offcanvas offcanvas-start custom-sidebar"
        tabindex="-1"
        id="sidebarMenu"
        aria-labelledby="sidebarMenuLabel"
      >
      <div class="offcanvas-header">
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Закрыть"
        ></button>
      </div>

      <div class="offcanvas-body">
        <ul class="nav flex-column">
          <li class="nav-item" v-for="(item, i) in menuItems" :key="i">
            <router-link
              class="nav-link"
              :class="{ active: $route.path === item.to }"
              :to="item.to"
              @click="closeSidebar"
            >
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Контент -->
    <div class="page-content px-3 pt-2">
      <router-view />
    </div>
  </div>
</template>

<script>
import { Offcanvas } from 'bootstrap'
import { useAuthStore } from '@/stores/auth';

export default {
  name: "App",
  setup() {
    const auth = useAuthStore()
    return { auth }
  },
  data() {
    return {
      menuItems: [
        { label: "Главная", to: "/" },
        { label: "Записать долг", to: "/create-liability" },
        { label: "Списать долг", to: "/create-completed-standard" },
        { label: "История", to: "/history" },
        { label: "График", to: "/chart-completed-standard" },
        { label: "Рейтинг", to: "/rating-completed-standard" },
      ],
    };
  },
  methods: {
    closeSidebar() {
      const sidebar = document.getElementById("sidebarMenu");
      const instance = Offcanvas.getInstance(sidebar);
      if (instance) {
        instance.hide();
      }
    },
  }
};
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8f9fa;
}

.menu-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1040;
  border-radius: 8px;
}

.custom-sidebar {
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  width: 250px;
}

.custom-sidebar .nav-link.active {
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
  font-weight: 600;
}

.custom-sidebar .nav-link:hover {
  background-color: #e9f0ff;
  color: #007bff;
  border-radius: 4px;
}

.page-content {
  margin-top: 3.5rem;
  padding-bottom: 2rem;
}
</style>
