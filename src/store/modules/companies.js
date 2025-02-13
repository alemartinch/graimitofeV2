const state = {
  states: [
    { id: "ARG.BA", name: "Buenos Aires" },
    { id: "ARG.CO", name: "Córdoba" },
    { id: "ARG.SF", name: "Santa Fe" },
    { id: "ARG.SL", name: "San Luis" },
    { id: "ARG.MD", name: "Mendoza" },
    { id: "ARG.LP", name: "La Pampa" },
    { id: "ARG.RN", name: "Río Negro" },
    { id: "ARG.SC", name: "Santa Cruz" },
    { id: "ARG.CH", name: "Chubut" },
    { id: "ARG.TU", name: "Tucumán" },
    { id: "ARG.SJ", name: "San Juan" },
    { id: "ARG.LR", name: "La Rioja" },
    { id: "ARG.CT", name: "Catamarca" },
    { id: "ARG.SE", name: "Santiago del Estero" },
    { id: "ARG.JU", name: "Jujuy" },
    { id: "ARG.SA", name: "Salta" },
    { id: "ARG.FO", name: "Formosa" },
    { id: "ARG.ER", name: "Entre Ríos" },
    { id: "ARG.MI", name: "Misiones" },
    { id: "ARG.CN", name: "Corrientes" },
    { id: "ARG.TF", name: "Tierra del Fuego" },
    { id: "ARG.CC", name: "Chaco" },
  ],

  regions: [
    { id: 1, name: "Admistración Central" },
    { id: 2, name: "CCP Arrecifes" },
    { id: 3, name: "CCP Humbolt" },
    { id: 4, name: "CCP Pergamino" },
    { id: 5, name: "CCP Rojas" },
    { id: 6, name: "CCP SM de las Escobas" },
    { id: 7, name: "Regional 1" },
    { id: 8, name: "Regional 2" },
    { id: 9, name: "Regional 3" },
    { id: 10, name: "Regional 4" },
    { id: 11, name: "Regional 5" },
    { id: 12, name: "Regional 6" },
    { id: 13, name: "Regional 7" },
    { id: 14, name: "Regional 8" },
    { id: 15, name: "UN Las Rosas" },
    { id: 16, name: "UN Los Cardos" },
    { id: 17, name: "UN Ramallo" },
  ],
};

const getters = {
  getStates: (state) => {
    return state.states;
  },

  getRegions: (state) => {
    return state.regions;
  },
};

const mutations = {};

const actions = {};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
