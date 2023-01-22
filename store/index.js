import { SecretNetworkClient } from 'secretjs'
import { getTokenBalance, getBankBalance } from './token'

import chains from './networksConfig-local.json'

export const state = () => ({
  accounts: {},
  keplrLoading: false,
  noKeplr: false,
  balance: 0,
  bankBalances: new Map()
});

export const actions = {
  initKeplr({ commit, state }, chains) {
    const suggestChain = async (chainInfo) => {
      console.log(chainInfo);
      var addChain = false
      try {
        await window.keplr.enable(chainInfo.chainId);
      } catch (err) {
        console.error(err)
        if (err.message.indexOf('no chain info') != -1) {
          addChain = true;
          console.log("AAA");
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

    const createSecretJSAccounts = async (chain) => {
      const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(chain.chainId)
      const signer = await keplrOfflineSigner.getAccounts()
      
      return new SecretNetworkClient({
        url: chain.rest,
        chainId: chain.chainId,
        wallet: keplrOfflineSigner,
        walletAddress: signer[0].address,
        encryptionUtils: window.getEnigmaUtils(chain.chainId),
      })
    }

    const keplrConnect = async (addEvent) => {
      addEvent = typeof addEvent == 'undefined' ? true : addEvent

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
          let accounts = {}
          for (var i = 0; i < chains.length; i++) {
            await suggestChain(chains[i])
            accounts[chains[i].chainId] = await createSecretJSAccounts(
              chains[i]
            )
          }
          commit('setAccounts', accounts);

          // Save an indication that the user already approved keplr so we won't
          // Pop-up a keplr window before he pressed the "connect wallet" at least one time
          window.localStorage.setItem('connectedBefore', '1')

          // Listen to keplr events when wallet change
          if (addEvent) {
            window.addEventListener('keplr_keystorechange', () => {
              keplrConnect(false)
              $nuxt.$emit('keystorechange')
            })
          }
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
    let balance = await getTokenBalance(
      payload.account,
      payload.contract,
      payload.chainId,
      payload.walletAddress
    )
    commit('updateBalance', balance)
  },

  async getTokenBalance({ commit, state }, payload) {
    let balance = await getTokenBalance(
      payload.account,
      payload.contract,
      payload.chainId,
      payload.walletAddress
    )
    commit('updateBalance', balance)
  },

  async getBankBalance({ commit, state }, payload) {
    let balances = await getBankBalance(
      payload.account,
      payload.walletAddress
    )
    commit('updateBankBalances', balances)
  },



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
  setNoKeplr(state, value) {
    state.noKeplr = value;
  },
  updateBalance(state, balance) {
    state.balance = balance;
  },
  updateBankBalances(state, balances) {
    console.log(balances);
    state.bankBalances = balances;
  },
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
  getBankBalances(state) {
    return state.bankBalances;
  }
}
