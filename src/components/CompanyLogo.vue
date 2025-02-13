<template>
  <v-row class="my-8" justify="center">
    <div
      class="img-container"
      @click="loadLogo"
      :style="containerStyle"
      @mouseover="adjust = true"
      @mouseleave="adjust = false"
    >
      <v-img
        :src="companyLogo || require('@/assets/imagotipoTCMT.png')"
        :width="`${user.defaultSettings.logoWidth}%`"
        contain
        max-height="100%"
      />
      <!--      <v-row-->
      <!--        v-if="adjust"-->
      <!--        class="pa-0 ma-0"-->
      <!--        style="position: absolute; bottom: 0; right: 0"-->
      <!--        ><v-icon small @click.stop="increaseLogo">mdi-plus</v-icon-->
      <!--        ><v-icon small @click.stop="decreaseLogo">mdi-minus</v-icon></v-row-->
      <!--      >-->
    </div>
    <v-dialog v-model="showLoadImage" max-width="400" persistent scrollable>
      <LoadImage v-on:close-dialog="showLoadImage = false" company-logo />
    </v-dialog>
  </v-row>
</template>
<script>
import LoadImage from "@/components/setting-page/LoadImage.vue";
import { mapGetters, mapMutations, mapState } from "vuex";
export default {
  name: "CompanyLogo",
  components: { LoadImage },
  data() {
    return {
      logoWidth: 70,
      showLoadImage: false,
      adjust: false,
    };
  },
  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["isCurrentUserSme"]),

    containerStyle() {
      return {
        border: this.adjust && this.isCurrentUserSme ? "1px dashed grey" : "",
        cursor: this.adjust && this.isCurrentUserSme ? "pointer" : "",
        height: this.$vuetify.breakpoint.mdAndDown ? "80px" : "100px",
      };
    },
    companyLogo() {
      return this.user.company.logo;
      // let req = new XMLHttpRequest();
      // req.open("GET", this.user.company.logo, true);
      // req.send();
      // req.onreadystatechange = () => {
      //   return [403, 404].includes(req.status) ? null : this.user.company.logo;
      // };
      // return false;
    },
  },

  methods: {
    ...mapMutations("user", ["set_logo_width"]),
    decreaseLogo() {
      this.set_logo_width(-5);
    },
    increaseLogo() {
      this.set_logo_width(5);
    },
    loadLogo() {
      if (this.isCurrentUserSme) {
        this.showLoadImage = true;
      }
    },
  },
};
</script>
<style scoped>
.img-container {
  position: relative;
  width: 75%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
/*.img-container:hover {*/
/*  border: 1px dashed grey;*/
/*  cursor: pointer;*/
/*}*/
</style>
