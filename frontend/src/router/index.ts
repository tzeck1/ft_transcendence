import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Intro from '../components/Intro.vue';
import Profile from '../components/Profile.vue';
import Game from '../components/Game.vue';
import StartGame from '../components/StartGame.vue';
import EndGame from '../components/EndGame.vue';

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
		path: '/game',
		name: 'Game',
		component: Game,
	},
	{
		path: '/start',
		name: 'StartGame',
		component: StartGame,
	},
	{
		path: '/end',
		name: 'EndGame',
		component: EndGame,
	},
];

const router = createRouter({
	history: createWebHistory("/"),
	routes,
});

export default router;