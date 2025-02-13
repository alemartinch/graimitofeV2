<template>
  <AppSpinner v-if="loading.fetchEventData" :msg="`Cargando evento ${id}`" />
  <v-container v-else>
    <v-row>
      <v-col cols="12" :md="dialog ? 9 : 7">
        <div class="d-flex align-center">
          <span class="text-h6 text-md-h5"
            >EVENTO {{ event.temp_event.id }}
            •
            <v-tooltip bottom v-if="apisEnabled.includes('reports')">
              <template v-slot:activator="{ on }">
                <v-btn
                  @click="downloadEventReport('pdf')"
                  icon
                  v-on="on"
                  :loading="loading.downloadReport.pdf"
                >
                  <v-icon color="#E57373">mdi-file-document</v-icon>
                </v-btn>
              </template>
              <span>Descargar reporte pdf</span>
            </v-tooltip>
            <v-tooltip bottom v-if="apisEnabled.includes('reports')">
              <template v-slot:activator="{ on }">
                <v-btn
                  @click="downloadEventReport('xlsx')"
                  icon
                  v-on="on"
                  :loading="loading.downloadReport.csv"
                >
                  <v-icon color="#43A047">mdi-file-excel-outline</v-icon>
                </v-btn>
              </template>
              <span>Descargar reporte xlsx</span>
            </v-tooltip>
          </span>
        </div>
        <div class="d-flex align-center">
          <span class="text-h3">{{ getOriginName }}</span>
        </div>
      </v-col>
      <v-spacer v-if="!dialog" />
    </v-row>
    <!--ADJUNTOS-->
    <v-card flat class="pa-3" v-if="event.temp_event.files.length">
      <AttachFilesMb />
    </v-card>
    <v-card flat class="pa-3">
      <div class="body-2 my-2">Áres de gestión</div>
      <div class="text-h6">{{ event.temp_event.process_areas[0].name }}</div>
    </v-card>
    <v-card flat class="pa-3 pt-2">
      <div class="body-2 my-2">Establecimiento</div>
      <div class="text-h6">{{ event.temp_event.facility.name }}</div>
    </v-card>
    <v-card flat class="pa-3 pt-2">
      <div class="body-2 my-2">Sector</div>
      <div class="text-h6">
        {{ event.temp_event.sector.name | reduceText(30) }}
      </div>
    </v-card>
    <v-card flat class="pa-3 pt-2">
      <div class="body-2 my-2">Hallazgo y acciones</div>
      <FindingsLoaderList />
    </v-card>
  </v-container>
</template>

<script>
import AppSpinner from "@/components/app-page/AppSpinner.vue";
import eventInfo from "@/views/EventsPanel/mixins/eventInfo";
import AttachFilesMb from "@/components/newevent-page/EventLoader/AttachFilesMb.vue";
import FindingsLoaderList from "@/components/newevent-page/EventLoader/FcaLoader/FindingsLoaderList.vue";

export default {
  name: "EventInfoMb",
  components: { FindingsLoaderList, AttachFilesMb, AppSpinner },
  mixins: [eventInfo],
  created() {
    this.getEvent();
  },
};
</script>

<style scoped></style>
