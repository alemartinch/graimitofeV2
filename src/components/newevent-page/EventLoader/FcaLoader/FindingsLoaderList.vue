<template>
  <v-container class="pa-0 mb-5">
    <v-btn
      v-if="loader"
      block
      text
      color="#4CAF50"
      :disabled="
        event.temp_event.event_origin === 'OBSV' && fca.findings.length >= 1
      "
      @click="
        set_parent(event.temp_event);
        newFindingDialog = true;
      "
      >agregar hallazgo</v-btn
    >
    <v-card
      class="ma-0 mb-5"
      outlined
      style="border: #44cc7b solid 1px"
      v-if="fca.findings.length"
    >
      <v-card-title
        >H {{ fca.findings[0].id }}<v-spacer /><v-btn
          v-if="loader"
          text
          color="#44cc7b"
          @click="editFinding(fca.findings[0])"
          >editar</v-btn
        ></v-card-title
      >
      <v-card-subtitle>
        <span>{{ fca.findings[0].description }}</span>
      </v-card-subtitle>
      <v-card-text>
        <v-btn
          v-if="loader"
          text
          @click="
            set_parent({
              type: 'finding',
              id: fca.findings[0].id,
            });
            newActionDialog = true;
          "
          color="#caad8b"
          >agregar acción</v-btn
        >
        <v-list>
          <v-list-item
            v-for="action in fca.actions"
            :key="action.id"
            style="border-left: #caad8b solid 1px"
            class="mb-2"
            @click="handleAction(action)"
          >
            <v-list-item-content class="py-1">
              <v-list-item-title
                >A {{ action.id }} -
                <span :style="{ color: fca.statuses[action.status].color }">{{
                  fca.statuses[action.status].abb
                }}</span></v-list-item-title
              >
              <v-list-item-subtitle>{{
                action.description
              }}</v-list-item-subtitle>
            </v-list-item-content>
            <UserAvatar :user-object="action.owner" size="35" />
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
    <v-bottom-sheet v-model="newFindingDialog" persistent>
      <FindingsLoader
        :editFinding="editFindingFlag"
        @evt-close-dialog="closeFindingDialog"
      />
    </v-bottom-sheet>
    <v-bottom-sheet v-model="newActionDialog" persistent scrollable>
      <ActionsLoader
        :edit-action="editActionFlag"
        @evt-close-dialog="closeActionDialog"
      />
    </v-bottom-sheet>
    <ActionResume v-if="showActionResume" />
  </v-container>
</template>

<script>
import FindingsLoader from "@/components/newevent-page/EventLoader/FcaLoader/FindingsLoader.vue";
import { mapMutations, mapState } from "vuex";
import ActionsLoader from "@/components/newevent-page/EventLoader/FcaLoader/ActionsLoader.vue";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import ActionResume from "@/components/actions-page/ActionResume/index.vue";
export default {
  name: "FindingsLoaderList",
  components: {
    ActionResume,
    UserAvatar,
    ActionsLoader,
    FindingsLoader,
  },
  props: {
    loader: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      finding: null,
      newFindingDialog: false,
      editFindingFlag: false,
      newActionDialog: false,
      editActionFlag: false,
      showActionResume: false,
    };
  },
  computed: {
    ...mapState(["event", "fca"]),
  },
  methods: {
    ...mapMutations("fca", ["set_parent", "set_finding", "set_action"]),
    editFinding(finding) {
      this.set_parent(this.event.temp_event);
      this.set_finding(finding);
      this.editFindingFlag = true;
      this.newFindingDialog = true;
    },
    closeFindingDialog() {
      this.newFindingDialog = false;
      this.editFindingFlag = false;
    },
    handleAction(action) {
      if (this.loader) {
        this.editAction(action);
      } else {
        this.$router.push({ path: `/actions/action/${action.id}` });
      }
    },
    editAction(action) {
      this.set_parent(this.parent);
      this.set_action(action);
      if (this.loader) {
        this.editActionFlag = true;
        this.newActionDialog = true;
      } else {
        this.showActionResume = true;
      }
    },
    closeActionDialog() {
      this.newActionDialog = false;
      this.editActionFlag = false;
    },
  },
};
</script>

<style scoped></style>
