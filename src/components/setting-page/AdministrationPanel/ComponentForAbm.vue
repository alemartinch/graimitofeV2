<template>
  <v-simple-table>
    <template v-slot:default>
      <tbody>
        <tr>
          <td width="100%">
            {{ names.name }}
          </td>
          <td class="d-inline-flex">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn small text v-on="on"
                  ><v-icon
                    dark
                    color="green"
                    @click="
                      onEdit(names.id, names.name, names.description, facility)
                    "
                  >
                    mdi-clipboard-edit-outline
                  </v-icon></v-btn
                >
              </template>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  disabled
                  v-on="on"
                  small
                  text
                  v-bind="attrs"
                  color="red"
                  @click="onEvent(names.id, names.name)"
                  ><v-icon> mdi-delete-alert-outline </v-icon></v-btn
                >
              </template>
              <span>Eliminar</span>
            </v-tooltip>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>
<script>
export default {
  name: "ComponentForAbm",
  props: ["id", "names", "facility"],
  data() {
    return {};
  },
  methods: {
    onEvent(id, name) {
      this.$emit("deleteId", id, name);
    },

    onEdit(id, name, description, facility) {
      this.$emit("editId", id, name, description, facility);
    },
  },
};
</script>
<style></style>
