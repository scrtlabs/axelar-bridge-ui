<template>
  <div class="main" style="position: relative; flex-direction: column; display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh">
    <div style="position: absolute; top: 10px; right: 10px">
    </div>
    <div style="height: 45px"></div>
    <lottie-wrapper style="position: absolute; top: 10px; left: 600px; z-index: 2;"  :height="150" :path="require('../assets/animations/satellite.json')" />
    <lottie-wrapper style="position: absolute; top: 410px; left: 90px; z-index: 2;"  :speed="0.5" :height="200" :path="require('../assets/animations/flame.json')" />


    <!-- <lottie-wrapper style="position: absolute; top: 1px ;z-index: 2;" path="https://assets5.lottiefiles.com/datafiles/zc3XRzudyWE36ZBJr7PIkkqq0PFIrIBgp4ojqShI/newAnimation.json" /> -->

    <!-- <div style="position: absolute; top: 1px ;z-index: 2;width: 100px; height: 100px; background-color: red"></div> -->

    <div class="mountain"></div>

    <div class="main-section-wrapper">
      <div  v-if="walletOption" class="wallet-item-container">
        <!-- <div  v-for="n in 3" :style="styleObject" class="wallet-item" :key="'wallet_item_' + n"></div> -->
        <div :style="styleObject" class="wallet-item" @click="connect()" >
          Keplr
          <img :src="require('~/assets/wallets/kepler.logo.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 2px" />
          <div :class="isKeplrConnected ? 'green-dot' : 'red-dot'"></div>
        </div>

        <div :style="styleObject" class="wallet-item" @click="connectMM()">
          MetaMask
          <img :src="require('~/assets/wallets/metamask.logo.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 2px" />
          <div :class="isMMConnected ? 'green-dot' : 'red-dot'"></div>
        </div>


      </div>
      

      <div class="right-cave" />
      <div class="left-cave" />
      
      <div class="main-section">
        
        <div  v-if="!walletOption" style="width: 100%; display: flex; justify-content: space-between; margin-bottom: 20px; z-index: 3">
          <v-btn rounded style="font-family:'Banana'; color: #EA7534; font-size: 14px"><img :src="require('~/assets/wallets/metamask.logo.svg')" width="24" height="24" :style="MMSmallIconStyle" />{{ isMMConnected ? 'MetaMask Connected' : 'Connect MetaMask' }}</v-btn>
          <v-btn rounded style="font-family:'Banana'; color: #EA7534; font-size: 14px"><img :src="require('~/assets/wallets/kepler.logo.svg')" width="24" height="24" :style="KeplrSmallIconStyle" />{{ isKeplrConnected ? 'Keplr Connected' : 'Connect Keplr' }} </v-btn>          
        </div>
        <!-- <div class="connect-wallet-section">
          <v-menu rounded="b-xl" offset-y>
            <template v-slot:activator="{ attrs, on }">
              <v-btn class="" v-bind="attrs" color="primary" v-on="on">
                Connect Wallets
                <img :src="require('~/assets/wallets/kepler.logo.svg')" width="16" height="16" :style="KeplrSmallIconStyle" />
                <img :src="require('~/assets/wallets/metamask.logo.svg')" width="16" height="16" :style="MMSmallIconStyle" />
              </v-btn>
            </template>
            <v-list>
              <v-list-item link>
                <v-list-item-title @click="connect()" class="wallet-menu-item">
                  <div :class="isKeplrConnected ? 'green-dot' : 'red-dot'"></div>
                  <img :src="require('~/assets/wallets/kepler.logo.svg')" width="24" height="24" style="margin-right: 10px" /> Keplr
                </v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title @click="connectMM()" class="wallet-menu-item">
                  <div :class="isMMConnected ? 'green-dot' : 'red-dot'"></div>
                  <img :src="require('~/assets/wallets/metamask.logo.svg')" width="24" height="24" style="margin-right: 10px" /> MetaMask
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div> -->

        <div v-if="disableUI" class="main-section-disable"></div>
        <!-- <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px">Secret Bridge</div> -->
        <!-- From & To Start -->
        <div style="background-color: transparent; display: flex; justify-content: space-between; width: 100%; gap: 10px">
          <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
            <sub-chain-selector lable="From" v-model="fromSubChain" :chain="fromChain" :icon-size="itemIconSize" ></sub-chain-selector>
          </div>

          <div style="display: flex; flex-grow: 1; justify-content: center; align-items: center;">
            <v-btn @click="swapChains" :disabled="disableUI">⮀</v-btn>
          </div>
          
          <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
            <sub-chain-selector lable="To" v-model="toSubChain" :chain="toChain" :icon-size="itemIconSize" ></sub-chain-selector>
          </div>
        </div>
        <!-- From & To End -->

        <div v-if="fromSubChain != null" class="assets-to-transfer">
          <div style="display: flex; justify-content: space-between;">
            <div>Asset to transfer:</div>
            <div>
              <v-btn dense x-small @click="amount = getNormalizedCurrentBalance">MAX</v-btn>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 10px">
            <token-selector :tokens="fromSubChain.tokens" :icon-size="itemIconSize" v-model="selectedToken" style="max-width: 200px" ></token-selector>
            <v-text-field class="right-input number-input" type="number" style="max-width: 150px;" color="orange" background-color="transparent" label="Amount" solo flat v-model="amount" dense :suffix="selectedToken == null ? 'unknown' : selectedToken.symbol"></v-text-field>
          </div>
          <div v-if="true" style="text-align: right; margin-top: -20px; margin-right: 10px">Balance: {{ showCurrentBalance }}</div>        
          <div>
            <div style="margin-bottom: 5px">From address: {{ fromAccountName }}</div>
            <div>
              <v-text-field disabled class="address-input pa-0 ma-0" color="orange" flat  dense label=""  :value="sourceAddress" ></v-text-field>
            </div>
            <div style="margin-bottom: 5px">To address:</div>
            <div>
              <v-text-field class="address-input pa-0 ma-0" background-color="#000000" color="orange" flat  dense label=""  v-model="destinationAddress" ></v-text-field>
            </div>
          </div>
        </div>

      
        <div style="margin: 20px" >
          <v-btn class="styled-button" style="font-family: Banana; font-size: 16px" @click="send" :disabled="disableUI">Transfer</v-btn>
        </div>

        <div>
          <div v-if="tx == ''">Waiting for TX...</div>
          <div v-else>
            {{ tx }}
            <br/>
            {{  ibcTx }}
          </div>

        </div>
      </div>
    </div>
    <fire-fly></fire-fly>
  </div>
