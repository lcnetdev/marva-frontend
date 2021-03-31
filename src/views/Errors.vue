<template>
  <div>

    <table>
      <thead>
        <th>eId</th>
        <th>Desc</th>
        <th>Contact</th>
        <th></th>
        <th></th>
      </thead>

      <tbody>
        <tr v-for="error in errors" v-bind:key="error.id">
            <td>{{error.eId}}</td>
            <td>{{error.desc}}</td>
            <td>{{error.contact}}</td>
            <td><a target="_blank" :href="errorUrlBase+error.id+'?download=true'">Download</a></td>
            <td class="load" @click="loadProfile(error.id)">Load</td>


        </tr>


      </tbody>

    </table>


  </div>
</template>


<style type="text/css">

table{
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;



  }
  thead{
    background-color: black;
    color:white;
    
  }

  th{
    padding: 0.5em;
    /*border-radius: 0.5em;*/
  }



  tr:first-child th:first-child {
    border-top-left-radius: 6px;
  }
  tr:first-child th:last-child {
    border-top-right-radius: 6px;
  }
  td {
    border-right: 1px solid #c6c9cc;
    border-bottom: 1px solid #c6c9cc;
    padding: 0.25em;    
  }
  td:first-child {
    border-left: 1px solid #c6c9cc;
  }
  tr:nth-child(even) td {
    background: #eaeaed;
  }
  tr:last-child td:first-child {
    border-bottom-left-radius: 6px;
  }
  tr:last-child td:last-child {
    border-bottom-right-radius: 6px;
  }

  .selectable-template{
    padding:4px;
  }
  .selectable-template:hover, td.active{
    background-color: rgb(9 13 139 / 0.25) !important;
    border: solid 4px rgb(9 13 139 / 0.25);
    padding:1px;
    cursor: pointer;
  }

  .load{
    cursor: pointer;
  }
  .load:hover{
    background-color: rgb(9 13 139 / 0.25) !important;




  }


</style>
<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

import { mapState } from 'vuex'
import lookupUtil from '@/lib/lookupUtil'
import config from '@/lib/config'
const short = require('short-uuid');
const decimalTranslator = short("0123456789");

// import parseId from '@/lib/parseId'
// import parseBfdb from '@/lib/parseBfdb'
// import uiUtils from "@/lib/uiUtils"
// import VueJsonPretty from 'vue-json-pretty'


export default {
  name: "TestParseId",
  components: {
    // HelloWorld
    // VueJsonPretty
  },

  data: function() {
    return {
      errors: []
    }
  },

  computed: mapState({
      profilesLoaded: 'profilesLoaded',
      activeProfile: 'activeProfile', 
      idWorkSearchResults: 'idWorkSearchResults',
      rtLookup:'rtLookup',
      profiles: 'profiles',
      idXML:'idXML',
      catInitials:'catInitials',


      errorUrlBase () {
        return config.returnUrls().util + 'error/'
      },



      

    }),
  methods: {


    async loadProfile(id){


      let profile = await lookupUtil.returnError(id)


      // change the eId and the user so it doesnt overwrite write the orginal users record
      let uuid = 'e' + decimalTranslator.new()
      uuid = uuid.substring(0,8)        
      profile.eId= uuid
      profile.user = this.catInitials




      console.log(profile)
      this.$store.dispatch("setActiveRecordSaved", { self: this}, false).then(() => {

      })

      this.$store.dispatch("setActiveProfile", { self: this, profile: profile }).then(() => {
        this.$router.push({ path: 'edit' })
      })




    }



  },
  created: async function () {


    this.errors = await lookupUtil.returnErrors()
    if (!this.profilesLoaded){
        this.$store.dispatch("fetchProfiles", { self: this }).then(() => {

      })       
    }   
    

  }
};
</script>
