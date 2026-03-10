<template>
  <div
    class="sidebar"
    :class="{
      collapsed: isCollapsed && !isMobile,
      'mobile-visible': isMobile && isVisible
    }"
  >
    <div class="sidebar-sticky">
      <ul class="nav flex-column">
        <li 
          v-for="item in menuItems" 
          :key="item.label" 
          class="nav-item"
        >
          <router-link
            v-if="item.to"
            class="nav-link"
            :to="item.to"
            :title="item.label"
            active-class="active"
            @click="onItemClick"
          >
            <i :class="['menu-icon', item.icon]"></i>
            <span class="menu-text" v-show="!isCollapsed || isMobile">
              {{ item.label }}
            </span>
          </router-link>
          <div
            v-else-if="item.action"
            class="nav-link"
            :title="item.label"
            @click="item.action"
            role="button"
            tabindex="0"
            @keypress.enter="item.action"
          >
            <i :class="['menu-icon', item.icon]"></i>
            <span class="menu-text" v-show="!isCollapsed || isMobile">
              {{ item.label }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
const menuItems = [
  { label: "Главная", to: "/", icon: "fa fa-home" },
  { label: "Профиль", to: "/profile", icon: "fa fa-user" },
  { label: "Записать долг", to: "/create-liability", icon: "fa fa-pencil-square-o" },
  { label: "Списать долг", to: "/create-completed-standard", icon: "fa fa-check-square-o" },
  { label: "История", to: "/history", icon: "fa fa-history" },
  { label: "Статистика", to: "/statistics", icon: "fa fa-line-chart" },
  { label: "Рейтинг", to: "/rating-completed-standard", icon: "fa fa-trophy" },
  { label: "Достижения", to: "/achievements", icon: "fa fa-star" },
];

export default {
  name: "SideBar",
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['item-click'],
  setup(props, { emit }) {
    const onItemClick = () => {
      emit('item-click');
    };

    return {
      menuItems,
      onItemClick,
    };
  },
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 250px;
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding-top: 4.5rem;
  transition: transform 0.3s ease, width 0.3s ease;
  overflow-x: hidden;
  z-index: 1040;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar.mobile-visible {
  transform: translateX(0);
}

@media (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
    width: 250px;
  }
}

.sidebar-sticky {
  height: 100%;
  overflow-y: auto;
}

.nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 4px 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #e9f0ff;
  color: #007bff;
}

.nav-link.active {
  background-color: #007bff;
  color: #fff;
}

.menu-icon {
  width: 24px;
  text-align: center;
  font-size: 1.1rem;
  margin-right: 12px;
  flex-shrink: 0;
}

.sidebar.collapsed .menu-text {
  display: none;
}

.sidebar.collapsed .menu-icon {
  margin-right: 0;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.75rem;
}
</style>
