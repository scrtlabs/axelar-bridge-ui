import { SecretNetworkClient } from 'secretjs'
import { getTokenBalance, getBankBalance, getPermit } from './token'
import { connectMM, getMMAccounts, getMMContractBalance, getMMBankBalance, sendMMTokens, checkTxConfirmation, sendCoins } from './metamask'

const SITE_ENV = process.env.NUXT_ENV_AXELAR_ENV;

import chainsMainnet from './networksConfig-mainnet.json'
import chainsTestnet from './networksConfig-testnet.json'

var chains = SITE_ENV == "mainnet" ? chainsMainnet : chainsTestnet;
var _getTokenDebounce = false;

var mobileAndTabletCheck = function () {
  let check = false;
  (function (a) {
      if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
              a
          ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
              a.substr(0, 4)
          )
      )
          check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  
  if (window.fina)
    check = true;

  return check;
};

export const state = () => ({
  accounts: {},
  keplrLoading: false,
  noKeplr: false,
  balance: 0,
  bankBalances: new Map(),

  MMAccounts: [],
  MMbalance: 0,
  MMTx: {tx: "", error: ""},

  keplrEventWasAdded: false
});

export const actions = {
  initKeplr({ commit, state, getters }, selectedChain) {

    const suggestChain = async (chainInfo) => {
  
      var addChain = false
      try {
        await window.keplr.enable(chainInfo.chainId);
      } catch (err) {
        console.error(err)
        if (err.message.indexOf('no chain info') != -1) {
          addChain = true;
        } else {
          return
        }
      }

      if (addChain) {
        await window.keplr.experimentalSuggestChain({
          rpc: chainInfo.rpcUrl,
          rest: chainInfo.rest,
          chainId: chainInfo.chainId,
          chainName: chainInfo.chainId,
          stakeCurrency: {
            coinDenom: chainInfo.stakeCurrency.coinDenom,
            coinMinimalDenom: chainInfo.stakeCurrency.coinMinimalDenom,
            coinDecimals: chainInfo.stakeCurrency.coinDecimals,
            coinGeckoId: chainInfo.hrp,
          },
          bip44: {
            coinType: chainInfo.coinType,
          },
          bech32Config: {
            bech32PrefixAccAddr: chainInfo.hrp,
            bech32PrefixAccPub: chainInfo.hrp + 'pub',
            bech32PrefixValAddr: chainInfo.hrp + 'valoper',
            bech32PrefixValPub: chainInfo.hrp + 'valoperpub',
            bech32PrefixConsAddr: chainInfo.hrp + 'valcons',
            bech32PrefixConsPub: chainInfo.hrp + 'valconspub',
          },
          currencies: [
            {
              coinDenom: chainInfo.stakeCurrency.coinDenom,
              coinMinimalDenom: chainInfo.stakeCurrency.coinMinimalDenom,
              coinDecimals: chainInfo.stakeCurrency.coinDecimals,
              coinGeckoId: chainInfo.hrp,
              },
          ],
          feeCurrencies: [
            {
              coinDenom: chainInfo.stakeCurrency.coinDenom,
              coinMinimalDenom: chainInfo.stakeCurrency.coinMinimalDenom,
              coinDecimals: chainInfo.stakeCurrency.coinDecimals,
              coinGeckoId: chainInfo.hrp,
              },
          ],
          gasPriceStep: { low: 0.1, average: 0.25, high: 0.3 },
          features: ['secretwasm'],
        })
      }
    }

    const createSecretJSAccounts = async (chainInfo) => {
      const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(chainInfo.chainId)
      const signer = await keplrOfflineSigner.getAccounts()

      return new SecretNetworkClient({
        url: chainInfo.rest,
        chainId: chainInfo.chainId,
        wallet: keplrOfflineSigner,
        walletAddress: signer[0].address,
        encryptionUtils: window.getEnigmaUtils(chainInfo.chainId),
      })
    }

    const getCosmosChainsInfo = () => {
      let chainsInfo = {};
      chainsInfo[chains["main-chain"][0].chainInfo.chainId] = chains["main-chain"][0].chainInfo;
      for (let i = 0; i < chains["sub-chains"].length; i++) {
        if (chains["sub-chains"][i].type === "cosmos") {
          chainsInfo[chains["sub-chains"][i].chainInfo.chainId] = chains["sub-chains"][i].chainInfo;
        }
      }
      return chainsInfo;
    }

    const keplrConnect = async () => {
      // Add indication for UI when keplr is loading
      commit('setKeplrLoading', true)

      // Check if the browser has keplr wallet extension
      if (
        !window.keplr ||
        !window.getEnigmaUtils ||
        !window.getOfflineSignerOnlyAmino
      ) {
        console.log('Cannot find Keplr wallet')
        commit('setKeplrLoading', false)
        commit('setNoKeplr', true)
      } else {
        try {

          let accounts = _.cloneDeep(state.accounts);
          await suggestChain(selectedChain);
          accounts[selectedChain.chainId] = await createSecretJSAccounts(selectedChain);

          let cosmosChains = getCosmosChainsInfo();
          let accountsChainIds = Object.keys(accounts);
          for (let i = 0; i < accountsChainIds.length; i++ ) {
            if (accountsChainIds[i] !== selectedChain.chainId) { // Already connected 
              accounts[accountsChainIds[i]] = await createSecretJSAccounts(cosmosChains[accountsChainIds[i]]);
            }
          }
          commit('setAccounts', accounts);
          // Save an indication that the user already approved keplr so we won't
          // Pop-up a keplr window before he pressed the "connect wallet" at least one time
          window.localStorage.setItem('connectedBefore', '1')

          // Listen to keplr events when wallet change
          if (!state.keplrEventWasAdded) {
            commit('setKeplrEventWasAdded', true);            
            window.addEventListener('keplr_keystorechange', () => {
              keplrConnect()
            })
          }
          $nuxt.$emit('keystorechange');          
        } catch (err) {
          console.log(err.message)
          console.log(
            'Cannot connect to your wallet<br>Please make sure Keplr is installed properly'
          )
        }
        commit('setKeplrLoading', false)
      }
    }
    keplrConnect()
  },

  async disconnectKeplr({ commit, state }) {
    window.localStorage.removeItem('connectedBefore');
    window.location.reload();
  },

  async getTokenBalance({ commit, state }, payload) {
    if (_getTokenDebounce) {
      return;
    }
    _getTokenDebounce = true;

    let contracts = [];
    for (let i = 0; i < chains["main-chain"][0].tokens.length; i++) {
      let token = chains["main-chain"][0].tokens[i];
      if (token.SNIP20_address != "") {
        contracts.push(token.SNIP20_address);
      }
    }

    let permit = await getPermit(chains["main-chain"][0].chainInfo.chainId, contracts ,payload.walletAddress);
    let balance = await getTokenBalance(
      payload.account,
      payload.contract,
      payload.chainId,
      payload.walletAddress,
      permit
    )
    commit('updateBalance', balance);

    setTimeout(function() {
      _getTokenDebounce = false;
    }, 400);
  },

  // async getTokenBalance({ commit, state }, payload) {
  //   let balance = await getTokenBalance(
  //     payload.account,
  //     payload.contract,
  //     payload.chainId,
  //     payload.walletAddress
  //   )
  //   commit('updateBalance', balance)
  // },

  async getBankBalance({ commit, state }, payload) {
    let balances = await getBankBalance(
      payload.account,
      payload.walletAddress
    )
    commit('updateBankBalances', balances)
  },

  async getMMBankBalance({ commit, state }, payload) {
    try {
      let bankBalance = new Map();
      let result = await getMMBankBalance(payload.walletAddress);
      bankBalance.set(payload.denom, result);
      commit('updateBankBalances', bankBalance)
    } catch (err) {}
  },


  async getMMBalance({ commit, state }, payload) {
    let balance = await getMMContractBalance(
      payload.contract,
      payload.walletAddress
    );
    commit('updateMMBalance', balance)
  },

  async getMMAccounts({commit, state}) {
    let accounts = await getMMAccounts();
    commit('updateMMAccounts', accounts);
  },

  async connectMetaMask({commit, state, getters}, payload) {
    let subChains = chains["sub-chains"];
    let selectedChains = [];
    for (let i = 0; i < subChains.length; i++) {
      if (subChains[i].type === "evm") {
        selectedChains.push(subChains[i].chainInfo);
      }
    }

    await connectMM(payload.chainId, payload.addEvent, selectedChains);
  },

  async sendMMTokens({commit, state}, payload) {
    sendMMTokens(payload.contract, payload.walletAddress, payload.from, payload.amount);
    //commit('updateMMTx', tx)
  },

  async sendCoins({commit, state}, payload) {
    sendCoins(payload.walletAddress, payload.from, payload.amount);
    //commit('updateMMTx', tx)
  },


  checkTxConfirmation({ commit, state}, receipt) {
    checkTxConfirmation(receipt);
  }

  

}

