<template>
  <v-dialog v-model="dialog" persistent width="600">
    <v-card v-if="loading.getSectorType || loading.getFacilities" class="pa-2">
      <v-progress-linear indeterminate />
    </v-card>
    <v-card v-else>
      <v-card-title class="justify-space-between">
        <span>{{
          isNewSectorType ? "Nuevo tipo sector" : "Editar tipo sector"
        }}</span>
      </v-card-title>
      <v-card-subtitle class="mt-1">
        Aca podrás crear distintos tipo de sectores para asociar a los mismos
      </v-card-subtitle>
      <v-card-text>
        <v-form class="flex-grow-1 pr-5" v-model="valid">
          <div class="pb-1">Tipo de sector</div>
          <v-text-field
            v-model="sectorType.name"
            class="text-body-2"
            outlined
            dense
            solo
            flat
            required
            :rules="[(v) => !!v || 'Este campo es obligatorio']"
          ></v-text-field>
          <div class="pb-1">Descripción</div>
          <v-text-field
            v-model="sectorType.description"
            class="text-body-2"
            outlined
            dense
            solo
            flat
            required
            :rules="[(v) => !!v || 'Este campo es obligatorio']"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions dense class="justify-end">
        <v-btn
          class="mr-3"
          small
          text
          color="secondary"
          @click="$router.go(-1)"
        >
          cerrar
        </v-btn>
        <v-btn
          small
          text
          color="primary"
          :loading="loading.saveSector"
          :disabled="!valid"
          @click="saveSectorType"
        >
          {{ isNewSectorType ? "Crear tipo sector" : "Guardar cambios" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { eatApi } from "@/apis";
import { mapActions } from "vuex";

export default {
  name: "EditSectorType",
  data() {
    return {
      dialog: true,
      valid: false,
      sector: {},
      sectorType: [],
      facilities: [],
      loading: {
        getSectorType: false,
        saveSectorType: false,
        getFacilities: false,
      },
    };
  },

  created() {
    if (!this.isNewSectorType) {
      this.loading.getSectorType = true;
      this.getSectorType();
    }
  },

  computed: {
    isNewSectorType() {
      return this.$route.params.id === "new";
    },
  },

  methods: {
    ...mapActions(["set_alert"]),

    getSectorType() {
      eatApi
        .getFetcher()
        .get(`sectors/types/${this.$route.params.id}`)
        .then(({ data }) => {
          this.sectorType = data.results;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al cargar los datos del tipo sector`,
          });
          this.$router.go(-1);
        })
        .finally(() => {
          this.loading.getSectorType = false;
          this.loading.saveSectorType = false;
        });
    },

    saveSectorType() {
      this.loading.saveSectorType = true;
      // eslint-disable-next-line no-unused-vars
      const { id, ...sectorType } = this.sectorType;

      const requestMethod = this.isNewSectorType ? "post" : "put";
      const requestUrl = this.isNewSectorType
        ? `/sectors/types/`
        : `/sectors/types/${id}`;
      eatApi
        .getFetcher()
        [requestMethod](requestUrl, sectorType)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El tipo de sector se guardó con éxito`,
          });
          this.$emit("load-sectors-type");
          this.$router.go(-1);
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al guardar el tipo de sector`,
          });
        })
        .finally(() => {
          this.loading.saveSectorType = false;
        });
    },
  },
};
</script>

<style scoped></style>
