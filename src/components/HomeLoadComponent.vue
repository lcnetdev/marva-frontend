<template>
  <div id="home-load">
<!-- 
    <Keypress key-event="keydown" :key-code="40" @success="moveDown" />
    <Keypress key-event="keydown" :key-code="38" @success="moveUp" />
    <Keypress key-event="keydown" :key-code="13" @success="selectTemplate" />
 -->
<!--     <Keypress key-event="keydown" :key-code="34" @success="movePageDown" />          
    <Keypress key-event="keydown" :key-code="33" @success="movePageUp" />

    <Keypress key-event="keydown" :multiple-keys="[{keyCode: 187, modifiers: ['ctrlKey'],preventDefault: true}]" @success="dupeProperty" />
 -->

    <h1>Load existing records</h1>

    <hr>

    
    <h3>Load ICB record (Instance) from BFDB</h3>

    <ol>
      <li>1. Go to the <a href="https://preprod-8230.id.loc.gov" target="_blank">BFDB</a> and find and instance to load.</li>
      <li>2. Copy the URL from the "Editor Link" section</li>
      <li>3. Paste URL below, select template and click load.</li>
    </ol>

    <div>
      <input style="margin-left:2em; width: 75%;" class="editor-link-input" v-model="instanceEditorLink" type="text" id="instance-editor-link" placeholder="Paste Editor Link URL">
    </div>
    <div>
    <select style="margin-left:2em; width: 76%;" class="editor-link-input" v-model="instanceSelected">
      <option v-for="key in rtLookupInstances" :key="key"  :selected="(key === 'lc:RT:bf2:Monograph:Instance') ? true : false"  >{{key}}</option>
    </select>

    <div>
    <button style="font-size: 1.25em; margin-left: 2em; margin-top: 0.5em;" @click="loadInstance()">Load</button> 
    </div>

  </div>

    <hr style="margin-top:2em">

    <h3>Load Work record from BFDB</h3>


    <hr style="margin-top:2em">

    <h3>From id.loc.gov</h3>


    <ul>
      <li id="search-li">Search Works On ID: <input @keyup="search" value="Woolf, Virginia, 1882-1941. To the lighthouse" ></li>
      <li id="profile-li">
        Use Resource Template: 
        <select @change="rtChange">
          <option v-for="key in rtLookupWorks" :key="key"  :selected="(key === 'lc:RT:bf2:Monograph:Work') ? true : false"  >{{key}}</option>
        </select>
      </li>
      <li v-if="searchActive"><MiscLoaderAnimation></MiscLoaderAnimation>Searching now...</li>
      <li v-for="(val,index) in idWorkSearchResults" :key="index">
        <button @click="load(val.id,true)">Load & Edit</button> - <a target="_blank" :href="val.id">{{val.label}}</a></li>

    </ul>




    <hr style="margin-top:2em">

    <h3>From IBC</h3>

  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"
import parseId from '@/lib/parseId'
import parseBfdb from '@/lib/parseBfdb'

const short = require('short-uuid');
const decimalTranslator = short("0123456789");


import MiscLoaderAnimation from "@/components/MiscLoaderAnimation.vue";

