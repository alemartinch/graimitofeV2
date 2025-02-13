<template>
  <v-dialog v-model="dialog" persistent width="800">
    <v-card v-if="loading.getFacility" class="pa-2">
      <v-progress-linear indeterminate />
    </v-card>
    <v-card
      v-else
      :disabled="loading.saveSector || loading.saveFacility || newSectorMenu"
    >
      <v-card-title>
        {{ isNewFacility ? "Nuevo establecimiento" : "Editar establecimiento" }}
        <v-spacer />
        <v-icon v-if="loading.saveSector" color="primary"
          >mdi-loading mdi-spin</v-icon
        >
      </v-card-title>
      <v-card-text class="d-flex">
        <v-form class="flex-grow-1 pr-5" v-model="valid">
          <div class="pb-1">Nombre del establecimiento</div>
          <v-text-field
            v-model="facility.name"
            class="text-body-2"
            outlined
            dense
            solo
            flat
            required
            :rules="[(v) => !!v || 'Este campo es obligatorio']"
          ></v-text-field>
          <div class="d-flex flex-column">
            <div class="flex-grow-1">
              <div class="pb-1">Dirección</div>
              <v-text-field
                v-model="facility.address"
                class="text-body-2"
                outlined
                dense
                solo
                flat
                required
              >
              </v-text-field>
            </div>
            <div class="flex-grow-1">
              <div class="pb-1">Ubicación</div>
              <v-text-field
                v-model="facility.location"
                class="text-body-2"
                outlined
                dense
                solo
                flat
                required
              ></v-text-field>
            </div>
            <div class="flex-grow-1">
              <div class="pb-1">Provincia</div>
              <v-autocomplete
                v-model="facility.state"
                :items="getStates"
                item-text="name"
                item-value="id"
                class="text-body-2"
                outlined
                dense
                solo
                flat
                required
              ></v-autocomplete>
            </div>
            <!--            <div class="flex-grow-1">-->
            <!--              <div class="pb-1">Regional</div>-->
            <!--              <v-autocomplete-->
            <!--                v-model="facility.facility_group"-->
            <!--                :items="regions"-->
            <!--                item-text="name"-->
            <!--                item-value="id"-->
            <!--                class="text-body-2"-->
            <!--                outlined-->
            <!--                dense-->
            <!--                solo-->
            <!--                flat-->
            <!--              ></v-autocomplete>-->
            <!--            </div>-->
          </div>
          <div class="d-flex">
            <div class="flex-grow-1">
              <div class="pb-1">Email</div>
              <v-text-field
                v-model="facility.email"
                class="text-body-2"
                outlined
                dense
                solo
                flat
                type="mail"
                required
              ></v-text-field>
            </div>
            <div class="flex-grow-1 ml-5">
              <div class="pb-1">Teléfono</div>
              <v-text-field
                v-model="facility.phone"
                class="text-body-2"
                outlined
                dense
                solo
                flat
                required
              ></v-text-field>
            </div>
          </div>
        </v-form>
        <div class="pl-2" style="width: 400px">
          <div class="pb-1">
            Sectores ({{ facility.sectors.length }})
            <v-menu
              v-model="newSectorMenu"
              :close-on-content-click="false"
              bottom
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  plain
                  small
                  color="primary"
                  :ripple="false"
                  v-on="on"
                  disabled
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text>
                  <h6 class="subtitle-2">
                    Nuevo sector para {{ facility.name }}
                  </h6>
                  <v-form class="mt-5">
                    <v-text-field
                      v-model="sector.name"
                      class="text-body-2"
                      label="Nombre del sector"
                      outlined
                      dense
                      required
                    ></v-text-field>
                    <v-textarea
                      v-model="sector.description"
                      class="text-body-2"
                      label="Descripción"
                      rows="1"
                      auto-grow
                      outlined
                      dense
                      required
                    ></v-textarea>
                  </v-form>
                </v-card-text>
                <v-card-actions class="justify-end">
                  <v-btn
                    small
                    text
                    color="secondary"
                    @click="newSectorMenu = false"
                    >Cancelar</v-btn
                  >
                  <v-btn small text color="primary" @click="saveSector"
                    >Guardar sector</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-menu>
          </div>
          <p v-if="isNewFacility">
            Los sectores podrán asignarse luego de crear el establecimiento.
          </p>
          <p v-else-if="!facility.sectors.length">
            No se han agregado sectores a este establecimiento.
          </p>
          <SectorChip
            v-else
            v-for="sector in facility.sectors"
            :key="sector.id"
            :sector="sector"
            v-on:load-facility="getFacility"
          />
        </div>
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
          :loading="loading.saveFacility"
          :disabled="!valid"
          @click="saveFacility"
        >
          {{ isNewFacility ? "Crear establecimiento" : "Guardar cambios" }}
        </v-btn>
      </v-card-actions>
      <!--      <v-dialog v-model="openNewSectorDialog" persistent width="400">-->
      <!--      </v-dialog>-->
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { eatApi } from "@/apis";
import SectorChip from "@/components/setting-page/AdministrationPanel/SectorChip.vue";

