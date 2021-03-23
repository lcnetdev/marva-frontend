<template>



  <div >
    <Keypress key-event="keydown" :key-code="27" @success="closeModal" />
    <Keypress key-event="keydown" :multiple-keys="[{keyCode: 66, modifiers: ['ctrlKey'],preventDefault: true}]" @success="togglePreCoordinated" />

    <div v-if="nested == false" class="component-container">
      <div class="component-container-title">{{structure.propertyLabel}}</div>
      <div class="component-container-input-container">
          <div class="component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border temp-icon-search"> 
            <div v-if="userData[structure.propertyURI]">
              Data
            </div>
            <input v-else bfeType="EditComplexLookupComponent" :id="assignedId"  v-on:focus="focused" type="text"  class="selectable-input input-single" @keydown="activate($event)"   />
          </div>
      </div>
    </div>


    <div v-else>
  <!--     <div class="component-container-title">{{structure.propertyLabel}}</div>
   -->    

      <div style="position: relative;" v-bind:class="['component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border temp-icon-search']">       
          <div class="component-nested-container-title" style="top: 0; width: 100%">{{structure.propertyLabel}}</div>

          <!-- if there is userdata for this type of componet then it is a lookedup entity, make the entity, dont display the inputfield -->
          <div v-if="userData['http://www.w3.org/2000/01/rdf-schema#label'] || userData.URI" style="position: absolute; width: 100%">
              <div style="display: flex;">
                <div class="selected-value-container-nested" style="display: inline-block; position: relative; bottom: 2px;">
                    <span  @click="toggleSelectedDetails" style="padding-right: 0.3em; font-weight: bold"><span class="selected-value-icon" v-html="returnAuthIcon(userData['@type'])"></span>{{returnAuthLabel(userData)}}</span>
                    <span  @click="removeValue" style="border-left: solid 1px black; padding: 0 0.5em; font-size: 1em">x</span>
                </div>

                <!-- We are displaying the input here to act as a landing pad for when moving through and also to double detel remove lookups -->
                <form style="display: inline-block; width: 90%" autocomplete="off" v-on:submit.prevent>
                  <input style="display: inline-block;"  bfeType="EditComplexLookupComponent" type="text" class="selectable-input input-nested" :id="assignedId" @keydown="doubleDeleteCheck"  v-on:focus="focused"   />
                </form>
              </div>

              <!-- This is the detail drop down that can be click to show context of the entitiy -->
              <div v-if="displaySelectedDetails==true" class="selected-value-details">
                
                <button class="selected-value-details-close" @click="toggleSelectedDetails">Close</button>
                <a style="color:white; text-decoration: none;" target="_blank" :href="userData.URI">View Entity</a>
                <div class="modal-context-data-title">{{userData['@type']}}</div>

                <div v-if="userData.context">
                  <div v-if="userData.context.variant.length>0">
                    <div class="modal-context-data-title">Varients:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="(v,idx) in userData.context.variant" v-bind:key="'var' + idx">{{v}}</li>
                    </ul>


                  </div>

                  <div v-for="key in Object.keys(userData.context.nodeMap)" :key="key">
                    <div class="modal-context-data-title">{{key}}:</div>
                      <ul>
                        <li class="modal-context-data-li" v-for="v in userData.context.nodeMap[key]" v-bind:key="v">{{v}}</li>
                      </ul>
                  </div>


                  <div v-if="userData.context.source.length>0">
                    <div class="modal-context-data-title">Sources:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="v in userData.context.source" v-bind:key="v">{{v}}</li>
                    </ul>


                  </div>    
                </div>            

                
              </div>
          </div>

          <!-- Just display the input, no data populated -->
          <form v-else autocomplete="off" v-on:submit.prevent>
            <input  bfeType="EditComplexLookupComponent" type="text" class="selectable-input input-nested" :id="assignedId"  v-on:focus="focused" @keydown="activate($event)"   />
          </form>
      </div>
    </div>



    <!-- Always build this interface, the lookup modal -->

    <div :id="assignedId" @click="closeModal" v-bind:class="['modaloverlay',{'modal-display':displayModal}]">
      <div v-bind:class="['modal']">

        <div>
          <div class="close temp-icon-close" @click="closeModal"></div>
          <div class="modal-title">Lookup</div>
          <div class="modal-content">
            <div v-bind:class="['modal-content-flex-container',{'modal-content-flex-container-complex':(canBuildComplex()==true && displayPreCoordinated == true), 'modal-content-flex-container-complex-prompt': displayPreCoordinated==false, 'modal-content-flex-container-complex-hide' : (canBuildComplex()==false) }]">


              
              <div class="modal-content-left">

                <div style="height: 20%;">
                  <div class="modal-switch-values-container component-container-fake-input no-lower-right-border-radius" style="flex:4; border-top-left-radius: 0.5em; ">          
                    <div style="display: flex">
                      <div style="flex:1">
                        <form autocomplete="off">
                          <input class="no-lower-right-border-radius" :id="assignedId+'switch'" bfeType=""  v-on:focus="focused" autocomplete="off" v-bind:value="modeSelect" @keydown="switchTypes($event)" type="text" style="width: 95%; border:none; height: 90%; font-size: 1.5em; padding: 0.1em; background: none">
                        </form>              
                      </div>
                      <button class="temp-icon-switch fake-real-button simptip-position-top" :data-tooltip="'Select subset of the vocabulary to use [Left] or [Right Arrow]'" @click="switchTypes($event, true)">
                      </button>
                    </div>
                  </div>


                  <div v-bind:class="['component-container-fake-input no-upper-right-border-radius no-upper-border modal-switch-values-container']" style="border-bottom-left-radius: 0.5em; ">
                    <form autocomplete="off" >
                      <input bfeType="" v-model="searchValue" ref="searchInput"  :id="assignedId+'search'" :name="assignedId" v-on:keydown.enter.prevent="submitField" v-on:focus="focused" autocomplete="off" type="text" @keydown="searchNav($event)" @keyup="search($event)"  style="width: 95%; border:none; height: 90%; font-size: 2em; padding: 0.2em 0.1em 0.2em 0.1em; background: none">
                    </form>
                  </div>

                </div>

                <div v-bind:class="['complex-lookup-results',{'complex-lookup-results-complex':canBuildComplex()}]">
                  <div v-if="activeComplexSearch.length == 0 && activeComplexSearchInProgress == false && initalSearchState != true">
                    <h5>No results found.</h5>
                  </div>
                  <div v-if="activeComplexSearchInProgress == true">
                    <h5>Searching...</h5>
                  </div>

                  <select size="10"  class="modal-entity-select" :id="assignedId+'select'" @change="selectChange($event)"  style="height: 100%" @keydown="selectNav($event)">
                    <option v-for="(r,idx) in activeComplexSearch" :value="r.uri" v-bind:key="idx" class="complex-lookup-result" v-html="returnAuthIcon(r) + ' ' + r.label">
                    </option>
                  </select>

             


                </div>


              </div>
              <div class="modal-content-right">
                <div class="modal-context" v-if="Object.keys(contextData).length>0">
                  
                  
                  <h3><span class="modal-context-icon simptip-position-top" :data-tooltip="'Type: ' + contextData.type" v-html="returnAuthIcon(contextData.type)"></span>{{contextData.title}}</h3>

                  <div class="modal-context-data-title">{{contextData.type}}</div>

                  <div v-if="contextData.variant.length>0">
                    <div class="modal-context-data-title">Varients:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="(v,idx) in contextData.variant" v-bind:key="'var' + idx">{{v}}</li>
                    </ul>


                  </div>

                  <div v-for="key in Object.keys(contextData.nodeMap)" :key="key">
                    <div class="modal-context-data-title">{{key}}:</div>
                      <ul>
                        <li class="modal-context-data-li" v-for="v in contextData.nodeMap[key]" v-bind:key="v">{{v}}</li>
                      </ul>
                  </div>


                  <div v-if="contextData.source.length>0">
                    <div class="modal-context-data-title">Sources:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="v in contextData.source" v-bind:key="v">{{v}}</li>
                    </ul>


                  </div>


                </div>    

                <div class="modal-context-add-menu" v-if="Object.keys(contextData).length != 0">
                  

                  <button v-if="precoordinated.length == 0" @click="add" class="">Add Selected [Enter]</button>
                  <button v-else @click="add" class="simptip-position-left"  :data-tooltip="''">Add Pre-Coordinated [Enter]</button>

             
                </div>

              </div>
            </div>
            <div v-if="displayPreCoordinated==true" class="modal-context-build-manual"> 

              <div class="modal-context-build-manual-buttons"> 
                <div>Build manual pre-coordinated: Add selected as a subdivision: </div>
                <button style="width: 11em;" @click="precoordinatedAddSubdivision('Topic')">Heading or Topical
                  [CRTL+1]
                </button>

                <button style="width: 9em;" @click="precoordinatedAddSubdivision('Geographic')">Geographic
                  [CRTL+2]
                </button>
                <button style="width: 9em;" @click="precoordinatedAddSubdivision('Temporal')">Chronological
                  [CRTL+3]
                </button>
                <button style="width: 6em;" @click="precoordinatedAddSubdivision('GenreForm')">Form
                  [CRTL+4]
                </button>                
                <button style="width: 7em;" @click="precoordinatedRemoveLast()">Remove Last
                  [CRTL+5]
                </button>  
              </div>

              <div class="modal-context-build-manual-precoordinted-display" > 
                <span v-if="precoordinated.length == 0">Your pre-coordinated heading will display here when you add subdivisions</span>

                <span> {{precoordinated.map((p)=>{return p.label}).join("--") }} </span>

              </div>
            </div>
            <div v-else class="modal-context-build-manual" style="text-align: center; cursor: pointer;" @click="togglePreCoordinated">
              Build [CTRL+B] a pre-coordinated heading.
            </div>
          </div> <!--- end modal-content --->
          


        </div>
      </div>
    </div>
  </div>    