</template>



<style scoped>
.main {
    background: radial-gradient(circle, rgba(50,50,50,1) 0%, rgba(0,0,0,1) 100%);
}

/* .stone-button {
  background: url('~/assets/images/stone-button.png') no-repeat center center; 
  background-size: cover;
  background-color: transparent !important;
  width: 149px;
  min-height: 56px;
  color: black
} */

.wallet-item-container {
  position: absolute; 
  top: 160px; 
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
  transition-timing-function: cubic-bezier(.47,1.64,.41,.8);
  transition-duration: 0.3s;
  border-radius: 0 10px 10px 0;
  font-family: "Banana";
  
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

.styled-button {
  background: linear-gradient(90deg, #EA7534 0%, #7EC9CF 100%) !important;
  width: 230px;
  height: 48px;
  color: white;
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

.main-section-wrapper {
  width: 1095px;
  min-height: 889px !important;
  position: relative; 
  flex-direction: column; 
  display: flex; 
  justify-content: center; 
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
}

.right-cave {
  position: absolute; 
  z-index: 5; 
  bottom: 42px; 
  right: 146px;
  background: url('~/assets/images/right-cave.png') no-repeat center center; 
  width: 176px;
  height: 319px;
}

.left-cave {
  position: absolute; 
  z-index: 5; 
  bottom: 73px; 
  left: 143px;
  background: url('~/assets/images/left-cave.png') no-repeat center center; 
  width: 143px;
  height: 272px;
}

>>> .right-input input {
  text-align: right
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
  width: 10px; height: 10px; border-radius: 5px; background-color: red; margin-right: 10px
}

.green-dot {
  width: 10px; height: 10px; border-radius: 5px; background-color: green; margin-right: 10px
}

.mountain {
  position: absolute;
  width: 1095px;
  min-height: 889px !important;
  background: url('~/assets/images/mountain.png') no-repeat center center; 
  z-index: 0;
}

</style>


<script>

import { mapGetters } from 'vuex';
import SubChainSelector from '~/components/SubChainSelector.vue';
import TokenSelector from '~/components/TokenSelector.vue';
// import LottieWrapper from '~/components/LottieWrapper.vue';

import _ from 'lodash';
import { MsgExecuteContract, MsgTransfer, toBase64, toUtf8, toHex } from 'secretjs'
import LottieAnimation from "lottie-vuejs/src/LottieAnimation.vue"; // import lottie-vuejs


export default {
  components: { SubChainSelector, TokenSelector},
  mounted() {
    this.$nextTick(() => {
      var connectedBefore = window.localStorage.getItem('connectedBefore');
      if (connectedBefore) {
        this.connect();
        this.connectMM();
      }
      this.$nuxt.$on('secretjs-loaded', async () => {
        console.log('Loaded!!!!');
        this.destinationAddress = this.receiverAccount.address;
        this.getBalance();
      });

      this.$nuxt.$emit('keystorechange', async () => {});

      this.fromSubChain = this.fromChain.subChains[0];
      this.toSubChain = this.toChain.subChains[0];

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
    }),
    walletOption() {
      return this.$route.query.uioption == "1";
    },
    styleObject() {
      return {
        '--color': "red",
        '--color-hover': "blue",
        '--width': '40px',
        '--width-hover': '150px'
      }
    },

    disableUI() {
      return !this.isKeplrConnected;
    },
    isKeplrConnected() {
      return this.sourceAddress != '';
    },   
    isMMConnected() {
      console.log(this.MMAccounts.length);
      return (this.MMAccounts && this.MMAccounts.length > 0);
    },
    shouldUseMMAddress() {
      return (this.selectedToken && this.selectedToken.hasOwnProperty("ERC20_address") && this.selectedToken.ERC20_address != "");
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
        return this.isMMConnected ? this.MMAccounts[0] : "";
      } else {
        let tmp = this.senderAccount;
        return (tmp) ? tmp.address : "";
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
          if (this.selectedToken.SNIP20_address != "" && this.tokenBalance) {
            if (this.tokenBalance.balance) {
              return (parseFloat(this.tokenBalance.balance.amount)/Math.pow(10, this.selectedToken.coinDecimals)).toFixed(4);
            }
          } else if (this.bankBalances.has(this.selectedToken.denom)) {
            return (parseFloat(this.bankBalances.get(this.selectedToken.denom)) / Math.pow(10, this.selectedToken.coinDecimals)).toFixed(4);
          } else if (this.selectedToken.ERC20_address != "") {
            return this.MMBalance;
          }
        }
      } catch (err) {
        console.log(err);
      }
      return 0;
    },
    showCurrentBalance() {
      if (this.selectedToken) {
        return this.getNormalizedCurrentBalance + " " + this.selectedToken.symbol;
      }
      return "";
    },

    MMSmallIconStyle() {
      let style = "margin-right: 10px;";
      style += this.isMMConnected ? '' : 'filter: grayscale(100%);';
      return style;
    },

    KeplrSmallIconStyle() {
      let style = "margin-right: 10px;";
      style += this.isKeplrConnected ? '' : 'filter: grayscale(100%);';
      
      return style;
    }

  },
  data() {
    return {
      itemIconSize: 24,

      fromChainIdx: 0,
      toChainIdx: 1,

      fromSubChain: null,
      toSubChain: null,

      selectedToken: null,
      amount: 0,
      
      destinationAddress: "",
      fromAccountName: "",

      ack: -1,
      tx: undefined,
      ibcTx: undefined,
    };
  },
  watch: {
    async selectedToken(token) {
      this.getBalance();
      if (!this.shouldUseMMAddress) {
        this.fromAccountName = "(" + (await window.keplr.getKey("pulsar-2")).name + ")";
      } else {
        this.fromAccountName = "";
      }
    },  
    fromSubChain(val) {

    }
  },
  methods: {
    connect(disconnect) {
      if (disconnect) {
        this.$store.dispatch('disconnectKeplr');
      } else {
        this.$store.dispatch('initKeplr', this.availableChains)
      }
    }, 
    connectMM() {
      this.$store.dispatch('connectMetaMask');
    },  
    getChainName(idx) {
      return this.getChainList[idx];
    },

    async getBalance() {
      if (this.senderAccount) {
        try {
          if (this.selectedToken.SNIP20_address) {
            let contract = { address: this.selectedToken.SNIP20_address, codeHash: this.selectedToken.SNIP20_code_hash};
            this.$store.dispatch('getTokenBalance', { account: this.senderAccount, contract, chainId: this.fromChain.chainId, walletAddress: this.sourceAddress });
          } else if (this.selectedToken.ERC20_address) {
            this.$store.dispatch('getMMBalance', { contract: this.selectedToken.ERC20_address, walletAddress: this.MMAccounts[0] });
          }
        } catch (err) {
          console.log("ERR1: ", err);
        }

        try {
          this.$store.dispatch('getBankBalance', { account: this.senderAccount, walletAddress: this.sourceAddress });
        } catch (err) {
          console.log("ERR2: ", err);
        }
      }
      

    }, 


    send() {
      let microAmount = (Math.round(parseFloat(this.amount) * Math.pow(10, parseInt(this.selectedToken.coinDecimals)))) + "";
      if (this.fromChain.out_port === 'transfer') {
        this.sendTransfer(microAmount); // To secret
      } else {
        this.sendWasm(microAmount); // from secret
      }
    },

    async sendTransfer(amount) {
      try {
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


        const tx = await this.senderAccount.tx.broadcast([msgTransfer], {
          gasLimit: 500_000,
          gasPriceInFeeDenom: 0.1,
          feeDenom: this.fromChain.stakeCurrency.coinMinimalDenom,
          ibcTxsOptions: {
            resolveResponses: true, // enable IBC responses resolution (defualt)
            resolveResponsesTimeoutMs: 12 * 60 * 1000, // stop checking after 12 minutes (default is 2 minutes)
            resolveResponsesCheckIntervalMs: 15_000 // check every 15 seconds (default)
          }
        });

        console.log(tx);

        this.tx = 'TX in source chain: ' + tx.transactionHash;
        this.ack = 0;
        this.ibcTx = 'Waiting for IBC ACK...';
        const ibcResponses = await Promise.all(tx.ibcResponses);
        this.ack = 1;
        this.ibcTx = 'IBC ACK: ' + ibcResponses[0].tx.transactionHash;
        console.log(ibcResponses);
        this.getBalance();

        return;
      } catch (err) {
        console.log(err);
      }
    },

    async sendWasm(amount) {
      this.tx = undefined;
      this.ack = -1;
      this.ibcTx = undefined;

      if (this.senderAccount) {
        let msgToSend = {
          sender: this.sourceAddress,
          contract_address: this.selectedToken.SNIP20_address,
          code_hash: this.selectedToken.SNIP20_code_hash,
          msg: {
            send: {
              recipient: this.fromChain.out_port.replace("wasm.", ""),
              recipient_code_hash: this.fromChain.ICS_code_hash,
              amount,
              msg: toBase64(
                toUtf8(
                  JSON.stringify({
                    channel: this.fromChain.out_channel,
                    remote_address: this.destinationAddress,
                    timeout: 10 * 60 // 10 minutes
                  })
                )
              )
            }
          }
        };
        console.log(msgToSend);
        
        try {
          this.tx = '';
          let tx = await this.senderAccount.tx.broadcast([new MsgExecuteContract(msgToSend)], {
            gasLimit: 300_000,
            gasPriceInFeeDenom: 0.1,
            feeDenom: 'uscrt',
            ibcTxsOptions: {
              resolveResponses: true, // enable IBC responses resolution (defualt)
              resolveResponsesTimeoutMs: 720_000,//12 * 60 * 1000, // stop checking after 12 minutes (default is 2 minutes)
              resolveResponsesCheckIntervalMs: 15_000 // check every 15 seconds (default)
            }
          });
          console.log(tx);
          this.tx = 'TX in source chain: ' + tx.transactionHash;
          this.ack = 0;
          this.ibcTx = 'Waiting for IBC ACK...';
          const ibcResponses = await Promise.all(tx.ibcResponses);
          this.ack = 1;
          if (ibcResponses.length > 0) {
            this.ibcTx = 'IBC ACK: ' + ibcResponses[0].tx.transactionHash;
          }
          console.log(ibcResponses);
        } catch (err) {
          this.tx = undefined;
          this.ack = -1;
          this.ibcTx = "";
          console.error(err);
        }
        this.getBalance();
      }
    },

    swapChains() {
      if (this.receiverAccount && this.senderAccount) {
        this.fromChainIdx = !this.fromChainIdx + 0;
        this.toChainIdx = !this.toChainIdx + 0;
        
        let tmp = _.cloneDeep(this.fromSubChain);
        this.fromSubChain = _.cloneDeep(this.toSubChain);
        this.toSubChain = tmp;
        this.amount = 0;
        this.destinationAddress = this.receiverAccount.address;
        

        if (this.fromSubChain.tokens.length > 0) {
          this.selectedToken = this.fromSubChain.tokens[0];
        }
      }
    }    
  }, // methods


};
</script>

