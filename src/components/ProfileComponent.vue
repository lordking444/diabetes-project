<template>
  <div class="full-screen">
    <v-card class="profile-card">
      <div class="profile-header">
        <img :src="previewImageUrl" alt="Profile Image" v-if="previewImageUrl" class="profile-image">
        <label for="file-upload" class="file-upload-label">
          <svg-icon type="mdi" :path="path"></svg-icon>
        </label>
        <input id="file-upload" type="file" @change="onFileChange" style="display:none;">
        <v-btn class="upload-btn" @click="uploadImage">Upload</v-btn>
      </div>

      <v-card-title class="title">
        User Information
      </v-card-title>
      <div class="info-cards">
        <v-card class="info-card">
          <v-card-subtitle>Name</v-card-subtitle>
          <v-card-text> <b>{{ userName }}</b></v-card-text>
        </v-card>
        <v-card class="info-card">
          <v-card-subtitle>Email</v-card-subtitle>
          <v-card-text> <b>{{ userEmail }}</b></v-card-text>
        </v-card>
        <v-card class="info-card">
          <v-card-subtitle>Gender</v-card-subtitle>
          <v-card-text> <b>{{ userGender }} </b></v-card-text>
        </v-card>
        <v-card class="info-card">
          <v-card-subtitle>Age</v-card-subtitle>
          <v-card-text> <b>{{ userAge }} years</b></v-card-text>
        </v-card>
        <v-card class="info-card">
          <v-card-subtitle>BMI and Diabetes Risk</v-card-subtitle>
          <v-card-text> <b :style="{ color: diabetesRisk.color }">{{ bmi }} kg/m² - {{ diabetesRisk.level }}</b></v-card-text>
        </v-card>
        <v-card class="info-card">
          <v-card-subtitle>Uploaded Pdfs</v-card-subtitle>
          <v-card-text>
            <ShowPdf />
          </v-card-text>
        </v-card>
      </div>
    </v-card>
  </div>
</template>

<script>
import {
  getStorage,
  ref as ref_storage,
  getDownloadURL,
  uploadBytesResumable
} from "firebase/storage";

import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount } from '@mdi/js'

import {
  getDatabase,
  onValue,
  ref as ref_database,
  set
} from "firebase/database";
import { getAuth } from "firebase/auth";
import swal from "sweetalert";
import ShowPdf from './ShowPdf.vue';
export default {
  components: {
    SvgIcon,
    ShowPdf,
  },
  name: "ProfileComponent",
  data() {
    return {
      selectedFile: null,
      profileImageUrl: '',
      userEmail: '',
      userGender: '',
      isUploading: false,
      uploadProgress: 0,
      path: mdiAccount,
      userAge: '',
      userWeight: '',
      userHeight: '',
      bmi: '',
      diabetesRisk: {
        level: '',
        color: ''
      },
      previewImageUrl: '',
      userName: '',
    };
  },
  async created() {
    this.profileImageUrl = localStorage.getItem('profileImageUrl');
    this.previewImageUrl = this.profileImageUrl;

    if (this.profileImageUrl) {
      const image = new Image();
      image.src = this.profileImageUrl;
      image.onload = () => {
        this.previewImageUrl = this.profileImageUrl;
      };
    }

    await this.fetchProfileData();
  },
  methods: {
    previewImage() {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.previewImageUrl = e.target.result;
      };

      reader.readAsDataURL(this.selectedFile);
    },
    calculateBMI() {
      const heightInMeters = this.userHeight / 100;
      this.bmi = (this.userWeight / (heightInMeters * heightInMeters)).toFixed(2);

      if (this.bmi >= 30) {
        this.diabetesRisk.level = 'High Risk';
        this.diabetesRisk.color = 'red';
      } else if (this.bmi >= 25) {
        this.diabetesRisk.level = 'Increased Risk';
        this.diabetesRisk.color = 'orange';
      } else {
        this.diabetesRisk.level = 'Normal Risk';
        this.diabetesRisk.color = 'green';
      }
    },
    async fetchProfileData() {
      const user = getAuth().currentUser;
      const db = getDatabase();
      const userRef = ref_database(db, 'users/' + user.uid);

      await onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          this.userAge = data.age;
          this.userWeight = data.weight;
          this.userHeight = data.height;
          this.calculateBMI();
          this.userEmail = data.email;
          this.userGender = data.gender;
          this.userName = data.name;
          if (data.profileImageUrl) {
            this.profileImageUrl = data.profileImageUrl;
          }
        }
      });
    },
    onFileChange(e) {
      this.selectedFile = e.target.files[0];
      this.previewImage();
    },
    async uploadImage() {
      if (!this.selectedFile) {
        swal("Warning!", "Please select an image!", "warning");
        return;
      }

      this.isUploading = true;
      const user = getAuth().currentUser;
      const storage = getStorage();
      const storageRef = ref_storage(storage, `users/${user.uid}/${this.selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);

      uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            this.uploadProgress = progress;
          },
          async (error) => {
            console.log("Error uploading image:", error);
            this.isUploading = false;
            this.uploadProgress = 0;
            swal("Error!", "Failed to upload image.", "error");
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("Image uploaded successfully. Download URL:", downloadURL);

              if (this.profileImageUrl !== downloadURL) {
                this.profileImageUrl = downloadURL;
                localStorage.setItem('profileImageUrl', downloadURL);
                const db = getDatabase();
                const userRef = ref_database(db, `users/${user.uid}`);
                set(userRef, {
                  email: this.userEmail,
                  gender: this.userGender,
                  profileImageUrl: downloadURL,
                  age: this.userAge,
                  weight: this.userWeight,
                  height: this.userHeight,
                  name: this.userName,
                });
                swal("Success!", "Your profile picture has been updated!", "success");
              } else {
                swal("Warning!", "This image has already been uploaded!", "warning");
              }

              this.isUploading = false;
              this.uploadProgress = 0;
              this.$forceUpdate();
            } catch (error) {
              console.log("Error getting download URL:", error);
              swal("Error!", "Failed to get download URL.", "error");
            }
          }
      );
    },
  },
};
</script>

<style scoped>
.full-screen {
  margin-bottom: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f2f2f2;
}
.profile-card {
  width: 70%;
  font-size: 1.2em;
}
.profile-header {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 20px;
}
.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3f51b5;
}
.file-upload-label {
  display: inline-block;
  margin-top: 15px;
  padding: 10px;
  background-color: #3f51b5;
  color: white;
  cursor: pointer;
}
.file-upload-label:hover {
  background-color: #303f9f;
}
.upload-btn {
  margin-top: 15px;
}
.title {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
  color: #3f51b5;
}
.info-cards {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.info-card {
  width: 40%;
  margin: 10px;
}
.info-card > v-card-subtitle {
  font-weight: bold;
}
</style>