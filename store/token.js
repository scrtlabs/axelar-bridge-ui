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

export const getTokenBalance = async (secretJS, contract, chainId, walletAddress) => {
  var viewingKey = null;
  if (window?.keplr) {
      try {
          viewingKey = await getTokenViewingKey(contract.address, chainId, false);
      } catch (err) {
          console.error(err);
      }
  }
  
  console.log(walletAddress);

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