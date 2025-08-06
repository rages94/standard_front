<template>
    <b-container class="main-box  d-flex flex-column align-items-center justify-content-center">
      <div class="container text-center z-10 position-relative">
        <h1 class="display-3 fw-bold mb-4">Добро пожаловать в <span class="text-accent">"Нормы"</span></h1>
        <p class="lead mb-5">
          Нормы — мотивационный сервис по избавлению от вредных привычек путем занятия спортом.
        </p>
  
        <div class="steps text-start mx-auto" style="max-width: 700px;">
          <div v-for="(step, index) in steps" :key="index" class="step-item d-flex align-items-start position-relative mb-5">
            <div class="step-number me-3">
              <div class="circle bg-accent text-white fw-bold">{{ index + 1 }}</div>
            </div>
            <div class="step-text">
              <p class="fs-5">{{ step }}</p>
            </div>
            <svg
              v-if="index < steps.length - 1"
              class="arrow-down"
              xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </b-container>
  </template>
  
  <script setup>
  const steps = [
    'Фиксируй вредные привычки — создавай собственные категории и отмечай каждый случай их злоупотребления.',
    'Отрабатывай долг упражнениями — компенсируй вред через физическую активность, подобранную системой.',
    'Соревнуйся с другими участниками — следи за рейтингом, сравнивай прогресс и стремись к лучшему.',
    'Анализируй результаты — отслеживай свой путь на наглядных графиках и диаграммах.',
    'Участвуй в месячных зачётах — принимай вызовы, получай награды и достигай новых целей.'
  ]
  </script>
  
  <style scoped>
  .welcome-page {
    background-size: cover;
    background-position: center;
    position: relative;
    padding: 4rem 2rem;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
.main-box {
  width: 100%;
  max-width: 800px;
  min-width: 400px;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

  .text-accent {
    color: #070bff;
  }
  
  .bg-accent {
    background-color: #070bff;
  }
  
  .step-item {
    padding-left: 2rem;
  }
  
  .circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    box-shadow: 0 0 5px rgba(7, 44, 255, 0.5);
  }
  
  .arrow-down {
    position: absolute;
    left: 1.2rem;
    top: 3rem;
  }
  </style>
  