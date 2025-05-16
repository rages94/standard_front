<template>
  <b-container class="history-page d-flex flex-column align-items-center justify-content-center">
    <div class="main-box">
      <h2 class="text-center mb-5">История</h2>
      <div class="actions mt-4">
        <b-tabs content-class="mt-3">
          <b-tab title="Списания" active>
            <div class="overflow-auto">
              <b-pagination
                v-model="csCurrentPage"
                :total-rows="csCount"
                :per-page="csLimit"
                align="center"
                @page-click="onCSPageClick()"
              ></b-pagination>

              <b-table
                id="completed_standards"
                :items="completed_standards"
                :per-page="csLimit"
                :current-page="csCurrentPage"
                :fields="csFields"
                small
              >
                <template #cell(standard_name)="data">
                  {{ data.item.standard.name }}
                </template>
                <template #cell(standards)="data">
                  {{ Math.floor(data.item.count / data.item.standard.count) }}
                </template>
                <template #cell(created_at)="data">
                  {{ formatDate(data.item.created_at) }}
                </template>
              </b-table>
            </div>
          </b-tab>

          <b-tab title="Долги">
            <div class="overflow-auto">
              <b-pagination
                v-model="lCurrentPage"
                :total-rows="lCount"
                :per-page="lLimit"
                align="center"
                @page-click="onLPageClick()"
              ></b-pagination>

              <b-table
                id="liabilities"
                :items="liabilities"
                :per-page="lLimit"
                :current-page="lCurrentPage"
                :fields="lFields"
                small
              >
                <template #cell(liability_template_name)="data">
                  <span v-if="data.item.liability_template === null">
                    Пользовательское
                  </span>
                  <span v-else>
                    {{ data.item.liability_template.name }}
                  </span>
                </template>
                <template #cell(standards)="data">
                  <span v-if="data.item.liability_template === null">
                    {{ data.item.count }}
                  </span>
                  <span v-else>
                    {{ Math.floor(data.item.count * data.item.liability_template.count) }}
                  </span>
                </template>
                <template #cell(created_at)="data">
                  {{ formatDate(data.item.created_at) }}
                </template>
              </b-table>
            </div>
          </b-tab>

          <b-tab title="Зачеты">
            <div class="overflow-auto">
              <b-pagination
                v-model="cCurrentPage"
                :total-rows="cCount"
                :per-page="cLimit"
                align="center"
                @page-click="onCPageClick()"
              ></b-pagination>

              <b-table
                id="credits"
                :items="credits"
                :per-page="cLimit"
                :current-page="cCurrentPage"
                :fields="cFields"
                small
              >
                <template #cell(completed)="data">
                  <span v-if="data.item.completed === true" class="text-success">
                    <i class="fa fa-check" title="Выполнено"></i>
                  </span>
                  <span v-else-if="data.item.completed === false" class="text-danger">
                    <i class="fa fa-times" title="Зафаршмачено"></i>
                  </span>
                  <span v-else class="text-warning">
                    <i class="fa fa-hourglass-half" title="В процессе"></i>
                  </span>
                </template>
                <template #cell(period)="data">
                  {{ formatDate(data.item.created_at) }} - {{ formatDate(data.item.deadline_date) }}
                </template>
                <template #cell(completed_at)="data">
                  {{ data.item.completed === true ? formatDate(data.item.completed_at) : '-' }}
                </template>
              </b-table>
            </div>
          </b-tab>

        </b-tabs>
        <br>
        <b-button variant="secondary" size="sm" class="btn-block" @click="goBack">
          Назад
        </b-button>
      </div>
    </div>
  </b-container>
</template>

<script>
import api from '../api/axios.js';

export default {
  name: 'HistoryStandardPage',
  data() {
    return {
      completed_standards: [],
      csCount: 0,
      csLimit: 10,
      csCurrentPage: 1,
      csFields: [
        {
          key: 'standard_name',
          label: 'Упражнение',
        },
        {
          key: 'count',
          label: 'Количество',
        },
        {
          key: 'standards',
          label: 'Нормы',
        },
        {
          key: 'created_at',
          label: 'Дата',
        },
      ],

      liabilities: [],
      lCount: 0,
      lLimit: 10,
      lCurrentPage: 1,
      lFields: [
        {
          key: 'liability_template_name',
          label: 'Долг',
        },
        {
          key: 'count',
          label: 'Количество',
        },
        {
          key: 'standards',
          label: 'Нормы',
        },
        {
          key: 'created_at',
          label: 'Дата',
        },
      ],

      credits: [],
      cCount: 0,
      cLimit: 10,
      cCurrentPage: 1,
      cFields: [
      {
          key: 'completed',
          label: '',
        },
        {
          key: 'count',
          label: 'Всего норм',
        },
        {
          key: 'completed_count',
          label: 'Выполнено норм',
        },
        {
          key: 'period',
          label: 'Период',
        },
        {
          key: 'completed_at',
          label: 'Дата выполнения',
        },
      ],
    };
  },
  setup() {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    return { formatDate };
  },
  methods: {
    async fetchCompletedStandards() {
      try {
        const response = await api.get(`/completed_standards/?limit=${this.csLimit}&offset=${(this.csCurrentPage - 1) * this.csLimit}`);
        this.completed_standards = response.data.data;
        this.csCount = response.data.count
      } catch (error) {
        console.error('Error fetching completed standards:', error);
      }
    },
    async fetchLiabilities() {
      try {
        const response = await api.get(`/liabilities/?limit=${this.lLimit}&offset=${(this.lCurrentPage - 1) * this.lLimit}`);
        this.liabilities = response.data.data;
        this.lCount = response.data.count
      } catch (error) {
        console.error('Error fetching liabilities:', error);
      }
    },
    async fetchCredits() {
      try {
        const response = await api.get(`/credits/?limit=${this.cLimit}&offset=${(this.cCurrentPage - 1) * this.cLimit}`);
        this.credits = response.data.data;
        this.cCount = response.data.count
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    },
    onCSPageClick() {
      this.$nextTick(() => {
        this.fetchCompletedStandards();
      });
    },
    onLPageClick() {
      this.$nextTick(() => {
        this.fetchLiabilities();
      });
    },
    onCPageClick() {
      this.$nextTick(() => {
        this.fetchCredits();
      });
    },

    goBack() {
        this.$router.push('/');
      },
  },
  mounted() {
    this.fetchCompletedStandards();
    this.fetchLiabilities();
    this.fetchCredits();
  },
};
</script>

<style scoped>
.history-page {
  color: #000000;
  text-align: center;
  padding: 20px;
}

.main-box {
    width: 450px;
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