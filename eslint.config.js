import pluginVue from "eslint-plugin-vue";

export default [
  ...pluginVue.configs["flat/vue2-essential"],
  // ...pluginVue.configs["flat/vue2-strongly-recommended"],
  {
    rules: {
      // "vue/no-unused-vars": "error",
    },
  },
];
