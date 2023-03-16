<template>
  <v-app dark style="background-color: transparent !important;">
    <v-main>
        <Nuxt />
    </v-main>

  <v-footer color="black" padless fixed style="z-index: 200" >
    <v-row justify="center" no-gutters>
      <v-col class="py-1 text-center white--text" dense cols="12">
        <strong>SCRT Labs</strong> © {{ new Date().getFullYear() }} | powered by <strong>Axelar</strong>
      </v-col>
    </v-row>
  </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire',
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js',
    }
  },
}
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
  background: radial-gradient(circle, rgba(50,50,50,1) 0%, rgba(0,0,0,1) 100%);
}

@font-face {
    font-family: 'Banana';
    src: url("../assets/fonts/Banana.ttf");
}


@font-face {
    font-family: 'Vanilla Caramel';
    src: url("../assets/fonts/Vanilla Caramel.otf");
}


@font-face {
    font-family: 'BalsamiqSans-Regular';
    src: url("../assets/fonts/BalsamiqSans-Regular.ttf");
}




</style>