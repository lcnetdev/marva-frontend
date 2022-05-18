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

    
    <h3>Load data from BFDB</h3>

    <ol>
      <li>1. Go to the <a href="https://preprod-8230.id.loc.gov" target="_blank">BFDB</a> and find and instance to load.</li>
      <li>2. Copy the URL from the "Editor Link" section</li>
      <li>3. Paste URL below, select template and click load.</li>
    </ol>

    <div>
      <input style="margin-left:2em; width: 75%;" class="editor-link-input" v-model="instanceEditorLink" type="text" id="instance-editor-link" placeholder="Paste Editor Link URL">
    </div>
    <div>

    <div>

    <button style="font-size: 1.25em; margin-left: 2em; margin-top: 0.5em;" @click="testInstance()">Suggest Profile</button> 

    <div v-if="suggestHardCoded.length>0" style="margin-left: 5em;margin-top: 2em;background-color: aliceblue;padding: 1em;">
      <div>This record was saved using this profile:</div>
      <button style="font-size: 1.25em" v-bind:key="pname" @click="loadSuggestd(pname)" v-for="pname  in suggestHardCoded">Load using: {{pname}}</button>
    </div>
    <div v-else-if="suggestScore.length>0">


      <div style="margin-left: 5em;margin-top: 2em;background-color: aliceblue;padding: 1em;">
        <div style="margin-bottom: 1em;font-weight: bold;">These profiles best fit this data (best to worst):</div>
        <div v-bind:key="idx" v-for="(pname,idx) in suggestScore" style="margin-bottom: 1em">
          <button style="font-size: 1.25em" @click="loadSuggestd(pname.id)">Load using: {{pname.profile}}</button>
        </div>
      </div>

      
      


    </div>


    </div>
  <hr style="width: 25%;margin-left: 2.5em;margin-top: 2em;">

    <select style="margin-left:2em; width: 76%;" class="editor-link-input" v-model="instanceSelected">
      <option v-for="key in rtLookupInstances" :key="key"  :selected="(key === 'lc:RT:bf2:Monograph:Instance') ? true : false"  >{{key}}</option>
    </select>
    <div>
    <button style="font-size: 1.25em; margin-left: 2em; margin-top: 0.5em;" @click="loadInstance()">Manually Select Profile</button> 
    </div>

  </div>
<!-- 
    <hr style="margin-top:2em">

    <h3>Load Work record from BFDB</h3>


    <hr style="margin-top:2em"> -->
<!-- 
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

    <h3>From IBC</h3> -->

  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"
import parseId from '@/lib/parseId'
import parseBfdb from '@/lib/parseBfdb'
// import exportXML from "@/lib/exportXML"
// import lookupUtil from "@/lib/lookupUtil"

const short = require('short-uuid');
const decimalTranslator = short("0123456789");


// import MiscLoaderAnimation from "@/components/MiscLoaderAnimation.vue";

