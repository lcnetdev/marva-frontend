<template>
    <div>

          <Keypress key-event="keydown" :key-code="40" @success="moveDown($event)" />
          <Keypress key-event="keydown" :key-code="39" @success="moveRight($event)" />
          <Keypress key-event="keydown" :key-code="37" @success="moveLeft($event)" />
          <Keypress key-event="keydown" :key-code="38" @success="moveUp($event)" />
          <Keypress key-event="keydown" :key-code="34" @success="movePageDown" />          
          <Keypress key-event="keydown" :key-code="33" @success="movePageUp" />

          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 187, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="dupeProperty" />


          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 88, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="togglePreview" />
          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 80, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="publish" />

          <Keypress key-event="keydown" :key-code="27" @success="escapeKey" />



        <div class="resources-grid">


            
            <template v-if="profilesLoaded">

                <div v-for="(profileName, resourceIdx) in activeProfile.rtOrder" :key="profileName">

                    
                    <div v-if="activeProfile.rt[profileName].noData != true" :class="['container-' + profileName.split(':').slice(-1)[0].split('-')[0]]">


                        <div style="display: flex; max-height: 2em; height: 2em;">
                          <div style="flex: 0">

                            <div v-if="profileName.includes('Instance')" style="height: 1.75em;width: 2em; margin-left: 1.5em;" class="temp-icon-instance"></div>

                            <svg v-if="profileName.split(':').slice(-1)[0] == 'Work'" width="3em" height="2.5em" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <circle fill="#7badad" cx="1.5em" cy="1em" r="0.75em"/>
                            </svg>

                            <div style="display:inline-block;     width: 26px; margin-left: 25px; margin-right: 5px;" v-if="profileName.includes(':Item')">
                              <svg  viewBox="0 0 50 72" version="1.1" xmlns="http://www.w3.org/2000/svg">

                                   <rect width="50px" height="50px" style="fill:#eaeaea;stroke-width:0.5;stroke:rgb(0,0,0)" />
                              </svg>
                            </div>

                                <div v-if="profileName.endsWith(':Hub')" style="height: 15px;  display:inline-block;  width: 26px; margin-left: 25px; margin-right: 5px;">
                                    <svg width="50px" height="40px"  version="1.1" viewBox="25 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                     <path fill="royalblue" d="m62.113 24.66 1.9023-15.238 18.875 32.691-7.5469 20.004 15.238 1.9023-32.691 18.875-20.004-7.5469-1.9023 15.238-18.875-32.691 7.5469-20.004-15.238-1.9023 32.691-18.875zm-17.684 15.695-4.0781 15.215 15.215 4.0781 4.0781-15.215z" fill-rule="evenodd"/>
                                    </svg>                           
                                </div>

                          </div>
                          <div style="flex-basis: auto; font-size: 1.25em; font-weight: bold; text-align: left;">{{profileName.split(':').slice(-1)[0]}}</div>
                          <div style="flex: 1; text-align: right;line-height: 1.25em;">{{activeProfile.rt[profileName].URI.replace('http://id.loc.gov','').replace('https://id.loc.gov','')}}</div>

                        </div>
                       
                        <div class="resources-grid-field-list">

                            <template v-for="(profileCompoent,idx) in activeProfile.rt[profileName].ptOrder">
                                
                                <template v-if="displayComponentCheck(activeProfile.rt[profileName].pt[profileCompoent]) === true">
                                    
                                    <div :class="['resources-grid-field-list-property', 'resource-grid-field-list-navable','navable-level-'+idx, 'navable-col-1', `navable-${resourceIdx}-0-${idx}` ]" :id="`navable-${resourceIdx}-0-${idx}-0`" :data-mainrow="idx" :key="idx">
                                        {{returnPropertyShortName(activeProfile.rt[profileName].pt[profileCompoent].propertyURI)}}
                                    </div>
                                    
                                    <CompactEditMainComponent :componentIdx="0" :rowIdx="idx" :resourceIdx="resourceIdx" :key="'component'+idx" v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true " :isMini="false" :class="['resources-grid-field-list-value', 'resource-grid-field-list-navable', 'navable-level-'+idx, 'navable-col-2']" @showMiniEditorEdit="showMiniEditorClick"  :parentURI="activeProfile.rt[profileName].URI" :activeTemplate="activeProfile.rt[profileName].pt[profileCompoent]" :profileName="profileName" :profileCompoent="profileCompoent" :topLevelComponent="true" :ptGuid="activeProfile.rt[profileName].pt[profileCompoent]['@guid']" :parentStructure="activeProfile.rtOrder" :structure="activeProfile.rt[profileName].pt[profileCompoent]"/>
                                </template>
                                


                            </template>

                        </div>




    <!--                     <div v-if="activeProfile.rt[profileName].unusedXml" style="background-color: #fde4b7; overflow-x: hidden;">
                          <h3>There was some XML that could not be loaded into this profile ({{profileName}}):</h3>
                          <details>
                            <summary>View</summary>
                            <code><pre>{{prettifyXml(activeProfile.rt[profileName].unusedXml)}}</pre></code>
                          </details>
                        </div> -->



                    </div>


                </div>

            </template>



        </div>
    </div>



