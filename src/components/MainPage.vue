<template>
  <b-container class="main-page d-flex flex-column align-items-center justify-content-center">
    <div class="main-box">
      <div class="header">
        <h2 title="Столько норм ты должен этому миру">{{ totalLiability }}</h2> 
      </div>
      <div v-if="credits">
        <h3 v-if="credits > 0">Долг в этом месяце: {{ credits }}</h3> 
        <h3 v-if="credits <= 0" class="no-credits">Долг за месяц списан</h3> 
        <br>
      </div>
      <div class="buttons">
        <b-button
          variant="primary"
          class="mb-3 button-styled"
          @click="goToCreateLiability"
        >
          Записать долг
        </b-button>
        <b-button
          variant="primary"
          class="mb-5 button-styled"
          @click="goToCreateCompletedStandard"
        >
          Списать долг
        </b-button>
        <b-button
          variant="primary"
          class="mb-3 button-styled"
          @click="goToChartCompletedStandard"
        >
          График beta
        </b-button>
        <b-button
          variant="primary"
          class="mb-5 button-styled"
          @click="goToRatingCompletedStandard"
        >
          Рейтинг beta
        </b-button>
        <b-button variant="outline-danger" size="sm" class="logout-button" @click="logOut">
          Выйти
        </b-button>
      </div>
    </div>
  </b-container>
</template>

<script>
import api from '../api/axios.js';

export default {
  name: 'MainPage',
  data() {
    return {
      totalLiability: "...", // Default value
      credits: null,
    };
  },
  methods: {
    // Fetch the total liability from the API
    async fetchUserInfo() {
      try {
        const response = await api.get('/users/me/');
        this.totalLiability = response.data.total_liabilities; 
        try {
          const response_credit = await api.get('/credits/');
          this.credits = response_credit.data.count - response_credit.data.completed_count; 
        }  catch (error) {
          this.credits = null
        }
        localStorage.setItem('completed_type', response.data.completed_type);
      } catch (error) {
        console.error('Error fetching total liability:', error);
      }
    },
    // Navigate to Create Liability page
    goToCreateLiability() {
      this.$router.push('/create-liability');
    },
    // Navigate to Create Completed Standard page
    goToCreateCompletedStandard() {
      this.$router.push('/create-completed-standard');
    },
    goToChartCompletedStandard() {
      this.$router.push('/chart-completed-standard');
    },
    goToRatingCompletedStandard() {
      this.$router.push('/rating-completed-standard');
    },
    // Log out the user
    logOut() {
      try {
        // Clear tokens from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Redirect to LoginPage
        this.$router.push('/login');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    },
  },
  mounted() {
    this.fetchUserInfo();
  },
};
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