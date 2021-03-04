<template>
  <div id="home-load">

    Nothing Here Yet

  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"

// import HomeMyRecordsComponent from "@/components/HomeMyRecordsComponent.vue";

export default {
  name: "HomeMyRecordsComponent",
  components: {
      // Keypress: () => import('vue-keypress')
  },
  props: {
  },
  methods: {


  },
  computed: mapState({
    activeProfile: 'activeProfile',
    startingPoints: 'startingPoints',
    profiles: 'profiles',
    profilesLoaded: 'profilesLoaded',
    // to access local state with `this`, a normal function must be used
   
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


</style>
