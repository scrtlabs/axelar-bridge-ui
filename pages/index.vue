<template>
  <div>
    <div
      v-if="true || !isMobile"
      class="main"
      style="position: relative; flex-direction: column; display: flex; justify-content: flex-start; align-items: center; width: 100vw; height: 100vh"
    >
      <!-- <lottie-wrapper style="position: absolute; top: 10px; left: 600px; z-index: 2;"  :height="150" :path="require('../assets/animations/satellite.json')" /> -->
      <lottie-wrapper
        style="position: absolute; top: 410px; left: 90px; z-index: 2"
        :speed="0.5"
        :height="200"
        :path="require('../assets/animations/flame.json')"
      />

      <!-- <lottie-wrapper style="position: absolute; top: 1px ;z-index: 2;" path="https://assets5.lottiefiles.com/datafiles/zc3XRzudyWE36ZBJr7PIkkqq0PFIrIBgp4ojqShI/newAnimation.json" /> -->

      <!-- <div style="position: absolute; top: 1px ;z-index: 2;width: 100px; height: 100px; background-color: red"></div> -->

      <div class="mountain"></div>

      <div class="main-section-wrapper">
        <div class="wallet-item-container">
          <div :style="styleObject" class="wallet-item" @click="connect()">
            Keplr
            <img :src="require('~/assets/wallets/kepler.logo.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 5px" />
            <div :class="isKeplrConnected ? 'green-dot' : 'red-dot'"></div>
          </div>

          <div :style="styleObject" class="wallet-item" @click="connectMM(true)">
            MetaMask
            <img :src="require('~/assets/wallets/metamask.logo.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 5px" />
            <div :class="isMMConnected ? 'green-dot' : 'red-dot'"></div>
          </div>
        </div>

        <div style="position: absolute; top: -30px; right: -150px; z-index: 1">
          <lottie-wrapper
            v-if="showArrow"
            style="filter: invert(48%); transform: scaleX(-1); z-index: 2"
            :speed="1"
            :height="200"
            :loop="false"
            :path="require('../assets/animations/arrow.json')"
          />
          <transition name="fade">
            <img
              v-show="showArrowText"
              style="position: absolute; filter: invert(48%); top: 135px; left: 75px; width: 150px"
              :src="require('~/assets/animations/connect-wallets.png')"
            />
          </transition>
        </div>

        <template v-if="selectedToken">
          <div class="input-coin" id="input-coin">
            <img :src="require('~/assets/tokens/3d/input/' + selectedToken.fromImage)" style="width: 100px" />
          </div>

          <div class="output-coin" id="output-coin">
            <img :src="require('~/assets/tokens/3d/output/' + selectedToken.toImage)" style="width: 90px" />
          </div>
        </template>

        <div class="right-cave" />
        <div class="left-cave" />

        <div class="input-sign" v-if="fromSubChain != undefined">
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
              <textPath class="input-name" xlink:href="#SVGID_x5F_1_x5F_" startOffset="5.0884%">{{ shortNetworkName(fromSubChain.name) }}</textPath>
            </text>
          </svg>

          <!-- <div class="input-name"> {{ fromSubChain.name }}</div> -->
        </div>
        <div class="output-sign" v-if="toSubChain != undefined">
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
              <textPath class="output-name" startOffset="27.4042%" href="#SVGID_x5F_1_x5F_2">{{ shortNetworkName(toSubChain.name) }}</textPath>
            </text>
          </svg>
        </div>

        <div class="main-section">
          <div v-if="disableUI" class="main-section-disable"></div>

          <!-- From & To Start -->
          <div style="background-color: transparent; display: flex; justify-content: space-between; width: 100%; gap: 10px">
            <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
              <sub-chain-selector :disabled="transferInProgress" lable="From" v-model="fromSubChain" :chain="fromChain" :icon-size="itemIconSize"></sub-chain-selector>
            </div>

            <div style="display: flex; flex-grow: 1; justify-content: center; align-items: center">
              <v-btn @click="swapChains(true)" :disabled="disableUI" icon width="70" height="70">
                <img :src="require('~/assets/images/swap-button.png')" width="60" height="60" />
              </v-btn>
            </div>

            <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
              <sub-chain-selector :disabled="transferInProgress" lable="To" v-model="toSubChain" :chain="toChain" :icon-size="itemIconSize"></sub-chain-selector>
            </div>
          </div>
          <!-- From & To End -->

          <div v-if="fromSubChain != null" class="assets-to-transfer" style="font-family: 'BalsamiqSans-Regular' !important">
            <div style="display: flex; justify-content: space-between">
              <div>Asset to transfer:</div>
              <div>
                <v-btn :disabled="transferInProgress" dense x-small @click="amount = getNormalizedCurrentBalance">MAX</v-btn>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 10px">
              <token-selector :disabled="transferInProgress" :tokens="fromSubChain.tokens" :icon-size="itemIconSize" v-model="selectedToken" style="max-width: 200px"></token-selector>
              <v-text-field
                :disabled="transferInProgress"
                class="right-input number-input"
                type="number"
                style="max-width: 150px"
                color="orange"
                background-color="transparent"
                label="Amount"
                solo
                flat
                v-model="amount"
                dense
                :suffix="selectedToken == null ? 'unknown' : selectedToken.symbol"
              ></v-text-field>
            </div>
            <div v-if="true" style="text-align: right; margin-top: -20px; margin-right: 10px">Balance: {{ showCurrentBalance }}</div>
            <div>
              <div style="margin-bottom: 5px">From address: {{ fromAccountName }}</div>
              <div>
                <v-text-field disabled class="address-input pa-0 ma-0" color="orange" flat dense label="" :value="sourceAddress"></v-text-field>
              </div>
              <div style="margin-bottom: 5px">To address:</div>
              <div>
                <v-text-field
                  :disabled="transferInProgress"
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

          <!-- <div class="transfer-info">
            <div v-if="fromSubChain">Waiting for TX from {{ fromSubChain.name }}...</div>
        </div> -->

          <div class="transfer-info">
            <div v-if="estimatedFee" style="font-size: 14px">Transfer fee: {{ estimatedFee }}</div>
            <div style="font-size: 14px;" v-html="axelarStatus"></div>
            <div v-if="tx == ''"></div>
            <div v-else>
              {{ tx }}
              <br />
              {{ ibcTx }}
            </div>
          </div>

          <div style="margin: 20px; width: 100%; display: flex; flex-direction: column; align-items: center">
            <v-btn class="styled-button" style="font-family: Banana; font-size: 16px; z-index: 999" @click="send" :disabled="transferInProgress || disableUI">{{ transferInProgress ? "Processing..." : "Transfer" }}</v-btn>
            <div
              v-if="info_error != ''"
              style="font-size: 14px; margin-top: 4px; color: red; font-weight: bold; text-align: center; display: flex; justify-content: center; align-items: center; gap: 5px"
            >
              <v-icon size="16" color="error">mdi-alert</v-icon> {{ info_error }}
            </div>
            <!-- <v-btn class="styled-button" style="font-family: Banana; font-size: 16px; z-index:999" @click="animate" :disabled="false && disableUI">Transfer Simulation</v-btn> -->
            <!-- <v-btn @click="Burn()" style="z-index:999">Burn</v-btn> -->
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
      </div>
      <fire-fly></fire-fly>
    </div>
  </div>
