<template>
  <div>
    <svg :width="size" :height="size" viewBox="0 0 62 68" class="hexagon">
      <defs>
        <clipPath id="hexagon-clip">
          <path
            d="M35.75 2.31976L56.0609 14.0463C59.0002 15.7433 60.8109 18.8795 60.8109 22.2735V45.7265C60.8109 49.1205 59.0002 52.2567 56.0609 53.9537L35.75 65.6802C32.8107 67.3773 29.1893 67.3773 26.25 65.6802L5.93911 53.9537C2.9998 52.2567 1.18911 49.1205 1.18911 45.7265V22.2735C1.18911 18.8795 2.9998 15.7433 5.93911 14.0463L26.25 2.31976C29.1893 0.622753 32.8107 0.622753 35.75 2.31976Z"
            stroke="#44CC7B"
          />
        </clipPath>
      </defs>
      <path
        d="M35.75 2.31976L56.0609 14.0463C59.0002 15.7433 60.8109 18.8795 60.8109 22.2735V45.7265C60.8109 49.1205 59.0002 52.2567 56.0609 53.9537L35.75 65.6802C32.8107 67.3773 29.1893 67.3773 26.25 65.6802L5.93911 53.9537C2.9998 52.2567 1.18911 49.1205 1.18911 45.7265V22.2735C1.18911 18.8795 2.9998 15.7433 5.93911 14.0463L26.25 2.31976C29.1893 0.622753 32.8107 0.622753 35.75 2.31976Z"
        stroke="#44CC7B"
      />
      <image
        v-if="!!userPhoto"
        :href="userPhoto"
        clip-path="url(#hexagon-clip)"
        x="0"
        y="0"
        height="68"
        width="62"
        preserveAspectRatio="xMidYMid slice"
      />
    </svg>
    <h1 v-if="!userPhoto" class="acronyms">{{ usernameAcronyms }}</h1>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  name: "TAvatar",
  props: {
    size: {
      type: Number,
      default: 100,
    },
  },
  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["currentUser"]),
    userPhoto() {
      return this.currentUser.photo;
    },
    usernameAcronyms() {
      return (
        this.currentUser.first_name[0].toUpperCase() +
        this.currentUser.last_name[0].toUpperCase()
      );
    },
  },
};
</script>

<style scoped>
.acronyms {
  position: absolute;
  /* text-align: center; */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(68, 204, 123);
}
</style>
