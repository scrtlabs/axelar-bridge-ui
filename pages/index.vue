<template>
  <div>
    <div v-if="isMobile" style="position: relative">
      <img style="width: 100%; object-fit: cover" :src="require('~/assets/images/mobile-soon.webp')" alt="mobile coming soon" />
    </div>
    <div
      v-else
      class="main"
      style="position: relative; flex-direction: column; display: flex; justify-content: flex-start; align-items: center; width: 100vw; height: 100vh"
    >
      <lottie-wrapper
        style="position: absolute; top: 410px; left: 90px; z-index: 2"
        :speed="0.5"
        :height="200"
        :path="require('../assets/animations/flame.json')"
      />
      <div class="mountain" />
<!--      <nuxt-img-->
<!--        preload src="/mountain-bg.webp"-->
<!--        alt="Mountain Background"-->
<!--        width="1205"-->
<!--        height="899"-->
<!--        class="mountain"-->
<!--      />-->

      <div class="main-section-wrapper">
        <div class="wallet-item-container">
          <div :style="styleObject" class="wallet-item" @click="connect()">
            Keplr
            <img :src="require('~/assets/wallets/kepler.logo.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 5px" alt="keplr logo"/>
            <div :class="isKeplrConnected ? 'green-dot' : 'red-dot'"></div>
          </div>

          <div :style="styleObject" class="wallet-item" @click="connectMM()">
            MetaMask
            <img :src="require('~/assets/wallets/metamask.logo.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 5px" alt="metamask logo"/>
            <div :class="isMMConnected ? 'green-dot' : 'red-dot'"></div>
          </div>

          <div :style="styleTroubleshootingObject" class="wallet-item">
            <div style="display: flex; align-items: center; margin-top: 8px; font-size: 16px">
              Help
              <img :src="require('~/assets/images/info-icon.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 10px" alt="info icon" />
            </div>
            <div style="padding: 10px; display: flex; flex-direction: column; gap: 5px">
              <v-btn @click="page = page == 1 ? 0 : 1" >FAQ</v-btn>
              <v-btn @click="goToAxelar" >Axelarscan</v-btn>
              <v-btn @click="clearPermit" :disabled="clearPermitText != 'Clear Permit'">{{ clearPermitText }}</v-btn>
              <v-btn @click="switchSite" :color="isTestnet ? '#892323' : '#61a722'" >{{ isTestnet ? "MAINNET" : "TESTNET" }}</v-btn>
            </div>
            <!-- <div style="position: absolute; top: 40px; width: 100%; height: 200px; background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(7px);"></div> -->
          </div>

        </div>

        <div style="position: absolute; top: -30px; right: -150px; z-index: 1">
          <lottie-wrapper
            v-if="showArrowComputed"
            style="filter: invert(48%); transform: scaleX(-1); z-index: 2"
            :speed="1"
            :height="200"
            :loop="false"
            :path="require('../assets/animations/arrow.json')"
          />
          <transition name="fade">
            <img
              v-show="showArrowText && showArrowComputed"
              style="position: absolute; filter: invert(48%); top: 135px; left: 75px; width: 150px"
              :src="require('~/assets/animations/connect-wallets.webp')"
              alt="arrow pointing to connect wallet buttons"
            />
          </transition>
        </div>

        <template v-if="selectedToken">
          <div class="input-coin" id="input-coin">
            <img :src="require('~/assets/tokens/3d/input/' + selectedToken.fromImage)" style="width: 100px" alt="token used to animate source network"/>
          </div>

          <div class="output-coin" id="output-coin">
            <img :src="require('~/assets/tokens/3d/output/' + selectedToken.toImage)" style="width: 90px" alt="token used to animate destination network" />
          </div>
        </template>

        <div class="right-cave" />
        <div class="left-cave" />

        <div class="input-sign" v-if="fromChain != undefined">
          <svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 185 156"
            style="enable-background: new 0 0 185 156"
            xml:space="preserve"
          >
            <style type="text/css">
              .st0 {
                fill: none;
                stroke: none;
                stroke-miterlimit: 10;
              }
            </style>
            <path id="SVGID_x5F_1_x5F_" class="st0" d="M27.8,61.3c64.5-16.4,129.5-5.4,129.5-5.4" />
            <text>
              <textPath class="input-name" xlink:href="#SVGID_x5F_1_x5F_" startOffset="5.0884%">{{ shortNetworkName(fromChain.name) }}</textPath>
            </text>
          </svg>

          <!-- <div class="input-name"> {{ fromChain.name }}</div> -->
        </div>
        <div class="output-sign" v-if="toChain != undefined">
          <svg version="1.1" x="0px" y="0px" viewBox="0 0 185 156" style="enable-background: new 0 0 185 156" xml:space="preserve">
            <style type="text/css">
              .st1 {
                fill: red;
                stroke: none;
                stroke-miterlimit: 10;
              }
            </style>
            <path id="SVGID_x5F_1_x5F_2" class="st0" d="M35.6,56.1c32.1-5.9,111.6-1.5,133,4.7" />
            <text>
              <textPath class="output-name" startOffset="27.4042%" href="#SVGID_x5F_1_x5F_2">{{ shortNetworkName(toChain.name) }}</textPath>
            </text>
          </svg>
        </div>

        <div class="testnet-indicator" v-if="isTestnet">TESTNET</div>
        <!-- <div class="testnet-indicator" style="width: 180px" v-else>!! MAINNET - REAL MONEY !!</div> -->
        <div class="main-section">
          <div class="main-section-tab"  :style="tabStyleObject">
          <div v-if="disableUI" class="main-section-disable"></div>
          <!-- From & To Start -->
          <div style="background-color: transparent; display: flex; justify-content: space-between; width: 100%; gap: 10px">
            <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
              <sub-chain-selector :disabled="transferInProgress" lable="From" v-model="fromChain" :chains="availableChains[fromChainKey]" :icon-size="itemIconSize"></sub-chain-selector>
            </div>

            <div style="display: flex; flex-grow: 1; justify-content: center; align-items: center">
              <v-btn @click="swapChains(true)" :disabled="disableUI" icon width="70" height="70">
                <img :src="require('~/assets/images/swap-button.webp')" width="60" height="60" alt="swap token button" />
              </v-btn>
            </div>

            <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
              <sub-chain-selector :disabled="transferInProgress" lable="To" v-model="toChain" :chains="availableChains[toChainKey]" :icon-size="itemIconSize"></sub-chain-selector>
            </div>
          </div>
          <!-- From & To End -->

          <div v-if="fromChain != null" class="assets-to-transfer" style="">
            <div style="display: flex; justify-content: space-between">
              <div style="font-family: 'BalsamiqSans-Regular">Asset to transfer:</div>
              <div>
                <v-btn :disabled="transferInProgress || getNormalizedCurrentBalance == -1 " dense x-small @click="amount = getNormalizedCurrentBalance">MAX</v-btn>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 10px">
              <div style="display: flex; align-items: flex-start; gap: 10px">
                <token-selector :disabled="transferInProgress" :tokens="fromChain.tokens" :icon-size="itemIconSize" v-model="selectedToken" :to="toChain" style="max-width: 200px"></token-selector>
                <v-tooltip top  v-if="selectedToken && selectedToken.allow_autounwap">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon style="margin-top: 5px" v-bind="attrs" v-on="on">mdi-information</v-icon>
                  </template>
                  <span>This asset can be auto-unwrap to native coin</span>
                </v-tooltip>

                <v-tooltip top  v-if="!isValidTransferAsset">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon style="margin-top: 5px" color="orange" v-bind="attrs" v-on="on">mdi-alert-rhombus</v-icon>
                  </template>
                  <span>This asset cannot be transferred to the selected network</span>
                </v-tooltip>
              </div>
              <v-text-field
                :disabled="transferInProgress"
                class="right-input number-input"
                type="number"
                style="max-width: 150px; font-family: 'BalsamiqSans-Regular' !important"
                color="orange"
                background-color="rgba(0,0,0,0.5)"
                label="Amount"
                solo
                flat
                v-model="amount"
                dense
                 @focus="$event.target.select()"
                :suffix="selectedToken == null ? 'unknown' : selectedToken.symbol"
              ></v-text-field>
            </div>
            <div v-if="true" style="text-align: right; margin-top: -20px; margin-right: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; overflow: hidden">
                <div v-if="selectedToken && selectedToken.allow_autounwap">
                  <v-checkbox color="green" dense :ripple="false" hide-details style="margin-top: -8px;" v-model="autounwrap">
                    <template v-slot:label>
                      <span style="font-size: 12px">Auto Unwrap</span>
                    </template>
                  </v-checkbox>
                </div>
                <div v-else></div>
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; overflow: hidden">
                  <div>Balance: </div>
                  <div v-if="!refreshBalance">{{ showCurrentBalance }}</div>
                  <div v-if="refreshBalance">
                    <lottie-wrapper
                      style="z-index: 2"
                      :speed="1"
                      :height="20"
                      :path="require('../assets/animations/wait.json')"
                    />
                  </div>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon dense x-small v-bind="attrs" v-on="on" @click="getBalance">
                        <v-icon size="16">mdi-refresh</v-icon>
                      </v-btn>
                    </template>
                    <span>Refresh balance</span>
                  </v-tooltip>
                </div>
              </div>
            </div>
            <div style="padding-top: 10px">
              <div style="margin-bottom: 5px; font-family: 'BalsamiqSans-Regular">From address: {{ fromAccountName }}</div>
              <div>
                <v-text-field disabled class="address-input pa-0 ma-0" color="orange" flat dense label="" :value="sourceAddress" spellcheck="false"></v-text-field>
              </div>
              <div style="margin-bottom: 5px; font-family: 'BalsamiqSans-Regular">To address:</div>
              <div>
                <v-text-field
                  :disabled="transferInProgress"
                  class="address-input pa-0 ma-0"
                  background-color="rgb(54, 53, 73)"
                  color="orange"
                  flat
                  dense
                  label=""
                  ref="destinationAddress"
                  v-model="destinationAddress"
                  spellcheck="false"
                >
                <v-btn :disabled="transferInProgress" slot="append" style="margin-top: 5px; margin-right: 8px" x-small @click="autoFill">Auto Fill</v-btn>
                </v-text-field>
              </div>
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

          <div style="margin-top: 20px; width: 100%; display: flex; flex-direction: column; align-items: center;">
            <v-btn class="styled-button" style="font-family: Banana; font-size: 16px; z-index: 999" @click="send" :disabled="!selfCheckApproved || !isMetaMaskChainCorrect || !isValidTransferAsset || transferInProgress || disableUI">{{ transferInProgress ? "Processing..." : "Transfer" }}</v-btn>
            <v-checkbox v-if="!selfCheckApproved" color="green" dense :ripple="false" hide-details style="margin-top: -3px;" v-model="selfCheckApproved">
              <template v-slot:label>
                <span style="font-size: 12px; margin-left: -6px">I approve that all the information above is correct</span>
              </template>
            </v-checkbox>

            <div v-if="!isMetaMaskChainCorrect" class="error-styling">
              Metamask doesn't match selected network<br>Please change it manually
            </div>

            <div v-if="info_error != ''" class="error-styling">
              <v-icon size="16" color="error">mdi-alert</v-icon> {{ info_error }}
            </div>
          </div>
            <process-animation v-if="showProcessAnimation" />
            <wrap-animation v-if="showWrapAnimation" :selected-token="selectedToken"/>
          </div>
          <div class="main-section-tab" style="background-color: transparent">
            <faq @hide="page = 0"></faq>
          </div>
        </div>
      </div>
      <fire-fly></fire-fly>
    </div>
  </div>
