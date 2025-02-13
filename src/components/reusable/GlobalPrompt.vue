<template>
  <v-dialog v-model="active" :disabled="btnLoading" persistent max-width="400">
    <v-card tile>
      <v-card-title>
        <span>{{ title }}</span>
        <v-spacer />
        <v-icon large :color="resolveIcon.color">{{ resolveIcon.icon }}</v-icon>
      </v-card-title>

      <v-card-text class="body-1 py-5 mb-5 text-center">
        <slot name="message">¿Está seguro?</slot>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <slot name="cancel">
          <v-btn color="secondary" text outlined @click="$emit('evt-no')">
            cancelar
          </v-btn>
        </slot>

        <slot name="accept">
          <v-btn color="primary" elevation="0" @click="$emit('evt-yes')">
            aceptar
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "GlobalPrompt",

  data() {
    return {
      btnLoading: false,
    };
  },

  props: {
    active: {
      type: Boolean,
      default: false,
      required: true,
    },
    title: {
      type: String,
      default: "Atención",
    },
    promptType: {
      type: String,
      default: "none",
    },
  },

  computed: {
    resolveIcon() {
      switch (this.promptType) {
        case "none":
          return "";
        case "alert":
          return { icon: "mdi-alert", color: "warning" };
        case "question":
          return { icon: "mdi-help-circle-outline", color: "warning" };
        default:
          return "";
      }
    },
  },
};
</script>

<style scoped></style>
