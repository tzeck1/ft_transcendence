import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Intro from '../components/Intro.vue';
import Profile from '../components/Profile.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Intro',
    component: Intro,
  },
  {
    path: '/profile',
    name: 'Profile',
	component: Profile,
    // route level code-splitting
    // this generates a separate chunk (profile.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "profile" */ '../components/Profile.vue'),
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
});

export default router;