</template>

<script>
import axelarConfig from '../store/axelarConfig.json'
import {mapGetters} from 'vuex';
import SubChainSelector from '~/components/SubChainSelector.vue';
import TokenSelector from '~/components/TokenSelector.vue';

// import LottieWrapper from '~/components/LottieWrapper.vue';
import _ from 'lodash';
import {MsgExecuteContract, MsgTransfer, toBase64, toUtf8} from 'secretjs';
// import {AxelarAssetTransfer, AxelarQueryAPI} from '@axelar-network/axelarjs-sdk';

const Web3 = require('web3');

export default {
  components: {
    WrapAnimation: () => import('../components/WrapAnimation.vue'),
    ProcessAnimation: () => import('../components/ProcessAnimation.vue'),
    SubChainSelector,
    TokenSelector,
  },

  async getAxelarTransferInstance() {
    if (!this.axelarTransfer) {
      const { AxelarAssetTransfer } = await import(
        "@axelar-network/axelarjs-sdk"
        );
      this.axelarTransfer = new AxelarAssetTransfer({
        environment: process.env.NUXT_ENV_AXELAR_ENV,
      });
    }
    return this.axelarTransfer;
  },

  async getAxelarApiInstance() {
    if (!this.axelarQuery) {
      const { AxelarQueryAPI } = await import(
        "@axelar-network/axelarjs-sdk"
        );
      this.axelarQuery = new AxelarQueryAPI({
        environment: process.env.NUXT_ENV_AXELAR_ENV,
      });
    }
    return this.axelarQuery;
  },

  created() {
    this.toChain = this.availableChains["main-chain"][0];
    this.fromChain = this.availableChains["sub-chains"][0];
  },
  mounted() {
    let self = this;
    this.$nextTick(() => {
      this.$nuxt.$on('secretjs-loaded', async () => {
        if (self.toChain.type === "cosmos") {
          self.destinationAddress = self.receiverAccount.address;
        } else if (self.toChain.type === "evm") {
          self.destinationAddress = self.MMAccounts[0];
        }


        self.getBalance();

        if (self.isMobile) {
          self.selectedToken = self.fromChain.tokens[0];
        }
      });

      this.$nuxt.$on('keystorechange', async () => {
        //self.destinationAddress = self.receiverAccount.address;
      });

      this.audio['wrap'] = new Audio(require('~/assets/audio/wrap.mp3'));
      this.audio['unwrap'] = new Audio(require('~/assets/audio/unwrap.mp3'));

      this.$nuxt.$on('MM-TX', async (hash) => {
        self.axelarStatus = "Transaction was submitted, please wait..."
      });

      this.$nuxt.$on('MM-confirmation', async (confirmationNumber, receipt) => {
      });

      this.$nuxt.$on('MM-receipt', async (receipt) => {
        self.$store.dispatch('checkTxConfirmation', receipt);
        self.axelarStatus = `Waiting for confirmations 0 / 64 ~ 96... `;
      });

      this.$nuxt.$on('MM-error', async (error, receipt) => {
        console.log("=== MM-error ===")
        console.log(error)
        console.log(receipt)
        self.transferInProgress = false;
        self.showProcessAnimation = false;
        self.selfCheckApproved = false;
        self.axelarStatus = "";
        self.showAxelarTxIndication = "";
        console.log("=== MM-error ===")
      });

      this.$nuxt.$on('MM-confirmation-update', async (confirmations) => {
        let link = "";
        if (self.showAxelarTxIndication != "") {
          link = ` <a style="color: lightgreen" target="_" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["transaction-viewer"]}/${self.showAxelarTxIndication}">(Detailed status available)</a>`;
        }
        self.axelarStatus = `Waiting for confirmations ${confirmations} / 64 ~ 96... ${link}`;
      });

      this.$nuxt.$on('MM-transfer-complete', async (tx) => {
        self.animateProcessing();
        self.getBalance();
        self.transferInProgress = false;
        self.showProcessAnimation = false;
        self.selfCheckApproved = false;
        self.showAxelarTxIndication = "";
        self.axelarStatus = `<div style="color: lightgreen">Transfer complete! You will receive your coins in a few seconds<br><a style="color: lightgreen" target="_" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["transaction-viewer"]}/${tx}">Watch the transaction here</a></div>`;
      });

      this.$nuxt.$on('MM-transfer-indication', async (tx) => {
        self.showAxelarTxIndication = tx;
      });



      this.$nuxt.$on('MM-connected', async () => {
        this.activeMMChainId = window.ethereum.networkVersion;
        this.$store.dispatch('getMMAccounts');
      });

      this.$nuxt.$on('MM-account-changed', async (accounts) => {
        this.$store.commit('updateMMAccounts', accounts);
      });

      this.$nuxt.$on('MM-network-changed', async (networkId) => {
        this.activeMMChainId = Number(networkId);
        this.$store.dispatch('getMMAccounts');
      });

      var connectedBefore = window.localStorage.getItem('connectedBefore');
      if (connectedBefore) {
        this.connect();
        //this.connectMM();
      } else {
        setTimeout(function () {
          self.showArrow = true;
          setTimeout(function () {
            self.showArrowText = true;
          }, 1000);
        }, 1000);
      }



    });
  },
  computed: {
    ...mapGetters({
      noKeplr: 'getNoKeplr',
      keplrLoading: 'getKeplrLoading',
      accounts: 'getAccounts',
      tokenBalance: 'getBalance',
      availableChains: 'getChains',
      bankBalances: 'getBankBalances',
      MMAccounts: 'getMMAccounts',
      MMBalance: 'getMMBalance',
      MMTx: 'getMMTx',
      isMobile: 'isMobile'
    }),
    showArrowComputed() {
      return this.showArrow || !this.isKeplrConnected; // || !this.isMMConnected;
    },
    isTestnet() {
      return process.env.NUXT_ENV_AXELAR_ENV == "testnet";
    },
    navnav() {
      return window.fina;
    },
    walletOption() {
      return true; //this.$route.query.uioption == "1";
    },
    tabStyleObject() {
      if (this.page == 0) {
        return {
          'margin-top': '0px'
        };
      }

      return {
        'margin-top': '-670px'
      };
    },
    styleObject() {
      return {
        '--color': 'red',
        '--color-hover': 'blue',
        '--width': '55px',
        '--width-hover': '150px',
        '--overflow': 'hidden',
        '--overflow-hover': 'hidden',
        '--height': '40px',
        '--height-hover': '40px'
      };
    },
    styleTroubleshootingObject() {
      return {
        "display": "flex",
        "flex-direction": "column",
        "justify-content": "flex-start",
        "align-items": "flex-end",
        '--width': '42px',
        '--width-hover': '150px',
        '--overflow': 'hidden',
        '--overflow-hover': 'none',
        '--height': '40px',
        '--height-hover': '230px'
      };
    },

    disableUI() {
      return !this.isKeplrConnected; // || !this.isMMConnected;
    },
    isKeplrConnected() {
      return this.accounts && Object.keys(this.accounts).length > 0;
    },
    isMMConnected() {
      return this.MMAccounts && this.MMAccounts.length > 0;
    },
    shouldUseMMAddress() {
      return this.selectedToken && ((this.selectedToken.hasOwnProperty('ERC20_address') && this.selectedToken.ERC20_address != '') || this.selectedToken.isEVMNative);
    },
    sourceAddress() {
      if (this.shouldUseMMAddress) {
        return this.isMMConnected ? this.MMAccounts[0] : '';
      } else {
        let tmp = this.senderAccount;
        return tmp ? tmp.address : '';
      }
    },
    senderAccount() {
      if (this.accounts) {
        let chain = this.fromChain.chainInfo.chainId;
        return this.accounts[chain];
      }
      return null;
    },
    receiverAccount() {
      if (this.accounts) {
        let chain = this.toChain.chainInfo.chainId;
        return this.accounts[chain];
      }
      return null;
    },
    selectedTokenTransferDenom() { // This will show the transferable denom, if it has an IBC denom it will return it
      if (this.selectedToken) {
        if (this.selectedToken.ibcDenom && this.selectedToken.ibcDenom !== "") {
          return this.selectedToken.ibcDenom;
        }
        return this.selectedToken.denom;
      }
      return "";
    },
    getNormalizedCurrentBalance() {
      try {
        if (this.selectedToken) {
          if (this.selectedToken.ERC20_address && this.selectedToken.ERC20_address != '') { // Balance from MetaMask
            return (parseInt(this.MMBalance.amount) / Math.pow(10, this.MMBalance.decimals).toFixed(6));
          }  else if (this.selectedToken.SNIP20_address != '' && this.tokenBalance) { // Balance in SNIP-20 contract
            if (this.tokenBalance.balance) {
              return (parseFloat(this.tokenBalance.balance.amount) / Math.pow(10, this.selectedToken.coinDecimals)).toFixed(6);
            }
          } else if (this.bankBalances.has(this.selectedTokenTransferDenom)) { // Balance in Bank
            return (parseFloat(this.bankBalances.get(this.selectedTokenTransferDenom)) / Math.pow(10, this.selectedToken.coinDecimals)).toFixed(6);
          } else {
            return 0;
          }
        }
      } catch (err) {
        console.log(err);
      }
      return -1;
    },
    showCurrentBalance() {
      if (this.selectedToken) {
        let norm = this.getNormalizedCurrentBalance;
        if (norm == -1) {
          return "unknown"
        }
        return this.getNormalizedCurrentBalance + ' ' + this.selectedToken.symbol;
      }
      return '?';
    },

    MMSmallIconStyle() {
      let style = 'margin-right: 10px;';
      style += this.isMMConnected ? '' : 'filter: grayscale(100%);';
      return style;
    },

    KeplrSmallIconStyle() {
      let style = 'margin-right: 10px;';
      style += this.isKeplrConnected ? '' : 'filter: grayscale(100%);';

      return style;
    },

    isValidTransferAsset() {
      if (this.selectedToken) {
        for (let i = 0; i < this.toChain.tokens.length; i++) {
          if (this.toChain.tokens[i].denom.indexOf(this.selectedToken.denom) != -1 ) {
            return true;
          }
        }
      }
      return false;
    },

    isMetaMaskChainCorrect() {
      if (this.fromChain && this.fromChain.type === "evm" && this.isMMConnected) {
        return (Number(this.activeMMChainId) === Number(this.fromChain.chainInfo.chainId));
      }
      return true;
    }
  },
  data() {
    return {
      page: 0,
      itemIconSize: 24,

      fromChain: null,
      toChain: null,

      fromChainKey: "sub-chains",
      toChainKey: "main-chain",

      selectedToken: null,
      amount: 0,

      destinationAddress: '',
      fromAccountName: '',

      ack: 1,
      tx: '',
      ibcTx: '',
      tx_error: '',
      info_error: '',

      showArrow: false,
      showArrowText: false,
      showWrapAnimation: false,
      showProcessAnimation: false,
      audio: {},
      activeMMChainId: -1,

      axelarTransfer: null,
      axelarQuery: null,
      estimatedFee: "",
      maxTransfer: "",
      estimatedTime: -1,
      axelarStatus: "",
      showAxelarTxIndication: "",
      clearPermitText: "Clear Permit",

      transferInProgress: false,
      refreshBalance: false,
      autounwrap: false,

      selfCheckApproved: false

    };
  },
  watch: {
    async selectedToken(token) {
      this.getBalance();
      if (!this.shouldUseMMAddress) {
        if (this.isKeplrConnected) this.fromAccountName = '(' + (await window.keplr.getKey(this.fromChain.chainInfo.chainId)).name + ')';
      } else {
        this.fromAccountName = '';
      }
      let result = await this.calcTransferFee(this.amount == "" ? "0": this.amount);
      if (result) {
        this.estimatedFee = result.display;
      }

      let limit = await this.getMaxTransfer();
      this.maxTransfer = limit.display;
    },

    tokenBalance(newBalance, oldBalance) {
      setTimeout(() => { this.refreshBalance = false; }, 1000);
    },
    bankBalances(newBalance, oldBalance) {
      setTimeout(() => { this.refreshBalance = false; }, 1000);
    },
    MMBalance(newBalance, oldBalance) {
      setTimeout(() => { this.refreshBalance = false; }, 1000);
    },
    MMAccounts(newAccounts, oldAccounts) {
      this.getBalance();
    },

    async amount(val) {
      // if (this.shouldUseMMAddress) {
      //   try {
      //     let result = await this.calcTransferFee(this.amount);
      //     if (result) {
      //       this.estimatedFee = result.display;
      //     }
      //   } catch (err) {}
      // }
    },
    fromChain(newChain, oldChain) {
      if (newChain.type === "evm") {
        this.connectMM();
      } else if (newChain.type === "cosmos") {
        this.connect(false, newChain.chainInfo);
      }

      if (newChain.axelar.transferTime && newChain.axelar.transferTime > -1) {
        this.estimatedTime = newChain.axelar.transferTime;
      } else {
        if (this.toChain.axelar.transferTime == -1) {
          this.estimatedTime = -1;
        }
      }
    },

    toChain(newChain, oldChain) {
        if (newChain.type === "evm") { // EVM
          if (this.isMMConnected) {
            this.destinationAddress = this.MMAccounts[0];
          }
        } else {
          try {
            if (!this.receiverAccount) {
              this.connect(false, newChain.chainInfo);
            } else {
              this.destinationAddress = this.receiverAccount.address;
            }
          } catch (err) {
            console.log(err);
          }
        }

      if (newChain.axelar.transferTime && newChain.axelar.transferTime > -1) {
        this.estimatedTime = newChain.axelar.transferTime;
      } else {
        if (this.fromChain.axelar.transferTime == -1) {
          this.estimatedTime = -1;
        }
      }

    }
  },
  methods: {
    /******* AXELAR *******/

    async calcTransferFee(amount) {
      try {
        let microAmount = this.getMicroAmount(amount);
        const axelarQuery = await this.getAxelarApiInstance();
        const result = await axelarQuery.getTransferFee(this.fromChain.axelar.chain, this.toChain.axelar.chain, this.selectedToken.denom, microAmount);
        var display = result.fee.amount + " " + result.fee.denom;
        var symbol = result.fee.denom;
        let normal = 0;
        if (axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["fee-decimals"].hasOwnProperty(result.fee.denom)) {
          let tokenInfo = axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["fee-decimals"][result.fee.denom];
          normal = parseFloat(result.fee.amount) / Math.pow(10, tokenInfo.decimal);
          if (this.selectedToken.isEVMNative) {
            symbol = this.selectedToken.symbol;
          } else {
            symbol = tokenInfo.symbol;
          }
          display = parseFloat(normal.toFixed(6)).toLocaleString() + " " + symbol;
        }
        result.fee["display"] = display;
        result.fee["symbol"] = symbol;
        result.fee["normalAmount"] = normal;
        result.fee.amount = parseInt(result.fee.amount);

        return result.fee;
      } catch (err) {
        console.log(err);
        return { display: "", symbol: "", normalAmount: -1, amount: -1};
      }
    },

    async getMaxTransfer() {
      let result = {
        display: "",
        amount: -1,
        normalAmount: -1,
        symbol: "",
        denom: ""
      }
      try {
        const axelarQuery = await this.getAxelarApiInstance();
        const limit = await axelarQuery.getTransferLimit({
          fromChainId: this.fromChain.axelar.chain,
          toChainId: this.toChain.axelar.chain,
          denom: this.selectedToken.denom
        });

        if (limit) {
          if (axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["fee-decimals"].hasOwnProperty(this.selectedToken.denom)) {
            let tokenInfo = axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["fee-decimals"][this.selectedToken.denom];
            result.amount = parseInt(limit);
            result.normalAmount = parseFloat(limit) / Math.pow(10, tokenInfo.decimal);
            result.display = result.normalAmount.toLocaleString() + " " + tokenInfo.symbol;
            result.symbol = tokenInfo.symbol;
            result.denom = this.selectedToken.denom;
          }
        }
      } catch (err) { }

      return result;

    },



    async sendFromEVM(amount) {

      this.axelarStatus = "Please wait...";
      this.info_error = "";
      let microAmount = await this.getMicroAmount(amount);
      let fee = await this.calcTransferFee(amount);
      let maxAmount = await this.getMaxTransfer();
      if (fee) {
          this.estimatedFee = fee.display;
      } else {
        this.estimatedFee = "";
      }


      if (maxAmount.normalAmount != -1 && parseFloat(amount) > maxAmount.normalAmount) {
        this.info_error = "Requested amount is excceding the maximum allowed transfer";
        this.axelarStatus = "";
        return;
      }

      let balanceToCheck = this.selectedToken.isEVMNative ? this.bankBalances.get(this.selectedTokenTransferDenom) :  this.MMBalance.amount;
      if (BigInt(balanceToCheck) < BigInt(microAmount)) {
        this.info_error = "Insufficient balance";
        this.axelarStatus = "";
        return;
      }
      let minAmount = fee["normalAmount"] * 2;
      if (parseFloat(amount) < minAmount) {
        this.info_error = `Minimun transfer is (${minAmount} ${fee.symbol})`;
        this.axelarStatus = "";
        return;
      }

      try {
        this.transferInProgress = true;
        this.showProcessAnimation = true;

        this.axelarStatus = "Initializing transfer...";

        const axelarTransfer = await this.getAxelarTransferInstance();
        const depositAddress = await axelarTransfer.getDepositAddress({
          fromChain: this.fromChain.axelar.chain,
          toChain: this.toChain.axelar.chain,
          destinationAddress: this.destinationAddress,
          asset: this.selectedToken.denom
        });
        console.log("Sending to:", depositAddress);
        this.axelarStatus = "Waiting for user approval...";

        this.animateInput();
        if (this.selectedToken.ERC20_address && this.selectedToken.ERC20_address != '') {
          this.$store.dispatch('sendMMTokens', { contract: this.selectedToken.ERC20_address, walletAddress: depositAddress, from: this.sourceAddress, amount: microAmount });
        } else if (this.selectedToken.isEVMNative) {
          this.$store.dispatch('sendCoins', { walletAddress: depositAddress, from: this.sourceAddress, amount: microAmount });
        }
      } catch (err) {
        console.log("Axelar Error: ", err);
        this.transferInProgress = false;
        this.selfCheckApproved = false;
        this.showProcessAnimation = false;
      }
    },


    /******* AXELAR *******/

    autoFill() {
      if (this.toChain.type === "evm" && this.isMMConnected) { // EVM
        this.destinationAddress = this.MMAccounts[0];
      } else {
        this.destinationAddress = this.receiverAccount.address;
      }
      this.$refs.destinationAddress.blur();
    },
    shortNetworkName(name) {
      let sName = name;
      if (sName.indexOf(' ') != -1) {
        let tmp = sName.split(' ');
        sName = tmp[0];
      }
      return sName;
    },
    playSound() {
      let audioFile = this.selectedToken.animation.indexOf('unwrap') != -1 ? 'unwrap' : 'wrap';
      if (this.audio) {
        this.audio[audioFile].play();
      }
    },

    animate() {
      var self = this;
      self.animateInput();
      setTimeout(() => {
        self.showProcessAnimation = false;
        self.showWrapAnimation = true;
        self.playSound();
        setTimeout(self.animateOutput, 4000);
      }, 3000);
    },
    animateInput() {
      this.showWrapAnimation = false;
      var elm = document.getElementById('input-coin');
      if (elm) {
        elm.classList.remove('input-coin-start');
        setTimeout(() => {
          elm.classList.add('input-coin-start');
        }, 200);
      }
    },
    animateProcessing() {
      this.showProcessAnimation = false;
      this.showWrapAnimation = true;
      this.playSound();
      setTimeout(this.animateOutput, 4000);
    },
    animateOutput() {
      this.showWrapAnimation = false;
      var elm = document.getElementById('output-coin');
      if (elm) {
        elm.classList.remove('output-coin-start');
        setTimeout(() => {
          elm.classList.add('output-coin-start');
        }, 200);
      }
    },

    connect(disconnect, chain) {
      if (disconnect) {
        this.$store.dispatch('disconnectKeplr');
      } else {
        this.showArrow = false; //this.showArrowText
        if (typeof chain === 'undefined') {
          this.$dispatchQueue.addToQueue('initKeplr', this.availableChains["main-chain"][0].chainInfo);
        } else {
          this.$dispatchQueue.addToQueue('initKeplr', chain);
        }

      }
    },
    connectMM() {

      let chainId = -1;
      if (this.fromChain.type === "evm") {
        chainId = this.fromChain.chainInfo.chainId;
      }
      this.$store.dispatch('connectMetaMask', { chainId });
    },
    // getChainName(idx) {
    //   return this.getChainList[idx];
    // },

    clearPermit() {
      var self = this;
      const items = Object.keys(window.localStorage);
      this.clearPermitText = "Please wait...";
      for (let i = 0; i < items.length; i++) {
        if (items[i].indexOf("perm_") != -1) {
          window.localStorage.removeItem(items[i]);
        }
      }
      setTimeout(function() {
        self.clearPermitText = "Clear Permit";
      }, 1000);
    },

    switchSite() {
      if (process.env.NUXT_ENV_AXELAR_ENV === "mainnet") {
        window.location.href = "https://secret-tunnel-testnet.pages.dev";
      } else {
        window.location.href = "https://tunnel.scrt.network";
      }
    },

    goToAxelar() {
      window.open(`${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]['transaction-viewer']}s`, '_blank');
    },

    async getBalance() {
      try {
        if (this.senderAccount && this.selectedToken.SNIP20_address) {
          let contract = { address: this.selectedToken.SNIP20_address, codeHash: this.selectedToken.SNIP20_code_hash };
          this.refreshBalance = true;
          this.$store.dispatch('getTokenBalance', {
            account: this.senderAccount,
            contract,
            chainId: this.fromChain.chainInfo.chainId,
            walletAddress: this.sourceAddress
          });
        } else if (this.selectedToken.ERC20_address) {
          this.refreshBalance = true;
          this.$store.dispatch('getMMBalance', { contract: this.selectedToken.ERC20_address, walletAddress: this.MMAccounts[0] });
        }
      } catch (err) {
        //console.log("ERR1: ", err);
      }

      try {
        if (this.selectedToken.isEVMNative) {
          this.refreshBalance = true;
          this.$store.dispatch('getMMBankBalance', { walletAddress: this.MMAccounts[0], denom: this.selectedTokenTransferDenom });

        } else if (this.senderAccount && !this.selectedToken.ERC20_address) {
          this.refreshBalance = true;
          this.$store.dispatch('getBankBalance', { account: this.senderAccount, walletAddress: this.sourceAddress });
        }
      } catch (err) {
        //console.log("ERR2: ", err);
      }
    },

    getMicroAmount(amount) {
      if (this.selectedToken.coinDecimals > 16) {
        return Web3.utils.toWei(amount + "");
      }
      return Math.round(parseFloat(amount) * Math.pow(10, this.selectedToken.coinDecimals));
    },

    async send() {
      if (this.amount == "" || this.amount == null || Number.isNaN(this.amount)) {
        this.info_error = 'Amount must be a valid number';
        return;
      }

      this.tx_error = '';
      this.info_error = '';
      this.showAxelarTxIndication = "";
      let microAmount = this.getMicroAmount(this.amount);
      if (microAmount == 0) {
        this.info_error = 'Amount must be grater than 0';
        return;
      }


      this.axelarTransfer = new AxelarAssetTransfer({ environment: process.env.NUXT_ENV_AXELAR_ENV });

      if (this.fromChain.type === "evm") {
        this.sendFromEVM(this.amount);
      } if (this.fromChain.type === "cosmos") {
        if (this.fromChain.chainInfo.out_port === 'transfer') { // To secret
          this.sendTransfer(microAmount);
        } else {
          this.sendWasm(microAmount); // from secret
        }
      }
    },

    showAxelarError(err) {
      this.axelarStatus = `<div style="color: orange">Error:<br>${err}</div>`;
      this.transferInProgress = false;
      this.showProcessAnimation = false;
    },

    async sendTransfer(amount) {
      try {
        this.axelarStatus = "Please wait...";
        let fee = await this.calcTransferFee(amount);
        if (fee) {
            this.estimatedFee = fee.display;
        } else {
          this.estimatedFee = ""
        }

        if (BigInt(this.bankBalances.get(this.selectedTokenTransferDenom)) < BigInt(amount)) {
          this.info_error = "Insufficient balance";
          this.axelarStatus = "";
          return;
        }

        if (amount <= fee.amount) {
          this.info_error = `Minimun transfer should cover the fees (${fee.amount} ${fee.denom})`;
          this.axelarStatus = "";
          return;
        }

        this.transferInProgress = true;
        this.showProcessAnimation = true;
        this.axelarStatus = "Initializing transfer...";

        var depositAddress = this.destinationAddress;
        let usedAxelarAPI = false;
        if (this.fromChain.name.toLowerCase() !== "axelar") {
          const axelarTransfer = await this.getAxelarTransferInstance();
          depositAddress = axelarTransfer.getDepositAddress({
            fromChain: this.fromChain.axelar.chain,
            toChain: this.toChain.axelar.chain,
            destinationAddress: this.destinationAddress,
            asset: this.selectedToken.denom,
          });
          usedAxelarAPI = true;
        }

        amount = amount + ""; // convert to string
        const msgTransfer = new MsgTransfer({
          source_port: this.fromChain.chainInfo.out_port,
          source_channel: this.fromChain.chainInfo.out_channel,
          token: {
            amount,
            denom: this.selectedTokenTransferDenom
          },
          timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60), // 10 minutes
          sender: this.sourceAddress,
          receiver: depositAddress
        });

        console.log(msgTransfer);

        this.axelarStatus = "Waiting for user approval...";

        let signedTX = await this.senderAccount.tx.signTx([msgTransfer], {
          gasLimit: 500_000,
          gasPriceInFeeDenom: 0.1,
          feeDenom: this.fromChain.chainInfo.stakeCurrency.coinMinimalDenom
        });

        this.axelarStatus = "Transaction was submitted, please wait..."
        this.animateInput();
        let tx = await this.senderAccount.tx.broadcastSignedTx(signedTX, {
          ibcTxsOptions: {
            resolveResponses: true, // enable IBC responses resolution (defualt)
            resolveResponsesTimeoutMs: 12 * 60 * 1000, // stop checking after 12 minutes (default is 2 minutes)
            resolveResponsesCheckIntervalMs: 15_000 // check every 15 seconds (default)
          }
        });

        console.log(tx);
        if (tx.code !== 0) {
          this.tx_error = "unknown";
          switch (tx.code) {
            case 5:
              this.tx_error = "insufficient funds";
              break;
            case 7:
              this.tx_error = "Invalid address";
              break;
            case 11:
              this.tx_error = "Out of gas";
              break;
            case 13:
              this.tx_error = "insufficient fees";
              break;
          }
        }

        if (this.tx_error === '') {
          this.axelarStatus = `<div style="color: orange">Received TX, waiting for ibc acknowledgment...<br><a style="color: orange" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["cosmos-block-explorer"]}/${this.fromChain.chainInfo.mintscan}/txs/${tx.transactionHash}" target="_">Watch the transaction here</a></div>`;

          this.ack = 0;
          const ibcResponses = await Promise.all(tx.ibcResponses);
          this.ack = 1;
          console.log(ibcResponses);

          if (ibcResponses.length > 0) {
            this.transferInProgress = false;
            this.showProcessAnimation = false;

            // check for error:
            try {
              const txError = ibcResponses[0].tx.arrayLog.find((x) => x.type == 'fungible_token_packet' && x.key == 'error');
              if (txError) {
                console.log("ERROR 1")
                console.error(txError);
                console.log("ERROR 1")
                this.tx_error = txError.value;
              }
            } catch (err) {
              console.log("ERROR 2")
              console.error(err)
              console.log("ERROR 2")
            }
          }
          this.getBalance();

          if (this.tx_error == '') {
            this.axelarStatus = `<div style="color: lightgreen">Transfer complete! You will receive your coins in a few seconds.<br><a  style="color: lightgreen" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["cosmos-block-explorer"]}/${this.fromChain.chainInfo.mintscan}/txs/${ibcResponses[0].tx.transactionHash}" target="_">Watch the ibc acknowledgment here</a></div>`;
            this.transferInProgress = false;
            this.selfCheckApproved = false;
            this.animateProcessing();
          } else {
            this.showAxelarError(this.tx_error);
          }
        } else {
          this.showAxelarError(this.tx_error);
        }

      } catch (err) {
        console.error(err);
        this.showAxelarError("Unknown");
      }
    },

    async sendWasm(amount) {
      this.tx = undefined;
      this.ack = -1;
      this.ibcTx = undefined;

      this.axelarStatus = "Please wait...";
      this.info_error = "";
      //let microAmount = await this.getMicroAmount(amount);
      let fee = await this.calcTransferFee(amount);
      let maxAmount = await this.getMaxTransfer();
      if (fee) {
          this.estimatedFee = fee.display;
      }


      if (maxAmount.amount != -1 && parseFloat(amount) > maxAmount.amount) {
        this.info_error = "Requested amount is excceding the maximum allowed transfer";
        this.axelarStatus = "";
        return;
      }

      if (this.selectedToken.SNIP20_address && this.selectedToken.SNIP20_address != '') {
        // console.log(`${this.tokenBalance.balance.amount} < ${amount}`);
        if (this.tokenBalance.balance.amount < amount) {
          this.info_error = "Insufficient balance";
          this.axelarStatus = "";
          return;
        }
      }

      let minAmount = fee.amount * 2;
      if (parseFloat(amount) < minAmount) {
        this.info_error = `Minimun transfer is (${fee["normalAmount"] * 2} ${fee.symbol})`;
        this.axelarStatus = "";
        return;
      }

      amount = amount + "";

      this.transferInProgress = true;
      this.showProcessAnimation = true;

      this.axelarStatus = "Initializing transfer...";

      let shouldUnwrap = false;
      try {
        if (this.selectedToken.allow_autounwap && this.autounwrap) {
          shouldUnwrap = true;
        }
      } catch (errUnwrap) {}

      console.log("Should Unwrap:", shouldUnwrap);

      //const depositAddress = this.destinationAddress;
      const axelarTransfer = await this.getAxelarTransferInstance();
      const depositAddress = await axelarTransfer.getDepositAddress({
        fromChain: this.fromChain.axelar.chain,
        toChain: this.toChain.axelar.chain,
        destinationAddress: this.destinationAddress,
        asset: this.selectedToken.denom,
        options: {
          shouldUnwrapIntoNative: shouldUnwrap
        }
      });
      this.axelarStatus = "Waiting for user approval...";

      if (this.senderAccount) {
        let msgToSend = {
          sender: this.sourceAddress,
          contract_address: this.selectedToken.SNIP20_address,
          code_hash: this.selectedToken.SNIP20_code_hash,
          msg: {
            send: {
              recipient: this.fromChain.chainInfo.out_port.replace('wasm.', ''),
              recipient_code_hash: this.fromChain.chainInfo.ICS_code_hash,
              amount,
              msg: toBase64(
                toUtf8(
                  JSON.stringify({
                    channel: this.fromChain.chainInfo.out_channel,
                    remote_address: depositAddress,
                    timeout: 10 * 60 // 10 minutes
                  })
                )
              )
            }
          }
        };

        try {
          console.log(msgToSend);
          let signedTX = await this.senderAccount.tx.signTx([new MsgExecuteContract(msgToSend)], {
            gasLimit: 300_000,
            gasPriceInFeeDenom: 0.1,
            feeDenom: 'uscrt'
          });

          this.axelarStatus = "Transaction was submitted, please wait..."
          this.animateInput();

          this.tx = '';
          let tx = await this.senderAccount.tx.broadcastSignedTx(signedTX, {
            ibcTxsOptions: {
              resolveResponses: true, // enable IBC responses resolution (defualt)
              resolveResponsesTimeoutMs: 720_000, // stop checking after 12 minutes (default is 2 minutes)
              resolveResponsesCheckIntervalMs: 15_000 // check every 15 seconds (default)
            }
          });

          console.log(tx);
          this.axelarStatus = `<div style="color: orange">Received TX, waiting for ibc acknowledgment...<br><a style="color: orange" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["cosmos-block-explorer"]}/${this.fromChain.chainInfo.mintscan}/txs/${tx.transactionHash}" target="_">Watch the transaction here</a></div>`;
          this.ack = 0;
          try {
            const ibcResponses = await Promise.all(tx.ibcResponses);
            this.ack = 1;
            if (ibcResponses.length > 0) {
              console.log(ibcResponses);
              this.axelarStatus = `<div style="color: lightgreen">Transfer to Axelar complete! Detailed status can be found <a  style="color: lightgreen" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["deposit-account-viewer"]}/${depositAddress}" target="_">here</a><br>Your balance will be updated shortly</div>`;
              this.transferInProgress = false;
              this.selfCheckApproved = false;
            }
          } catch (ackError) {
              this.axelarStatus = `<div style="color: orange">Looks like we got timeout, don't worry, detailed status can be found <a  style="color: orange" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["deposit-account-viewer"]}/${depositAddress}" target="_">here</a><br>You should receive your funds shortly</div>`;
              this.transferInProgress = false;
              this.selfCheckApproved = false;
          }
          this.animateProcessing();
        } catch (err) {
          this.tx = undefined;
          this.ack = -1;
          this.ibcTx = '';
          console.error(err);
          this.axelarStatus = ""
          this.transferInProgress = false;
          this.selfCheckApproved = false;
          this.showProcessAnimation = false;
        }
        this.getBalance();
      }
    },

    swapChains(swapTokens) {
      var foundToken = null;
      for (let i = 0; i < this.toChain.tokens.length; i++) {
        if (this.toChain.tokens[i].denom.indexOf(this.selectedToken.denom) != -1) {
          foundToken = _.cloneDeep(this.toChain.tokens[i]);
          break;
        }
      }

      let tmpKey = this.fromChainKey
      this.fromChainKey = this.toChainKey;
      this.toChainKey = tmpKey;

      let tmp = _.cloneDeep(this.fromChain);
      this.fromChain = _.cloneDeep(this.toChain);
      this.toChain = tmp;

      if (this.toChain.type === "cosmos") {
        this.destinationAddress = this.receiverAccount.address;
      } else if (this.toChain.type == "evm") {
        this.destinationAddress = this.MMAccounts[0]
      }


      if (swapTokens && this.fromChain.tokens.length > 0) {
        this.amount = 0;
        var self = this;
        setTimeout(() => {
          self.selectedToken = (foundToken != null) ? foundToken : self.fromChain.tokens[0];
          setTimeout(() => {
            self.getBalance();
          }, 1000);
        }, 200);
      }
    }
  } // methods
};
</script>

