<template>
  <AppSpinner v-if="loading" />
  <v-container v-else fluid class="pa-5 pa-md-10">
    <template>
      <v-row class="d-flex">
        <v-col class="col-12 pb-0">
          <h6 class="subtitle-1">{{ getDate }}</h6>
          <h4 class="text-h4">{{ `${greeting}, ${user.user.first_name}` }}</h4>
        </v-col>
        <v-col class="col-12 pt-0">
          <div class="d-flex mt-1 align-items-center">
            <v-tooltip bottom class="mr-2">
              <template v-slot:activator="{ on }">
                <v-icon color="grey" class="mr-1 lighten-4" v-on="on"
                  >mdi-security</v-icon
                >
              </template>
              <span>Roles asignados</span>
            </v-tooltip>
            <v-chip
              v-for="rol in user.user.groups"
              :key="rol.name"
              small
              outlined
              label
              class="mr-2"
              color="primary"
            >
              {{ rolNameTranslate(rol.name) }}
            </v-chip>
            <v-divider vertical class="mx-2"></v-divider>
            <v-tooltip bottom class="mr-2">
              <template v-slot:activator="{ on }">
                <v-icon color="grey" class="mr-1" v-on="on">mdi-factory</v-icon>
              </template>
              <span>Establecimientos asignados</span>
            </v-tooltip>
            <template
              v-if="
                getFacilitiesByUser.length && getFacilitiesByUser.length <= 5
              "
            >
              <v-chip
                v-for="(facility, index) in getFacilitiesByUser"
                :key="index"
                small
                outlined
                label
                class="mr-2"
                color="primary"
              >
                {{ facility.name }}
              </v-chip>
            </template>
            <template v-else>
              <v-chip small outlined label class="mr-2 d-flex" color="accent">
                <template v-if="getFacilitiesByUser.length === 0">{{
                  "Todos"
                }}</template>
                <template v-else>{{
                  getFacilitiesByUser.length + " Establecimientos"
                }}</template>
              </v-chip>
            </template>
          </div>
        </v-col>
      </v-row>
    </template>
    <v-card
      outlined
      :loading="loading"
      :disabled="loading"
      class="mt-3 d-md-inline-flex"
    >
      <div class="pa-3 d-md-inline-flex flex-column flex-md-row text-body-2">
        <div>
          <IconBase class="mr-2" shadow><IconAction /></IconBase>
          <strong>{{ totalActions.length }}</strong> acciones abiertas
        </div>
        <v-divider :vertical="!isMobile" class="mx-3 my-3 my-md-0" />
        <template v-if="!isMobile && apisEnabled.includes('repet')">
          <div>
            <IconBase class="mr-2" shadow>
              <IconTask />
            </IconBase>
            <strong>{{ getUnresolvedTasks }}</strong> tareas sin resolver
          </div>
          <v-divider vertical class="mx-3" />
        </template>
        <template v-if="!isMobile">
          <div>
            <v-icon color="#153240" class="mr-2"
              >mdi-file-certificate-outline mdi-24px</v-icon
            >
            <strong>{{ totalCertEvents }}</strong> eventos para certificar
          </div>
          <v-divider vertical class="mx-3" />
        </template>
        <div>
          <IconBase class="mr-2" shadow><IconEvent /></IconBase
          ><strong>{{ totalOpenEvents }}</strong>
          {{ isMobile ? "observacion/es" : "eventos" }} pendientes de carga
        </div>
      </div>
    </v-card>
    <v-row class="mt-10">
      <v-col
        v-for="(card, index) in cards"
        :key="index"
        :cols="card.cols"
        v-show="card.visible"
      >
        <component :is="card.component" :loading="loading" />
      </v-col>
    </v-row>
    <RouterView v-on:close-action-resume="getHomePageData" />
  </v-container>
</template>

<script>
import homePage from "@/views/Home/homePage";
import { mapGetters, mapState } from "vuex";
import { rolNameMixin } from "@/mixins/globals";

export default {
  name: "Home",
  mixins: [homePage, rolNameMixin],
  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["currentUser", "getFacilitiesByUser"]),
    getUnresolvedTasks() {
      let countUnresolvedTasks = 0;
      this.har.tasks.forEach((task) => {
        task.next_occurrences.forEach((item) => {
          if (item.status === "10ODUE" || item.status === "20PEND") {
            countUnresolvedTasks++;
          }
        });
      });
      return countUnresolvedTasks;
    },
  },
};
</script>

<style scoped>
strong {
  font-size: 1.5rem;
}
</style>
