<template>
  <div>
    <div style="font-size: 12px; margin-bottom: 2px; font-family: 'BalsamiqSans-Regular';">{{ lable }}</div>
    <v-select :disabled="disabled" item-color="orange" background-color="rgba(0,0,0,0.5)" flat solo @change="handleChange" v-model="content" :items="chains" dense item-text="name" return-object>
      <template slot="selection" slot-scope="data">
        <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; width: 100%; ">
          <!-- transparent -->
          <div><img :src="require('~/assets/chains/' + data.item.icon)" :width="iconSize" :height="iconSize" alt="From chain logo"/></div>
          <div style="font-family: 'BalsamiqSans-Regular' !important;">{{ data.item.name }}</div>
        </div>
      </template>
      <template slot="item" slot-scope="data">
        <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; width: 100%; font-size: 16px; ">
          <div><img :src="require('~/assets/chains/' + data.item.icon)" :width="iconSize" :height="iconSize" alt="To chain logo" /></div>
          <div style="font-family: 'BalsamiqSans-Regular' !important;">{{ data.item.name }}</div>
        </div>
      </template>
    </v-select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  // value prop is a 'hack' alongside with handleChange to use v-model in our component
  props: ['chains', 'iconSize', 'lable', 'value', 'disabled'],
  mounted() {
    if (!this.content) {
      this.content =  this.chains[0];
      //this.$emit('input', this.content);
    }
  },
  data() {
    return {
      content: this.value,
    }
  },
  watch: {
    chains(c) {
      if (!this.content)
        this.content = this.chains[0];
    },
    value(val) {
      this.content = this.value;
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('input', val);
    }
  },
  computed: {
    ...mapGetters({
    })
  }
}
</script>
