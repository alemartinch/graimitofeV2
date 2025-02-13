<template>
  <v-dialog v-model="dialog" persistent width="600">
    <v-card v-if="loading.getTag" class="pa-2">
      <v-progress-linear indeterminate />
    </v-card>
    <v-card v-else>
      <v-card-title>
        {{ isNewTag ? "Nueva etiqueta" : "Editar etiqueta" }}
      </v-card-title>
      <v-card-text>
        <v-form v-model="valid">
          <div class="text-body-2 pb-1">Nombre</div>
          <v-text-field
            v-model="tag.name"
            maxlength="20"
            class="text-body-2"
            outlined
            dense
            solo
            flat
            required
            :rules="[(v) => !!v || 'Este campo es obligatorio']"
          ></v-text-field>
          <div class="d-flex align-center">
            <div>
              <div class="text-body-2 pb-2">Color</div>
              <v-color-picker
                v-model="tag.colour"
                canvas-height="100"
                hide-mode-switch
                hide-inputs
              ></v-color-picker>
            </div>
            <div class="d-flex justify-center align-center flex-grow-1">
              <v-chip v-if="tag.name" small outlined :color="tag.colour">
                {{ tag.name.toUpperCase() }}
              </v-chip>
            </div>
          </div>
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
          :loading="loading.saveTag"
          :disabled="!valid"
          @click="saveTag"
        >
          {{ isNewTag ? "Crear etiqueta" : "Guardar cambios" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { eatApi } from "@/apis";
import { mapActions } from "vuex";

export default {
  name: "EditTag",
  data() {
    return {
      dialog: true,
      valid: false,
      tag: {
        name: "",
        colour: "#000000",
      },
      loading: { getTag: false, saveTag: false },
    };
  },

  created() {
    if (!this.isNewTag) {
      this.loading.getTag = true;
      this.getTag();
    }
  },

  computed: {
    isNewTag() {
      return this.$route.params.id === "new";
    },
  },

  methods: {
    ...mapActions(["set_alert"]),

    getTag() {
      eatApi
        .getFetcher()
        .get(`tags/${this.$route.params.id}`)
        .then(({ data }) => {
          this.tag = data.results;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al cargar los datos de la etiqueta`,
          });
          this.$router.go(-1);
        })
        .finally(() => {
          this.loading.getTag = false;
          this.loading.saveTag = false;
        });
    },

    saveTag() {
      this.loading.saveTag = true;
       
      const { id, ...tag } = this.tag;

      const requestMethod = this.isNewTag ? "post" : "put";
      const requestUrl = this.isNewTag ? `/tags/` : `/tags/${id}`;
      eatApi
        .getFetcher()
        [requestMethod](requestUrl, tag)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `La etiqueta se guardó con éxito`,
          });
          this.$emit("load-tags");
          this.$router.go(-1);
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al guardar la etiqueta`,
          });
        })
        .finally(() => {
          this.loading.saveTag = false;
        });
    },
  },
};
</script>

<style scoped></style>
