<template>



  <div >
    
    <Keypress key-event="keydown" :key-code="27" @success="closeModal" />
    <Keypress key-event="keydown" :multiple-keys="[{keyCode: 66, modifiers: ['ctrlKey', 'shiftKey'],preventDefault: true}]" @success="togglePreCoordinated" />

    <div v-if="nested == false" class="component-container">




<!--       <div class="component-container-title">{{structure.propertyLabel}}</div>
      <div class="component-container-input-container">
          <div class="component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border temp-icon-search"> 
            <div v-if="userData[structure.propertyURI]">
              Data
            </div>
            <input v-else bfeType="EditComplexLookupComponent"  :id="assignedId"  v-on:focus="focused" type="text"  class="selectable-input input-single" @input="activate($event)"   />
          </div>
      </div>

 -->

  <div class="component-container-title">{{structure.propertyLabel}}</div>
    <div class="component-container-input-container">


      <div ref="fakeInputContainer" style="position: relative;" v-bind:class="['component-container-fake-input temp-icon-search']">       
          <div class="component-nested-container-title" style="top: 0; width: 100%">{{structure.propertyLabel}}</div>

          <!-- if there is userdata for this type of componet then it is a lookedup entity, make the entity, dont display the inputfield -->
          <div v-if="displayLabel" style="position: absolute; width: 100%">
              <div style="display: flex;">
                <div ref="displayLabel" class="selected-value-container-nested" style="display: inline-block; position: relative; bottom: 2px;">
                    <span ref="displayLabelSpan" @click="toggleSelectedDetails" style="padding-right: 0.3em; font-weight: bold">
                      <span class="selected-value-icon" v-html="returnAuthIcon(this.displayType)"></span>
                      <span ref="labelSpan" :key="editLabelDereferenceKey" v-if="!formatDisplayLabel().startsWith('http')">{{formatDisplayLabel()}}</span>
                      <span ref="labelSpan" v-else><EditLabelDereference :key="editLabelDereferenceKey" :URI="formatDisplayLabel()"/></span>

                    </span>
                    <span  class="selected-value-icon" style="border-left: solid 1px black; padding: 0 0.5em; font-size: 1em" v-html="validateHeading()"></span>
                    <span v-if="showEditLink()"  @click="openEditor" style="border-left: solid 1px black; padding: 0 0.5em; font-size: 1em">change</span>
                    <span v-if="showRemoveLink()" @click="removeValue" style="border-left: solid 1px black; padding: 0 0.5em; font-size: 1em">x</span>
                </div>

                <!-- We are displaying the input here to act as a landing pad for when moving through and also to double detel remove lookups -->
                <form style="display: inline-block; width: 90%" autocomplete="off" v-on:submit.prevent>
                  <input style="display: inline-block;"  bfeType="EditComplexLookupComponent"  type="text" :class="['input-nested', {'selectable-input': (isMini==false), 'selectable-input-mini':(isMini==true)}]" :id="assignedId" @keydown="doubleDeleteCheck"  v-on:focus="focused"   />
                </form>
              </div>

              <!-- This is the detail drop down that can be click to show context of the entitiy -->
              
              <div v-if="displaySelectedDetails==true" class="selected-value-details">
                
                <button class="selected-value-details-close" @click="toggleSelectedDetails">Close</button>
                <button class="selected-value-details-edit" @click="openEditor">Change</button>

                <a v-if="rewriteURI(displayContext.uri)" style="color:white; text-decoration: none;" target="_blank"  :href="rewriteURI(displayContext.uri)">View Entity</a>
                

                <div class="modal-context-data-title">{{userData['@type']}}</div>

                <div v-if="displayContext">
                  <div v-if="displayContext.variant && displayContext.variant.length>0">
                    <div class="modal-context-data-title">Variants:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="(v,idx) in displayContext.variant" v-bind:key="'var' + idx">{{v}}</li>
                    </ul>


                  </div>

                  <div v-for="key in Object.keys(displayContext.nodeMap)" :key="key">
                    <div class="modal-context-data-title">{{key}}:</div>
                      <ul>
                        <li class="modal-context-data-li" v-for="(v,idx) in displayContext.nodeMap[key]" v-bind:key="key+idx">{{v}}</li>
                      </ul>
                  </div>


                  <div v-if="displayContext.source && displayContext.source.length>0">
                    <div class="modal-context-data-title">Sources:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="(v,idx) in displayContext.source" v-bind:key="'sources'+idx">{{v}}</li>
                    </ul>


                  </div>    
                </div>            

                
              </div>
          </div>

          <!-- Just display the input, no data populated -->
          <form v-else autocomplete="off" v-on:submit.prevent>
            <input bfeType="EditComplexLookupComponent"  type="text" :class="['input-nested', {'selectable-input': (isMini==false), 'selectable-input-mini':(isMini==true)}]" :id="assignedId"  v-on:focus="focused" @input="activate($event)"   />
          </form>
      </div>



    </div>
  </div>

    <div v-else>

      <Keypress v-if="useSubjectEditor()" key-event="keydown" :multiple-keys="[{keyCode: 69, modifiers: ['shiftKey','ctrlKey','altKey'],preventDefault: true}]" @success="openEditor" />



      
      <div ref="fakeInputContainer" style="position: relative;" v-bind:class="['component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border temp-icon-search']">              
          <div class="component-nested-container-title" style="top: 0; width: 100%">
            <span v-if="parentStructureObj && (structure.propertyLabel == 'Lookup' || settingsDisplayMode=='compact')">{{parentStructureObj.propertyLabel}} -- </span>
            <span>{{structure.propertyLabel}}</span>
          </div>

          <!-- if there is userdata for this type of componet then it is a lookedup entity, make the entity, dont display the inputfield -->
          <div v-if="displayLabel" style="position: absolute; width: 100%">
              <div style="display: flex;">
                <div ref="displayLabel" class="selected-value-container-nested" style="display: inline-block; position: relative; bottom: 2px;">
                    <span ref="displayLabelSpan"  @click="toggleSelectedDetails" style="padding-right: 0.3em; font-weight: bold">
                      <span class="selected-value-icon" v-html="returnAuthIcon(this.displayType)"></span>
                      <span ref="labelSpan" :key="editLabelDereferenceKey" v-if="!formatDisplayLabel().startsWith('http')">{{formatDisplayLabel()}}</span>
                      <span ref="labelSpan" v-else><EditLabelDereference :key="editLabelDereferenceKey" :URI="formatDisplayLabel()"/></span>
                    </span>
                    <span  class="selected-value-icon" v-html="validateHeading()" v-bind:title="validationMessage" style="border-left: solid 1px black; padding: 0 0.5em; font-size: 1em"></span>
                    <span v-if="showEditLink()"  @click="openEditor" style="border-left: solid 1px black; padding: 0 0.5em; font-size: 1em">change</span>

                    <span v-if="showRemoveLink()" @click="removeValue" style="border-left: solid 1px black; padding: 0 0.5em; font-size: 1em">x</span>
                </div>

                <!-- We are displaying the input here to act as a landing pad for when moving through and also to double detel remove lookups -->
                <form style="display: inline-block; width: 90%" autocomplete="off" v-on:submit.prevent>
                  <input style="display: inline-block;"  bfeType="EditComplexLookupComponent"  type="text" :class="['input-nested', {'selectable-input': (isMini==false), 'selectable-input-mini':(isMini==true)}]" :id="assignedId" @keydown="doubleDeleteCheck"  v-on:focus="focused"   />
                </form>
              </div>

              <button v-if="useSubjectEditor()" tabindex="-1" class="temp-icon-search fake-real-button simptip-position-top" style="position:absolute;right: -2px;top:-26px" @click="openEditor" :id="returnGuid()+'_subjectButton'" :data-tooltip="'Edit this Subject Heading [CTRL-ALT-SHIFT-E]'"></button>

              <!-- This is the detail drop down that can be click to show context of the entitiy -->
              
              <div v-if="displaySelectedDetails==true" class="selected-value-details">
                  
                <div style="min-height: 50px;">                
                  <button class="selected-value-details-close" @click="toggleSelectedDetails">Close</button>
                  <button class="selected-value-details-edit" @click="openEditor">Change</button>
                  <a v-if="rewriteURI(displayContext.uri)" style="color:white; text-decoration: none;" target="_blank" :href="rewriteURI(displayContext.uri)">View Entity</a>
                </div>

                <EditLabelDereference :URI="formatDisplayLabel()"/>

                <div class="modal-context-data-title">{{userData['@type']}}</div>

                <div v-if="displayContext">

                  <div v-if="displayContext.variant && displayContext.variant.length>0">
                    <div class="modal-context-data-title">Variants:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="(v,idx) in displayContext.variant" v-bind:key="'var' + idx">{{v}}</li>
                    </ul>


                  </div>

                  <div v-for="key in Object.keys(displayContext.nodeMap)" :key="key">
                    <div class="modal-context-data-title">{{key}}:</div>
                      <ul>
                        <li class="modal-context-data-li" v-for="v in displayContext.nodeMap[key]" v-bind:key="v">{{v}}</li>
                      </ul>
                  </div>


                  <div v-if="displayContext.source && displayContext.source.length>0">
                    <div class="modal-context-data-title">Sources:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="v in displayContext.source" v-bind:key="v">{{v}}</li>
                    </ul>


                  </div>    
                </div>            

                
              </div>
          </div>

          <!-- Just display the input, no data populated -->
          <form v-else autocomplete="off" v-on:submit.prevent>
            <input bfeType="EditComplexLookupComponent"  type="text" :class="['input-nested', { test: (isMini), 'selectable-input': (isMini===false), 'selectable-input-mini':(isMini===true)}]" :id="assignedId"  v-on:focus="focused" @input="activate($event)"   />
          </form>
      </div>
    </div>





    <!-- Always build this interface, the lookup modal -->

    <div :id="assignedId"  v-bind:class="['modaloverlay',{'modal-display':displayModal}]">
      <div v-bind:class="['modal']">

        <div>

          <div v-if="!lowResMode" class="close temp-icon-close" @click="closeModal"></div>
          <div v-if="!lowResMode" class="modal-title">
            <span v-if="parentStructureObj && structure.propertyLabel == 'Lookup'">{{parentStructureObj.propertyLabel}} -- </span>
            <span>{{structure.propertyLabel}}</span>
            
          </div>

          <div class="modal-content">


            <div v-if="useSubjectEditor()">

              <EditSubjectEditor ref="EditSubjectEditor" @closeEditor="closeModal" @lowResModeActivate="lowResModeActivate" @subjectAdded="subjectAdded"></EditSubjectEditor>

            </div>


            <div v-else v-bind:class="['modal-content-flex-container',{'modal-content-flex-container-complex':(canBuildComplex()==true && displayPreCoordinated == true), 'modal-content-flex-container-complex-prompt': displayPreCoordinated==false, 'modal-content-flex-container-complex-hide' : (canBuildComplex()==false) }]">


              
              <div class="modal-content-left">

                <div style="height: 13%;">
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
                    <option v-for="(r,idx) in activeComplexSearch" :data-label="r.label" :value="r.uri" v-bind:key="idx" :style="(r.depreciated) ? 'color:red' : ''" class="complex-lookup-result" v-html="returnAuthIcon(r) + ' ' + r.label + ((r.literal) ? ' [Literal]' : '')">
                    </option>
                  </select>

             


                </div>


              </div>
              <div class="modal-content-right" style="position: relative;" >
                <div v-if="contextRequestInProgress" style="font-weight: bold;">Retrieving data...</div>
                <div class="modal-context" :style="{ 'height' : (displayPreCoordinated) ? '50%' : '75%' }" v-if="Object.keys(contextData).length>0">
                  
                  
                  <h3><span class="modal-context-icon simptip-position-top" :data-tooltip="'Type: ' + contextData.type" v-html="returnAuthIcon(contextData.type)"></span>{{contextData.title}}</h3>

                  <div class="modal-context-data-title">{{contextData.type}}</div>

                  <div v-if="contextData.depreciated" style="background: pink;">
                    DEPRECIATED AUTHORITY
                  </div>


                  <a style="color:#2c3e50; float: none;    border: none;border-radius: 0;background-color: transparent;font-size: 1em;padding: 0;" :href="rewriteURI(contextData.uri)" target="_blank">view on id.loc.gov</a>

                  <div v-if="contextData.variant && contextData.variant.length>0">
                    <div class="modal-context-data-title">Variants:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="(v,idx) in contextData.variant" v-bind:key="'var' + idx">{{v}}</li>
                    </ul>


                  </div>

                  <div v-for="key in Object.keys(contextData.nodeMap)" :key="key">
                    <div class="modal-context-data-title">{{key}}:</div>
                      <ul>
                        <li class="modal-context-data-li" v-for="(v,idx) in contextData.nodeMap[key]" v-bind:key="key+idx">{{v}}</li>
                      </ul>
                  </div>


                  <div v-if="contextData.source && contextData.source.length>0">
                    <div class="modal-context-data-title">Sources:</div>
                    <ul>
                      <li class="modal-context-data-li" v-for="(v,idx) in contextData.source" v-bind:key="'sources-'+idx">{{v}}</li>
                    </ul>


                  </div>


                </div>    

                <div class="modal-context-add-menu" v-if="Object.keys(contextData).length != 0">
                  




                  <button v-if="displayPreCoordinated==false && structure.valueConstraint.useValuesFrom && structure.valueConstraint.useValuesFrom.indexOf('http://id.loc.gov/authorities/subjects')>-1" @click="togglePreCoordinated" style="width:75%; margin-bottom: 5px;" class="">Build subject string [CTRL+SHIFT+B]</button>
                  <div v-if="displayPreCoordinated==true" class="modal-context-build-manual"> 

                    <div class="modal-context-build-manual-buttons"> 
                      <div>Build manual pre-coordinated: Add selected as a subdivision: </div>
                      <button style="width: 12em;" @click="precoordinatedAddSubdivision('Topic')">Heading or Topical
                        [CRTL+SHIFT+1]
                      </button>

                      <button style="width: 10em;" @click="precoordinatedAddSubdivision('Geographic')">Geographic
                        [CRTL+SHIFT+2]
                      </button>
                      <button style="width: 10em;" @click="precoordinatedAddSubdivision('Temporal')">Chronological
                        [CRTL+SHIFT+3]
                      </button>
                      <button style="width: 10em;" @click="precoordinatedAddSubdivision('GenreForm')">Form
                        [CRTL+SHIFT+4]
                      </button>                
                      <button style="width: 10em;" @click="precoordinatedRemoveLast()">Remove Last
                        [CRTL+SHIFT+5]
                      </button>  
                    </div>

                    <div class="modal-context-build-manual-precoordinted-display" > 
                      <span v-if="precoordinated.length == 0">Your pre-coordinated heading will display here when you add subdivisions</span>

                      <span> {{precoordinated.map((p)=>{return p.label}).join("--") }} </span>

                    </div>
                  </div>


                  <!-- Don't allow adding only a literal value -->
                  <button v-if="precoordinated.length == 0" @click="add" style="width: 75%" class="">Add Selected [SHIFT+Enter]</button>
                  
                  <button v-else-if="precoordinated.length > 0" @click="add" class="simptip-position-left" style="width: 75%;"  :data-tooltip="''">Add Pre-Coordinated [SHIFT+Enter]</button>
                 
                </div>
                <button v-if="allowHubCreation" @click="showMiniHubEdit" style=" width: 75%; position: absolute;    top: 85%;    left: 12%;    background-color: white;    border-color: rgb(42, 42, 42);    border: 3px solid rgb(42, 42, 42);    color: rgb(42, 42, 42);" class="">
                  
                  <div style="display:flex; width:150px; height: 25px; margin-left:auto; margin-right:auto">
                    <div style="flex:0; width:50px;">
                      <svg width="25px" height="25px"  version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <path fill="royalblue" d="m62.113 24.66 1.9023-15.238 18.875 32.691-7.5469 20.004 15.238 1.9023-32.691 18.875-20.004-7.5469-1.9023 15.238-18.875-32.691 7.5469-20.004-15.238-1.9023 32.691-18.875zm-17.684 15.695-4.0781 15.215 15.215 4.0781 4.0781-15.215z" fill-rule="evenodd"/>
                      </svg>                      

                    </div>
                    <div style="flex:1; text-align:left;">Build New Hub</div>
                  </div>
   
              </button>

              </div>
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
import validationUtil from "@/lib/validationUtil"
import config from "@/lib/config"
import parseProfile from "@/lib/parseProfile"
import EditSubjectEditor from "@/components/EditSubjectEditor.vue";
import EditLabelDereference from "@/components/EditLabelDereference.vue";
// import EditLabelRemark from "@/components/EditLabelRemark.vue";