</template>

<script>
import axelarConfig from '../store/axelarConfig.json'
import { mapGetters } from 'vuex';
import SubChainSelector from '~/components/SubChainSelector.vue';
import TokenSelector from '~/components/TokenSelector.vue';
// import LottieWrapper from '~/components/LottieWrapper.vue';

import _ from 'lodash';
import { MsgExecuteContract, MsgTransfer, toBase64, toUtf8, toHex } from 'secretjs';
import LottieAnimation from 'lottie-vuejs/src/LottieAnimation.vue'; // import lottie-vuejs
import { AxelarAssetTransfer, AxelarQueryAPI, AxelarGMPRecoveryAPI, CHAINS } from '@axelar-network/axelarjs-sdk';
const Web3 = require('web3');

console.log(CHAINS.TESTNET.BINANCE);

export default {
  components: { SubChainSelector, TokenSelector },
  mounted() {
    let self = this;
    this.$nextTick(() => {
      this.$nuxt.$on('secretjs-loaded', async () => {
        this.destinationAddress = this.receiverAccount.address;
        this.getBalance();

        if (this.isMobile) {
          this.selectedToken = this.fromSubChain.tokens[0];
        }
      });

      this.$nuxt.$on('keystorechange', async () => {});

      this.audio['wrap'] = new Audio(require('~/assets/audio/wrap.mp3'));
      this.audio['unwrap'] = new Audio(require('~/assets/audio/unwrap.mp3'));

      this.fromSubChain = this.fromChain.subChains[0];
      this.toSubChain = this.toChain.subChains[0];

      this.axelarTransfer = new AxelarAssetTransfer({ environment: 'testnet' });
      this.axelarQuery = new AxelarQueryAPI({ environment: 'testnet' });

      this.$nuxt.$on('MM-TX', async (hash) => {
        self.axelarStatus = "Transaction was submitted, please wait..."
      });

      this.$nuxt.$on('MM-confirmation', async (confirmationNumber, receipt) => {
      });

      this.$nuxt.$on('MM-receipt', async (receipt) => {
        self.$store.dispatch('checkTxConfirmation', receipt);
        self.axelarStatus = `Waiting for confirmations 0 / 96... `;
      });

      this.$nuxt.$on('MM-error', async (error, receipt) => {
        console.log("=== MM-error ===")
        console.log(error)
        console.log(receipt)
        self.transferInProgress = false;
        self.showProcessAnimation = false;
        self.axelarStatus = "";
        console.log("=== MM-error ===")
      });

      this.$nuxt.$on('MM-confirmation-update', async (confirmations) => {
        self.axelarStatus = `Waiting for confirmations ${confirmations} / 96... `;
      });

      this.$nuxt.$on('MM-transfer-complete', async (tx) => {
        self.animateProcessing();  
        self.getBalance();
        self.transferInProgress = false;
        self.showProcessAnimation = false;
        self.axelarStatus = `<div style="color: lightgreen">Transfer complete!<br><a style="color: lightgreen" target="_" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["transaction-viewer"]}/${tx}">Watch the transaction here</a></div>`;
      });

      

      this.$nuxt.$on('MM-connected', async () => {
        this.$store.dispatch('getMMAccounts');
      });

      this.$nuxt.$on('MM-account-changed', async (accounts) => {
        this.$store.commit('updateMMAccounts', accounts);
      });

      this.$nuxt.$on('MM-network-changed', async (networkId) => {
        this.$store.dispatch('getMMAccounts');
      });

      var connectedBefore = window.localStorage.getItem('connectedBefore');
      if (connectedBefore) {
        this.connect();
        this.connectMM(true);
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
      allSubChains: 'getSubChains',
      bankBalances: 'getBankBalances',
      MMAccounts: 'getMMAccounts',
      MMBalance: 'getMMBalance',
      MMTx: 'getMMTx',
      isMobile: 'isMobile'
    }),
    navnav() {
      return window.fina;
    },
    walletOption() {
      return true; //this.$route.query.uioption == "1";
    },
    styleObject() {
      return {
        '--color': 'red',
        '--color-hover': 'blue',
        '--width': '55px',
        '--width-hover': '150px'
      };
    },

    disableUI() {
      return !this.isKeplrConnected || !this.isMMConnected;
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
    getChainList() {
      return this.availableChains.map((c) => c.name);
    },
    fromChain() {
      return this.availableChains[this.fromChainIdx];
    },
    toChain() {
      return this.availableChains[this.toChainIdx];
    },
    getFromSubChainList() {
      this.fromChain.subChains.map((c) => c.name);
    },
    getToSubChainList() {
      this.to.subChains.map((c) => c.name);
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
        let chain = this.availableChains[this.fromChainIdx].chainId;
        return this.accounts[chain];
      }
      return null;
    },
    receiverAccount() {
      if (this.accounts) {
        let chain = this.availableChains[this.toChainIdx].chainId;
        return this.accounts[chain];
      }
      return null;
    },
    getNormalizedCurrentBalance() {
      try {
        if (this.selectedToken) {
          if (this.selectedToken.ERC20_address && this.selectedToken.ERC20_address != '') { // Balance from MetaMask
            return (parseInt(this.MMBalance.amount) / Math.pow(10, this.MMBalance.decimals).toFixed(4));
          }  else if (this.selectedToken.SNIP20_address != '' && this.tokenBalance) { // Balance in SNIP-20 contract
            if (this.tokenBalance.balance) {
              return (parseFloat(this.tokenBalance.balance.amount) / Math.pow(10, this.selectedToken.coinDecimals)).toFixed(4);
            }
          } else if (this.bankBalances.has(this.selectedToken.denom)) { // Balance in Bank
            return (parseFloat(this.bankBalances.get(this.selectedToken.denom)) / Math.pow(10, this.selectedToken.coinDecimals)).toFixed(4);
          } 
        }
      } catch (err) {
        console.log(err);
      }
      return 0;
    },
    showCurrentBalance() {
      if (this.selectedToken) {
        return this.getNormalizedCurrentBalance + ' ' + this.selectedToken.symbol;
      }
      return '';
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
    }
  },
  data() {
    return {
      itemIconSize: 24,

      fromChainIdx: 1,
      toChainIdx: 0,

      fromSubChain: null,
      toSubChain: null,

      selectedToken: null,
      amount: 0,

      destinationAddress: '',
      fromAccountName: '',

      ack: 1,
      tx: '', //undefined,
      ibcTx: '', //undefined,
      tx_error: '',
      info_error: '',

      showArrow: false,
      showArrowText: false,
      showWrapAnimation: false,
      showProcessAnimation: false,
      audio: {},

      axelarTransfer: null,
      axelarQuery: null,
      estimatedFee: "",
      axelarStatus: "",

      transferInProgress: false

    };
  },
  watch: {
    async selectedToken(token) {
      this.getBalance();
      if (!this.shouldUseMMAddress) {
        if (this.isKeplrConnected) this.fromAccountName = '(' + (await window.keplr.getKey('pulsar-2')).name + ')';
        //this.estimatedFee = "";
      } else {
        this.fromAccountName = '';
      }
      let result = await this.calcTransferFee(this.amount);
      if (result) {
        this.estimatedFee = result.display;
      }

    },

    MMAccounts(newAccounts, oldAccounts) {
      this.getBalance();
    },

    async amount(val) {
      // if (this.shouldUseMMAddress) {
      //   let result = await this.calcTransferFee(this.amount);
      //   if (result) {
      //     this.estimatedFee = result.amount + " " + result.denom;
      //   }
      // }
    },
    fromSubChain(newChain, oldChain) {
      if (oldChain && newChain.hasOwnProperty("chainId")) {
        this.connectMM(false);
      }
    },

    toSubChain(newChain, oldChain) {
      console.log(newChain);
      if (this.isMMConnected) {
        if (newChain.hasOwnProperty("chainId")) { // EVM
          this.destinationAddress = this.MMAccounts[0];
        } else {
          this.destinationAddress = this.receiverAccount.address;
        }
      }
    }
  },
  methods: {
    /******* TESTING AREA  *******/

    async Burn() {
      if (this.selectedToken.SNIP20_address) {
        const msgBurn = new MsgExecuteContract({
          sender: this.sourceAddress,
          contract_address: this.selectedToken.SNIP20_address,
          code_hash: this.selectedToken.SNIP20_code_hash, // optional but way faster
          msg: {
            burn_from: {
              owner: this.sourceAddress,
              amount: this.tokenBalance.balance.amount
            }
          },
          sent_funds: []
        });

        // const msgBurn = new MsgExecuteContract({
        //     sender: this.sourceAddress,
        //     contract_address: this.selectedToken.SNIP20_address,
        //     code_hash: this.selectedToken.SNIP20_code_hash, // optional but way faster
        //     msg: { increase_allowance : {
        //       spender: this.sourceAddress,
        //       amount: this.tokenBalance.balance.amount
        //     } },
        //     sent_funds: [],
        //   });

        console.log('== Burn msg ==');
        console.log(msgBurn);
        console.log('== Burn msg ==');

        const tx = await this.senderAccount.tx.broadcast([msgBurn], {
          gasLimit: 60_000,
          gasPriceInFeeDenom: 0.1,
          feeDenom: 'uscrt'
        });

        console.log(tx);
      }
    },

    /******* TESTING AREA  *******/

    /******* AXELAR *******/

    async calcTransferFee(amount) {
        let microAmount = this.getMicroAmount(amount);
        const result = await this.axelarQuery.getTransferFee(this.fromSubChain.axelar.chain, this.toSubChain.axelar.chain, this.selectedToken.denom, microAmount);
        var display = result.fee.amount + " " + result.fee.denom;
        let normal = 0;
        if (axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["fee-decimals"].hasOwnProperty(result.fee.denom)) {
          let tokenInfo = axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["fee-decimals"][result.fee.denom];
          normal = parseFloat(result.fee.amount) / Math.pow(10, tokenInfo.decimal);
          display = normal.toFixed(4) + " " + tokenInfo.symbol;
        }
        result.fee["display"] = display;
        result.fee["normalAmount"] = normal;
        result.fee.amount = parseInt(result.fee.amount);

        return result.fee;
    },

    async sendAxelar(amount) {
      this.axelarStatus = "Please wait...";
      this.info_error = "";
      let microAmount = await this.getMicroAmount(amount);
      let fee = await this.calcTransferFee(amount);
      if (fee) {
          this.estimatedFee = fee.display;
      }

      let balanceToCheck = this.selectedToken.isEVMNative ? this.bankBalances.get(this.selectedToken.denom) :  this.MMBalance.amount;

      if (BigInt(balanceToCheck) < BigInt(microAmount)) {
        this.info_error = "Insufficient balance";
        this.axelarStatus = "";
        return;
      } 

      if (parseFloat(amount) < fee["normalAmount"]) {
        this.info_error = `Minimun transfer should cover the fees (${fee.amount} ${fee.denom})`;
        this.axelarStatus = "";
        return;
      }

      try {
        this.transferInProgress = true;
        this.showProcessAnimation = true;

        this.axelarStatus = "Initializing transfer...";
        const depositAddress = await this.axelarTransfer.getDepositAddress({
          fromChain: this.fromSubChain.axelar.chain,
          toChain: this.toSubChain.axelar.chain,
          destinationAddress: this.destinationAddress,
          asset: this.selectedToken.denom
        });
        this.axelarStatus = "Waiting for user approval...";

        console.log(" ==== Axelar Transfer ====");
        console.log("From Chain: ", this.fromSubChain.axelar.chain);
        console.log("To Chain: ", this.toSubChain.axelar.chain);
        console.log("Amount: ", microAmount + " " + this.selectedToken.denom);
        console.log("Contract Address: ", this.selectedToken.ERC20_address);
        console.log("Deposit Address: ", depositAddress);
        console.log("From Address: ", this.sourceAddress);
        console.log(" ==== Axelar Transfer ====");
          
        this.animateInput();
        if (this.selectedToken.ERC20_address && this.selectedToken.ERC20_address != '') { 
          this.$store.dispatch('sendMMTokens', { contract: this.selectedToken.ERC20_address, walletAddress: depositAddress, from: this.sourceAddress, amount: microAmount });
        } else if (this.selectedToken.isEVMNative) {
          this.$store.dispatch('sendCoins', { walletAddress: depositAddress, from: this.sourceAddress, amount: microAmount });
        }
      } catch (err) {
        console.log("Axelar Error: ", err);
        this.transferInProgress = false;
        this.showProcessAnimation = false;
      }
    },

            
    /******* AXELAR *******/


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
      //this.audio = new Audio(require('~/assets/audio/' + audioFile));
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

    connect(disconnect) {
      if (disconnect) {
        this.$store.dispatch('disconnectKeplr');
      } else {
        this.showArrow = this.showArrowText = false;
        this.$store.dispatch('initKeplr', this.availableChains);
      }
    },
    connectMM(addEvent) {
      
      let chainId = -1;
      if (this.fromSubChain.hasOwnProperty("chainId")) {
        chainId = this.fromSubChain.chainId;
      }
      this.$store.dispatch('connectMetaMask', { chainId, addEvent});
    },
    getChainName(idx) {
      return this.getChainList[idx];
    },

    async getBalance() {
      if (this.senderAccount) {
        try {
          if (this.selectedToken.SNIP20_address) {
            let contract = { address: this.selectedToken.SNIP20_address, codeHash: this.selectedToken.SNIP20_code_hash };
            this.$store.dispatch('getTokenBalance', {
              account: this.senderAccount,
              contract,
              chainId: this.fromChain.chainId,
              walletAddress: this.sourceAddress
            });
          } else if (this.selectedToken.ERC20_address) {
            this.$store.dispatch('getMMBalance', { contract: this.selectedToken.ERC20_address, walletAddress: this.MMAccounts[0] });
          }
        } catch (err) {
          //console.log("ERR1: ", err);
        }

        try {
          if (this.selectedToken.isEVMNative) {
            this.$store.dispatch('getMMBankBalance', { walletAddress: this.MMAccounts[0], denom: this.selectedToken.denom });

          } else if (!this.selectedToken.ERC20_address) {
            this.$store.dispatch('getBankBalance', { account: this.senderAccount, walletAddress: this.sourceAddress });
          }
        } catch (err) {
          //console.log("ERR2: ", err);
        }
      }
    },

    getMicroAmount(amount) {
      if (this.selectedToken.coinDecimals > 16) {
        return Web3.utils.toWei(amount + "");
      } 
      return Math.round(parseFloat(amount) * Math.pow(10, this.selectedToken.coinDecimals));
    },

    send() {
      this.tx_error = '';
      this.info_error = '';
      let microAmount = this.getMicroAmount(this.amount);
      if (microAmount == 0) {
        this.info_error = 'Amount must be grater the 0';
        return;
      }

      if (this.fromChain.out_port === 'transfer') { // To secret    
        if (this.fromSubChain.name.toLowerCase() == "axelar") {
            this.sendTransfer(microAmount); 
        } else {
          this.sendAxelar(this.amount);
        }
        
      } else {
        this.sendWasm(microAmount); // from secret
      }
    },

    async sendTransfer(amount) {
      try {
        let fee = await this.calcTransferFee(amount);
        if (fee) {
            this.estimatedFee = fee.display;
        }

        if (BigInt(this.bankBalances.get(this.selectedToken.denom)) < BigInt(amount)) {
          this.info_error = "Insufficient balance";
          this.axelarStatus = "";
          return;
        }           

        if (amount <= fee.amount) {
          this.info_error = `Minimun transfer should cover the fees (${fee.amount} ${fee.denom})`;
          this.axelarStatus = "";
          return;
        }

        amount = amount + ""; // convert to string
        const msgTransfer = new MsgTransfer({
          source_port: this.fromChain.out_port,
          source_channel: this.fromChain.out_channel,
          token: {
            amount,
            denom: this.selectedToken.denom
          },
          timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60), // 10 minutes
          sender: this.sourceAddress,
          receiver: this.destinationAddress
        });

        console.log(msgTransfer);
        console.log(this.fromChain.stakeCurrency.coinMinimalDenom);
        
        this.transferInProgress = true;
        this.showProcessAnimation = true;
        this.axelarStatus = "Waiting for user approval...";

        let signedTX = await this.senderAccount.tx.signTx([msgTransfer], {
          gasLimit: 500_000,
          gasPriceInFeeDenom: 0.1,
          feeDenom: this.fromChain.stakeCurrency.coinMinimalDenom
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
        this.axelarStatus = `<div style="color: orange">Received TX, waiting for ibc acknowledgment...<br><a style="color: orange" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["secret-block-explorer"]}/${tx.transactionHash}" target="_">Watch the transaction here</a></div>`;

        //this.tx = 'TX in source chain: ' + tx.transactionHash;
        this.ack = 0;
        //this.ibcTx = 'Waiting for IBC ACK...';
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
              console.log("ERROR!!!!!")
              console.log(txError);
              console.log("ERROR!!!!!")
              this.tx_error = txError.value;
            }
          } catch (err) {
            console.log("ERROR!!!!! 222")
            console.log(err)
            console.log("ERROR!!!!! 222")
          }
        }
        this.getBalance();
        if (this.tx_error == '') {
          this.axelarStatus = `<div style="color: lightgreen">Transfer complete! Your coins will be received in a few seconds.<br><a  style="color: lightgreen" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["secret-block-explorer"]}/${ibcResponses[0].tx.transactionHash}" target="_">Watch the ibc acknowledgment here</a></div>`;
          this.animateProcessing();
        } else {
          this.axelarStatus = `<div style="color: orange">Error:<br>${this.tx_error}</div>`;
        }
      } catch (err) {
        console.log(err);
        this.transferInProgress = false;
        this.showProcessAnimation = false;
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
      if (fee) {
          this.estimatedFee = fee.display;
      }

      if (this.selectedToken.SNIP20_address && this.selectedToken.SNIP20_address != '') { 
        console.log(`${this.tokenBalance.balance.amount} < ${amount}`);
        if (this.tokenBalance.balance.amount < amount) {
          this.info_error = "Insufficient balance";
          this.axelarStatus = "";
          return;
        }
      }

      if (amount < fee.amount) {
        this.info_error = `Minimun transfer should cover the fees (${fee.amount} ${fee.denom})`;
        this.axelarStatus = "";
        return;
      }

      amount = amount + "";

      this.transferInProgress = true;
      this.showProcessAnimation = true;

      this.axelarStatus = "Initializing transfer...";
      const depositAddress = await this.axelarTransfer.getDepositAddress({
        fromChain: this.fromSubChain.axelar.chain,
        toChain: this.toSubChain.axelar.chain,
        destinationAddress: this.destinationAddress,
        asset: this.selectedToken.denom
      });
      this.axelarStatus = "Waiting for user approval...";

      if (this.senderAccount) {
        let msgToSend = {
          sender: this.sourceAddress,
          contract_address: this.selectedToken.SNIP20_address,
          code_hash: this.selectedToken.SNIP20_code_hash,
          msg: {
            send: {
              recipient: this.fromChain.out_port.replace('wasm.', ''),
              recipient_code_hash: this.fromChain.ICS_code_hash,
              amount,
              msg: toBase64(
                toUtf8(
                  JSON.stringify({
                    channel: this.fromChain.out_channel,
                    remote_address: depositAddress,
                    timeout: 10 * 60 // 10 minutes
                  })
                )
              )
            }
          }
        };
        console.log(msgToSend);
        let signedTX = await this.senderAccount.tx.signTx([new MsgExecuteContract(msgToSend)], {
          gasLimit: 300_000,
          gasPriceInFeeDenom: 0.1,
          feeDenom: 'uscrt'
        });

        this.axelarStatus = "Transaction was submitted, please wait..."
        this.animateInput();

        try {
          this.tx = '';
          let tx = await this.senderAccount.tx.broadcastSignedTx(signedTX, {
            ibcTxsOptions: {
              resolveResponses: true, // enable IBC responses resolution (defualt)
              resolveResponsesTimeoutMs: 720_000, // stop checking after 12 minutes (default is 2 minutes)
              resolveResponsesCheckIntervalMs: 15_000 // check every 15 seconds (default)
            }
          });

          // let tx = await this.senderAccount.tx.broadcast([new MsgExecuteContract(msgToSend)], {
          //   gasLimit: 300_000,
          //   gasPriceInFeeDenom: 0.1,
          //   feeDenom: 'uscrt',
          //   ibcTxsOptions: {
          //     resolveResponses: true, // enable IBC responses resolution (defualt)
          //     resolveResponsesTimeoutMs: 720_000,//12 * 60 * 1000, // stop checking after 12 minutes (default is 2 minutes)
          //     resolveResponsesCheckIntervalMs: 15_000 // check every 15 seconds (default)
          //   }
          // });
          console.log(tx);
          this.axelarStatus = `<div style="color: orange">Received TX, waiting for ibc acknowledgment...<br><a style="color: orange" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["secret-block-explorer"]}/${tx.transactionHash}" target="_">Watch the transaction here</a></div>`;
          //this.tx = 'TX in source chain: ' + tx.transactionHash;
          this.ack = 0;
          //this.ibcTx = 'Waiting for IBC ACK...';
          const ibcResponses = await Promise.all(tx.ibcResponses);
          this.ack = 1;
          if (ibcResponses.length > 0) {
            this.axelarStatus = `<div style="color: lightgreen">Transfer complete! Your coins will be received in a few seconds.<br><a  style="color: lightgreen" href="${axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["secret-block-explorer"]}/${ibcResponses[0].tx.transactionHash}" target="_">Watch the ibc acknowledgment here</a></div>`;

            //this.ibcTx = 'IBC ACK: ' + ibcResponses[0].tx.transactionHash;
          }
          this.animateProcessing();
          console.log(ibcResponses);
        } catch (err) {
          this.tx = undefined;
          this.ack = -1;
          this.ibcTx = '';
          console.error(err);
          this.transferInProgress = false;
          this.showProcessAnimation = false;
        }
        this.getBalance();
      }
    },

    swapChains(swapTokens) {
      if (this.receiverAccount && this.senderAccount) {
        this.fromChainIdx = !this.fromChainIdx + 0;
        this.toChainIdx = !this.toChainIdx + 0;

        let tmp = _.cloneDeep(this.fromSubChain);
        this.fromSubChain = _.cloneDeep(this.toSubChain);
        this.toSubChain = tmp;
        this.destinationAddress = this.receiverAccount.address;
        if (swapTokens && this.fromSubChain.tokens.length > 0) {
          this.amount = 0;
          this.selectedToken = this.fromSubChain.tokens[0];
          this.getBalance();
        }
      }
    }
  } // methods
};
</script>

<style scoped>
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
  left: 848px;
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

  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(7px);

  display: flex;
  justify-content: flex-end;
  align-items: center;

  overflow: hidden;
}

.wallet-item:hover {
  width: var(--width-hover);
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
  background: url('~/assets/images/right-cave.png') no-repeat center center;
  width: 176px;
  height: 319px;
}

.left-cave {
  position: absolute;
  z-index: 5;
  bottom: 180px;
  left: 143px;
  background: url('~/assets/images/left-cave.png') no-repeat center center;
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
  top: 0px;
  /* width: 1095px; */
  width: 1205px;
  min-height: 899px !important;
  height: 899px !important;
  background: url('~/assets/images/mountain-bg.png') no-repeat center top transparent;
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
</style>
