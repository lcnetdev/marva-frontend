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
 
    <div v-if="config.returnUrls().displayLCOnlyFeatures" style="background-color: whitesmoke; padding: 5px;">
      <h3>Search Instance by LCCN</h3>
      <p style="">Enter LCCN to search for instance to load.</p>
      <input style=" width: 75%;" class="editor-link-input" ref="lccnToSearch" @input="searchByLccn" v-model="lccnToSearch" type="text" id="lccn-search-val" placeholder="Enter LCCN">

      <ol>

        <li v-if="searchByLccnResults && searchByLccnResults.length === 0">No results...</li>

        <template v-if="searchByLccnResults && typeof searchByLccnResults === 'string'">

          <li>Searching...</li>

        </template>
        <template v-else>
          <li v-for="(r,idx) in searchByLccnResults" :key="r.idURL">
            <div style="display:flex">
              <div style="flex:1;">{{++idx}}. <span style="font-weight:bold">{{r.label}}</span></div>
              <div style="flex:1"><a :href="r.bfdbURL" target="_blank">View on BFDB</a></div>
              <div style="flex:1"><a href="#" target="_blank" @click.prevent="instanceEditorLink = r.bfdbPackageURL; testInstance()">Retrieve</a></div>
            </div>
          </li>      
        </template>


      </ol>


    </div>



    

    <template v-if="config.returnUrls().displayLCOnlyFeatures">
      <h3 style="margin-top: 1em">Load data from BFDB</h3>
        <p style="">Go to the <a href="https://preprod-8230.id.loc.gov" target="_blank">BFDB</a> and find an instance to load. Use the editor link button to load into Marva.</p>
    </template>
    <template v-else>
      <h3>Load data from resource package</h3>


    </template>

    <div v-if="makingRequest">
      <h1><span id="loading-icon">⟳</span> Working...</h1>      
    </div>

    <div>
      <input style="width: 75%;" class="editor-link-input" ref="urlToLoad" v-model="instanceEditorLink" type="text" id="instance-editor-link" placeholder="Paste Editor Link URL">
    </div>







    <div>

      <div style="display:flex;">


        <div style="flex:1; border-right: solid 1px lightgray; margin:5px; padding-right: 5px;">
          
          <button style="font-size: 1.25em; margin-top: 0.5em;" @click="testInstance()">Suggest Profile</button> 

          

          <div v-if="suggestHardCoded.length>0" style="margin-top: 2em;background-color: aliceblue;padding: 1em;">
            <div>This record was saved using this profile:</div>
              <button style="font-size: 1.25em" v-bind:key="pname" @click="loadSuggestd(pname)" v-for="pname  in suggestHardCoded">Load using: {{pname}}</button>
          </div>
          <div v-else-if="suggestScore.length>0">


            <div style="margin-top: 2em;background-color: aliceblue;padding: 1em;">
              <div style="margin-bottom: 1em;font-weight: bold;">These profiles best fit this data (best to worst):</div>
              <div v-bind:key="idx" v-for="(pname,idx) in suggestScore" style="margin-bottom: 1em">
                <button style="font-size: 1.25em" @click="loadSuggestd(pname.id)">{{++idx}}. {{pname.profile}}</button><input @input="toggleIsFavorite('profile',pname.id,pname.profile)" type="checkbox" :checked="isAlreadyFavorite('profile',pname.id)" :name="'profile-'+pname.id" :id="'profile-'+pname.id"><label :for="'profile-'+pname.id">Add to favorites</label>
              </div>
            </div>

          </div>


        </div>
        <div style="flex:2; position: relative; min-height: 100px;">
          <div style="font-weight:bold">Favorites:</div>


          <div v-for="(f,idx) in loadResourceFavorites" :key="f.name" style="margin-left: 0.5em; display: inline-block; margin-top: 0.5em">
            <button style="font-size: 1.25em" @click="loadFromFavorite(f.type,f.name)">
              <span>{{++idx+suggestScore.length}}.</span>
              <span v-if="f.label">{{f.label}}</span>
              <span v-else>{{f.name}}</span>
            </button>
            <div v-if="showManageFavoriteCheckBoxes">
              <input @input="toggleIsFavorite(f.type,f.name,f.label)" type="checkbox" :checked="isAlreadyFavorite(f.type,f.name)" :name="'profile-'+f.name" :id="'profile-'+f.name"><label :for="'profile-'+f.name">Favorite</label>
            </div>
          </div>


          <div v-if="loadResourceFavorites.length>0" style="position: absolute; bottom: 0;">
            <a href="#" style="color:inherit; margin-left: 1em;" @click.prevent="showManageFavoriteCheckBoxes = (showManageFavoriteCheckBoxes) ? false : true">Manage Favorites</a>
          </div>
          <div v-else>
            No favorites added yet...
          </div>

        </div>


      </div>




      <select style="width: 76%;" class="editor-link-input" v-model="instanceSelected">
        <option v-for="key in rtLookupInstances" :key="key"  :selected="(key === 'lc:RT:bf2:Monograph:Instance') ? true : false"  >{{key}}</option>
      </select>
      <div>
      <button style="font-size: 1.25em; margin-top: 0.5em;" @click="loadInstance()">Manually Select Profile</button> 
      <a href="#" style="color:inherit; margin-left: 1em;" @click.prevent="toggleIsFavorite('profile',instanceSelected)">Add selected to favorites</a>
      </div>

  </div>


    
    <div style="">
      <hr style="margin-top:2em">

      <h3>Load into Template</h3>

      <HomeUserTemplateList parentComponent="HomeLoadComponent" @loadUsingUserTemplate="loadUsingUserTemplate"/>
    </div>




    <!-- Old code below, there used to be a feature to load works from id.loc.gov -->



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
import parseId from '@/lib/parseId'
import parseBfdb from '@/lib/parseBfdb'
import config from "@/lib/config"