</template>

<script>


import { mapState } from 'vuex'
import uiUtils from "@/lib/uiUtils"
import config from "@/lib/config"
import parseProfile from "@/lib/parseProfile"

export default {
  name: "EditComplexLookupComponent",
  components: {    
    Keypress: () => import('vue-keypress')    
  },  
  props: {
    structure: Object,
    parentStructure: Array,
    profileCompoent: String,
    parentStructureObj: Object,
    profileName: String,
    activeTemplate: Object,
    parentURI: String,

    nested: Boolean

  },
  data: function() {
    return {

      displayModal: false,
      lookups: this.structure.valueConstraint.useValuesFrom,
      lookupConfig: config.lookupConfig,
      modeSelect: "All",
      searchValue: "",
      searchTimeout: null,
      selectLastIndex: null,
      initalSearchState: true,
      selectNavTimeout: null,
      componentKey: 0,
      displaySelectedDetails: false,
      doubleDelete: false,
      precoordinated: [],
      displayPreCoordinated: false,

      userData: {}
    }
  },
  created: function(){

    this.checkForUserData()

  },
  computed: mapState({
    lookupLibrary: 'lookupLibrary',
    activeInput: 'activeInput',
    activeProfile: 'activeProfile', 
    activeComplexSearch: 'activeComplexSearch',
    activeComplexSearchInProgress: 'activeComplexSearchInProgress',
    contextData: 'contextData',
    assignedId (){
      return uiUtils.assignID(this.structure,this.parentStructure,config)
    },

    modalSelectOptions(){

      let options = []

      // add in the the defaul search ALL of everything possible
      options.push({label: 'All', urls:null, processor:null})

      this.structure.valueConstraint.useValuesFrom.forEach((l)=>{
        if (this.lookupConfig[l]){
          this.lookupConfig[l].modes.forEach((mode)=>{
            
            Object.keys(mode).forEach((k)=>{
              options.push({label: k, urls:mode[k].url, processor:this.lookupConfig[l].processor, all:mode[k].all })
            })
          })
        }
      })
      return options
    },

    modalSelectOptionsLabels(){
      return this.modalSelectOptions.map((o)=>{return o.label})
    },





    // to access local state with `this`, a normal function must be used
    lookupVocab (state) {
      // let uri = this.structure.valueConstraint.useValuesFrom[0]

      // let returnVal = []
      // Object.keys(state.lookupLibrary).forEach((s)=>{
      //   
      // })
      // 
      // if (state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]){
      //   
      //   return state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]
      // }else{
      //   return []
      // }
      return state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]

      
    }
  }),  
  methods:{


    focusCurrentInput: uiUtils.focusCurrentInput,

    returnAuthIcon: uiUtils.returnAuthIcon,

    returnAuthLabel: uiUtils.returnAuthLabel,


    camelize: function (str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      });
    },


    submitField: function(){
      return this.add()
    },

    precoordinatedAddSubdivision: function(type){

      if (Object.keys(this.contextData).length==0) return false


      let label = this.contextData.title
      let uri  = this.contextData.uri
      let contextType = this.contextData.type

      if (contextType != type){
        alert(`${label} is not a ${type} type heading`)
        return false
      }

      this.precoordinated.push({uri:uri,label:label,type:contextType,typeFull:this.contextData.typeFull})

      this.$refs.searchInput.focus()

    },

    precoordinatedRemoveLast: function(){

      if (this.precoordinated.length>0){
        this.precoordinated.splice(-1,1)
      }
      console.log(this.precoordinated)

    },


    canBuildComplex: function(){
      
      if (this.structure.valueConstraint.useValuesFrom.indexOf('http://id.loc.gov/authorities/subjects')>-1) return true

      return false

    },

    togglePreCoordinated: function(event){

      if (this.displayPreCoordinated == false && this.displayModal == true){

        this.displayPreCoordinated = true
        console.log('hery heree',this.displayPreCoordinated )
        if(event && event.event){
          event.event.preventDefault()
          return false
        }
      }else{
        this.displayPreCoordinated = false  
        if(event && event.event){
          event.event.preventDefault()
          return false
        }        
      }


    },
    removeValue: function(){


          this.userData = {}
          this.$store.dispatch("clearContext", { self: this}).then(() => {

            this.$store.dispatch("addValue", { self: this, profileComponet: this.profileCompoent, template:this.activeTemplate, structure: this.structure })
            .then(() => {

              this.checkForUserData()
              // put the focus back on the input
              setTimeout(()=>{
                document.getElementById(this.assignedId).focus()
              },0)
            })
          })   


    },

    doubleDeleteCheck: function(event){

      if (event && event.key && event.key==='Backspace'){ 

        if (this.doubleDelete){

          this.removeValue()

        }else{
          this.doubleDelete = true        
        }
      }else if(event.key!='ArrowUp' && event.key!='ArrowDown' && event.key!='Tab'){
        event.preventDefault()
        return false

      }
    },


    toggleSelectedDetails: function(){

      if (this.displaySelectedDetails){
        this.displaySelectedDetails = false

        // put the focus back on the input
        setTimeout(()=>{
          document.getElementById(this.assignedId).focus()
        },0)


      }else{
        this.displaySelectedDetails = true
      }

    },

    checkForUserData: function(){

      let uv = parseProfile.returnUserValues(this.activeProfile, this.profileCompoent,this.structure.propertyURI)
      // console.log("<<<<",uv,this.parentStructureObj,"")
      console.log(uv,"<<<<<<<uvuv uvuvuvuvuvuvuvuvuvuvuvuvuvuvuv",this.structure.propertyURI)

      if (uv[this.structure.propertyURI]){
        // console.log('yehh',uv[this.structure.propertyURI])
        this.userData = uv[this.structure.propertyURI]
      }else  if (uv[this.parentStructureObj.propertyURI]){
        this.userData = uv[this.parentStructureObj.propertyURI]

      // we store subject headings in sameAs property
      }else if (uv['http://www.w3.org/2002/07/owl#sameAs']){
        this.userData =uv['http://www.w3.org/2002/07/owl#sameAs']
      }

      // console.log("IT IS NOW>",this.userData)

    },

    activate: function(event){

      // this skips activating the modal if they are simply navigating through the main field list
      if (event.key==='ArrowDown' || event.key==='ArrowUp' || event.key==='PageUp' || event.key==='PageDown' || event.key==='Tab' || event.key==='Control' || event.key==='Meta' || event.key==='Alt' || event.key==='Shift' || event.key==='CapsLock' || event.key==='=' || event.key ==='Backspace' || event.key ==='Home'){
        // the = key is for adding new 
        return false
      }

      // turn on the modal
      this.displayModal = true
      this.initalSearchState = true

      this.searchValue = event.key

      this.$store.dispatch("clearContext", { self: this})

      this.$store.dispatch("clearLookupValuesComplex", { self: this}).then(() => {
        // clear the values from any previous attempt

        // but if there is a value kick off that same search again
        if (this.searchValue != ''){
          this.search()
        }
      })    

      event.preventDefault()

      // set the last input, but do it after the modal has been displaed
      setTimeout(()=>{

        document.getElementById(this.assignedId+'search').focus()
      },0)

      return false

    },

    focused: function(event){     
      this.$store.dispatch("setActiveInput", { self: this, id: event.target.id, profileCompoent: this.profileCompoent, profileName: this.profileName }).then(()=>{

        // now focus the side bars
        uiUtils.focusSidebars()


      })
    },
    closeModal: function(event){
      if (event && event.target && event.target.classList.contains('close')){
        this.displayModal = false
      }
      if (event && event.target && !event.target.classList.contains('modaloverlay')){
        return false
      }

      this.displayModal = false
      this.displayPreCoordinated = false
      this.precoordinated = []
      this.prec
      
      if (event && event.event) event.event.preventDefault()

      this.focusCurrentInput()
      
    },


    selectChange: function(event){

      // fake the target if this was not evoked from the html
      if (!event){
        event = {target: document.getElementById(this.assignedId+'select')}
      }



      // do the context lookup, try to only fire when they land on one
      window.clearTimeout(this.selectNavTimeout)
      this.selectNavTimeout = window.setTimeout(()=>{


        event.target.options.forEach((o)=>{
          if (o.selected){

            // remove the context because we're about to get a new one
            this.$store.dispatch("clearContext", { self: this})            

            this.$store.dispatch("fetchContext", { self: this, searchPayload: o.value }).then(() => {
              
            })    
          }
        })            


      },300)
      
      

    },

    // moving through the list of results
    selectNav: function(event){

      if (event.target.selectedIndex == 0){
        // pop back up into the search field
        if (event.key==='ArrowUp'){
          document.getElementById(this.assignedId+'search').focus()
          event.preventDefault();
          return false  
        }

      }
      // don't allow down arrow on the last one
      if (event.target.selectedIndex == event.target.options.length -1){
        if (event.key==='ArrowDown'){
          event.preventDefault();
          return false  
        }        
      }


      if (event.key === '1' && event.ctrlKey === true){
        
        this.precoordinatedAddSubdivision('Topic')

        event.preventDefault();
        return false 

      }
      if (event.key === '2' && event.ctrlKey === true){
        
        this.precoordinatedAddSubdivision('Geographic')

        event.preventDefault();
        return false 

      }
      if (event.key === '3' && event.ctrlKey === true){
        
        this.precoordinatedAddSubdivision('Temporal')

        event.preventDefault();
        return false 

      }
      if (event.key === '4' && event.ctrlKey === true){        
        this.precoordinatedAddSubdivision('GenreForm')
        event.preventDefault();
        return false 
      }
      if (event.key === '5' && event.ctrlKey === true){        
        this.precoordinatedRemoveLast()
        event.preventDefault();
        return false 
      }


      if (event.key==='Enter'){
        this.add()
      }       


      // if (event.key === 'b' && event.ctrlKey === true && this.displayPreCoordinated == false){        
      //   this.togglePreCoordinated()
      //   event.preventDefault();
      //   return false 
      // }


      this.selectLastIndex = event.target.selectedIndex

    },

    switchTypes: function(event, buttonPush){

      // This section is for navigating inside the modal window

      // if they click the button fake the event like they pressed arrow key
      if (buttonPush=== true){
        event = {
          key : 'ArrowRight',
          // the input
          target: event.target.parentNode.querySelector('input')
        }
        // put focus back on input so the keys work if used
        event.target.parentNode.querySelector('input').focus()
      }



      if (event.key==='ArrowRight'){
        // get the current pos, and if we are at the end loop back to the beginning
        let currPos = this.modalSelectOptionsLabels.indexOf(this.modeSelect)
        if (currPos+1 > this.modalSelectOptionsLabels.length-1){
          currPos=-1
        }
        this.modeSelect  = this.modalSelectOptionsLabels[currPos+1]
        // update the results
        this.search()
        
      
      }else if (event.key==='ArrowLeft'){
        let currPos = this.modalSelectOptionsLabels.indexOf(this.modeSelect)
        if (currPos == 0){
          currPos=this.modalSelectOptionsLabels.length
        }
        this.modeSelect = this.modalSelectOptionsLabels[currPos-1]
        // update the results
        this.search()

      }else if (event.key==='ArrowDown'){
        document.getElementById(this.assignedId+'search').focus()
        
        event.preventDefault();
        return false    

      }else{
        event.preventDefault();
        return false        
      }
    },

    // two different methods for keyup and keydown is for the navigation between fields and the keyup is for invoking the search
    searchNav: function(event){

      if (event.key==='ArrowUp'){  
        document.getElementById(this.assignedId+'switch').focus()
        event.preventDefault();
        return false              
      }
      // move focus to the select group
      if (event.key==='ArrowDown'){        
        if (document.getElementById(this.assignedId+'select').firstChild){

          document.getElementById(this.assignedId+'select').focus()
          document.getElementById(this.assignedId+'select').firstChild.selected=true

          this.selectChange()
        }
        event.preventDefault();
        return false              
      }


    },


    search: function(event){     

      if (event){
        this.searchValue = event.target.value

        // handled above do nothign
        if (event.key==='ArrowUp'){  
          return false              
        }
        if (event.key==='ArrowDown'){        
          return false              
        }
      }

      if (this.searchValue.trim()==''){
        return false
      }
      window.clearTimeout(this.searchTimeout)

      let searchPayload = {
        processor: null,
        url: []
      }
      if (this.modeSelect == 'All'){
        this.modalSelectOptions.forEach((a)=>{
          // use the ones in the config marked as "all" 
          if(a.all===true){
            searchPayload.processor=a.processor
            searchPayload.url.push(a.urls.replace('<QUERY>',this.searchValue))
          }
        })
        
      }else{
        this.modalSelectOptions.forEach((a)=>{
          if (a.label==this.modeSelect){
            searchPayload.processor=a.processor
            searchPayload.url.push(a.urls.replace('<QUERY>',this.searchValue))            
          }
        })



      }


      this.searchTimeout = window.setTimeout(()=>{    
        this.$store.dispatch("fetchLookupValuesComplex", { self: this, searchPayload: searchPayload }).then(() => {
          this.initalSearchState =false;
        })    
      }, 400)
      


    },

    // add this entity to the data for this component
    add: function(){

      // console.log(this.profileCompoent)
      // console.log(this.structure)
      // console.log(this.activeProfile)

      // are we adding a URI or building a pre-coordinated thing
      if (this.precoordinated.length > 0){

        // okay it is precoordinated
        // becase of how we are storing things in state and adding things to the profile in state we 
        // need to put our hand made pre-coordinated data into the context state and then trigger the 
        // add value state change

        // build the new context

        let precoordstring = this.precoordinated.map((p)=>{return p.label}).join("--")

        let tempContext = {
            "contextValue": true,
            "source": [],
            "type": "ComplexSubject",
            "variant": [],
            "uri": null,
            "title": precoordstring,
            "contributor": [],
            "date": null,
            "genreForm": null,
            "nodeMap": {},
            "precoordinated" : this.precoordinated
        }        


        
        // set it and then set the vlue when done
        this.$store.dispatch("setContextManually", { self: this, context: tempContext, }).then(() => {
        
          this.$store.dispatch("addValue", { self: this, profileComponet: this.profileCompoent, template:this.activeTemplate, structure: this.structure }).then(() => {
            this.componentKey++
            this.displayModal = false
            this.checkForUserData()
            // put the focus back on the input
            setTimeout(()=>{
              document.getElementById(this.assignedId).focus()
            },0)
          })  


        })  




      }else{

        if (Object.keys(this.contextData).length==0){
          return false
          // there is no context to add, so dont try
        }
        this.$store.dispatch("addValue", { self: this, profileComponet: this.profileCompoent, template:this.activeTemplate, structure: this.structure }).then(() => {
          this.componentKey++
          this.displayModal = false
          this.checkForUserData()
          // put the focus back on the input
          setTimeout(()=>{
            document.getElementById(this.assignedId).focus()
          },0)
        })   


      }



      




    }


  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

    <!-- <pre>{{JSON.stringify(structure,null,2)}}</pre> -->

