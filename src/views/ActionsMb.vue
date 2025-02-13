<!--TODO poner bandera para que no haga la petición más de una vez en el scroll-->
<template>
  <v-container
    @scroll="handleScroll"
    class="overflow-auto"
    style="height: calc(100vh - 56px)"
  >
    <!--    <div style="position: fixed; z-index: 100">-->
    <!--      <span>{{scrollTop}}<br/></span>-->
    <!--      <span>{{clientHeight}}<br/></span>-->
    <!--      <span>{{scrollTop + clientHeight}}<br/></span>-->
    <!--      <span>{{scrollHeight}}</span>-->
    <!--    </div>-->
    <ActionsFilterMb :parent-loading="loading" v-on:filter="setFilter" />
    <v-row class="my-5 ml-2"
      ><span class="text-body-2">{{ totalActions }} RESULTADOS</span></v-row
    >
    <ActionMbItem
      v-for="action in fca.actions"
      :action="action"
      :key="action.id"
      v-on:show-action-resume="
        $router.push({ path: `/actions/action/${action.id}` })
      "
    />
    <v-row
      class="mb-5"
      justify="center"
      v-if="
        this.fca.actions.length && this.totalActions > this.fca.actions.length
      "
    >
      <v-card
        rounded="circle"
        width="32px"
        height="32px"
        class="d-flex align-center"
        elevation="12"
      >
        <v-progress-circular
          color="primary"
          indeterminate
          class="mx-auto"
          size="24"
          width="3"
        ></v-progress-circular>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import { mapMutations, mapActions, mapState, mapGetters } from "vuex";
import ActionMbItem from "@/components/actions-page/ActionMbItem.vue";
import ActionsFilterMb from "@/components/actions-page/ActionsFilterMb.vue";
import _ from "lodash";
import { EVENT_STATUSES } from "@/mixins/globals";

export default {
  name: "ActionsMb",
  components: { ActionsFilterMb, ActionMbItem },
  data() {
    return {
      filter: {
        ordering: "status",
        parent_event__status_not: EVENT_STATUSES.OPEN,
        page_size: 10,
        owner__id: this.currentUserComputed,
      },
      totalActions: 0,
      loading: false,
      scrollTop: 0,
      clientHeight: 0,
      scrollHeight: 0,
    };
  },
  created() {
    //this.set_actions([]);
    this.owner__id = this.currentUserComputed;
    this.getActions();
  },
  computed: {
    ...mapState(["fca", "user"]),
    ...mapGetters("user", ["currentUser", "currentUserId"]),

    currentUserComputed() {
      return this.currentUserId;
    },
  },
  methods: {
    ...mapMutations("fca", ["set_actions"]),
    ...mapActions("fca", ["getAllActions"]),

    handleScroll(e) {
      if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 100) {
        console.log(
          e.target.scrollTop,
          e.target.clientHeight,
          e.target.scrollHeight
        );
        if (this.totalActions > this.fca.actions.length && !this.loading) {
          this.filter.page_size += 10;
          this.getActions();
        }
      }
    },

    setFilter() {
      // this.filter.page = this.options.page = 1
      this.filter.ordering = "status";
      this.filter.parent_event__status_not = EVENT_STATUSES.OPEN;
      this.filter.page_size = 10;
      this.filter.owner__id = this.currentUserComputed;
      this.getActions();
    },

    getActions() {
      this.loading = true;
      this.filter.owner__id = this.currentUserComputed;
      this.filter = _.mergeWith(
        this.filter,
        this.user.filters.actions,
        (o, s) => {
          if (_.isArray(o)) {
            return s.slice();
          }
        }
      );
      this.getAllActions(this.filter)
        .then((res) => {
          this.totalActions = res.totalItems;
          this.loading = false;
        })
        .catch(() => {
          console.error("Error al obtener acciones del usuario");
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped></style>
