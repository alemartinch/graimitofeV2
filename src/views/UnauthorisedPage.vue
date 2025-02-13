<template>
  <v-container
    style="height: calc(100vh - 48px)"
    class="d-flex flex-column justify-center align-center"
  >
    <v-img
      :src="require('@/assets/lockPage.svg')"
      contain
      max-height="30%"
      style="opacity: 0.5"
    ></v-img
    ><span class="text-h6 text--secondary text-center"
      >No tiene permisos para entrar en esta sección. <br />Consulte con el
      administrador del sistema</span
    >
    <v-btn plain text color="primary" @click="$router.go(-2)">volver</v-btn>
  </v-container>
</template>

<script>
export default {
  name: "UnauthorisedPage",
};
</script>

<style scoped></style>
