<template>
  <v-dialog v-model="dialog" persistent width="600">
    <v-card v-if="loading.getSector || loading.getFacilities" class="pa-2">
      <v-progress-linear indeterminate />
    </v-card>
    <v-card v-else>
      <v-card-title class="justify-space-between">
        <span>{{ isNewSector ? "Nuevo sector" : "Editar sector" }}</span>
        <v-btn
          v-if="newTypeSector"
          small
          outlined
          color="primary"
          elevation="0"
          class="ml-2"
          @click="showNewTypeSector"
        >
          Volver a sectores
        </v-btn>
      </v-card-title>
      <v-card-subtitle class="mt-1">
        Aca podras crear nuevos sectores y asociarlo un establecimiento.
      </v-card-subtitle>
      <!--      panel tipo secto-->
      <v-card-text>
        <v-form class="flex-grow-1 pr-5" v-model="valid">
          <div class="pb-1">Nombre</div>
          <v-text-field
            v-model="sector.name"
            class="text-body-2"
            outlined
            dense
            solo
            flat
            required
            :rules="[(v) => !!v || 'Este campo es obligatorio']"
          ></v-text-field>
          <div class="pb-1">Tipo de Sector</div>
          <v-autocomplete
            v-model="sector.sector_type"
            :items="sectorsType"
            item-text="name"
            item-value="id"
            class="text-body-2"
            outlined
            dense
            solo
            flat
            required
          ></v-autocomplete>
          <div class="pb-1">Descripción</div>
          <v-text-field
            v-model="sector.description"
            class="text-body-2"
            outlined
            dense
            solo
            flat
            :rules="[(v) => !!v || 'Este campo es obligatorio']"
          ></v-text-field>
          <div class="pb-1">Establecimiento asociado</div>
          <!--          <v-text-field-->
          <!--            v-if="!isNewSector"-->
          <!--            disabled-->
          <!--            v-model="sector.facility.name"-->
          <!--            class="text-body-2"-->
          <!--            outlined-->
          <!--            dense-->
          <!--            solo-->
          <!--            flat-->
          <!--            required-->
          <!--            :rules="[(v) => !!v || 'Este campo es obligatorio']"-->
          <!--          ></v-text-field>-->
          <AsyncCombobox
            v-model="sector.facility"
            :api="eatApi().getFetcher()"
            url="/facilities/search"
            item-text="name"
            item-value="id"
            class="text-body-2"
            search-param="keyword"
            return-object
            :combobox="false"
            outlined
            dense
            solo
            flat
            required
            :rules="[(v) => !!v || 'Este campo es obligatorio']"
          >
            <template v-slot:item="{ item }">
              <span>{{ item.name }}</span>
            </template>
            <template v-slot:selection="data">
              <v-chip
                class="py-3"
                v-bind="data.attrs"
                :input-value="data.selected"
                small
              >
                {{ data.item | facilityName }}
              </v-chip>
            </template>
          </AsyncCombobox>
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
          @click="saveSector"
        >
          {{ isNewSector ? "Crear sector" : "Guardar cambios" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { eatApi } from "@/apis";
import { mapActions } from "vuex";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import { facilityName } from "@/Filters";

export default {
  name: "EditSector",
  components: { AsyncCombobox },
  data() {
    return {
      dialog: true,
      valid: false,
      sector: {},
      sectorsType: [],
      other: {},
      options: { itemsPerPage: 50 },
      facilities: [],
      newTypeSector: false,
      loading: {
        getSector: false,
        saveSector: false,
        getFacilities: false,
        getSectorsType: false,
      },
    };
  },

  created() {
    if (!this.isNewSector) {
      this.loading.getSector = true;
      this.loading.getSectorsType = true;
      this.getSector();
    } else {
      this.loading.getFacilities = true;
      this.loading.getSectorsType = true;
      this.getFacilities();
    }
    this.getFacilities();
    this.loading.getSectorsType = true;
    this.getSectorsType();
  },

  computed: {
    isNewSector() {
      return this.$route.params.id === "new";
    },
  },

  methods: {
    facilityName,
    ...mapActions(["set_alert"]),
    eatApi() {
      return eatApi;
    },

    showNewTypeSector() {
      this.newTypeSector = !this.newTypeSector;
    },

    getSector() {
      eatApi
        .getFetcher()
        .get(`sectors/${this.$route.params.id}`)
        .then(({ data }) => {
          this.sector = data.results;
          this.sector.facility = data.results.facility;
          this.sector.sector_type = data.results.sector_type?.id;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al cargar los datos del sector`,
          });
          this.$router.go(-1);
        })
        .finally(() => {
          this.loading.getSector = false;
          this.loading.saveSector = false;
        });
    },

    getSectorsType() {
      this.loading.getSectorsType = true;
      eatApi
        .getFetcher()
        .get("/sectors/types/", {
          params: {
            page: this.page,
            page_size: this.options.itemsPerPage,
          },
        })
        .then(({ data }) => {
          const { totalItems, results } = data;
          this.sectorsType = results;
          this.totalItems = totalItems;
        })
        .finally(() => {
          this.loading.getSectorsType = false;
        });
    },

    getFacilities() {
      eatApi
        .getFetcher()
        .get(`facilities/`, {
          params: {
            page_size: 50,
          },
        })
        .then(({ data }) => {
          this.facilities = data.results;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al cargar los establecimientos`,
          });
        })
        .finally(() => {
          this.loading.getFacilities = false;
        });
    },

    saveSector() {
      this.loading.saveSector = true;
      // eslint-disable-next-line no-unused-vars
      this.sector.facility = this.sector.facility.id;
      const { id, ...sector } = this.sector;

      const requestMethod = this.isNewSector ? "post" : "put";
      const requestUrl = this.isNewSector ? `/sectors/` : `/sectors/${id}`;
      eatApi
        .getFetcher()
        [requestMethod](requestUrl, sector)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El sector se guardó con éxito`,
          });
          this.$emit("load-sectors");
          this.$router.go(-1);
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al guardar el sector`,
          });
        })
        .finally(() => {
          this.loading.saveSector = false;
        });
    },
  },
};
</script>

<style scoped></style>
