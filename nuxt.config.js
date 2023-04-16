import colors from 'vuetify/es5/util/colors'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  server: {
    host: '0.0.0.0',
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s',
    title: 'Secret Tunnel',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { hid: 'description',
        name: 'description',
        content: 'Secret Tunnel is a bridge between Secret Network and Axelar that allows automatic wrapping of assets with privacy-preserving tokens' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.jpg' },
      { rel: 'preconnect', href: 'https://axelar-mainnet.s3.us-east-2.amazonaws.com',
        crossorigin: "" },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com/',
        crossorigin: "" },
      {
        rel: 'preload',
        href: '/fonts/Banana.woff2',
        as: 'font',
        type: 'font/woff2'
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: ""
      },
      {
        rel: 'preload',
        href: '/fonts/Banana.woff2',
        as: 'font',
        type: 'font/woff2'
      },
      {
        rel: 'preload',
        href: '/fonts/Rocky Rock.woff2',
        as: 'font',
        type: 'font/woff2'
      },
      {
        rel: 'preload',
        href: '/fonts/BalsamiqSans-Regular-English-Only.woff2',
        as: 'font',
        type: 'font/woff2'
      },
      {
        rel: 'preload',
        href: '/images/mountain-bg.webp',
        as: 'image',
        type: 'image/webp'
      }
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/lodash.js',
    '~/plugins/dispatchQueue.js'
  ],
  script: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  image: {

  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/robots'
  ],

  robots: {
    UserAgent: '*',
    Allow: '/'
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  styleResources: {
    scss: [
      // '~assets/style.scss'
    ]
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {

    babel: {
      presets({isClient}, preset) {
        if (isClient) {
          preset[1].targets = {
            browsers: [
              'Chrome >= 60',
              'Safari >= 10.1',
              'iOS >= 10.3',
              'Firefox >= 54',
              'Edge >= 15'
            ]
          }
        }
        return [preset]
      }
    },

    optimization: {
      splitChunks: {
        name: true
      }
    },

    filenames: {
      chunk: ({ isDev, isModern }) => isDev ? `[name]${isModern ? '.modern' : ''}.js` : `[name].[contenthash:7]${isModern ? '.modern' : ''}.js`,
    },
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      };

      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          esModule: false,
        }
      })
    },
  },
}
