<template>
  <div class="main-section-wrapper-mobile">
    <div>
      <img :src="require('~/assets/images/mobile-title.webp')" />
    </div>

    <div style="">
      <v-btn @click="connect()">Connect</v-btn>
    </div>

    <!-- TODO: Add -->
    <!-- <div class="wallet-item-container">
      <div :style="styleObject2" class="wallet-item">
        Connect Wallet
        <img :src="require('~/assets/wallets/metamask.logo.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 5px" alt="metamask logo"/>
        <div :class="isMMConnected ? 'green-dot' : 'red-dot'"></div>
      </div>    

    </div> -->

    <div class="assets-to-transfer-mobile">
      <div style="margin-top: 5px; margin-left: 10px; font-size: 14px">Asset to transfer:</div>      
      <v-text-field hide-details="true" v-model="search" label="Search" clearable style="padding-left: 10px; padding-right: 10px"></v-text-field>
      <v-list v-if="fromChain != null" style="background-color: transparent">
        <!-- <template v-for="(chain, chainIdx) in availableChains[fromChainKey]"> -->
          <v-list-group active-class="orange--text" v-for="(chain, chainIdx) in filteredChains" value="" :key="'chain-title-' + chainIdx">
            <template v-slot:activator>
              <v-list-item-title>{{ chain.name }}</v-list-item-title>
            </template>
            <template v-slot:prependIcon>
              <img :src="require('~/assets/chains/' + chain.icon)" :width="32" :height="32" />
            </template>


            <v-list-item v-for="(token, index) in chain.tokens" @click="testClick(token, chain.chainInfo.chainId)" :key="'token-from-item-' + chainIdx + '_' + index">
              <v-list-item-icon>
                <img :src="require('~/assets/tokens/' + token.icon)" :width="itemIconSize" :height="itemIconSize" />
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{ token.symbol }}</v-list-item-title>
                <!-- <div v-if="data.item.description" :style="descriptionStyle" class="token-item-description">{{ data.item.description }}</div> -->

              </v-list-item-content>
            </v-list-item>            
          </v-list-group>
      </v-list>
    </div>

    <sub-chain-selector :disabled="transferInProgress" lable="To" v-model="toChain" :chains="availableChains[toChainKey]" :icon-size="itemIconSize" style="width: 90%"></sub-chain-selector>

    <div v-if="fromChain != null" class="" style="margin-top: 10px; width: 90%; font-family: 'BalsamiqSans-Regular' !important">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 5px">
        <v-text-field
          class="right-input number-input"
          type="number"
          style="max-width: 200px"
          color="orange"
          background-color=""
          label="Amount"
          solo
          flat
          v-model="amount"
          dense
          :suffix="selectedToken == null ? 'unknown' : selectedToken.symbol"
        >
          <v-btn slot="append" dense x-small @click="amount = getNormalizedCurrentBalance">MAX</v-btn>
        </v-text-field>
        <div style="margin-top: -26px"></div>
        <div v-if="true" style="margin-top: -26px">Balance: {{ showCurrentBalance }}</div>
      </div>

      <div>
        <div style="margin-bottom: 5px">From address: {{ fromAccountName }}</div>
        <div>
          <v-text-field disabled class="address-input pa-0 ma-0" color="orange" flat dense label="" :value="sourceAddress"></v-text-field>
        </div>
        <div style="margin-bottom: 5px">To address:</div>
        <div>
          <v-text-field
            class="address-input pa-0 ma-0"
            background-color="#000000"
            color="orange"
            flat
            dense
            label=""
            v-model="destinationAddress"
          ></v-text-field>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mainMixin from '../mixins/mainMixin';

