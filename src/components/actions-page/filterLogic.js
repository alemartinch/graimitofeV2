import { mapGetters, mapMutations, mapState } from "vuex";
import { ACTION_STATUSES as AS } from "@/mixins/globals";

export default {
  name: "ActionDataFilters",
  props: {
    parentLoading: {
      type: Boolean,
      default: false,
    },
    defaultFilter: {
      type: Object,
    },
    totalResults: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: false,
      showFilters: false,
      owner: this.currentUserId,
      status: [],
      origin: "",
      users: [],
      statuses: [
        {
          name: "Acciones vencidas",
          abb: "Vencidas",
          key: AS.OVERDUE,
        },
        {
          name: "Acciones pendientes",
          abb: "Pendientes",
          key: AS.PENDING,
        },
        {
          name: "Acciones con efectividad vencida",
          abb: "Efec. vencida",
          key: AS.EF_OVERDUE,
        },
        {
          name: "Acciones con efectividad pendiente",
          abb: "Efec. pendiente",
          key: AS.EF_PENDING,
        },
        {
          name: "Acciones completas",
          abb: "Completas",
          key: "COMP",
        },
        // {
        //   name: 'Acciones completas',
        //   abb: 'COMP',
        //   key: '50COMP'
        // }
        // {
        //   name: 'Acciones con efectividad completa',
        //   abb: 'ECOMP',
        //   key: '60CEFF'
        // }
      ],
    };
  },

  created() {
    //this.getData();
  },

  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["currentUserId"]),

    currentUserId() {
      return this.this.currentUserId;
    },

    filterOn() {
      return this.owner || this.status.length;
    },
    userName() {
      let name = "";
      if (this.owner) {
        name = `${this.owner.first_name} ${this.owner.last_name}`;
        if (this.owner.id === parseInt(this.user.user.id)) {
          name += " (Tú)";
        }
      } else {
        name = "Todos";
      }
      return name;
    },

    statusName() {
      return this.status
        .map((s) => {
          let name = "";
          this.statuses.forEach((ss) => {
            if (s === ss.key) {
              name = ss.abb;
            }
          });
          return name;
        })
        .join(", ");
    },
  },

  methods: {
    ...mapMutations("user", ["add_filter", "clean_filter"]),

    customFilter(item, queryText) {
      const fName = item.first_name.toLowerCase();
      const lName = item.last_name.toLowerCase();
      const searchText = queryText.toLowerCase();

      return fName.indexOf(searchText) > -1 || lName.indexOf(searchText) > -1;
    },

    // getData() {
    //   this.loading = true;
    //   eatApi
    //     .getFetcher()
    //     .get(`auth/users/?page=1&page_size=50`)
    //     .then((res) => {
    //       this.users = res.data.results;
    //       if (this.user.filters) {
    //         this.owner = this.users.find((user) => {
    //           return user.id === +this.user.filters.actions.owner__id;
    //         });
    //         if (!this.owner) this.add_filter({ actions: { owner__id: null } });
    //         this.status = this.user.filters.actions.status.slice();
    //         if (this.status.includes(AS.COMPLETED)) {
    //           this.status = this.status.reduce((a, b) => {
    //             if (![AS.COMPLETED, AS.EF_COMPLETED].includes(b)) {
    //               a.push(b);
    //             }
    //             return a;
    //           }, []);
    //           this.status.push("COMP");
    //         }
    //       }
    //       this.loading = false;
    //     });
    // },

    filterOwner() {
      this.add_filter({
        actions: { owner__id: this.owner?.id || null },
      });
      this.emitFilter();
    },

    filterStatus() {
      let tempStatus = this.status.includes("COMP")
        ? [
            ...this.status.filter((s) => s !== "COMP"),
            AS.COMPLETED,
            AS.EF_COMPLETED,
          ]
        : [...this.status];
      this.add_filter({ actions: { status: tempStatus } });
      this.emitFilter();
    },

    cleanFilter() {
      this.owner = null;
      this.status = [];
      this.clean_filter();
      this.emitFilter();
    },

    getStatusColor(status) {
      switch (status) {
        case AS.PENDING:
          return { color: "orange--text", name: "Pendiente" };
        case AS.OVERDUE:
          return { color: "red--text", name: "Vencida" };
        case AS.COMPLETED:
        case "COMP":
          return { color: "green--text", name: "Completada" };
        case AS.EF_PENDING:
          return { color: "orange--text", name: "E/Pend" };
        case AS.EF_COMPLETED:
          return { color: "green--text", name: "E/Comp" };
        case AS.EF_OVERDUE:
          return { color: "red--text", name: "E/Venc" };
        default:
          return { color: "grey--text", name: "Sin definir" };
      }
    },

    emitFilter() {
      this.$emit("filter");
    },
  },
};
