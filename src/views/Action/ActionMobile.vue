<template>
  <AppSpinner v-if="loading" />
  <MobilePageLayout v-else>
    <template v-slot:title="{ isScrolling }"
      ><span
        v-show="isScrolling"
        class="pt-1 ml-5 font-weight-medium animate__animated animate__fadeIn"
        >ACCIÓN {{ getCurrentAction.id }}
      </span></template
    >
    <template v-slot:actions>
      <v-btn
        v-if="canResolveAction() || effCompleted"
        color="primary"
        text
        @click="saveActionResolution"
        :disabled="(!valid && !validPostpone) || !formUpdated"
        :loading="actionLoading"
        >{{ postpone ? "Postergar" : "Guardar" }}
      </v-btn>
    </template>
    <template v-slot:content>
      <ActionResumeHeader />
      <div class="mx-2 pb-5">
        <ActionStatusInfo class="mx-3" />
        <v-row v-if="!isActionCompleted() && canResolveAction()" class="ma-0">
          <v-col cols="12" align-self="center" class="py-0">
            <v-checkbox
              v-model="postpone"
              label="Postergar acción"
              :disabled="!canPostponeAction()"
              :hint="
                !canPostponeAction()
                  ? `La acción ya ha sido
                        postergada una vez, sólo puede postergarla
                        nuevamente el originador del evento.`
                  : ''
              "
              persistent-hint
              dense
            ></v-checkbox>
          </v-col>
        </v-row>
        <ActionResumePostForm
          v-if="postpone"
          v-model="validPostpone"
          v-on:form-update="formUpdated = true"
        />
        <ActionResumeForm
          v-else
          v-model="valid"
          v-on:form-update="formUpdated = true"
          :eff-completed="effCompleted"
        >
          <v-checkbox
            v-if="isReadyForEffectiveness"
            v-model="effCompleted"
            label="Completar efectividad"
            hide-details
            dense
            :disabled="!canResolveEffectiveness()"
            class="pt-0"
            @change="resetEffectivenessResult"
          ></v-checkbox>
        </ActionResumeForm>
        <ActionResumeData />
        <div class="px-3 pt-5">
          <AttachFilesCard
            v-if="!postpone"
            :cant-files="fca.temp_action.files.length"
            v-on:add-files="addFiles"
            small-cards
            :disabled="!canAttachFilesToAction()"
          >
            <FileCard
              v-for="file in fca.temp_action.files"
              :key="file.id"
              :file="file"
              v-on:delete-file="deleteFile(file)"
              v-on:download-file="downloadFile(file.filename)"
            />
          </AttachFilesCard>
        </div>
      </div>
    </template>
  </MobilePageLayout>
</template>

<script>
import actionResume from "@/components/actions-page/ActionResume/action-resume";
import ActionStatusInfo from "@/components/actions-page/ActionResume/ActionStatusInfo.vue";
import MobilePageLayout from "@/Layouts/MobilePageLayout.vue";
import AppSpinner from "@/components/app-page/AppSpinner.vue";
import FileCard from "@/components/reusable/FileCard.vue";
import AttachFilesCard from "@/components/reusable/AttachFilesCard.vue";

export default {
  name: "ActionMobile",
  components: {
    AttachFilesCard,
    FileCard,
    AppSpinner,
    MobilePageLayout,
    ActionStatusInfo,
  },
  mixins: [actionResume],
  data() {
    return {
      actionId: this.$route.params.id,
    };
  },
};
</script>