export default {
  name: "MobileUI",
  mixins: [mainMixin],  
  components: {  },
  data() {
    return {
      search: '',
      signClient: null,
      web3Modal: null,
      provider: null,
      web3: null,
      styleObject2: {
        '--color': 'red',
        '--color-hover': 'blue',
        '--width': '50px',
        // '--width-hover': '150px',
        '--overflow': 'hidden',
        '--overflow-hover': 'hidden',
        '--height': '40px',
        '--height-hover': '40px'
      }
    }
  },
  mounted() {
    var self = this;
    this.$nextTick(async () => {

      // self.provider = new WalletConnectProvider({
      //   rpc: {
      //     1: "https://mainnet.infura.io/v3/",
      //     56: "https://bsc-dataseed.binance.org/",
      //   },
      //   qrcodeModalOptions: {
      //     mobileLinks: [
      //       "metamask",
      //       "trust",
      //       "kepler"
      //     ],
      //   },
      // });

      // self.web3 = new Web3(this.provider);

      // self.provider.on("accountsChanged", (accounts) => {
      //   console.log(accounts);
      // });

      // // Subscribe to chainId change
      // self.provider.on("chainChanged", (chainId) => {
      //   console.log(chainId);
      // });

      // // Subscribe to session disconnection
      // self.provider.on("disconnect", (code, reason) => {
      //   console.log(code, reason);
      // });



      // self.signClient = await SignClient.init({
      //   projectId: WALLET_CONNECT_PROJECT_ID,
      //   // optional parameters
      //   relayUrl: "http://10.0.0.116:3000",
      //   metadata: {
      //     name: "Example Dapp",
      //     description: "Example Dapp",
      //     url: "#",
      //     icons: ["https://walletconnect.com/walletconnect-logo.png"],
      //   },
      // });

      // self.signClient.on("session_event", ({ event }) => {
      //   // Handle session events, such as "chainChanged", "accountsChanged", etc.
      // });

      // self.signClient.on("session_update", ({ topic, params }) => {
      //   const { namespaces } = params;
      //   const _session = self.signClient.session.get(topic);
      //   // Overwrite the `namespaces` of the existing session with the incoming one.
      //   const updatedSession = { ..._session, namespaces };
      //   // Integrate the updated session state into your dapp state.
      //   onSessionUpdate(updatedSession);
      // });

      // self.signClient.on("session_delete", () => {
      //   // Session was deleted -> reset the dapp state, clean up from user session, etc.
      // });

      // self.web3Modal = new Web3Modal({
      //   projectId: WALLET_CONNECT_PROJECT_ID,
      //   // `standaloneChains` can also be specified when calling `web3Modal.openModal(...)` later on.
      //   standaloneChains: ["eip155:1"],
      // });
    });
  },
  computed: {
    chainsForMobile() {
      return this.allChains.filter(chain => chain.enableForMobile === true);
    },
    filteredChains() {
      if (!this.search) {
        return this.chainsForMobile;
      }
      const filteredItems = []
      this.chainsForMobile.forEach(chain => {
        const matchingTokens = chain.tokens.filter(token => token.symbol.toLowerCase().includes(this.search.toLowerCase()))
        if (matchingTokens.length > 0) {
          const filteredItem = Object.assign({}, chain)
          filteredItem.tokens = matchingTokens
          filteredItems.push(filteredItem)
        }
      })
      return filteredItems
    },
    // styleObject() {
    //   return {
    //     '--color': 'red',
    //     '--color-hover': 'blue',
    //     '--width': '50px',
    //     // '--width-hover': '150px',
    //     '--overflow': 'hidden',
    //     '--overflow-hover': 'hidden',
    //     '--height': '40px',
    //     '--height-hover': '40px'
    //   };
    // },
  },
  methods: {
    async walletConnect() {
      try {
        await this.provider.enable();
        alert("connected")
        const accounts = await this.web3.eth.getAccounts();
        alert(accounts);
      } catch (err) {
        console.log(err);
      }

      // try {
      //   const { uri, approval } = await this.signClient.connect({
      //     // Optionally: pass a known prior pairing (e.g. from `signClient.core.pairing.getPairings()`) to skip the `uri` step.
      //     pairingTopic: pairing?.topic,
      //     // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
      //     requiredNamespaces: {
      //       eip155: {
      //         methods: [
      //           "eth_sendTransaction",
      //           "eth_signTransaction",
      //           "eth_sign",
      //           "personal_sign",
      //           "eth_signTypedData",
      //         ],
      //         chains: ["eip155:1"],
      //         events: ["chainChanged", "accountsChanged"],
      //       },
      //     },
      //   });

      //   // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
      //   if (uri) {
      //     this.web3Modal.openModal({ uri });
      //     // Await session approval from the wallet.
      //     const session = await approval();
      //     // Handle the returned session (e.g. update UI to "connected" state).
      //     // * You will need to create this function *
      //     onSessionConnect(session);
      //     // Close the QRCode modal in case it was open.
      //     this.web3Modal.closeModal();
      //   }
      // } catch (e) {
      //   console.error(e);
      // }
    },
    testClick(token, chainId) {
      if (chainId != this.fromChain.chainInfo.chainId) {
        this.swapChains(false);
      }
      this.selectedToken = token;
    },    
  }
};
</script>

<style scoped>

/* >>> .v-list-group__header {
  background-color: rgba(129, 127, 139, 0.5) !important;
} */
.main {
  /* background-color: transparent !important; */
}

/* .stone-button {
  background: url('~/assets/images/stone-button.png') no-repeat center center; 
  background-size: cover;
  background-color: transparent !important;
  width: 149px;
  min-height: 56px;
  color: black
} */

.input-coin {
  position: absolute;
  left: -200px;
  bottom: 320px;
  opacity: 0;
}

.output-coin {
  position: absolute;
  /* right: 130px; bottom: 125px; */
  right: 200px;
  bottom: 270px;
  opacity: 0;
  /* z-index: 99; */
  /* left: 130px; bottom: 150px;   */
}

.input-coin-start {
  animation: input-coin-anim 2s linear;
}

.output-coin-start {
  animation: output-coin-anim 2s linear;
}

@keyframes input-coin-anim {
  0% {
    transform: translate(0px, 250px);
    opacity: 0;
  }

  5% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  90.1% {
    opacity: 0;
  }

  100% {
    transform: translate(400px, 0px);
    opacity: 0;
  }
}

