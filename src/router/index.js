// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";


const routes = [
  {
    path: "/",
    redirect: '/home',
  },
  {
    path: "/home",
    component: () => import("../page/Home.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;