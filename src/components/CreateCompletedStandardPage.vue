<template>
  <b-container class="create-completed-standard-page">
    <h1 class="text-center mb-5">Списать долг</h1>
    <div v-for="standard in standards" :key="standard.id" class="standard-item">
      <div class="input-container">
        <b-form-input
          type="number"
          v-model.number="standard.inputValue"
          min="0"
          class="input-fixed-size text-center"
        />
      </div>
      <span class="standard-name">
        {{ standard.name }}
        <span v-if="standard.count" :style="{ fontSize: 'smaller', color: 'gray' }">
          {{ standard.count + ' шт. = 1 н.' }}
        </span>
      </span>
    </div>
    <div class="actions mt-4">
      <b-button
        :disabled="isLoading"
        size="sm"
        variant="primary"
        class="btn-block mb-2"
        @click="saveCompletedStandards"
      >
        Сохранить <b-spinner v-if="isLoading" small></b-spinner>
      </b-button>
    </div>
  </b-container>
</template>

<script>
import api from "../api/axios.js"
import { toast } from "vue3-toastify"
import "vue3-toastify/dist/index.css"

export default {
  name: "CreateCompletedStandardPage",
  data() {
    return {
      standards: [],
      isLoading: false,
    }
  },
  methods: {
    async fetchStandards() {
      try {
        const response = await api.get("/standards/")
        this.standards = response.data.map((template) => ({
          ...template,
          inputValue: 0,
        }))
      } catch (error) {
        console.error("Error fetching standards:", error)
      }
    },
    async saveCompletedStandards() {
      try {
        this.isLoading = true
        let anythingSaved = false
        for (const template of this.standards) {
          if (template.inputValue > 0) {
            const completed_type = localStorage.getItem("completed_type")
            await api.post("/completed_standards/", {
              standard_id: template.id,
              count: template.inputValue,
              completed_type,
            })
            template.inputValue = 0
            anythingSaved = true
          }
        }
        if (anythingSaved) {
          toast.success("Сохранено!")
        }
      } catch (error) {
        console.error("Error saving completed standards:", error)
        toast.error("Ошибка при сохранении")
      } finally {
        this.isLoading = false
      }
    },
  },
  mounted() {
    this.fetchStandards()
  },
}
</script>

<style scoped>
.create-completed-standard-page {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.standard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.input-container {
  flex: 0 0 80px;
}
.standard-name {
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