<style scoped>
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
  right: 200px;
  bottom: 270px;
  opacity: 0;
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
  left: 847px;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.wallet-item {
  position: relative;
  cursor: pointer;
  width: var(--width);
  height: var(--height);
  margin-bottom: 10px;
  z-index: 2;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.47, 1.64, 0.41, 0.8);
  transition-duration: 0.3s;
  border-radius: 0 10px 10px 0;
  font-family: 'Banana';

  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(7px);

  display: flex;
  justify-content: flex-end;
  align-items: center;

  overflow: var(--overflow);
}

.wallet-item:hover {
  width: var(--width-hover);
  height: var(--height-hover);
  overflow: var(--overflow-hover);
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

.testnet-indicator {
  position: absolute;
  top: -30px;
  height: 25px;
  width: 70px;
  background-color: rgb(158, 4, 4);
  border-radius: 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
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

.main-section-tab {
  width: 600px;
  height: 670px !important;
  position: relative;
  padding: 20px;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.47, 1.64, 0.41, 0.8);
  transition-duration: 0.5s;
}

.main-section {
  width: 600px !important;
  height: 670px !important;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 20px;


  position: relative;
  z-index: 2;
  backdrop-filter: blur(7px);
  overflow: hidden;
}

.main-section-disable {
  position: absolute;
  width: 600px;
  height: 670px;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0.4;
  z-index: 2;
  margin-top: -20px;
  margin-left: -20px;
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
  position: relative;
  /*font-family: 'BalsamiqSans-Regular';*/
  margin-top: 20px;
  width: 100%;
  background-color: rgba(100, 100, 100, 0.5);
  border-radius: 10px;
  padding: 10px;
  box-shadow: inset 0 0 2px #000;

  min-height: 105px;
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

>>> .right-input input::selection {
  background-color: #ff8c00;
}

>>> .right-input input {
  text-align: right;
}

.address-input >>> input::selection {
  background-color: #ff8c00;
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
  min-width: 10px;
  min-height: 10px;
  border-radius: 5px;
  background-color: red;
  margin-right: 10px;
}

.green-dot {
  min-width: 10px;
  min-height: 10px;
  border-radius: 5px;
  background-color: green;
  margin-right: 10px;
}

.mountain {
  position: absolute;
  top: 0;
  width: 1095px;
  width: 1205px;
  min-height: 899px !important;
  height: 899px !important;
  background: url('/images/mountain-bg.webp') no-repeat center top transparent;
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
  height: 300px;
  overflow-y: scroll;
  font-family: 'BalsamiqSans-Regular' !important;
  background-color: rgba(50, 50, 50, 0.7);
  border-radius: 15px;
  padding: 0px;
  box-shadow: inset 0 0 2px #000;
}

.error-styling {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  margin-top: 4px;
  color: rgb(226, 76, 76);
  font-weight: bold;
  text-align: center;
}
</style>
