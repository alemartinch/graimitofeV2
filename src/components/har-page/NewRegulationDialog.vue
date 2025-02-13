<template>
  <v-dialog :value="true" width="800" persistent>
    <v-card>
      <v-card-title>{{
        har.regulation.id
          ? `Editar requerimiento ${har.regulation.id}`
          : "Nuevo requerimiento"
      }}</v-card-title>
      <v-card-subtitle class="caption error--text"
        >* (campos obligatorios)</v-card-subtitle
      >
      <div class="px-6" style="height: 450px; overflow: auto">
        <v-form v-model="valid" ref="form" autocomplete="false">
          <v-row class="my-2">
            <v-col
              v-for="(field, index) in formFields"
              :key="index"
              :cols="field.cols"
              class="mb-3 py-0"
              v-show="field.visible"
            >
              <div class="text-body-2">
                {{ field.label }}
                <span v-show="field.required" style="color: red">*</span>
              </div>
              <template v-if="field.type === 'async'">
                <component
                  v-model="regulation[field.model]"
                  :is="field.component"
                  v-bind="field.attrs"
                  v-on="field.listeners"
                  outlined
                  dense
                  solo
                  flat
                >
                  <template v-slot:item="{ item }">
                    <span>{{ item.name }}</span>
                  </template>
                  <template v-slot:selection="{ item }">
                    <span>{{ item.name || item }}</span>
                  </template>
                </component>
              </template>
              <template v-else-if="field.type === 'date'">
                <v-menu
                  v-model="menu"
                  transition="scale-transition"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on }">
                    <component
                      :is="field.component"
                      :value="dateFormatted"
                      v-bind="field.attrs"
                      v-on="on"
                      outlined
                      dense
                      solo
                      flat
                    />
                  </template>
                  <v-date-picker
                    v-model="regulation[field.model]"
                    @input="menu = false"
                    no-title
                  ></v-date-picker>
                </v-menu>
              </template>
              <template v-else>
                <component
                  v-model="regulation[field.model]"
                  :is="field.component"
                  :items="field.items"
                  v-bind="field.attrs"
                  v-on="field.listeners"
                  outlined
                  dense
                  solo
                  flat
                />
              </template>
            </v-col>
          </v-row>
        </v-form>
      </div>
      <v-card-actions class="justify-end">
        <t-btn-secondary @click="closePanel" :disabled="loading.saveRegulation"
          >cancelar</t-btn-secondary
        >
        <t-btn-primary
          @click="saveRegulation"
          :disabled="!valid || loading.saveRegulation"
          :loading="loading.saveRegulation"
          >guardar</t-btn-primary
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { tcmtRegApi } from "@/apis";
import { mapActions, mapMutations, mapState } from "vuex";
import { Validations } from "@/mixins/Validations";
import { VSelect, VTextField, VTextarea } from "vuetify/lib";
import { INPUTS_LENGTH, TIERS } from "@/mixins/globals";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import companies from "@/store/modules/companies";
export default {
  name: "NewRegulationDialog",
  components: { TBtnPrimary, TBtnSecondary },
  mixins: [Validations],
  data() {
    return {
      dialog: true,
      valid: false,
      menu: false,
      loading: {
        saveRegulation: false,
        fetchAuthorities: false,
      },
      authorities: [],
      search: null,
      regulation: {
        tier: null,
        authority_id: null,
        regulation_code: "",
        link: "",
        issue_year: "",
        last_update_year: "",
        implementation_date: "",
        subject: "",
        review: "",
        obligations: "",
        analysis: "",
        observations: "",
        process_area_id: null,
      },
      statesArg: companies.state.states,
    };
  },

  created() {
    this.fetchAuthorities();
    if (this.har.regulation.id) {
      const {
        id,
        tier,
        authority,
        regulation_code,
        link,
        issue_year,
        last_update_year,
        implementation_date,
        subject,
        review,
        obligations,
        analysis,
        observations,
        process_area_id,
      } = this.har.regulation;
      this.regulation = {
        id,
        tier,
        authority,
        regulation_code,
        link,
        issue_year,
        last_update_year,
        implementation_date,
        subject,
        review,
        obligations,
        analysis,
        observations,
        process_area_id,
      };
    }
  },

  computed: {
    ...mapState(["har", "event"]),

    isProvincial() {
      return this.regulation.tier === "PRV";
    },

    isInternalRegulation() {
      return this.regulation.tier === "INT";
    },

    formFields() {
      return [
        {
          component: VSelect,
          label: "Alcance",
          model: "tier",
          items: this.tiers,
          attrs: {
            "item-text": "name",
            "item-value": "key",
            rules: [this.rRequired],
            "hide-details": true,
          },
          listeners: {},
          cols: 4,
          required: true,
          visible: true,
        },
        {
          component: VSelect,
          label: "Provincia",
          model: "state",
          items: this.statesArg,
          attrs: {
            "item-text": "name",
            "item-value": "id",
            rules: this.isProvincial ? [this.rRequired] : [],
            "hide-details": true,
          },
          listeners: {},
          cols: 4,
          required: true,
          visible: this.isProvincial,
        },
        {
          component: AsyncCombobox,
          type: "async",
          label: "Autoridad",
          model: "authority",
          attrs: {
            "hide-details": true,
            "item-text": "name",
            "item-value": "id",
            api: tcmtRegApi.getFetcher(),
            url: "/authorities/search",
            searchParam: "name",
            rules: !this.isInternalRegulation ? [this.rRequired] : [],
            disabled: this.isInternalRegulation,
          },
          listeners: {},
          cols: 4,
          required: true,
          visible: !this.isInternalRegulation,
        },
        {
          component: VTextField,
          model: "regulation_code",
          label: "Norma/Código",
          attrs: {
            "hide-details": true,
            rules: [this.rRequired],
          },
          cols: 4,
          required: true,
          visible: true,
        },
        {
          component: VTextField,
          model: "issue_year",
          label: "Año de creación",
          attrs: {
            "hide-details": true,
            rules: this.isInternalRegulation
              ? [this.rNumeric]
              : [this.rRequired, this.rNumeric],
          },
          listeners: {},
          cols: 4,
          required: !this.isInternalRegulation,
          visible: true,
        },
        {
          component: VTextField,
          model: "last_update_year",
          label: "Año de actualización",
          attrs: {
            "hide-details": true,
            rules: this.isInternalRegulation
              ? [this.rNumeric]
              : [this.rRequired, this.rNumeric],
          },
          listeners: {},
          cols: 4,
          required: !this.isInternalRegulation,
          visible: true,
        },
        {
          component: VTextField,
          type: "date",
          model: "implementation_date",
          label: "Fecha de implementación",
          attrs: {
            "hide-details": true,
            readonly: true,
            rules: [this.rRequired],
          },
          listeners: {},
          cols: 4,
          required: true,
          visible: true,
        },
        {
          component: VSelect,
          label: "Área de gestión",
          model: "process_area_id",
          items: this.event.process_areas,
          attrs: {
            "item-text": "name",
            "item-value": "id",
            rules: [this.rRequired],
            "hide-details": true,
          },
          listeners: {},
          cols: 12,
          required: true,
          visible: true,
        },
        {
          component: VTextarea,
          model: "subject",
          label: "Tema",
          attrs: {
            rows: 1,
            "auto-grow": true,
            rules: [
              (v) => !!v,
              (v) =>
                (!!v &&
                  v.length <= INPUTS_LENGTH.REG_SUBJECT &&
                  v.length > 0) ||
                `Max ${INPUTS_LENGTH.REG_SUBJECT} caracteres`,
            ],
          },
          listeners: {},
          cols: 12,
          required: true,
          visible: true,
        },
        {
          component: VTextarea,
          model: "review",
          label: "Reseña",
          attrs: {
            rows: 1,
            "auto-grow": true,
            rules: [
              (v) =>
                (!!v && v.length <= INPUTS_LENGTH.REG_REVIEW) ||
                `Max ${INPUTS_LENGTH.REG_REVIEW} caracteres`,
            ],
          },
          listeners: {},
          cols: 12,
          required: true,
          visible: true,
        },
        {
          component: VTextarea,
          model: "obligations",
          label: "Obligaciones que genera",
          attrs: {
            rows: 1,
            "auto-grow": true,
            rules: [
              (v) =>
                (!!v && v.length <= INPUTS_LENGTH.REG_OBLIGATIONS) ||
                `Max ${INPUTS_LENGTH.REG_OBLIGATIONS} caracteres`,
            ],
          },
          listeners: {},
          cols: 12,
          required: true,
          visible: true,
        },
        {
          component: VTextField,
          model: "link",
          label: "Link externo",
          attrs: {
            "hide-details": true,
            rules: this.isInternalRegulation ? [] : [this.rRequired],
          },
          listeners: {},
          cols: 12,
          required: !this.isInternalRegulation,
          visible: true,
        },
      ];
    },

    tiers() {
      const tiersArray = Object.entries(this.har.tiers).map((t) => {
        return { key: t[0], name: t[1] };
      });
      return tiersArray.filter((t) => t.key !== "OTR");
    },

    dateFormatted() {
      if (!this.regulation.implementation_date) return null;
      const [year, month, day] = this.regulation.implementation_date.split("-");
      return `${day}-${month}-${year}`;
    },
  },

  methods: {
    ...mapMutations("har", ["reset_regulation"]),
    ...mapActions(["set_alert"]),

    fetchAuthorities() {
      this.loading.fetchAuthorities = true;
      tcmtRegApi
        .getFetcher()
        .get("/authorities/search?page_size=50")
        .then(({ data }) => {
          this.authorities = data.results;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.loading.fetchAuthorities = false;
        });
    },

    processAuthority() {
      return new Promise((resolve, reject) => {
        if (!this.regulation.authority) {
          resolve();
        }
        if (typeof this.regulation.authority !== "string") {
          resolve();
        }
        const existingAuthority = this.authorities.find(
          (authority) =>
            authority.name.toUpperCase() ===
            this.regulation.authority.toUpperCase()
        );

        if (existingAuthority) {
          this.regulation.authority = existingAuthority;
          resolve();
        } else {
          tcmtRegApi
            .getFetcher()
            .post("authorities/", {
              name: this.regulation.authority,
            })
            .then(({ data }) => {
              this.regulation.authority = data;
              resolve();
            })
            .catch((e) => {
              console.error(e);
              reject(e);
            });
        }
      });
    },

    saveRegulation() {
      const verifyEditableRegulation = () => {
        if (this.regulation.id) {
          this.editRegulation();
        } else {
          this.newRegulation();
        }
      };
      // Se establece espera de unos milisegundos a que se desenfoque el campo "Autoridad"
      // y el v-model tome el valor. Esto en el caso de que se presione el botón "GUARDAR"
      // directamente después de tipear en el campo.
      setTimeout(verifyEditableRegulation, 100);
    },

    newRegulation() {
      this.loading.saveRegulation = true;
      this.processAuthority()
        .then(() => {
          return tcmtRegApi.getFetcher().post("/regulations/", {
            ...this.regulation,
            authority_id:
              this.regulation.tier === TIERS.INTERNAL
                ? null
                : this.regulation.authority.id,
          });
        })
        .then((result) => {
          const regulationID = result.data.id;
          this.set_alert({
            appAlertType: "success",
            appAlertMsg:
              "El <srtong>requerimiento <srtong> N° </srtong>" +
              regulationID +
              "</srtong> se creo correctamente",
          });
          this.$emit("update-regulations");
          this.closePanel();
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "El requerimiento no pudo crearse",
          });
          this.resetForm();
        })
        .finally(() => {
          this.loading.saveRegulation = false;
        });
    },

    editRegulation() {
      this.loading.saveRegulation = true;
      this.processAuthority()
        .then(() => {
          return tcmtRegApi
            .getFetcher()
            .put(`/regulations/${this.regulation.id}`, {
              ...this.regulation,
              authority_id:
                this.regulation.tier === TIERS.INTERNAL
                  ? null
                  : this.regulation.authority.id,
            });
        })
        .then((result) => {
          const regulationID = result.data.id;
          this.set_alert({
            appAlertType: "success",
            appAlertMsg:
              "El <srtong>requerimiento <srtong> N° </srtong>" +
              regulationID +
              "</srtong> se actualizó correctamente",
          });
          this.$emit("update-regulations");
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "El requerimiento no pudo actualizarse",
          });
        })
        .finally(() => {
          this.loading.saveRegulation = false;
          this.closePanel();
        });
    },

    resetForm() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    },

    closePanel() {
      if (this.$route.name === "new-regulation-form-reg-page") {
        this.$emit("update-regulation");
        this.$router.go(-1);
      } else {
        this.reset_regulation();
        this.$router.replace({
          path: `/har/`,
        });
      }
    },
  },
};
</script>

<style scoped></style>
