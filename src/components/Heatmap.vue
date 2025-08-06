<template>
    <b-container class="heatmap-page">
      <div>
        <canvas ref="canvasRef"></canvas>
      </div>
    </b-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import {
    Chart,
    CategoryScale,
    LinearScale,
    Tooltip,
    Title
  } from 'chart.js'
  import {
    MatrixController,
    MatrixElement
  } from 'chartjs-chart-matrix'
  
  // Регистрируем компоненты Chart.js
  Chart.register(
    CategoryScale,
    LinearScale,
    Tooltip,
    Title,
    MatrixController,
    MatrixElement
  )
  
  const canvasRef = ref(null)
  
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const weeks = Array.from({ length: 20 }, (_, i) => `${i + 1}`)
  
  // Генерация случайных данных (пример: 365 значений)
  const generateData = () => {
    const data = []
    for (let w = 0; w < 20; w++) {
      for (let d = 0; d < 7; d++) {
        data.push({
          x: `${w + 1}`,
          y: days[d],
          v: Math.floor(Math.random() * 10) // от 0 до 9
        })
      }
    }
    return data
  }
  
  // Цвета как в GitHub
  const getColor = (value) => {
    if (value === 0) return '#ebedf0'
    if (value <= 2) return '#c6e48b'
    if (value <= 4) return '#7bc96f'
    if (value <= 7) return '#239a3b'
    return '#196127'
  }
  
  onMounted(() => {
    const ctx = canvasRef.value.getContext('2d')
  
    new Chart(ctx, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Heatmap',
          data: generateData(),
          backgroundColor(ctx) {
            return getColor(ctx.raw.v)
          },
          borderWidth: 1,
          borderColor: '#ccc',
          width: ({ chart }) => (chart.chartArea || {}).width / 20 - 1,
          height: ({ chart }) => (chart.chartArea || {}).height / 7 - 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => `Неделя: ${items[0].raw.x}, День: ${items[0].raw.y}`,
              label: (item) => `Нормы: ${item.raw.v}`
            }
          },
          legend: { display: false },
          title: {
            display: true,
            text: 'Активность по дням'
          }
        },
        scales: {
          x: {
            type: 'category',
            labels: weeks,
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              minRotation: 0,
              callback: function (val, index) {
                return index % 4 === 0 ? this.getLabelForValue(val) : ''
              }
            },
            grid: { display: false }
          },
          y: {
            type: 'category',
            labels: days,
            grid: { display: false }
          }
        }
      }
    })
  })
  </script>
  
  <style scoped>
  .heatmap-page {
    width: 100%;
    max-width: 1200px;
    min-width: 400px;
    padding: 20px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  </style>
  