export default {
  name: "EditComplexLookupComponent",
  components: {    
    Keypress: () => import('vue-keypress'),
    EditSubjectEditor,
    // EditLabelRemark,
    EditLabelDereference

  },  
  props: {
    structure: Object,
    parentStructure: Array,
    profileCompoent: String,
    parentStructureObj: Object,
    profileName: String,
    activeTemplate: Object,
    parentURI: String,
    isMini: Boolean,
    nested: Boolean,
    level: Number,
    bnodeProperty: String,
    propertyPath: Array

  },
  data: function() {
    return {

      displayModal: false,
      lookups: this.structure.valueConstraint.useValuesFrom,
      lookupConfig: config.lookupConfig,
      modeSelect: null,
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

      displayLabel: null,
      displayLabelDreferenced: null,
      displayType: null,
      displayGuid: null,
      displayContext: {},

      editLabelDereferenceKey: Date.now(),

      contextRequestInProgress: false,
      validated: false,
      validationMessage: "",

      lowResMode:false,

      displayMini: false,

      allowHubCreation: false,

      userData: {},

      internalAssignID: false,


    }
  },

  watch: {

    // watch when the undoindex changes, means they are undoing redoing, so refresh the
    // value in the acutal input box
    undoCounter: function(){
        this.checkForUserData()
    }


  },





  created: function(){

    this.checkForUserData()
    


    if (this.structure.propertyURI==='http://id.loc.gov/ontologies/bibframe/Work' || this.structure.propertyURI==='http://id.loc.gov/ontologies/bibframe/expressionOf'){
      this.allowHubCreation=true  
    }


  },
  computed: mapState({
    lookupLibrary: 'lookupLibrary',
    activeInput: 'activeInput',
    activeProfile: 'activeProfile', 
    activeProfileMini: 'activeProfileMini',
    workingOnMiniProfile: 'workingOnMiniProfile',
    settingsDisplayMode: 'settingsDisplayMode',

    activeProfileName: 'activeProfileName',
    activeComplexSearch: 'activeComplexSearch',
    activeComplexSearchInProgress: 'activeComplexSearchInProgress',
    settingsLookupsUseTextSubjectEditor:'settingsLookupsUseTextSubjectEditor',
    contextData: 'contextData',

    undoCounter: 'undoCounter',

    assignedId (){
      if (this.internalAssignID){
        return this.internalAssignID
      }else{
        this.internalAssignID = uiUtils.assignID(this.structure,this.parentStructure,config)
        return this.internalAssignID
      }
      // return uiUtils.assignID(this.structure,this.parentStructure,config)
    },

    modalSelectOptions(){

      let options = []


      // add in the the defaul search ALL of everything possible
      //options.push({label: 'All', urls:null, processor:null})
      this.structure.valueConstraint.useValuesFrom.forEach((l)=>{
        if (this.lookupConfig[l]){
          this.lookupConfig[l].modes.forEach((mode)=>{
            
            Object.keys(mode).forEach((k)=>{
              options.push({label: k, urls:mode[k].url, processor:this.lookupConfig[l].processor, minCharBeforeSearch: (this.lookupConfig[l].minCharBeforeSearch ? this.lookupConfig[l].minCharBeforeSearch : false), all:mode[k].all })
              // mark the first All one we find as the first one
              if (!this.modeSelect && mode[k].all){
                this.modeSelect = k
              }

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




    /**
    * return the active profile if we are editing a mini inline profile or the normal active profile
    * @return {object} profile
    */

    returnCorrectActiveProfile: function(){

      if (this.isMini){
        return this.activeProfileMini
      }else if (this.workingOnMiniProfile){
        return this.activeProfileMini
      }else{
        return this.activeProfile
      }
    },







    showMiniHubEdit: function(){


        this.closeModal()

        let payload = {
          useProfile: 'Hub',
          sourceId: this.assignedId,
          component: this
        }

        
        this.$emit('showMiniEditorEdit',payload);
        this.$parent.$emit('showMiniEditorEdit',payload);
        this.$parent.$parent.$emit('showMiniEditorEdit',payload);
        this.$parent.$parent.$parent.$emit('showMiniEditorEdit',payload);
        this.$parent.$parent.$parent.$parent.$emit('showMiniEditorEdit',payload);



        // this.$store.dispatch("setWorkingOnMiniProfile", { self: this, value: true }).then(() => {
        //   this.displayMini = true
        // })




    },


    returnGuid: function(){

      return parseProfile.returnGuid(this.activeProfile, this.profileCompoent, this.structure.propertyURI)

    },

    formatDisplayLabel: function(){


      // if the display label is a URI it means there is no RDFLabel in the data because that property is just deisgned to be a rdf:resource link with a @id 
      // not a full bnode with label data. So two options here request the label or if they just added it there might be a @context we can use
      let useTitle = false

      if (this.displayLabel.startsWith('http:')){

        let userData = parseProfile.returnUserValues(this.returnCorrectActiveProfile(), this.profileName, this.profileCompoent, this.structure.propertyURI, this.propertyPath)
        

        // look for a @context in any of the properties
        for (let key in userData){
          if (key == this.parentStructureObj.propertyURI){
            for (let d of userData[key]){
              for (let subKey in d){
                if (subKey == '@context'){                
                  if (d[subKey].title){
                    useTitle = d[subKey].title
                  }
                }
              }
            }
          }
        }



      }


        [100,500,1000,2000].forEach((ts)=>{

          window.setTimeout(()=>{
            let keepLooping = 0
            let orginalVal
            try{
              orginalVal = this.$refs.labelSpan.innerHTML
            }catch{
              return null
            }
            if (!this.displayLabelDreferenced){
              this.displayLabelDreferenced = this.$refs.labelSpan.innerText
            }
            while (this.$refs.labelSpan.parentNode.parentNode.clientWidth>this.$refs.fakeInputContainer.clientWidth - 60 && keepLooping < 1000){
              orginalVal = orginalVal.slice(0, -1)
              this.$refs.labelSpan.innerHTML = orginalVal + '...'
              // protect against infinite
              keepLooping++
            }
          },ts)




        })







      if (useTitle){

        // we have a title, but it might BE HUGE like really long, so see how big our container is an modify the displaly a little to make sure it fits
          // this.$nextTick(() => {

          //   // code in here will run after the below return has sent the value back and the UI has been updated
          //   // test if the label is now bigger than the container and if so do something about it
          //   if (this.$refs.fakeInputContainer.clientWidth - this.$refs.displayLabel.clientWidth < 100){
          //     console.log("HERE")
          //     this.$refs.displayLabelSpan.innerHTML = useTitle.substring(0,100) + '...'
          //   }
          //   // just do it one more time....
          //   this.$nextTick(() => {
          //     if (this.$refs.fakeInputContainer.clientWidth - this.$refs.displayLabel.clientWidth < 100){
          //       this.$refs.displayLabelSpan.innerHTML = useTitle.substring(0,50) + '....'
          //     }              
          //   })            
          // })



        

        return useTitle


      }else{
        return this.displayLabel  
      }

      


    },

    showEditLink: function(){

      let show = true

      if (this.displayLabel.includes('id.loc.gov/resources/works/')){
        show = false
      }
      if (this.displayLabel.includes('id.loc.gov/resources/hubs/')){
        show = false
      }


      if (this.structure.propertyURI=='http://www.loc.gov/mads/rdf/v1#Topic' && this.settingsLookupsUseTextSubjectEditor===false){
        show = false
      }

      return show
    },


    showRemoveLink: function(){

      let show = true

      if (this.displayLabel.includes('id.loc.gov/resources/works/')){
        show = false
      }
      return show

    },

    useSubjectEditor: function(){

      let use = false


      if (this.structure.propertyURI=='http://www.loc.gov/mads/rdf/v1#Topic'){
        use = true
      }


      if (this.parentStructureObj && this.parentStructureObj.propertyURI=='http://www.loc.gov/mads/rdf/v1#componentList'){
        use = true
      }



      if (this.settingsLookupsUseTextSubjectEditor===false){
        use = false
      }


      return use
    },

    validateHeading: function() {

        // dont validate some ID lookups until we can get reource lookups working correctly
        if (
          this.structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Work' || 
          this.structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Instance' || 
          this.structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Item' ||
          // also don't validate relation properties
          this.structure.propertyURI == 'http://id.loc.gov/ontologies/bflc/relation'
        ){

          this.validated = validationUtil.headingNotChecked;
          this.validationMessage = validationUtil.getValidationMessage(this.validated)
        }


        if (this.validated === false) {
            //console.log("the this")
            //console.log(this)

            let userData = parseProfile.returnUserValues(this.returnCorrectActiveProfile(), this.profileName, this.profileCompoent, this.structure.propertyURI, this.propertyPath)
            // dis connect it from the source so it doesnt update the value, read only
            userData = JSON.parse(JSON.stringify(userData))

            // console.log("We are validTING THIS",userData)
            if (userData && this.parentStructureObj && this.parentStructureObj.propertyURI){
              // pass some more info to this process to help it
              userData.hintUri = this.parentStructureObj.propertyURI
            }

            
            if (userData !== false) {
                validationUtil.validateHeading(userData)
                .then((validationStatus) => {

                  let orignalUserData = parseProfile.returnUserValues(this.returnCorrectActiveProfile(), this.profileName, this.profileCompoent, this.structure.propertyURI, this.propertyPath)


                  // console.log("USERDATA 3",JSON.parse(JSON.stringify(userData)))
                  this.validated = validationStatus;
                  this.validationMessage = validationUtil.getValidationMessage(validationStatus);
                  
                  if (userData["http://id.loc.gov/ontologies/bibframe/agent"] !== undefined) {
                      // We have a contribution resource.
                      // What we need is the agent.
                      userData = userData["http://id.loc.gov/ontologies/bibframe/agent"][0];
                  }
                  if (orignalUserData["http://id.loc.gov/ontologies/bibframe/agent"] !== undefined) {
                      // We have a contribution resource.
                      // What we need is the agent.
                      orignalUserData = orignalUserData["http://id.loc.gov/ontologies/bibframe/agent"][0];
                  }


                  // console.log("this.displayContext",this.displayContext)

                  // Do we need to set the display URI because the userData ID changed?
                  if (userData["@id"] !== this.displayContext.uri) {
                      this.displayContext.uri = userData["@id"];
                  }
                  
                  // Do we need to set the display labels because the userData label changed?
                  var label = validationUtil.getLabel(userData);
                  if (this.displayLabel != label) {
                      this.displayLabel = label;
                  }
                  


                  if (this.displayContext.title != label) {
                      this.displayContext.title = label;
                  }

                  // console.log('userData is ',userData, 'for ', label)
                  // console.log('orignalUserData is ',orignalUserData, 'for ', label)


                  // if it is a name then when we validate also make sure that the 
                  // uservalue is populated with the right stuff
                  // sometimes a record will come in without a URI but it has a valid label
                  if (!orignalUserData['@id']){
                    console.log("userData",userData)
                    console.log("userData",userData)
                    if (userData["@id"].includes('id.loc.gov/authorities/names/')){
                      this.$store.dispatch("fetchContext", { self: this, searchPayload: userData["@id"] }).then(() => {                      
                        // console.log("SETTING THE VALUE ON",this.profileName)
                        // console.log("USER VALUE WAS:",userData)
                        this.$store.dispatch("setValueComplex", { self: this, profileComponet: this.profileCompoent, template:this.profileName, structure: this.structure, parentStructure: this.parentStructureObj, propertyPath: this.propertyPath }).then(() => {
                          this.componentKey++
                        })  
                      })    
                    }
                  }



                    
                });
            }
        }
        return this.validated;
    },


    camelize: function (str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      });
    },


    submitField: function(){
      return this.add()
    },


    rewriteURI: function(uri){

      if (!uri){
        return false
      }

      if (uri.includes('bibframe.example.org')){
        return false
      }

      if (uri.includes('/resources/hubs/') || uri.includes('/resources/works/') || uri.includes('/resources/instances/') || uri.includes('/resources/items/')){
        uri = uri.replace('https://id.loc.gov/', config.returnUrls().bfdb )
        uri = uri.replace('http://id.loc.gov/', config.returnUrls().bfdb )      
      }


      return uri
    },

    precoordinatedAddSubdivision: function(type){

      if (Object.keys(this.contextData).length==0) return false



      let label = this.contextData.title
      let uri  = this.contextData.uri
      let contextType = this.contextData.type

      // if they type is not in the context because it is a literal
      // then use the contxt it was added to the precoord with
      if (!this.contextData.typeFull){
        if (type == 'Topic'){
          this.contextData.typeFull = 'http://www.loc.gov/mads/rdf/v1#Topic'
          contextType = 'Topic'
        }else if (type == 'Geographic'){
          this.contextData.typeFull = 'http://www.loc.gov/mads/rdf/v1#Geographic'
          contextType = 'Geographic'
        }else if (type == 'Temporal'){
          this.contextData.typeFull = 'http://www.loc.gov/mads/rdf/v1#Temporal'
          contextType = 'Temporal'
        }else if (type == 'GenreForm'){
          this.contextData.typeFull = 'http://www.loc.gov/mads/rdf/v1#GenreForm'
          contextType = 'GenreForm'
        }
      }


      // console.log(type)
      // if (contextType != type){
      
      //   return false
      // }
      // console.log({uri:uri,label:label,type:contextType,typeFull:this.contextData.typeFull})


      this.precoordinated.push({uri:uri,label:label,type:contextType,typeFull:this.contextData.typeFull})

      this.$refs.searchInput.focus()

    },

    precoordinatedRemoveLast: function(){

      if (this.precoordinated.length>0){
        this.precoordinated.splice(-1,1)
      }
      

    },


    canBuildComplex: function(){
      
      if (this.structure.valueConstraint.useValuesFrom.indexOf('http://id.loc.gov/authorities/subjects')>-1) return true

      return false

    },

    togglePreCoordinated: function(event){

      if (this.displayPreCoordinated == false && this.displayModal == true){

        this.displayPreCoordinated = true
        
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

            this.$store.dispatch("setValueComplex", { self: this, profileComponet: this.profileCompoent, template:this.activeTemplate, structure: this.structure, parentStructure: this.parentStructureObj, propertyPath: this.propertyPath })
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

      this.displayLabel = null
      this.displayType = null
      this.displayGuid = null

      let userValue 
      // let rootPropertyURI



      // if (this.isMini){
      //   userValue = parseProfile.returnUserValues(this.activeProfileMini, this.profileName, this.profileCompoent,this.structure.propertyURI)
      //   rootPropertyURI = parseProfile.returnRootPropertyURI(this.activeProfileMini, this.profileCompoent,this.structure.propertyURI)        
      // }else{
        userValue = parseProfile.returnUserValues(this.returnCorrectActiveProfile(), this.profileName, this.profileCompoent,this.structure.propertyURI, this.propertyPath)
        // rootPropertyURI = parseProfile.returnRootPropertyURI(this.returnCorrectActiveProfile(), this.profileCompoent,this.structure.propertyURI)        
      // }
      


      
      
      if (userValue['http://www.w3.org/2000/01/rdf-schema#label'] || userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'] || userValue['http://id.loc.gov/ontologies/bibframe/code']){

        if (userValue['http://www.w3.org/2000/01/rdf-schema#label']){
          this.displayLabel = userValue['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label'] || userValue['http://www.w3.org/2000/01/rdf-schema#label']
          

        }else if (userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']){
          this.displayLabel = userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'] || userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']
          

        }else if (userValue['http://www.w3.org/1999/02/22-rdf-syntax-ns#value']){
          this.displayLabel = userValue['http://www.w3.org/1999/02/22-rdf-syntax-ns#value'][0]['http://www.w3.org/1999/02/22-rdf-syntax-ns#value'] || userValue['http://www.w3.org/1999/02/22-rdf-syntax-ns#value']
          

        }else if (userValue['http://id.loc.gov/ontologies/bibframe/code']){
          this.displayLabel = userValue['http://id.loc.gov/ontologies/bibframe/code'][0]['http://id.loc.gov/ontologies/bibframe/code'] || userValue['http://id.loc.gov/ontologies/bibframe/code']
        }

        this.displayLabel = this.displayLabel.replace(/&amp;/g,'&')

        if (!this.displayLabel){
          console.log("ERROR GETTING this.displayLabel")
          console.log(userValue)
          console.log(this.parentStructure)
        }

        

        if (userValue['@type']){
          this.displayType = userValue['@type']
        }    

        if (userValue['@context']){
          this.displayContext = userValue['@context']
        }else{

          this.displayContext = {
            contextValue: true,
            uri: (userValue['@id']) ? userValue['@id'] : null,
            title: this.displayLabel,
            nodeMap: {}
          }

        }



      // }else if (this.parentStructureObj && this.parentStructureObj.propertyURI && userValue[this.parentStructureObj.propertyURI]){
        
      //   // the data is stored in the sub graph named under the parent
      //   if (Array.isArray(userValue[this.parentStructureObj.propertyURI])){

      //     if (userValue[this.parentStructureObj.propertyURI][0]['http://www.w3.org/2000/01/rdf-schema#label']){



      //       this.displayLabel = userValue[this.parentStructureObj.propertyURI][0]['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label']
            
      //       this.displayGuid = userValue[this.parentStructureObj.propertyURI][0]['@guid']
      //       if (userValue[this.parentStructureObj.propertyURI][0]['@context']){
      //         this.displayContext = userValue[this.parentStructureObj.propertyURI][0]['@context']
      //       }else{

      //         this.displayContext = {
      //           contextValue: true,
      //           uri: (userValue[this.parentStructureObj.propertyURI][0]['@id']) ? userValue[this.parentStructureObj.propertyURI][0]['@id'] : null,
      //           title: this.displayLabel,
      //           nodeMap: {}
      //         }

      //       }


            

      //     }else if (userValue[this.parentStructureObj.propertyURI][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']){
      //       this.displayLabel = userValue[this.parentStructureObj.propertyURI][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']
            
      //       this.displayGuid = userValue[this.parentStructureObj.propertyURI][0]['@guid']
      //       if (userValue[this.parentStructureObj.propertyURI][0]['@context']){
      //         this.displayContext = userValue[this.parentStructureObj.propertyURI][0]['@context']
      //       }else{

      //         this.displayContext = {
      //           contextValue: true,
      //           uri: (userValue[this.parentStructureObj.propertyURI][0]['@id']) ? userValue[this.parentStructureObj.propertyURI][0]['@id'] : null,
      //           title: this.displayLabel,
      //           nodeMap: {}
      //         }

      //       }

      //     }else if (userValue[this.parentStructureObj.propertyURI][0]['http://www.w3.org/1999/02/22-rdf-syntax-ns#value']){
      //       this.displayLabel = userValue[this.parentStructureObj.propertyURI][0]['http://www.w3.org/1999/02/22-rdf-syntax-ns#value'][0]['http://www.w3.org/1999/02/22-rdf-syntax-ns#value']
            
      //       this.displayGuid = userValue[this.parentStructureObj.propertyURI][0]['@guid']
      //       if (userValue[this.parentStructureObj.propertyURI][0]['@context']){
      //         this.displayContext = userValue[this.parentStructureObj.propertyURI][0]['@context']
      //       }else{

      //         this.displayContext = {
      //           contextValue: true,
      //           uri: (userValue[this.parentStructureObj.propertyURI][0]['@id']) ? userValue[this.parentStructureObj.propertyURI][0]['@id'] : null,
      //           title: this.displayLabel,
      //           nodeMap: {}
      //         }

      //       }

      //     }else if (userValue[this.parentStructureObj.propertyURI][0]['http://id.loc.gov/ontologies/bibframe/code']){
      //       this.displayLabel = userValue[this.parentStructureObj.propertyURI][0]['http://id.loc.gov/ontologies/bibframe/code'][0]['http://id.loc.gov/ontologies/bibframe/code']
            
      //       this.displayGuid = userValue[this.parentStructureObj.propertyURI][0]['@guid']
      //       if (userValue[this.parentStructureObj.propertyURI][0]['@context']){
      //         this.displayContext = userValue[this.parentStructureObj.propertyURI][0]['@context']
      //       }else{

      //         this.displayContext = {
      //           contextValue: true,
      //           uri: (userValue[this.parentStructureObj.propertyURI][0]['@id']) ? userValue[this.parentStructureObj.propertyURI][0]['@id'] : null,
      //           title: this.displayLabel,
      //           nodeMap: {}
      //         }

      //       }

      //     }
          
      //   }

        
      //   if (userValue[this.parentStructureObj.propertyURI] && userValue[this.parentStructureObj.propertyURI].length>0){
      //     this.displayType = userValue[this.parentStructureObj.propertyURI][0]['@type']
      //   }

      //   if (!this.displayLabel){

      //     if (userValue[this.parentStructureObj.propertyURI][0] && userValue[this.parentStructureObj.propertyURI][0]['@id']){
            
      //       this.displayLabel = userValue[this.parentStructureObj.propertyURI][0]['@id']
            

      //       this.displayContext = {
      //         contextValue: true,
      //         uri: userValue[this.parentStructureObj.propertyURI][0]['@id'],
      //         title: this.displayLabel,
      //         nodeMap: {}
      //       }

      //     }
          

      //   }

        

      // }else if (userValue['@root'] && userValue['@root'] == rootPropertyURI){

        
      //   if (userValue['http://www.w3.org/2000/01/rdf-schema#label']){
      //     this.displayLabel = userValue['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label']      
          
      //   }else if (userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']){
      //     this.displayLabel = userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']
          
      //   }else if (userValue['http://www.w3.org/1999/02/22-rdf-syntax-ns#value']){
      //     this.displayLabel = userValue['http://www.w3.org/1999/02/22-rdf-syntax-ns#value'][0]['http://www.w3.org/1999/02/22-rdf-syntax-ns#value']
          
      //   }else if (userValue['http://id.loc.gov/ontologies/bibframe/code']){
      //     this.displayLabel = userValue['http://id.loc.gov/ontologies/bibframe/code'][0]['http://id.loc.gov/ontologies/bibframe/code']
          
      //   }
        
      //   if (userValue['@type']){
      //     this.displayType = userValue['@type']
      //   }
        
        
      //   if (!this.displayLabel){
      //     if (userValue['@id']){
      //       this.displayLabel = userValue['@id']
            
      //     }
      //   }
        


      //   if (userValue['@context']){
      //     this.displayContext = userValue['@context']
      //   }else{
      //     this.displayContext = {
      //       contextValue: true,
      //       uri: (userValue['@id']) ? userValue['@id'] : null,
      //       title: this.displayLabel,
      //       nodeMap: {}
      //     }
      //   }





      }else{


          // does the userValue returned have anything other than the metadata keys?
          let keys = Object.keys(userValue).filter((v) => { return (v != '@root') })


          if (keys.length>0){
            console.warn('---------------------------------------------')
            console.warn('Dont know how to extract the userValue for this complexLookup')
            console.warn(userValue)
            console.warn(this.structure)
            console.warn('---------------------------------------------')
          }

      }

      // // if it is a root level resource
      // if (this.structure.propertyURI == this.structure.userValue['@root']){
      //   this.displayLabel = "yeet"
      // }



    },

    activate: function(event){

      // this skips activating the modal if they are simply navigating through the main field list
      if (event.key==='ArrowDown' || event.key==='ArrowUp' || event.key==='ArrowRight' || event.key==='ArrowLeft' || event.key==='PageUp' || event.key==='PageDown' || event.key==='Tab' || event.key==='Control' || event.key==='Meta' || event.key==='Alt' || event.key==='Shift' || event.key==='CapsLock' || event.key==='=' || event.key ==='Backspace' || event.key ==='Home'){
        // the = key is for adding new 
        // if (!this.searchValue || (this.searchValue && this.searchValue.trim() == '')){
          return false
        // }
      }


      // if ((event.ctrlKey || event.metaKey) && event.keyCode == 86) {
      //    // they are doing a paste value

         
      //    window.setTimeout(()=>{

      //     this.displayModal = true
      //     this.initalSearchState = true
      //     // for copy paste
      //     this.searchValue = event.target.value
      //     event.target.value= ''

      //     this.$store.dispatch("clearContext", { self: this})

      //     this.$store.dispatch("clearLookupValuesComplex", { self: this}).then(() => {
      //       // clear the values from any previous attempt
      //       // but if there is a value kick off that same search again
      //       if (this.searchValue != ''){
      //         this.search()
      //       }
      //     })    

      //     event.preventDefault()
      //     // set the last input, but do it after the modal has been displaed
      //     setTimeout(()=>{
      //       if (document.getElementById(this.assignedId+'search')){
      //         document.getElementById(this.assignedId+'search').focus()
      //       }
      //     },0)

      //     this.$store.dispatch("disableMacroNav", { self: this})

      //     this.$nextTick(() => {
      //       this.$refs.EditSubjectEditor.$refs.subjectInput.focus()
      //       this.$refs.EditSubjectEditor.loadUserValue()
            
      //     })


      //    },50)
         
         
      //    return false
      // }


      // if (event.ctrlKey){
      //   // if they have the control key pressed dont do anything
      //   return false
      // }


      if (event.target.value.trim() == ''){
        return false
      }

      // turn on the modal
      this.displayModal = true
      this.initalSearchState = true
      
      // console.log('here',this.displayModal)
      
      this.searchValue = event.target.value

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
        if (document.getElementById(this.assignedId+'search')){
          //console.log('focus:',document.getElementById(this.assignedId+'search'))
          document.getElementById(this.assignedId+'search').focus()
        }
      },0)


      this.$store.dispatch("disableMacroNav", { self: this})



      this.$nextTick(() => {
        if (this.$refs.EditSubjectEditor){
          this.$refs.EditSubjectEditor.$refs.subjectInput.focus()
          this.$refs.EditSubjectEditor.loadUserValue(this.searchValue)

          this.$refs.EditSubjectEditor.checkToolBarHeight()
        }
      })

      event.target.value = ''


      return false
    },

    focused: function(event){     

      this.$store.dispatch("setActiveInput", { self: this, id: event.target.id, profileCompoent: this.profileCompoent, profileName: this.profileName }).then(()=>{
                console.log("event.target.id",event.target.id)

        // now focus the side bars
        this.$nextTick(()=>{
          uiUtils.focusSidebars()
        })


      })
    },
    closeModal: function(event){

      if (event && event.target && event.target.classList.contains('close')){
        this.displayModal = false
        
      }



      // if (event && event.target && !event.target.classList.contains('modaloverlay')){
      //   return false
      // }


      this.$store.dispatch("enableMacroNav", { self: this})
      this.lowResMode =false
      this.displayModal = false
      
      this.displayPreCoordinated = false
      this.precoordinated = []
      this.prec
      
      if (event && event.event) event.event.preventDefault()

      this.focusCurrentInput()
      
    },


    openEditor: function(){


      // close the little details pane if open
      this.displaySelectedDetails = false      


      this.$store.dispatch("setActiveInput", { self: this, id: this.assignedId, profileCompoent: this.profileCompoent, profileName: this.profileName }).then(()=>{
        // just make sure the parent input is focused if they clicked "edit" without it being focused
      })



      this.$store.dispatch("disableMacroNav", { self: this})

      this.displayModal = true

      if (this.useSubjectEditor()){
        this.$nextTick(() => {
          if (this.$refs.EditSubjectEditor){
            this.$refs.EditSubjectEditor.$refs.subjectInput.focus()
            this.$refs.EditSubjectEditor.loadUserValue(this.activeProfile.rt[this.activeProfileName].pt[this.profileCompoent].userValue)
            this.$refs.EditSubjectEditor.checkToolBarHeight()

          }
        })

      }else{



        if (this.displayLabelDreferenced && this.displayLabel.startsWith('http')){
          this.searchValue = this.displayLabelDreferenced
        }else{
          this.searchValue = this.displayLabel
        }
        
        this.initalSearchState = true
        this.search()
        this.$nextTick(() => {
          document.getElementById(this.assignedId+'search').focus()

        })

      }

      this.displayLabelDreferenced = null

    },


    // the modal content is telling this modal that things dont fit
    lowResModeActivate: function() {
      

      this.lowResMode=true


    },


    subjectAdded: function(components){


      this.$store.dispatch("setValueSubject", { self: this, profileComponet: this.profileCompoent, subjectComponents: components, propertyPath: this.propertyPath }).then(() => {
        this.componentKey++
        this.displayModal = false
        this.checkForUserData()
        this.$emit('updated', null)

        this.validated = false
        this.validateHeading()

        // put the focus back on the input
        setTimeout(()=>{
            document.getElementById(this.assignedId).focus()
              this.$store.dispatch("enableMacroNav", { self: this})

        },0)

        this.$store.dispatch("setSubjectList")

      }) 





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

            // if they are on the literal value
            if (!o.value){
              let tempContext = {
                  "contextValue": true,                  
                  "source": [],
                  "type": "Literal Value",
                  "variant": [],
                  "uri": null,
                  "title": o.dataset.label,
                  "contributor": [],
                  "date": null,
                  "genreForm": null,
                  "nodeMap": {},
                  "precoordinated" : false,
                  "literal": true
              }        
              this.$store.dispatch("setContextManually", { self: this, context: tempContext, })
              return false
            }


            this.contextRequestInProgress = true
            this.$store.dispatch("fetchContext", { self: this, searchPayload: o.value }).then(() => {
              this.contextRequestInProgress = false
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

      // console.log(event.key)

      if ((event.key === '1' || event.key === '!') && this.displayPreCoordinated == true && event.ctrlKey === true && event.shiftKey == true){
        
        this.precoordinatedAddSubdivision('Topic')

        event.preventDefault();
        return false 

      }
      if ((event.key === '2' || event.key === '@') && this.displayPreCoordinated == true && event.ctrlKey === true && event.shiftKey == true){
        
        this.precoordinatedAddSubdivision('Geographic')

        event.preventDefault();
        return false 

      }
      if ((event.key === '3' || event.key === '#') && this.displayPreCoordinated == true && event.ctrlKey === true && event.shiftKey == true){
        
        this.precoordinatedAddSubdivision('Temporal')

        event.preventDefault();
        return false 

      }
      if ((event.key === '4' || event.key === '$') && this.displayPreCoordinated == true && event.ctrlKey === true && event.shiftKey == true){        
        this.precoordinatedAddSubdivision('GenreForm')
        event.preventDefault();
        return false 
      }
      if ((event.key === '5' || event.key === '%') && this.displayPreCoordinated == true && event.ctrlKey === true && event.shiftKey == true){        
        this.precoordinatedRemoveLast()
        event.preventDefault();
        return false 
      }


      if (event.key==='Enter'){
        if (event.shiftKey){
          this.add()
        }
      }       


      // if (event.key === 'b' && event.ctrlKey === true && event.shiftKey == true && this.displayPreCoordinated == false){        
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

      if (this.searchValue.length<3){

        // if it is non-latin 
        if (this.searchValue.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/)){

          // if it is a CJK language don't impose that limit
          
        }else{

          // check the config, some vocabs have very short codes, like the marc geo
          // so if it is configed to allow short search overtide the < 3 rule
          let minCharBeforeSearch = 3
          this.modalSelectOptions.forEach((a)=>{
            if (a.minCharBeforeSearch && a.minCharBeforeSearch < minCharBeforeSearch){
              minCharBeforeSearch = a.minCharBeforeSearch
            }
          })

          if (this.searchValue.length<minCharBeforeSearch){
            return false
          }



        }




      }
      window.clearTimeout(this.searchTimeout)

      let searchPayload = {
        processor: null,
        url: [],
        searchValue: this.searchValue
      }
      // if (this.modeSelect == 'All'){
      //   this.modalSelectOptions.forEach((a)=>{
      //     // use the ones in the config marked as "all" 
      //     if(a.all===true){
      //       searchPayload.processor=a.processor
      //       searchPayload.url.push(a.urls.replace('<QUERY>',this.searchValue))
      //     }
      //   })
        
      // }else{
        this.modalSelectOptions.forEach((a)=>{
          if (a.label==this.modeSelect){
            searchPayload.processor=a.processor
            searchPayload.url.push(a.urls.replace('<QUERY>',this.searchValue))            
          }
        })



      // }


      this.searchTimeout = window.setTimeout(()=>{
        // console.log('searching',searchPayload)    
        this.$store.dispatch("fetchLookupValuesComplex", { self: this, searchPayload: searchPayload }).then(() => {
          this.initalSearchState =false;
        })    
      }, 400)
      


    },

    // add this entity to the data for this component
    add: function(){

      
      
      

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
          this.$store.dispatch("setValueComplex", { self: this, profileComponet: this.profileCompoent, template:this.activeTemplate, structure: this.structure, parentStructure: this.parentStructureObj, propertyPath: this.propertyPath }).then(() => {
            this.componentKey++
            this.displayModal = false
            this.$store.dispatch("enableMacroNav", { self: this})
            this.checkForUserData()

            this.validated = false
            this.validateHeading()

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

        // if (this.contextData && this.contextData.literal){
        //   return false
        //   // they were tring to add only a literal value
        // }


        this.$store.dispatch("setValueComplex", { self: this, profileComponet: this.profileCompoent, template:this.activeTemplate, structure: this.structure, parentStructure: this.parentStructureObj, propertyPath: this.propertyPath }).then(() => {
          this.componentKey++
          this.displayModal = false
          this.checkForUserData()

          this.validated = false
          this.validateHeading()
          this.$store.dispatch("enableMacroNav", { self: this})
          
          // change the key on this element so it rerenderes
          this.editLabelDereferenceKey = Date.now()

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
  height: 75%;
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

.modal-context-build-manual-buttons button{
  font-size: .85em;
  background-color: whitesmoke;
  color: #2c3e50 !important;
  border: solid 1px #2c3e50;
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
  white-space: pre-wrap;

}
.selected-value-icon{
  font-family: "validation-icons", "fontello", Avenir, Helvetica, Arial, sans-serif;
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

.selected-value-details-edit{
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
  height: 73%; 
  margin-top: 1.25em;

}

.complex-lookup-result{
  border-bottom: 1px lightgray solid;
  cursor: pointer;
}
.complex-lookup-results-complex{
  height: 75%; 
}

.modal-entity-select option[value=""]{

  font-weight: bold;
  font-style: oblique;
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
