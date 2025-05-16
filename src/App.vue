<template>
  <div id="app-container">
    <!-- Toggle Button -->
    <b-button
      v-if="auth.isAuthenticated"
      variant="link"
      class="sidebar-toggle-button"
      @click="toggleSidebar"
    >
      <i class="fa fa-bars"></i>
    </b-button>

    <!-- Sidebar -->
    <div
      v-if="auth.isAuthenticated"
      class="custom-sidebar"
      :class="{
        collapsed: isSidebarCollapsed && !isMobile,
        'mobile-visible': isMobile && isMobileSidebarVisible
      }"
    >
      <div class="sidebar-sticky">
        <ul class="nav flex-column">
          <li class="nav-item" v-for="item in menuItems" :key="item.label">
            <router-link
              v-if="item.to"
              class="nav-link"
              :to="item.to"
              :title="item.label"
              active-class="active"
              @click="onMenuItemClick"
            >
              <i :class="['menu-icon', item.icon]"></i>
              <span class="menu-text" v-show="!isSidebarCollapsed || isMobile">{{ item.label }}</span>
            </router-link>
            <div
              v-else-if="item.action"
              class="nav-link"
              :title="item.label"
              @click="item.action"
              style="cursor: pointer;"
              role="button"
              tabindex="0"
              @keypress.enter="item.action"
            >
              <i :class="['menu-icon', item.icon]"></i>
              <span class="menu-text" v-show="!isSidebarCollapsed || isMobile">{{ item.label }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="isMobile && isMobileSidebarVisible"
      class="overlay"
      @click="hideMobileSidebar"
    ></div>

    <!-- Page Content -->
    <div class="page-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: "App",
  setup() {
    const auth = useAuthStore();
    const router = useRouter();

    const isSidebarCollapsed = ref(false);
    const isMobileSidebarVisible = ref(false);
    const windowWidth = ref(window.innerWidth);

    const isMobile = computed(() => windowWidth.value < 768);

    const updateWidth = () => {
      windowWidth.value = window.innerWidth;
    };

    const toggleSidebar = () => {
      if (isMobile.value) {
        isMobileSidebarVisible.value = !isMobileSidebarVisible.value;
      } else {
        isSidebarCollapsed.value = !isSidebarCollapsed.value;
      }
    };

    const hideMobileSidebar = () => {
      isMobileSidebarVisible.value = false;
    };

    const onMenuItemClick = () => {
      if (isMobile.value) {
        hideMobileSidebar();
      } else {
        isSidebarCollapsed.value = true;
      }
    };

    const logOut = () => {
      isMobileSidebarVisible.value = false;  // скрыть оверлей
      auth.logout();
      router.push('/login');
    };

    onMounted(() => {
      window.addEventListener('resize', updateWidth);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updateWidth);
    });

    const menuItems = [
      { label: "Главная", to: "/", icon: "fa fa-home" },
      { label: "Записать долг", to: "/create-liability", icon: "fa fa-pencil-square-o" },
      { label: "Списать долг", to: "/create-completed-standard", icon: "fa fa-check-square-o" },
      { label: "История", to: "/history", icon: "fa fa-history" },
      { label: "График", to: "/chart-completed-standard", icon: "fa fa-bar-chart" },
      { label: "Рейтинг", to: "/rating-completed-standard", icon: "fa fa-trophy" },
      { label: "Выйти", icon: "fa fa-sign-out", action: logOut },
    ];

    return {
      auth,
      isSidebarCollapsed,
      isMobileSidebarVisible,
      isMobile,
      toggleSidebar,
      hideMobileSidebar,
      onMenuItemClick,
      windowWidth,
      menuItems,
    };
  }
};
</script>

<style scoped>
#app-container {
  position: relative;
  min-height: 100vh;
  background: #f8f9fa;
  overflow-x: hidden;
}

.sidebar-toggle-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1041;
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
  transition: all 0.3s ease;
  overflow-x: hidden;
  z-index: 1040;
}

.custom-sidebar.collapsed {
  width: 60px;
}

.custom-sidebar.mobile-visible {
  transform: translateX(0);
}

@media (max-width: 767px) {
  .custom-sidebar {
    transform: translateX(-100%);
    width: 250px;
  }
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

.custom-sidebar.collapsed .menu-text {
  display: none;
}

.custom-sidebar.collapsed .menu-icon {
  margin-right: 0;
}

.custom-sidebar.collapsed .nav-link {
  justify-content: center;
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

.page-content {
  padding: 20px;
  padding-top: 4.5rem;
  position: relative;
  z-index: 1;
}

/* Overlay for mobile */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1039;
}
</style>
