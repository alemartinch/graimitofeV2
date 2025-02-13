<template>
  <v-menu v-model="menu" top offset-y :close-on-content-click="false">
    <template v-slot:activator="{ on }">
      <t-btn-secondary v-on="on">nueva etiqueta </t-btn-secondary>
    </template>
    <v-card class="pa-2" :disabled="loading">
      <div class="text-body-2 py-2">Nombre</div>
      <v-text-field
        v-model="tagName"
        maxlength="15"
        autofocus
        solo
        outlined
        dense
        flat
        hide-details
      ></v-text-field>
      <div class="text-body-2 py-2">Color</div>
      <v-color-picker
        v-model="color"
        canvas-height="100"
        hide-mode-switch
        hide-inputs
      ></v-color-picker>
      <v-card-actions class="justify-end pa-0">
        <v-chip v-if="tagName" class="mr-3" small outlined :color="color">{{
          tagName.toUpperCase()
        }}</v-chip>
        <t-btn-primary @click="createNewTag" :loading="loading"
          >crear</t-btn-primary
        >
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
<script>
import { eatApi } from "@/apis";
import { mapMutations } from "vuex";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "EventTagDialogCreateNewTag",
  components: { TBtnPrimary, TBtnSecondary },
  data() {
    return {
      menu: false,
      tagName: "",
      color: "#000000",
      loading: false,
    };
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),

    createNewTag() {
      this.loading = true;
      this.tagName = this.tagName.toUpperCase();
      eatApi
        .getFetcher()
        .post("/tags/", {
          name: this.tagName.toUpperCase(),
          colour: this.color,
        })
        .then(({ data }) => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Etiqueta generada exitosamente",
          });
          this.$emit("tag-created", data.results);
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Error al generar la etiqueta",
          });
        })
        .finally(() => {
          this.loading = false;
          this.menu = false;
        });
    },
  },
};
</script>
