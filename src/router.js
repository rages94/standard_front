import { createRouter, createWebHistory } from 'vue-router';
import MainPage from './components/MainPage.vue';
import CreateLiability from './components/CreateLiabilityPage.vue';
import CreateCompletedStandard from './components/CreateCompletedStandardPage.vue';
import ChartCompletedStandard from './components/Heatmap.vue';
import RatingCompletedStandard from './components/RatingCompletedStandardPage.vue';
import HistoryStandard from './components/HistoryStandardPage.vue';
import LoginPage from './components/LoginPage.vue';
import LoginBotPage from './components/LoginBotPage.vue';
import SignUpPage from './components/SignUpPage.vue';
import WelcomePage from './components/WelcomePage.vue';

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage,
  },
  {
    path: '/welcome',
    name: 'WelcomePage',
    component: WelcomePage,
  },
  {
    path: '/create-liability',
    name: 'CreateLiability',
    component: CreateLiability,
  },
  {
    path: '/create-completed-standard',
    name: 'CreateCompletedStandard',
    component: CreateCompletedStandard,
  },
  {
    path: '/chart-completed-standard',
    name: 'ChartCompletedStandard',
    component: ChartCompletedStandard,
  },
  {
    path: '/rating-completed-standard',
    name: 'RatingCompletedStandard',
    component: RatingCompletedStandard,
  },
  {
    path: '/history',
    name: 'HistoryStandard',
    component: HistoryStandard,
  },
  { path: '/login', component: LoginPage },
  { path: '/login/bot/', component: LoginBotPage },
  { path: '/signup', component: SignUpPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
