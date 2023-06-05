<template>
  <v-container fill-height fluid class="d-flex justify-center align-center">
    <v-card class="mx-auto" max-width="500"  style="width: 50%">
      <v-toolbar color="deep-purple accent-4" dark>
        <v-toolbar-title class="white--text" style="margin:auto">DIABETES APP - Password Reset</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Email"
              required
          ></v-text-field>
          <v-btn :disabled="!valid" color="primary" class="mr-4" @click="resetPassword">Reset Password</v-btn>
          <v-btn color="primary" @click="$router.push('/')">Back</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import sweetAlert from "sweetalert";

export default {
  data: () => ({
    valid: true,
    email: '',
    emailRules: [
      v => !!v || 'E-mail is required',
      v => /.+@.+/.test(v) || 'E-mail must be valid',
    ],
  }),
  methods: {
    async resetPassword() {
      const auth = getAuth();
      try {
        await sendPasswordResetEmail(auth, this.email);
        sweetAlert("Success", "Password reset email sent. Please check your inbox.", "success");
        this.$router.push({name: 'LoginPage'});
      } catch (error) {
        sweetAlert("Error", error.message, "error");
      }
    },
  },
}
</script>
