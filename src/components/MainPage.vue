<template>
  <b-container class="main-page d-flex flex-column align-items-center justify-content-center">
    <div class="main-box">
      <div class="header">
        <h2 title="Столько норм ты должен этому миру">{{ totalLiability }}</h2> 
      </div>
      <div v-if="credits">
        <h3 class="mb-3" v-if="credits > 0">Долг в этом месяце: {{ credits }}</h3> 
        <h3 v-if="credits <= 0" class="mb-3 no-credits">Долг за месяц списан</h3> 
        <br>
      </div>
      <div class="buttons">
        <b-row v-for="btn in buttons" class="mb-3 button-styled">
          <b-button 
            :variant="btn.variant"
            class="button-styled"
            @click="btn.action"
          >
          {{ btn.label }}
          </b-button>
        </b-row>

        <b-row class="mt-5">
          <b-col class="text-center">
            <b-button variant="link" class="text-danger fs-6" @click="logOut">
              Выйти
            </b-button>
          </b-col>
        </b-row>
      </div>
    </div>
  </b-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios.js';

const router = useRouter();
const totalLiability = ref(0);
const credits = ref(0);
const loading = ref(true);

const buttons = [
  {
    label: 'Добавить долг',
    action: () => router.push('/create-liability'),
    variant: 'primary',
  },
  {
    label: 'Списать долг',
    action: () => router.push('/create-completed-standard'),
    variant: 'primary',
  },
  {
    label: 'История',
    action: () => router.push('/history'),
    variant: 'primary',
  },
  {
    label: 'График',
    action: () => router.push('/chart-completed-standard'),
    variant: 'primary',
  },
  {
    label: 'Рейтинг',
    action: () => router.push('/rating-completed-standard'),
    variant: 'primary',
  },
];

async function fetchUserInfo() {
  loading.value = true;
  try {
    const userRes = await api.get('/users/me/');
    totalLiability.value = userRes.data.total_liabilities;

    const creditRes = await api.get('/credits/');
    credits.value = creditRes.data.count - creditRes.data.completed_count;
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchUserInfo);

function logOut() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  router.push('/login');
}
</script>

<style scoped>
.main-page {
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

.no-credits {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00db00;
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

/* .logout-container {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 100%;
  text-align: center;
} */

.logout-button {
  width: 100%;
  max-width: 300px;
  font-size: 0.8rem;
  padding: 5px 10px;
  border-color: #dc3545;
  color: #dc3545;
}

.logout-button:hover {
  background-color: #dc3545;
  color: white;
}

</style>