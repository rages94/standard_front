<template>
  <b-container class="rating-page d-flex flex-column align-items-center justify-content-center">
    <div class="main-box">
      <h2 class="text-center mb-5">Рейтинг упражнений</h2>
      <div class="actions mt-4">
        <div>
          <b-dropdown text="Выберите стандарт" split-variant="outline-primary" class="mb-3 button-styled" variant="primary">
            <template #button-content>
              {{ selectedStandard.standard_name || 'Выберите стандарт' }}
            </template>

            <b-dropdown-item
              v-for="(item, index) in userRatings"
              :key="index"
              @click="selectStandard(item)"
            >
              {{ item.standard_name }}
            </b-dropdown-item>
          </b-dropdown>
          <!-- Таблица данных -->
          <b-table :items="selectedStandard.user_ratings" :fields="fields" striped hover>
            <template #cell(index)="data">
              {{ data.index + 1 }}
            </template>
            <template #cell(count)="data">
              <b>{{
                data.value
              }}</b> <!-- Выводим значения в ячейке -->
            </template>
          </b-table>
        </div>

        <br>
        <b-button variant="secondary" class="btn-block" @click="goBack">
          Назад
        </b-button>
      </div>
    </div>
  </b-container>
</template>

<script>
import api from '../api/axios.js';

export default {
  name: 'RatingCompletedStandardPage',
  data() {
    return {
      userRatings: null,
      fields: [
          {
            key: 'index',
            label: 'Место',
            sortable: true
          },
          {
            key: 'username',
            label: 'Пользователь',
            sortable: false
          },
          {
            key: 'count',
            label: 'Количество',
            sortable: true,
          }
        ],
        selectedStandard: {},
    };
  },
  methods: {
    async fetchUserRating() {
      try {
        const response = await api.get('/completed_standards/rating/');
        this.userRatings = response.data; 
        this.selectedStandard = this.userRatings[0];
      } catch (error) {
        console.error('Error fetching user ratings:', error);
      }
    },
    selectStandard(item) {
      this.selectedStandard = item;
    },

    goBack() {
        this.$router.push('/');
      },
  },
  mounted() {
    this.fetchUserRating();
  },
};
</script>

<style scoped>
.rating-page {
  min-height: 100vh;
  color: #000000;
  text-align: center;
  padding: 20px;
}

.main-box {
    width: 400px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

.header {
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #000000;
  margin-bottom: 10px;
}

.header h2 {
  font-size: 4rem;
  font-weight: 700;
  color: #000000;
}

.buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.button-styled {
  width: 100%;
  max-width: 300px;
  color: #ffffff;
}

</style>