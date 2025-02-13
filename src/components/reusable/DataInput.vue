<template>
  <v-textarea
    ref="input"
    class="text-body-2"
    style="margin-left: -10px"
    v-on:input="$emit('input', $event)"
    :value="value"
    :outlined="editData"
    solo
    flat
    dense
    auto-grow
    rows="0"
    :rules="rules"
    :readonly="readonly"
    :background-color="bgActive && !editData && !readonly ? '#ebecf0' : ''"
    hide-details="auto"
    @keydown="enableCheck = true"
    @focus="enableEdit"
    @blur="inactiveField"
    @mouseover="bgActive = true"
    @mouseleave="bgActive = false"
  >
    <template slot="append" v-if="!readonly">
      <v-btn
        v-if="editData"
        small
        icon
        :disabled="!enableCheck || !$refs.input.validate()"
        @click.stop="acceptValue"
      >
        <v-icon small color="success">mdi-check</v-icon>
      </v-btn>
      <v-btn small icon v-else-if="!loading" disabled>
        <v-icon small>mdi-pencil</v-icon>
      </v-btn>
      <v-btn small icon v-else disabled :loading="loading">
        <v-icon small>mdi-blank</v-icon>
      </v-btn>
    </template>
  </v-textarea>
</template>

<script>
export default {
  name: "DataInput",
  props: {
    value: String,
    readonly: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Array,
      default: () => [],
      required: false,
    },
  },
  data() {
    return {
      internalData: "",
      editData: false,
      bgActive: false,
      enableCheck: false,
    };
  },
  computed: {
    selectAttrs() {
      return this.$attrs;
    },
  },
  methods: {
    inactiveField() {
      this.editData = false;
      this.enableCheck = false;
      this.$emit("input", this.internalData);
      this.internalData = "";
    },
    enableEdit() {
      this.internalData = this.value;
      this.editData = !this.readonly;
    },
    acceptValue() {
      this.$emit("accept-value");
      this.$refs.input.blur();
    },
  },
};
</script>

<style scoped>
.text_field__wrapper {
  margin-left: -4px;
}
.text_field__wrapper:hover {
  background-color: #ebecf0;
  border-radius: 5px;
}
</style>