<style scoped>
li::before{
  content: '';
}

li{
  padding:0.1em;
}

li span{
  padding:0.1em;
}
input{
  outline: none;
}

.modal-entity-select{
  width: 100%;
  border:none;
  overflow-x: none;
  overflow-y: auto;
  outline:none;
}
.modal-context{
  height: 85%;
  overflow-y: auto;
  padding: 0.5em;
}
.modal-context-add-menu{
  text-align: center;
    width: 100%;
    height: 3em;
    background: white;

}
.modal-context-add-menu button{
  border: none;
  border-radius: 0.5em;
  color: white;
  background-color: #2c3e50;
  font-size: 1.25em;
   padding: 0.3em;  


}
.modal-context-data-title{
  font-size: 0.9em;
  font-weight: bold;
}

.modal-context ul{
  margin-top: 0;
  margin-bottom: 0;
}
.modal-context-data-li{
  font-size: 0.85em;
}

.modal-context  h3{
  margin: 0;
  padding: 0;
}

.modal-context-icon{
  font-family: "fontello", Avenir, Helvetica, Arial, sans-serif;
  font-size: 1.25em;
  padding-right: 0.25em;

}
.modal-entity-select option{
  font-family: "fontello", Avenir, Helvetica, Arial, sans-serif;
  font-size: 1.25em;

}
.selected-value-icon{
  font-family: "fontello", Avenir, Helvetica, Arial, sans-serif;
  padding-right: 0.3em;
}
.selected-value-container{
  margin: 0.95em;
  border: solid 1px;
  border-radius: 0.5em;
  padding: 0.35em;
  font-size: 0.75em;
  background-color: whitesmoke;
  white-space: nowrap;

}
.selected-value-container-nested{
  margin: 0.25em;
  border: solid 1px;
  border-radius: 0.5em;
  padding: 0.35em;
  font-size: 0.75em;
  background-color: whitesmoke;
  white-space: nowrap;
  display: inline;
  cursor: pointer;
}