export default {
  name: "EditFacility",
  components: { SectorChip },

  data() {
    return {
      dialog: true,
      loading: {
        getFacility: false,
        saveFacility: false,
        saveSector: false,
        regions: false,
      },
      regions: [],
      valid: false,
      facility: {
        sectors: [],
      },
      sector: {},
      rules: {
        required: (value) => !!value || "Campo requerido",
        length: (value) =>
          value.length >= 3 || "Debe ingresar al menos 3 letras",
        lengthPhone: (value) =>
          value.length >= 7 || "Debe ingresar al menos 7 numeros",
        lengthUser: (value) =>
          value.length >= 5 || "Debe ingresar al menos 5 letras",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Mail invalido";
        },
      },
      openNewSectorDialog: false,
      newSectorMenu: false,
    };
  },

  created() {
    this.getRegions();
    if (!this.isNewFacility) {
      this.loading.getFacility = true;
      this.getFacility();
      this.getRegions();
    }
  },

  computed: {
    ...mapState(["user"]),
    ...mapGetters("companies", ["getStates"]),
    isNewFacility() {
      return this.$route.params.id === "new";
    },
  },

  methods: {
    ...mapActions(["set_alert"]),

    getRegions() {
      eatApi
        .getFetcher()
        .get("facilities/groups/")
        .then(({ data }) => {
          this.regions = data.results;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al cargar los datos del grupos`,
          });
          this.$router.go(-1);
        })
        .finally(() => {
          this.loading.getRegions = false;
        });
    },

    getFacility() {
      eatApi
        .getFetcher()
        .get(`facilities/${this.$route.params.id}`)
        .then(({ data }) => {
          this.facility = data.results;
          this.facility.facility_group = data.results.facility_group?.id;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al cargar los datos del establecimiento`,
          });
          this.$router.go(-1);
        })
        .finally(() => {
          this.loading.getFacility = false;
          this.loading.saveSector = false;
        });
    },

    saveFacility() {
      this.loading.saveFacility = true;
      // eslint-disable-next-line no-unused-vars
      const { id, company, managers, sectors, ...facility } = this.facility;
      if (this.isNewFacility) facility.company = this.user.company.id;
      const requestMethod = this.isNewFacility ? "post" : "put";
      const requestUrl = this.isNewFacility
        ? `/facilities/`
        : `/facilities/${id}`;
      eatApi
        .getFetcher()
        [requestMethod](requestUrl, facility)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El establecimiento se guardó con éxito`,
          });
          this.$emit("load-facilities");
          this.$router.go(-1);
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al guardar el establecimiento`,
          });
        })
        .finally(() => {
          this.loading.saveFacility = false;
        });
    },

    saveSector() {
      this.newSectorMenu = false;
      this.loading.saveSector = true;
      eatApi
        .getFetcher()
        .post("sectors/", { ...this.sector, facility: this.facility.id })
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El sector se creó con éxito`,
          });
          this.getFacility();
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al crear el sector`,
          });
          this.loading.saveSector = false;
        });
    },
  },
};
</script>

<style scoped>
.mySelect {
}
</style>
