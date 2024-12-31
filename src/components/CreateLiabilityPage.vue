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
      </div>
      <div class="actions mt-4">
        <b-button :disabled="isLoading" variant="primary" class="btn-block mb-2" @click="saveLiabilities">
          Сохранить <b-spinner v-if="isLoading" small></b-spinner>
        </b-button>
        <b-button variant="secondary" class="btn-block" @click="goBack">
          Назад
        </b-button>
      </div>
    </b-container>
  </template>
  
  <script>
  import api from "../api/axios.js";
  
  export default {
    name: "CreateLiabilityPage",
    data() {
      return {
        liabilityTemplates: [], // API response with templates
        isLoading: false,
      };
    },
    methods: {
      // Fetch liability templates from the API
      async fetchLiabilityTemplates() {
        try {
          const response = await api.get("/liability_templates/");
          this.liabilityTemplates = response.data.map((template) => ({
            ...template,
            inputValue: 0, // Add a field for user input
          }));
        } catch (error) {
          console.error("Error fetching liability templates:", error);
        }
      },
      // Save liabilities to the API
      async saveLiabilities() {
        try {
          this.isLoading = true;
          for (const template of this.liabilityTemplates) {
            if (template.inputValue > 0) {
              await api.post("/liabilities/", {
                liability_template_id: template.id,
                count: template.inputValue,
              });
              template.inputValue = 0
            }
          }
          // this.goBack();
        } catch (error) {
          console.error("Error saving liabilities:", error);
        } finally {
          this.isLoading = false;
        }
      },
      // Navigate back to MainPage
      goBack() {
        this.$router.push('/');
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
  
  .fa-info-circle {
  margin-left: 5px;
  color: #555;
  cursor: help; /* Меняет курсор на вопросительный знак */
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
    width: 80px; /* Fixed width for consistency */
    text-align: center;
  }
  
  .actions {
    text-align: center;
  }
  
  .btn-block {
    width: 100%;
  }
  </style>
  