<template>
  <div id="home-load">

  <h1 style="padding: 0.5em;">All Records</h1>
   <HomeRecordsComponent :allrecords="true" ></HomeRecordsComponent>

  </div>



</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"

// import HomeAllRecordsComponent from "@/components/HomeAllRecordsComponent.vue";
import HomeRecordsComponent from "@/components/HomeRecordsComponent.vue";

export default {
  name: "HomeAllRecordsComponent",
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
    allRecords: 'allRecords'
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


    this.$store.dispatch("fetchAllRecords", { self: this}).then(() => {
      // console.log("uh huh")
    })  

  },
};
</script>


<style scoped>


</style>
