<template>
  <div class="achievements-page">
    <div class="achievements-container">
      <h1 class="page-title">
        Достижения
        <span class="earned-count">{{ earnedCount }} из {{ totalCount }}</span>
      </h1>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div class="filters-section">
          <div class="filter-row">
            <div class="filter-group">
              <label class="filter-label">Упражнение</label>
              <select v-model="selectedStandard" class="filter-select" @change="onStandardChange">
                <option value="">Все упражнения</option>
                <option v-for="std in categories" :key="std.id" :value="std.id">
                  {{ std.name }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Статус</label>
              <div class="toggle-filter">
                <button
                  class="toggle-btn"
                  :class="{ active: showOnlyEarned === false }"
                  @click="showOnlyEarned = false"
                >
                  Все
                </button>
                <button
                  class="toggle-btn"
                  :class="{ active: showOnlyEarned === true }"
                  @click="showOnlyEarned = true"
                >
                  Полученные
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredAchievements.length > 0" class="achievements-grid">
          <div
            v-for="achievement in filteredAchievements"
            :key="achievement.id"
            class="achievement-card"
            :class="{ earned: achievement.is_earned, 'not-viewed': achievement.is_earned && achievement.is_viewed === false }"
          >
            <div v-if="achievement.is_earned && achievement.is_viewed === false" class="new-badge">Новое</div>
            <div class="achievement-rarity" :class="achievement.rarity">
              {{ getRarityLabel(achievement.rarity) }}
            </div>
            
            <div class="achievement-icon">
              <i :class="getCategoryIcon(achievement)"></i>
            </div>
            
            <div class="achievement-info">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
            </div>
            
            <div class="achievement-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${Math.min(achievement.percentage, 100)}%` }"
                  :class="achievement.rarity"
                ></div>
              </div>
              <div class="progress-text">
                <template v-if="achievement.is_earned">
                  <i class="fa fa-check-circle"></i>
                  Получено {{ formatDate(achievement.earned_at) }}
                </template>
                <template v-else>
                  {{ achievement.current_value.toFixed(0) }} / {{ achievement.target_value.toFixed(0) }}
                  <span class="progress-percent">({{ achievement.percentage.toFixed(0) }}%)</span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fa fa-trophy"></i>
          <p>Нет достижений</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api/axios.js';

const loading = ref(true);
const achievements = ref([]);
const categories = ref([]);  // standards
const standardsMap = ref({});  // id -> standard
const selectedStandard = ref('');
const showOnlyEarned = ref(false);

const earnedCount = computed(() => {
  return achievements.value.filter(a => a.is_earned).length;
});

const totalCount = computed(() => {
  return achievements.value.length;
});

const filteredAchievements = computed(() => {
  let result = achievements.value;
  
  if (showOnlyEarned.value) {
    result = result.filter(a => a.is_earned);
  }
  
  return result;
});

function getRarityLabel(rarity) {
  const labels = {
    common: 'Обычное',
    rare: 'Редкое',
    epic: 'Эпическое',
    legendary: 'Легендарное',
  };
  return labels[rarity] || rarity;
}

function getCategoryIcon(achievement) {
  // Try to get category from standard
  const standard = standardsMap.value[achievement.standard_id];
  const category = standard?.category;
  
  const icons = {
    pushups: 'fa fa-hand-rock',
    pullups: 'fa fa-arrow-up',
    squats: 'fa fa-child',
    crunches: 'fa fa-spinner',
    running: 'fa fa-running',
    dips: 'fa fa-arrows-v',
    abs: 'fa fa-minus',
    abs_dips: 'fa fa-arrows-alt',
    jump_rope: 'fa fa-circle-notch',
    plank: 'fa fa-arrows-h',
    burpees: 'fa fa-bolt',
    calves: 'fa fa-angle-double-up',
    bench_press: 'fa fa-dumbbell',
    weighted_squats: 'fa fa-dumbbell',
    deadlift: 'fa fa-dumbbell',
    biceps_curl: 'fa fa-dumbbell',
    weighted_pullups: 'fa fa-dumbbell',
    weighted_dips: 'fa fa-dumbbell',
    streak: 'fa fa-fire',
    meta: 'fa fa-star',
  };
  return icons[category] || 'fa fa-medal';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'сегодня';
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
  return `${Math.floor(diffDays / 365)} г. назад`;
}

async function fetchAchievements() {
  try {
    const response = await api.get('/achievements/');
    achievements.value = response.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
  }
}

async function fetchAchievementsByStandard(standardId) {
  try {
    const response = await api.get(`/achievements/standard/${standardId}/`);
    achievements.value = response.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
  }
}

function onStandardChange() {
  if (selectedStandard.value) {
    fetchAchievementsByStandard(selectedStandard.value);
  } else {
    fetchAchievements();
  }
}

async function fetchStandards() {
  try {
    const response = await api.get('/standards/');
    categories.value = response.data;
    // Build map for icon lookup
    standardsMap.value = response.data.reduce((acc, std) => {
      acc[std.id] = std;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching standards:', error);
  }
}

async function fetchData() {
  loading.value = true;
  await Promise.all([
    fetchAchievements(),
    fetchStandards(),
  ]);
  loading.value = false;
}

onMounted(fetchData);
</script>

<style scoped>
.achievements-page {
  padding: 4px;
  display: flex;
  justify-content: center;
}

.achievements-container {
  width: 100%;
  max-width: 900px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
}

.earned-count {
  margin-left: auto;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
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

.filters-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group:first-child {
  flex: 1;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 10px 12px;
  font-size: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
  min-width: 180px;
}

.filter-select:focus {
  border-color: #007bff;
}

.toggle-filter {
  display: flex;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
}

.toggle-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover:not(.active) {
  color: #007bff;
}

.toggle-btn.active {
  background: #007bff;
  color: white;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.achievement-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  opacity: 0.6;
  filter: grayscale(1);
  transition: all 0.3s ease;
}

.achievement-card.earned {
  opacity: 1;
  filter: none;
}

.achievement-card.not-viewed {
  box-shadow: 0 2px 12px rgba(0, 123, 255, 0.2);
  border: 2px solid rgba(0, 123, 255, 0.4);
}

.new-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  background: #007bff;
  color: white;
}

.achievement-rarity {
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

.achievement-rarity.common {
  background: #f3f4f6;
  color: #6b7280;
}

.achievement-rarity.rare {
  background: #dbeafe;
  color: #1d4ed8;
}

.achievement-rarity.epic {
  background: #f3e8ff;
  color: #7c3aed;
}

.achievement-rarity.legendary {
  background: #fef3c7;
  color: #b45309;
}

.achievement-icon {
  width: 48px;
  height: 48px;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.achievement-icon i {
  font-size: 20px;
  color: #6b7280;
}

.achievement-card.earned .achievement-icon {
  background: #e9f0ff;
}

.achievement-card.earned .achievement-icon i {
  color: #007bff;
}

.achievement-info {
  margin-bottom: 12px;
}

.achievement-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.achievement-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.achievement-progress {
  margin-top: auto;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.common {
  background: #6b7280;
}

.progress-fill.rare {
  background: #007bff;
}

.progress-fill.epic {
  background: #9b59b6;
}

.progress-fill.legendary {
  background: #ffc107;
}

.progress-text {
  font-size: 11px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.achievement-card.earned .progress-text {
  color: #28a745;
}

.progress-text i {
  font-size: 12px;
}

.progress-percent {
  color: #9ca3af;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fff;
  border-radius: 12px;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #dee2e6;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

@media (max-width: 600px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group:first-child {
    flex: none;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .earned-count {
    margin-left: 0;
    margin-top: 8px;
  }
  
  .page-title {
    flex-wrap: wrap;
  }
}
</style>
