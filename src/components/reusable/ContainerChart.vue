<template>
  <div class="border my-1">
    <div class="fill" :style="fill"></div>
  </div>
</template>

<script>
export default {
  name: "ContainerChart",
  props: {
    percent: {
      type: Number,
      require: true,
      default: 0,
    },
    color: {
      type: String,
      require: false,
      default: "#306d96",
    },
  },
  computed: {
    fill() {
      return {
        height: this.percent + "%",
        "background-color": this.color,
      };
    },
  },
};
</script>

<style scoped>
.border {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 250px;
  width: 25px;
  background-color: #d2d3d5;
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 0 5px grey;
}

.fill {
  position: relative;
  border-radius: 25px;
}
</style>
