<template>
  <div id="app-container" :class="{ 'sidebar-collapsed-layout': isSidebarCollapsed }">
    <!-- Sidebar Toggle Button -->
    <b-button
      v-if="auth.isAuthenticated"
      variant="link"
      class="sidebar-toggle-button"
      @click="toggleSidebar"
    >
      <i class="fa fa-bars"></i>
    </b-button>

    <!-- Collapsible Sidebar -->
    <div
      v-if="auth.isAuthenticated"
      class="custom-sidebar"
      :class="{ 'collapsed': isSidebarCollapsed }"
    >
      <div class="sidebar-sticky">
        <ul class="nav flex-column">
          <li class="nav-item" v-for="item in menuItems" :key="item.to">
            <router-link
              class="nav-link"
              :to="item.to"
              :title="item.label"
              active-class="active"
            >
              <i :class="['menu-icon', item.icon]"></i>
              <span class="menu-text" v-show="!isSidebarCollapsed">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content" :class="{ 'collapsed-content': isSidebarCollapsed }">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

export default {
  name: "App",
  setup() {
    const auth = useAuthStore();
    const isSidebarCollapsed = ref(false);

    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    };

    return {
      auth,
      isSidebarCollapsed,
      toggleSidebar,
    };
  },
  data() {
    return {
      menuItems: [
        { label: "Главная", to: "/", icon: "fa fa-home" },
        { label: "Записать долг", to: "/create-liability", icon: "fa fa-pencil-square-o" },
        { label: "Списать долг", to: "/create-completed-standard", icon: "fa fa-check-square-o" },
        { label: "История", to: "/history", icon: "fa fa-history" },
        { label: "График", to: "/chart-completed-standard", icon: "fa fa-bar-chart" },
        { label: "Рейтинг", to: "/rating-completed-standard", icon: "fa fa-trophy" },
      ],
    };
  }
};
</script>

<style scoped>
#app-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.sidebar-toggle-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1040;
  border-radius: 8px;
}

.custom-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 250px;
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding-top: 4.5rem;
  transition: width 0.3s ease;
  overflow-x: hidden;
  z-index: 1030;
}

.custom-sidebar.collapsed {
  width: 60px;
}

.custom-sidebar .nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
}

.custom-sidebar .menu-icon {
  width: 24px;
  text-align: center;
  font-size: 1.2rem;
  margin-right: 10px;
  flex-shrink: 0;
}

.custom-sidebar .nav-link.active {
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
}

.custom-sidebar .nav-link:hover {
  background-color: #e9f0ff;
  color: #007bff;
  border-radius: 4px;
}

.custom-sidebar.collapsed .menu-text {
  display: none;
}

.custom-sidebar.collapsed .menu-icon {
  margin-right: 0;
}

.custom-sidebar.collapsed .nav-link {
  justify-content: center;
}

.page-content {
  padding: 20px;
  padding-top: 4.5rem;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.page-content.collapsed-content {
  margin-left: 60px;
}
</style>
