<template>
  <v-menu
    ref="menu"
    v-model="menu2"
    :close-on-content-click="false"
    :nudge-right="40"
    :return-value.sync="time"
    transition="scale-transition"
    max-width="290px"
    min-width="290px"
    z-index="2"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        dense
        solo
        flat
        outlined
        v-model="dateTime"
        label="Fecha y hora de ocurrencia"
        prepend-inner-icon="mdi-calendar-clock"
        v-on="on"
        :disabled="disabled"
      />
    </template>
    <v-tabs v-model="tab" class="elevation-2" grow>
      <v-tabs-slider />

      <v-tab href="#tab1" class="primary--text">
        <v-icon>mdi-calendar</v-icon>
      </v-tab>

      <v-tab href="#tab2" class="primary--text">
        <v-icon>mdi-clock-outline</v-icon>
      </v-tab>

      <v-tab-item value="tab1">
        <v-date-picker v-model="date" @input="changeDate" />
      </v-tab-item>

      <v-tab-item value="tab2">
        <v-time-picker
          v-if="menu2"
          v-model="actualTime"
          format="24hr"
          @click:hour="changeHour()"
          @click:minute="changeMinute()"
        />
      </v-tab-item>
    </v-tabs>
  </v-menu>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return {
      // date: new Date().toISOString().substr(0, 10),
      time: null,
      // actualTime: '',
      menu2: false,
      tab: "tab1",
    };
  },

  created() {
    if (!this.event.timeFirstStep) this.getActualTime();
    this.set_occurrenceDate(this.dateTime);
  },

  computed: {
    ...mapState(["event"]),

    dateTime: {
      get() {
        return this.datePicker + " " + this.actualTime;
      },
      set(dateTime) {
        this.set_occurrenceDate(dateTime);
      },
    },
    datePicker: function () {
      if (!this.date) return null;
      const [year, month, day] = this.date.split("-");
      return `${day}-${month}-${year}`;
    },
    date: {
      get() {
        return this.event.dateFirstStep;
      },
      set(date) {
        this.set_dateFirstStep(date);
      },
    },
    actualTime: {
      get() {
        return this.event.timeFirstStep;
      },
      set(time) {
        this.set_timeFirstStep(time);
      },
    },
  },

  methods: {
    ...mapMutations("event", [
      "set_occurrenceDate",
      "set_dateFirstStep",
      "set_timeFirstStep",
    ]),

    getActualTime() {
      let time = new Date();
      let hour = time.getHours();
      let minute = time.getMinutes();
      // let second = time.getSeconds()
      if (minute.toString().length === 1) {
        this.actualTime = hour + ":0" + minute;
      } else {
        this.actualTime = hour + ":" + minute;
      }
    },

    changeDate() {
      this.tab = "tab2";
      this.set_occurrenceDate(this.dateTime);
    },

    changeHour() {
      this.set_occurrenceDate(this.dateTime);
    },

    changeMinute() {
      this.menu2 = false;
      this.tab = "tab1";
      this.set_occurrenceDate(this.dateTime);
    },
  },

  props: ["disabled"],
};
</script>

<style />
