<template>
  <div id="home-settings-lookups">
   

  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"


export default {
  name: "HomeSettingsAuthorityLookupComponent",
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
    settingsDPackVoyager: 'settingsDPackVoyager',
    settingsDPackVoyagerNative: 'settingsDPackVoyagerNative',

  }), 

  data: function() {
    return {

 

    }
  },
  created: function(){

    // let bfeDiacritics = localStorage.getItem('bfeDiacritics')
    // if (bfeDiacritics === null){
    //   bfeDiacritics = []
    // }else{
    //   bfeDiacritics = JSON.parse(bfeDiacritics)
    // }


    // for (let k in diacrticsVoyagerMacroExpress){
    //   for (let d of diacrticsVoyagerMacroExpress[k]){
    //     this.dPackVoyagerShortCuts.push(d)
    //   }
    // }

    // for (let k in diacrticsVoyagerNative){
    //   for (let d of diacrticsVoyagerNative[k]){
    //     this.dPackVoyagerShortCutsNative.push(d)
    //   }
    // }


    



    // this.dPackVoyager = this.settingsDPackVoyager
    // this.dPackVoyagerNative = this.settingsDPackVoyagerNative




    // this.locatStorageDiacritics = bfeDiacritics

  },
};
</script>


<style scoped>


  #home-settings-lookups{
    padding:2em; 
  }
  
</style>
