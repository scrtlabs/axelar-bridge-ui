<template>
  <div>
    <div style="font-size: 12px; margin-bottom: 2px;">{{ lable }}</div>
    <v-select item-color="orange" background-color="transparent" flat solo @change="handleChange" v-model="content" :items="chain.subChains" dense item-text="name" return-object>
      <template slot="selection" slot-scope="data">
        <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; width: 100%; "> 
          <!-- transparent -->
          <div><img :src="require('~/assets/chains/' + data.item.icon)" :width="iconSize" :height="iconSize" /></div>
          <div>{{ data.item.name }}</div>
        </div>
      </template>
      <template slot="item" slot-scope="data">
        <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; width: 100%; font-size: 16px; ">
          <div><img :src="require('~/assets/chains/' + data.item.icon)" :width="iconSize" :height="iconSize" /></div>
          <div>{{ data.item.name }}</div>
        </div>
      </template>
    </v-select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  // value prop is a 'hack' alongside with handleChange to use v-model in our component
  props: ['chain', 'iconSize', 'lable', 'value'], 
  mounted() {
    if (!this.content)
      this.content =  this.chain.subChains[0];
  },
  data() {
    return {
      content: this.value,
    }
  },
  watch: {
    chain(c) {
      if (!this.content)
        this.content = this.chain.subChains[0];
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
