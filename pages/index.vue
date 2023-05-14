<template>
  <mobile v-if="isMobile"></mobile>
  <desktop v-else></desktop>
</template>

<script>
import { mapGetters } from 'vuex';
import Desktop from '@/components/DesktopUI';
import Mobile from '@/components/MobileUI';



//import mainMixin from '../mixins/mainMixin';

export default {
  //mixins: [mainMixin],  
  components: { Desktop, Mobile },
  computed: {
    ...mapGetters({
      isMobile: 'isMobile'
    })
  }  
};
</script>
