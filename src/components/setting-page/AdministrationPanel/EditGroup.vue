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
        Aca podrás crear distintos tipo de entidades para asociar a los
        Establecimientos
      </v-card-subtitle>
      <v-card-text>
        <v-form class="flex-grow-1 pr-5" v-model="valid">
          <div class="pb-1">Grupo / Regiones</div>
          <v-text-field
            v-model="groupType.name"
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
  name: "EditGroup",
  data() {
    return {
      dialog: true,
      valid: false,
      sector: {},
      groupType: [],
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
        .get(`facilities/groups/${this.$route.params.id}`)
        .then(({ data }) => {
          this.groupType = data.results;
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
      const { id, ...groupType } = this.groupType;

      const requestMethod = this.isNewSectorType ? "post" : "put";
      const requestUrl = this.isNewSectorType
        ? `/facilities/groups/`
        : `/facilities/groups/${id}`;
      eatApi
        .getFetcher()
        [requestMethod](requestUrl, groupType)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El grupo se guardó con éxito`,
          });
          this.$emit("load-groups");
          this.$router.go(-1);
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al guardar el tipo de grupo`,
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
