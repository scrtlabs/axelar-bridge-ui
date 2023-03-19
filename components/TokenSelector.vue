<template>
  <div >
    <v-select :disabled="disabled" item-color="orange" background-color="rgba(0,0,0,0.5)" flat solo @change="handleChange" v-model="content" :items="tokens" dense item-text="symbol" return-object>
      <template slot="selection" slot-scope="data">
        <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; width: 100%;">
          <div><img :src="require('~/assets/tokens/' + data.item.icon)" :width="iconSize" :height="iconSize" /></div>
          <div style="font-family: 'BalsamiqSans-Regular' !important;">{{ data.item.symbol }}</div>
        </div>
      </template>
      <template slot="item" slot-scope="data">
        <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; width: 100%; font-size: 16px;">
          <div><img :src="require('~/assets/tokens/' + data.item.icon)" :width="iconSize" :height="iconSize" /></div>
          <div style="font-family: 'BalsamiqSans-Regular' !important;">{{ data.item.symbol }}</div>
        </div>
      </template>
    </v-select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  // value prop is a 'hack' alongside with handleChange to use v-model in our component
  props: ['tokens', 'iconSize', 'lable', 'value', 'disabled'], 
  mounted() {
    if (this.tokens) {
      this.content = this.tokens[0];
      this.$emit('input', this.content);
    }
    
  },
  data() {
    return {
      content: this.value,
    }
  },
  watch: {
    tokens(c) {
      this.content = this.tokens[0];
      this.$emit('input', this.content);
    },
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
