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
        <h3 class="faq-title">What Do?</h3>
        <ul class="faq-content">
          <li>The Secret Tunnel allows users to wrap their ETH, BNB, ERC20 or BEP20 tokens and mint SNIP20 tokens, which are wrapped with privacy on the Secret Network.</li>
          <li>The tunnel is powered by Axelar, meaning that transactions to and from Secret Network will pass through Axelar.</li>
        </ul>

        <!-- <h3 class="faq-title">How Use?</h3>
        <ul class="faq-content">
          <li>Usage of the Tunnel requires both Metamask and Keplr wallets. For an in depth video guide, please check out this <link></li>
        </ul> -->

        <h3 class="faq-title">How See?</h3>
        <ul class="faq-content">
          <li>Balances on Secret Network are private, and require permits or viewing keys. You can find out more about these privacy-preserving mechanisms in this<a href="https://medium.com/@secretnetwork/secret-network-access-control-viewing-keys-vs-permits-97baad539e72" target="_blank" class="link-style">helpful blog post</a></li>
        </ul>

        <h3 class="faq-title">Funds Safu?</h3>
        <ul class="faq-content">
          <li>Your assets are safely stored in a smart contract. As long as you've entered a Secret Network address that you control, your funds are safe.</li>
          <li>For support, you can reach out to the Secret Network's <a class="link-style" href="https://discord.com/invite/SJK32GY" target="_blank">discord</a> or directly to Axelar's <a class="link-style" href="https://axelar.network/" target="_blank">website</a> or <a class="link-style" href="https://discord.com/invite/aRZ3Ra6f7D" target="_blank">discord</a></li>
        </ul>

        <h3 class="faq-title">Which Coin?</h3>
        <ul class="faq-content">
          <li>Currently assets from Ethereum and Binance Smart Chain are supported. In the future, we may add more networks to this interface. Have any requests? <a class="link-style" href="https://discord.com/invite/SJK32GY" target="_blank">Let us know</a></li>
        </ul>

        <h3 class="faq-title">Why Disabled?</h3>
        <ul class="faq-content">
          <li>Make sure that both Keplr & MetaMask are connected</li>
        </ul>

        <h3 class="faq-title">Why Timeout?</h3>
        <ul class="faq-content">
          <li>Sometimes relayers take their time to transfer packets from one network to another. Even if you receive timeout, the funds will make it to their destination, or in the worst case will go back to your account</li>
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
    height: 610px; overflow: auto
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

  .link-style {
    font-weight: bold; text-decoration: none; color: white
  }

</style>
