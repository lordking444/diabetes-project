<template>
  <div>
    <v-list>
      <v-list-item v-for="pdf in filteredPdfList" :key="pdf.name">
        <v-list-item-content>
          <a :href="pdf.url" target="_blank">{{ pdf.name }}</a>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn @click="sendEmail(pdf)" color="primary">Send Email</v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { getStorage, ref as ref_storage, listAll, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import axios from "axios";
import swal from "sweetalert";

export default {
  name: "ShowPdf",
  data() {
    return {
      pdfList: [],
      userId: null, // Kullanıcı kimliği için değişken tanımlanıyor
    };
  },
  computed: {
    filteredPdfList() {
      return this.pdfList.filter(pdf => this.isPdf(pdf.name));
    },
  },
  created() {
    this.userId = getAuth().currentUser.uid; // Kullanıcı kimliği alınıyor
    this.fetchPdfList();
  },
  methods: {
    async fetchPdfList() {
      const storage = getStorage();
      const storageRef = ref_storage(storage, "users/" + this.userId); // Firebase Storage'da PDF'lerin yüklendiği klasör
      const fileList = await listAll(storageRef);

      for (const item of fileList.items) {
        const downloadURL = await getDownloadURL(item);
        this.pdfList.push({ name: item.name, url: downloadURL });
      }
    },
    isPdf(fileName) {
      return /\.pdf$/i.test(fileName); // Dosya adının .pdf ile bitip bitmediğini kontrol ediyoruz
    },
    async sendEmail(pdf) {
      const emailData = {
        personalizations: [{
          to: [{ email: this.userEmail }],
          subject: "PDF Email"
        }],
        content: [{
          type: "text/plain",
          value: `Attached is the PDF: ${pdf.name}`
        }],
        from: { email: "your-email@example.com" }, // Sizin e-postanız
        attachments: [{
          content: btoa(pdf.url), // pdf.url'nin base64 versiyonu
          filename: pdf.name,
          type: "application/pdf",
          disposition: "attachment"
        }]
      };
      await swal("Email Sent!", "The PDF has been sent to your email.", "success");
      try {
        const response = await axios({
          method: "post",
          url: "https://api.sendgrid.com/v3/mail/send",  //key
          headers: {
            "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json"
          },
          data: emailData
        });
        await swal("Email Sent!", "The PDF has been sent to your email.", "success");
        console.log(response.data); // Yanıtı istediğiniz gibi işleyebilirsiniz.
      } catch (error) {
        console.error(error);
      }
    }
  },
};
</script>

<style scoped>
</style>
