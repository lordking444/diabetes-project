<template>
  <v-card>
    <v-card-title>
      <h4 class="title">Daily Diet List - {{ formattedDate }}
        <v-spacer></v-spacer>
        Total Calories - {{ totalCalories }} cal
      </h4>
    </v-card-title>
    <v-card-text>
      <template v-if="meals.length > 0">
        <v-expansion-panels>
          <v-expansion-panel v-for="meal in meals" :key="meal.id">
            <v-expansion-panel-header>
              <div class="header-content">
                <div class="meal-name">{{ meal.name }}</div>
                <div class="meal-calories">{{ meal.calories }} calories</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div class="meal-details">
                <div class="meal-image">
                  <img :src="getMealImage(meal.name.replace(/ /g, '-'))" alt="meal image" />
                </div>
                <div class="meal-info">
                  <p>{{ meal.details }}</p>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-else>
        <div class="no-meals-message">
          <p>No diet list available.</p>
        </div>
      </template>
    </v-card-text>
    <v-card-actions>
      <v-btn color="error" text @click="$emit('delete-diet')">
        <v-icon left>mdi-delete</v-icon>
        Delete
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>

export default {
  name: "DailyDietListComponent",
  props: {
    meals: {
      type: Array,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  methods: {
    getMealImage(mealId) {
      try {
        return require(`@/assets/meal-images/${mealId}.jpg`);
      } catch (error) {
        // Image file doesn't exist, return a default image path
        return require("@/assets/meal-images/default.jpg");
      }
    },
    formatDate(date) {
      const parts = date.split("-");
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `${day}-${month}-${year}`;
    },
  },
  computed: {
    formattedDate() {
      return this.formatDate(this.date);
    },
    totalCalories() {
      return this.meals.reduce((total, meal) => total + meal.calories, 0);
    },
  },
};
</script>

<style scoped>
.title {
  font-size: 18px;
  font-weight: bold;
}

.header-content {
  display: flex;
  align-items: center;
}

.meal-name {
  flex: 1;
}

.meal-calories {
  margin-left: 16px;
}

.meal-details {
  display: flex;
  align-items: center;
}

.meal-image {
  width: 100px;
  height: 100px;
  margin-right: 16px;
}

.meal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meal-info {
  flex: 1;
}

.no-meals-message {
  text-align: center;
  margin-top: 16px;
  font-weight: bold;
}
</style>