@keyframes output-coin-anim {
  0% {
    transform: translate(0px, 0px);
    opacity: 0;
  }

  5% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  95% {
    opacity: 0;
  }

  100% {
    transform: translate(430px, 250px);
    opacity: 0;
  }
}

.wallet-item-container {
  position: absolute;
  top: 40px;
  left: 0px;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.wallet-item {
  /* position: absolute;  */
  cursor: pointer;
  width: var(--width);
  height: 40px;
  margin-bottom: 10px;
  z-index: 2;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.47, 1.64, 0.41, 0.8);
  transition-duration: 0.3s;
  border-radius: 0 10px 10px 0;
  font-family: 'Banana';
  white-space: nowrap;

  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(7px);

  display: flex;
  justify-content: flex-end;
  align-items: center;

  overflow: hidden;
}

.wallet-item:hover, .wallet-item:active {
  /* width: var(--width-hover); */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.styled-button {
  background: linear-gradient(90deg, #ea7534 0%, #7ec9cf 100%) !important;
  width: 230px;
  height: 48px;
  color: white;
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

.main-section-wrapper {
  position: relative;
  top: 130px;
  width: 1095px;
  min-height: 889px !important;
  flex-direction: column;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.main-section {
  width: 600px !important;
  height: 650px !important;
  /* background-color: hsl(222, 27%, 15%, 0.7); */
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  padding: 20px;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  backdrop-filter: blur(7px);
}

.main-section-disable {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0.4;
  z-index: 2;
  margin-top: -20px;
  border-radius: 20px;
  border-color: white;
  border-style: dashed;
  backdrop-filter: blur(7px);
}

.assets-to-transfer {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: rgba(20, 25, 36, 0.7);
  border-radius: 10px;
  padding: 10px;
  box-shadow: inset 0 0 2px #000;
}

.transfer-info {
  font-family: 'BalsamiqSans-Regular';
  margin-top: 20px;
  width: 100%;
  background-color: rgba(100, 100, 100, 0.5);
  border-radius: 10px;
  padding: 10px;
  box-shadow: inset 0 0 2px #000;

  min-height: 100px;
}

.right-cave {
  position: absolute;
  z-index: 5;
  bottom: 149px;
  right: 146px;
  background: url('~/assets/images/right-cave.webp') no-repeat center center;
  width: 176px;
  height: 319px;
}

.left-cave {
  position: absolute;
  z-index: 5;
  bottom: 180px;
  left: 143px;
  background: url('~/assets/images/left-cave.webp') no-repeat center center;
  width: 143px;
  height: 272px;
}

.input-sign {
  position: absolute;
  z-index: 5;
  bottom: 252px;
  left: -60px;
  /* background: url('~/assets/images/input-sign.png') no-repeat center center;  */
  width: 185px;
  height: 156px;

  display: flex;
  justify-content: center;
}

.input-sign .input-name {
  font-family: 'Banana';
  color: black;
  font-size: 22px;
}

.output-sign {
  position: absolute;
  z-index: 1;
  bottom: 230px;
  right: -30px;
  /* background: url('~/assets/images/output-sign.png') no-repeat center center;  */
  width: 185px;
  height: 156px;

  display: flex;
  justify-content: center;
}

.output-sign .output-name {
  font-family: 'Banana';
  color: black;
  font-size: 22px;
}

>>> .right-input input {
  text-align: right;
}

.address-input {
  border-radius: 10px !important;
}

.address-input >>> input {
  padding: 10px !important;
  background-color: rgb(54, 53, 73) !important;
  border-radius: 10px !important;
}

.address-input >>> .v-input__slot::before {
  border-style: none !important;
}

.address-input >>> .v-input__slot::after {
  border-style: none !important;
}

/* Hide the arrows of number field */
.number-input >>> input::-webkit-outer-spin-button,
.number-input >>> input::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.connect-wallet-section {
  width: 600px !important;
  text-align: left;
  margin-bottom: 10px;

  z-index: 2;
}

.wallet-menu-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.red-dot {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: red;
  margin-right: 10px;
}

.green-dot {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: green;
  margin-right: 10px;
}

.mountain {
  position: absolute;
  top: 0px;
  /* width: 1095px; */
  width: 1205px;
  min-height: 899px !important;
  height: 899px !important;
  background: url('~/assets/images/mountain-bg.webp') no-repeat center top transparent;
  z-index: 0;
}
</style>

<style scoped>
.main-section-wrapper-mobile {
  width: 100vw;
  /* min-height: 889px !important; */
  flex-direction: column;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.assets-to-transfer-mobile {
  width: 90%;
  height: 220px;
  overflow-y: scroll;
  /* font-family: 'BalsamiqSans-Regular' !important; */
  background-color: rgba(50, 50, 50, 0.7);
  border-radius: 15px;
  padding: 0px;
  box-shadow: inset 0 0 2px #000;
}
</style>
