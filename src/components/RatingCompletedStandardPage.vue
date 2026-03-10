<template>
  <div class="rating-page">
    <div class="rating-container">
      <h1 class="page-title">
        Рейтинг
      </h1>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div class="filters-section">
          <div class="filter-row">
            <div class="filter-group">
              <label class="filter-label">Упражнение</label>
              <select v-model="selectedStandard" class="filter-select">
                <option v-for="standard in standards" :key="standard.name" :value="standard.name">
                  {{ standard.name }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Период</label>
              <select v-model="selectedPeriod" class="filter-select" @change="fetchUserRating">
                <option v-for="period in periods" :key="period.value" :value="period.value">
                  {{ period.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="selectedUserRatings.length > 0" class="list-section">
          <div
            v-for="(user, index) in selectedUserRatings"
            :key="user.username"
            class="user-card-wrapper"
            :class="{ 'current-user': isCurrentUser(user.username) }"
          >
            <div 
              class="user-card"
              :class="{ clickable: selectedStandard === 'Все упражнения' && getUserDetails(user.username).length > 0 }"
              @click="toggleUserDetails(user.username)"
            >
              <div class="user-rank" :class="getRankClass(index)">
                <template v-if="index < 3">
                  <span v-if="index === 0">🥇</span>
                  <span v-else-if="index === 1">🥈</span>
                  <span v-else>🥉</span>
                </template>
                <template v-else>{{ index + 1 }}</template>
              </div>
              <div class="user-info">
                <span class="user-name">
                  {{ user.username }}
                  <span v-if="isCurrentUser(user.username)" class="you-badge">Вы</span>
                </span>
              </div>
              <div class="user-value">
                {{ Math.round(user.standards) }} н
                <i 
                  v-if="selectedStandard === 'Все упражнения' && getUserDetails(user.username).length > 0" 
                  class="fa fa-chevron-down expand-icon"
                  :class="{ expanded: expandedUser === user.username }"
                ></i>
              </div>
            </div>
            
            <div 
              v-if="selectedStandard === 'Все упражнения' && expandedUser === user.username && getUserDetails(user.username).length > 0"
              class="user-details"
            >
              <div 
                v-for="detail in getUserDetails(user.username)" 
                :key="detail.name"
                class="detail-row"
              >
                <span class="detail-name">{{ detail.name }}</span>
                <span class="detail-value">{{ Math.round(detail.value) }} н</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fa fa-trophy"></i>
          <p>Нет данных за выбранный период</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '../api/axios.js';

const loading = ref(true);
const userRatings = ref([]);
const standards = ref([]);
const selectedStandard = ref('Все упражнения');
const selectedPeriod = ref(7);
const currentUsername = ref('');
const completedStandardInfo = ref({});
const expandedUser = ref(null);

const periods = [
  { label: 'День', value: 1 },
  { label: 'Неделя', value: 7 },
  { label: 'Месяц', value: 30 },
  { label: 'Всё время', value: null },
];

const selectedUserRatings = computed(() => {
  const rating = userRatings.value.find(item => item.standard_name === selectedStandard.value);
  return rating?.user_ratings || [];
});

function getRankClass(index) {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return 'bronze';
  return '';
}

function isCurrentUser(username) {
  return username === currentUsername.value;
}

function getUserDetails(username) {
  const info = completedStandardInfo.value[username];
  if (!info) return [];
  return info;
}

function toggleUserDetails(username) {
  if (selectedStandard.value !== 'Все упражнения') return;
  if (getUserDetails(username).length === 0) return;
  
  expandedUser.value = expandedUser.value === username ? null : username;
}

watch(selectedStandard, () => {
  expandedUser.value = null;
});

async function fetchCurrentUser() {
  try {
    const response = await api.get('/users/me/');
    currentUsername.value = response.data.username;
  } catch (error) {
    console.error('Error fetching current user:', error);
  }
}

async function fetchUserRating() {
  try {
    const params = selectedPeriod.value ? { period_days: selectedPeriod.value } : {};
    const response = await api.get('/completed_standards/rating/', { params });
    userRatings.value = response.data;
    setCompletedStandardInfo();
    expandedUser.value = null;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
  }
}

function setCompletedStandardInfo() {
  const result = {};
  userRatings.value.forEach(item => {
    item.user_ratings.forEach(rating => {
      const username = rating.username;
      const standardName = item.standard_name;
      const standards = rating.standards;
      if (standardName === "Все упражнения") {
        return;
      }
      if (!result[username]) {
        result[username] = [];
      }
      result[username].push({ name: standardName, value: standards });
    });
  });

  completedStandardInfo.value = result;
}

async function fetchStandards() {
  try {
    const response = await api.get('/standards/');
    standards.value = [{ name: 'Все упражнения' }, ...response.data];
  } catch (error) {
    console.error('Error fetching standards:', error);
  }
}

async function fetchData() {
  loading.value = true;
  await Promise.all([
    fetchCurrentUser(),
    fetchStandards(),
    fetchUserRating(),
  ]);
  loading.value = false;
}

onMounted(fetchData);
</script>

<style scoped>
.rating-page {
  padding: 8px;
  display: flex;
  justify-content: center;
}

.rating-container {
  width: 100%;
  max-width: 600px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 24px 0;
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
  gap: 12px;
}

.filter-group {
  flex: 1;
}

.filter-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  border-color: #007bff;
}

.list-section {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-card-wrapper {
  border-bottom: 1px solid #f0f0f0;
}

.user-card-wrapper:last-child {
  border-bottom: none;
}

.user-card-wrapper.current-user {
  background: #e9f0ff;
  border-left: 3px solid #007bff;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  transition: background 0.2s ease;
}

.user-card.clickable {
  cursor: pointer;
}

.user-card.clickable:hover {
  background: rgba(0, 0, 0, 0.03);
}

.user-card-wrapper.current-user .user-card.clickable:hover {
  background: rgba(0, 123, 255, 0.05);
}

.user-rank {
  width: 32px;
  height: 32px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin-right: 12px;
  flex-shrink: 0;
}

.user-rank.gold {
  background: #fff3cd;
  font-size: 18px;
}

.user-rank.silver {
  background: #e9ecef;
  font-size: 18px;
}

.user-rank.bronze {
  background: #ffe0b2;
  font-size: 18px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.you-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #007bff;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
}

.user-value {
  font-size: 14px;
  font-weight: 600;
  color: #007bff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  font-size: 12px;
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.user-details {
  background: #f8f9fa;
  padding: 12px 16px 12px 60px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.detail-row:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.detail-name {
  color: #6b7280;
}

.detail-value {
  font-weight: 600;
  color: #333;
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

@media (max-width: 500px) {
  .filter-row {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
