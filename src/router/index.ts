import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const
  routes:RouteRecordRaw[] = [
    {
      path: "/",
      component: () => import("../layouts/MainLayout.vue"),
      children: [{ path: "", component: () => import("../pages/IndexPage.vue") }],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
      path: "/:catchAll(.*)*",
      component: () => import("../pages/ErrorNotFound.vue"),
    },
  ];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  strict: true,
  routes: routes
});
