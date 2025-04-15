<script setup>
import { useProjectStore } from '../stores/projects';
import { computed } from 'vue';

const store = useProjectStore();
const notifications = computed(() => store.notifications);
</script>

<template>
  <div class="toast-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="toast animate__animated animate__fadeIn"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.toast {
  background-color: $primary-color;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-shadow: $shadow;
}
</style>