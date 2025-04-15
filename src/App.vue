<script setup>
import { computed, onMounted, ref } from "vue";
import { useProjectStore } from "./stores/projects";
import { useI18n } from "vue-i18n";
import { usePreferredDark } from "@vueuse/core";
import NotificationToast from "./components/NotificationToast.vue";

const store = useProjectStore();
const { t, locale } = useI18n();
const isDark = usePreferredDark();
const isMenuOpen = ref(false); 

const toggleLanguage = () => {
  locale.value = locale.value === "ar" ? "en" : "ar";
  store.setLanguage(locale.value);
};

const themeClass = computed(() => store.theme);

onMounted(() => {
  if (isDark.value) {
    store.theme = "dark";
    document.documentElement.classList.add("dark");
  }
});

const toggleTheme = () => {
  store.toggleTheme();
  document.documentElement.classList.toggle("dark");
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <div :class="['app-wrapper', locale]" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <nav class="nav-bar">
      <div class="nav-container">
        <div class="nav-content">
          <!-- Logo -->
          <div class="logo">
            <img src="./assets/logo.svg" alt="Logo" />
          </div>

          <!-- Desktop Navigation -->
          <div class="nav-links">
            <router-link to="/" active-class="active-link">
              {{ t("dashboard") }}
            </router-link>
            <router-link to="/projects" active-class="active-link">
              {{ t("projects") }}
            </router-link>
            <router-link to="/tasks" active-class="active-link">
              {{ t("tasks") }}
            </router-link>
          </div>

          <!-- Buttons & Mobile Menu Toggle -->
          <div class="nav-actions">
            <button @click="toggleTheme" class="theme-btn">
              <i v-if="themeClass === 'light'" class="fas fa-moon"></i>
              <i v-else class="fas fa-sun"></i>
            </button>
            <button @click="toggleLanguage" class="lang-btn">
              {{ locale === "ar" ? "EN" : "عربي" }}
            </button>
            <!-- Hamburger Menu -->
            <label class="hamburger-menu">
              <input type="checkbox" v-model="isMenuOpen" />
              <span class="hamburger-icon">
                <span :class="{ 'hamburger-open': isMenuOpen }"></span>
                <span :class="{ 'hamburger-open': isMenuOpen }"></span>
                <span :class="{ 'hamburger-open': isMenuOpen }"></span>
              </span>
            </label>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="mobile-nav" :class="{ 'mobile-nav-open': isMenuOpen }">
          <router-link to="/" @click="toggleMenu" active-class="active-link">
            {{ t("dashboard") }}
          </router-link>
          <router-link
            to="/projects"
            @click="toggleMenu"
            active-class="active-link"
          >
            {{ t("projects") }}
          </router-link>
          <router-link
            to="/tasks"
            @click="toggleMenu"
            active-class="active-link"
          >
            {{ t("tasks") }}
          </router-link>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <NotificationToast />
  </div>
</template>

<style lang="scss" scoped>
@import './assets/styles/_variables';
@import './assets/styles/_mixins';

.app-wrapper {
  min-height: 100vh;

  &.ar {
    direction: rtl;
  }
}

.nav-bar {
  position: fixed;
  top: 0;
  width: 100%;
  background: linear-gradient(45deg, #636c71, #0a0a0a);
  box-shadow: $shadow;
  z-index: 50;
  transition: all 0.3s ease-in-out;

  .dark & {
    background: linear-gradient(45deg, $dark-bg, $secondary-color);
  }
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.logo {
  img {
    height: 40px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.nav-links {
  display: flex;
  gap: 1.5rem;

  a {
    color: white;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    &.active-link {
      background-color: rgba(255, 255, 255, 0.3);
      color: $light-bg;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;

  .theme-btn,
  .lang-btn {
    @include button;
    background-color: $light-bg;
    color: $secondary-color;
    font-size: 0.9rem;

    &:hover {
      background-color: $primary-color;
      color: white;
    }

    i {
      font-size: 1.2rem;
    }
  }
}

.hamburger-menu {
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }

  input[type="checkbox"] {
    display: none;
  }

  .hamburger-icon {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 30px;
    height: 25px;
    justify-content: center;

    span {
      height: 3px;
      background-color: white;
      border-radius: 2px;
      transition: all 0.3s ease;

      &.hamburger-open:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
      }

      &.hamburger-open:nth-child(2) {
        opacity: 0;
      }

      &.hamburger-open:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
      }
    }
  }
}

.mobile-nav {
  display: none;

  padding: 3rem;

  &.mobile-nav-open {
    display: block;
  }

  a {
    display: block;
    color: white;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    &.active-link {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }

  @media (min-width: 769px) {
    display: none;
  }
}


.main-content {
  margin-top: 80px;
  padding: 1.5rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;


  }

// .dashboard {
//   h1 {
//     color: $secondary-color;

//     .dark & {
//       color: $light-bg;
//     }
//   }
// }
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
