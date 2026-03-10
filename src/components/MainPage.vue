<template>
  <div class="main-page">
    <div class="main-box">
      <div class="total-liability">
        <span class="label">ОБЩИЙ ДОЛГ</span>
        <span class="value" :class="{ loading: loading }">
          {{ loading ? '' : formatNumber(dashboard?.user?.total_liabilities || 0) }}
        </span>
      </div>

      <div class="reward-section-header">Текущий зачет</div>
      <div v-if="!loading && creditProgress !== null" class="credit-section">
        <div class="credit-header">
          <span class="credit-progress-text">
            {{ creditCompleted }} / {{ creditTotal }} н.
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: creditProgress + '%' }"></div>
        </div>
        <div class="credit-deadline" v-if="daysLeft !== null && creditProgress < 100">
          {{ daysLeftText }}
        </div>
      </div>

      <div v-if="!loading && creditProgress === null" class="no-credit">
        Нет активного зачета
      </div>

      <div class="reward-section-header">Стрик активности</div>
      <div v-if="!loading" class="streak-section">
        <div v-if="(dashboard?.streak?.current_streak || 0) >= 14" class="streak-icon">🔥</div>
        <div class="streak-info">
          <div class="streak-current">
            <span class="streak-value">{{ dashboard?.streak?.current_streak || 0 }}</span>
            <span class="streak-label">{{ declensionDays(dashboard?.streak?.current_streak || 0) }}</span>
          </div>
          <div class="stat-divider-line"></div>
          <div class="stat-record">
            рекорд: {{ dashboard?.streak?.longest_streak || 0 }} {{ declensionDays(dashboard?.streak?.longest_streak || 0) }}
          </div>
        </div>
      </div>

      <div class="reward-section-header">Выполненные нормы</div>
      <div v-if="!loading" class="stats-row">
        <div class="stat-item">
          <span class="stat-label">Сегодня</span>
          <span class="stat-value">{{ formatNumber(dashboard?.today_norm || 0) }}</span>
          <div class="stat-divider-line"></div>
          <span class="stat-record">рекорд: {{ formatNumber(dashboard?.user?.max_daily_norm || 0) }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">За неделю</span>
          <span class="stat-value">{{ formatNumber(dashboard?.week_norm || 0) }}</span>
          <div class="stat-divider-line"></div>
          <span class="stat-record">рекорд: {{ formatNumber(dashboard?.user?.max_weekly_norm || 0) }}</span>
        </div>
      </div>

      <div v-if="!loading && dashboard?.nearest_achievement" class="reward-section">
        <div class="reward-section-header">Ближайшее достижение</div>
        <div 
          class="achievement-card" 
          :class="dashboard.nearest_achievement.achievement?.rarity"
        >
          <div class="achievement-rarity" :class="dashboard.nearest_achievement.achievement?.rarity">
            {{ getRarityLabel(dashboard.nearest_achievement.achievement?.rarity) }}
          </div>
          
          <div class="achievement-icon">
            <i :class="getAchievementIcon(dashboard.nearest_achievement.achievement)"></i>
          </div>
          
          <div class="achievement-info">
            <div class="achievement-name">{{ dashboard.nearest_achievement.achievement?.name }}</div>
            <div class="achievement-description">{{ dashboard.nearest_achievement.achievement?.description }}</div>
          </div>
          
          <div class="achievement-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :class="dashboard.nearest_achievement.achievement?.rarity"
                :style="{ width: `${getProgressPercent(dashboard.nearest_achievement)}%` }"
              ></div>
            </div>
            <div class="progress-text">
              {{ Math.round(dashboard.nearest_achievement.current_value) }} / {{ dashboard.nearest_achievement.achievement?.target_value }}
              <span class="progress-percent">({{ getProgressPercent(dashboard.nearest_achievement) }}%)</span>
            </div>
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
  if (daysLeft.value < 5) return `${daysLeft.value} ${declensionDays(daysLeft.value)} осталось`;
  return `${daysLeft.value} ${declensionDays(daysLeft.value)} осталось`;
});

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

function getRarityLabel(rarity) {
  const labels = {
    common: 'Обычное',
    rare: 'Редкое',
    epic: 'Эпическое',
    legendary: 'Легендарное',
  };
  return labels[rarity] || rarity;
}

function getAchievementIcon(achievement) {
  if (achievement?.icon) return achievement.icon;
  
  const icons = {
    streak: 'fa fa-fire',
    meta: 'fa fa-star',
    count: 'fa fa-check',
    weight: 'fa fa-dumbbell',
  };
  return icons[achievement?.condition_type] || 'fa fa-trophy';
}

function getProgressPercent(achievementProgress) {
  const percent = (achievementProgress.current_value / achievementProgress.achievement.target_value) * 100;
  return Math.min(Math.round(percent), 100);
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
  padding: 8px;
  display: flex;
  justify-content: center;
}

.main-box {
  width: 100%;
  max-width: 600px;
  padding: 8px;
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
  background: linear-gradient(90deg, #00b309, #09ff00);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.credit-deadline {
  font-size: 13px;
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
  background: #f8f9fa;
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

.stat-divider-line {
  height: 1px;
  background: #ddd;
  margin: 6px 0;
}

.stat-record {
  font-size: 12px;
  color: #888;
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

.reward-section {
  margin-top: 16px;
}

.reward-section-header {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.reward-section .achievement-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  opacity: 1;
  filter: none;
}

.reward-section .achievement-rarity {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.reward-section .achievement-rarity.common {
  background: #f3f4f6;
  color: #6b7280;
}

.reward-section .achievement-rarity.rare {
  background: #dbeafe;
  color: #1d4ed8;
}

.reward-section .achievement-rarity.epic {
  background: #f3e8ff;
  color: #7c3aed;
}

.reward-section .achievement-icon {
  width: 48px;
  height: 48px;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.reward-section .achievement-icon i {
  font-size: 20px;
  color: #6b7280;
}

.reward-section .achievement-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.reward-section .achievement-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 12px;
}

.reward-section .progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.reward-section .progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.reward-section .progress-fill.common { background: #6b7280; }
.reward-section .progress-fill.rare { background: #007bff; }
.reward-section .progress-fill.epic { background: #9b59b6; }

.reward-section .progress-text {
  font-size: 11px;
  color: #6b7280;
}

.reward-section .progress-percent {
  color: #999;
}
</style>
