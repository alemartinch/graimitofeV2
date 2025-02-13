<template>
  <v-card>
    <v-card-title>Subir Imagen</v-card-title>
    <FileDropZone v-on:add-file="loadImage" file-types=".jpg,.jpeg,.png" />
    <v-card-text v-if="Image" class="d-flex justify-center"
      ><v-img :src="ImageUrl"
    /></v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="closeDialog" :disabled="loading"> Cerrar </v-btn>
      <v-btn
        color="primary"
        text
        @click="companyLogo ? loadCompanyLogo() : loadUserImage()"
        :disabled="!Image"
        :loading="loading"
      >
        Subir
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { eatApi } from "@/apis";
import FileDropZone from "@/components/reusable/FileDropZone.vue";
import { mapState, mapMutations } from "vuex";
import { updateFileAndUploadToS3 } from "@/store/modules/s3upload.js";

export default {
  name: "LoadImage",
  components: { FileDropZone },
  props: {
    companyLogo: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ImageUrl: null,
      Image: null,
      loading: false,
    };
  },
  computed: {
    ...mapState(["user"]),
  },
  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("user", ["SET_PHOTO", "SET_COMPANY_PHOTO"]),

    loadImage(fileList) {
      const fr = new FileReader();
      fr.readAsDataURL(fileList[0]);
      fr.addEventListener("load", () => {
        this.ImageUrl = fr.result;
        this.Image = fileList[0];
      });
    },

    loadUserImage() {
      this.loading = true;
      updateFileAndUploadToS3(
        eatApi.getFetcher(),
        `auth/users/${this.user.user.id}`,
        "photo",
        this.Image
      )
        .then((res) => {
          this.SET_PHOTO(
            res.data.results.photo
            // this.ImageUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")
          );
          this.loading = false;
          this.closeDialog();
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: `La imagen se cargó correctamente`,
          });
        })
        .catch(() => {
          this.loading = false;
          this.closeDialog();
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `No se pudo cargar la imagen`,
          });
        });
    },

    loadCompanyLogo() {
      this.loading = true;
      updateFileAndUploadToS3(
        eatApi.getFetcher(),
        `companies/${this.user.company.id}`,
        "logo",
        this.Image
      )
        .then((res) => {
          this.SET_COMPANY_PHOTO(
            res.data.results.logo
            // this.ImageUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")
          );
          this.loading = false;
          this.closeDialog();
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: `La imagen se cargó correctamente`,
          });
        })
        .catch(() => {
          this.loading = false;
          this.closeDialog();
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `No se pudo cargar la imagen`,
          });
        });
    },

    closeDialog() {
      this.$emit("close-dialog");
      this.Image = this.ImageUrl = null;
    },
  },
};
</script>

<style scoped></style>
