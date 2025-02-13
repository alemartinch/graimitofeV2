<template>
  <component :is="isMobile ? 'ActionMobile' : 'ActionDesktop'" />
</template>

<script>
import ActionMobile from "@/views/Action/ActionMobile.vue";
import ActionDesktop from "@/views/Action/ActionDesktop.vue";
import { mapMutations } from "vuex";
export default {
  name: "index",
  components: { ActionMobile, ActionDesktop },
  beforeDestroy() {
    this.set_post_edit(false);
  },
  methods: {
    ...mapMutations("event", ["set_post_edit"]),
  },
};
</script>
