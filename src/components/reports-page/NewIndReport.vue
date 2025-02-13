<template>
  <v-row class="ma-0 mt-5">
    <v-card outlined width="100%">
      <v-card-text class="d-flex">
        <NewIndReportForm />
        <v-divider vertical class="mx-5"></v-divider>
        <div
          v-if="getIndFilter.fromDate"
          class="d-flex justify-center flex-column"
        >
          <span class="text-caption">Filtros del reporte mostrado</span>
          <v-row class="ma-0 mt-1 d-block">
            Del
            <v-chip small>
              {{ getIndFilter.fromDate | fechaDiaMesAnio }}</v-chip
            >
            al
            <v-chip small> {{ getIndFilter.toDate | fechaDiaMesAnio }}</v-chip>
            <template v-if="getIndFilter.facility.length"
              >en Establecimiento/s:
              <v-chip
                class="mt-1"
                v-for="(facility, i) in getIndFilter.facility"
                :key="i"
                small
                >{{ facility.name }}
              </v-chip>
            </template>
            <template v-if="getIndFilter.sector.length">
              <v-icon>mdi-arrow-right-bold</v-icon>
              <v-chip
                class="mt-1"
                v-for="(sector, i) in getIndFilter.sector"
                :key="i"
                small
                >{{ sector.name | reduceText }}
              </v-chip>
            </template>
            <template v-if="getIndFilter.processArea.length"
              ><br />Área/s de proceso:
              <v-chip
                class="mt-1"
                v-for="(pa, i) in getIndFilter.processArea"
                :key="i"
                small
                >{{ pa.name | reduceText }}
              </v-chip>
            </template>
            <template v-if="getIndFilter.origin.length"
              ><br />Origen/es:
              <v-chip
                class="mt-1"
                v-for="(origin, i) in getIndFilter.origin"
                :key="i"
                small
                >{{ origin.name }}
              </v-chip>
            </template>
            <template v-if="getIndFilter.status"
              ><br />Estado:
              <v-chip class="mt-1" small
                >{{ getIndFilter.status.name }}
              </v-chip>
            </template>
          </v-row>
        </div>
        <!--        <v-divider vertical class="mx-5"></v-divider>-->
        <!--        <div v-if="!loading" class="d-flex justify-center flex-column">-->
        <!--          <span class="text-caption">Últimos reportes generados</span>-->
        <!--          <v-row class="ma-0 mt-1"-->
        <!--            ><v-card-->
        <!--              v-for="report in user.reportFilters"-->
        <!--              class="mr-3 pa-2 d-flex flex-column"-->
        <!--              height="70"-->
        <!--              outlined-->
        <!--              style="border: 1px dashed grey"-->
        <!--              @click="loadReport(report)"-->
        <!--              ><span class="text-center text-overline">cargar</span-->
        <!--              ><v-card-actions class="text-caption pb-0 pr-0"-->
        <!--                ><div class="flex-grow-1"></div>-->
        <!--                {{ report.date | fechaDiaMesAnio }}</v-card-actions-->
        <!--              ></v-card-->
        <!--            ><v-btn-->
        <!--              v-if="user.reportFilters.length"-->
        <!--              icon-->
        <!--              x-large-->
        <!--              class="align-self-center"-->
        <!--              @click="cleanReportHistory"-->
        <!--              ><v-icon x-large>mdi-broom</v-icon></v-btn-->
        <!--            ></v-row-->
        <!--          >-->
        <!--        </div>-->
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script>
import NewIndReportForm from "@/components/reports-page/NewIndReportForm.vue";
import { mapGetters, mapState } from "vuex";

export default {
  name: "NewIndReport",
  components: { NewIndReportForm },
  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["getIndFilter"]),
  },
};
</script>
