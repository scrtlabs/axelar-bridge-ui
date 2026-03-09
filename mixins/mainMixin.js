import axelarConfig from '../store/axelarConfig.json';
import { mapGetters } from 'vuex';
import { getTokenBalance, getPermit } from '../store/token';

import _ from 'lodash';
import { MsgExecuteContract, MsgTransfer, toBase64, toUtf8, toHex } from 'secretjs';
// import LottieAnimation froM 'lottie-vuejs/src/LottieAnimation.vue'; // import lottie-vuejs
import { AxelarAssetTransfer, AxelarQueryAPI, AxelarGMPRecoveryAPI, CHAINS } from '@axelar-network/axelarjs-sdk';
import commonMixin from './commonMixin';
//const Web3 = require('web3');
import { checkIfTokenInKeplr } from '../store/token.js';
import tokenListForMigration from '../store/migration.json';
const Web3 = require('web3');

var mixin = {
  mixins: [commonMixin],
  // components: { SubChainSelector, TokenSelector },
  created() {
    this.axelarTransfer = new AxelarAssetTransfer({ environment: process.env.NUXT_ENV_AXELAR_ENV });
    this.axelarQuery = new AxelarQueryAPI({ environment: process.env.NUXT_ENV_AXELAR_ENV });

    // Set default chains to Secret Network and Axelar only
    const secretNetwork = this.availableChains['main-chain']?.find(chain => chain.name === 'Secret Network');
    const axelar = this.availableChains['sub-chains']?.find(chain => chain.name === 'Axelar');
    
    this.toChain = secretNetwork || this.availableChains['main-chain'][0];
    this.fromChain = axelar || this.availableChains['sub-chains'][0];
  },
  mounted() {
    let self = this;
    this.$nextTick(async () => {
      this.tokenMigrationHelp = this.isMigrationFirstTime;

      this.$nuxt.$on('secretjs-loaded', async () => {
        if (self.toChain.type === 'cosmos') {
          if (self.receiverAccount) {
            self.destinationAddress = self.receiverAccount.address;
          }
        } else if (self.toChain.type === 'evm') {
          self.destinationAddress = self.MMAccounts[0];
        }

        self.getBalance();
      });

      //if (self.isTestnet === false) {
      //let ethTokens = await axios.get("https://api-bridge-mainnet.azurewebsites.net/tokens/?page=0&size=1000");
      //let bscTokens = await axios.get("https://bridge-bsc-mainnet.azurewebsites.net/tokens/?page=0&size=1000");

      self.migrationTokens = tokenListForMigration.tokens;
      //self.migrationTokens = [...ethTokens.data.tokens, ...bscTokens.data.tokens];
      //}

      this.$nuxt.$on('keystorechange', async () => {
        //self.destinationAddress = self.receiverAccount.address;
      });

      this.audio['wrap'] = new Audio(require('~/assets/audio/wrap.mp3'));
      this.audio['unwrap'] = new Audio(require('~/assets/audio/unwrap.mp3'));

      this.$nuxt.$on('MM-TX', async (hash) => {
        self.showAxelarTxIndication = hash;
        const link = ` <a style="color: lightgreen; text-decoration: underline;" target="_" href="https://axelarscan.io/gmp/${hash}">(View on Axelarscan)</a><br><span style="font-size: 11px; color: #bbb;">(If stuck, you can manually add gas on Axelarscan)</span>`;
        self.axelarStatus = `Transaction submitted, waiting for receipt...<br>${link}`;
      });

      this.$nuxt.$on('MM-confirmation', async (confirmationNumber, receipt) => {});

      this.$nuxt.$on('MM-receipt', async (receipt) => {
        self.$store.dispatch('checkTxConfirmation', receipt);
        const link = self.showAxelarTxIndication ? ` <br><a style="color: lightgreen; text-decoration: underline;" target="_" href="https://axelarscan.io/gmp/${self.showAxelarTxIndication}">(View on Axelarscan)</a><br><span style="font-size: 11px; color: #bbb;">(If stuck, you can manually add gas on Axelarscan)</span>` : '';
        self.axelarStatus = `Waiting for confirmations...${link}`;
      });

      this.$nuxt.$on('MM-error', async (error, receipt) => {
        console.log('=== MM-error ===');
        console.log(error);
        console.log(receipt);
        self.transferInProgress = false;
        self.showProcessAnimation = false;
        self.selfCheckApproved = false;
        self.axelarStatus = '';
        self.showAxelarTxIndication = '';
        console.log('=== MM-error ===');
      });

      this.$nuxt.$on('MM-confirmation-update', async (confirmations) => {
        let link = '';
        if (self.showAxelarTxIndication != '') {
          link = ` <br><a style="color: lightgreen; text-decoration: underline;" target="_" href="https://axelarscan.io/gmp/${self.showAxelarTxIndication}">(Detailed status available)</a><br><span style="font-size: 11px; color: #bbb;">(If stuck, you can manually add gas on Axelarscan)</span>`;
        }
        self.axelarStatus = `Waiting for confirmations (${confirmations})... ${link}`;
      });

      this.$nuxt.$on('MM-transfer-complete', async (tx) => {
        self.animateProcessing();
        self.getBalance();
        self.transferInProgress = false;
        self.showProcessAnimation = false;
        self.selfCheckApproved = false;
        self.showAxelarTxIndication = '';
        self.axelarStatus = `<div style="color: lightgreen">Transfer complete! <br><a style="color: lightgreen; text-decoration: underline;" target="_" href="https://axelarscan.io/gmp/${tx}">Watch the transaction here</a><br><span style="font-size: 11px; color: #bbb;">(If stuck, you can manually add gas on Axelarscan)</span></div>`;
      });

      this.$nuxt.$on('MM-transfer-indication', async (tx) => {
        self.showAxelarTxIndication = tx;
      });

      this.$nuxt.$on('MM-connected', async () => {
        // Query chain ID directly since provider properties may be unavailable
        try {
          const hexChainId = await window.ethereum.request({ method: 'eth_chainId' });
          this.activeMMChainId = parseInt(hexChainId, 16);
        } catch (e) {
          this.activeMMChainId = window.ethereum.networkVersion || -1;
        }
        console.log('[MM] activeMMChainId:', this.activeMMChainId, 'fromChain.chainId:', this.fromChain?.chainInfo?.chainId);
        await this.$store.dispatch('getMMAccounts');
        if (this.toChain.type === 'evm') {
          this.destinationAddress = this.MMAccounts[0];
        }
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
    willReceiveTokenName() {
      if (this.selectedToken) {
        if (
          this.selectedToken.symbol.indexOf('.axl') != -1 &&
          !(this.selectedToken.symbol === 'USDT.axl' || this.selectedToken.symbol === 'USDC.axl' || this.selectedToken.symbol === 'wstETH.axl')
        ) {
          return this.selectedToken.symbol.replace('.axl', '');
        } else {
          if (this.selectedToken.symbol === 'ETH' || this.selectedToken.symbol === 'BNB') {
            return 'W' + this.selectedToken.symbol;
          } else {
            if (this.selectedToken.symbol === 'USDT' || this.selectedToken.symbol === 'USDC' || this.selectedToken.symbol === 'wstETH') {
              return this.selectedToken.symbol + '.axl';
            }
          }
          return this.selectedToken.symbol;
        }
      }
      return '';
    },
    isMigrationFirstTime() {
      if (window.localStorage.getItem('migration_dontshow')) {
        return false;
      }
    },

    allChains() {
      return [...this.availableChains['sub-chains'], ...this.availableChains['main-chain']];
    },
    // Filter chains to only show Secret Network and Axelar
    filteredMainChains() {
      if (!this.availableChains['main-chain']) return [];
      return this.availableChains['main-chain'];
    },
    filteredSubChains() {
      if (!this.availableChains['sub-chains']) return [];
      return this.availableChains['sub-chains'];
    },
    // Filtered chains for from/to selectors
    filteredFromChains() {
      if (this.fromChainKey === 'main-chain') {
        return this.filteredMainChains;
      } else {
        return this.filteredSubChains;
      }
    },
    filteredToChains() {
      if (this.toChainKey === 'main-chain') {
        return this.filteredMainChains;
      } else {
        return this.filteredSubChains;
      }
    },
    showArrowComputed() {
      return this.showArrow || !this.isKeplrConnected; // || !this.isMMConnected;
    },
    isTestnet() {
      return process.env.NUXT_ENV_AXELAR_ENV == 'testnet';
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
        display: 'flex',
        'flex-direction': 'column',
        'justify-content': 'flex-start',
        'align-items': 'flex-end',
        '--width': '42px',
        '--width-hover': '150px',
        '--overflow': 'hidden',
        '--overflow-hover': 'none',
        '--height': '40px',
        '--height-hover': '250px'
      };
    },

    styleSurgeObject() {
      return {
        display: 'flex',
        'flex-direction': 'column',
        'justify-content': 'flex-start',
        'align-items': 'flex-end',
        '--width': '42px',
        '--width-hover': '150px',
        '--overflow': 'hidden',
        '--overflow-hover': 'none',
        '--height': '40px',
        '--height-hover': '230px'
      };
    },

    styleTokenMigrationObject() {
      return {
        display: 'flex',
        'flex-direction': 'column',
        'justify-content': 'flex-start',
        'align-items': 'flex-end',
        '--width': '42px',
        '--width-hover': '160px',
        '--overflow': 'hidden',
        '--overflow-hover': 'none',
        '--height': '40px',
        '--height-hover': '100px'
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
      return (
        this.selectedToken && ((this.selectedToken.hasOwnProperty('ERC20_address') && this.selectedToken.ERC20_address != '') || this.selectedToken.isEVMNative)
      );
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
    selectedTokenTransferDenom() {
      // This will show the transferable denom, if it has an IBC denom it will return it
      if (this.selectedToken) {
        if (this.selectedToken.ibcDenom && this.selectedToken.ibcDenom !== '') {
          return this.selectedToken.ibcDenom;
        }
        return this.selectedToken.denom;
      }
      return '';
    },
    getNormalizedCurrentBalance() {
      try {
        if (this.selectedToken) {
          if (this.selectedToken.ERC20_address && this.selectedToken.ERC20_address != '') {
            // Balance from MetaMask
            return parseInt(this.MMBalance.amount) / Math.pow(10, this.MMBalance.decimals).toFixed(6);
          } else if (this.selectedToken.SNIP20_address != '' && this.tokenBalance) {
            // Balance in SNIP-20 contract
            if (this.tokenBalance.balance) {
              return (parseFloat(this.tokenBalance.balance.amount) / Math.pow(10, this.selectedToken.coinDecimals)).toFixed(6);
            }
          } else if (this.bankBalances.has(this.selectedTokenTransferDenom)) {
            // Balance in Bank
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
          return 'unknown';
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
          if (this.toChain.tokens[i].denom.indexOf(this.selectedToken.denom) !== -1) {
            return true;
          }
        }
      }
      return false;
    },

    isMetaMaskChainCorrect() {
      if (this.fromChain && this.fromChain.type === 'evm' && this.isMMConnected) {
        return Number(this.activeMMChainId) === Number(this.fromChain.chainInfo.chainId);
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

      fromChainKey: 'sub-chains',
      toChainKey: 'main-chain',

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
      estimatedFee: '',
      maxTransfer: '',
      estimatedTime: -1,
      axelarStatus: '',
      showAxelarTxIndication: '',
      clearPermitText: 'Clear Permit',

      transferInProgress: false,
      refreshBalance: false,
      autounwrap: false,

      selfCheckApproved: false,

      tokenInKeplr: -1,

      migrationTokens: null,
      migrationAmount: 0,
      migrationSelectedToken: null,
      tokenMigrationBalance: -1,
      tokenMigrationBalanceNew: -1,
      tokenMigrationBalanceDisplay: -1,
      tokenMigrationBalanceCheck: false,
      tokenMigrationInProgress: false,
      tokenMigrationError: '',
      tokenMigrationCompleteSuccess: false,
      tokenMigrationHelp: false
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
      let result = await this.calcTransferFee(this.amount == '' ? '0' : this.amount);
      if (result) {
        this.estimatedFee = result.display;
      }

      let limit = await this.getMaxTransfer();
      this.maxTransfer = limit.display;

      if (token && token.SNIP20_address !== '') {
        this.tokenInKeplr = await checkIfTokenInKeplr(this.fromChain.chainInfo.chainId, token.SNIP20_address);
      } else {
        this.tokenInKeplr = -1;
      }
    },

    tokenBalance(newBalance, oldBalance) {
      setTimeout(() => {
        this.refreshBalance = false;
      }, 1000);
    },
    bankBalances(newBalance, oldBalance) {
      setTimeout(() => {
        this.refreshBalance = false;
      }, 1000);
    },
    MMBalance(newBalance, oldBalance) {
      setTimeout(() => {
        this.refreshBalance = false;
      }, 1000);
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
      if (newChain.type === 'evm') {
        this.connectMM();
      } else if (newChain.type === 'cosmos') {
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
      if (newChain.type === 'evm') {
        // EVM
        if (this.isMMConnected) {
          this.destinationAddress = this.MMAccounts[0];
        } else {
          this.destinationAddress = '';
          this.connectMM();
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
    }
  },
  methods: {
    /******* AXELAR *******/

    async calcTransferFee(amount) {
      try {
        let microAmount = this.getMicroAmount(this.selectedToken, amount);
        let fromChainId = this.fromChain.axelar.chain;
        if (this.selectedToken.isNative && this.fromChain.axelar.native_chain) {
            fromChainId = this.fromChain.axelar.native_chain;
        }

        const isToEvm = this.toChain.type === 'evm';
        const isFromEvm = this.fromChain.type === 'evm';
        const isGmpToEvm = isToEvm && this.toChain.distributionExecutable;
        const isGmpFromEvm = isFromEvm && this.fromChain.distributionExecutable;
        const isGmp = isGmpToEvm || isGmpFromEvm;

        if (isGmp) {
          // GMP transfers use estimateGasFee (returns wei string, 18 decimals)
          // EVM→Secret: fee is in native EVM token (ETH, AVAX, etc.) paid as msg.value
          // Secret→EVM: fee is in the bridged token, deducted via GMP memo
          const isEvmToSecret = isGmpFromEvm;
          const tokenDecimals = isEvmToSecret ? 18 : (this.selectedToken.coinDecimals || 6);
          const symbol = isEvmToSecret
            ? (this.fromChain.chainInfo.nativeCurrency?.symbol || this.fromChain.chainInfo.stakeCurrency?.coinDenom || 'ETH')
            : this.selectedToken.symbol;
          const destChainId = isEvmToSecret
            ? (this.toChain.axelar.chain)
            : this.toChain.axelar.chain;
          const gasDenom = isEvmToSecret
            ? (this.fromChain.chainInfo.stakeCurrency?.coinMinimalDenom || 'eth')
            : this.selectedToken.denom;

          try {
            const weiString = await this.axelarQuery.estimateGasFee(
              fromChainId,
              destChainId,
              gasDenom,
              200000, // gas limit (DistributionExecutable typically uses ~150k)
              1.1     // multiplier
            );

            // weiString is always an 18-decimal string (e.g. "535252641763355" = 0.000535 in human units)
            const feeNormal = parseFloat(weiString) / 1e18;
            const feeAmountMicro = Math.ceil(feeNormal * Math.pow(10, tokenDecimals));

            let displayVal = parseFloat(feeNormal.toFixed(8));
            if (displayVal > 1) {
              displayVal = displayVal.toLocaleString();
            }
            const display = displayVal + ' ' + symbol;

            return {
              amount: feeAmountMicro,
              normalAmount: feeNormal,
              display: display,
              symbol: symbol,
              denom: this.selectedToken.denom,
              isGmp: true
            };
          } catch (gmpErr) {
            console.warn('GMP estimateGasFee failed, using fallback:', gmpErr);
            const gmpConfig = this.fromChain.axelarGmp;
            const feeAmountMicro = parseInt(gmpConfig?.defaultGasFee || '50000');
            const feeNormal = feeAmountMicro / Math.pow(10, tokenDecimals);
            const display = parseFloat(feeNormal.toFixed(8)) + ' ' + symbol;

            return {
              amount: feeAmountMicro,
              normalAmount: feeNormal,
              display: display,
              symbol: symbol,
              denom: this.selectedToken.denom,
              isGmp: true
            };
          }
        }

        // Standard deposit-address transfer: use getTransferFee
        const result = await this.axelarQuery.getTransferFee(fromChainId, this.toChain.axelar.chain, this.selectedToken.denom, microAmount);

        let display = result.fee.amount + ' ' + result.fee.denom;
        let symbol = result.fee.denom;
        let normal = 0;

        if (axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]['fee-decimals'].hasOwnProperty(result.fee.denom)) {
          let tokenInfo = axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]['fee-decimals'][result.fee.denom];
          normal = parseFloat(result.fee.amount) / Math.pow(10, tokenInfo.decimal);
          symbol = this.selectedToken.symbol;

          display = parseFloat(normal.toFixed(8));
          if (display > 1) {
            display = display.toLocaleString();
          }
          display = display + ' ' + symbol;
        }
        result.fee['display'] = display;
        result.fee['symbol'] = symbol;
        result.fee['normalAmount'] = normal;
        result.fee.amount = parseInt(result.fee.amount);

        return result.fee;
      } catch (err) {
        console.log(err);
        return { display: '', symbol: '', normalAmount: -1, amount: -1 };
      }
    },

    async getMaxTransfer() {
      let result = {
        display: '',
        amount: -1,
        normalAmount: -1,
        symbol: '',
        denom: ''
      };
      try {
        const limit = await this.axelarQuery.getTransferLimit({
          fromChainId: this.fromChain.axelar.chain,
          toChainId: this.toChain.axelar.chain,
          denom: this.selectedToken.denom
        });

        if (limit) {
          if (axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]['fee-decimals'].hasOwnProperty(this.selectedToken.denom)) {
            let tokenInfo = axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]['fee-decimals'][this.selectedToken.denom];
            result.amount = parseInt(limit);
            result.normalAmount = parseFloat(limit) / Math.pow(10, tokenInfo.decimal);
            result.display = result.normalAmount.toLocaleString() + ' ' + this.selectedToken.symbol;
            result.symbol = tokenInfo.symbol;
            result.denom = this.selectedToken.denom;
          }
        }
      } catch (err) {}

      return result;
    },

    async refreshMigrationBalance() {
      const getBalance = async (address, codeHash) => {
        let permit = undefined;
        if (codeHash != '') {
          permit = await getPermit('secret-4', [address], this.accounts['secret-4'].address);
        }

        const result = await getTokenBalance(this.accounts['secret-4'], { address, codeHash }, 'secret-4', this.accounts['secret-4'].address, permit);
        return result.balance.amount;
      };

      this.tokenMigrationBalance = -1;
      this.tokenMigrationBalanceNew = -1;
      this.tokenMigrationBalanceDisplay = -1;
      this.tokenMigrationBalanceCheck = true;

      try {
        this.tokenMigrationBalance = await getBalance(this.migrationSelectedToken.dst_address, '');
      } catch (err) {
        console.error(err);
        // Retrying one more time
        this.tokenMigrationBalance = await getBalance(this.migrationSelectedToken.dst_address, '');
      }

      let newBalance = -1;
      try {
        newBalance = await getBalance(this.migrationSelectedToken.new_address, this.migrationSelectedToken.new_codeHash);
      } catch (err) {
        console.error(err);
        // Retrying one more time
        newBalance = await getBalance(this.migrationSelectedToken.new_address, this.migrationSelectedToken.new_codeHash);
      }

      this.tokenMigrationBalanceCheck = false;
      this.tokenMigrationBalanceDisplay = this.tokenMigrationBalance;
      try {
        if (this.tokenMigrationBalanceDisplay > 0) {
          this.tokenMigrationBalanceDisplay = (this.tokenMigrationBalanceDisplay / Math.pow(10, this.migrationSelectedToken.decimals)).toFixed(6);
        }
      } catch (err) {
        console.error(err);
      }

      this.tokenMigrationBalanceNew = newBalance;
      try {
        if (this.tokenMigrationBalanceNew > 0) {
          this.tokenMigrationBalanceNew = (newBalance / Math.pow(10, this.migrationSelectedToken.decimals)).toFixed(6);
        }
      } catch (err) {
        console.error(err);
      }

      this.getBalance();
      console.log('------- BALANCE ---------');
      console.log(this.tokenMigrationBalance);
      console.log('------- BALANCE ---------');
    },

    async handleTokenMigrationChange(token) {
      if (!this.isKeplrConnected) return;

      this.migrationSelectedToken = token;
      this.refreshMigrationBalance();
    },

    async doMigration() {
      var self = this;

      if (this.migrationSelectedToken === null) {
        return;
      }

      this.tokenMigrationError = false;
      this.tokenMigrationInProgress = true;
      this.tokenMigrationCompleteSuccess = false;

      let amount = BigInt(Math.round(this.migrationAmount * 10 ** this.migrationSelectedToken.decimals)).toString();

      console.log(amount);
      try {
        let tx = await this.accounts['secret-4'].tx.snip20.send(
          {
            sender: this.accounts['secret-4'].address,
            contract_address: this.migrationSelectedToken.dst_address,
            code_hash: '',
            msg: {
              send: {
                recipient: tokenListForMigration.contract.address,
                amount: amount
              }
            }
          },
          {
            gasLimit: 300_000
          }
        );
        console.log(tx);

        if (tx) {
          if (tx.code !== 0) {
            if (tx.rawLog.indexOf('insufficient funds') != -1) {
              this.tokenMigrationError = 'Cannot migrate tokens (insufficient funds), please contact us';
            } else {
              this.tokenMigrationError = 'Error code: ' + tx.code;
            }
          } else {
            setTimeout(function () {
              self.tokenMigrationCompleteSuccess = false;
              self.migrationAmount = 0;
            }, 3000);
            this.tokenMigrationCompleteSuccess = true;
            this.refreshMigrationBalance();
          }
        }
      } catch (err) {
        console.log(err);
        this.tokenMigrationError = 'Error';
      }
      this.tokenMigrationInProgress = false;
    },

    async sendFromEVM(amount) {
      this.axelarStatus = 'Please wait...';
      this.info_error = '';
      let microAmount = await this.getMicroAmount(this.selectedToken, amount);

      // Use DistributionExecutable if available (Linea Sepolia, etc.)
      if (this.fromChain.distributionExecutable) {
        try {
          this.transferInProgress = true;
          this.showProcessAnimation = true;
          this.axelarStatus = 'Approve token spending in MetaMask...';
          this.animateInput();

          // Destination chain name for Axelar (e.g., "secret-snip-4")
          const destChain = this.selectedToken.isNative
            ? this.toChain.axelar.native_chain
            : this.toChain.axelar.chain;

          // Dynamically estimate the GMP gas fee in native EVM token (wei)
          let gasFeeWei = '200000000000000'; // fallback: 0.0002 ETH
          try {
            const estimated = await this.axelarQuery.estimateGasFee(
              this.fromChain.axelar.chain,
              destChain,
              this.fromChain.chainInfo.stakeCurrency?.coinMinimalDenom || 'eth',
              150000,
              1.1
            );
            if (estimated && typeof estimated === 'string') {
              gasFeeWei = estimated;
            }
          } catch (e) {
            console.warn('estimateGasFee for EVM failed, using fallback:', e);
          }

          // Derive the Axelar denom for the sendTo contract call
          // "USDC.axl" → "axlUSDC", "USDT.axl" → "axlUSDT", "SCRT" → "SCRT", "USDC" → "USDC"
          let evmDenom = this.selectedToken.symbol;
          if (evmDenom.endsWith('.axl')) {
            evmDenom = 'axl' + evmDenom.replace('.axl', '');
          }

          await this.$store.dispatch('sendToSecret', {
            erc20Address: this.selectedToken.ERC20_address,
            distributionExecutable: this.fromChain.distributionExecutable,
            from: this.sourceAddress,
            amount: microAmount,
            destinationChain: destChain,
            destinationAddress: this.destinationAddress,
            denom: evmDenom,
            gasFeeWei: gasFeeWei
          });

          this.axelarStatus = 'Transfer initiated! Waiting for confirmation...';
        } catch (err) {
          console.log('sendToSecret Error: ', err);
          this.transferInProgress = false;
          this.selfCheckApproved = false;
          this.showProcessAnimation = false;
          this.axelarStatus = '';
        }
        return;
      }

      // Fallback: use Axelar SDK deposit address (for chains without DistributionExecutable)
      let fee = await this.calcTransferFee(amount);
      let maxAmount = await this.getMaxTransfer();
      if (fee) {
        this.estimatedFee = fee.display;
      } else {
        this.estimatedFee = '';
      }

      if (maxAmount.normalAmount != -1 && parseFloat(amount) > maxAmount.normalAmount) {
        this.info_error = 'Requested amount exceeds the maximum allowed transfer';
        this.axelarStatus = '';
        return;
      }

      let balanceToCheck = this.selectedToken.isEVMNative ? this.bankBalances.get(this.selectedTokenTransferDenom) : this.MMBalance.amount;
      if (BigInt(balanceToCheck) < BigInt(microAmount)) {
        this.info_error = 'Insufficient balance';
        this.axelarStatus = '';
        return;
      }
      if (parseFloat(amount) <= fee.normalAmount) {
        this.info_error = `Minimum transfer should cover the fees (${fee.normalAmount} ${fee.symbol})`;
        this.axelarStatus = '';
        return;
      }

      try {
        this.transferInProgress = true;
        this.showProcessAnimation = true;

        this.axelarStatus = 'Initializing transfer...';
        const depositAddress = await this.axelarTransfer.getDepositAddress({
          fromChain: this.fromChain.axelar.chain,
          toChain: this.selectedToken.isNative ? this.toChain.axelar.native_chain : this.toChain.axelar.chain,
          destinationAddress: this.destinationAddress,
          asset: this.selectedToken.denom
        });
        console.log('Sending to:', depositAddress);
        this.axelarStatus = 'Waiting for user approval...';

        this.animateInput();
        if (this.selectedToken.ERC20_address && this.selectedToken.ERC20_address != '') {
          this.$store.dispatch('sendMMTokens', {
            contract: this.selectedToken.ERC20_address,
            walletAddress: depositAddress,
            from: this.sourceAddress,
            amount: microAmount
          });
        } else if (this.selectedToken.isEVMNative) {
          this.$store.dispatch('sendCoins', { walletAddress: depositAddress, from: this.sourceAddress, amount: microAmount });
        }
      } catch (err) {
        console.log('Axelar Error: ', err);
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

    async autoFill() {
      if (this.toChain.type === 'evm') {
        if (this.isMMConnected) {
          this.destinationAddress = this.MMAccounts[0];
        } else if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              this.destinationAddress = accounts[0];
            }
          } catch (e) { console.error('AutoFill MM error:', e); }
        }
      } else if (this.receiverAccount) {
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
        this.$dispatchQueue.addToQueue('connectSecretWithMetaMask', this.availableChains['main-chain'][0].chainInfo);
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
          if (typeof chain === 'undefined') {
            // Clicked on connect wallet
            var self = this;
            if (this.connectionRequestQueue.size > 0) {
              this.connectionRequestQueue.forEach((value, key) => {
                self.$dispatchQueue.addToQueue('initKeplr', value);
              });
              this.connectionRequestQueue.clear();
            } else {
              this.$dispatchQueue.addToQueue('initKeplr', this.availableChains['main-chain'][0].chainInfo);
            }
          } else {
            this.$dispatchQueue.addToQueue('initKeplr', chain);
          }
        }
      }
    },
    connectMM() {
      let chainId = -1;
      if (this.fromChain.type === 'evm') {
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
      this.clearPermitText = 'Please wait...';
      for (let i = 0; i < items.length; i++) {
        if (items[i].indexOf('perm_') != -1) {
          window.localStorage.removeItem(items[i]);
        }
      }
      setTimeout(function () {
        self.clearPermitText = 'Clear Permit';
        if (self.drawer !== undefined) {
          self.drawer = false;
        }
      }, 1000);
    },

    switchSite() {
      if (process.env.NUXT_ENV_AXELAR_ENV === 'mainnet') {
        window.location.href = 'https://secret-tunnel-testnet.pages.dev';
      } else {
        window.location.href = 'https://tunnel.scrt.network';
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
      if (this.amount == '' || this.amount == null || Number.isNaN(this.amount)) {
        this.info_error = 'Amount must be a valid number';
        return;
      }

      this.tx_error = '';
      this.info_error = '';
      this.showAxelarTxIndication = '';
      let microAmount = this.getMicroAmount(this.selectedToken, this.amount);
      if (microAmount == 0) {
        this.info_error = 'Amount must be grater than 0';
        return;
      }

      if (this.fromChain.type === 'evm') {
        this.sendFromEVM(this.amount);
      }
      if (this.fromChain.type === 'cosmos') {
        const isToEvm = this.toChain.type === 'evm';
        const hasSNIP20 = this.selectedToken.SNIP20_address && this.selectedToken.SNIP20_address !== '';
        if (isToEvm && hasSNIP20) {
          // SNIP-20 tokens to EVM use GMP via sendWasm
          this.sendWasm(microAmount);
        } else if (this.fromChain.chainInfo.out_port === 'transfer' || this.selectedToken.isNative) {
          // Native tokens or IBC transfers use MsgTransfer (deposit-address)
          this.sendTransfer(microAmount);
        } else {
          this.sendWasm(microAmount); // SNIP-20 to non-EVM cosmos
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
        this.axelarStatus = 'Please wait...';
        
        // Refresh balance before checking
        console.log('--- Refreshing balance before transfer ---');
        console.log('Source Address:', this.sourceAddress);
        console.log('Sender Account:', this.senderAccount ? this.senderAccount.address : 'null');
        await this.getBalance();
        // Wait a bit for balance to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let fee = await this.calcTransferFee(amount);
        if (fee) {
          this.estimatedFee = fee.display;
        } else {
          this.estimatedFee = '';
        }

        console.log('--- Balance Check ---');
        console.log('Bank Balances Map:', this.bankBalances);
        console.log('Selected Token Transfer Denom:', this.selectedTokenTransferDenom);
        console.log('Balance for token:', this.bankBalances.get(this.selectedTokenTransferDenom));
        console.log('Amount to transfer:', amount);
        console.log('Fee amount:', fee ? fee.amount : 'N/A');
        console.log('Fee denom:', fee ? fee.denom : 'N/A');

        if (this.bankBalances.get(this.selectedTokenTransferDenom) === undefined) {
          this.info_error = 'Insufficient balance - token balance not found. Please refresh your balance.';
          this.axelarStatus = '';
          return;
        }

        // Check if we have enough for fees (uaxl)
        const feeDenom = this.fromChain.chainInfo.stakeCurrency.coinMinimalDenom; // uaxl
        const feeBalance = this.bankBalances.get(feeDenom);
        
        // Calculate estimated fee in uaxl (gasLimit * gasPrice * buffer)
        // This is used throughout the function for fee checks
        const gasLimit = 500_000;
        const gasPrice = 0.1;
        const estimatedFeeUaxl = Math.ceil(gasLimit * gasPrice * 1.1); // ~55000 uaxl with 10% buffer
        
        console.log('Fee denom balance:', feeBalance, feeDenom);
        console.log('Transfer amount:', amount, this.selectedTokenTransferDenom);
        console.log('Estimated fee in uaxl:', estimatedFeeUaxl);
        console.log('All bank balances:', Array.from(this.bankBalances.entries()));
        
        // Special case: If sending the native token (uaxl), we need amount + fees
        const isSendingNativeToken = this.selectedTokenTransferDenom === feeDenom;
        
        if (isSendingNativeToken) {
          // When sending native token, spendable balance must cover: amount + fees
          const totalNeeded = BigInt(amount) + BigInt(estimatedFeeUaxl);
          if (!feeBalance || BigInt(feeBalance) < totalNeeded) {
            this.info_error = `Insufficient ${feeDenom}. Need ${amount} ${feeDenom} for transfer + ~${estimatedFeeUaxl} ${feeDenom} for fees = ${totalNeeded.toString()} ${feeDenom}. Available: ${feeBalance || 0} ${feeDenom}`;
            this.axelarStatus = '';
            return;
          }
        } else {
          // When sending non-native token, check token balance and fee balance separately
          if (BigInt(this.bankBalances.get(this.selectedTokenTransferDenom)) < BigInt(amount)) {
            this.info_error = 'Insufficient balance';
            this.axelarStatus = '';
            return;
          }

          if (parseFloat(amount) <= fee.amount) {
            this.info_error = `Minimum transfer should cover the fees (${fee.normalAmount} ${fee.symbol})`;
            this.axelarStatus = '';
            return;
          }

          if (!feeBalance || BigInt(feeBalance) < BigInt(estimatedFeeUaxl)) {
            // Try to query balance directly as a last check
            console.log('--- Direct balance query as fallback ---');
            try {
              const directBalance = await this.senderAccount.query.bank.allBalances({ address: this.sourceAddress });
              console.log('Direct balance query result:', directBalance);
              const directFeeBalance = directBalance.balances?.find(b => b.denom === feeDenom);
              console.log('Direct fee balance:', directFeeBalance);
              
              if (directFeeBalance && BigInt(directFeeBalance.amount) >= BigInt(estimatedFeeUaxl)) {
                console.log('Direct query shows sufficient balance, updating bankBalances');
                // Update the balance in the map
                this.bankBalances.set(feeDenom, directFeeBalance.amount);
                // Also update the token balance if needed
                const tokenBalance = directBalance.balances?.find(b => b.denom === this.selectedTokenTransferDenom);
                if (tokenBalance) {
                  this.bankBalances.set(this.selectedTokenTransferDenom, tokenBalance.amount);
                }
              } else {
                this.info_error = `Insufficient ${feeDenom} for fees. Required: ${estimatedFeeUaxl} ${feeDenom}, Available: ${directFeeBalance?.amount || feeBalance || 0} ${feeDenom}. Please ensure you have enough ${feeDenom} in account ${this.sourceAddress}`;
                this.axelarStatus = '';
                return;
              }
            } catch (queryErr) {
              console.error('Direct balance query failed:', queryErr);
              this.info_error = `Insufficient ${feeDenom} for fees. Required: ${estimatedFeeUaxl} ${feeDenom}, Available: ${feeBalance || 0} ${feeDenom}. Please refresh your balance or check account ${this.sourceAddress}`;
              this.axelarStatus = '';
              return;
            }
          }
        }

        this.transferInProgress = true;
        this.showProcessAnimation = true;
        this.axelarStatus = 'Initializing transfer...';

        var depositAddress = this.destinationAddress;
        let usedAxelarAPI = false;
        let transferMemo = '';
        const isToEvm = this.toChain.type === 'evm';

        if (isToEvm && this.toChain.distributionExecutable) {
          // Native token → EVM: send directly to Axelar gateway with GMP memo
          const mainChain = this.availableChains['main-chain'][0];
          const gmpConfig = mainChain.axelarGmp;
          depositAddress = gmpConfig.gatewayAddress;

          // Build GMP payload: ABI-encode the destination EVM address
          let payload = null;
          let memoType = 3; // 3 = SendToken
          let gmpDestAddress = this.destinationAddress;

          if (this.toChain.distributionExecutable) {
            try {
              const web3 = new Web3();
              const encodedHex = web3.eth.abi.encodeParameter('address', this.destinationAddress);
              const hexStr = encodedHex.startsWith('0x') ? encodedHex.slice(2) : encodedHex;
              payload = [];
              for (let i = 0; i < hexStr.length; i += 2) {
                payload.push(parseInt(hexStr.substr(i, 2), 16));
              }
              memoType = 2; // 2 = callContractWithToken
              gmpDestAddress = this.toChain.distributionExecutable;
            } catch (encodeErr) {
              console.error('Error encoding payload:', encodeErr);
            }
          }

          const gmpMemo = {
            destination_chain: this.toChain.axelar.chain,
            destination_address: gmpDestAddress,
            payload: payload,
            type: memoType,
            fee: {
              amount: fee ? String(fee.amount) : String(gmpConfig.defaultGasFee),
              recipient: gmpConfig.gasServiceAddress
            }
          };
          transferMemo = JSON.stringify(gmpMemo);
          console.log('GMP Memo for native transfer:', transferMemo);
        } else if (this.fromChain.name.toLowerCase() !== 'axelar') {
          // Non-EVM destination: use deposit address
          try {
            const fromChainId = (this.selectedToken.isNative && this.fromChain.axelar.native_chain)
              ? this.fromChain.axelar.native_chain
              : this.fromChain.axelar.chain;
            depositAddress = await this.axelarTransfer.getDepositAddress({
              fromChain: fromChainId,
              toChain: this.toChain.axelar.chain,
              destinationAddress: this.destinationAddress,
              asset: this.selectedToken.denom
            });
            usedAxelarAPI = true;
          } catch (depositErr) {
            console.error('getDepositAddress failed:', depositErr);
            this.info_error = `Failed to get deposit address from Axelar: ${depositErr.message || 'Unknown error'}`;
            this.axelarStatus = '';
            this.transferInProgress = false;
            this.showProcessAnimation = false;
            return;
          }
        }

        // Determine port and channel based on token type
        const sourcePort = this.selectedToken.isNative ? this.fromChain.chainInfo.out_native_port : this.fromChain.chainInfo.out_port;
        const sourceChannel = this.selectedToken.isNative ? this.fromChain.chainInfo.out_native_channel : this.fromChain.chainInfo.out_channel;

        console.log('--- IBC Transfer Details ---');
        console.log('From Chain:', this.fromChain.name);
        console.log('To Chain:', this.toChain.name);
        console.log('Token:', this.selectedToken.symbol, this.selectedToken.denom);
        console.log('Token isNative:', this.selectedToken.isNative);
        console.log('Source Port:', sourcePort);
        console.log('Source Channel:', sourceChannel);
        console.log('Receiver Address:', depositAddress);
        console.log('Amount:', amount);
        console.log('Denom:', this.selectedTokenTransferDenom);
        console.log('Memo:', transferMemo);

        amount = amount + ''; // convert to string
        const msgTransfer = new MsgTransfer({
          source_port: sourcePort,
          source_channel: sourceChannel,
          token: {
            amount,
            denom: this.selectedTokenTransferDenom
          },
          timeout_height: {
            revision_number: "0",
            revision_height: "0",
          },
          timeout_timestamp: String(Math.floor(Date.now() / 1000) + 10 * 60), // 10 minutes
          sender: this.sourceAddress,
          receiver: depositAddress,
          memo: transferMemo,
        });

        console.log('--- MsgTransfer Object ---');
        console.log(msgTransfer);
        console.log('--- Account Details ---');
        console.log('Source Address:', this.sourceAddress);
        console.log('Sender Account Address:', this.senderAccount ? this.senderAccount.address : 'null');
        console.log('Fee Denom:', this.fromChain.chainInfo.stakeCurrency.coinMinimalDenom);
        console.log('Fee Balance in bankBalances:', this.bankBalances.get(this.fromChain.chainInfo.stakeCurrency.coinMinimalDenom));

        this.axelarStatus = 'Waiting for user approval...';

        let signedTX = await this.senderAccount.tx.signTx([msgTransfer], {
          gasLimit: 500_000,
          gasPriceInFeeDenom: 0.1,
          feeDenom: this.fromChain.chainInfo.stakeCurrency.coinMinimalDenom
        });

        this.axelarStatus = 'Transaction was submitted, please wait...';
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
          this.tx_error = 'unknown';
          switch (tx.code) {
            case 5:
              this.tx_error = 'insufficient funds';
              break;
            case 7:
              this.tx_error = 'Invalid address';
              break;
            case 11:
              this.tx_error = 'Out of gas';
              break;
            case 13:
              this.tx_error = 'insufficient fees';
              break;
          }
        }

        if (this.tx_error === '') {
          // Find the packet acknowledgment or send event
          let ibcHash = tx.transactionHash;
          if (tx.ibcResponses && tx.ibcResponses.length > 0) {
            try {
              ibcHash = tx.ibcResponses[0].tx.transactionHash;
            } catch (e) {}
          }

          const explorerBase = this.fromChain.chainInfo.zonescan ? 'https://zonescan.io' : axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]['cosmos-block-explorer'];
          const txPath = 'transactions';
          this.axelarStatus = `<div style="color: orange">Received TX, waiting for ibc acknowledgment...<br><a style="color: orange" href="${explorerBase}/${this.fromChain.chainInfo.zonescan}/${txPath}/${tx.transactionHash}" target="_">Watch the transaction here</a></div>`;

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
                console.log('ERROR 1');
                console.error(txError);
                console.log('ERROR 1');
                this.tx_error = txError.value;
              }
            } catch (err) {
              console.log('ERROR 2');
              console.error(err);
              console.log('ERROR 2');
            }
          }
          this.getBalance();

          if (this.tx_error == '') {
            const isToEvm = this.toChain.type === 'evm';
            if (isToEvm) {
              // For GMP, use the ORIGINAL user tx hash, not the IBC ack hash
              const gmpHash = '0x' + tx.transactionHash.toLowerCase();
              const axelarscanUrl = `https://axelarscan.io/gmp/${gmpHash}`;
              this.axelarStatus = `<div style="color: lightgreen">Transfer complete! <a style="color: lightgreen; text-decoration: underline;" href="${axelarscanUrl}" target="_">Watch Axelar GMP status here</a><br><span style="font-size: 11px; color: #bbb;">(If stuck, you can manually add gas on Axelarscan)</span></div>`;
            } else {
              const explorerBase = this.fromChain.chainInfo.zonescan ? 'https://zonescan.io' : axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]['cosmos-block-explorer'];
              const txPath = 'transactions';
              this.axelarStatus = `<div style="color: lightgreen">Transfer complete! You will receive your coins in a few seconds.<br><a  style="color: lightgreen" href="${explorerBase}/${this.fromChain.chainInfo.zonescan}/${txPath}/${ibcHash}" target="_">Watch the ibc acknowledgment here</a></div>`;
            }
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
        console.error('--- sendTransfer Error ---');
        console.error('Error details:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        this.transferInProgress = false;
        this.showProcessAnimation = false;
        this.selfCheckApproved = false;
        const errorMsg = err.message || 'Unknown error occurred';
        this.showAxelarError(errorMsg);
      }
    },

    async sendWasm(amount) {
      this.tx = undefined;
      this.ack = -1;
      this.ibcTx = undefined;

      this.axelarStatus = 'Please wait...';
      this.info_error = '';
      //let microAmount = await this.getMicroAmount(amount);
      let fee = await this.calcTransferFee(amount);
      let maxAmount = await this.getMaxTransfer();
      if (fee) {
        this.estimatedFee = fee.display;
      }

      if (maxAmount.amount != -1 && parseFloat(amount) > maxAmount.amount) {
        this.info_error = 'Requested amount exceeds the maximum allowed transfer';
        this.axelarStatus = '';
        return;
      }

      if (this.selectedToken.SNIP20_address && this.selectedToken.SNIP20_address != '') {
        // console.log(`${this.tokenBalance.balance.amount} < ${amount}`);
        if (BigInt(this.tokenBalance.balance.amount) < BigInt(amount)) {
          this.info_error = 'Insufficient balance';
          this.axelarStatus = '';
          return;
        }
      }

      if (amount <= fee.amount) {
        this.info_error = `Minimum transfer should cover the fees (${fee.normalAmount} ${fee.symbol})`;
        this.axelarStatus = '';
        return;
      }

      amount = amount + '';

      this.transferInProgress = true;
      this.showProcessAnimation = true;

      this.axelarStatus = 'Initializing transfer...';

      let shouldUnwrap = false;
      try {
        if (this.selectedToken.allow_autounwap && this.autounwrap) {
          shouldUnwrap = true;
        }
      } catch (errUnwrap) {}

      console.log('Should Unwrap:', shouldUnwrap);

      // Determine if this is Secret -> EVM (needs GMP memo) or Secret -> Cosmos (direct IBC)
      const isToEvm = this.toChain.type === 'evm';
      const mainChain = this.availableChains['main-chain'][0];
      const gmpConfig = mainChain.axelarGmp;

      console.log('--- Sending SNIP-20 Token via IBC ---');
      console.log('Destination:', this.destinationAddress);
      console.log('To Chain:', this.toChain.axelar.chain);
      console.log('Is EVM destination:', isToEvm);
      
      this.axelarStatus = 'Waiting for user approval...';

      if (this.senderAccount) {
        // Build the SNIP-20 send message
        let sendMsgInner = {
          channel: this.fromChain.chainInfo.out_channel,
          remote_address: this.destinationAddress,
          timeout: 10 * 60  // 10 minutes
        };
        let sendMemo = undefined;

        if (isToEvm && gmpConfig) {
          // Secret -> EVM: route through Axelar GMP
          // Send to Axelar gateway, with GMP memo for cross-chain routing
          sendMsgInner.remote_address = gmpConfig.gatewayAddress;

          // Build GMP payload: ABI-encode the destination EVM address
          let payload = null;
          let memoType = 3; // 3 = SendToken (no contract call)
          let destinationAddress = this.destinationAddress;

          // If the destination chain has a DistributionExecutable contract, use callContractWithToken
          if (this.toChain.distributionExecutable) {
            try {
              const web3 = new Web3();
              const encodedHex = web3.eth.abi.encodeParameter('address', this.destinationAddress);
              // Convert hex string to byte array (strip 0x prefix)
              const hexStr = encodedHex.startsWith('0x') ? encodedHex.slice(2) : encodedHex;
              payload = [];
              for (let i = 0; i < hexStr.length; i += 2) {
                payload.push(parseInt(hexStr.substr(i, 2), 16));
              }
              memoType = 2; // 2 = callContractWithToken
              destinationAddress = this.toChain.distributionExecutable;
            } catch (encodeErr) {
              console.error('Error encoding payload:', encodeErr);
            }
          }

          const gmpMemo = {
            destination_chain: this.toChain.axelar.chain,
            destination_address: destinationAddress,
            payload: payload,
            type: memoType,
            fee: {
              amount: fee ? String(fee.amount) : String(gmpConfig.defaultGasFee),
              recipient: gmpConfig.gasServiceAddress
            }
          };

          sendMemo = JSON.stringify(gmpMemo);
          console.log('GMP Memo:', sendMemo);
        }

        // Build the send msg object
        const sendMsgPayload = {
          recipient: this.fromChain.chainInfo.out_port.replace('wasm.', ''),
          recipient_code_hash: this.fromChain.chainInfo.ICS_code_hash,
          amount,
          msg: toBase64(
            toUtf8(
              JSON.stringify(sendMsgInner)
            )
          )
        };

        // Add GMP memo if sending to EVM
        if (sendMemo) {
          sendMsgPayload.memo = sendMemo;
        }

        const sendMsg = new MsgExecuteContract({
          sender: this.sourceAddress,
          contract_address: this.selectedToken.SNIP20_address,
          code_hash: this.selectedToken.SNIP20_code_hash,
          msg: {
            send: sendMsgPayload
          },
          sent_funds: []
        });

        try {
          console.log('Send message:', sendMsg);
          
          let signedTX = await this.senderAccount.tx.signTx([sendMsg], {
            gasLimit: 300_000,
            gasPriceInFeeDenom: 0.1,
            feeDenom: 'uscrt'
          });

          this.axelarStatus = 'Transaction was submitted, please wait...';
          this.animateInput();
          this.tx = '';
          
          console.log('Transaction signed, broadcasting...');
          let tx = await this.senderAccount.tx.broadcastSignedTx(signedTX, {
            ibcTxsOptions: {
              resolveResponses: true,
              resolveResponsesTimeoutMs: 720_000,
              resolveResponsesCheckIntervalMs: 15_000
            }
          });

          if (tx.code !== 0) {
            throw new Error(`Transaction failed: ${tx.rawLog}`);
          }

          console.log(`✅ Transaction submitted! Tx Hash: ${tx.transactionHash}`);
          console.log(`Waiting for IBC acknowledgment...`);

          const chainId = this.fromChain.chainInfo.zonescan || this.fromChain.chainInfo.mintscan;
          const explorerBase = this.fromChain.chainInfo.zonescan ? 'https://zonescan.io' : axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]['cosmos-block-explorer'];
          const txPath = 'transactions';
          this.axelarStatus = `<div style="color: orange">Received TX, waiting for IBC acknowledgment...<br><a style="color: orange" href="${explorerBase}/${chainId}/${txPath}/${tx.transactionHash}" target="_">Watch the transaction here</a></div>`;
          this.ack = 0;
          
          try {
            const ibcResponses = await Promise.all(tx.ibcResponses);
            this.ack = 1;
            if (ibcResponses.length > 0) {
              console.log('IBC Responses:', ibcResponses);
              
              let ibcHash = tx.transactionHash;
              try {
                ibcHash = ibcResponses[0].tx.transactionHash;
              } catch (e) {}
              
              if (isToEvm) {
                // For GMP, use the ORIGINAL user tx hash, not the IBC ack hash
                // Axelarscan indexes GMP by the source transaction hash
                const gmpHash = '0x' + tx.transactionHash.toLowerCase();
                const axelarscanUrl = `https://axelarscan.io/gmp/${gmpHash}`;
                this.axelarStatus = `<div style="color: lightgreen">Transfer to ${this.toChain.name} complete!<br><a style="color: lightgreen; text-decoration: underline;" href="${axelarscanUrl}" target="_">View on Axelarscan</a><br><span style="font-size: 11px; color: #bbb;">(If stuck, you can manually add gas on Axelarscan)</span><br>Your balance will be updated shortly</div>`;
              } else {
                this.axelarStatus = `<div style="color: lightgreen">Transfer to ${this.toChain.name} complete!<br><a style="color: lightgreen" href="${explorerBase}/${this.fromChain.chainInfo.zonescan}/${txPath}/${ibcHash}" target="_">View on Explorer</a><br>Your balance will be updated shortly</div>`;
              }
              
              this.transferInProgress = false;
              this.selfCheckApproved = false;
            }
          } catch (ackError) {
            console.error('IBC acknowledgment error:', ackError);
            if (isToEvm) {
               const gmpHash = '0x' + tx.transactionHash.toLowerCase();
               this.axelarStatus = `<div style="color: orange">IBC acknowledgment timeout.<br><a style="color: orange; text-decoration: underline;" href="https://axelarscan.io/gmp/${gmpHash}" target="_">Check status on Axelarscan</a><br><span style="font-size: 11px; color: #bbb;">(If stuck, you can manually add gas on Axelarscan)</span><br>You should receive your funds shortly</div>`;
            } else {
               this.axelarStatus = `<div style="color: orange">IBC acknowledgment timeout.<br><a style="color: orange" href="${explorerBase}/${chainId}/${txPath}/${tx.transactionHash}" target="_">Check status on Explorer</a><br>You should receive your funds shortly</div>`;
            }
            this.transferInProgress = false;
            this.selfCheckApproved = false;
          }
          this.animateProcessing();
        } catch (err) {
          this.tx = undefined;
          this.ack = -1;
          this.ibcTx = '';
          console.error(err);
          this.axelarStatus = '';
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

      let tmpKey = this.fromChainKey;
      this.fromChainKey = this.toChainKey;
      this.toChainKey = tmpKey;

      let tmp = _.cloneDeep(this.fromChain);
      this.fromChain = _.cloneDeep(this.toChain);
      this.toChain = tmp;

      if (this.toChain.type === 'cosmos') {
        this.destinationAddress = this.receiverAccount ? this.receiverAccount.address : '';
      } else if (this.toChain.type == 'evm') {
        this.destinationAddress = this.MMAccounts[0];
      }

      if (swapTokens && this.fromChain.tokens.length > 0) {
        this.amount = 0;
        var self = this;
        setTimeout(() => {
          self.selectedToken = foundToken != null ? foundToken : self.fromChain.tokens[0];
          setTimeout(() => {
            self.getBalance();
          }, 1000);
        }, 200);
      }
    }
  } // methods
};

export default mixin;
