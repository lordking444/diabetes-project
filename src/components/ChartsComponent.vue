<template>
  <div id="app">
    <div id="chart">
      <button class="export-button" @click="exportChartToPdf">PDF</button>
      <ejs-chart :primaryXAxis="chartPrimaryXAxis" :title="chartTitle"
                 :primaryYAxis="chartPrimaryYAxis" :legendSettings="chartLegendSettings"
                 :tooltip="chartTooltip">
        <e-series-collection>
          <e-series type="Line" :dataSource="salesData" xName="month" yName="salesValue"
                    :marker="chartMarker" name="Time">
          </e-series>
        </e-series-collection>
      </ejs-chart>
      <v-card id="statistics"  class="pa-5 stats-card" outlined>
        <v-card-title>
          <div class="headline">Statistics</div>
        </v-card-title>
        <v-list-item-group color="primary">
          <v-list-item>
            <v-list-item-content>Average Blood Sugar: {{ calculateAverage() }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>Maximum Blood Sugar: {{ findMaxValue() }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>Time of Maximum Blood Sugar: {{ findTimeOfMaxValue() }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>Minimum Blood Sugar: {{ calculateMinValue() }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>Time of Minimum Blood Sugar: {{ findTimeOfMinValue() }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>Standard Deviation of Blood Sugar: {{ calculateStandardDeviation() }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>Median Blood Sugar: {{ calculateMedian() }}</v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-card>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { ChartPlugin, LineSeries, Category, DataLabel, Tooltip, Legend } from '@syncfusion/ej2-vue-charts';
import { getAuth } from "firebase/auth";
import { ref, onValue, getDatabase } from "firebase/database";
import { getStorage, ref as ref_storage, uploadBytes, getDownloadURL } from "firebase/storage";

import swal from "sweetalert";

Vue.use(ChartPlugin);

export default {
  data() {
    return {
      chartPrimaryYAxis: {
        title: 'Blood Sugar Level'
      },
      chartTitle: 'Daily Blood Sugar Analysis',
      chartPrimaryXAxis: {
        valueType: 'Category',
        title: 'Measurement Time'
      },
      chartMarker: {
        dataLabel: {
          visible: true
        }
      },
      chartLegendSettings: {
        visible: true
      },
      chartTooltip: {
        enable: true
      },
      salesData: []
    };
  },
  methods: {
    fetchUserData() {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getDatabase();

      if (user) {
        const userRef = ref(db, 'users/' + user.uid + '/healthData');
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            let formattedData = Object.keys(data).map(key => {
              return {
                month: data[key].measurementTime,
                salesValue: data[key].bloodSugarLevel,
              };
            });
            formattedData.sort((a, b) => {
              return new Date('1970/01/01 ' + a.month) - new Date('1970/01/01 ' + b.month);
            });
            this.salesData = formattedData;
          }
        });
      } else {
        console.log("No user is signed in");
      }
    },
    calculateMinValue() {
      let min = Math.min.apply(Math, this.salesData.map(function(o) { return o.salesValue; }))
      return min;
    },
    findTimeOfMaxValue() {
      let max = this.findMaxValue();
      let timeOfMax = this.salesData.filter(function(o) { return o.salesValue == max; })[0].month;
      return timeOfMax;
    },
    findTimeOfMinValue() {
      let min = this.calculateMinValue();
      let timeOfMin = this.salesData.filter(function(o) { return o.salesValue == min; })[0].month;
      return timeOfMin;
    },
    calculateStandardDeviation() {
      let values = this.salesData.map(function(o) { return o.salesValue; });
      let avg = this.calculateAverage();

      let squareDiffs = values.map(function(value) {
        let diff = value - avg;
        let sqrDiff = diff * diff;
        return sqrDiff;
      });

      let avgSquareDiff = squareDiffs.reduce(function(sum, value){
        return sum + value;
      }, 0) / squareDiffs.length;

      let stdDev = Math.sqrt(avgSquareDiff);
      return stdDev.toFixed(2);
    },
    calculateMedian() {
      let values = this.salesData.map(function(o) { return o.salesValue; }).sort((a,b) => a - b);
      let mid = Math.floor(values.length / 2);

      let median = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
      return median.toFixed(2);
    },
    calculateAverage() {
      let sum = this.salesData.reduce((previous, current) => {
        return previous + current.salesValue;
      }, 0);
      return (sum / this.salesData.length).toFixed(2);
    },
    findMaxValue() {
      let max = Math.max.apply(Math, this.salesData.map(function(o) { return o.salesValue; }))
      return max;
    },
    exportChartToPdf() {
      const currentDate = new Date();
      const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const dateString = currentDate.toLocaleString('en-US', dateOptions).replace(/[/:\s]/g, '');

      const storage = getStorage();
      const originalElement = document.getElementById('chart');
      let elementClone;

      if (process.env.NODE_ENV === 'production') {
        elementClone = originalElement.cloneNode(true); // Clone the chart element
      } else {
        elementClone = originalElement; // Use original element in development mode
      }

      const cropOptions = {
        width: elementClone.offsetWidth,
        height: elementClone.offsetHeight,
        x: 0,
        y: 0
      };

      // Show loading icon
      swal({
        title: "Upload in progress",
        text: "PDF is being uploading...",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false,
        icon: "info",
      });

      import('html2canvas').then((html2canvas) => {
        html2canvas.default(elementClone, { ...cropOptions }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; // PDF width in mm
          const pageHeight = 295; // PDF height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;

          import('jspdf').then((jsPDF) => {
            const doc = new jsPDF.default('p', 'mm');
            let position = 0;

            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              doc.addPage();
              doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }

            const currentUser = getAuth().currentUser;
            const userId = currentUser.uid;
            const storageRef = ref_storage(storage, `users/${userId}/BloodSugarAnalysis_${dateString}.pdf`);
            const pdfBlob = doc.output('blob');

            uploadBytes(storageRef, pdfBlob)
                .then((snapshot) => {
                  console.log('PDF uploaded to Firebase Storage');
                  doc.save(`BloodSugarAnalysis_${dateString}.pdf`);
                  getDownloadURL(snapshot.ref)
                      .then((downloadURL) => {
                        console.log('Download URL:', downloadURL);

                        // Hide the loading icon
                        swal.close();
                        swal("Success!", "PDF saved successfully.", "success");

                        // Remove the cloned chart element
                        if (process.env.NODE_ENV === 'production') {
                          elementClone.remove();
                        }
                      })
                      .catch((error) => {
                        console.error('Error getting download URL:', error);
                        // Handle error
                      });
                })
                .catch((error) => {
                  console.error('Error uploading PDF to Firebase Storage:', error);
                  // Hide the loading icon
                  swal.close();

                  // Show error message
                  swal("Error!", "Failed to upload PDF.", "error");
                });
          });
        });
      });
    }
  },
  mounted() {
    this.fetchUserData();
  },
  provide: {
    chart: [LineSeries, Category, DataLabel, Legend, Tooltip]
  }
};
</script>

<style>
.export-button {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px;
  z-index: 9999;
  background-color: #ff5f5f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.stats-card {
  font-family: 'Roboto', sans-serif;
}

.stats-card .v-list-item__content {
  font-size: 14px;
}
</style>