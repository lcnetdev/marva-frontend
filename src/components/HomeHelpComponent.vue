<template>
  <div id="home-settings" >


    <div style="padding:1em;">
    <h1>Beta Quick Start Video</h1>
    <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/lYCWSghcQok" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <hr>
    </div>


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
