<template>
  <v-app dark style="background-color: transparent !important">
    <v-main>
      <Nuxt />
    </v-main>
    <v-dialog v-model="dialog" width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">TERMS AND CONDITIONS</span>
        </v-card-title>
        <v-card-text>
    <h2>Introduction</h2>
    <p>
        These Terms and Conditions ("Terms") govern your use of the Secret Tunnel interface (the "Service") provided by SCRT Labs ("us", "we", or "our") for transferring tokens across networks, including to and from the Secret Network. By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Service.
    </p>
    <h2>Description of Service</h2>
    <p>
        The Service enables users to transfer tokens across networks, utilizing the Axelar protocol behind the scenes. The Service is designed to facilitate the transfer of tokens, but we do not have control over or participate in the actual transfer process, nor do we hold custody of any tokens at any time.
    </p>
    <h2>User Representations and Warranties</h2>
    <p>
        By using the Service, you represent and warrant that you:
    </p>
    <ol>
        <li>(a) are of legal age to form a binding contract;</li>
        <li>(b) have the authority to enter into these Terms and to comply with all applicable laws, regulations, and rules regarding the use of the Service; and</li>
        <li>(c) have the requisite knowledge and experience to understand the risks involved in using the Service and dealing with tokens, including the potential for loss or the irreversible nature of token transfers.</li>
        <li>(d) will not use the service for any illegal, fraudulent, or unauthorized purpose, and will comply with all applicable laws and regulations related to the use of the service.</li>
    </ol>
    <br>
    <h2>User Responsibilities</h2>
    <p>
        You are solely responsible for managing your tokens and conducting transfers using the Service. You acknowledge and agree that:
    </p>
    <ol>
        <li>(a) we do not have any control over the underlying blockchain networks or the Axelar protocol;</li>
        <li>(b) you assume all risks associated with the use of the Service and transferring tokens, including, without limitation, the risk of loss or irreversibility;</li>
        <li>(c) you are solely responsible for securing your private keys, passwords, and other credentials necessary to access and use the Service; and</li>
        <li>(d) you are solely responsible for ensuring the accuracy of any information or data you provide or input into the Service, including token addresses and transfer amounts.</li>
    </ol>
    <br>
    <h2>Disclaimer of Warranties and Limitation of Liability</h2>
    <p>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NONINFRINGEMENT, OR WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE IN TRADE. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR FREE OF DEFECTS.
    </p>
        <p>
            IN NO EVENT SHALL WE, OUR AFFILIATES, OR OUR RESPECTIVE DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR CONTRACTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, LOSS OF TOKENS, OR INTERRUPTION OF SERVICE, ARISING OUT OF OR IN CONNECTION WITH THE USE OR INABILITY TO USE THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED $100 FOR USING THE SERVICE DURING THE SIX (6) MONTHS PRIOR TO THE DATE OF THE CLAIM.
        </p>
        <h2>Indemnification</h2>
        <p>
            You agree to indemnify, defend, and hold harmless us, our affiliates, and our respective directors, officers, employees, agents, and contractors from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or in connection with your use of the Service, your breach of these Terms, or your violation of any applicable law, regulation, or rule.
        </p>
        <h2>Amendments</h2>
        <p>
            We reserve the right to modify or amend these Terms at any time without prior notice. Your continued use of the Service following the posting of changes to these Terms constitutes acceptance of those changes.
        </p>
        <h2>Entire Agreement</h2>
        <p>
            These Terms constitute the entire agreement between you and us with respect to the subject matter hereof and supersede all prior or contemporaneous understandings, agreements, or representations, whether written or oral, relating to the Service.
        </p>
        <h2>Contact Information</h2>
        <p>
            If you have any questions or concerns regarding these Terms or the Service, please contact us at the email address or physical address provided on our website.
        </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog  v-model="showSurge" width="601" height="338">
      <div class="surge-ad">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div><v-btn large color="red" style="margin-top: 200px; font-size: 16px; border-radius: 10px;" @click="goToWeb('https://scrt.network/secret-surge')">Learn More</v-btn></div>
          <div style="margin-top: 10px; padding-top: 2px; padding-bottom: 2px; padding-left: 5px; padding-right: 5px; background-color: black;"><a @click="closeAd()" style="color: white; font-weight: bold; font-size: 14px;">Close</a></div>
        </div>
      </div>
    </v-dialog>


    <v-footer v-if="!isMobile" color="black" padless fixed style="z-index: 200">
      <div style="width: 100%; display: flex; justify-content: center">
        <div style="flex: 1; margin-left: 10px ">Version: {{ version }}</div>
        <div style="flex: 1; text-align: center;">
          <a href="https://scrtlabs.com" target="_blank" style="font-weight: bold; text-decoration: none; color: white">SCRT Labs</a> ©
          {{ new Date().getFullYear() }} | powered by
          <a href="https://axelar.network/" target="_blank" style="font-weight: bold; text-decoration: none; color: white">Axelar</a>
        </div>
        <div style="flex: 1; text-align: right;">
          <a @click="dialog = true" style="font-weight: bold; text-decoration: none; color: white; margin-right: 10px ">Terms and Conditions</a>
        </div>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'DefaultLayout',
  created() {
    if (window.localStorage.getItem('Surge_dontshow')) {
      this.showSurge = false;
    } else {
      if (!this.isMobile) {
        this.showSurge = true;
      }


    }
  },
  data() {
    return {
      dialog: false,
      version: "0.4.1",
      showSurge: false
    };
  },
  watch: {
    showSurge(value) {
      if (value === false) {
        window.localStorage.setItem('Surge_dontshow', 1);
      }
    }
  },
  methods: {
    goToWeb(url) {
      window.open(url, '_blank');
      this.closeAd();
    },
    closeAd() {
      this.showSurge = false;
      window.localStorage.setItem('Surge_dontshow', 1);
    }
  },

  computed: {
    ...mapGetters({
      isMobile: 'isMobile'
    })
  }


};
</script>

