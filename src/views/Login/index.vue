<template>
  <component :is="loginComponent" />
</template>

<script>
import LoginMb from "@/views/Login/LoginMb.vue";
import LoginDesk from "@/views/Login/LoginDesk.vue";

export default {
  components: { LoginDesk, LoginMb },
  computed: {
    loginComponent() {
      if (this.$vuetify.breakpoint.smAndDown) {
        return "LoginMb";
      } else {
        return "LoginDesk";
      }
    },
  },
};
</script>