// import uiUtils from "@/lib/uiUtils"
// import exportXML from "@/lib/exportXML"
import lookupUtil from "@/lib/lookupUtil"

const short = require('short-uuid');
const decimalTranslator = short("0123456789");


import HomeUserTemplateList from "@/components/HomeUserTemplateList.vue";

export default {
  name: "HomeLoadComponent",
  components: {
      // Keypress: () => import('vue-keypress')
      HomeUserTemplateList
  },
  props: {
  },
  methods: {



    /**
    * Loads a resource using the favorite, just passes it to the other load mechanisms based on the favoite type 
    * @param {string} type - the favorite catagory / type, template or profile
    * @param {string} name - the unique name the favorite is stored as
    * @return {void}
    */
    loadFromFavorite: function(type, name){
      // check to add or remove

      if (type === 'profile'){
        this.loadSuggestd(name)
      }else if (type === 'template'){
        document.getElementById(`template-${name}`).click()
      }
    },






    /**
    * Triggers a lccn search based on the data in lccnToSearch variable
    * @async
    * @return {void}
    */    
    searchByLccn: async function(){

      // lccns are not short
      if (this.lccnToSearch.length < 8){ return false}

      window.clearTimeout(this.lccnToSearchTimeout)
      this.searchByLccnResults = 'Searching...'
      this.lccnToSearchTimeout = window.setTimeout(async ()=>{

        this.searchByLccnResults = await lookupUtil.searchInstanceByLCCN(this.lccnToSearch)
        console.log(this.searchByLccnResults)

      },500)
    },

    /**
    * Sets a profile or template as a favorite which is stored in the state
    * @param {string} type - the favorite catagory / type, template or profile
    * @param {string} name - the unique name the favorite is stored as
    * @param {string} label - the dispaly label to use, sometimes starting points have better labels than just the profile idenfiter
    * @return {void}
    */
    toggleIsFavorite: function(type, name, label){
      // check to add or remove
      if (this.isAlreadyFavorite(type,name)){
        this.$store.dispatch("removeLoadResourceFavorite", { self: this, type: type, name: name, label: label })
      }else{
        this.$store.dispatch("addLoadResourceFavorite", { self: this, type: type, name: name, label: label })
      }      
    },


    /**
    * Tests if a profile type and name is already a favorite
    * @param {string} type - the favorite catagory / type, template or profile
    * @param {string} name - the unique name the favorite is stored as
    * @return {boolean} - returns true if it is and false if not
    */
    isAlreadyFavorite: function(type, name){

      // see if the requested is in the favorites list
      if (this.loadResourceFavorites.filter((f)=>{ return (f.type === type && f.name === name)}).length>0){
        return true
      }else{
        return false
      }

    },


    /**
    * Triggers a parseBfdb.testProfiles call that will return profiles that best match the data
    * the results are stored in the data as suggestHardCoded which are any profiles that were encoded in the adminMetadata
    * and suggestScore which holds all the results
    * @return {void}
    */

    testInstance: async function(){

      this.suggestHardCoded= []
      if (this.instanceEditorLink==''||this.instanceEditorLink==null){
        this.instanceEditorLink = this.instanceTests[Math.floor(Math.random() * this.instanceTests.length)];

      }
      this.makingRequest=true
      this.$store.dispatch("fetchBfdbXML", { self: this, url: this.instanceEditorLink }).then(async () => {
        this.makingRequest=false
        if (!this.bfdbXML || this.bfdbXML.substring(0,5) === 'ERROR'){
          alert("There was an error requesting that record")
          return false
        }else{

          parseBfdb.parse(this.bfdbXML)
          let results = parseBfdb.testProfiles(this.profiles)
          if (results.hardCoded){
              // if it found the work and the instance just show the instance
              if (results.hardCoded.filter((v)=>{ return (v.includes(":Work"))}).length>0 && results.hardCoded.filter((v)=>{ return (v.includes(":Instance"))}).length>0 ){
                results.hardCoded = results.hardCoded.filter((v)=>{ return (v.includes(":Instance"))})
              }
              this.suggestHardCoded = results.hardCoded
          }
          // console.log(results.scoreResults)
          // HACK - manually exclude some profiles based on keywords in their name
          results.scoreResults = results.scoreResults.filter((v)=>{return (v.id)})
          results.scoreResults = results.scoreResults.filter((v)=>{return (!v.id.includes("test"))})
          results.scoreResults = results.scoreResults.filter((v)=>{return (!v.profile.includes("test"))})
          results.scoreResults = results.scoreResults.filter((v)=>{return (!v.profile.includes("lc:profile"))})
          this.suggestScore = results.scoreResults.slice(0, 5)
        }
      })
    },

    /**
    * Simple triggers the loadInstance after setting  instanceSelected based on what pass passed to it
    * @async
    * @param {object} pname - the name of the profile being selected to use to parse the data
    * @return {void}
    */
    loadSuggestd: async function(pname){
      this.instanceSelected = pname
      this.loadInstance()
    },


    /**
    * Simple triggers the loadInstance apulling the profile out of the template storage
    * @async
    * @param {object} profile - the template saved object from the API
    * @return {void}
    */
    loadUsingUserTemplate: async function(profile){
      if (this.$refs.urlToLoad.value.trim() === ''){
        alert('You must enter a resource address first above.')
        return false
      }
      let profileParsed = JSON.parse(profile.profile)
      profileParsed.isTemplate=true
      this.instanceSelected = profileParsed
      await this.loadInstance()

    },

    /**
    * fetches the XML, asks parseBfdb to parse it then prepares the profile to be worked on
    * and finally sets the app state to edit it 
    * @async
    * @return {void}
    */
    loadInstance: async function(){
      // if not provided load a test one for testing
      if (this.instanceEditorLink==''||this.instanceEditorLink==null){
        this.instanceEditorLink = this.instanceTests[Math.floor(Math.random() * this.instanceTests.length)];
      }    
      this.makingRequest=true
      this.$store.dispatch("fetchBfdbXML", { self: this, url: this.instanceEditorLink }).then(async () => {

        if (!this.bfdbXML || this.bfdbXML.substring(0,5) === 'ERROR'){
          this.makingRequest=false
          alert("There was an error requesting that record")
          return false
        }else{
          parseBfdb.parse(this.bfdbXML)

          let useProfile = null
          if (this.instanceSelected && this.instanceSelected.isTemplate){
            useProfile = JSON.parse(JSON.stringify(this.instanceSelected))
          }else{
            // find the right profile to feed it
            for (let key in this.profiles){
              if (this.profiles[key].rtOrder.indexOf(this.instanceSelected)>-1){
                useProfile = JSON.parse(JSON.stringify(this.profiles[key]))
              }
            }

          }

          // we might need to load in a item
          if (parseBfdb.hasItem>0){ 
            // loop the number of ITEMS there are in the XML
            Array.from(Array(parseBfdb.hasItem)).map((_,i) => {
              let useItemRtLabel
              // look for the RT for this item
              if (this.instanceSelected && this.instanceSelected.isTemplate){
                // we need to build the Rtlabel for what an instance would look like for this template, so we need to find the instance first
                let instanceRtLabel = this.instanceSelected.rtOrder.filter((v)=>{ return v.includes(':Instance') })[0]
                useItemRtLabel = instanceRtLabel.replace(':Instance',':Item')
              }else{
                useItemRtLabel = this.instanceSelected.replace(':Instance',':Item')
              }
              // console.log('looking for useItemRtLabel',useItemRtLabel)

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


                    // console.log('using',this.profiles[pkey].rt[rtkey])
                    foundCorrectItemProfile = true
                    useProfile.rtOrder.push(useRtLabel)
                    useProfile.rt[useRtLabel] = useItem     
                    // console.log(JSON.parse(JSON.stringify(useProfile)))           
                  }
                }
              }


              if (!foundCorrectItemProfile){
                console.warn('error: foundCorrectItemProfile not set ---------')
                console.warn(this.rtLookup[useItemRtLabel])
              }
            });
          }

          if (!useProfile.log){
            useProfile.log = []
          }

          // setup the log and set the procinfo so the post process knows what to do with this record
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
          this.transformResults  = await parseBfdb.transform(useProfile)

          await this.$store.dispatch("setActiveRecordSaved", { self: this}, false)      
          this.$store.dispatch("clearUndo", { self: this})
          this.$store.dispatch("setActiveProfile", { self: this, profile: this.transformResults }).then(async () => {

            if (this.settingsDisplayMode == 'spreadsheet'){
              // this.$router.push({ name: 'CompactEdit', params: { recordId: useProfile.eId } })
              this.$router.push({ name: 'Edit', params: { recordId: useProfile.eId } })
            }else{
              this.$router.push({ name: 'Edit', params: { recordId: useProfile.eId } })
            }

            this.$store.dispatch("setActiveUndo", { self: this, msg:'Loaded record'})
            this.makingRequest=false
            // also save it since it now has a perm URL
            // let xml = await exportXML.toBFXML(this.transformResults)
            // lookupUtil.saveRecord(xml.xlmStringBasic, useProfile.eId)
            this.$store.dispatch("forceSave", { self: this}, true).then(() => {
              this.$store.dispatch("setActiveRecordSaved", { self: this}, true).then(() => {
              })    
            })     
          })
        }
      })
    },







    /**
    * CURRENTLY UNUSED
    * Triggers a search request to ID for work search. 
    *
    * @param {Object} event - dom event, uses the target.value of the event
    * @return {void}
    */
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
    loadResourceFavorites: 'loadResourceFavorites',
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

      makingRequest: false,

      // used in lccn search
      lccnToSearch: null,
      lccnToSearchTimeout: false,
      searchByLccnResults: null,

      // in the favorites list shows the checkboxes to remove them
      showManageFavoriteCheckBoxes: false,

      config: config,

      // stores results of testInstance if any profiles were found hard coded in adminMetadata
      suggestHardCoded: [],
      // stores the result of testInstance comparing the profiles to the active parsed xml doc
      suggestScore: [],



      // hard coded paths to test records
      instanceTests:[
        // '/bfe2/editor/tests/instances/c0010058400001.editor-pkg.xml', //book
        
        // '/bfe2/editor/tests/instances/c0214680420001.editor-pkg.xml', // russian book


        // '/bfe2/editor/tests/instances/21210374.editor-pkg.xml', // xml error - hebrew book


        '/bfe2/editor/tests/instances/21533302.editor-pkg.xml', // subject editing test





        // '/bfe2/editor/tests/instances/20969670.editor-pkg.xml', // non-latin souble title


        // '/bfe2/editor/tests/instances/22395548.editor-pkg.xml', // multiple non-latin literal values in main title and provision activity

        // '/bfe2/editor/tests/instances/21340456.editor-pkg.xml', 
        
        // '/bfe2/editor/tests/instances/21295922.editor-pkg.xml', 

        // '/bfe2/editor/tests/instances/22519577.editor-pkg.xml', // non uri auth label dvd example



        // '/bfe2/editor/tests/instances/22471751.editor-pkg.xml', // DVD fields not populating



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
   // // kicks off a ID work search on load
   // this.$store.dispatch("fetchIdWorkSearch", { self: this, searchValue: 'Woolf, Virginia, 1882-1941. To the lighthouse' }).then(() => {
   //    this.searchActive=false
   //  })


   // does an interval that checks until the profiles are loaded
   // once loaded it checks the URL to see if info was passed to populate the input box to load with
   // &action can be loadwork or loadibc
   // &url is the http path to the resource to load
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

  h3{
    margin: 0;
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
