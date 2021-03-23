<template>
  <div id="home-settings">


    hello

  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"

export default {
  name: "HomeHelpComponent",
  components: {
      // Keypress: () => import('vue-keypress')
  },
  props: {
  },
  methods: {



  },
  computed: mapState({
    profiles: 'profiles',
    profilesLoaded: 'profilesLoaded',

    // assignedId (){


    //   return uiUtils.assignID(this.structure,this.parentStructure)

    // },    
  }), 

  data: function() {
    return {


    }
  },
  created: function(){


  },
};
</script>


<style scoped>


  #home-settings, .grid{
    height: 100vh;
    width: 100%;
  }

  .grid{
    grid-template-columns: 20% 80%;
  }


  
</style>
