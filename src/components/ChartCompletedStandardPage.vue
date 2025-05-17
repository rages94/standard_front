<template>
    <b-container class="create-completed-standard-page">
      <h2 class="text-center mb-5">График списаний</h2>
      <div>
        <LineChart :data="chartData" :options="chartOptions" />
      </div>
      <div class="actions mt-4">
      </div>
    </b-container>
  </template>

  <script>
    import api from "../api/axios.js";

    import { TimeScale } from 'chart.js';
    import { Line } from 'vue-chartjs';
    import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js';
    import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
    import autocolors from 'chartjs-plugin-autocolors';
    import zoomPlugin from 'chartjs-plugin-zoom';

    ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale, autocolors, zoomPlugin, Filler);

  export default {
    name: "ChartCompletedStandardPage",
    components: {
      LineChart: Line
    },
    data() {
      return {
        as_standard: true,
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
              zoom: {
                wheel: {
                  enabled: true,
                  speed: 0.2,
                },
                pinch: {
                  enabled: true,
                },
                mode: 'xy',
                scaleMode: 'xy',
              },
              pan: {
                enabled: true,
                mode: 'xy',
                scaleMode: 'xy',
              }
            }
          },
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {unit: 'month'},
            },
            y: {
              title: {
                display: true,
                text: 'Нормы'
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
          const chartResponse = await api.get(`/completed_standards/grouped/?as_standard=${this.as_standard}`); 
          const chartData = chartResponse.data; 

          // Обновляем данные для графика
          this.chartData = chartData
          if (this.as_standard == false)
          {
            this.chartOptions.scales.y.text = 'Количество'
          }
          else
          {
            this.chartOptions.scales.y.text = 'Нормы'
          }

        } catch (error) {
          console.error("Ошибка при загрузке данных:", error);
        }
      },
    },
    mounted() {
      this.fetchCompletedStandards();
    },
  };
  </script>
  
  <style scoped>
  .create-completed-standard-page {
    width: 100%;
    max-width: 1200px;
    min-width: 400px;
    padding: 20px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  