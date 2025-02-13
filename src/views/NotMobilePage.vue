<template>
  <v-container
    style="height: calc(100vh - 48px)"
    class="d-flex flex-column justify-center align-center px-5"
  >
    <v-img
      :src="require('@/assets/notMobile.svg')"
      contain
      max-height="30%"
      style="opacity: 0.5"
    ></v-img
    ><span class="subtitle-1 text--secondary text-center"
      >Lo siento, por el momento no puede acceder a esta sección desde la
      aplicación móvil. <br />Intente acceder desde la aplicación web de
      escritorio.</span
    >
  </v-container>
</template>

<script>
export default {
  name: "UnauthorisedPage",
};
</script>

<style scoped></style>
