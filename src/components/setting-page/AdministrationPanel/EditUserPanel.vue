<template>
  <v-dialog v-model="dialog" persistent width="700">
    <v-card v-if="loading.getUser" class="pa-2">
      <v-progress-linear indeterminate />
    </v-card>
    <v-card v-else :disabled="loading.saveUser">
      <v-card-title>{{
        isNewUser ? "Nuevo usuario" : "Editar usuario"
      }}</v-card-title>
      <v-card-text class="pr-0">
        <div class="d-flex">
          <div class="pr-10 d-flex flex-column align-center">
            <UserAvatar size="120" :photo="imageUrl" :user-object="user">
            </UserAvatar>
            <v-btn
              small
              text
              color="primary"
              class="mt-5"
              @click="$refs.inputFile.click()"
              >cargar foto</v-btn
            >
            <v-btn
              :disabled="!imageUrl"
              small
              text
              color="secondary"
              @click="imageUrl = null"
              >borrar foto</v-btn
            >
            <input
              type="file"
              ref="inputFile"
              class="d-none"
              @change="loadImage"
              accept=".jpg,.jpeg,.png"
              multiple
            />
          </div>
          <div class="flex-grow-1 pr-5" style="height: 430px; overflow: auto">
            <v-form ref="form" v-model="valid">
              <div class="mb-1">Nombre de usuario</div>
              <v-text-field
                v-model="user.username"
                :rules="[
                  userRules.required,
                  userRules.lowercase,
                  userRules.length,
                ]"
                class="text-body-2"
                outlined
                dense
                solo
                flat
                :disabled="!isNewUser"
                required
              ></v-text-field>
              <div class="d-flex">
                <div class="flex-grow-1">
                  <div class="mb-1">Nombre</div>
                  <v-text-field
                    v-model="user.first_name"
                    :rules="[userRules.required, userRules.length]"
                    class="text-body-2"
                    outlined
                    solo
                    flat
                    dense
                    required
                  ></v-text-field>
                </div>
                <div class="ml-5 flex-grow-1">
                  <div class="mb-1">Apellido</div>
                  <v-text-field
                    v-model="user.last_name"
                    :rules="[userRules.required, userRules.length]"
                    class="text-body-2"
                    outlined
                    dense
                    solo
                    flat
                    required
                  >
                  </v-text-field>
                </div>
              </div>
              <div class="d-flex">
                <div class="flex-grow-1">
                  <div class="mb-1">Email</div>
                  <v-text-field
                    v-model="user.email"
                    :rules="[userRules.required, userRules.email]"
                    class="text-body-2"
                    placeholder="usuario@tcmt.com"
                    outlined
                    solo
                    flat
                    dense
                    type="mail"
                    required
                  ></v-text-field>
                </div>

                <!--              <v-file-input-->
                <!--                outlined-->
                <!--                v-model="userPhoto"-->
                <!--                dense-->
                <!--                accept="image/png, image/jpeg, image/bmp, image/jpg"-->
                <!--                placeholder="Foto"-->
                <!--                prepend-icon="mdi-camera-enhance-outline"-->
                <!--                label="Foto"-->
                <!--              ></v-file-input>-->

                <div class="ml-5 flex-grow-1">
                  <div class="mb-1">Teléfono</div>
                  <v-text-field
                    v-model="user.phone"
                    :roles="[userRules.require]"
                    class="text-body-2"
                    outlined
                    solo
                    flat
                    dense
                    required
                  ></v-text-field>
                </div>
              </div>
              <div class="mb-1">Roles</div>
              <v-select
                v-model="user.groups"
                :rules="[userRules.groups, userRules.isExternal]"
                :items="roles"
                item-text="name"
                item-value="key"
                outlined
                dense
                solo
                flat
                multiple
                required
                chips
                deletable-chips
                small-chips
                @change="verifySmeRole"
              >
              </v-select>
              <div class="mb-1">Establecimientos permitidos</div>
              <small>Si no selecciona ninguno tiene acceso a todos</small>
              <AsyncCombobox
                v-model="user.access_facilities"
                :api="eatApi().getFetcher()"
                url="/facilities/search"
                item-text="name"
                item-value="id"
                search-param="keyword"
                return-object
                :combobox="false"
                outlined
                dense
                multiple
                :params="facilityParams"
                prepend-inner-icon="mdi-factory"
              >
                <template v-slot:item="{ item }">
                  <span>{{ item.name }}</span>
                </template>
                <template v-slot:selection="data">
                  <v-chip
                    class="py-3"
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    small
                  >
                    {{ data.item | facilityName }}
                  </v-chip>
                </template>
              </AsyncCombobox>
              <div v-if="isNewUser" class="mb-1">Contraseña</div>
              <v-text-field
                v-if="isNewUser"
                v-model="user.password"
                :rules="[userRules.required, testNumberComputed, testMayusComputed, testSpecialComputed, testMinLengthComputed ]"
                class="text-body-2"
                outlined
                dense
                solo
                flat
                :disabled="!isNewUser"
                required
              ></v-text-field>
              <template v-if="isNewUser">
                <ul class="mb-2 mt-0 ps-3">
                  <li :class="{'color-green': testNumberComputed }">
                    <span class="mdi mdi-check-circle"></span>Un número de 0 a 9.
                  </li>
                  <li :class="{'color-green': testMayusComputed }">
                    <span class="mdi mdi-check-circle"></span>Una letra mayúscula.
                  </li>
                  <li :class="{'color-green': testSpecialComputed }">
                    <span class="mdi mdi-check-circle"></span>Un caracter especial (!¡@#$%&?¿/+-).
                  </li>
                  <li :class="{'color-green': testMinLengthComputed }">
                    <span class="mdi mdi-check-circle"></span>Mínimo 8 caracteres de logitud.
                  </li>
                </ul>
              </template>
            </v-form>
          </div>
        </div>
      </v-card-text>
      <v-card-actions dense class="justify-end">
        <v-btn small text color="secondary" @click="closeModal()">
          cerrar
        </v-btn>
        <v-btn
          small
          text
          color="primary"
          @click="saveUserData"
          :disabled="!valid"
          :loading="loading.saveUser"
        >
          {{ isNewUser ? "Crear usuario" : "Guardar cambios" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { eatApi } from "@/apis";
import { mapGetters, mapMutations } from "vuex";
import { ROLES } from "@/mixins/globals";
import { updateFileAndUploadToS3 } from "@/store/modules/s3upload";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import { facilityName } from "@/Filters";

export default {
  name: "editUser",
  components: { UserAvatar, AsyncCombobox },
  data() {
    return {
      facilities: [],
      dialog: true,
      valid: true,
      userPhoto: null,
      imageUrl: null,
      user: {},
      loading: {
        getUser: false,
        saveUser: false,
      },
      userRules: {
        required: (value) => !!value || "Campo requerido",
        length: (value) => (!!value && value?.length >= 3) || "minimo 3 letras",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Mail invalido";
        },
        groups: (value) => value?.length > 0 || "Elija al menos un rol",
        isExternal: (value) => {
          if (!value?.includes("BASE")) {
            return true;
          } else if (value?.length !== 1) {
            return "El usuario con rol externo no puede tener otro rol asignado";
          }
          return true;
        },
        lowercase: (value) =>
          !/\W|[A-Z]/.test(value) ||
          "El nombre de usuario no debe contener mayúsculas ni caracteres especiales",
      },
    };
  },

  created() {
    if (!this.isNewUser) {
      this.getUser();
    }
  },

  computed: {
    ...mapGetters("user", ["getFacilitiesByUser"]),
    facilityParams() {
      const id = [];
      this.getFacilitiesByUser?.forEach((item) => id.push(item.id));
      return {
        id: id,
      };
    },
    isNewUser() {
      return this.$route.params.id === "new";
    },

    roles() {
      return Object.entries(ROLES).map((r) => {
        return { key: r[1], name: this.rolNameTranslate(r[0]) };
      });
    },
    testMayusComputed() {
      return (
          /[A-Z]/.test(this.user?.password)
      );
    },
    testNumberComputed() {
      return (
          /[0-9]/.test(this.user?.password)
      );
    },
    testSpecialComputed() {
      return (
          /[!@#$%^&*()\-_=+[\]{};:'"\\|,.<>/?]/.test(this.user?.password)
      )
    },
    testMinLengthComputed() {
      return (
          this.user?.password?.length >= 8
      )
    }
  },

  methods: {
    facilityName,
    ...mapMutations(["SET_ALERT"]),
    eatApi() {
      return eatApi;
    },

    closeModal() {
      this.resetValues();
      this.$router.go(-1);
    },

    resetValues () {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();

      this.facilities = [];
      this.user = {};
    },

    reset() {
      return (this.user.access_sectors = []);
    },

    rolNameTranslate(value) {
      if (value === "SME") {
        return "Administrador";
      } else if (value === "EMPLOYEE") {
        return "Empleado";
      } else if (value === "LEADER") {
        return "Lider";
      } else if (value === "ORIGINATOR") {
        return "Originador";
      } else if (value === "REGU") {
        return "Regulador";
      } else {
        return "Base";
      }
    },

    getFacilities() {
      eatApi
        .getFetcher()
        .get(`facilities`)
        .then((res) => {
          this.facilities = res.data.results;
        });
    },
    verifySmeRole(roles) {
      const lastRole = roles[roles.length - 1];
      if (lastRole === ROLES.SME) {
        this.user.groups = [ROLES.SME];
      } else {
        this.user.groups = roles.filter((role) => role !== ROLES.SME);
      }
    },

    getUser() {
      this.loading.getUser = true;
      eatApi
        .getFetcher()
        .get(`auth/users/${this.$route.params.id}`)
        .then(({ data }) => {
          this.mapUser(data.results);
        })
        .finally(() => {
          this.loading.getUser = false;
        });
    },

    mapUser(user) {
      const groups = user.groups.map((g) => g.name);
      this.user = { ...user, groups };
      // if (this.user.groups.some((role) => role === ROLES.SME)) {
      //   this.isSmeUser = true;
      // }
      this.imageUrl = null;
      this.userPhoto = null;
    },

    loadImage(e) {
      const fileList = e.target.files;
      const fr = new FileReader();
      fr.readAsDataURL(fileList[0]);
      fr.addEventListener("load", () => {
        this.imageUrl = fr.result;
        this.userPhoto = fileList[0];
      });
    },

    saveUserData() {
      this.loading.saveUser = true;

      // Procesar access facilities
      this.user.access_facilities = this.user.access_facilities?.length
        ? this.user.access_facilities.map((f) => (f.name ? f.id : f))
        : [0];

      const { invalid_email, photo, id, ...user } = this.user;
      const requestMethod = this.isNewUser ? "post" : "put";
      const requestUrl = this.isNewUser
        ? `auth/users/`
        : `auth/users/${this.user.id}`;

      eatApi
        .getFetcher()
        [requestMethod](requestUrl, user)
        .then((res) => {
          if (!this.userPhoto) return res;

          const userID = res.data.results.id;
          return updateFileAndUploadToS3(
            eatApi.getFetcher(),
            `auth/users/${userID}`,
            "photo",
            this.userPhoto
          ).catch(() => {
            throw "files"; // Lanzar error si la subida falla
          });
        })
        .then(({ data }) => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Los cambios se guardaron correctamente",
          });
          this.$emit("load-users");
          if (this.isNewUser) this.$router.go(-1);
          this.mapUser(data.results);
        })
        .catch((error) => {
          const msg =
            error === "files"
              ? "Error al guardar la foto de usuario"
              : error?.response?.data?.detail || "Error al guardar el usuario";

          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: msg,
          });
        })
        .finally(() => {
          this.loading.saveUser = false;
        });
    },
  },
};
</script>
<style>
.v-text-field.v-text-field--solo .v-label {
  align-items: center;
  top: calc(20%);
}

.v-select__slot .v-label {
  font-size: 12px;
  height: 24px;
  background: #d7d8d9;
  border-radius: 12px;
  margin: 0 6px 0 4px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 2px;
  line-height: 20px;
  color: #153240;
}
.color-green {
  color: seagreen;
}

ul {
  list-style: none;

  & li {
    display: flex;
    align-items: center;
  }

  & span {
    margin-bottom: 4px;
    font-size: 24px;
    margin-right: 2px;
  }
}
</style>
