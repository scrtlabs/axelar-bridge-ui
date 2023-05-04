import Vue from 'vue';

Vue.mixin({
  data() {
    return {
      globalVariable: 'This is a global variable',
    };
  },
  methods: {
    lala() {
      this.globalVariable = "AAA";
    }
  }
});
