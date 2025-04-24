<template>
    <b-container class="create-completed-standard-page">
      <h1 class="text-center mb-5">Такой себе график</h1>
      <div>
        <LineChart :data="chartData" :options="chartOptions" />
      </div>
      <div class="actions mt-4">
        <b-button variant="secondary" class="btn-block" @click="goBack">
          Назад
        </b-button>
      </div>
    </b-container>
  </template>

  <script>
    import api from "../api/axios.js";

    import { TimeScale } from 'chart.js';
    import { Line } from 'vue-chartjs';
    import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
    import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
    import autocolors from 'chartjs-plugin-autocolors';
    import zoomPlugin from 'chartjs-plugin-zoom';

    ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale, autocolors, zoomPlugin);

  export default {
    name: "ChartCompletedStandardPage",
    components: {
      LineChart: Line
    },
    data() {
      return {
        chartData: {
          labels: [], // Даты (по оси X)
          datasets: [{
            label: 'Значение',
            data: [],  // Значения (по оси Y)
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            fill: true,
            tension: 0.4
          }]
        },
        chartOptions: {
          plugins: {
            autocolors: {
              enabled: true,
            },
            zoom: {
              pan: {
                enabled: true,          // Включаем панорамирование
                mode: 'xy',             // Можно панорамировать по осям X и Y
                speed: 10               // Скорость панорамирования
              },
              zoom: {
                enabled: true,          // Включаем масштабирование
                mode: 'xy',             // Масштабирование по осям X и Y
                speed: 0.1,             // Скорость масштабирования
                sensitivity: 3,         // Чувствительность к движению мыши
                threshold: 2            // Минимальное количество пикселей для начала масштабирования
              },
              // limits: {
              //   y: {min: 0, max: 200},
              //   y2: {min: -5, max: 5}
              // },
            }
          },
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {unit: 'day'},
              title: {
                display: true,
                text: 'Дата'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Количество'
              }
            }
          },
        },
        isLoading: false,
      };
    },
    methods: {
      async fetchCompletedStandards() {
        try {
          const chartResponse = await api.get("/completed_standards/grouped/"); 
          const chartData = chartResponse.data; 

          // Обновляем данные для графика
          this.chartData = chartData

        } catch (error) {
          console.error("Ошибка при загрузке данных:", error);
        }
      },
      // Navigate back to MainPage
      goBack() {
        this.$router.push('/');
      },
    },
    mounted() {
      this.fetchCompletedStandards();
    },
  };
  </script>
  
  <style scoped>
  .create-completed-standard-page {
    max-width: 800px;
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
  