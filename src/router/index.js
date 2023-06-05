import Vue from 'vue'
import VueRouter from 'vue-router'

import MainPage from "@/components/MainPage";

import LoginPage from "@/components/LoginPage";
import UploadBloodSugar from "@/components/UploadBloodSugar.vue";

import ChartsComponent from "@/components/ChartsComponent.vue";
import GuideComponent from "@/components/GuideComponent.vue";
import ProfileComponent from "@/components/ProfileComponent.vue";
import RegisterComponent from "@/components/RegisterComponent.vue";
import ForgotPasswordPage from "@/components/ForgotPasswordPage.vue";


Vue.use(VueRouter)

const routes = [

    {
        path: '/',
        name: 'LoginPage',
        component: LoginPage
    },

    {
        path: '/MainPage',
        name: 'MainPage',
        component: MainPage
    },
    {
        path: '/UploadBloodSugar',
        name: 'UploadBloodSugar',
        component: UploadBloodSugar
    },
    {
        path: '/Tab2Component',
        name: 'ChartsComponent',
        component: ChartsComponent
    },
    {
        path: '/GuideComponent',
        name: 'GuideComponent',
        component: GuideComponent
    },
    {
        path: '/ProfileComponent',
        name: 'ProfileComponent',
        component: ProfileComponent
    },
  {
    path: '/RegisterComponent',
    name: 'RegisterPage',
    component: RegisterComponent
  },
    {
        path: '/ForgotPassword',
        name: 'ForgotPassword',
        component: ForgotPasswordPage
    }


]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})



export default router