.selected-value-details button, a{
  float: right;
  border: none;
  border-radius: 0.5em;
  color: white; 
  background-color: #2c3e50 ;
  font-size: 1.25em;
   padding: 0.3em;    
}
.selected-value-details-close{
  color: #2c3e50 !important;
  border: none !important;
  background: white !important;
  border: solid 2px #2c3e50 !important; 
  margin-left: 0.75em;

}
.selected-value-details{
    position: relative;
    z-index: 100;
    width: 90%;
    background: white;
    border: solid 1px black;
    margin-top: 0.5em;
    border-radius: 0.5em;
    height: 14em;
    margin-left: 0.2em;
    overflow-y: auto;
-webkit-box-shadow: 10px 10px 15px -5px rgba(0,0,0,0.37);
-moz-box-shadow: 10px 10px 15px -5px rgba(0,0,0,0.37);
box-shadow: 10px 10px 15px -5px rgba(0,0,0,0.37);
  padding: 0.5em;    
}
.input-single{
  width: 95%;
  border:none;
  font-size: 1.5em;
  min-height: 2em;
  max-height: 2em;  
  background:none;
}
.input-nested{
  width: 95%;
  border: none;
  font-size: 1.5em;
  padding: 0.1em;
  background: none;

}

.complex-lookup-results{
  padding: 0 1em 0 1em;
  height: 63%; 
  margin-top: 1em;
}

.complex-lookup-results-complex{
  height: 75%; 
}



.fake-real-button{
  height: 4em;
  min-width: 4em;
  background-color: transparent;
  border: none;
  outline: none;
  margin: 0.15em;  
}

.modal-switch-values-container{
  width: 70%;
  margin:auto !important;
}
.component-container-fake-input:focus-within {
  border: solid 1px #a6acb7;
  background-color: #dfe5f1;
  
}
.selected-value-container{
  margin: 0.65em;
  border: solid 1px;
  border-radius: 0.5em;
  padding: 0.35em;
  font-size: 0.85em;
  background-color: whitesmoke;
}
.selected{
  border:solid 4px lightblue;
  border-radius: 5px;
}
.autocomplete-container{
  padding: 0.45em;
  position: absolute;
  z-index: 100;
  background-color: white;
  border-radius: 15px;
  -webkit-box-shadow: 0px 5px 7px -1px rgba(150,150,150,1);
  -moz-box-shadow: 0px 5px 7px -1px rgba(150,150,150,1);
  box-shadow: 0px 5px 7px -1px rgba(150,150,150,1);  
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0 10px;
}
a {
  color: #42b983;
}
form{
  height: 100%;
}
</style>
