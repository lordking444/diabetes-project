import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { registerLicense } from '@syncfusion/ej2-base'
Vue.config.productionTip = false
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyATL7NChkwUB50KAVY3ZHIwDJBnBvX3Q4A",
  authDomain: "diabetesapp-73b07-f1886.firebaseapp.com",
  databaseURL: "https://diabetesapp-73b07-default-rtdb.firebaseio.com",
  projectId: "diabetesapp-73b07",
  storageBucket: "diabetesapp-73b07.appspot.com",
  messagingSenderId: "788722745854",
  appId: "1:788722745854:web:c43957690d48c6b44640af",
  measurementId: "G-CL4N78XK9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 getAuth(app);

registerLicense("ORg4AjUWIQA/Gnt2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5WdEFiW39ccXdVRmda");
new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
