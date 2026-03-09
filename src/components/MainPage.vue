<template>
  <div class="main-page">
    <div class="main-box">
      <div class="total-liability">
        <span class="label">ОБЩИЙ ДОЛГ</span>
        <span class="value" :class="{ loading: loading }">
          {{ loading ? '' : formatNumber(dashboard?.user?.total_liabilities || 0) }}
        </span>
      </div>

      <div v-if="!loading && creditProgress !== null" class="credit-section">
        <div class="credit-header">
          <span class="credit-label">Зачет</span>
          <span class="credit-progress-text">
            {{ creditCompleted }} / {{ creditTotal }} норм
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: creditProgress + '%' }"></div>
        </div>
        <div class="credit-deadline" v-if="daysLeft !== null">
          {{ daysLeftText }}
        </div>
      </div>

      <div v-if="!loading && creditProgress === null" class="no-credit">
        Нет активного зачета
      </div>

      <div v-if="!loading" class="streak-section">
        <div v-if="(dashboard?.streak?.current_streak || 0) >= 14" class="streak-icon">🔥</div>
        <div class="streak-info">
          <div class="streak-current">
            <span class="streak-value">{{ dashboard?.streak?.current_streak || 0 }}</span>
            <span class="streak-label">{{ declensionDays(dashboard?.streak?.current_streak || 0) }} тренировок подряд</span>
          </div>
          <div class="streak-best">
            Рекорд: {{ dashboard?.streak?.longest_streak || 0 }} {{ declensionDays(dashboard?.streak?.longest_streak || 0) }}
          </div>
        </div>
      </div>

      <div v-if="!loading" class="stats-row">
        <div class="stat-item">
          <span class="stat-label">Сегодня</span>
          <span class="stat-value">{{ formatNumber(dashboard?.today_norm || 0) }}н</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">За месяц</span>
          <span class="stat-value">{{ formatNumber(dashboard?.month_norm || 0) }}н</span>
        </div>
      </div>

      <div v-if="!loading && recentActivity.length > 0" class="recent-section">
        <div class="recent-header">Недавняя активность</div>
        <div class="recent-list">
          <div v-for="item in recentActivity" :key="item.id" class="recent-item">
            <span class="recent-name">{{ item.standard?.name || 'Упражнение' }}</span>
            <span class="recent-details">
              × {{ item.count }}
              <template v-if="item.weight">
                × {{ item.weight }}кг
              </template>
              <span class="recent-norm">({{ formatNumber(item.total_norm || 0) }}н)</span>
            </span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api/axios.js';

const loading = ref(true);
const dashboard = ref(null);

const creditCompleted = computed(() => dashboard.value?.current_credit?.completed_count || 0);
const creditTotal = computed(() => dashboard.value?.current_credit?.count || 0);
const creditProgress = computed(() => {
  if (!dashboard.value?.current_credit) return null;
  return Math.min(100, (creditCompleted.value / creditTotal.value) * 100);
});

const daysLeft = computed(() => {
  if (!dashboard.value?.current_credit?.deadline_date) return null;
  const deadline = new Date(dashboard.value.current_credit.deadline_date);
  const now = new Date();
  const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
});

const daysLeftText = computed(() => {
  if (daysLeft.value === null) return '';
  if (daysLeft.value === 0) return 'Сегодня дедлайн!';
  if (daysLeft.value === 1) return '1 день остался';
  if (daysLeft.value < 5) return `${daysLeft.value} дня осталось`;
  return `${daysLeft.value} дней осталось`;
});

const recentActivity = computed(() => dashboard.value?.recent_activity || []);

function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toFixed(1);
}

function declension(number, titles) {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

function declensionDays(number) {
  return declension(number, ['день', 'дня', 'дней']);
}

async function fetchDashboard() {
  loading.value = true;
  try {
    const response = await api.get('/users/dashboard/');
    dashboard.value = response.data;
    localStorage.setItem('completed_type', response.data.user?.completed_type);
    localStorage.setItem('user_weight', response.data.user?.weight || 70);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchDashboard);
</script>

<style scoped>
.main-page {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.main-box {
  width: 100%;
  max-width: 600px;
  padding: 24px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.total-liability {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.total-liability .label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.total-liability .value {
  font-size: 48px;
  font-weight: 700;
  color: #000;
}

.credit-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.credit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.credit-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.credit-progress-text {
  font-size: 14px;
  color: #666;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.credit-deadline {
  font-size: 13px;
  color: #dc3545;
  text-align: center;
}

.no-credit {
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 14px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.streak-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fff5f5, #fff);
  border: 1px solid #ffebeb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.streak-icon {
  font-size: 32px;
}

.streak-info {
  flex: 1;
}

.streak-current {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.streak-value {
  font-size: 28px;
  font-weight: 700;
  color: #dc3545;
}

.streak-label {
  font-size: 14px;
  color: #666;
}

.streak-best {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #ddd;
}

.recent-section {
  padding-top: 8px;
}

.recent-header {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.recent-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.recent-details {
  font-size: 13px;
  color: #666;
}

.recent-norm {
  color: #007bff;
  font-weight: 500;
  margin-left: 4px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .main-box {
    padding: 16px;
  }

  .total-liability .value {
    font-size: 36px;
  }

  .streak-section {
    padding: 12px;
  }

  .streak-value {
    font-size: 24px;
  }
}
</style>
