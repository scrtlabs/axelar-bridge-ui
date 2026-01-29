<template>
  <div>
    <v-dialog  v-model="showMigrationDialog" persistent width="460" height="260">
      <div class="migration-dialog">
        <div style="width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div style="width: 100%; font-size: 20px; font-weight: bold; padding: 5px  10px 5px 15px;  margin-bottom: 10px; background-color: black; display: flex; justify-content: space-between;">
            <div>Token Migration</div>
            <div>
              
              <v-btn icon dense x-small @click="tokenMigrationHelp = !tokenMigrationHelp">
                <v-icon size="16">mdi-help</v-icon>
              </v-btn>

              <v-btn icon dense x-small @click="closeMigrationWindow()">
                <v-icon size="16">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <template v-if="tokenMigrationHelp === false">
            <template v-if="tokenMigrationCompleteSuccess === false">
              <div>
                <v-select :disabled="tokenMigrationInProgress || migrationTokens === null || migrationTokens.length < 1" label="Select Token" item-color="orange" background-color="rgba(0,0,0,0.5)" flat solo :items="migrationTokens" dense item-text="name" return-object @change="handleTokenMigrationChange" style="max-width: 300px;">
                  <template slot="selection" slot-scope="data">
                    <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; font-size: 16px; ">
                      <div><img :src="require(`~/assets/chains/${data.item.src_network.toLowerCase() === 'ethereum' ? 'ethereum.logo.svg' : 'binance.logo.svg'}`)" :width="24" :height="24" /></div>
                      <div style="font-family: 'BalsamiqSans-Regular' !important;">{{ data.item.name }}</div>
                    </div>
                  </template>
                  <template slot="item" slot-scope="data">
                    <div style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; font-size: 16px; ">
                      <div><img :src="require(`~/assets/chains/${data.item.src_network.toLowerCase() === 'ethereum' ? 'ethereum.logo.svg' : 'binance.logo.svg'}`)" :width="24" :height="24" /></div>
                      <div style="font-family: 'BalsamiqSans-Regular' !important;">{{ data.item.name }}</div>
                    </div>
                  </template>
                </v-select>

                <div style=" margin-top: -24px; margin-bottom: 30px; font-size: 10px; text-align: end">Balance: {{ tokenMigrationBalanceCheck ? 'refreshing...' : (tokenMigrationBalance < 0 ? 'unknown' : tokenMigrationBalanceDisplay) }}</div>
                <v-text-field
                  :disabled="tokenMigrationInProgress"
                  class="right-input number-input"
                  type="number"
                  style="font-family: 'BalsamiqSans-Regular' !important"
                  color="orange"
                  v-model="migrationAmount"
                  label="Amount"
                  
                  flat
                  dense
                    @focus="$event.target.select()"
                >
                <template slot="append">
                  <v-btn :disabled="tokenMigrationInProgress || tokenMigrationBalance < 1" dense x-small style="margin-left: 10px" @click="migrationAmount = tokenMigrationBalanceDisplay">MAX</v-btn>
                </template>
              </v-text-field>

            </div>

            <v-btn color="orange" :disabled="tokenMigrationInProgress || tokenMigrationBalance < 1 || migrationAmount <= 0" @click="doMigration()" rounded>{{ tokenMigrationInProgress ? "Processing..." : "Migrate" }}</v-btn>
            <div v-if="tokenMigrationError != ''" style="margin-top: 5px; color: rgb(238, 132, 132)">{{ tokenMigrationError }}</div>

            </template>
            <template v-else>
              <div style="font-size: 30px; font-weight: bold">Migration Complete!</div>
              <div style="margin-top: -40px">
                <lottie-wrapper
                  style=""
                  :speed="1"
                  :height="200"
                  :loop="false"
                  :path="require('../assets/animations/success.json')"
                />
              </div>
              <div style="margin-top: -40px">Updated Balance: {{  tokenMigrationBalanceNew }}</div>
            </template>            

          </template> <!-- tokenMigrationHelp -->
          <template v-else>
            <div style="padding: 10px; font-size: 14px; line-height: 18px; overflow-y: scroll; height: 200px">
              <span style="font-size: 20px; font-weight: bold;">Greetings, folks!</span><br><br>
              As you may have already heard, we are phasing out our old <a style="color: white; font-weight: bold;" href="https://bridge.scrt.network/tokens" target="_blank">Ethereum-Secret bridge</a>.
              But there's no need for concern—we've got everything arranged for a smooth transition.<br>
              To simplify the process, we've established a migration window allowing for the safe and straightforward migration of your tokens.
              <br><br><b>How do you go about this?</b> Simply select the asset you wish to migrate, enter the amount, and hit the "Migrate" button. It really is as simple as it sounds.
              <br><br><b>What happens behind the scenes?</b> Utilizing the Axelar bridge, we'll generate a new synthetic token that links Ethereum and Secret, bearing a different ticker from the previous one.
              <br><br><b>And what does this mean for you?</b> Essentially, nothing changes. You retain the original token with the same value.
              <div style="width: 100%; display: flex; justify-content: center; margin-top: 20px">
                <v-btn @click="tokenMigrationHelp = false" color="success" rounded>Ok, I got it</v-btn>
              </div>

            </div>
          </template>
        </div>
      </div>
    </v-dialog>

    <div
      class="main"
      style="position: relative; flex-direction: column; display: flex; justify-content: flex-start; align-items: center; width: 100vw; height: 100vh"
    >

      <!-- Squid Router Migration Banner -->
      <div class="squid-banner">
        <div class="squid-banner-content">
          <div class="squid-banner-left">
            <div class="squid-banner-title">⚠️ Service Update</div>
            <div class="squid-banner-message">
              <strong>Bridging from Secret to EVM chains is not yet available</strong>. We are working to resolve the issue with Axelar team.
            </div>
          </div>
        </div>
      </div>

      <lottie-wrapper
        style="position: absolute; top: 410px; left: 90px; z-index: 2"
        :speed="0.5"
        :height="200"
        :path="require('../assets/animations/flame.json')"
      />
      <div class="mountain"></div>

      <div class="main-section-wrapper">
        <div class="wallet-item-container">
          <div :style="styleObject" class="wallet-item" @click="connect()">
            Keplr
            <img :src="require('~/assets/wallets/kepler.logo.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 5px" alt="keplr logo"/>
            <div :class="isKeplrConnected ? 'green-dot' : 'red-dot'"></div>
          </div>

          <div :style="styleObject" class="wallet-item" @click="connectMM()">
            MetaMask
            <img :src="require('~/assets/wallets/metamask.logo.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 5px" alt="metamask logo"/>
            <div :class="isMMConnected ? 'green-dot' : 'red-dot'"></div>
          </div>

          <div :style="styleTroubleshootingObject" class="wallet-item">
            <div style="display: flex; align-items: center; margin-top: 8px; font-size: 16px">
              Help
              <img :src="require('~/assets/images/info-icon.svg')" width="24" height="24" style="margin-left: 10px; margin-right: 10px" alt="info icon" />
            </div>
            <div style="padding: 10px; display: flex; flex-direction: column; gap: 5px">
              <v-btn @click="page = page == 1 ? 0 : 1" >FAQ</v-btn>
              <v-btn @click="goToAxelar" >Axelarscan</v-btn>
              <v-btn @click="clearPermit" :disabled="clearPermitText != 'Clear Permit'">{{ clearPermitText }}</v-btn>
              <v-btn @click="switchSite" :color="isTestnet ? '#892323' : '#61a722'" >{{ isTestnet ? "MAINNET" : "TESTNET" }}</v-btn>
            </div>
            <!-- <div style="position: absolute; top: 40px; width: 100%; height: 200px; background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(7px);"></div> -->
          </div>

          <!-- <div :style="styleSurgeObject" class="wallet-item">
            <div style="display: flex; align-items: center; margin-top: 8px; font-size: 16px;">
              Surge
              <img :src="require('~/assets/images/surge-icon.webp')" width="24" height="24" style="margin-left: 10px; margin-right: 10px" alt="info icon" />
            </div>
            <div style="padding: 10px; display: flex; flex-direction: column; gap: 5px">
              <v-btn @click="goToWeb('https://app.shadeprotocol.io/swap/pools')" >Shade</v-btn>
              <v-btn @click="goToWeb('https://app.sienna.network/swap/pool')">Sienna</v-btn>
              <v-btn @click="goToWeb('https://secretswap.net/pool#Provide')">SecretSwap 2.0</v-btn>
            </div>
          </div> -->

          <div :style="styleTokenMigrationObject" class="wallet-item">
            <div style="display: flex; align-items: center; margin-top: 8px; font-size: 16px; white-space: nowrap;">
              Token Migration
              <img :src="require('~/assets/images/swap-button.webp')" width="24" height="24" style="margin-left: 10px; margin-right: 10px" alt="info icon" />
            </div>
            <div style="padding: 10px; display: flex; flex-direction: column; gap: 5px; width: 100%">
              <v-btn  :disabled="!isKeplrConnected" @click="showMigrationDialog = true">Migrate</v-btn>
            </div>
          </div>


        </div>

        <div style="position: absolute; top: -30px; right: -150px; z-index: 1">
          <lottie-wrapper
            v-if="showArrowComputed"
            style="filter: invert(48%); transform: scaleX(-1); z-index: 2"
            :speed="1"
            :height="200"
            :loop="false"
            :path="require('../assets/animations/arrow.json')"
          />
          <transition name="fade">
            <img
              v-show="showArrowText && showArrowComputed"
              style="position: absolute; filter: invert(48%); top: 135px; left: 75px; width: 150px"
              :src="require('~/assets/animations/connect-wallets.webp')"
              alt="arrow pointing to connect wallet buttons"
            />
          </transition>
        </div>

        <template v-if="selectedToken">
          <div class="input-coin" id="input-coin">
            <img :src="require('~/assets/tokens/3d/input/' + selectedToken.fromImage)" style="width: 100px" alt="token used to animate source network"/>
          </div>

          <div class="output-coin" id="output-coin">
            <img :src="require('~/assets/tokens/3d/output/' + selectedToken.toImage)" style="width: 90px" alt="token used to animate destination network" />
          </div>
        </template>

        <div class="right-cave" />
        <div class="left-cave" />

        <div class="input-sign" v-if="fromChain != undefined">
          <svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 185 156"
            style="enable-background: new 0 0 185 156"
            xml:space="preserve"
          >
            <style type="text/css">
              .st0 {
                fill: none;
                stroke: none;
                stroke-miterlimit: 10;
              }
            </style>
            <path id="SVGID_x5F_1_x5F_" class="st0" d="M27.8,61.3c64.5-16.4,129.5-5.4,129.5-5.4" />
            <text>
              <textPath class="input-name" xlink:href="#SVGID_x5F_1_x5F_" startOffset="5.0884%">{{ shortNetworkName(fromChain.name) }}</textPath>
            </text>
          </svg>

          <!-- <div class="input-name"> {{ fromChain.name }}</div> -->
        </div>
        <div class="output-sign" v-if="toChain != undefined">
          <svg version="1.1" x="0px" y="0px" viewBox="0 0 185 156" style="enable-background: new 0 0 185 156" xml:space="preserve">
            <style type="text/css">
              .st1 {
                fill: red;
                stroke: none;
                stroke-miterlimit: 10;
              }
            </style>
            <path id="SVGID_x5F_1_x5F_2" class="st0" d="M35.6,56.1c32.1-5.9,111.6-1.5,133,4.7" />
            <text>
              <textPath class="output-name" startOffset="27.4042%" href="#SVGID_x5F_1_x5F_2">{{ shortNetworkName(toChain.name) }}</textPath>
            </text>
          </svg>
        </div>

        <div class="testnet-indicator" v-if="isTestnet">TESTNET</div>
        <!-- <div class="testnet-indicator" style="width: 180px" v-else>!! MAINNET - REAL MONEY !!</div> -->
        <div class="main-section">
          <div class="main-section-tab"  :style="tabStyleObject">
          <div v-if="disableUI" class="main-section-disable"></div>
          <!-- From & To Start -->
          <div style="background-color: transparent; display: flex; justify-content: space-between; width: 100%; gap: 10px">
            <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
              <sub-chain-selector :disabled="transferInProgress" lable="From" v-model="fromChain" :chains="filteredFromChains" :icon-size="itemIconSize"></sub-chain-selector>
            </div>

            <div style="display: flex; flex-grow: 1; justify-content: center; align-items: center">
              <v-btn @click="swapChains(true)" :disabled="disableUI" icon width="70" height="70">
                <img :src="require('~/assets/images/swap-button.webp')" width="60" height="60" alt="swap token button" />
              </v-btn>
            </div>

            <div style="background-color: transparent; flex-grow: 2; max-width: 40%">
              <sub-chain-selector :disabled="transferInProgress" lable="To" v-model="toChain" :chains="filteredToChains" :icon-size="itemIconSize"></sub-chain-selector>
            </div>
          </div>
          <!-- From & To End -->

          <div v-if="fromChain != null" class="assets-to-transfer" style="">
            <div style="display: flex; justify-content: space-between">
              <div style="font-family: 'BalsamiqSans-Regular">Asset to transfer:</div>
              <div>
                <v-btn :disabled="transferInProgress || getNormalizedCurrentBalance == -1 " dense x-small @click="amount = getNormalizedCurrentBalance">MAX</v-btn>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 10px">
              <div style="display: flex; align-items: flex-start; gap: 10px">
                <token-selector :disabled="transferInProgress" :tokens="fromChain.tokens" :icon-size="itemIconSize" v-model="selectedToken" :to="toChain" style="max-width: 200px"></token-selector>
                <v-tooltip top  v-if="allowUnwrap">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon style="margin-top: 5px" v-bind="attrs" v-on="on">mdi-information</v-icon>
                  </template>
                  <span>This asset can be auto-unwrap to native coin</span>
                </v-tooltip>

                <v-tooltip top  v-if="!isValidTransferAsset">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon style="margin-top: 5px" color="orange" v-bind="attrs" v-on="on">mdi-alert-rhombus</v-icon>
                  </template>
                  <span>This asset cannot be transferred to the selected network</span>
                </v-tooltip>

                <v-tooltip top v-if="tokenInKeplr !== -1">
                  <template v-slot:activator="{ on, attrs }">
                    <img :disabled="tokenInKeplr === true" @click="addAssetToKeplr" v-bind="attrs" v-on="on" :src="require('~/assets/wallets/kepler.logo.svg')" width="20" height="20" style="cursor: pointer; margin-top: 7px" :style="tokenInKeplr === true ? 'filter: grayscale(100%);' : ''" alt="keplr logo"/>
                  </template>
                  <span>{{ tokenInKeplr === true ? "Asset already in your Keplr wallet" : "Add asset to Keplr wallet" }}</span>
                </v-tooltip>


              </div>
              <v-text-field
                :disabled="transferInProgress"
                class="right-input number-input"
                type="number"
                style="max-width: 150px; font-family: 'BalsamiqSans-Regular' !important"
                color="orange"
                background-color="rgba(0,0,0,0.5)"
                label="Amount"
                solo
                flat
                v-model="amount"
                dense
                 @focus="$event.target.select()"
                :suffix="selectedToken == null ? 'unknown' : selectedToken.symbol"
              ></v-text-field>
            </div>
            <div v-if="true" style="text-align: right; margin-top: -20px; margin-right: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; overflow: hidden">
                <div v-if="allowUnwrap">
                  <v-checkbox color="green" dense :ripple="false" hide-details style="margin-top: -8px;" v-model="autounwrap">
                    <template v-slot:label>
                      <span style="font-size: 12px">Auto Unwrap</span>
                    </template>
                  </v-checkbox>
                </div>
                <div v-else>
                  <div v-if="fromChain && fromChain.name != 'Secret Network'" style="display: flex; justify-content: flex-start; align-items: center; flex-wrap: nowrap; gap: 5px">
                    <div>Asset to receive:</div>
                    <div style="z-index: 999">
                      <v-tooltip bottom color="#000000">
                        <template v-slot:activator="{on, attrs}">
                          <div v-bind="attrs" v-on="on" style="text-decoration-style: dotted; text-decoration:underline; color: orange; cursor: pointer;">{{ willReceiveTokenName }}</div>
                        </template>
                        <span>Asset received in Secret Network smart contract</span>
                      </v-tooltip>
                    </div>
                  </div> 
                </div>
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; overflow: hidden">
                  <div>Balance: </div>
                  <div v-if="!refreshBalance">{{ showCurrentBalance }}</div>
                  <div v-if="refreshBalance">
                    <lottie-wrapper
                      style="z-index: 2"
                      :speed="1"
                      :height="20"
                      :path="require('../assets/animations/wait.json')"
                    />
                  </div>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon dense x-small v-bind="attrs" v-on="on" @click="getBalance">
                        <v-icon size="16">mdi-refresh</v-icon>
                      </v-btn>
                    </template>
                    <span>Refresh balance</span>
                  </v-tooltip>
                </div>
              </div>
            </div>
            <div style="padding-top: 10px">
              <div style="margin-bottom: 5px; font-family: 'BalsamiqSans-Regular">From address: {{ fromAccountName }}</div>
              <div>
                <v-text-field disabled class="address-input pa-0 ma-0" color="orange" flat dense label="" :value="sourceAddress" spellcheck="false"></v-text-field>
              </div>
              <div style="margin-bottom: 5px; font-family: 'BalsamiqSans-Regular">To address:</div>
              <div>
                <v-text-field
                  :disabled="transferInProgress"
                  class="address-input pa-0 ma-0"
                  background-color="rgb(54, 53, 73)"
                  color="orange"
                  flat
                  dense
                  label=""
                  ref="destinationAddress"
                  v-model="destinationAddress"
                  spellcheck="false"
                >
                <v-btn :disabled="transferInProgress" slot="append" style="margin-top: 5px; margin-right: 8px" x-small @click="autoFill">Auto Fill</v-btn>
                </v-text-field>
              </div>
            </div>
          </div>

          <div class="transfer-info">
            <div style="margin-top: -28px; margin-bottom: 3px; color: orange; font-weight: bold; font-size: 16px; font-family: 'BalsamiqSans-Regular">Info:</div>
            <div v-if="estimatedFee" style="font-size: 14px">Transfer fee: {{ estimatedFee }}</div>
            <div v-if="estimatedTime != -1" style="font-size: 14px">Estimated Time: {{ estimatedTime }} minutes</div>
            <div v-if="!transferInProgress && maxTransfer != ''" style="font-size: 14px">Maximum Transfer Amount: {{ maxTransfer }}</div>
            <div style="font-size: 14px;" v-html="axelarStatus"></div>
            <div v-if="tx == ''"></div>
            <div v-else>
              {{ tx }}
              <br />
              {{ ibcTx }}
            </div>
          </div>
          <div style="margin-top: 20px; width: 100%; display: flex; flex-direction: column; align-items: center;">
            <v-btn class="styled-button" style="font-family: Banana; font-size: 16px; z-index: 999" @click="send" :disabled="!selfCheckApproved || !isMetaMaskChainCorrect || !isValidTransferAsset || transferInProgress || disableUI">{{ transferInProgress ? "Processing..." : "Transfer" }}</v-btn>
            <v-checkbox v-if="!selfCheckApproved" color="green" dense :ripple="false" hide-details style="margin-top: -3px;" v-model="selfCheckApproved">
              <template v-slot:label>
                <span style="font-size: 12px; margin-left: -6px">I approve that all the information above is correct</span>
              </template>
            </v-checkbox>

            <div v-if="!isMetaMaskChainCorrect" class="error-styling">
              Metamask doesn't match selected network<br>Please change it manually
            </div>

            <div v-if="info_error != ''" class="error-styling">
              <v-icon size="16" color="error">mdi-alert</v-icon> {{ info_error }}
            </div>
          </div>

          <div v-if="showProcessAnimation">
            <lottie-wrapper
              style="z-index: 2"
              :speed="1"
              :height="100"
              :path="require('../assets/animations/processing.json')"
            />
          </div>

          <div v-if="showWrapAnimation">
            <lottie-wrapper
              style="z-index: 20"
              :speed="1"
              :width="100"
              :height="100"
              :loop="false"
              :path="require('../assets/animations/' + selectedToken.animation)"
            />
          </div>
          </div>
          <div class="main-section-tab" style="background-color: transparent">
            <faq @hide="page = 0"></faq>
          </div>
        </div>
      </div>
      <fire-fly></fire-fly>
    </div>
  </div>
