<template>
  <div >
    <v-select :disabled="disabled" item-color="orange" background-color="rgba(0,0,0,0.5)" flat solo @change="handleChange" v-model="content" :items="activeTokens" dense item-text="symbol" return-object>
      <template slot="selection" slot-scope="data">
        <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; width: 100%;">
          <div><img :src="require('~/assets/tokens/' + data.item.icon)" :width="iconSize" :height="iconSize" /></div>
          <div style="font-family: 'BalsamiqSans-Regular' !important;">{{ data.item.symbol }}</div>
        </div>
      </template>
      <template slot="item" slot-scope="data">
        <div class="token-item">
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
  props: ['tokens', 'iconSize', 'lable', 'value', 'disabled', 'to'], 
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
    value(token) {
      this.content = token;
      this.$emit('input', this.content);
    },
    to(newTo) {
      let isActive = this.activeTokens.includes(this.content);
      if (!isActive) {
        for (let i = 0; i < this.activeTokens.length; i++) {
          if (this.activeTokens[i].denom.indexOf(this.content.denom) != -1) {
            this.content = this.activeTokens[i];
            this.$emit('input', this.content);
            return;
          }
        }
      }
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('input', val);
    }
  },
  computed: {
    ...mapGetters({
    }),

    activeTokens() {
      let _tokens = [];
      for (var i = 0; i < this.tokens.length; i++) {
        if (this.tokens[i].allow_autounwap) {
          if (this.to.nativeCurrency && this.to.nativeCurrency.symbol === this.tokens[i].symbol) {
            _tokens.push(this.tokens[i]);  
          }
        } else {
          _tokens.push(this.tokens[i]);
        }
      }
      return _tokens;
    }
  }
}
</script>

<style >
.token-item {
  display: flex; 
  justify-content: flex-start; 
  align-items: center; 
  gap: 10px; 
  width: 100%; 
  font-size: 16px;
}

/* ::-webkit-scrollbar {
  width: 14px !important;
}

::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.9) !important;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(0, 0, 0, 0) !important;
  outline: 1px solid rgba(255, 255, 255, 0.2) !important;
  outline-offset: -3px !important;
  border-radius: 15px !important;
  opacity: 0.5 !important;
  background-clip: padding-box !important;
} */
</style>