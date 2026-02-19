<template>
  <div class="create-page">
    <div class="create-container">
      <h1 class="page-title">
        <i class="fa fa-check-circle"></i>
        Списать долг
      </h1>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div v-for="category in categories" :key="category.id" class="category-section">
          <div class="category-header" @click="toggleCategory(category.id)">
            <div class="category-title">
              <i :class="category.icon"></i>
              {{ category.label }}
            </div>
            <i :class="expandedCategories.includes(category.id) ? 'fa fa-chevron-up' : 'fa fa-chevron-down'"></i>
          </div>
          
          <div v-show="expandedCategories.includes(category.id)" class="standards-grid">
            <div
              v-for="standard in getStandardsByCategory(category.id)"
              :key="standard.id"
              class="standard-card"
              :class="{ 'weight-card': category.hasWeight }"
              @click="openModal(standard, category.hasWeight)"
            >
              <div class="standard-name">{{ standard.name }}</div>
              <div v-if="standard.count" class="standard-info">
                {{ standard.count }} шт = 1 норм
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ selectedStandard?.name }}</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-field">
            <label for="count">Количество повторений</label>
            <input
              id="count"
              v-model.number="form.count"
              type="number"
              min="1"
              class="modal-input"
              placeholder="Введите количество"
              autofocus
            />
          </div>

          <div v-if="hasWeight" class="modal-field">
            <label for="weight">Вес снаряда (кг)</label>
            <input
              id="weight"
              v-model.number="form.weight"
              type="number"
              min="1"
              step="0.5"
              class="modal-input"
              placeholder="Введите вес"
            />
          </div>

          <div class="norms-preview">
            <i class="fa fa-calculator"></i>
            <span>≈ {{ calculatedNorms }} норм</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeModal">Отмена</button>
          <button class="modal-btn save" @click="saveStandard" :disabled="saving || !form.count">
            <span v-if="saving" class="btn-spinner-small"></span>
            <span v-else>Сохранить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import api from '../api/axios.js';

const loading = ref(true);
const saving = ref(false);
const standards = ref([]);
const expandedCategories = ref(['calisthenics', 'weightlifting']);

const modalVisible = ref(false);
const selectedStandard = ref(null);
const hasWeight = ref(false);
const form = ref({
  count: null,
  weight: null,
});

const categories = [
  {
    id: 'calisthenics',
    label: 'Калистеника',
    icon: 'fa fa-child',
    hasWeight: false,
  },
  {
    id: 'weightlifting',
    label: 'Тяжёлая атлетика',
    icon: 'fa fa-plus-circle',
    hasWeight: true,
  }
];

const calculatedNorms = computed(() => {
  if (!form.value.count || !selectedStandard.value) return 0;
  
  const count = form.value.count;
  const standardCount = selectedStandard.value.count || 1;
  
  if (hasWeight.value && form.value.weight) {
    return (count * form.value.weight / 30).toFixed(1);
  }
  
  return (count / standardCount).toFixed(1);
});

function getStandardsByCategory(categoryId) {
  return standards.value.filter(standard => standard.category === categoryId);
}

function toggleCategory(categoryId) {
  const index = expandedCategories.value.indexOf(categoryId);
  if (index > -1) {
    expandedCategories.value.splice(index, 1);
  } else {
    expandedCategories.value.push(categoryId);
  }
}

function openModal(standard, weightRequired) {
  selectedStandard.value = standard;
  hasWeight.value = weightRequired;
  form.value = {
    count: null,
    weight: null,
  };
  modalVisible.value = true;
}

function closeModal() {
  modalVisible.value = false;
  selectedStandard.value = null;
  hasWeight.value = false;
  form.value = {
    count: null,
    weight: null,
  };
}

async function fetchStandards() {
  try {
    const response = await api.get('/standards/');
    standards.value = response.data;
  } catch (error) {
    console.error('Error fetching standards:', error);
    toast.error('Ошибка при загрузке упражнений');
  } finally {
    loading.value = false;
  }
}

async function saveStandard() {
  if (!selectedStandard.value || !form.value.count) return;
  if (hasWeight.value && !form.value.weight) {
    toast.warning('Введите вес снаряда');
    return;
  }

  saving.value = true;
  try {
    const completedType = localStorage.getItem('completed_type') || 'count';
    const payload = {
      standard_id: selectedStandard.value.id,
      count: form.value.count,
      completed_type: completedType,
    };

    if (hasWeight.value && form.value.weight) {
      payload.weight = form.value.weight;
      payload.user_weight = parseFloat(localStorage.getItem('user_weight') || '70');
    }

    await api.post('/completed_standards/', payload);
    toast.success('Сохранено!', { autoClose: 2000 });
    closeModal();
  } catch (error) {
    console.error('Error saving:', error);
    toast.error('Ошибка при сохранении');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchStandards();
});
</script>

<style scoped>
.create-page {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.create-container {
  width: 100%;
  max-width: 600px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title i {
  color: #007bff;
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

.category-section {
  margin-bottom: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  background: #f8f9fa;
  transition: background 0.2s ease;
}

.category-header:hover {
  background: #e9f0ff;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.category-title i {
  color: #007bff;
}

.category-header > i {
  color: #6b7280;
  font-size: 14px;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  padding: 16px;
}

.standard-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.standard-card:hover {
  background: #e9f0ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}

.standard-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.standard-info {
  font-size: 12px;
  color: #6b7280;
}

.weight-card {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.weight-card:hover {
  background: linear-gradient(135deg, #ffe8e8 0%, #fff 100%);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  margin: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-field {
  margin-bottom: 16px;
}

.modal-field:last-child {
  margin-bottom: 0;
}

.modal-field label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.modal-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s ease;
}

.modal-input:focus {
  border-color: #007bff;
}

.modal-input::placeholder {
  color: #9ca3af;
}

.norms-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  margin-top: 16px;
  color: #007bff;
  font-size: 16px;
  font-weight: 600;
}

.norms-preview i {
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.modal-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn.cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-btn.cancel:hover {
  background: #e5e7eb;
}

.modal-btn.save {
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
  justify-content: center;
}

.modal-btn.save:hover:not(:disabled) {
  background: #0056b3;
}

.modal-btn.save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@media (max-width: 500px) {
  .standards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 12px;
  }
  
  .standard-card {
    padding: 12px;
    min-height: 70px;
  }
  
  .modal-content {
    margin: 10px;
  }
}
</style>
