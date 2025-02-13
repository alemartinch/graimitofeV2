<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    fill-height
  >
    <v-img
      :src="require('@/assets/event-restricted.svg')"
      contain
      max-height="30%"
      style="opacity: 0.5"
    ></v-img
    ><span class="text-h6 text--secondary mt-4">EVENTO RESTRINGIDO</span>
    <div>
      <v-btn
        small
        text
        color="primary"
        class="mt-5"
        @click="$router.push({ path: `/events/` })"
        >ir al panel de eventos
      </v-btn>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "RestrictedEvent",
};
</script>

<style scoped></style>
