<template>
  <div>
    <v-card class="mx-auto" max-width="800">
      <v-img
          class="white--text align-end"
          height="200px"
          src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
      >
        <v-card-title>Blood Sugar Tracking App User Guide</v-card-title>
      </v-img>

      <v-card-subtitle class="pl-4 pt-4">Learn how to use the application</v-card-subtitle>

      <v-card-text class="text--primary pl-6 text-body-1 guide-text">
        <ol>
          <li>First, register for the app or log in with your existing account.</li>
          <li>On the main page, you'll find a form where you can enter your current blood sugar level and measurement time.</li>
          <li>Enter your blood sugar and measurement time and click on the "Submit" button.</li>
          <li>When your data is successfully saved, you will see a confirmation message.</li>
          <li>To view your data in a table format, go to the "Health Data" page. This table lists your data in order of measurement time.</li>
          <li>Visit the "Guide" page to change your account settings or to log out.</li>
        </ol>
      </v-card-text>
    </v-card>
  </div>
</template>


<script>
export default {
  name: "GuideComponent",
};
</script>

<style scoped>
.v-card {
  margin: 20px;
}
</style>
