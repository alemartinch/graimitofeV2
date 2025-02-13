<template>
  <v-menu :close-on-content-click="false" open-delay="500">
    <template v-slot:activator="{ on }">
      <v-chip
        v-on="on"
        :value="sector.name || ''"
        small
        class="ml-2 mb-2"
        style="background-color: white; border: 1px solid #449cc9"
      >
        {{ sector.name || "" }}
      </v-chip>
    </template>
    <!--    <v-card class="pa-2" min-width="200">-->
    <!--      <div class="subtitle-2">{{ sector.name }}</div>-->
    <!--      <p class="text-body-2">{{ sector.description || "Sin descripción." }}</p>-->
    <!--      <div class="d-flex justify-end">-->
    <!--        <v-btn-->
    <!--          small-->
    <!--          text-->
    <!--          color="error"-->
    <!--          :loading="deleteSectorLoading"-->
    <!--          >Eliminar</v-btn-->
    <!--        >-->
    <!--      </div>-->
    <!--    </v-card>-->
  </v-menu>
</template>
<script>
import { eatApi } from "@/apis";
import { mapMutations } from "vuex";

export default {
  name: "SectorChip",
  props: {
    sector: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      deleteSectorLoading: false,
    };
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    deleteSector() {
      this.deleteSectorLoading = true;
      eatApi
        .getFetcher()
        .delete(`sectors/${this.sector.id}`)
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "El sector se eliminó correctamente",
          });
          this.$emit("load-facility");
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un error al tratar de eliminar el sector",
          });
        })
        .finally(() => {
          this.deleteSectorLoading = false;
        });
    },
  },
};
</script>
