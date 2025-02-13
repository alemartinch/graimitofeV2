<template>
  <v-form :value="valid" v-on:input="$emit('input', $event)">
    <v-row>
      <v-col cols="6">
        <div class="body-2 mb-2">Establecimiento a evaluar</div>
        <AsyncCombobox
          v-model="facility"
          :api="eatApi().getFetcher()"
          url="/facilities/search"
          search-param="keyword"
          item-text="name"
          item-value="id"
          :params="facilityParams"
          return-object
          outlined
          dense
          :combobox="false"
          label="Seleccione un establecimiento"
          prepend-inner-icon="mdi-factory"
          :rules="[
            (v) => (!!v && v !== -1) || 'Debe seleccionar un establecimiento',
          ]"
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
        <!--        <template v-if="typeReg === 'INT'">-->
        <!--          <div class="mb-2">Sector</div>-->
        <!--          <v-select-->
        <!--            :items="sectors"-->
        <!--            v-model="sector"-->
        <!--            item-text="name"-->
        <!--            item-value="id"-->
        <!--            label="Seleccione un sector"-->
        <!--            outlined-->
        <!--            dense-->
        <!--            flat-->
        <!--            multiple-->
        <!--            return-object-->
        <!--          >-->
        <!--          </v-select>-->
        <!--        </template>-->
        <div class="body-2 mb-2">Resultado de la evaluación</div>
        <v-select
          :items="statuses"
          v-model="compliance"
          label="Seleccione una opción..."
          item-text="name"
          item-value="key"
          outlined
          dense
          solo
          flat
          :rules="[(v) => !!v || 'Debe seleccionar un estado']"
        ></v-select>
        <v-alert
          v-if="['NCOM', 'PCOM'].includes(har.assessment.compliance)"
          type="warning"
          color="orange"
          class="caption"
          dense
          outlined
          v-html="alertMessage"
        ></v-alert>
      </v-col>
      <v-col cols="6">
        <div class="body-2 mb-2">Justificación</div>
        <v-textarea
          class="text-body-2"
          outlined
          solo
          flat
          dense
          rows="6"
          no-resize
          auto-grow
          v-model="justification"
          :rules="jusRules"
        ></v-textarea>
      </v-col>
    </v-row>
    <v-divider />
    <AttachFilesCard
      :cant-files="har.assessment.files.length"
      v-on:add-files="addFiles"
    >
      <FileCard
        v-for="file in har.assessment.files"
        :key="file.id"
        :file="file"
        v-on:delete-file="deleteFile(file.id)"
        :append-icon="false"
      />
    </AttachFilesCard>
  </v-form>
</template>

<script>
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import FileCard from "@/components/reusable/FileCard.vue";
import AttachFilesCard from "@/components/reusable/AttachFilesCard.vue";
import { mapGetters, mapMutations, mapState } from "vuex";
import { processRawFiles } from "@/mixins/helpers";
import { INPUTS_LENGTH } from "@/mixins/globals";
import { eatApi } from "@/apis";

export default {
  name: "EvaluationForm",
  components: { FileCard, AttachFilesCard, AsyncCombobox },
  props: ["valid"],
  data() {
    return {
      loading: false,
      jusRules: [
        (v) => !!v || "Debe completar este campo",
        (v) =>
          (!!v &&
            v.length <= INPUTS_LENGTH.ASSESSMENT_COMPLIANCE &&
            v.length > 0) ||
          `Max ${INPUTS_LENGTH.ASSESSMENT_COMPLIANCE} caracteres`,
      ],
      lastFileId: 0,
    };
  },

  computed: {
    ...mapState(["har"]),
    ...mapState(["event", "user"]),
    ...mapGetters("user", ["currentUser"]),
    ...mapGetters("event", ["getHarFacilities"]),
    ...mapGetters("user", ["getFacilitiesByUser"]),

    // facilities() {
    //   if (this.currentUser.access_facilities.length > 0) {
    //     const facilities = [];
    //     this.currentUser.access_facilities.forEach((f) => {
    //       this.event.facilities.filter((item) => {
    //         if (item.id === f.id) {
    //           facilities.push(item);
    //         }
    //       });
    //     });
    //     return facilities;
    //   }
    //   return this.event.facilities;
    // },

    facilityParams() {
      const id = [];
      this.getFacilitiesByUser.forEach((item) => id.push(item.id));
      return {
        id: id,
      };
    },

    statuses() {
      return Object.entries(this.har.assessmentResults).map(
        ([key, { name }]) => {
          return { key, name };
        }
      );
    },

    sectors() {
      return this.har.assessment.facility_id.sectors;
    },

    typeReg: {
      get() {
        return this.har.regulation.tier;
      },
      set(type) {
        if (type === "INT") {
          this.set_assessment_type(true);
        }
        this.set_assessment_type(false);
      },
    },

    sector: {
      get() {
        return this.har.assessment.sectors;
      },
      set(id) {
        this.set_sectors(id);
      },
    },

    facility: {
      get() {
        return this.har.assessment.facility_id;
      },
      set(facility) {
        this.set_facility(facility);
      },
    },

    compliance: {
      get() {
        return this.har.assessment.compliance;
      },
      set(comp) {
        this.set_compliance(comp);
      },
    },

    justification: {
      get() {
        return this.har.assessment.compliance_evidence;
      },
      set(justification) {
        this.set_compliance_evidence(justification);
      },
    },

    alertMessage() {
      return this.har.assessment.compliance === "NCOM"
        ? "La evaluación deriva en una <strong>No Conformidad Mayor</strong>," +
            " se recomienda generar un evento crítico para evaluar causas" +
            " y acciones correctivas (Se recomienda cargar el número de evento creado en el campo <em>justificación</em>). "
        : "Se recomienda crear un evento de tipo <strong>Observación</strong> para este resultado " +
            "(Se recomienda cargar el número de evento creado en el campo <em>justificación</em>). ";
    },
  },

  methods: {
    ...mapMutations("har", [
      "set_compliance",
      "set_compliance_evidence",
      "set_facility",
      "set_assessment_files",
      "set_sectors",
      "set_assessment_type",
      "delete_assessment_file",
    ]),

    eatApi() {
      return eatApi;
    },

    deleteFile(fileId) {
      this.delete_assessment_file(fileId);
    },

    addFiles(fileList) {
      this.set_assessment_files(processRawFiles(fileList));
    },
  },
};
</script>
