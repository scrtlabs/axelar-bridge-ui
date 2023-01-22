<template>
  <div style="position: relative; display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh">
    <div style="position: absolute; top: 10px; right: 10px">
      <v-btn @click="connect(sourceAddress != '')">{{ sourceAddress == '' ? 'Connect Wallet' : 'Disconnect' }}</v-btn>
    </div>
    <div class="main-section">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px">Secret Bridge</div>
      <!-- From & To Start -->
      <div style="background-color: transparent; display: flex; justify-content: space-between; width: 100%; gap: 10px">
        <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
          <sub-chain-selector lable="From" v-model="fromSubChain" :chain="fromChain" :icon-size="itemIconSize" ></sub-chain-selector>
        </div>

        <div style="display: flex; flex-grow: 1; justify-content: center; align-items: center;">
          <v-btn @click="swapChains">⮀</v-btn>
        </div>
        
        <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
          <sub-chain-selector lable="To" v-model="toSubChain" :chain="toChain" :icon-size="itemIconSize" ></sub-chain-selector>
        </div>
      </div>
      <!-- Fron & To End -->

      <div v-if="fromSubChain != null" style="background-color: #141924; display: flex; flex-direction: column; width: 100%; border-radius: 10px; padding: 10px">
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
          <div style="margin-bottom: 5px">From address: ({{ fromAccountName }})</div>
          <div>
            <v-text-field disabled class="address-input pa-0 ma-0" color="orange" flat  dense label=""  :value="sourceAddress" ></v-text-field>
          </div>
          <div style="margin-bottom: 5px">To address:</div>
          <div>
            <v-text-field class="address-input pa-0 ma-0" background-color="#000000" color="orange" flat  dense label=""  v-model="destinationAddress" ></v-text-field>
          </div>
        </div>
      </div>

    
      <div style="margin: 20px">
        <v-btn @click="send">Transfer</v-btn>
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
</template>



<style scoped>
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


</style>

<script>
import { mapGetters } from 'vuex';
import SubChainSelector from '~/components/SubChainSelector.vue';
import TokenSelector from '~/components/TokenSelector.vue';
import _ from 'lodash';
import { MsgExecuteContract, MsgTransfer, toBase64, toUtf8, toHex } from 'secretjs'
// import { sha256 } from "@noble/hashes/sha256";


export default {
    components: { SubChainSelector, TokenSelector },
  mounted() {
    this.$nextTick(() => {
      var connectedBefore = window.localStorage.getItem('connectedBefore');
      if (connectedBefore) {
        this.connect();
      }
      this.$nuxt.$on('secretjs-loaded', async () => {
        console.log('Loaded!!!!');
        this.fromAccountName = (await window.keplr.getKey("pulsar-2")).name;
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
      bankBalances: 'getBankBalances'
    }),
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
      let tmp = this.senderAccount;
      return (tmp) ? tmp.address : "";
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
      if (this.selectedToken) {
        if (this.selectedToken.SNIP20_address != "" && this.tokenBalance) {
          return this.tokenBalance.balance.amount;
        } else if (this.bankBalances.has(this.selectedToken.denom)) {
          return (parseFloat(this.bankBalances.get(this.selectedToken.denom)) / Math.pow(10, this.selectedToken.coinDecimals)).toFixed(4);
        }
      }
      return 0;
    },
    showCurrentBalance() {
      if (this.selectedToken) {
        return this.getNormalizedCurrentBalance + " " + this.selectedToken.symbol;
      }
      return "";
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
    selectedToken(token) {
      this.getBalance();
      // console.log("!!!!!")  
      // console.log(JSON.stringify(token, null, 2));
      // console.log("!!!!!")  
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
    getChainName(idx) {
      return this.getChainList[idx];
    },

    async getBalance() {
      if (this.senderAccount) {
        try {
          if (this.selectedToken.SNIP20_address) {
            let contract = { address: this.selectedToken.SNIP20_address, codeHash: this.selectedToken.SNIP20_code_hash};
            this.$store.dispatch('getTokenBalance', { account: this.senderAccount, contract, chainId: this.fromChain.chainId, walletAddress: this.sourceAddress });
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
  }, // methods


};
</script>

<style>
.main-section {
  width: 600px !important;
  height: 650px !important;
  background-color: #1b212f;
  border-radius: 20px;
  padding: 20px;

  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
