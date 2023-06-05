<template>
  <div>
    <h1>Daily Diet List</h1>
    <v-card>
      <v-card-title>
        Select Meals
      </v-card-title>
      <v-card-subtitle>
        Choose your meals from the list
      </v-card-subtitle>
      <v-card-text>
        <v-select
            v-model="selectedMeals"
            :items="mealList"
            label="Select Meals"
            multiple
            item-text="name"
            item-value="id"
            dense
        >
          <template v-slot:item="{ item }">
            <span>{{ item.name }} - {{ item.calories }} calories</span>
          </template>
        </v-select>
      </v-card-text>
      <v-card-actions>
        <v-date-picker
            v-model="selectedDate"
            label="Select Date"
            dense
        ></v-date-picker>
        <v-btn color="primary" @click="saveDailyDiet">Save</v-btn>
        <v-btn color="primary" @click="openAddMealDialog">Add New Meal</v-btn>
      </v-card-actions>
    </v-card>

    <v-container fluid>
      <v-row v-if="userDietLists.length > 0">
        <v-col
            v-for="(dietList, index) in userDietLists"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            lg="3"
        >
          <v-accordion>
            <v-accordion-item>
              <v-accordion-item-header>
                <template v-slot:default>
                  <h4 class="diet-date">{{ dietList.date }}</h4>
                  <span class="diet-calories">Total Calories - {{ getTotalCalories(dietList.meals) }} cal</span>
                </template>
              </v-accordion-item-header>
              <v-accordion-item-content>
                <daily-diet-list-component
                    :meals="dietList.meals"
                    :date="dietList.date"
                    @delete-diet="deleteDiet(index)"
                ></daily-diet-list-component>
              </v-accordion-item-content>
            </v-accordion-item>
          </v-accordion>
        </v-col>
      </v-row>
      <div v-else class="no-diet-message">
        <p>No diet lists available.</p>
      </div>
    </v-container>

    <v-dialog v-model="addMealDialog" max-width="500px">
      <v-card>
        <v-card-title>Add New Meal</v-card-title>
        <v-card-text>
          <v-text-field v-model="newMealName" label="Meal Name"></v-text-field>
          <v-text-field v-model="newMealCalories" label="Calories"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="addMeal">Add</v-btn>
          <v-btn color="secondary" @click="closeAddMealDialog">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import DailyDietListComponent from "@/components/DailyDietListComponent.vue";
import { getAuth } from "firebase/auth";
import { ref, onValue, set, remove, getDatabase, push } from "firebase/database";
import swal from "sweetalert";

export default {
  name: "UpdateDailyDiet",
  components: { DailyDietListComponent },
  data() {
    return {
      mealList: [],
      selectedMeals: [],
      userDietLists: [],
      selectedDate: null,
      addMealDialog: false,
      newMealName: "",
      newMealCalories: "",
    };
  },
  methods: {
    fetchUserDiet() {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getDatabase();

      if (user) {
        const userDietRef = ref(db, `users/${user.uid}/diet/`);
        onValue(userDietRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const dietLists = Object.entries(data).map(([id, dietList]) => ({
              id,
              date: dietList.date,
              meals: dietList.meals,
            }));
            this.userDietLists = dietLists;
            localStorage.setItem("userDietLists", JSON.stringify(dietLists));
          } else {
            this.userDietLists = [];
          }
        });
      } else {
        console.log("No user is signed in");
      }
    },
    fetchMealData() {
      return new Promise((resolve, reject) => {
        const db = getDatabase();
        const mealRef = ref(db, "meals");
        onValue(mealRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const meals = Object.entries(data).map(([id, meal]) => ({
              id,
              name: meal.name,
              calories: meal.calories,
              details: meal.details,
            }));
            this.mealList = meals;
            resolve();
          } else {
            reject(new Error("No meals found"));
          }
        });
      });
    },
    deleteDiet(index) {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getDatabase();

      if (user) {
        const dietList = this.userDietLists[index];
        const dietListKey = dietList.id;
        const dietListRef = ref(db, `users/${user.uid}/diet/${dietListKey}`);
        remove(dietListRef)
            .then(() => {
              console.log("Diet list deleted successfully");
            })
            .catch((error) => {
              console.error("Error deleting diet list:", error);
            });
      } else {
        console.log("No user is signed in");
      }
    },
    saveDailyDiet() {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getDatabase();

      if (user) {
        if (!this.selectedDate) {
          swal("Please select a date");
          return;
        }

        if (this.selectedMeals.length === 0) {
          swal("Please select at least one meal");
          return;
        }

        const selectedDate = this.formatDate(this.selectedDate);
        const dietListRef = ref(db, `users/${user.uid}/diet/`);
        const newDietListRef = push(dietListRef);
        const meals = this.selectedMealsData.map((meal) => ({
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          details: meal.details,
        }));
        set(newDietListRef, {
          date: selectedDate,
          meals,
        })
            .then(() => {
              console.log("Diet list saved successfully");
              this.selectedMeals = [];
              this.selectedDate = null;
            })
            .catch((error) => {
              console.error("Error saving diet list:", error);
            });
      } else {
        console.log("No user is signed in");
      }
    },
    formatDate(date) {
      const formattedDate = new Date(date);
      return `${formattedDate.getDate()}-${formattedDate.getMonth() + 1}-${formattedDate.getFullYear()}`;
    },
    getTotalCalories(meals) {
      return meals.reduce((total, meal) => total + meal.calories, 0);
    },
    openAddMealDialog() {
      this.addMealDialog = true;
    },
    closeAddMealDialog() {
      this.addMealDialog = false;
      this.newMealName = "";
      this.newMealCalories = "";
    },
    addMeal() {
      if (!this.newMealName || !this.newMealCalories) {
        swal("Please enter meal name and calories");
        return;
      }

      const db = getDatabase();
      const mealsRef = ref(db, "meals");
      const newMealRef = push(mealsRef);
      const newMeal = {
        name: this.newMealName,
        calories: parseInt(this.newMealCalories),
        details: "",
      };
      set(newMealRef, newMeal)
          .then(() => {
            console.log("Meal added successfully");
            this.closeAddMealDialog();
            swal("Meal added successfully", {
              icon: "success",
            });
          })
          .catch((error) => {
            console.error("Error adding meal:", error);
          });
    }
  },
  computed: {
    selectedMealsData() {
      return this.selectedMeals.map((mealId) => {
        return this.mealList.find((meal) => meal.id === mealId);
      });
    },
  },
  mounted() {
    this.fetchMealData().then(() => {
      this.fetchUserDiet();
    });
  },
};
</script>

<style>
.no-diet-message {
  text-align: center;
  margin-top: 16px;
  font-weight: bold;
}

.diet-date {
  font-size: 16px;
  font-weight: bold;
}

.diet-calories {
  font-size: 14px;
  color: #757575;
}
</style>
