<template>
  <v-container fluid class="d-flex pa-0">
    <v-card flat class="pa-2 d-flex flex-column flex-grow-1">
      <h5 class="subtitle-2">Empresa:</h5>
      <p>
        {{ getCurrentCompany.name }}
      </p>

      <h5 class="subtitle-2">API expuesta:</h5>
      <p>{{ api_url.origin }}/docs-eat/</p>
      <h5 class="subtitle-2">API Key:</h5>

      <div class="d-flex justify-center align-center flex-grow-1">
        <v-btn
          v-if="!company_api_key"
          small
          outlined
          color="primary"
          :loading="loading.generateAPIKey || loading.getAPIKey"
          @click="generateAPIKey"
          >Generar clave API
        </v-btn>
        <v-card
          v-else
          flat
          class="d-flex flex-column justify-center align-center pa-5"
        >
          <code class="text-body-2 text-center">{{
            company_api_key
          }}</code>
          <br />
          <div>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon @click="copyToClipBoard" color="primary" v-on="on"
                  >mdi-content-copy
                </v-icon>
              </template>
              <span>Copiar clave API</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" color="primary" @click="openDeleteModal"
                  >mdi-delete
                </v-icon>
              </template>
              <span>Eliminar clave</span>
            </v-tooltip>
          </div>
        </v-card>
      </div>
    </v-card>
    <v-card flat outlined class="pa-2" width="500px">
      <v-card-title> Instructivo: </v-card-title>
      <v-card-text>
        <p>
          La clave API permite a otros sistemas hacer peticiones HTTP para
          obtener información de la TCMT. Las respuestas serán enviadas en
          formato JSON.
        </p>
        <h4>Ejemplo de petición (usando la herramienta llamada CURL):</h4>
        <p>
          <code>
            curl -X GET \ <br />
            -H "X-Comp-Api-Key:
            <span class="font-weight-bold">[api-key-value]</span>" \ <br />
            -H "accept: application/json" \ <br />
            {{ api_url }}events/full/search?status=APEN&page=1&page_size=10
          </code>
        </p>
        <h4>Generación de la clave API</h4>
        <p>
          Para generar la clave solo necesita dar click en el botón:
          <v-btn x-small disabled class="ml-2">Crear ApiKEY</v-btn>
        </p>
        <h4>Eliminar clave API</h4>
        <p>
          Una vez creada la clave, ésta podrá ser eliminada presionando el botón
          <v-icon disabled>mdi-delete</v-icon>
        </p>
        <h4>
          <span class="red--text">Importante: </span> a través de la clave API,
          se accede a la totalidad de la información almacenada en la TCMT.
          <span></span>
        </h4>
      </v-card-text>
    </v-card>
    <!--      -->
    <v-dialog v-model="dialog" width="500">
      <v-card :disabled="loading.deleteAPIKey">
        <v-card-title class="text-body-1"
          ><v-icon color="error" class="mr-2">mdi-alert-outline</v-icon>¿Seguro
          que desea eliminar la clave API?</v-card-title
        >
        <v-card-actions class="justify-end">
          <v-btn small text @click="dialog = !dialog" color="secondary"
            >Cerrar</v-btn
          >
          <v-btn
            small
            text
            color="error"
            :loading="loading.deleteAPIKey"
            @click="deleteAPIKey"
            >Eliminar clave</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { eatApi } from "@/apis";
export default {
  name: "ApiKeyManagement",
  data() {
    return {
      apiKey: "",
      dialog: false,
      api_url: import.meta.env.VITE_APP_BASE_URL,
      company_name: "",
      company_api_key: null,
      loading: {
        getAPIKey: false,
        generateAPIKey: false,
        deleteAPIKey: false,
      },
    };
  },
  created() {
    this.getCompanyAPIKey();
  },

  computed: {
    ...mapGetters("user", ["getCurrentCompany"]),
  },

  methods: {
    ...mapActions("facilities", ["getIdCompanyStore"]),
    ...mapMutations(["SET_ALERT"]),

    getCompanyAPIKey() {
      this.loading.getAPIKey = true;
      eatApi
        .getFetcher()
        .get(`/companies/${this.getCurrentCompany.id}/custom-api-key`)
        .then(({ data }) => {
          this.company_api_key = data.results?.company_api_key;
        })
        .catch(() => {})
        .finally(() => {
          this.loading.getAPIKey = false;
        });
    },

    generateAPIKey() {
      this.loading.generateAPIKey = true;
      eatApi
        .getFetcher()
        .put(`/companies/${this.getCurrentCompany.id}/custom-api-key`)
        .then(() => {
          this.getCompanyAPIKey();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Error al generar la clave`,
          });
        })
        .finally(() => {
          this.loading.generateAPIKey = false;
        });
    },

    copyToClipBoard() {
      navigator.clipboard
        .writeText(this.company_api_key)
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: `La clave se copió en el portapapeles.`,
          });
        });
    },

    openDeleteModal() {
      this.dialog = true;
    },

    deleteAPIKey() {
      this.loading.deleteAPIKey = true;
      eatApi
        .getFetcher()
        .delete(`/companies/${this.getCurrentCompany.id}/custom-api-key`)
        .then(() => {
          this.getCompanyAPIKey();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Error al tratar de eliminar la clave`,
          });
        })
        .finally(() => {
          this.loading.deleteAPIKey = false;
          this.dialog = false;
        });
    },
  },
};
</script>

<style scoped>
article {
  margin-bottom: 1rem;
}
</style>