</template>

<script>
import SubChainSelector from '~/components/SubChainSelector.vue';
import TokenSelector from '~/components/TokenSelector.vue';

import mainMixin from '../mixins/mainMixin';


export default {
  name: "DesktopUI",
  mixins: [mainMixin],  
  components: { SubChainSelector, TokenSelector },
  data() {
    return {
      showMigrationDialog: false
    }
  },
  methods: {
    closeMigrationWindow() {
      this.showMigrationDialog = false;
      window.localStorage.setItem('migration_dontshow', 1);
    }
  },
  computed: {
    allowUnwrap() {
      if (this.selectedToken && this.selectedToken.allow_autounwap) {
        return (this.selectedToken.autounwap_chain && this.toChain.name === this.selectedToken.autounwap_chain);
      }
      return false;
    }
  }
};
</script>

<style scoped>
.main {
  /* background-color: transparent !important; */
}

/* Squid Router Migration Banner */
.squid-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 16px 24px;
  border-bottom: 2px solid #e94560;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.squid-banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.squid-banner-left {
  flex: 1;
  min-width: 300px;
}

.squid-banner-title {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
}

.squid-banner-message {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.squid-banner-message strong {
  color: #e94560;
  font-weight: bold;
}

.squid-inline-link {
  color: #00d9ff;
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.2s ease;
}

.squid-inline-link:hover {
  color: #ffffff;
}

.squid-banner-link {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(90deg, #e94560, #ff6b6b);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(233, 69, 96, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
}

.squid-banner-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(233, 69, 96, 0.4);
}

/* Adjust main content to account for banner */
.main-section-wrapper {
  margin-top: 90px !important;
}

.input-coin {
  position: absolute;
  left: -200px;
  bottom: 320px;
  opacity: 0;
}

.output-coin {
  position: absolute;
  right: 200px;
  bottom: 270px;
  opacity: 0;
}

.migration-dialog {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 460px; height: 260px; 
  background-color: rgba(35, 52, 71, 0.8); border-radius: 15px;
  backdrop-filter: blur(7px);
  border: 3px dashed white;
  overflow: hidden;
}


.input-coin-start {
  animation: input-coin-anim 2s linear;
}

.output-coin-start {
  animation: output-coin-anim 2s linear;
}

@keyframes input-coin-anim {
  0% {
    transform: translate(0px, 250px);
    opacity: 0;
  }

  5% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  90.1% {
    opacity: 0;
  }

  100% {
    transform: translate(400px, 0px);
    opacity: 0;
  }
}

@keyframes output-coin-anim {
  0% {
    transform: translate(0px, 0px);
    opacity: 0;
  }

  5% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  95% {
    opacity: 0;
  }

  100% {
    transform: translate(430px, 250px);
    opacity: 0;
  }
}

.wallet-item-container {
  position: absolute;
  top: 40px;
  left: 847px;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.wallet-item {
  position: relative;
  cursor: pointer;
  width: var(--width);
  height: var(--height);
  margin-bottom: 10px;
  z-index: 2;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.47, 1.64, 0.41, 0.8);
  transition-duration: 0.3s;
  border-radius: 0 10px 10px 0;
  font-family: 'Banana';

  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(7px);

  display: flex;
  justify-content: flex-end;
  align-items: center;

  overflow: var(--overflow);
}

.wallet-item:hover {
  width: var(--width-hover);
  height: var(--height-hover);
  overflow: var(--overflow-hover);
}

.wallet-item-open {
  width: var(--width-hover);
  height: var(--height-hover);
  overflow: var(--overflow-hover);
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.styled-button {
  background: linear-gradient(90deg, #ea7534 0%, #7ec9cf 100%) !important;
  width: 230px;
  height: 48px;
  color: white;
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

.testnet-indicator {
  position: absolute;
  top: -30px;
  height: 25px;
  width: 70px;
  background-color: rgb(158, 4, 4);
  border-radius: 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-section-wrapper {
  position: relative;
  top: 130px;
  width: 1095px;
  min-height: 889px !important;
  flex-direction: column;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.main-section-tab {
  width: 600px;
  height: 670px !important;
  position: relative;
  padding: 20px;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.47, 1.64, 0.41, 0.8);
  transition-duration: 0.5s;
}


.migration-section-tab {
  width: 100%;

  position: relative;
  padding: 20px;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.47, 1.64, 0.41, 0.8);
  transition-duration: 0.5s;
}

.main-section {
  width: 600px !important;
  height: 670px !important;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 20px;


  position: relative;
  z-index: 2;
  backdrop-filter: blur(7px);
  overflow: hidden;
}

.main-section-disable {
  position: absolute;
  width: 600px;
  height: 670px;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0.4;
  z-index: 2;
  margin-top: -20px;
  margin-left: -20px;
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
  box-shadow: inset 0 0 2px #000;
}

.transfer-info {
  position: relative;
  /*font-family: 'BalsamiqSans-Regular';*/
  margin-top: 20px;
  width: 100%;
  background-color: rgba(100, 100, 100, 0.5);
  border-radius: 10px;
  padding: 10px;
  box-shadow: inset 0 0 2px #000;

  min-height: 105px;
}

.right-cave {
  position: absolute;
  z-index: 5;
  bottom: 149px;
  right: 146px;
  background: url('~/assets/images/right-cave.webp') no-repeat center center;
  width: 176px;
  height: 319px;
}

.left-cave {
  position: absolute;
  z-index: 5;
  bottom: 180px;
  left: 143px;
  background: url('~/assets/images/left-cave.webp') no-repeat center center;
  width: 143px;
  height: 272px;
}

.input-sign {
  position: absolute;
  z-index: 5;
  bottom: 252px;
  left: -60px;
  /* background: url('~/assets/images/input-sign.png') no-repeat center center;  */
  width: 185px;
  height: 156px;

  display: flex;
  justify-content: center;
}

.input-sign .input-name {
  font-family: 'Banana';
  color: black;
  font-size: 22px;
}

.output-sign {
  position: absolute;
  z-index: 1;
  bottom: 230px;
  right: -30px;
  /* background: url('~/assets/images/output-sign.png') no-repeat center center;  */
  width: 185px;
  height: 156px;

  display: flex;
  justify-content: center;
}

.output-sign .output-name {
  font-family: 'Banana';
  color: black;
  font-size: 22px;
}

>>> .right-input input::selection {
  background-color: #ff8c00;
}

>>> .right-input input {
  text-align: right;
}

.address-input >>> input::selection {
  background-color: #ff8c00;
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
  min-width: 10px;
  min-height: 10px;
  border-radius: 5px;
  background-color: red;
  margin-right: 10px;
}

.green-dot {
  min-width: 10px;
  min-height: 10px;
  border-radius: 5px;
  background-color: green;
  margin-right: 10px;
}

.mountain {
  position: absolute;
  top: 0px;
  /* width: 1095px; */
  width: 1205px;
  min-height: 899px !important;
  height: 899px !important;
  background: url('~/assets/images/mountain-bg.webp') no-repeat center top transparent;
  z-index: 0;
}
</style>

<style scoped>
.main-section-wrapper-mobile {
  width: 100vw;
  /* min-height: 889px !important; */
  flex-direction: column;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.assets-to-transfer-mobile {
  width: 90%;
  height: 300px;
  overflow-y: scroll;
  font-family: 'BalsamiqSans-Regular' !important;
  background-color: rgba(50, 50, 50, 0.7);
  border-radius: 15px;
  padding: 0px;
  box-shadow: inset 0 0 2px #000;
}

.error-styling {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  margin-top: 4px;
  color: rgb(226, 76, 76);
  font-weight: bold;
  text-align: center;
}
</style>
