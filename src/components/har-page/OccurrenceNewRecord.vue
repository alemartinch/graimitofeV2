<template>
  <div v-if="!newRecordType">
    <t-btn-icon
      v-for="btn in statusTaskActions"
      :key="btn.name"
      :tooltip="btn.tooltip"
      :disabled="btn.disabled"
      @click="btn.panel.action"
      >{{ btn.icon }}
    </t-btn-icon>
  </div>
  <v-card v-else flat :disabled="ifRecordSaving">
    <v-form v-model="valid">
      <v-textarea
        v-model="newComment"
        rows="1"
        class="text-body-2"
        :rules="statusConfiguration[newRecordType].panel.comment_rules"
        no-resize
        auto-grow
        dense
        autofocus
        hide-details
        style="line-height: 1em"
      >
        <template v-slot:append-outer>
          <t-btn-icon @click="$refs.inputFile.click()"
            >mdi-attachment mdi-rotate-90
          </t-btn-icon>
        </template>
      </v-textarea>
      <span v-if="newRecordType === 'COMPLETE'" class="caption orange--text"
        >En caso de detectar desvío, dar aviso al responsable del área para su
        posterior gestión.</span
      >
    </v-form>
    <input
      type="file"
      ref="inputFile"
      class="d-none"
      @change="addFiles"
      :accept="fileTypes"
      multiple
    />
    <v-slide-group show-arrows>
      <v-slide-item v-for="file in files" :key="file.id">
        <FileCard
          small
          :file="file"
          :append-icon="false"
          deletable
          v-on:delete-file="deleteLocalFile(file)"
        />
      </v-slide-item>
    </v-slide-group>
    <v-card-actions class="justify-end pa-0 mt-2">
      <t-btn-secondary @click="resetFormFields">cancelar</t-btn-secondary>
      <t-btn-primary
        @click="saveNewEntry"
        :loading="loading.saveNewEntryLoading"
        :disabled="!valid"
        >{{ statusConfiguration[newRecordType].pBtnName }}</t-btn-primary
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import FileCard from "@/components/reusable/FileCard.vue";
import { mapActions, mapState } from "vuex";
import { taskStatusAndRecordHandler } from "@/components/har-page/taskStatusAndRecordHandler";

export default {
  name: "OccurrenceNewRecord",
  components: { FileCard, TBtnSecondary, TBtnPrimary, TBtnIcon },
  mixins: [taskStatusAndRecordHandler],
  data() {
    return {
      valid: true,
      fileTypes:
        ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.bmp,.gif,.png,.svg",
      newRecordType: "",
    };
  },
  computed: {
    ...mapState(["har"]),

    currentOccurrence() {
      return this.har.occurrence;
    },

    currentTask() {
      return this.har.task;
    },

    statusTaskActions() {
      return Object.entries(this.statusConfiguration).map(([key, data]) => {
        return {
          key,
          ...data,
        };
      });
    },

    ifRecordSaving() {
      return this.loading.saveNewEntryLoading;
    },
  },

  methods: {
    ...mapActions("har", ["fetchOccurrences", "fetchOccurrence"]),

    updateOccurrencePanel() {
      this.fetchOccurrence({
        taskID: this.currentTask.id,
        occurrenceID: this.currentOccurrence.id,
      });
      this.fetchOccurrences();
    },

    resetFormFields() {
      this.newComment = "";
      this.newRecordType = "";
      this.files = [];
    },
  },
};
</script>
