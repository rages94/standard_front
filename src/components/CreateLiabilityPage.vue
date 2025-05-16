<template>
  <b-container class="create-liability-page">
    <h1 class="text-center mb-5">Записать долг</h1>

    <div v-for="template in liabilityTemplates" :key="template.id" class="liability-item">
      <div class="input-container">
        <b-form-input
          type="number"
          v-model.number="template.inputValue"
          min="0"
          class="input-fixed-size text-center"
        />
      </div>
      <span class="template-name">
        {{ template.name }}
        <span v-if="template.count" :style="{ fontSize: 'smaller', color: 'gray' }">
          {{ template.count + ' н.' }}
        </span>
      </span>
      <b-button
        variant="link"
        size="sm"
        class="text-danger"
        @click="confirmDelete(template)"
      >
        &#10005;
      </b-button>
    </div>

    <div class="actions mt-4">
      <b-button :disabled="isLoading" size="sm" variant="primary" class="btn-block mb-2" @click="saveLiabilities">
        Сохранить <b-spinner v-if="isLoading" small></b-spinner>
      </b-button>
      <b-button
        variant="outline-primary"
        size="sm"
        class="mb-3 w-100"
        @click="showModal = true"
      >
        Создать новый долг
      </b-button>
    </div>

    <!-- Модалка создания шаблона -->
    <b-modal v-model="showModal" title="Создать новый долг">
      <b-form-group label="Название долга">
        <b-form-input v-model="newTemplateName" />
      </b-form-group>
      <b-form-group label="Количество норм">
        <b-form-input type="number" min="1" v-model="newCount" />
      </b-form-group>
      <template #footer>
        <b-button variant="secondary" size="sm" @click="showModal = false">Отмена</b-button>
        <b-button variant="primary" size="sm" @click="createLiabilityTemplate">Сохранить</b-button>
      </template>
    </b-modal>
    
    <!-- Модалка подтверждения удаления -->
    <b-modal v-model="showDeleteConfirm" title="Удалить долг?">
      <p>Вы уверены, что хотите удалить долг <strong>{{ templateToDelete?.name }}</strong>?</p>
      <template #footer>
        <b-button variant="secondary" size="sm" @click="showDeleteConfirm = false">Отмена</b-button>
        <b-button variant="danger" size="sm" @click="deleteTemplate">Удалить</b-button>
      </template>
    </b-modal>

  </b-container>
</template>

<script>
import api from "../api/axios.js";
import { toast } from "vue3-toastify"
import "vue3-toastify/dist/index.css"

export default {
  name: "CreateLiabilityPage",
  data() {
    return {
      liabilityTemplates: [],
      isLoading: false,
      showModal: false,
      newTemplateName: '',
      newCount: 1,
      showDeleteConfirm: false,
      templateToDelete: null,
    };
  },
  methods: {
    async fetchLiabilityTemplates() {
      try {
        const response = await api.get("/liability_templates/");
        this.liabilityTemplates = response.data.map((template) => ({
          ...template,
          inputValue: 0,
        }));
      } catch (error) {
        console.error("Error fetching liability templates:", error);
      }
    },
    async saveLiabilities() {
      try {
        this.isLoading = true;
        for (const template of this.liabilityTemplates) {
          if (template.inputValue > 0) {
            await api.post("/liabilities/", {
              liability_template_id: template.id,
              count: template.inputValue,
            });
            template.inputValue = 0;
            toast.success("Сохранено!")
          }
        }
      } catch (error) {
        console.error("Error saving liabilities:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async createLiabilityTemplate() {
      if (!this.newTemplateName.trim()) return;
      try {
        const res = await api.post('/liability_templates/', { name: this.newTemplateName, count: this.newCount });
        this.liabilityTemplates.push({ ...res.data, inputValue: 0 });
        this.newTemplateName = '';
        this.newCount = 1;
        this.showModal = false;
      } catch (err) {
        console.error('Ошибка при создании шаблона', err);
      }
    },
    async deleteTemplate() {
      if (!this.templateToDelete) return;
      try {
        await api.delete(`/liability_templates/${this.templateToDelete.id}`);
        this.liabilityTemplates = this.liabilityTemplates.filter(t => t.id !== this.templateToDelete.id);
        this.templateToDelete = null;
        this.showDeleteConfirm = false;
      } catch (error) {
        console.error('Ошибка при удалении шаблона', error);
      }
    },
    confirmDelete(template) {
      this.templateToDelete = template;
      this.showDeleteConfirm = true;
    },
  },
  mounted() {
    this.fetchLiabilityTemplates();
  },
};
</script>

<style scoped>
.create-liability-page {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.liability-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.input-container {
  flex: 0 0 80px;
}

.template-name {
  flex: 1;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  text-align: right;
}

.input-fixed-size {
  width: 80px;
  text-align: center;
}

.actions {
  text-align: center;
}

.btn-block {
  width: 100%;
}
</style>
