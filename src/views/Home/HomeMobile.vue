<script>
import homePage from "@/views/Home/homePage";
import HomeMobileSkeleton from "@/views/Home/HomeMobileSkeleton.vue";
import UnresolvedMobileCard from "@/views/Home/UnresolvedMobileCard.vue";
import HomeObservationsList from "@/views/Home/HomeObervationsList.vue";

export default {
  name: "HomeMobile",
  components: {
    HomeObservationsList,
    UnresolvedMobileCard,
    HomeMobileSkeleton,
  },
  mixins: [homePage],
};
</script>

<template>
  <v-container class="pa-5">
    <div class="d-flex align-center">
      <div>
        <v-img
          :src="require('@/assets/newLogoTcmt.svg')"
          width="40"
          contain
        />
      </div>
      <div class="ml-5">
        <h6 class="subtitle-1">{{ getDate }}</h6>
        <h4 class="text-h5">{{ `${greeting}, ${user.user.first_name}` }}</h4>
      </div>
    </div>
    <HomeMobileSkeleton
      v-if="
        loading || har.loadings.fetchOccurrences || event.loading.fetchEvents
      "
      class="mt-5"
    />
    <template v-else
      ><h6 class="caption mt-5">
        <v-icon color="primary" small>mdi-alpha-a-box-outline</v-icon>
        <span class="ml-2">TUS ACCIONES</span>
      </h6>
      <UnresolvedMobileCard
        :data="actionCardData"
        v-on:show-list="$router.push({ path: `/actionsMb` })"
      />
      <!--      <v-card class="rounded-lg mt-3" flat>-->
      <!--        <HomeActionList :action-list="actionList" />-->
      <!--      </v-card>-->
      <h6 class="caption mt-5">
        <v-icon color="primary" small>mdi-clipboard-check-outline</v-icon>
        <span class="ml-2">TUS TAREAS</span>
      </h6>
      <UnresolvedMobileCard
        :data="taskCardData"
        v-on:show-list="$router.push({ path: `/tasks-mobile` })"
      />
      <h6 class="caption mt-5">
        <v-icon color="primary" small>mdi-eye</v-icon>
        <span class="ml-2">ULTIMAS OBSERVACIONES</span>
      </h6>
      <HomeObservationsList />
    </template>
  </v-container>
</template>
