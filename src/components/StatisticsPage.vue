<template>
  <div class="statistics-page">
    <div class="statistics-container">
      <h1 class="page-title">Статистика</h1>

      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Период</label>
          <select v-model="filters.period" class="form-select" @change="onFilterChange">
            <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Группировка</label>
          <select v-model="filters.groupBy" class="form-select" @change="onFilterChange">
            <option v-for="opt in groupByOptions" :key="opt.value" :value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>

        <div class="filter-group chart-types">
          <label class="filter-label">Тип графика</label>
          <div class="chart-type-buttons">
            <button
              v-for="opt in chartTypeOptions"
              :key="opt.value"
              class="chart-type-btn"
              :class="{ active: chartType === opt.value }"
              @click="onChartTypeChange(opt.value)"
            >
              <i :class="opt.icon"></i>
              {{ opt.text }}
            </button>
          </div>
        </div>

        <div class="filter-group chart-types">
          <label class="filter-label">Сумма</label>
          <button
            class="chart-type-btn"
            :class="{ active: showTotal }"
            @click="showTotal = !showTotal; processChartData()"
          >
            <i class="fa fa-plus"></i>
            Показать
          </button>
        </div>
      </div>

      <div class="chart-section">
        <h2 class="chart-title">График списаний</h2>
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
        </div>
        <div v-else-if="chartData.labels.length === 0" class="empty-state">
          <i class="fa fa-chart-line empty-icon"></i>
          <p>Нет данных за выбранный период</p>
        </div>
        <div v-else class="chart-wrapper">
          <component
            :is="currentChartComponent"
            :data="chartData"
            :options="chartOptions"
          />
        </div>
      </div>

      <div v-if="totals && Object.keys(totals).length > 0" class="totals-section">
        <h3 class="section-title">Итого</h3>
        <div class="totals-grid">
          <div
            v-for="(value, name) in totals"
            :key="name"
            class="total-card"
          >
            <div class="total-name">{{ name }}</div>
            <div class="total-value">{{ formatNumber(value) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api/axios.js";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
} from "chart.js";
import { Line, Bar } from "vue-chartjs";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement
);

export default {
  name: "StatisticsPage",
  components: {
    Line,
    Bar,
  },
  data() {
    return {
      filters: {
        period: "year",
        groupBy: "month",
      },
      periodOptions: [
        { value: "week", text: "Неделя" },
        { value: "month", text: "Месяц" },
        { value: "quarter", text: "3 месяца" },
        { value: "half_year", text: "6 месяцев" },
        { value: "year", text: "Год" },
        { value: "all", text: "Всё время" },
      ],
      groupByOptions: [
        { value: "day", text: "По дням" },
        { value: "week", text: "По неделям" },
        { value: "month", text: "По месяцам" },
      ],
      chartType: "line",
      showTotal: false,
      chartTypeOptions: [
        { value: "line", text: "Линия", icon: "fa fa-line-chart" },
        { value: "bar", text: "Столбы", icon: "fa fa-bar-chart" },
      ],
      chartData: {
        labels: [],
        datasets: [],
      },
      totals: {},
      rawData: null,
      isLoading: false,
    };
  },
  computed: {
    currentChartComponent() {
      if (this.chartType === "bar") return "Bar";
      return "Line";
    },
    chartOptions() {
      const scales = {
        x: {
          type: "category",
          grid: { display: false },
          ticks: { maxRotation: 45, font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          ticks: { font: { size: 11 } },
        },
      };

      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 15,
              font: { size: 12 },
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${this.formatNumber(context.raw)}`;
              },
            },
          },
        },
        scales,
      };
    },
  },
  methods: {
    async fetchData() {
      this.isLoading = true;
      try {
        const params = new URLSearchParams();
        params.append("group_by", this.filters.groupBy);
        params.append("as_standard", "true");

        if (this.filters.period !== "all") {
          const endDate = new Date();
          let startDate = new Date();

          switch (this.filters.period) {
            case "week":
              startDate.setDate(endDate.getDate() - 7);
              break;
            case "month":
              startDate.setMonth(endDate.getMonth() - 1);
              break;
            case "half_year":
              startDate.setMonth(endDate.getMonth() - 6);
              break;
            case "quarter":
              startDate.setMonth(endDate.getMonth() - 3);
              break;
            case "year":
              startDate.setFullYear(endDate.getFullYear() - 1);
              break;
          }

          params.append("start_date", startDate.toISOString().split("T")[0]);
          params.append("end_date", endDate.toISOString().split("T")[0]);
        }

        const response = await api.get(
          `/completed_standards/grouped/?${params.toString()}`
        );

        this.rawData = response.data;
        this.totals = response.data.totals || {};
        this.processChartData();
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        this.isLoading = false;
      }
    },
    processChartData() {
      if (!this.rawData) return;

      const labels = this.rawData.labels || [];
      const datasets = (this.rawData.datasets || []).map((ds, index) => ({
        ...ds,
        backgroundColor: this.getBackgroundColor(index, this.chartType),
        borderColor: this.getBorderColor(index),
        borderWidth: 2,
        pointRadius: this.chartType === "line" ? 3 : 0,
        pointHoverRadius: 5,
        tension: 0.3,
      }));

      if (this.showTotal && labels.length > 0) {
        const totalData = labels.map((_, labelIndex) => {
          return datasets.reduce((sum, ds) => sum + (ds.data[labelIndex] || 0), 0);
        });
        
        const totalDataset = {
          label: "Всего",
          data: totalData,
          backgroundColor: "rgba(255, 159, 64, 0.7)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 3,
          pointRadius: this.chartType === "line" ? 4 : 0,
          pointHoverRadius: 6,
          tension: 0.3,
          order: -1,
        };
        
        datasets.unshift(totalDataset);
      }

      this.chartData = { labels, datasets };
    },
    getBackgroundColor(index, chartType) {
      const colors = [
        "rgba(54, 162, 235, 0.7)",
        "rgba(255, 99, 132, 0.7)",
        "rgba(75, 192, 192, 0.7)",
        "rgba(255, 206, 86, 0.7)",
        "rgba(153, 102, 255, 0.7)",
        "rgba(255, 159, 64, 0.7)",
        "rgba(199, 199, 199, 0.7)",
        "rgba(83, 102, 255, 0.7)",
      ];

      return colors[index % colors.length];
    },
    getBorderColor(index) {
      const colors = [
        "rgba(54, 162, 235, 1)",
        "rgba(255, 99, 132, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(199, 199, 199, 1)",
        "rgba(83, 102, 255, 1)",
      ];
      return colors[index % colors.length];
    },
    formatNumber(num) {
      if (num === null || num === undefined) return "0";
      return Number(num).toFixed(1);
    },
    onFilterChange() {
      this.fetchData();
    },
    onChartTypeChange(value) {
      this.chartType = value;
      this.processChartData();
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
.statistics-page {
  padding: 20px;
}

.statistics-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group:first-child,
.filter-group:nth-child(2) {
  min-width: 150px;
}

.chart-types {
  min-width: auto;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group:first-child,
.filter-group:nth-child(2) {
  min-width: 150px;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:hover {
  border-color: #007bff;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.chart-type-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chart-type-btn {
  padding: 8px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-type-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.chart-type-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: #fff;
}

.chart-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  min-height: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.chart-wrapper {
  height: 400px;
  position: relative;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.totals-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.total-card {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.total-name {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
  }

  .filter-group:first-child,
  .filter-group:nth-child(2) {
    width: 100%;
  }

  .chart-wrapper {
    height: 300px;
  }

  .chart-type-buttons {
    justify-content: center;
  }

  .totals-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
