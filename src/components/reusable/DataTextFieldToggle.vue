<template>
  <v-container v-if="autocomplete" class="pa-0 ma-0">
    <h4>
      {{ label
      }}<v-progress-circular
        v-if="loading"
        width="2"
        size="15"
        indeterminate
        class="ml-3"
        color="primary"
      ></v-progress-circular>
    </h4>
    <p
      v-show="!editData"
      @click="editField"
      class="mb-0"
      :class="{ text_field__wrapper: !disabled }"
    >
      {{ data.name || data }}
    </p>
    <v-select
      ref="input"
      v-if="editData"
      v-model="data2"
      :items="items"
      item-text="name"
      item-value="id"
      @change="enableCheck = true"
      @blur="closeTextField"
      dense
      solo
      hide-details
      return-object
      autofocus
      class="text-body-2"
      style="width: 70%"
    >
      <template slot="append">
        <v-btn small icon :disabled="!enableCheck">
          <v-icon small color="success" @click="validateData">mdi-check</v-icon>
        </v-btn>
        <v-btn small icon class="ml-2" @click="closeTextField">
          <v-icon small color="error">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-select>
  </v-container>
  <!--  TEXT-AREA-->
  <v-container v-else-if="textArea" class="pa-0 ma-0">
    <h4 class="ml-1">
      {{ label }}
      <v-progress-circular
        v-if="loading"
        width="2"
        size="15"
        indeterminate
        class="ml-3"
        color="primary"
      ></v-progress-circular>
    </h4>
    <v-menu
      open-on-hover
      open-delay="500"
      :disabled="!reduce"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ on }"
        ><p
          v-on="on"
          class="text-body-2 pa-1"
          v-show="!editData"
          @click="editField"
          :class="{ text_field__wrapper: !disabled }"
        >
          {{ data || "sin datos" | reduceText(250) }}
        </p></template
      >
      <v-card class="pa-3 text-body-2">{{ data }}</v-card>
    </v-menu>
    <v-textarea
      ref="input"
      v-if="editData"
      v-model="data2"
      :value="data"
      @keydown="enableCheck = true"
      @blur="closeTextField"
      class="text-body-2 mb-3"
      no-resize
      auto-grow
      rows="2"
      dense
      outlined
      hide-details="auto"
      autofocus
      :rules="rules"
    >
      <template slot="append">
        <v-btn small icon :disabled="!enableCheck || !$refs.input.validate()">
          <v-icon small color="success" @click="validateData">mdi-check</v-icon>
        </v-btn>
        <v-btn small icon class="ml-2" @click="closeTextField">
          <v-icon small color="error">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-textarea>
    <v-dialog v-model="dialog" scrollable width="800">
      <v-card class="pa-0">
        <v-textarea
          ref="input"
          v-model="data2"
          :value="data"
          @keydown="enableCheck = true"
          class="text-body-2 mb-3"
          auto-grow
          no-resize
          solo
          dense
          flat
          hide-details="auto"
          autofocus
          :rules="rules"
        >
          <template slot="append">
            <v-btn
              small
              icon
              :disabled="!enableCheck || !$refs.input.validate()"
            >
              <v-icon small color="success" @click="validateData"
                >mdi-check</v-icon
              >
            </v-btn>
            <v-btn small icon class="ml-2" @click="closeTextField">
              <v-icon small color="error">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </v-card>
    </v-dialog>
  </v-container>
  <!--  TEXT-FIELD-->
  <v-row v-else class="ma-0 align-center pa-0">
    <span
      v-show="!editData"
      :class="'text_field__wrapper ' + labelClass"
      @click="editData = true"
    >
      {{ labelPrefix }}
      {{ data || noData }}
      <v-progress-circular
        v-if="loading"
        width="2"
        size="15"
        indeterminate
        class="ml-3"
        color="primary"
      ></v-progress-circular>
    </span>
    <v-text-field
      ref="input"
      v-if="editData"
      v-model="data2"
      :value="data"
      :rules="rules"
      :class="labelClass"
      :prefix="prefix"
      solo
      dense
      autofocus
      full-width
      hide-details="auto"
      @keydown.enter="validateData"
      @keyup="enableCheck = true"
      @blur="closeTextField"
    >
      <template slot="append">
        <v-btn small icon :disabled="!enableCheck || !$refs.input.validate()">
          <v-icon small color="success" @click="validateData">mdi-check</v-icon>
        </v-btn>
        <v-btn small icon class="ml-2" @click="closeTextField">
          <v-icon small color="error">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-text-field>
  </v-row>
</template>

<script>
export default {
  name: "DataTextFieldToggle",
  props: {
    autocomplete: {
      type: Boolean,
      required: false,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    },
    textArea: {
      type: Boolean,
      required: false,
      default: false,
    },
    reduce: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: false,
    },
    labelClass: {
      type: String,
      default: "text-h5",
    },
    prefix: {
      type: String,
    },
    labelPrefix: {
      type: String,
    },
    data: {
      type: [String, Object],
      default: "No data",
    },
    noData: {
      default: "Sin Datos",
    },
    rules: {
      type: Array,
      default: () => [],
      required: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editData: false,
      dialog: false,
      data2: this.data,
      enableCheck: false,
    };
  },
  methods: {
    editField() {
      if (!this.disabled && document.getSelection().isCollapsed) {
        if (this.reduce) {
          this.dialog = true;
        } else {
          this.editData = true;
        }
      }
    },
    validateData() {
      if (this.$refs.input.validate()) {
        this.$emit("value-changed", this.data2);
      }
      this.editData = false;
      this.dialog = false;
      this.$refs.input.resetValidation();
      this.enableCheck = false;
    },
    closeTextField() {
      this.editData = false;
      this.dialog = false;
      this.$refs.input.resetValidation();
      this.enableCheck = false;
      this.data2 = this.data;
    },
  },
};
</script>

<style scoped>
.text_field__wrapper:hover {
  background-color: #ebecf0;
  border-radius: 5px;
}
</style>
