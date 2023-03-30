<template>
  <v-dialog transition="v-fade-transition" max-width="600" :value="show">
    <v-card>
      <v-toolbar color="primary" dark>FAQ</v-toolbar>
      <v-card-text>
        <div class="text-h2 pa-12">Hello world!</div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          text
          @click="handleChange(false)"
        >Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>  
</template>

<script>
export default {
  props: ['showFAQ'], 
  data() {
    return {
      show: this.showFAQ,
    }
  },
  mounted() {
  },
  methods: {
    handleChange(val) {
      this.show = val;
    }
  },
  watch: {
    showFAQ(val) {
      console.log("AAA");
      console.log(val)
      this.show = val;
    }
  }
};
</script>
