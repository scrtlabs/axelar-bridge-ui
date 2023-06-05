<template>
  <div class="main-section-wrapper-mobile mx-auto overflow-hidden">
    <div style="height: 20px"></div>
    <v-app-bar-nav-icon v-if="isFina || isMetaMask" @click.stop="drawer = !drawer" style="position: absolute; left: 2px; top: 2px"></v-app-bar-nav-icon>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      left
      temporary
      style="z-index: 99999"
    >
      <v-list
        nav
        dense
      >
        <v-list-item-group
          active-class=""
        >
          <v-list-item>
            <v-list-item-title @click="clearPermit">
              {{ clearPermitText }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title @click="showMobileFAQ">FAQ</v-list-item-title>
          </v-list-item>

        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-dialog
      v-model="mobileFAQ"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <faq @hide="mobileFAQ = false"></faq>
      </v-card>
    
    </v-dialog>


    <div>
      <img :src="require('~/assets/images/mobile-title.webp')" />
    </div>

    <template v-if="isFina || isMetaMask">
      <div class="assets-to-transfer-mobile">
      <div style="margin-top: 5px; margin-left: 10px; font-size: 14px">Asset to transfer:</div>      
      <v-text-field hide-details="true" v-model="search" label="Search" clearable style="padding-left: 10px; padding-right: 10px"></v-text-field>
      <v-list dense v-if="fromChain != null" style="background-color: transparent">
        <!-- <template v-for="(chain, chainIdx) in availableChains[fromChainKey]"> -->
          <template v-for="(chain, chainIdx) in filteredChains" >
          <!-- <v-list-group active-class="orange--text" v-for="(chain, chainIdx) in filteredChains" value="" :key="'chain-title-' + chainIdx"> -->
            <v-list-item class="network-title" :key="'chain-title-' + chainIdx">
              <v-list-item-icon>
                <img  :src="require('~/assets/chains/' + chain.icon)" :width="32" :height="32" />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  {{ chain.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <!-- <template v-slot:activator>
              <v-list-item-title dense>
                <div style="display: flex; justify-content: space-between; align-items: center">
                  {{ chain.name }}
                  <img v-if="selectedToken && fromChain && fromChain.chainInfo.chainId === chain.chainInfo.chainId" :src="require('~/assets/tokens/' + selectedToken.icon)" :width="24" :height="24" />
                </div>
                
              </v-list-item-title>
            </template>
            <template v-slot:prependIcon>
              <img  :src="require('~/assets/chains/' + chain.icon)" :width="32" :height="32" />
            </template> -->

            <v-list-item :class="selectedToken && fromChain && fromChain.chainInfo.chainId === chain.chainInfo.chainId && selectedToken.symbol == token.symbol ? 'green--text' : ''" v-for="(token, index) in chain.tokens" @click="selectToken(token, chain.chainInfo.chainId)" :key="'token-from-item-' + chainIdx + '_' + index" style="margin-left: 30px">
              <v-list-item-icon>
                <img :src="require('~/assets/tokens/' + token.icon)" :width="itemIconSize" :height="itemIconSize" />
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title style="display: flex; justify-content: space-between; align-items: center">
                  {{ token.symbol }}
                  <v-icon color="green" v-if="selectedToken && fromChain && fromChain.chainInfo.chainId === chain.chainInfo.chainId && selectedToken.symbol == token.symbol">mdi-check-all</v-icon>
                </v-list-item-title>
                <!-- <div v-if="data.item.description" :style="descriptionStyle" class="token-item-description">{{ data.item.description }}</div> -->

              </v-list-item-content>
            </v-list-item>            
          <!-- </v-list-group> -->
          </template>
      </v-list>
    </div>

    <sub-chain-selector :disabled="transferInProgress" lable="To" v-model="toChain" :chains="toChainsForMobile" :icon-size="itemIconSize" style="width: 90%"></sub-chain-selector>

    <div v-if="fromChain != null" class="" style="margin-top: -10px;  width: 90%; font-family: 'BalsamiqSans-Regular' !important">
      <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;">
        <v-text-field
          class="right-input number-input"
          type="number"
          pattern="[\d\.]*"
          style="width: 100%"
          color="orange"
          background-color="black"
          label="Amount"
          solo
          flat
          v-model="amount"
          dense
          hide-details="true"
          @focus="$event.target.select()"
          :suffix="selectedToken == null ? 'unknown' : selectedToken.symbol"
        >
          <v-btn slot="append" dense x-small @click="amount = getNormalizedCurrentBalance">MAX</v-btn>
        </v-text-field>
        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; overflow: hidden;">
          <div>Balance: </div>
          <div v-if="!refreshBalance">{{ showCurrentBalance }}</div>
          <div v-if="refreshBalance" style="width: 20px">
            <lottie-wrapper
              style="z-index: 2"
              :speed="1"
              :height="20"
              :path="require('../assets/animations/wait.json')"
            />
          </div>
          <v-btn icon dense x-small @click="getBalance">
            <v-icon size="16">mdi-refresh</v-icon>
          </v-btn>
        </div>
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

      <div class="transfer-info">
        <div style="margin-top: -28px; margin-bottom: 3px; color: orange; font-weight: bold; font-size: 16px; font-family: 'BalsamiqSans-Regular">Info:</div>
        <div v-if="estimatedFee" style="font-size: 14px">Transfer fee: {{ estimatedFee }}</div>
        <div v-if="estimatedTime != -1" style="font-size: 14px">Estimated Time: {{ estimatedTime }} minutes</div>
        <div v-if="!transferInProgress && maxTransfer != ''" style="font-size: 14px">Maximum Transfer Amount: {{ maxTransfer }}</div>
        <div style="font-size: 14px;" v-html="axelarStatus"></div>
        <div v-if="tx == ''"></div>
        <div v-else>
          {{ tx }}
          <br />
          {{ ibcTx }}
        </div>
      </div>

      <div style="padding-bottom: 20px; margin-top: 20px; width: 100%; display: flex; flex-direction: column; align-items: center;">
        <v-btn class="styled-button" style="font-family: Banana; font-size: 16px; z-index: 999" @click="send" :disabled="!selfCheckApproved || !isValidTransferAsset || transferInProgress || disableUI">{{ transferInProgress ? "Processing..." : "Transfer" }}</v-btn>
        <v-checkbox v-if="!selfCheckApproved" color="green" dense :ripple="false" hide-details style="margin-top: -3px;" v-model="selfCheckApproved">
          <template v-slot:label>
            <span style="font-size: 12px; margin-left: -6px">I approve that all the information above is correct</span>
          </template>
        </v-checkbox>

        <div v-if="info_error != ''" class="error-styling">
          <v-icon size="16" color="error">mdi-alert</v-icon> {{ info_error }}
        </div>
      </div>

      <div v-if="showProcessAnimation">
        <lottie-wrapper
          style="z-index: 2"
          :speed="1"
          :height="100"
          :path="require('../assets/animations/processing.json')"
        />
      </div>

      <div v-if="showWrapAnimation">
        <lottie-wrapper
          style="z-index: 20"
          :speed="1"
          :width="100"
          :height="100"
          :loop="false"
          :path="require('../assets/animations/' + selectedToken.animation)"
        />
      </div>


    </div>

    </template>
    <template v-else>
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="font-size: 16px; text-align: center; margin-bottom: 10px">
          To use Secret Tunnel with mobile device,<br>please use Fina Wallet for Cosmos chains or MetaMask for EVMs
        </div>
        <v-btn v-if="isFina === false" @click="goToFina"><img :src="require('~/assets/images/fina.webp')" style="width: 24px; height: 24px; margin-right: 10px"/>Go To Fina</v-btn>
        <br/><br/>
        <v-btn v-if="isMetaMask === false" @click="goToMetaMask"><img :src="require('~/assets/wallets/metamask.logo.svg')" style="width: 24px; height: 24px; margin-right: 10px"/>Go To MetaMask</v-btn>
        <div style="font-size: 16px; text-align: center; margin-top: 10px">
          For a better experience, we recommend using the desktop version
        </div>
      </div>
    </template>
  </div>
</template>

<script>
const fallbackURLAndroid = "https://play.google.com/store/apps/details?id=com.fina.secret&hl=en&gl=US";
const fallbackURLiOS = "https://apps.apple.com/us/app/fina-wallet/id1636168233";

const isAndroid = /Android/i.test(navigator.userAgent);
const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

import mainMixin from '../mixins/mainMixin';

export default {
  name: "MobileUI",
  mixins: [mainMixin],  
  components: {   },
  data() {
    return {
      drawer: false,
      search: '',
      signClient: null,
      web3Modal: null,
      provider: null,
      web3: null,
      mobileFAQ: false,
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
      this.$nuxt.$on('secretjs-loaded', async () => {
        if (self.isMobile && self.selectedToken === null) {
          if (this.isMetaMask) {
            if (self.chainsForMobile.length > 0) {
              self.selectToken(self.chainsForMobile[0].tokens[0], self.chainsForMobile[0].chainInfo.chainId);
              //self.selectedToken = self.chainsForMobile[0].tokens[0];
            }
          } else {
            self.selectedToken = self.fromChain.tokens[0];
          }
        }
      });
    });
  },
  computed: {
    isFina() {
      return window.fina !== undefined || window.keplr !== undefined;
    },
    isMetaMask() {
      return window.ethereum !== undefined;
    },
    a() {
      return `isiOS: ${isiOS}, isAndroid: ${isAndroid}`;
    },
    chainsForMobile() {
      if (this.isFina) {
        return this.allChains.filter(chain => chain.enableForMobile === true && chain.type === "cosmos" );
      } else if (this.isMetaMask) {
        return this.allChains.filter(chain => chain.type === "evm" || (chain.name.toLowerCase() === "secret network") );
      }
      
    },
    toChainsForMobile() {
      if (this.isFina) {
        return this.availableChains[this.toChainKey].filter(chain => chain.enableForMobile === true);
      } else if (this.isMetaMask) {
        return this.availableChains[this.toChainKey].filter(chain => chain.type === "evm" || (chain.name.toLowerCase() === "secret network"));
      }
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
    }
  },
  methods: {
    showMobileFAQ() {
      this.drawer = false;
      this.mobileFAQ = true;
    },
    goToFina() {
      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append("network", "secret-4");
      urlSearchParams.append("url", window.location.href);

      let deepLinkURL;
      let fallbackURL;

      if (isAndroid) {
        deepLinkURL = `fina://wallet/dapps?${urlSearchParams.toString()}`;
        fallbackURL = fallbackURLAndroid;
      } else if (isiOS) {
        deepLinkURL = `fina://wallet/dapps?${urlSearchParams.toString()}`;
        fallbackURL = fallbackURLiOS;
      } else {
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = deepLinkURL;
      document.body.appendChild(iframe);

      const timer = setTimeout(() => {
        window.location = fallbackURL;
      }, 500);

      window.addEventListener("blur", () => {
        clearTimeout(timer);
      });

    },    

    goToMetaMask() { 
      window.location = "https://metamask.app.link/dapp/tunnel.scrt.network/";
    },
    // async walletConnect() {
    //   try {
    //     await this.provider.enable();
    //     alert("connected")
    //     const accounts = await this.web3.eth.getAccounts();
    //     alert(accounts);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // },
    selectToken(token, chainId) {
      if (chainId != this.fromChain.chainInfo.chainId) {
        let slectedChain = this.availableChains[this.fromChainKey].filter(chain => chain.chainInfo.chainId === chainId );
        if (slectedChain.length > 0) {
          this.fromChain = slectedChain[0];
          this.selectedToken = token;
        } else {
          this.swapChains(false);
          this.selectedToken = token;
        }
      } else {
        this.selectedToken = token;
      }
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

.network-title {
  
}

>>> .network-title {
  padding-top: 3px;
  padding-bottom: 3px;
  background-color: black; 
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
  height: 230px;
  overflow-y: scroll;
  /* font-family: 'BalsamiqSans-Regular' !important; */
  background-color: rgba(50, 50, 50, 0.7);
  border-radius: 15px;
  padding: 0px;
  box-shadow: inset 0 0 2px #000;
}
</style>
