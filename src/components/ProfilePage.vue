<template>
  <div class="profile-wrapper">
    <div class="profile-card">
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Загрузка профиля...</p>
      </div>
      
      <template v-else>
        <div class="profile-header">
          <div class="avatar">
            <span class="avatar-initials">{{ userInitials }}</span>
          </div>
          <h1 class="username">{{ user.username }}</h1>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">{{ user.total_liabilities || 0 }}</div>
            <div class="stat-label">Долг</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatMemberSince(user.created_at) }}</div>
            <div class="stat-label">Дата регистрации</div>
          </div>
        </div>

        <div class="divider">
          <span class="divider-text">Настройки</span>
        </div>

        <form @submit.prevent="handleSave" class="settings-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fa fa-balance-scale"></i>
              Вес (кг)
            </label>
            <input
              v-model.number="form.weight"
              type="number"
              step="0.1"
              min="1"
              max="500"
              class="form-input"
              placeholder="Введите вес"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fa fa-user"></i>
              Пол
            </label>
            <div class="toggle-group">
              <button
                type="button"
                class="toggle-btn"
                :class="{ active: form.sex === 'male' }"
                @click="form.sex = 'male'"
              >
                <i class="fa fa-mars"></i>
                Мужской
              </button>
              <button
                type="button"
                class="toggle-btn"
                :class="{ active: form.sex === 'female' }"
                @click="form.sex = 'female'"
              >
                <i class="fa fa-venus"></i>
                Женский
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="save-button"
            :disabled="saving"
          >
            <span v-if="saving" class="btn-spinner"></span>
            <span v-else>
              <i class="fa fa-floppy-o"></i>
              Сохранить изменения
            </span>
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import api from '../api/axios.js';

const loading = ref(true);
const saving = ref(false);
const user = ref({});

const form = ref({
  weight: 70,
  sex: 'male',
});

const userInitials = computed(() => {
  if (!user.value.username) return '?';
  return user.value.username.substring(0, 2).toUpperCase();
});

function formatMemberSince(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    month: 'short',
    year: 'numeric',
  });
}

async function fetchUser() {
  loading.value = true;
  try {
    const response = await api.get('/users/me/');
    user.value = response.data;
    form.value = {
      weight: response.data.weight || 70,
      sex: response.data.sex || 'male',
    };
    localStorage.setItem('user_weight', response.data.weight || 70);
    localStorage.setItem('user_sex', response.data.sex || 'male');
  } catch (error) {
    console.error('Ошибка при загрузке профиля:', error);
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  saving.value = true;
  try {
    const payload = {};
    if (form.value.weight) payload.weight = form.value.weight;
    if (form.value.sex) payload.sex = form.value.sex;

    const response = await api.patch('/users/me/', payload);
    user.value = response.data;
    localStorage.setItem('user_weight', response.data.weight || 70);
    localStorage.setItem('user_sex', response.data.sex || 'male');
    toast.success('Профиль успешно обновлён!', {
      position: toast.POSITION.BOTTOM_RIGHT,
      autoClose: 3000,
    });
  } catch (error) {
    console.error('Ошибка при сохранении:', error);
    toast.error('Ошибка при сохранении профиля', {
      position: toast.POSITION.BOTTOM_RIGHT,
      autoClose: 3000,
    });
  } finally {
    saving.value = false;
  }
}

onMounted(fetchUser);
</script>

<style scoped>
.profile-wrapper {
  min-height: calc(100vh - 100px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 8px;
}

.profile-card {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 123, 255, 0.3);
}

.avatar-initials {
  color: white;
  font-size: 36px;
  font-weight: 700;
  text-transform: uppercase;
}

.username {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(0, 123, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.15);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #007bff;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 30px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
}

.divider-text {
  padding: 0 16px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-label i {
  color: #007bff;
  width: 16px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  color: #333;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #007bff;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.toggle-group {
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.toggle-btn {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.toggle-btn:hover:not(.active) {
  background: #e9f0ff;
  color: #007bff;
}

.toggle-btn.active {
  background: #007bff;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.save-button {
  margin-top: 10px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: #007bff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 123, 255, 0.3);
}

.save-button:active:not(:disabled) {
  transform: translateY(0);
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@media (max-width: 540px) {
  .profile-card {
    padding: 30px 24px;
  }
  
  .username {
    font-size: 24px;
  }
  
  .avatar {
    width: 80px;
    height: 80px;
  }
  
  .avatar-initials {
    font-size: 28px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .toggle-btn {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
