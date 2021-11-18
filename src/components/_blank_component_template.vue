<template>

  <div :class="['subject-editor-container', {'subject-editor-container-lowres':false}]">


  </div>

</template>


<style type="text/css">

    body #app{
      background-color: white !important;
    }




</style>

<script>
// @ is an alias to /src

import { mapState } from 'vuex'
// import parseId from '@/lib/parseId'
// import uiUtils from "@/lib/uiUtils"
// import lookupUtil from "@/lib/lookupUtil"






export default {
  name: "EditLiteralLanguage",
  components: {
    // HelloWorld
    
  },

  data: function() {
    return {

      subjectString: '',
     


    }
  },

  computed: mapState({
      profilesLoaded: 'profilesLoaded',
      activeProfile: 'activeProfile', 
      idWorkSearchResults: 'idWorkSearchResults',
      rtLookup:'rtLookup',
      profiles: 'profiles',
      idXML:'idXML',

      contextData: 'contextData',
      

    }),
  methods: {


  },




  created: function () {


  },


  mounted: function () {
    


  }
};
</script>
