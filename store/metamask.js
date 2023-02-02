const Web3 = require('web3');

import ABI from './erc20_abi.json';

const APP_TESTNET_CHAIN_ID = Web3.utils.toHex(5);
const APP_MAINNET_CHAIN_ID = Web3.utils.toHex(1);

const ACTIVE_CHAIN_ID = APP_TESTNET_CHAIN_ID;

var _web3 = null;


export const getMMAccounts = async () => {
    try {
        if (window.ethereum) {
            _web3 = new Web3(window.ethereum);
            //await window.ethereum.enable();
            let accounts = await _web3.eth.getAccounts();
            await _web3.currentProvider.request({
                method: "wallet_switchEthereumChain",
                params: [{chainId: ACTIVE_CHAIN_ID}]
            });
            return accounts;
        }
    } catch (err) {
        console.log(err);
    }
    return [];
}

export const getMMContractBalance = async (contractAddress, address) => {
    try {
        if (_web3) {
            const contract = new _web3.eth.Contract(ABI, contractAddress);
            let decimals = await contract.methods.decimals().call();
            let result = await contract.methods.balanceOf(address).call();
            return (parseInt(result) / Math.pow(10, decimals).toFixed(4));
        } else {
            console.error("MetaMask is not connected");
            return 0;
        }
    } catch (err) {
        console.log(err);
    }
    return 0;
    
}