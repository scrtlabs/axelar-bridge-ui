const Web3 = require('web3');

import ABI from './erc20_abi.json';
import axelarConfig from './axelarConfig.json'
import { sha256 } from "@noble/hashes/sha256";
import { fromHex, toHex, toUtf8, toBase64 } from 'secretjs';

// Create a web3-compatible provider wrapper for MetaMask's EIP-1193 provider
function wrapProvider(provider) {
  const EventEmitter = require('events');
  const wrapped = new EventEmitter();
  // Proxy all methods from the original provider
  wrapped.request = provider.request.bind(provider);
  wrapped.send = provider.send ? provider.send.bind(provider) : undefined;
  wrapped.sendAsync = provider.sendAsync ? provider.sendAsync.bind(provider) : (payload, callback) => {
    provider.request({ method: payload.method, params: payload.params })
      .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
      .catch(err => callback(err));
  };
  // Do NOT call provider.on() — MetaMask's provider.on() is broken
  wrapped.isMetaMask = provider.isMetaMask;
  wrapped.selectedAddress = provider.selectedAddress;
  return wrapped;
}

const APP_TESTNET_CHAIN_ID = Web3.utils.toHex(11155111);
const APP_MAINNET_CHAIN_ID = Web3.utils.toHex(1);
const AVG_ETH_BLOCK_TIME_SEC = 15;

const ACTIVE_CHAIN_ID = APP_TESTNET_CHAIN_ID;


var _web3 = null;
var _wrappedProvider = null;

var _transactionTracker = null;
var _mmEventWasAdded = false;

export const addChain = async (chain) => {
  const params = [{
    "chainId": Web3.utils.toHex(parseInt(chain.chainId)),
    "chainName": chain.chainName,
    "rpcUrls": chain.rpcUrls,
    "nativeCurrency": chain.nativeCurrency,
    "blockExplorerUrls": chain.blockExplorerUrls
  }];

  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params,
    })
  } catch (error) {
  }

}


export const connectMM = async (chainId, chains) => {

  try {
    let selectedChain = 1;
    if (process.env.NUXT_ENV_AXELAR_ENV == "testnet") {
      selectedChain = chainId != -1 ? Web3.utils.toHex(chainId) : APP_TESTNET_CHAIN_ID
    } else {
      selectedChain = chainId != -1 ? Web3.utils.toHex(chainId) : APP_MAINNET_CHAIN_ID
    }

    if (window.ethereum) {
      console.log('[MM] Step 1: Requesting accounts...');
      await window.ethereum.request({method: 'eth_requestAccounts'});
      console.log('[MM] Step 2: Wrapping provider...');
      _wrappedProvider = wrapProvider(window.ethereum);
      console.log('[MM] Step 2b: wrapper.addListener exists?', typeof _wrappedProvider.addListener);
      console.log('[MM] Step 3: Creating Web3...');
      try {
        _web3 = new Web3(_wrappedProvider);
        console.log('[MM] Step 3: Web3 created OK, _web3 =', !!_web3);
      } catch (web3Err) {
        console.error('[MM] Step 3 FAILED:', web3Err);
        // Fallback: create Web3 without provider, then set provider separately
        _web3 = new Web3();
        console.log('[MM] Step 3b: Created empty Web3, setting provider manually');
      }
      console.log('[MM] Step 4: Switching chain to', selectedChain);
      await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{chainId: selectedChain}]
      });
      console.log('[MM] Step 5: Chain switched OK');

      if (!_mmEventWasAdded) {
        _mmEventWasAdded = true;
        // Wrap in try-catch — MetaMask's provider.on() is broken in some versions
        try {
          window.ethereum.on('accountsChanged', function (accounts) {
            console.log('accountsChanges', accounts);
            $nuxt.$emit('MM-account-changed', accounts);
          });
          window.ethereum.on('chainChanged', function(networkId){
            $nuxt.$emit('MM-network-changed', networkId);
          });
        } catch (evtErr) {
          console.warn('[MM] Could not register event listeners:', evtErr.message);
        }
      }
      console.log('[MM] Step 6: Emitting MM-connected');
      $nuxt.$emit('MM-connected');
    }
  } catch (err) {
      console.log(err);
      if (err.code === 4902 || (err.data && err.data.originalError.code === 4902)) {
        for (let i = 0; i < chains.length; i++) {
          try {
            if (chains[i].chainId == chainId) {
              await addChain(chains[i]);
              break;
            }
          } catch (err) {
            console.log(`Cannot add chain ${chains[i].chainName}`);
          }
        }
      }
  }
};

export const getMMAccounts = async () => {
  try {
    if (_web3) {
      let accounts = await _web3.eth.getAccounts();
      return accounts;
    }
  } catch (err) {
      console.log(err);
  }
  return [];
}

