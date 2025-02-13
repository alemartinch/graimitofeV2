<template>
  <v-card>
    <v-card-title>
      {{ statusConfiguration[newRecordType].dialog.title }}
    </v-card-title>
    <v-card-subtitle class="pt-2">
      {{ getCurrentTask.description }}
    </v-card-subtitle>
    <v-card-text>
      <v-alert
        v-if="statusConfiguration[newRecordType].dialog.alert"
        dense
        type="warning"
        outlined
        class="caption"
        color="orange"
        >{{ statusConfiguration[newRecordType].dialog.alert }}</v-alert
      >
      <div class="body-2 my-2">Comentario</div>
      <v-form>
        <v-textarea
          v-model="newComment"
          dense
          auto-grow
          outlined
          rows="1"
          class="text-body-2 mt-2"
          :rules="[(v) => v.length <= 250 || 'Máx. 250 caracteres']"
        />
      </v-form>
      <AttachFilesCard
        :cant-files="files.length"
        v-on:add-files="addFiles"
        small-cards
      >
        <template v-slot:title>Archivos</template>
        <FileCard
          v-for="file in files"
          :key="file.id"
          :file="file"
          :append-icon="false"
          v-on:delete-file="deleteLocalFile(file)"
        />
      </AttachFilesCard>
    </v-card-text>
    <v-card-actions class="justify-end">
      <t-btn-secondary
        @click="closeDialog"
        :disabled="loading.saveNewEntryLoading"
        >cerrar</t-btn-secondary
      >
      <t-btn-primary
        @click="saveNewEntry"
        :loading="loading.saveNewEntryLoading"
        >{{ statusConfiguration[newRecordType].pBtnName }}</t-btn-primary
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { taskStatusAndRecordHandler } from "@/components/har-page/taskStatusAndRecordHandler";
import AttachFilesCard from "@/components/reusable/AttachFilesCard.vue";
import FileCard from "@/components/reusable/FileCard.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "OccurrenceActionDialog",
  components: { TBtnPrimary, TBtnSecondary, FileCard, AttachFilesCard },
  mixins: [taskStatusAndRecordHandler],
  props: {
    newRecordType: {
      type: String,
      required: true,
    },
  },

  methods: {
    closeDialog() {
      this.resetFormFields();
      this.$emit("close");
    },
  },
};
</script>

<style scoped></style>
