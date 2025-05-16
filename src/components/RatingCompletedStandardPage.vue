<template>
  <b-container class="rating-page d-flex flex-column align-items-center justify-content-center">
    <div class="main-box">
      <h2 class="text-center mb-5">Рейтинг упражнений</h2>
      <div class="actions mt-4">
        <div>

          <b-row class="my-1">
            <b-col class="col-md-9">
              Тип упражнения
            </b-col>
            <b-col class="col-md-3">
              Период
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col class="col-md-9">
              <b-dropdown text="Выберите упражнение" split-variant="outline-primary" class="mb-3 button-styled" variant="primary">
                <template #button-content>
                  {{ selectedStandardName || 'Выберите упражнение' }}
                </template>

                <b-dropdown-item
                  v-for="(item, index) in standards"
                  :key="index"
                  @click="selectStandard(item.name)"
                >
                  {{ item.name }}
                </b-dropdown-item>
              </b-dropdown>
            </b-col>
            <b-col class="col-md-3">
              <b-form-input id="type-number" placeholder="Дни" type="number" min="0" v-model="periodDays" @input="fetchUserRating"></b-form-input>
            </b-col>
          </b-row>

          <!-- Таблица данных -->
          <b-table :items="selectedUserRatings" :fields="fields" striped hover>
            <template #cell(index)="data">
              {{ data.index + 1 }}
            </template>
            <template #cell(standards)="data">
              <span 
                v-if="selectedStandardName === 'Все упражнения'" 
                v-b-tooltip.hover.top="completedStandardInfo[data.item.username]"
              >
                {{ data.item.standards }}
              </span>
              <span v-else>{{ data.item.standards }}</span>
            </template>
          </b-table>
        </div>
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
      standards: [],
      periodDays: null,
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
          },
          {
            key: 'standards',
            label: 'Нормы',
            sortable: true,
          }
        ],
        selectedStandardName: null,
        selectedUserRatings: {},
        completedStandardInfo: {},
    };
  },
  methods: {
    setCompletedStandardInfo() {
      const result = {};
      this.userRatings.forEach(item => {
        item.user_ratings.forEach(rating => {
          const username = rating.username;
          const standardName = item.standard_name;
          const standards = rating.standards;
          if (standardName === "Все упражнения") {
            return;
          }
          if (!result[username]) {
            result[username] = "";
          }
          result[username] += `${standardName}: ${standards}<br>`;
        });
      });

      for (const username in result) {
        result[username] = result[username].trim();
      }
      this.completedStandardInfo = result;
    },
    async fetchUserRating() {
      try {
        const response = await api.get(`/completed_standards/rating/?period_days=${this.periodDays | 0}`);
        this.userRatings = response.data; 
        this.selectStandard(this.selectedStandardName)
        this.setCompletedStandardInfo()
      } catch (error) {
        console.error('Error fetching user ratings:', error);
      }
    },
    async fetchStandards() {
      try {
        const response = await api.get('/standards/');
        this.standards = response.data;
        this.standards.unshift({name: "Все упражнения"})
        this.selectedStandardName = this.standards[0].name
      } catch (error) {
        console.error('Error fetching standards:', error);
      }
    },
    selectStandard(item) {
      this.selectedStandardName = item;
      const rating = this.userRatings.find(item => item.standard_name == this.selectedStandardName)
      if (rating === undefined) {
        this.selectedUserRatings = [];
      }
      else 
      {
        this.selectedUserRatings = rating.user_ratings;
      }
    },
    async fetchData() {
      await this.fetchStandards();
      this.fetchUserRating();
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
.rating-page {
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
  color: #ffffff;
}

.btn-block {
    width: 100%;
}
</style>