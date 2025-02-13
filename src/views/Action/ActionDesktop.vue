<template>
  <AppSpinner v-if="loading" :msg="`Cargando acción ${actionId}`" />
  <EventLayout v-else>
    <template v-slot:header>
      <ActionResumeHeader />
    </template>
    <template v-slot:content>
      <div class="pa-5">
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
            class="pt-4"
            @change="resetEffectivenessResult"
          ></v-checkbox>
        </ActionResumeForm>
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
        <div class="d-flex justify-end mt-5 pl-3">
          <v-btn
            v-if="canResolveAction() || effCompleted"
            color="primary"
            elevation="0"
            @click="saveActionResolution"
            :disabled="(!valid && !validPostpone) || !formUpdated"
            :loading="actionLoading"
            >{{ postpone ? "Postergar" : "Guardar" }}
          </v-btn>
          <div class="flex-grow-1"></div>
        </div>
      </div>
    </template>
    <template v-slot:side>
      <ActionResumeData>
        <template v-slot:data-header>
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2 font-weight-medium"
              >ID {{ getCurrentAction.id }}</span
            >
            <v-menu
              v-if="event.postEdit && canPostDeleteAction()"
              bottom
              left
              :close-on-content-click="false"
            >
              <template v-slot:activator="{ on }">
                <v-btn color="error" icon plain small :ripple="false" v-on="on">
                  <v-icon>mdi-delete-outline mdi-18px</v-icon>
                </v-btn>
              </template>
              <v-card width="200">
                <v-card-text class="caption">
                  La acción se eliminará de forma permanente. No podrá
                  deshacerse esta operación
                </v-card-text>
                <v-card-actions>
                  <div class="flex-grow-1"></div>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="deleteAction"
                    :loading="delActionLoading"
                    >eliminar</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-menu>
          </div>
        </template>
      </ActionResumeData>
    </template>
  </EventLayout>
</template>

<script>
import actionResume from "@/components/actions-page/ActionResume/index.vue";
import AppSpinner from "@/components/app-page/AppSpinner.vue";
import EventLayout from "@/Layouts/EventLayout.vue";
import { mapMutations, mapState } from "vuex";

export default {
  name: "ActionDesktop",
  components: { EventLayout, AppSpinner },
  mixins: [actionResume],
  data() {
    return {
      actionId: this.$route.params.id,
      isActionPage: true,
    };
  },
  created() {
    this.set_post_edit(true);
  },
  computed: {
    ...mapState(["event"]),
  },
  methods: {
    ...mapMutations("event", ["set_post_edit"]),
  },
};
</script>

<style scoped></style>
