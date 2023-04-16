// axelarQuerySingleton.js
import { AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";

class AxelarQuerySingleton {
  constructor() {
    if (!AxelarQuerySingleton.instance) {
      this.axelarQuery = new AxelarQueryAPI({
        environment: process.env.NUXT_ENV_AXELAR_ENV,
      });
      AxelarQuerySingleton.instance = this;
    }
    return AxelarQuerySingleton.instance;
  }
}

const instance = new AxelarQuerySingleton();
Object.freeze(instance);

export default instance;
