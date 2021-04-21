<template>
  <div>

    <div style="display: flex">

      <div id="test-id" style="flex: 1">
        
        <ul>
          <li id="search-li">Search Works On ID: <input @keyup="search" value="Woolf, Virginia, 1882-1941. To the lighthouse" autofocus ></li>
          <li id="profile-li">
            Use Work Resource Template: 
            <select @change="rtChange">
              <option v-for="key in rtLookupWorks" :key="key"  :selected="(key === 'lc:RT:bf2:Monograph:Work') ? true : false"  >{{key}}</option>
            </select>
          </li>
          <li v-for="(val,index) in idWorkSearchResults" :key="index">
            <button @click="load(val.id,false)">Load</button> <button @click="load(val.id,true)">Load & Edit</button> - <a target="_blank" :href="val.id">{{val.label}}</a></li>

        </ul>



      </div>



      <div id="test-instance" style="flex: 1">
        
        <ul>
          <li id="search-li">Search Instances On BFDB: <input @keyup="search" value="Woolf, Virginia, 1882-1941. To the lighthouse" autofocus ></li>
          <li id="search-li">... Or: URI of BFDB Instance: <input @keyup="instanceUriChange" v-model="instanceUri" placeholder="BFDB URL"><button @click="loadInstance">Load</button></li>
          <li id="profile-li">
            Use Instance Resource Template: 
            <select @change="rtChange">
              <option v-for="key in rtLookupInstances" :key="key"  :selected="(key === 'lc:RT:bf2:Monograph:Instance') ? true : false"  >{{key}}</option>
            </select>
          </li>
          <li v-for="(val,index) in idWorkSearchResults" :key="index">
            <button @click="load(val.id,false)">Load</button> <button @click="load(val.id,true)">Load & Edit</button> - <a target="_blank" :href="val.id">{{val.label}}</a></li>

        </ul>


      </div>


    </div>


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
import parseId from '@/lib/parseId'
import parseBfdb from '@/lib/parseBfdb'

import uiUtils from "@/lib/uiUtils"
import VueJsonPretty from 'vue-json-pretty'


export default {
  name: "TestParseId",
  components: {
    // HelloWorld
    VueJsonPretty
  },

  data: function() {
    return {
      useRtSelected: 'lc:RT:bf2:Monograph:Work',
      useRtInstanceSelected: 'lc:RT:bf2:Monograph:Instance',
      searchTimeout: null,
      transformResults: null,
      transformResultsDisplay: null,
      instanceUri: null,

    }
  },

  computed: mapState({
      profilesLoaded: 'profilesLoaded',
      activeProfile: 'activeProfile', 
      idWorkSearchResults: 'idWorkSearchResults',
      rtLookup:'rtLookup',
      profiles: 'profiles',
      idXML:'idXML',
      


      prettyIDXML (state) {
        if (state.idXML===null || state.idXML === '') return ''
        return uiUtils.prettifyXml(state.idXML)
      },

      // to access local state with `this`, a normal function must be used
      rtLookupWorks (state) {
        let r = []
        for (let k of Object.keys(state.rtLookup)){
          if (k.includes(':Work')){
            r.push(k)
          }
        }
        return r
      },
      rtLookupInstances (state) {
        let r = []
        for (let k of Object.keys(state.rtLookup)){
          if (k.includes(':Instance')){
            r.push(k)
          }
        }
        return r
      }

    }),
  methods: {

    prettifyXml: uiUtils.prettifyXml,


    search: function(event){
      window.clearTimeout(this.searchTimeout)
      this.searchTimeout = window.setTimeout(()=>{
        this.$store.dispatch("fetchIdWorkSearch", { self: this, searchValue: event.target.value }).then(() => {

        })
      },500)
    },

    rtChange: function(event){
      this.useRtSelected = event.target.value
    },
    rtInstanceChange: function(event){
      this.useRtInstanceSelected = event.target.value
    },

    instanceUriChange: function(event){
      
      return event
    },


    loadInstance: function(){


        parseBfdb.parse(parseBfdb.testXmlInstance)
        console.log(parseBfdb)

        let useProfile = null
        // find the right profile to feed it
        for (let key in this.profiles){
          if (this.profiles[key].rtOrder.indexOf(this.useRtInstanceSelected)>-1){
            useProfile = this.profiles[key]
          }
        }

        this.transformResults  = parseBfdb.transform(useProfile)

        let workkey = this.transformResults.rtOrder.filter((k)=> k.includes(":Instance"))[0]


        this.transformResultsDisplay = this.transformResults.rt[workkey]


    },

    load: function(useId,goEdit){


      this.$store.dispatch("fetchIdXML", { self: this, url: useId }).then(() => {
        // the xml is loaded
        //console.log(this.idXML)
        parseId.parse(this.idXML)

        let useProfile = null
        // find the right profile to feed it
        for (let key in this.profiles){
          if (this.profiles[key].rtOrder.indexOf(this.useRtSelected)>-1){
            useProfile = this.profiles[key]
          }
        }

        this.transformResults  = parseId.transform(useProfile)

        let workkey = this.transformResults.rtOrder.filter((k)=> k.includes(":Work"))[0]


        this.transformResultsDisplay = this.transformResults.rt[workkey]


        if (goEdit){
          this.$store.dispatch("setActiveProfile", { self: this, profile: this.transformResults }).then(() => {

            this.$router.push({ path: 'edit' })
          })
        }

        // this.$router.push({ path: 'edit' })

        // console.log(this.transformResults)
        // console.log(useProfile.id,workkey)

      })



    }


  },
  created: function () {
    // kick off the fetching of profiles on load
    this.$store.dispatch("fetchProfiles", { self: this }).then(() => {
      parseId.parse()
      // parseId.transform(this.activeProfile)

      this.$store.dispatch("fetchIdWorkSearch", { self: this, searchValue: 'Woolf, Virginia, 1882-1941. To the lighthouse' }).then(() => {

      })
      
    });    

    // console.log(parseId)
    

  }
};
</script>
