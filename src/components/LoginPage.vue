<template>
  <v-container fill-height fluid class="d-flex justify-center align-center">
    <v-card class="mx-auto" max-width="700">
      <v-toolbar color="deep-purple accent-4" dark>
        <v-toolbar-title class="white--text" style="margin:auto">DIABETES APP</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Email"
              required
          ></v-text-field>
          <v-text-field
              v-model="password"
              :rules="passwordRules"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              @click:append="showPassword = !showPassword"
          ></v-text-field>
          <v-row>
            <v-col cols="12">
              <v-btn :disabled="!valid" color="primary" class="mr-4" @click="enter">Login</v-btn>
              <v-btn color="primary" @click="register" class="mr-4">Register</v-btn>
              <v-btn color="primary"  dark @click="googleSignIn"  class="mr-4">
                <svg-icon type="mdi" :path="googleIconPath"></svg-icon>
              </v-btn>
              <v-btn color="primary" dark @click="facebookSignIn"  class="mr-4">
                <svg-icon type="mdi" :path="facebookIconPath"></svg-icon>
              </v-btn>
              <v-btn color="primary" dark @click="githubSignIn"  class="mr-4">
                <svg-icon type="mdi" :path="githubIconPath"></svg-icon>
              </v-btn>
              <v-btn color="primary" dark @click="twitterSignIn"  class="mr-4">
                <svg-icon type="mdi" :path="twitterIconPath"></svg-icon>
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-btn text @click="goToForgotPasswordPage">Forgot Password</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification,FacebookAuthProvider,TwitterAuthProvider,
GithubAuthProvider} from "firebase/auth";
import { ref, set, getDatabase } from "firebase/database";
import sweetAlert from "sweetalert";

import SvgIcon from '@jamescoyle/vue-icon';
import { mdiGoogle, mdiFacebook, mdiGithub, mdiTwitter } from '@mdi/js';
export default {
  components: {
    SvgIcon
  },
  data: () => ({
    valid: true,
    showPassword: false,
    email: "",
    password: "",
    emailRules: [
      (v) => !!v || "Email Required",
      (v) => /.+@.+/.test(v) || "Please enter a valid email",
    ],
    passwordRules: [
      (v) => !!v || "Password Required",
    ],
    googleIconPath: mdiGoogle,
    facebookIconPath: mdiFacebook,
    githubIconPath: mdiGithub,
    twitterIconPath: mdiTwitter
  }),
  methods: {
    goToForgotPasswordPage() {
      this.$router.push({ name: "ForgotPassword" });
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.enter();
      }
    },
    async enter() {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;
        if (!user.emailVerified) {
          sweetAlert("Hata", "Lütfen giriş yapmadan önce e-postanızı doğrulayın.", "error");
          return;
        }
        sweetAlert("Başarılı", `${user.email} Giriş yapıldı`, "success");
        this.$router.push({ name: "MainPage" });
      } catch (error) {
        sweetAlert("Hata", error.message, "error");
      }
    },
    register() {
      this.$router.push({ name: "RegisterPage" });
    },
    async googleSignIn() {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      try {
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        if (!user.emailVerified) {
          // Kullanıcı henüz doğrulama yapmadığı için hemen hesap oluşturma işlemi gerçekleştirilmez.
          // Doğrulama yapılması için kullanıcıya e-posta gönderilir.
          await sendEmailVerification(user);
          sweetAlert("Başarılı", "Lütfen e-posta adresinizi doğrulayın.", "success");
        } else {
          await this.createUserInDatabase(user);
          sweetAlert("Başarılı", `${user.email} Giriş yapıldı`, "success");
        }
        this.$router.push({ name: "MainPage" });
      } catch (error) {
        sweetAlert("Hata", error.message, "error");
      }
    },
    async facebookSignIn() {
      const auth = getAuth();
      const provider = new FacebookAuthProvider();

      try {
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        if (!user.emailVerified) {
          // Kullanıcı henüz doğrulama yapmadığı için hemen hesap oluşturma işlemi gerçekleştirilmez.
          // Doğrulama yapılması için kullanıcıya e-posta gönderilir.
          await sendEmailVerification(user);
          sweetAlert("Başarılı", "Lütfen e-posta adresinizi doğrulayın.", "success");
        } else {
          await this.createUserInDatabase(user);
          sweetAlert("Başarılı", `${user.email} Giriş yapıldı`, "success");
        }
        this.$router.push({ name: "MainPage" });
      } catch (error) {
        sweetAlert("Hata", error.message, "error");
      }
    },
    async githubSignIn() {
      const auth = getAuth();
      const provider = new GithubAuthProvider();

      try {
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        if (!user.emailVerified) {
          // Kullanıcı henüz doğrulama yapmadığı için hemen hesap oluşturma işlemi gerçekleştirilmez.
          // Doğrulama yapılması için kullanıcıya e-posta gönderilir.
          await sendEmailVerification(user);
          sweetAlert("Başarılı", "Lütfen e-posta adresinizi doğrulayın.", "success");
        } else {
          await this.createUserInDatabase(user);
          sweetAlert("Başarılı", `${user.email} Giriş yapıldı`, "success");
        }
        this.$router.push({ name: "MainPage" });
      } catch (error) {
        sweetAlert("Hata", error.message, "error");
      }
    },
    async twitterSignIn() {
      const auth = getAuth();
      const provider = new TwitterAuthProvider();

      try {
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        if (!user.emailVerified) {
          // Kullanıcı henüz doğrulama yapmadığı için hemen hesap oluşturma işlemi gerçekleştirilmez.
          // Doğrulama yapılması için kullanıcıya e-posta gönderilir.
          await sendEmailVerification(user);
          sweetAlert("Başarılı", "Lütfen e-posta adresinizi doğrulayın.", "success");
        } else {
          await this.createUserInDatabase(user);
          sweetAlert("Başarılı", `${user.email} Giriş yapıldı`, "success");
        }
        this.$router.push({ name: "MainPage" });
      } catch (error) {
        sweetAlert("Hata", error.message, "error");
      }
    },
    async createUserInDatabase(user) {
      const db = getDatabase();
      const userRef = ref(db, "users/" + user.uid);

      try {
        const snapshot = await set(userRef, {
          email: user.email,
          // Diğer kullanıcı bilgilerini burada ekleyebilirsiniz
        });
        console.log("Kullanıcı veritabanında oluşturuldu:", snapshot);
      } catch (error) {
        console.error("Kullanıcı veritabanında oluşturulurken hata oluştu:", error);
      }
    },
  },
};
</script>
