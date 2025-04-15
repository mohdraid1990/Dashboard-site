<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProjectStore } from '../stores/projects';
import { useI18n } from 'vue-i18n';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const store = useProjectStore();
const { t } = useI18n();

const chartData = computed(() => ({
  labels: store.projects.map((p) => p.title),
  datasets: [
    {
      label: t('completedTasks'),
      data: store.projects.map(
        (p) => store.tasks.filter((t) => t.projectId === p.id && t.status === 'completed').length
      ),
      borderColor: '#42b983',
      backgroundColor: 'rgba(66, 185, 131, 0.2)',
      tension: 0.4,
    },
  ],
}));
</script>

<template>
  <div class="dashboard animate__animated animate__fadeIn">
    <h1>{{ t('dashboard') }}</h1>

    <div class="stats-container">
      <div class="stat-card">
        <h3>{{ t('projects') }}</h3>
        <p>{{ store.projects.length }}</p>
      </div>
      <div class="stat-card">
        <h3>{{ t('tasks') }}</h3>
        <p>{{ store.tasks.length }}</p>
      </div>
    </div>

    <div class="chart-container">
      <Line v-if="chartData" :data="chartData" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  padding: 2rem;

  .stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }

  .stat-card {
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: $shadow;
    text-align: center;

    .dark & {
      background-color: $dark-bg;
    }

    h3 {
      margin: 0;
      color: #666;

      .dark & {
        color: #ddd;
      }
    }

    p {
      font-size: 2rem;
      margin: 0.5rem 0 0;
      color: $primary-color;
    }
  }

  .chart-container {
    margin-top: 2rem;
    background-color: #fff;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: $shadow;

    .dark & {
      background-color: $dark-bg;
    }
  }
}
</style>