export const mutations = {
  setAccounts(state, obj) {
    state.accounts = obj;

    setTimeout(() => {
      $nuxt.$emit('secretjs-loaded')
    }, 1000)
  },
  setKeplrLoading(state, loading) {
    state.keplrLoading = loading;
  },
  setKeplrEventWasAdded(state, value) {
    state.keplrEventWasAdded = value;
  },
  setNoKeplr(state, value) {
    state.noKeplr = value;
  },
  updateBalance(state, balance) {
    state.balance = balance;
  },
  updateBankBalances(state, balances) {
    //console.log(balances);
    state.bankBalances = balances;
  },
  updateMMAccounts(state, accounts) {
    state.MMAccounts = accounts;
  },
  updateMMBalance(state, balance) {
    state.MMbalance = balance;
  },
  updateMMTx(state, tx) {
    state.MMTx = tx;
  }

}

export const getters = {
  getNoKeplr(state) {
    return state.noKeplr
  },
  getKeplrLoading(state) {
    return state.keplrLoading
  },
  getAccounts(state) {
    return state.accounts
  },
  getBalance(state) {
    return state.balance
  },
  getChains(state) {
    return chains
  },
  // getSubChains(state) {
  //   let subChains = [];
  //   for (let c of chains) {
  //     for (let i = 0; i < c["sub-chains"].length; i++) {
  //       subChains.push(c["sub-chains"][i]);
  //     }
  //   }
  //   return subChains;
  // },  

  // getSubChainsMobile(state) { // for mobile
  //   let subChains = [];
  //   for (let c of chains) {
  //     for (let i = 0; i < c["sub-chains"].length; i++) {
  //       let sChain = c["sub-chains"][i];
  //       sChain.chainId = c.chainInfo.chainId;
  //       subChains.push(sChain);
  //     }
  //     //subChains = subChains.concat(c.subChains);
  //   }
  //   return subChains;
  // },  
  getBankBalances(state) {
    return state.bankBalances;
  },
  getMMAccounts(state) {
    return state.MMAccounts;
  },
  getMMBalance(state) {
    return state.MMbalance;
  },
  getMMTx(state) {
    return state.MMTx;
  },
  isMobile(state) {
    var isMobile = mobileAndTabletCheck();
    
    // if (state.windowWidth <= '1145') {
    //     isMobile = true;
    // }
    return isMobile;
  },

}
