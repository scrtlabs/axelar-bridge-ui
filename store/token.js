const getTokenViewingKey = async (contractAddress, chainId, retry) => {
  var viewingKey = null;
  try {
      viewingKey = await window.keplr.getSecret20ViewingKey(chainId, contractAddress);
  } catch (err) {
      console.error(err);
      if (!retry) {
          await window.keplr.suggestToken(chainId, contractAddress);
          viewingKey = await getTokenViewingKey(true);
      }
  }
  return viewingKey;
};

export const checkIfTokenInKeplr = async (chainId, contractAddress) => {
  try {
    await window.keplr.getSecret20ViewingKey(chainId, contractAddress);
    return true;
  } catch (err) {}
  return false;
}


export const getTokenBalance = async (secretJS, contract, chainId, walletAddress, permit) => {
  if (permit) {
    const msg = {
      balance: { }
    };

    const result = await secretJS.query.compute.queryContract({
      contract_address: contract.address,
      code_hash: contract.codeHash,
      query: {
        with_permit: {
          query: msg,
          permit: permit
        },
      }
    });
    return result;
  } else {
    var viewingKey = null;
    if (window?.keplr) {
        try {
            viewingKey = await getTokenViewingKey(contract.address, chainId, false);
        } catch (err) {
            console.error(err);
        }
    }
    
    if (viewingKey) {
        const msg = {
            balance: {
                address: walletAddress,
                key: viewingKey
            }
        };
  
        const result = await secretJS.query.compute.queryContract({
            contract_address: contract.address,
            code_hash: contract.codeHash,
            query: msg
        });
        return result;
    } else {
        return -1;
    }
  }
};

export const getBankBalance = async (secretJS, address) => {
    let bankBalance = new Map();
    try {
        let result = await secretJS.query.bank.allBalances({ address: address });
        if (result.balances) {
          for (let i = 0; i < result.balances.length; i++) {
            bankBalance.set(result.balances[i].denom, result.balances[i].amount);
          }
        }
    } catch (err) {
        console.log("Balance Error:", err);
    }
    return bankBalance;
}

export const getPermit = async (chainId, contracts, address) => {
  let contractsString = contracts.join('_');
  var permKey = `perm_${chainId}_${contractsString}_${address}`;
  var permit = null;
  try {
      permit = JSON.parse(window.localStorage.getItem(permKey));
  } catch (err) {}
  
  if (!permit) {
      console.log('Loading new permit');
      try {                
          const result = await window.keplr.signAmino(
            chainId,
            address,
              {
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
              },
              {
                  preferNoSetFee: true,
                  preferNoSetMemo: true
              }
          );
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
        console.log("--- PERMIT ERROR ---")
        console.log(err)
        console.log("--- PERMIT ERROR ---")
      }            
  }
  return permit;
}