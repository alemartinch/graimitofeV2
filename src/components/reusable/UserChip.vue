<template>
  <v-chip small style="backface-visibility: hidden">
    <UserAvatar v-if="avatar" :user-object="user" size="20" />
    <span class="font-weight-medium">{{ user | fullName }}</span>
  </v-chip>
</template>

<script>
import UserAvatar from "@/components/reusable/UserAvatar.vue";

export default {
  name: "UserChip",
  components: { UserAvatar },
  props: {
    user: {
      type: Object,
      required: true,
    },
    avatar: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>
