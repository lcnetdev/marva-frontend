<template>
  <div id="home-load">
  <h1 style="padding: 0.5em;">My Records</h1>
   <HomeRecordsComponent :allrecords="false" ></HomeRecordsComponent>

  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"

import HomeRecordsComponent from "@/components/HomeRecordsComponent.vue";

export default {
  name: "HomeMyRecordsComponent",
  components: {
      HomeRecordsComponent
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
    myRecords: 'myRecords',
    catInitials:'catInitials'
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


    this.$store.dispatch("fetchMyRecords", { self: this, user: this.catInitials  }).then(() => {
      // console.log("uh huh")
    })  


  },
};
</script>


<style scoped>


</style>
