import axelarConfig from '../store/axelarConfig.json'
import { mapGetters } from 'vuex';
import SubChainSelector from '~/components/SubChainSelector.vue';
import TokenSelector from '~/components/TokenSelector.vue';
// import LottieWrapper from '~/components/LottieWrapper.vue';

import _ from 'lodash';
import { MsgExecuteContract, MsgTransfer, toBase64, toUtf8, toHex } from 'secretjs';
// import LottieAnimation from 'lottie-vuejs/src/LottieAnimation.vue'; // import lottie-vuejs
import { AxelarAssetTransfer, AxelarQueryAPI, AxelarGMPRecoveryAPI, CHAINS } from '@axelar-network/axelarjs-sdk';
import commonMixin from './commonMixin';
//const Web3 = require('web3');
import { checkIfTokenInKeplr } from '../store/token.js'

var mixin = {
  mixins: [commonMixin],
  // components: { SubChainSelector, TokenSelector },
  created() {
    this.axelarTransfer = new AxelarAssetTransfer({ environment: process.env.NUXT_ENV_AXELAR_ENV });
    this.axelarQuery = new AxelarQueryAPI({ environment: process.env.NUXT_ENV_AXELAR_ENV });

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
      if (connectedBefore || this.isMobile) {
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
    allChains() {
      return [...this.availableChains["sub-chains"], ...this.availableChains["main-chain"]];
    },
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

    styleSurgeObject() {
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
          if (this.toChain.tokens[i].denom.indexOf(this.selectedToken.denom) !== -1 ) {
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

      connectionRequestQueue: new Map(),

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

      selfCheckApproved: false,

      tokenInKeplr: -1


    };
  },
  watch: {
    async selectedToken(token) {
      this.getBalance();
      if (!this.shouldUseMMAddress) {
        if (!this.isMobile && this.isKeplrConnected) this.fromAccountName = '(' + (await window.keplr.getKey(this.fromChain.chainInfo.chainId)).name + ')';
      } else {
        this.fromAccountName = '';
      }
      let result = await this.calcTransferFee(this.amount == "" ? "0": this.amount);
      if (result) {
        this.estimatedFee = result.display;
      }

      let limit = await this.getMaxTransfer();
      this.maxTransfer = limit.display;

      if (token && token.SNIP20_address !== "") {
        this.tokenInKeplr = await checkIfTokenInKeplr(this.fromChain.chainInfo.chainId, token.SNIP20_address);
      } else {
        this.tokenInKeplr = -1;
      }

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
        this.connect(false, newChain.chainInfo, true);
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
              this.connect(false, newChain.chainInfo, true);
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

    }, 
  },
  methods: {

    /******* AXELAR *******/

    async calcTransferFee(amount) {
      try {
        let microAmount = this.getMicroAmount(this.selectedToken, amount);
        const result = await this.axelarQuery.getTransferFee(this.fromChain.axelar.chain, this.toChain.axelar.chain, this.selectedToken.denom, microAmount);
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
        const limit = await this.axelarQuery.getTransferLimit({
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
      let microAmount = await this.getMicroAmount(this.selectedToken, amount);
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
        const depositAddress = await this.axelarTransfer.getDepositAddress({
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

    async addAssetToKeplr() {
      if (this.tokenInKeplr === false) {
        await window.keplr.suggestToken(this.fromChain.chainInfo.chainId, this.selectedToken.SNIP20_address);
        try {
          this.tokenInKeplr = await checkIfTokenInKeplr(this.fromChain.chainInfo.chainId, this.selectedToken.SNIP20_address);
        } catch (err) {
          console.log(err);
          this.tokenInKeplr = -1;
        }
      }
    },


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

    connect(disconnect, chain, requireConnectedBefore) {
      if (this.isMobile && this.isMetaMask) {
        this.$dispatchQueue.addToQueue('connectSecretWithMetaMask', this.availableChains["main-chain"][0].chainInfo);
      } else {
        if (requireConnectedBefore) {
          var connectedBefore = window.localStorage.getItem('connectedBefore');
          if (!connectedBefore) {
            this.connectionRequestQueue.set(chain.chainId, chain);
            return;
          }
        }
  
  
        if (disconnect) {
          this.$store.dispatch('disconnectKeplr');
        } else {
          this.showArrow = false; //this.showArrowText
          if (typeof chain === 'undefined') { // Clicked on connect wallet
            var self = this;
            if (this.connectionRequestQueue.size > 0) {
              this.connectionRequestQueue.forEach( (value, key) => {
                self.$dispatchQueue.addToQueue('initKeplr', value);
              });
              this.connectionRequestQueue.clear();
            } else {
              this.$dispatchQueue.addToQueue('initKeplr', this.availableChains["main-chain"][0].chainInfo);
            }
          } else {
            this.$dispatchQueue.addToQueue('initKeplr', chain);
          }
  
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
        if (self.drawer !== undefined) {
          self.drawer = false;
        }
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

    goToWeb(url) {
      window.open(url, '_blank');
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

    // getMicroAmount(amount) {
    //   if (this.selectedToken.coinDecimals > 16) {
    //     return this.toWei(amount + "");
    //   }
    //   return Math.round(parseFloat(amount) * Math.pow(10, this.selectedToken.coinDecimals));
    // },

    async send() {
      if (this.amount == "" || this.amount == null || Number.isNaN(this.amount)) {
        this.info_error = 'Amount must be a valid number';
        return;
      }

      this.tx_error = '';
      this.info_error = '';
      this.showAxelarTxIndication = "";
      let microAmount = this.getMicroAmount(this.selectedToken, this.amount);
      if (microAmount == 0) {
        this.info_error = 'Amount must be grater than 0';
        return;
      }


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

        if (this.bankBalances.get(this.selectedTokenTransferDenom) === undefined) {
          this.info_error = "Insufficient balance";
          this.axelarStatus = "";
          return;
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
          depositAddress = await this.axelarTransfer.getDepositAddress({
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
      const depositAddress = await this.axelarTransfer.getDepositAddress({
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
}

export default mixin;
