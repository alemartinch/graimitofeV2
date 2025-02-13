<template>
  <v-menu
    v-model="dateMenu"
    :close-on-content-click="false"
    transition="scale-transition"
    min-width="290px"
    v-bind="$attrs"
  >
    <template v-slot:activator="{ on }">
      <slot v-bind:activator="on" />
    </template>
    <v-date-picker
      v-model="date"
      @input="changeDate"
      no-title
      :allowed-dates="allowedDates"
    ></v-date-picker>
  </v-menu>
</template>

<script>
export default {
  name: "DatePickerMenu",
  props: {
    allowedDates: {
      type: Function,
      default: (d) => d,
    },
  },
  data() {
    return {
      dateMenu: false,
      date: "",
    };
  },
  methods: {
    changeDate() {
      this.dateMenu = false;
      this.$emit("change-date", this.date);
    },
  },
};
</script>

<style scoped></style>