<style>
html {
  overflow: auto;
  margin: 0;
  padding: 0;
}

body {
  /* overflow: hidden; */
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  font-size: 12px;
  /* width: 100vw;
  height: 100vh; */
  background: radial-gradient(circle, rgba(50, 50, 50, 1) 0%, rgba(0, 0, 0, 1) 100%);
}
::-webkit-scrollbar {
  width: 14px !important;
}

::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.9) !important;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(0, 0, 0, 0) !important;
  outline: 1px solid rgba(255, 255, 255, 0.2) !important;
  outline-offset: -3px !important;
  border-radius: 15px !important;
  opacity: 0.5 !important;
  background-clip: padding-box !important;
}

@font-face {
  font-family: 'Banana';
  font-style: normal;
  font-weight: 400;
  src: local('Banana'), url('../assets/fonts/Banana.woff2') format("woff2");
  font-display: swap;
  unicode-range: U+0000-00FF;
}

/*@font-face {*/
/*  font-family: 'Vanilla Caramel';*/
/*  font-style: normal;*/
/*  font-weight: 400;*/
/*  src: local('Vanilla Caramel'), url('../assets/fonts/Vanilla Caramel.otf');*/
/*  font-display: swap;*/
/*  unicode-range: U+0000-00FF;*/
/*}*/

@font-face {
  font-family: 'BalsamiqSans-Regular';
  font-style: normal;
  font-weight: 400;
  src: local('BalsamiqSans Regular'), local('BalsamiqSans-Regular'),
  url('../assets/fonts/BalsamiqSans-Regular-English-Only.woff2') format("woff2");
  font-display: swap;
  unicode-range: U+0000-00FF;
}

@font-face {
  font-family: 'RockyRock';
  font-style: normal;
  font-weight: 400;
  src: local('RockyRock'), url('../assets/fonts/Rocky Rock.woff2') format("woff2");
  font-display: swap;
  unicode-range: U+0000-00FF;
}

.surge-ad {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 600px; height: 338px; background-color: red; border-radius: 15px;
  border: 3px dashed white;
  background: url('~/assets/images/surge-ad.jpg') no-repeat center top transparent;
}

</style>
