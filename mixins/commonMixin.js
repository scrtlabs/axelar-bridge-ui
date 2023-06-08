export default {
  data() {
    return {
    };
  },
  methods: {
    toWei(value, unit = 'ether') {
      const units = {
        'wei':          '1',
        'kwei':         '1000',
        'babbage':      '1000',
        'femtoether':   '1000',
        'mwei':         '1000000',
        'lovelace':     '1000000',
        'picoether':    '1000000',
        'gwei':         '1000000000',
        'shannon':      '1000000000',
        'nanoether':    '1000000000',
        'nano':         '1000000000',
        'szabo':        '1000000000000',
        'microether':   '1000000000000',
        'micro':        '1000000000000',
        'finney':       '1000000000000000',
        'milliether':   '1000000000000000',
        'milli':        '1000000000000000',
        'ether':        '1000000000000000000',
        'kether':       '1000000000000000000000',
        'grand':        '1000000000000000000000',
        'mether':       '1000000000000000000000000',
        'gether':       '1000000000000000000000000000',
        'tether':       '1000000000000000000000000000000'
      };
    
      const unitValue = units[unit];
    
      if (!unitValue) {
        throw new Error(`Invalid unit: ${unit}`);
      }
    
      // Convert value to a number
      const numberValue = Number(value);

      // Count the number of decimal places in value
      const decimalPlaces = (numberValue.toString().split('.')[1] || "").length;

      // Multiply the value by 10^n, where n is the number of decimal places,
      // then remove the decimal point from the resulting string
      const valueAsBigIntString = numberValue.toFixed(decimalPlaces).replace('.', '');

      // Now we can use BigInt for the multiplication without losing precision
      const valueInWei = BigInt(valueAsBigIntString) * BigInt(unitValue);

      // Since we've multiplied by 10^n, we need to divide the result by 10^n to get the final result
      const finalResult = valueInWei / BigInt(10**decimalPlaces);
      return finalResult.toString();


    },
    getMicroAmount(selectedToken, amount) {
      if (selectedToken.coinDecimals > 16) {
        return this.toWei(amount);
      }
      return Math.round(parseFloat(amount) * Math.pow(10, selectedToken.coinDecimals));
    },
  }
};
