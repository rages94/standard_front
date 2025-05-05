import { createRouter, createWebHistory } from 'vue-router';
import LiabilitiesDashboard from './components/MainPage.vue';
import CreateLiability from './components/CreateLiabilityPage.vue';
import CreateCompletedStandard from './components/CreateCompletedStandardPage.vue';
import ChartCompletedStandard from './components/ChartCompletedStandardPage.vue';
import RatingCompletedStandard from './components/RatingCompletedStandardPage.vue';
import LoginPage from './components/LoginPage.vue';
import SignUpPage from './components/SignUpPage.vue';

const routes = [
  {
    path: '/',
    name: 'LiabilitiesDashboard',
    component: LiabilitiesDashboard,
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
    path: '/Rating-completed-standard',
    name: 'RatingCompletedStandard',
    component: RatingCompletedStandard,
  },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignUpPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
