<template>
  <div id="app-container">
    <NavBar @toggle-sidebar="toggleSidebar" />

    <SideBar
      v-if="auth.isAuthenticated"
      :is-collapsed="isSidebarCollapsed && !isMobile"
      :is-visible="isMobileSidebarVisible"
      :is-mobile="isMobile"
      @item-click="onMenuItemClick"
    />

    <div
      v-if="isMobile && isMobileSidebarVisible"
      class="overlay"
      @click="hideMobileSidebar"
    ></div>

    <div class="page-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import NavBar from '@/components/NavBar.vue';
import SideBar from '@/components/SideBar.vue';

export default {
  name: "App",
  components: {
    NavBar,
    SideBar,
  },
  setup() {
    const auth = useAuthStore();

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

    onMounted(() => {
      window.addEventListener('resize', updateWidth);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updateWidth);
    });

    return {
      auth,
      isSidebarCollapsed,
      isMobileSidebarVisible,
      isMobile,
      toggleSidebar,
      hideMobileSidebar,
      onMenuItemClick,
    };
  },
};
</script>

<style scoped>
#app-container {
  position: relative;
  min-height: 100vh;
  background: #f8f9fa;
  overflow-x: hidden;
}

.page-content {
  padding: 20px;
  padding-top: 80px;
  padding-left: 20px;
  transition: padding-left 0.3s ease;
  position: relative;
  z-index: 1;
}

@media (min-width: 768px) {
  .page-content {
    padding-left: 270px;
  }

  :not(.mobile-visible) + .page-content {
    padding-left: 80px;
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1039;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
