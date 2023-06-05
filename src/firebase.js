import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    // Firebase yapılandırma bilgilerinizi buraya yapıştırın
    apiKey: "AIzaSyATL7NChkwUB50KAVY3ZHIwDJBnBvX3Q4A",
    authDomain: "diabetesapp-73b07-f1886.firebaseapp.com",
    projectId: "diabetesapp-73b07",
    storageBucket: "diabetesapp-73b07.appspot.com",
    messagingSenderId: "788722745854",
    appId: "1:788722745854:web:c43957690d48c6b44640af",
    measurementId: "G-CL4N78XK9L"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