export default {
  name: "HomeNewComponent",
  components: {
      // Keypress: () => import('vue-keypress')
      MiscLoaderAnimation
  },
  props: {
  },
  methods: {


    search: function(event){
      window.clearTimeout(this.searchTimeout)
      this.searchActive=true
      this.searchTimeout = window.setTimeout(()=>{
        this.$store.dispatch("fetchIdWorkSearch", { self: this, searchValue: event.target.value }).then(() => {
          this.searchActive=false
        })
      },500)
    },

    rtChange: function(event){
      this.useRtSelected = event.target.value
    },


    loadInstance: function(){

      if (this.instanceEditorLink==''||this.instanceEditorLink==null){
        this.instanceEditorLink = this.instanceTests[Math.floor(Math.random() * this.instanceTests.length)];

      }
      console.log(this.instanceEditorLink)


      this.$store.dispatch("fetchBfdbXML", { self: this, url: this.instanceEditorLink }).then(() => {
      // console.log(this.instanceSelected)


        parseBfdb.parse(this.bfdbXML)

        let useProfile = null
        // find the right profile to feed it
        for (let key in this.profiles){
          if (this.profiles[key].rtOrder.indexOf(this.instanceSelected)>-1){
            useProfile = JSON.parse(JSON.stringify(this.profiles[key]))
          }
        }

        if (!useProfile.log){
          useProfile.log = []
        
        }
        useProfile.log.push({action:'loadInstance',from:this.instanceEditorLink})


        // also give it an ID for storage
        if (!useProfile.eId){
          let uuid = 'e' + decimalTranslator.new()
          uuid = uuid.substring(0,8)        
          useProfile.eId= uuid

        }

        if (!useProfile.user){
          useProfile.user = this.catInitials
        }

        if (!useProfile.status){
          useProfile.status = 'unposted'
        }



        

        // console.log(useProfile,'console.log(useProfile)')
        this.transformResults  = parseBfdb.transform(useProfile)

        // let workkey = this.transformResults.rtOrder.filter((k)=> k.endsWith(":Instance"))[0]
        // this.transformResultsDisplay = this.transformResults.rt[workkey]


        this.$store.dispatch("setActiveProfile", { self: this, profile: this.transformResults }).then(() => {

          this.$router.push({ path: 'edit' })
        })






      })


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
            useProfile = JSON.parse(JSON.stringify(this.profiles[key]))
          }
        }

        // console.log(useProfile,'console.log(useProfile)')
        this.transformResults  = parseId.transform(useProfile)

        let workkey = this.transformResults.rtOrder.filter((k)=> k.endsWith(":Work"))[0]


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
  computed: mapState({
    activeInput: 'activeInput',
    activeProfile: 'activeProfile',
    startingPoints: 'startingPoints',
    profiles: 'profiles',
    profilesLoaded: 'profilesLoaded',
    idWorkSearchResults: 'idWorkSearchResults',
    rtLookup:'rtLookup',
    idXML:'idXML',
    bfdbXML:'bfdbXML',
    catInitials:'catInitials',
    // to access local state with `this`, a normal function must be used
    rtLookupWorks (state) {
      let r = []
      for (let k of Object.keys(state.rtLookup)){
        if (k.endsWith(':Work')){
          r.push(k)
        }
      }
      return r
    },
    rtLookupInstances (state) {
      let r = []
      for (let k of Object.keys(state.rtLookup)){
        if (k.endsWith(':Instance')){
          r.push(k)
        }
      }
      return r
    }    
    // assignedId (){


    //   return uiUtils.assignID(this.structure,this.parentStructure)

    // },    
  }), 

  data: function() {
    return {
      useRtSelected: 'lc:RT:bf2:Monograph:Work',
      searchTimeout: null,
      transformResults: null,
      transformResultsDisplay: null,
      activeTemplateId: null,
      actibveTemplateIdCount:0,
      searchActive: true,
      instanceSelected: 'lc:RT:bf2:Monograph:Instance',
      instanceEditorLink: null,


      instanceTests:[
        '/editor/tests/instances/c0010058400001.xml'
      ]

    }
  },
  created: function(){

   this.$store.dispatch("fetchIdWorkSearch", { self: this, searchValue: 'Woolf, Virginia, 1882-1941. To the lighthouse' }).then(() => {
      this.searchActive=false
    })

  },
};
</script>


<style scoped>

  li::before{
    
    content: '';
  }

  h1{
    margin: 0;
    font-weight: bold;
    font-size:2em;
  }
  #home-load{
    padding:1em 2em 1em 2em;
  }


  .editor-link-input{
    border: solid 1px #a6acb7;
    font-size: 1.25em;
    margin-top: 1em;
    border-top-right-radius: 0.25em;
    border-bottom-right-radius: 0.25em;
    width: 98%;
  }


</style>
