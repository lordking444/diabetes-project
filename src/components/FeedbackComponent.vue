<template>
  <div class="feedback-form">
    <v-card class="mx-auto" max-width="800">
      <v-card-title>User Feedback Form</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
              v-model="email"
              :rules="nameRules"
              label="Email"
              required
          ></v-text-field>

          <v-textarea
              v-model="feedback"
              :rules="feedbackRules"
              label="Your Feedback"
              required
          ></v-textarea>

          <v-rating
              v-model="rating"
              :rules="ratingRules"
              label="Rate the App"
              required
              background-color="grey lighten-2"
              color="amber darken-2"
              dense
              clearable
          ></v-rating>

          <v-btn
              :disabled="!valid"
              color="success"
              class="mr-4"
              @click="submitFeedback"
          >
            Submit
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import {getDatabase, ref, set} from "firebase/database";
import {getAuth} from "firebase/auth";
export default {
  data: () => ({
    valid: true,
    email: "",
    nameRules: [(v) => !!v || "Email is required"],
    feedback: "",
    feedbackRules: [(v) => !!v || "Feedback is required"],
    rating: null,
    ratingRules: [(v) => !!v || "Rating is required"],
  }),
  created() {
    const user = getAuth().currentUser;
    if (user) {
      this.email = user.email;
    }
  },
  methods: {
    submitFeedback() {
      if (this.$refs.form.validate()) {
        // form data is valid, you can submit the form
        // eslint-disable-next-line no-undef
        swal("Feedback Submitted!", "Thank you for your feedback!", "success")

        // Save the feedback to the database
        const db = getDatabase();
        const userRef = ref(db, "feedback/");

       // Generate a new unique key for the feedback

        set(userRef, {
          name: this.name,
          feedback: this.feedback,
          // Diğer kullanıcı bilgilerini burada ekleyebilirsiniz
        });

        this.resetForm();
      }
    },
    resetForm() {
      this.$refs.form.reset();
    },
  },
};
</script>
