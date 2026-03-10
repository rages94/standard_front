<template>
  <div class="create-page">
    <div class="create-container">
      <h1 class="page-title">
        Записать долг
      </h1>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div class="templates-list">
          <div
            v-for="template in liabilityTemplates"
            :key="template.id"
            class="template-card"
          >
            <div class="template-info">
              <div class="template-name">{{ template.name }}</div>
              <div v-if="template.count" class="template-norm">
                {{ template.count }} норм
              </div>
            </div>
            <div class="template-actions">
              <input
                v-model.number="template.inputValue"
                type="number"
                min="0"
                class="template-input"
                placeholder="0"
              />
              <button class="action-btn delete-btn" @click="confirmDelete(template)" title="Удалить">
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </div>

          <div v-if="liabilityTemplates.length === 0" class="empty-state">
            <i class="fa fa-inbox"></i>
            <p>Нет шаблонов долгов</p>
          </div>
        </div>

        <div class="actions-section">
          <button class="save-btn" :disabled="isLoading" @click="saveLiabilities">
            <span v-if="isLoading" class="btn-spinner"></span>
            <span v-else>Сохранить</span>
          </button>
        </div>
        
        <div class="create-section">
          <button class="create-link-btn" @click="showModal = true">
            <i class="fa fa-plus-circle"></i>
            Создать новый долг
          </button>
        </div>
      </template>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Создать новый долг</h3>
          <button class="modal-close" @click="showModal = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-field">
            <label>Название долга</label>
            <input v-model="newTemplateName" class="modal-input" placeholder="Например: Пропуск тренировки" />
          </div>
          <div class="modal-field">
            <label>Количество норм</label>
            <input v-model.number="newCount" type="number" min="1" class="modal-input" placeholder="1" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showModal = false">Отмена</button>
          <button class="modal-btn save" @click="createLiabilityTemplate">Сохранить</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h3>Удалить долг?</h3>
        </div>
        <div class="modal-body">
          <p class="delete-text">
            Вы уверены, что хотите удалить долг <strong>{{ templateToDelete?.name }}</strong>?
          </p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showDeleteConfirm = false">Отмена</button>
          <button class="modal-btn delete" @click="deleteTemplate">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import api from '../api/axios.js';

const loading = ref(true);
const isLoading = ref(false);
const liabilityTemplates = ref([]);
const showModal = ref(false);
const newTemplateName = ref('');
const newCount = ref(1);
const showDeleteConfirm = ref(false);
const templateToDelete = ref(null);

async function fetchLiabilityTemplates() {
  try {
    const response = await api.get('/liability_templates/');
    liabilityTemplates.value = response.data.map((template) => ({
      ...template,
      inputValue: 0,
    }));
  } catch (error) {
    console.error('Error fetching liability templates:', error);
  } finally {
    loading.value = false;
  }
}

async function saveLiabilities() {
  try {
    isLoading.value = true;
    for (const template of liabilityTemplates.value) {
      if (template.inputValue > 0) {
        await api.post('/liabilities/', {
          liability_template_id: template.id,
          count: template.inputValue,
        });
        template.inputValue = 0;
      }
    }
    toast.success('Сохранено!', { position: toast.POSITION.BOTTOM_RIGHT, autoClose: 2000 });
  } catch (error) {
    console.error('Error saving liabilities:', error);
    toast.error('Ошибка при сохранении', { position: toast.POSITION.BOTTOM_RIGHT, autoClose: 2000 });
  } finally {
    isLoading.value = false;
  }
}

async function createLiabilityTemplate() {
  if (!newTemplateName.value.trim()) return;
  try {
    const res = await api.post('/liability_templates/', {
      name: newTemplateName.value,
      count: newCount.value,
    });
    liabilityTemplates.value.push({ ...res.data, inputValue: 0 });
    newTemplateName.value = '';
    newCount.value = 1;
    showModal.value = false;
    toast.success('Шаблон создан!', { position: toast.POSITION.BOTTOM_RIGHT, autoClose: 2000 });
  } catch (err) {
    console.error('Ошибка при создании шаблона', err);
    toast.error('Ошибка при создании', { position: toast.POSITION.BOTTOM_RIGHT, autoClose: 2000 });
  }
}

async function deleteTemplate() {
  if (!templateToDelete.value) return;
  try {
    await api.delete(`/liability_templates/${templateToDelete.value.id}`);
    liabilityTemplates.value = liabilityTemplates.value.filter(t => t.id !== templateToDelete.value.id);
    templateToDelete.value = null;
    showDeleteConfirm.value = false;
    toast.success('Шаблон удалён!', { position: toast.POSITION.BOTTOM_RIGHT, autoClose: 2000 });
  } catch (error) {
    console.error('Ошибка при удалении шаблона', error);
    toast.error('Ошибка при удалении', { position: toast.POSITION.BOTTOM_RIGHT, autoClose: 2000 });
  }
}

function confirmDelete(template) {
  templateToDelete.value = template;
  showDeleteConfirm.value = true;
}

onMounted(fetchLiabilityTemplates);
</script>

<style scoped>
.create-page {
  padding: 8px;
  display: flex;
  justify-content: center;
}

.create-container {
  width: 100%;
  max-width: 480px;
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

.templates-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.template-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}

.template-card:last-child {
  border-bottom: none;
}

.template-card:hover {
  background: #f8f9fa;
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.template-norm {
  font-size: 13px;
  color: #6b7280;
}

.template-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-input {
  width: 80px;
  padding: 10px 12px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  outline: none;
  transition: border-color 0.2s ease;
}

.template-input:focus {
  border-color: #007bff;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f3f4f6;
}

.delete-btn:hover {
  color: #dc3545;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.save-btn {
  width: 100%;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #007bff;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #0056b3;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-section {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.create-link-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.create-link-btn:hover {
  background: #e9f0ff;
}

.create-link-btn i {
  font-size: 12px;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 40px;
  margin-bottom: 12px;
  color: #dee2e6;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
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

.modal-small {
  max-width: 360px;
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
  font-size: 15px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s ease;
}

.modal-input:focus {
  border-color: #007bff;
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
}

.modal-btn.save:hover {
  background: #0056b3;
}

.modal-btn.delete {
  background: #dc3545;
  color: white;
}

.modal-btn.delete:hover {
  background: #c82333;
}

.delete-text {
  margin: 0;
  color: #374151;
  font-size: 14px;
}

@media (max-width: 500px) {
  .template-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .template-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
