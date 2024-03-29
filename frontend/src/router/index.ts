import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Intro from '../views/Intro.vue';
import Profile from '../views/Profile.vue';
import Game from '../views/Game.vue';
import Leaderboard from '@/views/Leaderboard.vue';
import NotFound from '../views/NotFound.vue'
import VisitProfile from '../views/VisitProfile.vue'

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
	},
	{
		path: '/profile/:username',
		name: 'VisitProfile',
		component: VisitProfile,
	},
	{
		path: '/game',
		name: 'Game',
		component: Game,
	},
	{
		path: '/leaderboard',
		name: 'Leaderboard',
		component: Leaderboard,
	},
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: NotFound
	},
];

const router = createRouter({
	history: createWebHistory("/"),
	routes,
});

export default router;