</template>

<style>

.resources-grid{
   display: grid;
   grid-auto-columns: 1fr;
   grid-auto-flow: column;

}
.resources-grid > div{
    border: 1px solid black;
}


.resources-grid-field-list{
  display: grid;
  grid-template-columns: auto 1fr;    

}

.resources-grid-field-list-property{
     border: 1px solid transparent;
     border-right: 1px solid whitesmoke;
     border-bottom: 1px solid whitesmoke;
}
.resources-grid-field-list-value{
     border: 1px solid transparent;
     border-bottom: 1px solid whitesmoke;
}

.navable-active{
    border: 1px solid blue;
}

#edit-left-menu-fixed{
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
#edit-left-menu-fixed::-webkit-scrollbar { 
  display: none;  /* Safari and Chrome */
}



</style>




<script>
// @ is an alias to /src
import CompactEditMainComponent from "@/components/CompactEditMainComponent.vue";

import lookupUtil from "@/lib/lookupUtil"
import config from "@/lib/config"

import uiUtils from "@/lib/uiUtils"
import parseProfile from "@/lib/parseProfile"

import labels from "@/lib/labels"
import exportXML from "@/lib/exportXML"

// import EditMini from "@/views/EditMini"
// import EditLiteralLanguage from "@/components/EditLiteralLanguage"


import { mapState } from 'vuex'


