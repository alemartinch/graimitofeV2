export const Validations = {
  name: "Validations",

  data() {
    return {
      today: new Date().toISOString().substr(0, 10),
      twentyDaysForward: new Date(
        new Date().getTime() + 19 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .substr(0, 10),
      rRequired: (v) => !!v || v === 0 || "El dato es requerido",
      rEmail: (v) =>
        !v ||
        /^[a-zA-Z0-9_\-.]+@[a-zA-Z0-9_-]+\.[.a-zA-Z0-9]+$/.test(v) ||
        "El e-mail no es válido",
      rAlpha: (v) =>
        !v ||
        /^[a-zA-ZáéíóúàèìòùÁÉÍÓÚÀÈÌÒÙñÑ\s]+$/.test(v) ||
        "El dato no es alfabético",
      rAlphaNumeric: (v) =>
        !v ||
        /^[a-zA-Z0-9áéíóúàèìòùÁÉÍÓÚÀÈÌÒÙñÑ\s]+$/.test(v) ||
        "El dato no es alfanumérico",
      rAlphaNumericSigns: (v) =>
        !v ||
        /^[a-zA-Z0-9áéíóúàèìòùÁÉÍÓÚÀÈÌÒÙñÑ.,:(){}_\-¿?|¡!@#$&*+\s]+$/.test(v) ||
        "El dato no es válido",
      rNumeric: (v) => !v || /^[0-9]+$/.test(v) || "El dato no es numérico",
      rDecimal: (v) =>
        !v ||
        /^[0-9]+$/.test(v) ||
        /^[0-9]+,[0-9]{1,2}$/.test(v) ||
        /^[0-9]+\.[0-9]{1,2}$/.test(v) ||
        "El dato no es válido",
      rInteger: (v) =>
        !v || /^[0-9]+$/.test(v) || "El dato debe ser un número entero",
      rNonZero: (v) =>
        !v ||
        parseFloat(this.numApunto(v)) !== 0 ||
        "El dato debe ser distinto de 0",
      rPositive: (v) =>
        !v || parseFloat(this.numApunto(v)) > 0 || "El dato debe ser mayor a 0",
      rRatio: (v) =>
        !v ||
        (parseFloat(this.numApunto(v)) >= 0 &&
          parseFloat(this.numApunto(v)) <= 1) ||
        "El dato debe estar entre 0,0 and 1,0",
      rNonNegative: (v) =>
        !v ||
        parseFloat(this.numApunto(v)) >= 0 ||
        "El dato debe ser mayor o igual a 0",
      rPercentage: (v) =>
        !v ||
        (parseFloat(this.numApunto(v)) >= 0 &&
          parseFloat(this.numApunto(v)) <= 100) ||
        "El dato debe ser entre 0 y 100",
      rPhone: (v) =>
        !v || /^[0-9\-+()\s]+$/.test(v) || "El dato no es numérico",
      rCuit: (v) =>
        !v ||
        /^[0-9]{1,3}-[0-9]+-[0-9]$/.test(v) ||
        (/^[0-9]+$/.test(v) && v.length > 6 && v.length < 14) ||
        "El cuit consta de 10 o más cifras",
      rPasswordMin: (v) => v.length >= 8 || "Mínimo 8 caracteres",
      /*rPasswordComplex: (v) =>
          !v ||
           /[A-Z]/.test(v) &&
          /[!@#$%^&*()\-_=+[\]{};:'"\\|,.<>/?]/.test(v) ||
          "Debe contener al menos una mayúscula y un carácter especial",*/
      rTodayOrBefore: (v) => v <= this.today,
      rTodayOrAfter: (v) => v >= this.today,
      r20daysForwardOrAfter: (v) => v >= this.twentyDaysForward,
    };
  },

  methods: {
  },
};
