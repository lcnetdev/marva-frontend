<template>

  <div id="test-id">
    


    <ul>
      <li id="search-li">Search Works On ID: <input @keyup="search" value="Woolf, Virginia, 1882-1941. To the lighthouse" autofocus ></li>
      <li id="profile-li">
        Use Resource Template: 
        <select @change="rtChange">
          <option v-for="key in rtLookupWorks" :key="key"  :selected="(key === 'lc:RT:bf2:Monograph:Work') ? true : false"  >{{key}}</option>
        </select>
      </li>
      <li v-for="(val,index) in idWorkSearchResults" :key="index">
        <button @click="load(val.id,false)">Load</button> <button @click="load(val.id,true)">Load & Edit</button> - <a target="_blank" :href="val.id">{{val.label}}</a></li>

    </ul>




    <div style="padding: 2%" v-if="transformResultsDisplay != null">


      <h1>Load Results:</h1>

      <div style="font-weight: bold">{{transformResultsDisplay.propertyLoadRatio}}% properties assigned from data</div>
      <div style="font-weight: bold">Unused XML:</div>
      <code style="background-color: whitesmoke"><pre style="background-color: whitesmoke">{{prettifyXml(transformResultsDisplay.unusedXml)}}</pre></code>

      <hr/>
      <div v-for="(val,key) in transformResultsDisplay.propertyLoadReport" v-bind:key="key">

        <h3 v-if="val.status===false" style="color:red">{{key}}</h3>
        <h3 v-if="val.status===true" style="color:green">{{key}}</h3>
        <h3 v-if="val.status==='mixed'" style="color:orange">{{key}}</h3>

        <div v-if="val.status!==false">
          <div v-if="val.unAssingedProperties.length>0">
            <div>Unassinged Properties:</div>
            <div v-for="(unval,unvalindex) in val.unAssingedProperties" v-bind:key="unvalindex">{{unval}}</div>
          </div>
          <div v-for="(dataval,index) in val.data" v-bind:key="index">
            <div>{{dataval.propertyLabel}}</div>
            <code style="background-color: whitesmoke"><pre style="background-color: whitesmoke">{{prettifyXml(dataval.xml)}}</pre></code>
            <vue-json-pretty 
              :path="'res'"
              :highlightMouseoverNode="true"
              :collapsedOnClickBrackets="true"
              :data="dataval.json"      
              >
            </vue-json-pretty>
            


          </div>


        </div>
          

        <hr/>
      </div>





    </div>


    <!-- <code><pre>{{prettyIDXML}}</pre></code> -->
  </div>

</template>


<style type="text/css">

    body #app{
      background-color: white !important;
    }

    #search-li input{
      width:50em;
    }
    #search-li::before, #profile-li::before{
      content: ''

    }


</style>
<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

import { mapState } from 'vuex'
// import parseId from '@/lib/parseId'
// import uiUtils from "@/lib/uiUtils"


export default {
  name: "TestParseId",
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
      idWorkSearchResults: 'idWorkSearchResults',
      rtLookup:'rtLookup',
      profiles: 'profiles',
      idXML:'idXML',
      

    }),
  methods: {



  },
  created: function () {

  }
};
</script>
