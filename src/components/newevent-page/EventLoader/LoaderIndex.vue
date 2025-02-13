<template>
  <v-row class="ml-0">
    <div v-for="i in index" :key="i.tag">
      <v-chip
        v-if="i.show()"
        small
        outlined
        :style="{ borderColor: i.completed() ? '#44CC7B' : '#FF7373' }"
        class="mr-3"
        @click="
          $vuetify.goTo(`#${i.tag}-step`, {
            container: '#loader-form-container',
            offset: -30,
          })
        "
        >{{ i.name }}
        <v-scale-transition>
          <v-icon small right :color="i.completed() ? 'accent' : 'error'"
            >{{ i.completed() ? "mdi-check-bold" : "mdi-alert-circle-outline" }}
          </v-icon>
        </v-scale-transition>
      </v-chip>
    </div>
  </v-row>
</template>

<script>
import validateEventSteps from "@/components/newevent-page/EventLoader/validateEventSteps";
export default {
  name: "LoaderIndex",
  mixins: [validateEventSteps],
  data() {
    return {
      index: [
        {
          name: "General",
          tag: "first",
          completed: () => this.isValidStepOne,
          show: () => true,
        },
        {
          name: "Resumen y/o descripción",
          tag: "second",
          completed: () => this.isValidStepTwo,
          show: () =>
            this.event.availableFields.summary ||
            this.event.availableFields.description,
        },
        {
          name: "Participantes",
          tag: "third",
          completed: () => this.isValidStepThree,
          show: () =>
            this.event.availableFields.leader ||
            this.event.availableFields.participants,
        },
        {
          name: "Equipo",
          tag: "fourth",
          completed: () => this.isValidStepFour,
          show: () => this.event.availableFields.equipment,
        },
        {
          name: "HCA",
          tag: "fifth",
          completed: () => this.isValidStepFive,
          show: () => true,
        },
      ],
    };
  },
};
</script>

<style scoped></style>
