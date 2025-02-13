<template>
  <v-dialog width="700" :value="true" persistent>
    <v-card>
      <v-card-title>Editar evento</v-card-title>
      <v-form
        v-model="valid"
        class="pa-5"
        style="height: 400px; overflow: auto"
      >
        <template v-if="event.availableFields.summary">
          <div class="body-2 my-2">Resumen</div>
          <v-textarea
            v-model="tEvent.summary"
            class="text-body-2"
            rows="1"
            auto-grow
            solo
            flat
            outlined
            dense
            no-resize
            :rules="summaryRules"
          />
        </template>
        <template v-if="event.availableFields.description">
          <div class="body-2 my-2">Descripción</div>
          <v-textarea
            v-model="tEvent.description"
            class="text-body-2"
            rows="1"
            auto-grow
            solo
            flat
            outlined
            dense
            no-resize
            :rules="descriptionRules"
          />
        </template>
        <template v-if="event.availableFields.equipment">
          <div class="body-2 my-2">Equipo</div>
          <v-combobox
            v-model="tEvent.equipment_category"
            class="py-0 text-body-2"
            :items="event.equipment_categories"
            item-text="name"
            item-value="id"
            solo
            flat
            outlined
            dense
            prepend-inner-icon="mdi-diving-scuba-tank"
            :rules="[(v) => !!v || 'Debe seleccionar un equipo']"
          />
          <div class="body-2 my-2">ID Equipo</div>
          <v-text-field
            v-model="tEvent.equipment_id"
            class="text-body-2"
            solo
            flat
            outlined
            dense
            autocomplete="off"
            :disabled="
              !event.temp_event.equipment_category ||
              tEvent.equipment_category.name === 'N/A'
            "
          />
          <div class="body-2 my-2">Descripción</div>
          <v-textarea
            v-model="tEvent.equipment_description"
            class="text-body-2"
            rows="2"
            auto-grow
            solo
            flat
            outlined
            dense
            :rules="desEquipmentRules"
            :disabled="
              !event.temp_event.equipment_category ||
              !event.availableFields.equipment ||
              tEvent.equipment_category.name === 'N/A'
            "
          />
        </template>
      </v-form>
      <v-card-actions class="justify-end">
        <t-btn-secondary @click="$emit('close-dialog')" :disabled="loading"
          >cerrar</t-btn-secondary
        >
        <t-btn-primary
          :disabled="!valid || loading"
          :loading="loading"
          @click="saveEvent"
          >guardar</t-btn-primary
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import { eatApi } from "@/apis";
import { INPUTS_LENGTH } from "@/mixins/globals";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "EditEventDialog",
  components: { TBtnPrimary, TBtnSecondary },
  data() {
    return {
      valid: false,
      tEvent: {},
      loading: false,
      summaryRules: [
        (v) =>
          (v.length <= INPUTS_LENGTH.EVENT_SUMMARY && v.length > 0) ||
          `Max ${INPUTS_LENGTH.EVENT_SUMMARY} caracteres`,
      ],
      descriptionRules: [
        (v) =>
          (v.length <= INPUTS_LENGTH.EVENT_DESCRIPTION && v.length > 0) ||
          `Max ${INPUTS_LENGTH.EVENT_DESCRIPTION} caracteres`,
      ],
    };
  },
  created() {
    const {
      summary,
      description,
      equipment_category,
      equipment_id,
      equipment_description,
    } = this.event.temp_event;
    this.tEvent = {
      summary,
      description,
      equipment_category,
      equipment_id,
      equipment_description,
    };
  },
  computed: {
    ...mapState(["event"]),
    desEquipmentRules() {
      return this.tEvent.equipment_category.name === "N/A"
        ? []
        : [
            (v) =>
              (v.length <= INPUTS_LENGTH.EQUIPMENT_DESCRIPTION &&
                v.length > 0) ||
              `Max ${INPUTS_LENGTH.EQUIPMENT_DESCRIPTION} caracteres`,
          ];
    },
  },
  methods: {
    ...mapMutations(["SET_ALERT"]),
    saveEvent() {
      this.loading = true;
      if (this.tEvent.equipment_category.name === "N/A") {
        this.tEvent.equipment_id = "";
        this.tEvent.equipment_description = "";
      }
      eatApi
        .getFetcher()
        .put("events/" + this.event.temp_event.id, {
          ...this.tEvent,
          equipment_category: this.tEvent.equipment_category.id,
        })
        .then((response) => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: `El evento ${response.data.results.id} fue editado`,
          });
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `No pudo editarse el evento`,
          });
        })
        .finally(() => {
          this.loading = false;
          this.$emit("close-dialog");
        });
    },
  },
};
</script>
