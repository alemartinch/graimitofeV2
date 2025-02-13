<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-form v-model="validFormNewEquip" ref="form">
      <v-row class="ma-0">
        <v-col cols="12" md="4">
          <div class="body-2 my-2">Equipo</div>
          <v-combobox
            v-model="equipmentCat"
            :items="event.equipment_categories"
            item-text="name"
            item-value="id"
            :placeholder="!event.availableFields.equipment ? 'No aplica' : ''"
            solo
            flat
            outlined
            dense
            prepend-inner-icon="mdi-diving-scuba-tank"
            :rules="[(v) => !!v || 'Debe seleccionar un equipo']"
            :disabled="!event.availableFields.equipment"
            @change="update_event"
            class="py-0"
          />
        </v-col>
        <v-col cols="12" md="2">
          <div class="body-2 my-2">ID Equipo</div>
          <v-text-field
            v-model="equipmentID"
            :placeholder="!event.availableFields.equipment ? 'No aplica' : ''"
            solo
            flat
            outlined
            dense
            autocomplete="off"
            :disabled="
              !event.temp_event.equipment_category ||
              !event.availableFields.equipment ||
              equipmentCat.name === 'N/A'
            "
            @input="updateEvent"
          />
        </v-col>
      </v-row>
      <v-row class="ma-0">
        <v-col cols="12" md="6" class="py-0">
          <div class="body-2 my-2">Descripción</div>
          <v-textarea
            v-model="equipmentDes"
            :placeholder="!event.availableFields.equipment ? 'No aplica' : ''"
            solo
            flat
            outlined
            dense
            no-resize
            :rules="desRules"
            :disabled="
              !event.temp_event.equipment_category ||
              !event.availableFields.equipment ||
              equipmentCat.name === 'N/A'
            "
            @input="updateEvent"
          />
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { INPUTS_LENGTH } from "@/mixins/globals";

export default {
  data() {
    return {
      equipmentLoading: false,
      validFormNewEquip: false,
      typing: false,
      desRules: [
        (v) =>
          (v.length <= INPUTS_LENGTH.EQUIPMENT_DESCRIPTION && v.length > 0) ||
          `Max ${INPUTS_LENGTH.EQUIPMENT_DESCRIPTION} caracteres`,
      ],
    };
  },

  computed: {
    ...mapState(["event", "user"]),

    equipmentCat: {
      get() {
        return this.event.temp_event.equipment_category;
      },
      set(equipmentCat) {
        this.set_equipment_cat(equipmentCat);
        if (equipmentCat.name === "N/A") {
          this.equipmentID = "";
          this.equipmentDes = "";
        }
      },
    },

    equipmentID: {
      get() {
        return this.event.temp_event.equipment_id;
      },
      set(equipmentID) {
        this.set_equipment_id(equipmentID);
      },
    },

    equipmentDes: {
      get() {
        return this.event.temp_event.equipment_description;
      },
      set(equipmentDes) {
        this.set_equipment_des(equipmentDes);
      },
    },
  },

  watch: {
    "event.temp_event.event_origin"(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.$refs.form.resetValidation();
      }
    },
  },

  methods: {
    ...mapMutations("event", [
      "set_equipment_cat",
      "set_equipment_id",
      "set_equipment_des",
    ]),

    ...mapActions(["set_alert"]),
    ...mapActions("event", ["update_event"]),

    updateEvent() {
      if (!this.typing) {
        this.typing = true;
        this.update_event();
        setTimeout(() => {
          this.typing = false;
        }, 5000);
      }
    },
  },
};
</script>

<style />
