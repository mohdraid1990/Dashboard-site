import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Projects from '../views/Projects.vue';
import Tasks from '../views/Tasks.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/projects', name: 'Projects', component: Projects },
  { path: '/tasks', name: 'Tasks', component: Tasks },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;