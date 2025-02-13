<template>
  <v-container fluid class="d-flex pa-0">
    <v-card flat class="pa-2 d-flex flex-column flex-grow-1">
      <v-card-title> Versiones de Apis </v-card-title>
      <v-card-text class="px-5">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">NOMBRE</th>
                <th class="text-left">URL</th>
                <th class="text-left">VERSIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in apis" :key="item.name">
                <td>{{ item.name }}</td>
                <td>{{ item.url }}</td>
                <td>{{ item.version }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
export default {
  name: "ApisVersion",
  data() {
    return {
      apis: [
        {
          name: "",
          url: "",
          version: "",
        },
      ],
    };
  },
};
</script>

<style scoped></style>