export default {
  name: "EditCompact",
  components: {
    CompactEditMainComponent, // this is defined globaly to allow recursivness to work
    // EditMini,
    // EditLiteralLanguage,

    Keypress: () => import('vue-keypress'),
    
  },
    computed: mapState({
        profilesLoaded: 'profilesLoaded',
        profiles: 'profiles',
        sartingPoint: 'sartingPoint',
        activeInput: 'activeInput',
        activeProfile: 'activeProfile',
        activeComponent: 'activeComponent',
        activeProfileName: 'activeProfileName',
        activeProfileMini: 'activeProfileMini',
        activeEditCounter: 'activeEditCounter',
        activeRecordSaved: 'activeRecordSaved',
        diagramMiniMap: 'diagramMiniMap',


        disableMacroKeyNav: 'disableMacroKeyNav',

        catInitials: 'catInitials',
        workingOnMiniProfile: 'workingOnMiniProfile',

      // to access local state with `this`, a normal function must be used
      // countPlusLocalState (state) {
      //   return state.count + this.localCount
      // }
    }),


  created: async function () {

    // load them profiles if they aint  
    if (!this.profilesLoaded){
        this.$store.dispatch("fetchProfiles", { self: this }).then(async () => {


          console.log(this.$route.params.recordId)
          console.log(this.activeProfile)


          // did we already load the record from the load screen or other place?
          if (!this.activeProfile.eId && this.$route.params.recordId){

            // no
            let ap = await parseProfile.loadRecordFromBackend(this.$route.params.recordId)
            // mark the record as not saved
            this.$store.dispatch("setActiveRecordSaved", { self: this}, false)
            this.$store.dispatch("setActiveProfile", { self: this, profile: ap }).then(() => {




              // load the ontology lookups if they arnt
              this.loadProfileOntologyLookupsBuild()

              console.log('-----diagramMiniMap:',this.diagramMiniMap)

            })

          }else{



            // load the ontology lookups if they arnt
            this.loadProfileOntologyLookupsBuild()


          }










      })       
    }else{




        // did we already load the record from the load screen or other place?
        if (!this.activeProfile.eId && this.$route.params.recordId){

          // no
          let ap = await parseProfile.loadRecordFromBackend(this.$route.params.recordId)
          // mark the record as not saved
          this.$store.dispatch("setActiveRecordSaved", { self: this}, false)
          this.$store.dispatch("setActiveProfile", { self: this, profile: ap }).then(() => {


            this.$nextTick(()=>{

              this.loadProfileOntologyLookupsBuild()

            })

            console.log('-----diagramMiniMap:',this.diagramMiniMap)


          })

        }else{

          this.$nextTick(()=>{

            this.loadProfileOntologyLookupsBuild()

          })

          
        }




    }

    this.$nextTick(() => {
        // uiUtils.renderBorders()

        // window.setTimeout(()=>{document.getElementsByTagName('input')[0].focus()},500)
  
        // set the default highlight field
        setTimeout(() => {
            let newActiveCell = document.getElementById(`navable-${this.navableResource}-${this.navableCol}-${this.navableRow}-${this.navableComponent}`)
            console.log(newActiveCell)
            if (newActiveCell){
                newActiveCell.classList.add('navable-active')
            }
        },750)

        

        window.addEventListener( 'scroll', () => {         

          // if they clicked it with their mouse at the top don't hide it  
          if (this.lastMouseY <= 75){
            this.headerState = 'deployed'
          }      

          if (this.headerState == 'deployed'){

            if (this.$refs.header){
              this.$refs.header.classList.remove('retracted')
              this.$refs.header.classList.remove('inital')
              this.$refs.header.classList.add('deployed')
            }

            return false
          }




          if (window.pageYOffset>5){
            this.headerState='retracted'
            if (this.$refs.header){
              this.$refs.header.classList.remove('inital')
              this.$refs.header.classList.remove('deployed')
              this.$refs.header.classList.add('retracted')
            }

          }else if (window.pageYOffset<=5){

            if (this.$refs.header){
              this.$refs.header.classList.remove('retracted')
              this.$refs.header.classList.remove('deployed')

              this.$refs.header.classList.add('inital')
            }
            this.headerState='inital'

          }


        } );

        window.addEventListener('mousemove', (e) => {

          this.lastMouseY = e.y

          if (e.y < 75){

            if (this.headerState == 'retracted'){
              if (this.$refs.header){              
                this.$refs.header.classList.remove('retracted')
                this.$refs.header.classList.remove('inital')
                this.$refs.header.classList.add('deployed')
              }
              this.headerState = 'deployed'
            }
          }else if (e.y > 75 && this.headerState == 'deployed'){

            this.headerState='retracted'
            if (this.$refs.header){
              this.$refs.header.classList.remove('inital')
              this.$refs.header.classList.remove('deployed')

              this.$refs.header.classList.add('retracted')
            }

          }



        });

    })
  },

  mounted: function(){



  },

  beforeRouteLeave (to, from , next) {
    const answer = window.confirm('Do you really want to leave the edit screen?')
    if (answer) {
      next()
    } else {
      next(false)
    }
  },



  updated: function () {
    // this.$nextTick(function () {
    //     uiUtils.renderBorders()
    // })
  },  

  data: function() {
    return {
      labels: labels,
      ontologyLookupTodo: [],
      displayPreview: false,
      xmlPreview: 'Loading...',
      showPostModal: false,
      showPostModalErrorMsg: false,
      resourceLinks: [],
      headerState: 'inital',
      activeMiniMap: {URI:null},
      miniMapActionValue: 'Actions',
      displayMiniEditor: false,
      displayMiniEditorKey: 12345,
      lastMouseY: 10,
      sourceLaunchId: null,
      sourceOfMiniComponent: null,
      displayLiteralLanguage: false,







      navableResource: 0,
      navableCol: 0,
      navableRow: 0,
      navableComponent: 0,


    }
  },

  methods: {

    prettifyXml: uiUtils.prettifyXml,

    
    // moveDown: uiUtils.globalMoveDown,
    // moveUp: uiUtils.globalMoveUp,
    movePageDown: uiUtils.globalMovePageDown,
    movePageUp: uiUtils.globalMovePageUp,

    dupeProperty: uiUtils.dupeProperty,



    returnPropertyShortName: function(uri){

        uri = uri.replace('http://id.loc.gov/ontologies/bibframe/','')
        uri = uri.replace('http://id.loc.gov/ontologies/bflc/','bflc:')
        uri = uri.replace('http://www.w3.org/2000/01/rdf-schema#','rdfs:')
        return uri
    },


    moveDown: function(event){
        console.log("this.disableMacroKeyNav",this.disableMacroKeyNav)
        if (this.disableMacroKeyNav){ return false}

        let navableResource = this.navableResource
        let navableCol = this.navableCol
        let navableRow = this.navableRow
        let navableComponent = this.navableComponent


        if (navableCol == 0){
            navableRow = navableRow + 1
            navableComponent = 0
        }else if (navableCol == 1){

            //see if adding one to the navcomp finds something
            if (document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent+1}`)){
                navableComponent++
            }else{
                navableRow++
                navableComponent = 0
            }

        }



        let newActiveCell =  document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
        // console.log(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`,newActiveCell)

        if (newActiveCell){

            Array.from(document.querySelectorAll('.resource-grid-field-list-navable')).forEach((el) => el.classList.remove('navable-active'));
            this.$nextTick(()=>{          
                newActiveCell.classList.add('navable-active')
            })

        
            newActiveCell.focus()
            // set it back 
            this.navableRow = navableRow
            this.navableComponent = navableComponent
        }else{

            //try one more ahead, sometimes fields are hidden
            
            navableRow = navableRow + 1
            navableComponent = 0

            let newActiveCell = document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
            if (newActiveCell){
                Array.from(document.querySelectorAll('.resource-grid-field-list-navable')).forEach((el) => el.classList.remove('navable-active'));
                this.$nextTick(()=>{    
                    newActiveCell.focus()      
                    newActiveCell.classList.add('navable-active')
                })
                // set it back 
                this.navableRow = navableRow
                this.navableComponent = navableComponent
            }

        }

        event.event.preventDefault()
        return false 
    },


    moveUp: function(event){

        if (this.disableMacroKeyNav){ return false}

        let navableResource = this.navableResource
        let navableCol = this.navableCol
        let navableRow = this.navableRow
        let navableComponent = this.navableComponent


        if (navableCol == 0){
            navableRow = navableRow - 1
            navableComponent = 0
        }else if (navableCol == 1){

            //see if adding one to the navcomp finds something
            if (document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent+1}`)){
                navableComponent=navableComponent-1
            }else{
                navableRow = navableRow - 1
                navableComponent = 0
            }

        }



        let newActiveCell =  document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
        // console.log(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`,newActiveCell)

        if (newActiveCell){
            Array.from(document.querySelectorAll('.resource-grid-field-list-navable')).forEach((el) => el.classList.remove('navable-active'));
            this.$nextTick(()=>{    
                newActiveCell.focus()      
                newActiveCell.classList.add('navable-active')
            })
            // set it back 
            this.navableRow = navableRow
            this.navableComponent = navableComponent
        }else{

            //try one more ahead, sometimes fields are hidden
            
            navableRow = navableRow - 1
            navableComponent = 0

            let newActiveCell = document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
            if (newActiveCell){
                Array.from(document.querySelectorAll('.resource-grid-field-list-navable')).forEach((el) => el.classList.remove('navable-active'));
                this.$nextTick(()=>{    
                    newActiveCell.focus()      
                    newActiveCell.classList.add('navable-active')
                })
                // set it back 
                this.navableRow = navableRow
                this.navableComponent = navableComponent
            }

        }

        event.event.preventDefault()
        return false 
    },

    moveRight: function(event){

        if (this.disableMacroKeyNav){ return false}
    

        
        let navableResource = this.navableResource
        let navableCol = this.navableCol
        let navableRow = this.navableRow
        let navableComponent = this.navableComponent

        if (navableCol==0){
            navableCol = navableCol + 1  
        }else{
            navableCol = 0
            navableResource=navableResource+1
        }
              

        let newActiveCell = document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
        // console.log(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`,newActiveCell)

        if (newActiveCell){

            Array.from(document.querySelectorAll('.resource-grid-field-list-navable')).forEach((el) => el.classList.remove('navable-active'));
            this.$nextTick(()=>{    
                newActiveCell.focus()      
                newActiveCell.classList.add('navable-active')
            })

            // set it back 
            this.navableRow = navableRow
            this.navableComponent = navableComponent
            this.navableCol=navableCol
            this.navableResource=navableResource





        }else{
            navableComponent++
            newActiveCell = document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
              if (newActiveCell){

                        Array.from(document.querySelectorAll('.resource-grid-field-list-navable')).forEach((el) => el.classList.remove('navable-active'));
                        this.$nextTick(()=>{    
                            newActiveCell.focus()      
                            newActiveCell.classList.add('navable-active')
                        })

                        // set it back 
                        this.navableRow = navableRow
                        this.navableComponent = navableComponent
                        this.navableCol=navableCol
                        this.navableResource=navableResource

              }

        }
        event.event.preventDefault()
        return false 
    },


    moveLeft: function(event){

        if (this.disableMacroKeyNav){ return false}
    

        
        let navableResource = this.navableResource
        let navableCol = this.navableCol
        let navableRow = this.navableRow
        let navableComponent = this.navableComponent

        if (navableCol==1){
            navableCol = navableCol - 1  
        }else{
            navableCol = 0
            navableResource=navableResource-1
        }
              

        let newActiveCell = document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
        // console.log(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`,newActiveCell)

        if (newActiveCell){
            Array.from(document.querySelectorAll('.resource-grid-field-list-navable')).forEach((el) => el.classList.remove('navable-active'));
            this.$nextTick(()=>{    
                newActiveCell.focus()      
                newActiveCell.classList.add('navable-active')
            })
            // set it back 
            this.navableRow = navableRow
            this.navableComponent = navableComponent
            this.navableCol=navableCol
            this.navableResource=navableResource





        }
        event.event.preventDefault()
        return false 
    },




    setActiveNavable: function(){



    },


























    displayComponentCheck: function(structure){

      if (structure.propertyURI == "http://id.loc.gov/ontologies/bibframe/hasItem"){

        return false;
      }
      if (structure.propertyURI == "http://id.loc.gov/ontologies/bibframe/hasInstance"){

        return false;
      }

      return true;
    },


    toggleLiteralLanguage: function(){

        if (this.displayLiteralLanguage){
            this.displayLiteralLanguage=false
        }else{
            this.displayLiteralLanguage=true
            // refresh once it is open            
            this.$nextTick(()=>{          
                this.$refs.literalLanguageModal.refreshDisplay()
            })
        }


    },

    postAndUseMini: async function(){

        this.$refs.miniEditorHub.triggerSave()

        let useData = await this.$refs.miniEditorHub.publish()



        // we are going to send this uri to the source component that asked the mini editor to load
        let tempContext = {
          "contextValue": true,                  
          "source": [],
          "type": "Hub",
          "variant": [],
          "uri": useData.useURI,
          "typeFull": "http://id.loc.gov/ontologies/bibframe/Hub",
          "title": useData.useCreator + ' ' + useData.useTitle,
          "contributor": [],
          "date": null,
          "genreForm": null,
          "nodeMap": {},
          "precoordinated" : false,
          "literal": false
        }     

        // turn off the mini editor as active profile
        this.$store.dispatch("setWorkingOnMiniProfile", { self: this, value: false }).then(() => {

            // set the context with the value to use
            this.$store.dispatch("setContextManually", { self: this.sourceOfMiniComponent, context: tempContext, }).then(() => {
                //tell it to set the value
                this.$store.dispatch("setValueComplex", { self: this.sourceOfMiniComponent, profileComponet: this.sourceOfMiniComponent.profileCompoent, template:this.sourceOfMiniComponent.activeTemplate, structure: this.sourceOfMiniComponent.structure, parentStructure: this.sourceOfMiniComponent.parentStructureObj }).then(() => {
                    // ask the UI to refresh from store
                    this.sourceOfMiniComponent.checkForUserData()

                })
            })


        })





        this.closeMiniEditor();

        return useData

    },


    closeMiniEditor: function(){

        this.displayMiniEditor = false


        this.$store.dispatch("setWorkingOnMiniProfile", { self: this, value: false }).then(() => {

            if (this.sourceLaunchId){
                document.getElementById(this.sourceLaunchId).focus()
            }

        })





    },


    showMiniEditorClick: function(payload){

        // TEMP hack, the children components aren't refreshing
        // need to figure out why, but two cycles clear the problem
        console.log("showMiniEditorClick")
        this.showMiniEditor(payload, ()=>{
            this.closeMiniEditor(payload)
            console.log("showMiniEditorClick 2")
            this.showMiniEditor(payload)
        })
        
        

    },

    showMiniEditor: function(payload, callback){

        // make a new key for each time it is loaded
        this.displayMiniEditorKey = `miniEditor-${Date.now()}`

        this.displayMiniEditor = true
        this.sourceLaunchId = payload.sourceId
        this.sourceOfMiniComponent = payload.component



        this.$store.dispatch("setWorkingOnMiniProfile", { self: this, value: true }).then(() => {

            if (this.profiles[payload.useProfile]){
                let profile = parseProfile.loadNewTemplate(payload.useProfile, this.catInitials)

                profile.user = this.catInitials
                console.log('-------')
                console.log(profile)
                console.log('-------')
                this.$store.dispatch("setActiveProfile", { self: this, profile: profile }).then(() => {
                   
                    this.$nextTick(()=>{
                  
                        document.getElementsByClassName('selectable-input-mini')[0].focus()
                        if (callback) callback()

                    })


                })

            }else{
                alert('Cannot find profile:',payload.useProfile)
            }


        })









        

    },


    cleanUpErrorResponse: function(msg){

        msg = JSON.stringify(msg,null,2)

        msg = msg.replace(/\\n|\\t/g, '').replace(/\\"/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>')

        return msg

    },


    miniMapAction: function(){


      if (this.miniMapActionValue == 'addItem'){

        console.log(this.activeMiniMap.parent)
        this.$store.dispatch("addItem",{uri:this.activeMiniMap.URI}).then(() => {        
          console.log(this.activeProfile)
        })

      }
      if (this.miniMapActionValue == 'deleteItem'){


        this.$store.dispatch("deleteItem",{uri:this.activeMiniMap.URI}).then(() => {        

        })

      }
      if (this.miniMapActionValue == 'cloneInstance'){


        this.$store.dispatch("cloneInstance",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      }
      if (this.miniMapActionValue == 'cloneItem'){


        this.$store.dispatch("duplicateItem",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      }      
      if (this.miniMapActionValue == 'deleteItem'){


        this.$store.dispatch("deleteItem",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      } 
      if (this.miniMapActionValue == 'deleteInstance'){


        this.$store.dispatch("deleteInstance",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      } 
      if (this.miniMapActionValue == 'addInstance'){


        this.$store.dispatch("addInstance",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      } 


      this.miniMapActionValue='Actions'

    },

    miniMapClick: function(value){

      let rtName = value.rt

      if (value.counter == 0){
        rtName=rtName+'1'      
      }else if (value.counter>0){

        rtName=rtName+'1'
      }

      


      let id = rtName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_') + value.jumpTo.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')

      console.log(value)
      console.log(id)
      this.scrollFieldContainerIntoView(null,id)


      

      this.activeMiniMap = value




    },

    togglePreview: async function(){

      if (this.displayPreview){

        this.displayPreview = false


        this.xmlPreview = 'Loading...'



      }else{

        let xml = await exportXML.toBFXML(this.activeProfile)
        this.xmlPreview = xml.xmlStringFormatted
        
        this.displayPreview = true
      }


    },

    escapeKey: function(){

      if (this.displayPreview){
        this.displayPreview = false
      }


      if (this.showPostModal){
        this.showPostModal = false
      }

    },

    publish: async function(){

      this.showPostModal = true

      let xml = await exportXML.toBFXML(this.activeProfile)
      let pubResuts = await lookupUtil.publish(xml.xlmString,this.activeProfile.eId,this.activeProfile)

      this.showPostModalErrorMsg = false

      if (pubResuts.status){
        // if it posted we want to also save the record and mark it as posted

        this.activeProfile.status = 'published'

        this.$store.dispatch("setActiveProfile", { self: this, profile: this.activeProfile }).then(async () => {

          this.resourceLinks=[]

          // build it again for the new status
          xml = await exportXML.toBFXML(this.activeProfile)
          lookupUtil.saveRecord(xml.xlmStringBasic, this.activeProfile.eId)



          for (let rt in this.activeProfile.rt){
            let type = rt.split(':').slice(-1)[0]
            let url = config.convertToRegionUrl(this.activeProfile.rt[rt].URI)
            let env = config.returnUrls().env
            this.resourceLinks.push({
              'type':type,
              'url': url,
              'env': env
            })
          }




        })


      }else{

        this.showPostModalErrorMsg = JSON.parse(pubResuts.msg)

      }

    },


    isProd: function(){

      if (config.returnUrls().env == 'dev') return false
      if (config.returnUrls().env == 'staging') return false
      if (config.returnUrls().env == 'production') return true  
    },
          


    reportError: async function(event){

        let desc = prompt("Please enter descripion of the problem");

        if (!desc){
          return false
        }

        let contact = prompt("Your Email Address (Optional) ");




        const rawResponse = await fetch(config.returnUrls().util + 'error/report', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({eId: this.activeProfile.eId, desc:desc, contact:contact, activeProfile: this.activeProfile})
        });
        const content = await rawResponse.json();
        if (content.result){
          alert("Thanks!")
        }
        console.log(content);



        event.preventDefault()
        return false

    },

    

    triggerSave: async function(){

      let xml = await exportXML.toBFXML(this.activeProfile)
      lookupUtil.saveRecord(xml.xlmStringBasic, this.activeProfile.eId)

      this.$store.dispatch("setActiveRecordSaved", { self: this}, true).then(() => {

      })

    },



    restoreDelete: function(event, profile, id){

      this.$store.dispatch("restoreProperty", { self: this, id: id, profile:profile  }).then(() => {
        
      })   




    },


    scrollFieldContainerIntoView: function(event,id){
      console.log('-----')
      console.log(id)
      console.log(document.getElementById('container-for-'+id))
      document.getElementById('container-for-'+id).scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
      window.setTimeout(()=>{
        if (document.querySelector('#container-for-'+id + ' input')){
          document.querySelector('#container-for-'+id + ' input').focus()  
        }
        
      },400)

      if (event){
        event.preventDefault()
        return false
      }


    },

    


    loadProfileOntologyLookupsBuild: function(){

      // loop through the now active profile and request each property uri from cache or id.loc.gov

      Object.keys(this.activeProfile.rt).forEach((rtk)=>{
        Object.keys(this.activeProfile.rt[rtk].pt).forEach((ptk)=>{
          if (this.activeProfile.rt[rtk].pt[ptk].propertyURI == 'http://id.loc.gov/ontologies/bibframe/title'){

            if (this.ontologyLookupTodo.indexOf(this.activeProfile.rt[rtk].pt[ptk].propertyURI) == -1){
              this.ontologyLookupTodo.push(this.activeProfile.rt[rtk].pt[ptk].propertyURI)  
            }           
          }

        })
      })

      this.loadProfileOntologyLookupsRequest()
    },


    loadProfileOntologyLookupsRequest: function(){
      // this makes the reqeusts but does it one at a time


      if (this.ontologyLookupTodo.length>0){
        // grab one
        let uri = this.ontologyLookupTodo.pop()
        this.$store.dispatch("fetchOntology", { self: this, uri: uri }).then(() => {          
          this.loadProfileOntologyLookupsRequest()
        })   

        

      }

    },



    returnOpacFormat: function(userValue){
      let r = []
      try{


        // console.log(userValue)
        // console.log(Object.keys(userValue))
        Object.keys(userValue).forEach((k)=>{  
          // console.log(k)    
          // console.log(userValue[k])    
          if (!k.startsWith('@')){
            // console.log(userValue[k],"<----")
            for (let objVal of userValue[k]){
              // console.log(objVal)
              Object.keys(objVal).forEach((kk)=>{
                if (!kk.startsWith('@')){
                  if (typeof objVal[kk] == 'string'){
                    r.push(objVal[kk])                  
                  }else if (Array.isArray(objVal[kk])){

                    for (let objVal2 of objVal[kk]){
                      Object.keys(objVal2).forEach((kkk)=>{
                        if (!kkk.includes('@')){
                          if (typeof objVal2[kkk] == 'string'){
                            r.push(objVal2[kkk])
                          }                      
                        }
                      })
                    }
                  }
                }else if (kk=='@context'){

                    if (objVal[kk].title){
                        if (r.indexOf(objVal[kk].title)==-1){
                            r.push(objVal[kk].title)
                        }
                    }

                }
              })
            }
          }



        })

        if (r.length == 0 && userValue['@id']){
          r.push(userValue['@id'])
        }


        r = [...new Set(r)];

      }catch{
        return "error"
      }
      return r
    },


    liHasData: function(structure){

      if (Object.keys(structure.userValue).length>0){
        return true
      }else if (structure.valueConstraint && structure.valueConstraint.defaults && structure.valueConstraint.defaults.length>0){
        return true
      } else{
        return false  
      }      
      
    }
  }  
};
</script>


