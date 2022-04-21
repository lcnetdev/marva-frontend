<template>

  <div :class="['']">



  </div>

</template>


<style type="text/css">



</style>

<script>
// @ is an alias to /src

import { mapState } from 'vuex'
// import parseId from '@/lib/parseId'
// import uiUtils from "@/lib/uiUtils"
// import lookupUtil from "@/lib/lookupUtil"
// import parseProfile from '@/lib/parseProfile'






export default {
  name: "EditNavLiteralDisplayOptions",
  components: {
    // HelloWorld
    
  },

  data: function() {
    return {

      


    }
  },

  computed: mapState({
      profilesLoaded: 'profilesLoaded',
      activeProfile: 'activeProfile', 
      rtLookup:'rtLookup',
      profiles: 'profiles',


    

    }),

  methods: {


  },




  created: function () {


    for (let rt in this.activeProfile.rt){
      console.log(rt)
      for (let pt in this.activeProfile.rt[rt].pt){
        console.log(pt)
        console.log(this.activeProfile.rt[rt].pt[pt])

      }

    }








  },


  mounted: function () {
    


  }
};
</script>
