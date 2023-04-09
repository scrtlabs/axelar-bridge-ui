<template>
  <div style="display: flex; flex-direction: column">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <div style="font-family: RockyRock; line-height: 30px; font-size: 30px; color: orange" >FAQ</div>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn  v-bind="attrs" v-on="on" @click="hide" icon small><v-icon color="orange">mdi-arrow-down</v-icon></v-btn>
        </template>
        <span>Back</span>
      </v-tooltip>
    </div>
    <div style="background-image: linear-gradient(to right, #fff 30%, rgba(255, 255, 255, 0); height: 2px; width: 100%; opacity: 0.7"></div>
    <div class="faq-section">
      <div style="margin-top: 20px; width: 99%; background-color: rgba(0, 0, 0, 0.5);">
        <h3 class="faq-title">What is the Secret bridge v2?</h3>
        <ul class="faq-content">
          <li>The bridge allows users to lock their ETH, BNB, ERC20 or BEP20 in a smart contract on Ethereum and mint secretETH, secretBNB, secretERC20 or secretBEP20, which are wrapped tokens with privacy on the Secret Network based on SNIP-20 standard.</li>
          <li>To bridge the assets, we are using the Axelar SDK, meaning that transactions from and to Ethereum/Binance will go through Axelar.</li>
        </ul>

        <h3 class="faq-title">Why the page is disabled?</h3>
        <ul class="faq-content">
          <li>Make sure that both Keplr & MetaMask are connected</li>
        </ul>
        
        <h3 class="faq-title">Something happened! Are my funds gone?</h3>
        <ul class="faq-content">
          <li>Relax, no matter what happens, your assets are safely stored in a smart contract.<br>As long as you've entered a Secret Network address that you control, your funds are safe.</li>
          <li>In any case, you should reach out to Axelar for assistance.</li>
          <li>That being said, our legal team requires us to say that none of the bridge operators takes any responsibility for any direct or indirect damages that may be caused by using this software. Choosing to interact with the Bridge is solely up to the discretion of the user.</li>
        </ul>

        <h3 class="faq-title">Which tokens are supported?</h3>
        <ul class="faq-content">
          <li>Please go to the following link <a href=" https://docs.axelar.dev/resources/mainnet" target="_"> https://docs.axelar.dev/resources/mainnet</a></li>
        </ul>        
        
        <div style="height: 100px"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  mounted() {
  },
  methods: {
    hide() {
      this.$emit('hide', 0);
    }
  },
  watch: {
  }
};
</script>

<style scoped>
  h2 {
      font-size: 24px;
      font-weight: bold;
  }
  .faq-title {
      font-size: 18px;
      font-weight: bold;
      margin-top: 20px;
      color: rgba(255, 255, 255, 0.9)
  }
  .faq-content {
      font-size: 14px;
      text-indent: 0px;
      color: rgba(255, 255, 255, 0.7)
  }

  .faq-section {
    height: 590px; overflow: auto
  }

  .faq-section::-webkit-scrollbar {
    width: 14px !important;
  }

  .faq-section::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.9) !important;
  }

  .faq-section::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3) !important;
      border: 1px solid rgba(0, 0, 0, 0) !important;
      outline: 1px solid rgba(255, 255, 255, 0.2) !important;
      outline-offset: -3px !important;
      border-radius: 15px !important;
      opacity: 0.5 !important;
      background-clip: padding-box !important;
  }

</style>
