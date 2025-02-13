<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-form v-model="isValidStep" ref="form">
      <!-- DESCRIPCIÓN Y RESUMEN -->
      <v-row v-if="event.availableFields.summary" class="ma-0">
        <v-col cols="12" md="6">
          <div
            class="body-2 my-2"
            v-if="
              event.availableFields.summary && event.availableFields.description
            "
          >
            Resumen
          </div>
          <v-textarea
            v-model="summary"
            name="resumen"
            :placeholder="!event.availableFields.summary ? 'No aplica' : ''"
            :disabled="!event.availableFields.summary"
            rows="1"
            auto-grow
            solo
            flat
            outlined
            dense
            no-resize
            :rules="resRules"
            @input="updateEvent"
          />
        </v-col>
      </v-row>
      <v-row v-if="event.availableFields.description" class="ma-0">
        <v-col cols="12" md="6" class="py-0">
          <div
            class="body-2 my-2"
            v-if="
              event.availableFields.summary && event.availableFields.description
            "
          >
            Descripción
          </div>
          <v-textarea
            v-model="description"
            name="descripcion"
            no-resize
            :placeholder="!event.availableFields.description ? 'No aplica' : ''"
            solo
            flat
            outlined
            dense
            auto-grow
            :rules="desRules"
            :disabled="!event.availableFields.description"
            @input="updateEvent"
          />
        </v-col>
      </v-row>
      <v-row v-if="event.availableFields.learning_experience" class="ma-0">
        <v-col cols="12" md="4" class="py-0">
          <v-switch
            dense
            v-model="learningExp"
            label="Aprendizaje para compartir"
            inset
            required
            :disabled="!event.availableFields.learning_experience"
            @change="update_event"
          >
          </v-switch>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { INPUTS_LENGTH } from "@/mixins/globals";

export default {
  name: "SecondStep",
  data() {
    return {
      isValidStep: true,
      typing: false,
      resRules: [
        (v) =>
          (v.length <= INPUTS_LENGTH.EVENT_SUMMARY && v.length > 0) ||
          `Max ${INPUTS_LENGTH.EVENT_SUMMARY} caracteres`,
      ],
      desRules: [
        (v) =>
          (v.length <= INPUTS_LENGTH.EVENT_DESCRIPTION && v.length > 0) ||
          `Max ${INPUTS_LENGTH.EVENT_DESCRIPTION} caracteres`,
      ],
    };
  },

  computed: {
    ...mapState(["event"]),

    summary: {
      get() {
        return this.event.temp_event.summary;
      },
      set(summary) {
        this.set_summary(summary);
      },
    },

    description: {
      get() {
        return this.event.temp_event.description;
      },
      set(description) {
        this.set_description(description);
      },
    },

    learningExp: {
      get() {
        return this.event.temp_event.learning_experience;
      },
      set(learningExp) {
        this.set_learningExp(learningExp);
      },
    },
  },

  watch: {
    "event.temp_event.event_origin"(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.$refs.form.resetValidation();
      }
    },
  },

  methods: {
    ...mapMutations("event", [
      "set_occurrenceDate",
      "set_summary",
      "set_description",
      "set_learningExp",
    ]),

    ...mapActions("event", ["update_event"]),

    updateEvent() {
      if (!this.typing) {
        this.typing = true;
        this.update_event();
        setTimeout(() => {
          this.typing = false;
        }, 5000);
      }
    },
  },
};
</script>

<style />
