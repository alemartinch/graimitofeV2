<template>
  <v-container class="pa-0 ma-0 mt-5" fluid>
    <v-data-table
      class="mt-3 d-flex flex-column justify-space-between fill-height"
      :height="$vuetify.breakpoint.mdAndDown ? 430 : 580"
      :headers="headers"
      :items="har.assessments"
      :loading="loading"
      :dense="$vuetify.breakpoint.mdAndDown"
      fixed-header
      hide-default-footer
      @page-count="pageCount = $event"
      :page.sync="page"
      :options.sync="options"
      @update:options="requestAssessments"
      :server-items-length="totalAssessments"
      sort-by="-id"
    >
      <template v-slot:body="{ items }">
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ har.tiers[item.regulation.tier] }}</td>
            <td>
              <span
                style="cursor: pointer"
                @click="
                  $router.push({
                    name: `regulation-resume`,
                    query: { id: item.regulation.id },
                  })
                "
                ><span class="blue--text">[{{ item.regulation.id }}]</span> -
                {{ item.regulation.regulation_code }}</span
              >
            </td>
            <td>
              <extend-tooltip
                :text="item.compliance_evidence"
                trunc-length="50"
              />
            </td>
            <td>
              {{ har.assessmentResults[item.compliance].name }}
            </td>
            <td>
              <v-btn
                color="primary"
                small
                icon
                text
                @click="openEvaluationPanel(item.id)"
              >
                <v-icon>mdi-eye-outline</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
      <template v-slot:footer>
        <v-divider />
        <TablePagination
          item-name="evaluaciones"
          :items-per-page.sync="options.itemsPerPage"
          :page.sync="page"
          :length="pageCount"
          :total-items="totalAssessments"
          :loading="loading"
        />
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
/*import axios from "axios";*/
import { mapActions, mapState } from "vuex";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TablePagination from "@/components/reusable/TablePagination.vue";
export default {
  name: "EvaluationsTable",
  components: { TablePagination, ExtendTooltip },
  data() {
    return {
      loading: false,
      options: null,
      page: 1,
      pageCount: 0,
      sortDesc: false,
      totalAssessments: 0,
      headers: [
        {
          text: "Id",
          value: "id",
        },
        { text: "Tipo", value: "is_internal_regulation", sortable: false },
        {
          text: "Requerimiento",
          value: "regulation_id",
          sortable: false,
        },
        { text: "Justificacion", value: "justification", sortable: false },
        { text: "Resultado", sortable: false },
        {},
      ],
    };
  },

  computed: {
    ...mapState(["har"]),
  },

  methods: {
    ...mapActions("har", ["getAssessments"]),
    requestAssessments() {
      this.getAssessments({
        page: this.page,
        page_size: this.options.itemsPerPage,
        ordering: this.options.sortDesc[0]
          ? `-${this.options.sortBy[0]}`
          : this.options.sortBy[0],
      }).then((res) => {
        this.totalAssessments = res.totalItems;
        this.loading = false;
      });
    },
    openEvaluationPanel(id) {
      this.$router.push({
        name: `evaluation-panel`,
        query: { id },
      });
    },
  },
};
</script>
<style lang=""></style>