export const getMMContractBalance = async (contractAddress, address) => {

  try {
    var result = {
      amount: 0,
      decimals: 1
    }
    if (_web3) {
      const contract = new _web3.eth.Contract(ABI, contractAddress);
      result.decimals = await contract.methods.decimals().call();
      result.amount = await contract.methods.balanceOf(address).call();
      return result; //(parseInt(result) / Math.pow(10, decimals).toFixed(4));
    } else {
      console.error("MetaMask is not connected");
      return result;
    }
  } catch (err) {
    console.log(err);
  }
  return result;
}

export const getMMBankBalance = async (address) => {
  try {
    if (_web3 && address) {
        let balance = await _web3.eth.getBalance(address);
        return balance;
        //return parseFloat(_web3.utils.fromWei(balance)).toFixed(4);
    }
    return 0;
  } catch (err) {
    console.log(err);
  }
}

export const sendCoins = async (toAxelarAddress, from, amount) => {
  if (_web3) {
    try {
      _web3.eth.sendTransaction({
        from: from,
        to: toAxelarAddress,
          value: amount + ""
      })
      .on('transactionHash', function(hash){
        $nuxt.$emit('MM-TX', hash);
      })
      .on('receipt', function(receipt){
        $nuxt.$emit('MM-receipt', receipt);
      })
      .on('confirmation', function(confirmationNumber, receipt){
        $nuxt.$emit('MM-confirmation', {confirmationNumber, receipt});
      })
      .on('error', function(error, receipt) {
        $nuxt.$emit('MM-error', {error, receipt});
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export const sendMMTokens = async (contractAddress, toAxelarAddress, from, amount) => {
  try {
    let tx = "";
    let error = "";
    if (_web3) {
      const contract = new _web3.eth.Contract(ABI, contractAddress);
      try {
        contract.methods.transfer(toAxelarAddress, amount).send({ from })
        .on('transactionHash', function(hash){
          $nuxt.$emit('MM-TX', hash);
        })
        .on('confirmation', function(confirmationNumber, receipt){
          $nuxt.$emit('MM-confirmation', {confirmationNumber, receipt});
        })
        .on('receipt', function(receipt) {
          $nuxt.$emit('MM-receipt', receipt);
        })
        .on('error', function(error, receipt) {
          $nuxt.$emit('MM-error', {error, receipt});
        });
      } catch (err) {
        console.log(err);
        error = err;
      }
    }
  } catch (err) {
    console.log(err);
    error = err;
  }
}

// DistributionExecutable ABI for sendTo function
const DISTRIBUTION_ABI = [
  {
    "inputs": [
      { "name": "destinationChain", "type": "string" },
      { "name": "destinationAddress", "type": "string" },
      { "name": "destAddresses", "type": "address[]" },
      { "name": "symbol", "type": "string" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "sendTo",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Send ERC20 tokens from EVM to Secret Network via DistributionExecutable
// Flow: 1) Approve DistributionExecutable to spend tokens, 2) Call sendTo()
export const sendToSecret = async (params) => {
  const { erc20Address, distributionExecutable, from, amount, destinationChain, destinationAddress, denom, gasFeeWei } = params;

  if (!_web3) {
    console.error('MetaMask is not connected');
    return;
  }

  try {
    // Step 1: Approve DistributionExecutable to spend tokens
    console.log('[sendToSecret] Step 1: Approving', amount, 'tokens for', distributionExecutable);
    $nuxt.$emit('MM-status', 'Approving token transfer...');

    const erc20Contract = new _web3.eth.Contract(ABI, erc20Address);
    await erc20Contract.methods.approve(distributionExecutable, amount).send({ from });
    console.log('[sendToSecret] Approval confirmed');

    // Step 2: Call sendTo on DistributionExecutable
    console.log('[sendToSecret] Step 2: Calling sendTo -', destinationChain, destinationAddress, denom, amount);
    $nuxt.$emit('MM-status', 'Sending tokens to Secret Network...');

    const distContract = new _web3.eth.Contract(DISTRIBUTION_ABI, distributionExecutable);
    distContract.methods.sendTo(
      destinationChain,
      destinationAddress,
      [],       // empty destAddresses array
      denom,
      amount
    ).send({
      from,
      value: gasFeeWei  // ETH gas fee for cross-chain transfer
    })
    .on('transactionHash', function(hash) {
      console.log('[sendToSecret] TX hash:', hash);
      $nuxt.$emit('MM-TX', hash);
    })
    .on('confirmation', function(confirmationNumber, receipt) {
      $nuxt.$emit('MM-confirmation', {confirmationNumber, receipt});
    })
    .on('receipt', function(receipt) {
      console.log('[sendToSecret] Receipt:', receipt);
      $nuxt.$emit('MM-receipt', receipt);
    })
    .on('error', function(error, receipt) {
      console.error('[sendToSecret] Error:', error);
      $nuxt.$emit('MM-error', {error, receipt});
    });

  } catch (err) {
    console.error('[sendToSecret] Failed:', err);
    $nuxt.$emit('MM-error', {error: err, receipt: null});
  }
}

export const checkTxConfirmation = async (receipt) => {
  if (_transactionTracker) {
    clearInterval(_transactionTracker);
    _transactionTracker = null;
  }

  _transactionTracker = setInterval( async () => {
    if (_web3) {
      try {
        let currentBlock = await _web3.eth.getBlockNumber();
        // console.log("--- TEST ---")
        // console.log(currentBlock);
        // console.log(receipt);
        // console.log(receipt.blockNumber);
        let confirmations = (parseInt(currentBlock) - parseInt(receipt.blockNumber));
        // console.log(confirmations);
        // console.log("--- TEST ---")
        $nuxt.$emit('MM-confirmation-update', confirmations);
        if (confirmations >= 96) {
          $nuxt.$emit('MM-transfer-complete', receipt.transactionHash);
          clearInterval(_transactionTracker);
          _transactionTracker = null;
        } else if (confirmations > 40) {
          try {
            let status = await $nuxt.$axios.post(axelarConfig[process.env.NUXT_ENV_AXELAR_ENV]["axelarscan-api"], {
              txHash: receipt.transactionHash,
              size: 1
            });
            if (status) {
              try {
                if (status.data.error) {
                  // Do something?
                } else {
                  console.log("----- STATUS -----")
                  console.log(status.data);
                  console.log("----- STATUS -----")
                  if (status.data.data.length > 0) {
                    if (status.data.data[0].simplified_status && (status.data.data[0].simplified_status.toLowerCase() === "approved" || status.data.data[0].simplified_status.toLowerCase() === "received")) {
                      $nuxt.$emit('MM-transfer-complete', receipt.transactionHash);
                      clearInterval(_transactionTracker);
                      _transactionTracker = null;
                    } else {
                      $nuxt.$emit('MM-transfer-indication', receipt.transactionHash);
                    }
                  }
                }
              } catch (err) {
                console.log(err);
              }
            }

          } catch (err) {
            console.log("Axios", err);
          }
        }
      } catch (err) {
        console.log("Monitoring error:", err);
      }
    }

  }, AVG_ETH_BLOCK_TIME_SEC * 1000);
}

export const getPermitMM = async (wallet, chainId, contracts, address) => {
  let contractsString = contracts.join('_');
  var permKey = `perm_${chainId}_${contractsString}_${address}`;
  var permit = null;

  try {
    permit = JSON.parse(window.localStorage.getItem(permKey));
  } catch (err) {}

  if (!permit) {
      console.log('Loading new permit');
      try {
        const msg = {
            chain_id: chainId,
            account_number: '0',
            sequence: '0',
            fee: {
                amount: [{ denom: 'uscrt', amount: '0' }],
                gas: '1'
            },
            msgs: [
                {
                    type: 'query_permit',
                    value: {
                        permit_name: 'secret-bridge-balance',
                        allowed_tokens: contracts,
                        permissions: ['balance']
                    }
                }
            ],
            memo: ''
        }

        //TODO: Move it to secret.js (create permit for MetaMask wallet)
        const sortedObject = (obj) => {
          if (typeof obj !== "object" || obj === null) {
            return obj;
          }
          if (Array.isArray(obj)) {
            return obj.map(sortedObject);
          }
          const sortedKeys = Object.keys(obj).sort();
          const result = {};
          sortedKeys.forEach((key) => {
            result[key] = sortedObject(obj[key]);
          });
          return result;
        }

        const JsonSortedStringify = (obj) => {
          return JSON.stringify(sortedObject(obj));
        }

        const encodeSecp256k1Pubkey = (pubkey) => {
          if (pubkey.length !== 33 || (pubkey[0] !== 0x02 && pubkey[0] !== 0x03)) {
            throw new Error(
              "Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03",
            );
          }
          return {
            type: "tendermint/PubKeySecp256k1",
            value: toBase64(pubkey),
          };
        }


        const encodeSecp256k1Signature = (pubkey, signature) => {
          if (signature.length !== 64) {
            throw new Error(
              "Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s.",
            );
          }

          return {
            pub_key: encodeSecp256k1Pubkey(pubkey),
            signature: toBase64(signature),
          };
        }


        const messageHash = sha256(toUtf8(JsonSortedStringify(msg)));
        const sigResult = await window.ethereum.request({
          method: "eth_sign",
          params: [wallet.ethAddress, "0x" + toHex(messageHash)],
        });

        // strip leading 0x and trailing recovery id
        const sig = fromHex(sigResult.slice(2, -2));
        const result = {
          signed: msg,
          signature: encodeSecp256k1Signature(wallet.publicKey, sig),
        };

        permit = {
          params: {
            permit_name: 'secret-bridge-balance',
            allowed_tokens: contracts,
            chain_id: chainId,
            permissions: ['balance']
          },
          signature: result.signature
        }
        window.localStorage.setItem(permKey, JSON.stringify(permit));

      } catch (err) {
        if (typeof err === "object") {
          alert(JSON.stringify(err));
        } else {
          alert(err);
        }


        console.log("--- PERMIT ERROR ---")
        console.log(err)
        console.log("--- PERMIT ERROR ---")
      }
  }
  return permit;
}
