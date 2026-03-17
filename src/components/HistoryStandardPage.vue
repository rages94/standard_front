<template>
  <div class="history-page">
    <div class="history-container">
      <h1 class="page-title">
        История
      </h1>

      <div class="toggle-tabs">
        <button
          class="toggle-tab"
          :class="{ active: activeTab === 'completed' }"
          @click="activeTab = 'completed'"
        >
          <i class="fa fa-check-circle"></i>
          Списания
        </button>
        <button
          class="toggle-tab"
          :class="{ active: activeTab === 'liabilities' }"
          @click="activeTab = 'liabilities'"
        >
          <i class="fa fa-exclamation-circle"></i>
          Долги
        </button>
        <button
          class="toggle-tab"
          :class="{ active: activeTab === 'credits' }"
          @click="activeTab = 'credits'"
        >
          <i class="fa fa-trophy"></i>
          Зачеты
        </button>
      </div>

      <div class="content-section">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
        </div>

        <template v-else>
          <div v-if="activeTab === 'completed'" class="cards-grid">
            <div
              v-for="item in completed_standards"
              :key="item.id"
              class="history-card completed-card"
            >
              <div class="card-content">
                <div class="card-header">
                  <div class="card-title">{{ item.standard?.name || 'Упражнение' }}</div>
                  <div class="card-actions">
                    <button class="action-btn edit-btn" @click="openEditModal(item)" title="Редактировать">
                      <i class="fa fa-pencil"></i>
                    </button>
                    <button class="action-btn delete-btn" @click="confirmDelete(item)" title="Удалить">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="card-details">
                  <template v-if="item.standard?.category === 'weightlifting' && item.weight">
                    <span class="detail-main highlight">
                      <strong>{{ item.count }} × {{ item.weight }}</strong> кг
                    </span>
                  </template>
                  <template v-else>
                    <span class="detail-main highlight">
                      <strong>{{ item.count }}</strong> шт
                    </span>
                  </template>
                  <span class="detail-sub">
                    ({{ item.total_norm ? Number(item.total_norm).toFixed(2) : 0 }} н)
                  </span>
                </div>
                <div class="card-date">{{ formatDate(item.created_at) }}</div>
              </div>
            </div>
            <div v-if="completed_standards.length === 0" class="empty-state">
              <i class="fa fa-inbox"></i>
              <p>Нет записей</p>
            </div>
          </div>

          <div v-if="activeTab === 'liabilities'" class="cards-grid">
            <div
              v-for="item in liabilities"
              :key="item.id"
              class="history-card liability-card"
            >
              <div class="card-content">
                <div class="card-header">
                  <div class="card-title">
                    {{ item.liability_template?.name || 'Пользовательское' }}
                  </div>
                  <div class="card-actions">
                    <button class="action-btn edit-btn" @click="openEditLiabilityModal(item)" title="Редактировать">
                      <i class="fa fa-pencil"></i>
                    </button>
                    <button class="action-btn delete-btn" @click="confirmDeleteLiability(item)" title="Удалить">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="card-details">
                  <span class="detail-main negative">
                    <strong>{{ item.count }}</strong>
                  </span>
                  <span class="detail-sub">
                    ({{ item.liability_template
                        ? item.count * item.liability_template.count
                        : item.count }} н)
                  </span>
                </div>
                <div class="card-date">{{ formatDate(item.created_at) }}</div>
              </div>
            </div>
            <div v-if="liabilities.length === 0" class="empty-state">
              <i class="fa fa-inbox"></i>
              <p>Нет записей</p>
            </div>
          </div>

          <div v-if="activeTab === 'credits'" class="cards-grid">
            <div
              v-for="item in credits"
              :key="item.id"
              class="history-card credit-card"
            >
              <div class="card-header-row">
                <span
                  class="status-badge"
                  :class="{
                    'status-success': item.completed === true,
                    'status-failed': item.completed === false,
                    'status-pending': item.completed === null
                  }"
                >
                  <i
                    :class="{
                      'fa fa-check': item.completed === true,
                      'fa fa-times': item.completed === false,
                      'fa fa-hourglass-half': item.completed === null
                    }"
                  ></i>
                  {{ item.completed === true ? 'Выполнено' : item.completed === false ? 'Провалено' : 'В процессе' }}
                </span>
              </div>
              <div class="card-content">
                <div class="credit-stats">
                  <div class="stat-row">
                    <span class="stat-label">Норм в зачете:</span>
                    <span class="stat-value">{{ Number(item.count).toFixed(1) }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Выполнено:</span>
                    <span class="stat-value">{{ Number(item.completed_count).toFixed(1) }}</span>
                  </div>
                </div>
                <div class="card-period">
                  <i class="fa fa-calendar"></i>
                  {{ formatDate(item.created_at) }} - {{ formatDate(item.deadline_date) }}
                </div>
                <div v-if="item.completed_at" class="card-completed">
                  <i class="fa fa-clock"></i>
                  Завершено: {{ formatDate(item.completed_at) }}
                </div>
              </div>
            </div>
            <div v-if="credits.length === 0" class="empty-state">
              <i class="fa fa-inbox"></i>
              <p>Нет записей</p>
            </div>
          </div>

          <div v-if="currentItems.length > 0 && totalPages > 1" class="pagination-wrapper">
            <div class="custom-pagination">
              <button
                class="page-btn"
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
              >
                <i class="fa fa-chevron-left"></i>
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                class="page-btn"
                :class="{ active: page === currentPage, dots: page === '...' }"
                :disabled="page === '...'"
                @click="page !== '...' && changePage(page)"
              >
                {{ page }}
              </button>
              <button
                class="page-btn"
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
              >
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
            <div class="page-info">
              Страница {{ currentPage }} из {{ totalPages }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="editModalVisible" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Редактировать списание</h3>
          <button class="modal-close" @click="closeEditModal">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-field">
            <label>Упражнение</label>
            <div class="readonly-field">{{ editingItem?.standard?.name }}</div>
          </div>
          <div class="modal-field">
            <label for="edit-count">Количество</label>
            <input
              id="edit-count"
              v-model.number="editCount"
              type="number"
              min="1"
              class="modal-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeEditModal">Отмена</button>
          <button class="modal-btn save" @click="saveEdit" :disabled="saving">
            <span v-if="saving" class="btn-spinner-small"></span>
            <span v-else>Сохранить</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteModalVisible" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h3>Удалить списание?</h3>
        </div>
        <div class="modal-body">
          <p class="delete-text">
            {{ deletingItem?.standard?.name || 'Упражнение' }} — 
            <strong>{{ deletingItem?.count }}</strong> шт
          </p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeDeleteModal">Отмена</button>
          <button class="modal-btn delete" @click="confirmDeleteAction" :disabled="deleting">
            <span v-if="deleting" class="btn-spinner-small"></span>
            <span v-else>Удалить</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="editLiabilityModalVisible" class="modal-overlay" @click.self="closeEditLiabilityModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Редактировать долг</h3>
          <button class="modal-close" @click="closeEditLiabilityModal">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-field">
            <label>Название</label>
            <div class="readonly-field">{{ editingLiabilityItem?.liability_template?.name || 'Пользовательское' }}</div>
          </div>
          <div class="modal-field">
            <label for="edit-liability-count">Количество</label>
            <input
              id="edit-liability-count"
              v-model.number="editLiabilityCount"
              type="number"
              min="1"
              class="modal-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeEditLiabilityModal">Отмена</button>
          <button class="modal-btn save" @click="saveEditLiability" :disabled="savingLiability">
            <span v-if="savingLiability" class="btn-spinner-small"></span>
            <span v-else>Сохранить</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteLiabilityModalVisible" class="modal-overlay" @click.self="closeDeleteLiabilityModal">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h3>Удалить долг?</h3>
        </div>
        <div class="modal-body">
          <p class="delete-text">
            {{ deletingLiabilityItem?.liability_template?.name || 'Пользовательское' }} — 
            <strong>{{ deletingLiabilityItem?.count }}</strong> шт
          </p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeDeleteLiabilityModal">Отмена</button>
          <button class="modal-btn delete" @click="confirmDeleteLiabilityAction" :disabled="deletingLiability">
            <span v-if="deletingLiability" class="btn-spinner-small"></span>
            <span v-else>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import api from '../api/axios.js';

const activeTab = ref('completed');
const loading = ref(false);
const saving = ref(false);

const completed_standards = ref([]);
const csCount = ref(0);
const csLimit = ref(10);
const csCurrentPage = ref(1);

const liabilities = ref([]);
const lCount = ref(0);
const lLimit = ref(10);
const lCurrentPage = ref(1);

const credits = ref([]);
const cCount = ref(0);
const cLimit = ref(10);
const cCurrentPage = ref(1);

const editModalVisible = ref(false);
const editingItem = ref(null);
const editCount = ref(0);

const deleteModalVisible = ref(false);
const deletingItem = ref(null);
const deleting = ref(false);

const editLiabilityModalVisible = ref(false);
const editingLiabilityItem = ref(null);
const editLiabilityCount = ref(0);
const savingLiability = ref(false);

const deleteLiabilityModalVisible = ref(false);
const deletingLiabilityItem = ref(null);
const deletingLiability = ref(false);

const currentPage = computed({
  get: () => {
    if (activeTab.value === 'completed') return csCurrentPage.value;
    if (activeTab.value === 'liabilities') return lCurrentPage.value;
    return cCurrentPage.value;
  },
  set: (val) => {
    if (activeTab.value === 'completed') csCurrentPage.value = val;
    else if (activeTab.value === 'liabilities') lCurrentPage.value = val;
    else cCurrentPage.value = val;
  }
});

const currentCount = computed(() => {
  if (activeTab.value === 'completed') return csCount.value;
  if (activeTab.value === 'liabilities') return lCount.value;
  return cCount.value;
});

const currentLimit = computed(() => {
  if (activeTab.value === 'completed') return csLimit.value;
  if (activeTab.value === 'liabilities') return lLimit.value;
  return cLimit.value;
});

const currentItems = computed(() => {
  if (activeTab.value === 'completed') return completed_standards.value;
  if (activeTab.value === 'liabilities') return liabilities.value;
  return credits.value;
});

const totalPages = computed(() => {
  return Math.ceil(currentCount.value / currentLimit.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  
  return pages;
});

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
}

async function fetchCompletedStandards() {
  try {
    const response = await api.get(
      `/completed_standards/?limit=${csLimit.value}&offset=${(csCurrentPage.value - 1) * csLimit.value}`
    );
    completed_standards.value = response.data.data;
    csCount.value = response.data.count;
  } catch (error) {
    console.error('Error fetching completed standards:', error);
  }
}

async function fetchLiabilities() {
  try {
    const response = await api.get(
      `/liabilities/?limit=${lLimit.value}&offset=${(lCurrentPage.value - 1) * lLimit.value}`
    );
    liabilities.value = response.data.data;
    lCount.value = response.data.count;
  } catch (error) {
    console.error('Error fetching liabilities:', error);
  }
}

async function fetchCredits() {
  try {
    const response = await api.get(
      `/credits/?limit=${cLimit.value}&offset=${(cCurrentPage.value - 1) * cLimit.value}`
    );
    credits.value = response.data.data;
    cCount.value = response.data.count;
  } catch (error) {
    console.error('Error fetching credits:', error);
  }
}

async function loadData() {
  loading.value = true;
  if (activeTab.value === 'completed') await fetchCompletedStandards();
  else if (activeTab.value === 'liabilities') await fetchLiabilities();
  else await fetchCredits();
  loading.value = false;
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return;
  if (activeTab.value === 'completed') csCurrentPage.value = page;
  else if (activeTab.value === 'liabilities') lCurrentPage.value = page;
  else cCurrentPage.value = page;
  loadData();
}

watch(activeTab, () => {
  csCurrentPage.value = 1;
  lCurrentPage.value = 1;
  cCurrentPage.value = 1;
  if (currentItems.value.length === 0) {
    loadData();
  }
});

onMounted(() => {
  fetchCompletedStandards();
  fetchLiabilities();
  fetchCredits();
});

function openEditModal(item) {
  editingItem.value = item;
  editCount.value = item.count;
  editModalVisible.value = true;
}

function closeEditModal() {
  editModalVisible.value = false;
  editingItem.value = null;
  editCount.value = 0;
}

async function saveEdit() {
  if (!editingItem.value || editCount.value < 1) return;
  
  saving.value = true;
  try {
    await api.patch(`/completed_standards/${editingItem.value.id}`, {
      count: editCount.value
    });
    toast.success('Списание обновлено', { autoClose: 2000 });
    closeEditModal();
    await fetchCompletedStandards();
  } catch (error) {
    console.error('Error updating:', error);
    toast.error('Ошибка при обновлении', { autoClose: 2000 });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(item) {
  deletingItem.value = item;
  deleteModalVisible.value = true;
}

function closeDeleteModal() {
  deleteModalVisible.value = false;
  deletingItem.value = null;
}

async function confirmDeleteAction() {
  if (!deletingItem.value) return;
  
  deleting.value = true;
  try {
    await api.delete(`/completed_standards/${deletingItem.value.id}`);
    toast.success('Списание удалено', { autoClose: 2000 });
    closeDeleteModal();
    await fetchCompletedStandards();
  } catch (error) {
    console.error('Error deleting:', error);
    toast.error('Ошибка при удалении', { autoClose: 2000 });
  } finally {
    deleting.value = false;
  }
}

function openEditLiabilityModal(item) {
  editingLiabilityItem.value = item;
  editLiabilityCount.value = item.count;
  editLiabilityModalVisible.value = true;
}

function closeEditLiabilityModal() {
  editLiabilityModalVisible.value = false;
  editingLiabilityItem.value = null;
  editLiabilityCount.value = 0;
}

async function saveEditLiability() {
  if (!editingLiabilityItem.value || editLiabilityCount.value < 1) return;
  
  savingLiability.value = true;
  try {
    await api.patch(`/liabilities/${editingLiabilityItem.value.id}`, {
      count: editLiabilityCount.value
    });
    toast.success('Долг обновлён', { autoClose: 2000 });
    closeEditLiabilityModal();
    await fetchLiabilities();
  } catch (error) {
    console.error('Error updating liability:', error);
    toast.error('Ошибка при обновлении', { autoClose: 2000 });
  } finally {
    savingLiability.value = false;
  }
}

function confirmDeleteLiability(item) {
  deletingLiabilityItem.value = item;
  deleteLiabilityModalVisible.value = true;
}

function closeDeleteLiabilityModal() {
  deleteLiabilityModalVisible.value = false;
  deletingLiabilityItem.value = null;
}

async function confirmDeleteLiabilityAction() {
  if (!deletingLiabilityItem.value) return;
  
  deletingLiability.value = true;
  try {
    await api.delete(`/liabilities/${deletingLiabilityItem.value.id}`);
    toast.success('Долг удалён', { autoClose: 2000 });
    closeDeleteLiabilityModal();
    await fetchLiabilities();
  } catch (error) {
    console.error('Error deleting liability:', error);
    toast.error('Ошибка при удалении', { autoClose: 2000 });
  } finally {
    deletingLiability.value = false;
  }
}
</script>

<style scoped>
.history-page {
  padding: 4px;
  display: flex;
  justify-content: center;
}

.history-container {
  width: 100%;
  max-width: 800px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 24px 0;
}

.toggle-tabs {
  display: flex;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
  margin-bottom: 24px;
}

.toggle-tab {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.toggle-tab:hover:not(.active) {
  background: #e9f0ff;
  color: #007bff;
}

.toggle-tab.active {
  background: #007bff;
  color: white;
}

.content-section {
  min-height: 300px;
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

.cards-grid {
  display: grid;
  gap: 8px;
}

.history-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.completed-card .card-icon {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.liability-card .card-icon {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.credit-card {
  flex-direction: column;
  align-items: stretch;
}

.card-header-row {
  display: flex;
  justify-content: flex-end;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 0;
}

.card-details {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.detail-main {
  font-size: 16px;
}

.detail-main strong {
  font-weight: 700;
  font-size: 18px;
}

.detail-main.highlight strong {
  color: #000000;
}

.detail-main.negative strong {
  color: #000000;
}

.detail-sub {
  font-size: 13px;
  color: #9ca3af;
}

.detail-item {
  font-size: 14px;
  color: #6b7280;
}

.detail-item strong {
  font-weight: 600;
  color: #333;
}

.detail-item.highlight strong {
  color: #28a745;
}

.detail-item.highlight.negative strong {
  color: #dc3545;
}

.detail-divider {
  color: #9ca3af;
}

.card-date {
  font-size: 12px;
  color: #9ca3af;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.status-success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-failed {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.status-pending {
  background: rgba(255, 193, 7, 0.1);
  color: #d39e00;
}

.credit-stats {
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.card-period,
.card-completed {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.card-period i,
.card-completed i {
  color: #007bff;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.custom-pagination {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #007bff;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #e9f0ff;
  border-color: #007bff;
}

.page-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.page-btn:disabled {
  color: #adb5bd;
  background: #fff;
  border-color: #dee2e6;
  cursor: not-allowed;
}

.page-btn.dots {
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: default;
}

.page-info {
  font-size: 13px;
  color: #6b7280;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
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

.edit-btn:hover {
  color: #007bff;
}

.delete-btn:hover {
  color: #dc3545;
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
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  margin: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
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
  margin-bottom: 6px;
}

.readonly-field {
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  color: #6b7280;
  font-size: 14px;
}

.modal-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s ease;
}

.modal-input:focus {
  border-color: #007bff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.modal-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
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
}

.modal-btn.save:hover:not(:disabled) {
  background: #0056b3;
}

.modal-btn.save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-btn.delete {
  background: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-btn.delete:hover:not(:disabled) {
  background: #c82333;
}

.modal-btn.delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-small {
  max-width: 360px;
}

.delete-text {
  margin: 0;
  color: #374151;
  font-size: 14px;
}

.btn-spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@media (max-width: 600px) {
  .toggle-tab {
    padding: 10px 8px;
    font-size: 12px;
  }
  
  .toggle-tab i {
    display: none;
  }
  
  .history-card {
    padding: 12px;
  }
  
  .card-icon {
    width: 32px;
    height: 32px;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
  }
  
  .modal-content {
    margin: 10px;
  }
}
</style>
