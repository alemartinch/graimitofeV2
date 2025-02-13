<template>
  <div class="d-flex align-center">
    <v-avatar
      @mouseover="$emit('mouseover')"
      @mouseleave="$emit('mouseleave')"
      :size="size"
      :left="left"
      :right="right"
      style="border: 1px solid #44cc7b; background-color: #263238"
      v-on="$listeners"
      :rounded="rounded"
    >
      <v-img v-if="getUserPhoto" :src="getUserPhoto"></v-img>
      <span
        v-else-if="userInitials"
        :style="{
          color: '#44cc7b',
          fontSize: `${0.4 * size}px`,
          marginTop: '1px',
        }"
        >{{ userInitials }}</span
      >
      <v-img v-else :src="require('@/assets/user.svg')"></v-img>
      <slot></slot>
    </v-avatar>
    <v-list-item-content class="ml-2 py-0" v-if="full && userObject">
      <v-list-item-title class="caption font-weight-bold mb-0">
        {{ userObject | fullName }}
      </v-list-item-title>
      <v-list-item-subtitle v-if="showRoles" class="text--secondary caption">
        {{ userObject.groups.map(({ name }) => name).join(", ") }}
      </v-list-item-subtitle>
    </v-list-item-content>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "UserAvatar",
  props: {
    size: {
      type: [String, Number],
      require: true,
    },
    left: {
      type: Boolean,
      default: false,
    },
    right: {
      type: Boolean,
      default: false,
    },
    photo: {
      type: String,
      require: false,
    },
    loggedUserPhoto: {
      type: Boolean,
      require: false,
    },
    userObject: {
      type: Object,
      default: null,
    },
    full: {
      type: Boolean,
      default: false,
    },
    showRoles: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(["user", "event"]),
    getUserPhoto() {
      if (this.photo) {
        return this.photo;
      }
      if (this.loggedUserPhoto) {
        return this.user.user.photo;
      }
      if (this.userObject) {
        return this.userObject.photo;
        // const user = this.event.users.find(
        //   (user) => user.id === this.userObject.id
        // );
        // return this.userObject.photo || user?.photo;
      }
      return false;
      // return this.loggedUserPhoto ? this.user.user.photo : this.photo;
      // const userPhoto = this.user.user.photo64;
      // return "data:image/png;base64," + userPhoto;
    },

    userInitials() {
      const user = this.loggedUserPhoto ? this.user.user : this.userObject;
      if (user?.first_name && user.last_name) {
        return (
          user.first_name[0].toUpperCase() + user.last_name[0].toUpperCase()
        );
      }
      return false;
    },
  },
};
</script>

<style scoped></style>