export default {
  name: "HomeNewComponent",
  components: {
      // Keypress: () => import('vue-keypress')
      // MiscLoaderAnimation
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

    testInstance: async function(){

      this.suggestHardCoded= []

      if (this.instanceEditorLink==''||this.instanceEditorLink==null){
        this.instanceEditorLink = this.instanceTests[Math.floor(Math.random() * this.instanceTests.length)];

      }

      this.$store.dispatch("fetchBfdbXML", { self: this, url: this.instanceEditorLink }).then(async () => {
      // 


        parseBfdb.parse(this.bfdbXML)

        let results = parseBfdb.testProfiles(this.profiles)

        if (results.hardCoded){
            // if it found the work and the instance just sow the instace
            if (results.hardCoded.filter((v)=>{ return (v.includes(":Work"))}).length>0 && results.hardCoded.filter((v)=>{ return (v.includes(":Instance"))}).length>0 ){
              results.hardCoded = results.hardCoded.filter((v)=>{ return (v.includes(":Instance"))})
            }

            this.suggestHardCoded = results.hardCoded

        }
        console.log(results.scoreResults)

        results.scoreResults = results.scoreResults.filter((v)=>{return (v.id)})

        results.scoreResults = results.scoreResults.filter((v)=>{return (!v.id.includes("test"))})
        results.scoreResults = results.scoreResults.filter((v)=>{return (!v.profile.includes("test"))})
        results.scoreResults = results.scoreResults.filter((v)=>{return (!v.profile.includes("lc:profile"))})




        this.suggestScore = results.scoreResults.slice(0, 5)


      })


    },

    loadSuggestd: async function(pname){
      this.instanceSelected = pname
      this.loadInstance()

    },

    loadInstance: async function(){

      // if not provided load a test one for testing
      if (this.instanceEditorLink==''||this.instanceEditorLink==null){
        this.instanceEditorLink = this.instanceTests[Math.floor(Math.random() * this.instanceTests.length)];

      }
      


      this.$store.dispatch("fetchBfdbXML", { self: this, url: this.instanceEditorLink }).then(async () => {
      // 


        parseBfdb.parse(this.bfdbXML)

        // alert(parseBfdb.hasItem)

        let useProfile = null
        // find the right profile to feed it
        for (let key in this.profiles){
          if (this.profiles[key].rtOrder.indexOf(this.instanceSelected)>-1){
            useProfile = JSON.parse(JSON.stringify(this.profiles[key]))
            
          }
        }

        // console.log("==========loadInstance")
        // console.log(JSON.parse(JSON.stringify(useProfile)))
        // we might need to load in a item

        if (parseBfdb.hasItem>0){ 


          // loop the number of ITEMS there are in the XML
          Array.from(Array(parseBfdb.hasItem)).map((_,i) => {
            


            // look for the RT for this item
            let useItemRtLabel = this.instanceSelected.replace(':Instance',':Item')
            console.log('looking for useItemRtLabel',useItemRtLabel)

            let foundCorrectItemProfile = false

            for (let pkey in this.profiles){
              for (let rtkey in this.profiles[pkey].rt){
                if (rtkey == useItemRtLabel){
                  let useRtLabel =  useItemRtLabel + '-' + (i+1) 
                  let useItem = JSON.parse(JSON.stringify(this.profiles[pkey].rt[rtkey]))

                  // make the guids for all the properties unique
                  for (let ptk in useItem.pt){
                    useItem.pt[ptk]['@guid'] = short.generate()
                  }


                  console.log('uysing',this.profiles[pkey].rt[rtkey])
                  foundCorrectItemProfile = true
                  useProfile.rtOrder.push(useRtLabel)
                  useProfile.rt[useRtLabel] = useItem     
                  console.log(JSON.parse(JSON.stringify(useProfile)))           
                }
              }
            }


            if (!foundCorrectItemProfile){
              console.log('---------')
              console.log(this.rtLookup[useItemRtLabel])
            }




          });







        }

        console.log("USING NWWW",useProfile)

        if (!useProfile.log){
          useProfile.log = []
        
        }
        useProfile.log.push({action:'loadInstance',from:this.instanceEditorLink})
        useProfile.procInfo= "update instance"


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

        // console.log("==========loadInstance2")
        // console.log(JSON.parse(JSON.stringify(useProfile)))
        
        this.transformResults  = await parseBfdb.transform(useProfile)


        // console.log("==========loadInstance3")
        // console.log(JSON.parse(JSON.stringify(this.transformResults)))

        // let workkey = this.transformResults.rtOrder.filter((k)=> k.endsWith(":Instance"))[0]
        // this.transformResultsDisplay = this.transformResults.rt[workkey]



        await this.$store.dispatch("setActiveRecordSaved", { self: this}, false)

        // this.$store.dispatch("setActiveRecordSaved", { self: this}, false).then(() => {

        // })


        // let xml = await exportXML.toBFXML(this.transformResults)
        // console.log(xml)
        // console.log('here')


        
        
        this.$store.dispatch("clearUndo", { self: this})

        this.$store.dispatch("setActiveProfile", { self: this, profile: this.transformResults }).then(async () => {

          if (this.settingsDisplayMode == 'spreadsheet'){
            this.$router.push({ name: 'CompactEdit', params: { recordId: useProfile.eId } })
          }else{
            this.$router.push({ name: 'Edit', params: { recordId: useProfile.eId } })

          }


          


          this.$store.dispatch("setActiveUndo", { self: this, msg:'Loaded record'})

          // also save it since it now has a perm URL
          // let xml = await exportXML.toBFXML(this.transformResults)
          // lookupUtil.saveRecord(xml.xlmStringBasic, useProfile.eId)
          this.$store.dispatch("forceSave", { self: this}, true).then(() => {
            this.$store.dispatch("setActiveRecordSaved", { self: this}, true).then(() => {
            })    
          })     

      




        })






      })


    },

    load: function(useId,goEdit){


      this.$store.dispatch("fetchIdXML", { self: this, url: useId }).then(() => {
        // the xml is loaded
        //
        parseId.parse(this.idXML)

        let useProfile = null
        // find the right profile to feed it
        for (let key in this.profiles){
          if (this.profiles[key].rtOrder.indexOf(this.useRtSelected)>-1){
            useProfile = JSON.parse(JSON.stringify(this.profiles[key]))
          }
        }

        // 
        this.transformResults  = parseId.transform(useProfile)

        let workkey = this.transformResults.rtOrder.filter((k)=> k.includes(":Work"))[0]


        this.transformResultsDisplay = this.transformResults.rt[workkey]




        if (goEdit){
          this.$store.dispatch("setActiveProfile", { self: this, profile: this.transformResults }).then(() => {

            this.$router.push({ path: 'edit' })
          })
        }

        // this.$router.push({ path: 'edit' })

        // 
        // 

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
    settingsDisplayMode: 'settingsDisplayMode',
    rtLookup:'rtLookup',
    idXML:'idXML',
    bfdbXML:'bfdbXML',
    catInitials:'catInitials',
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
      suggestHardCoded: [],
      suggestScore: [],


      instanceTests:[
        // '/bfe2/editor/tests/instances/c0010058400001.editor-pkg.xml', //book
        
        // '/bfe2/editor/tests/instances/c0214680420001.editor-pkg.xml', // russian book


        // '/bfe2/editor/tests/instances/21210374.editor-pkg.xml', // xml error - hebrew book


        // '/bfe2/editor/tests/instances/21533302.editor-pkg.xml', // subject editing test





        // '/bfe2/editor/tests/instances/20969670.editor-pkg.xml', // non-latin souble title


        // '/bfe2/editor/tests/instances/22395548.editor-pkg.xml', // multiple non-latin literal values in main title and provision activity

        // '/bfe2/editor/tests/instances/21340456.editor-pkg.xml', 
        
        // '/bfe2/editor/tests/instances/21295922.editor-pkg.xml', 

        // '/bfe2/editor/tests/instances/22519577.editor-pkg.xml', // non uri auth label dvd example



        '/bfe2/editor/tests/instances/22471751.editor-pkg.xml', // DVD fields not populating



        // '/bfe2/editor/tests/instances/20898769.editor-pkg.xml', // new production activity



        // '/bfe2/editor/tests/instances/22205817.editor-pkg.xml', // korean

        // '/bfe2/editor/tests/instances/5720460.editor-pkg.xml', // items duplicating

        // '/bfe2/editor/tests/works/c017943071.rdf', // work only


        // '/bfe2/editor/tests/instances/22228035.editor-pkg.xml', // geo coverage test

        


        // '/bfe2/editor/tests/instances/c0207030850001.editor-pkg.xml', // has invalid headings


        // '/bfe2/editor/tests/instances/21923950.editor-pkg.xml', // item test

        // '/bfe2/editor/tests/instances/4602142.editor-pkg.xml', // multiple items

        // '/bfe2/editor/tests/instances/13392490.editor-pkg.xml', // Sound?

        // '/bfe2/editor/tests/instances/12393608.editor-pkg.xml', // Supressed


        // '/bfe2/editor/tests/instances/22255785.editor-pkg', // error?

        // '/bfe2/editor/tests/instances/22255785.editor-pkg (1).xml', // error?




        // '/bfe2/editor/tests/instances/22295832.editor-pkg.xml', // OTHER PHYSICAL THING



        // '/bfe2/editor/tests/instances/5823055.editor-pkg.xml', // Map, contributor not loading
        
        // '/bfe2/editor/tests/instances/5823055_real.editor-pkg.xml', // Map, contributor not loading



        // '/bfe2/editor/tests/works/loc.natlib.works.e37922655107918597887531234370352861771.rdf', // work only

        // '/bfe2/editor/tests/works/c021295478.rdf', // work only


        // '/bfe2/editor/tests/instances/c0218930920001.editor-pkg.xml', // serial bad
        

        // '/bfe2/editor/tests/instances/c0210643040001.editor-pkg.xml',   // serial 
        // '/bfe2/editor/tests/instances/c0122950980001.editor-pkg.xml', // sound recording
        


        // '/bfe2/editor/tests/instances/e2324557043013562145333356239676927794980001.editor-pkg.xml', // sound recording
        // '/bfe2/editor/tests/instances/c0056343030001.editor-pkg.xml', // ??? - is wild


        // '/bfe2/editor/tests/instances/c0202249350001.editor-pkg.xml', // ???



        // '/bfe2/editor/tests/hubs/6a226bae-b08e-a7f8-fd54-dbef6017c702.idedit.rdf', // da hub

        

      ] 

    }
  },
  created: function(){

   // this.$store.dispatch("fetchIdWorkSearch", { self: this, searchValue: 'Woolf, Virginia, 1882-1941. To the lighthouse' }).then(() => {
   //    this.searchActive=false
   //  })



   let inerval = window.setInterval(()=>{

      if (this.profilesLoaded){


       if (this.$router.currentRoute && this.$router.currentRoute.query && this.$router.currentRoute.query.url){


        let url = this.$router.currentRoute.query.url
        if (this.$router.currentRoute && this.$router.currentRoute.query && this.$router.currentRoute.query.action && this.$router.currentRoute.query.action == 'loadwork'){
          url = url.replace('.jsonld','.rdf')
        }
        if (this.$router.currentRoute && this.$router.currentRoute.query && this.$router.currentRoute.query.action && this.$router.currentRoute.query.action == 'loadibc'){
          url = url.replace('.jsonld','.xml')
        }

        this.instanceEditorLink = url

        this.testInstance()
        console.log('ccickckckck')

        window.clearInterval(inerval)

       }



      }


   },500)





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
