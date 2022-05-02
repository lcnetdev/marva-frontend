<template>
    <div>

        <EditNavToolBar ref="navToolBar" :forceComponentRedraw="forceComponentRedraw"/>



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


            
            <template v-if="profilesLoaded && activeProfile && activeProfile.rtOrder">

                <div v-for="(profileName, resourceIdx) in activeProfile.rtOrder.filter((p)=>{return (!p.includes(':Item'))})"  :key="profileName+keyCounter">

                    
                    <div v-if="activeProfile.rt[profileName].noData != true" :class="['container-' + profileName.split(':').slice(-1)[0].split('-')[0]]" :style="{ 'background-color': returnContainerBGColor(profileName) }">


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
                       
                        <div class="resources-grid-field-list ">
                            <template v-for="(profileCompoent,idx) in activeProfile.rt[profileName].ptOrder">
                                
                                <template v-if="displayComponentCheck(activeProfile.rt[profileName].pt[profileCompoent]) === true">
                                    
                                    <div :class="['resources-grid-field-list-property', 'enriched-menu-spreadsheet', 'navable-level-'+idx, 'navable-col-1', `navable-${resourceIdx}-0-${idx}` ]" :id="`navable-${resourceIdx}-0-${idx}-0`" :data-mainrow="idx" :key="profileCompoent+'_'+idx+'_'+keyCounter">
                                        {{returnPropertyShortName(activeProfile.rt[profileName].pt[profileCompoent].propertyURI)}}
                                        <div class="enriched-menu-controls-spreadsheet">
                                            
                                            
                                                <button title="Add Blank Component" @click="addProperty($event, profileName,profileCompoent)">
                                                    <svg width="25px" height="25px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                     <path class="enriched-menu-icon-spreadsheet" d="m50 2.6797c-26.082 0-47.395 21.23-47.395 47.32 0 26.082 21.238 47.32 47.395 47.32 26.082 0 47.32-21.234 47.32-47.32 0-26.082-21.234-47.32-47.32-47.32zm0 10.996c20.039 0 36.324 16.289 36.324 36.324 0 20.039-16.289 36.324-36.324 36.324-20.039 0-36.324-16.289-36.324-36.324 0-20.039 16.289-36.324 36.324-36.324zm0 9.625c-3.0117 0-5.5352 2.5234-5.5352 5.5352v15.164h-15.16c-3.0117 0-5.5391 2.5234-5.5391 5.5352 0 3.0156 2.5234 5.5352 5.5391 5.5352h15.16v15.16c0 3.0117 2.5234 5.5352 5.5352 5.5352s5.5352-2.5234 5.5352-5.5352v-15.16h15.16c3.0117 0 5.5391-2.5234 5.5391-5.5352 0-3.0156-2.5938-5.457-5.5391-5.457h-15.16v-15.242c0-3.0117-2.5234-5.5352-5.5352-5.5352z"/>
                                                    </svg>
                                                </button>
                                                
                                                <button title="Remove Component" @click="removeProperty(profileName,profileCompoent)">
                                                    <svg width="25px" height="25px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                     <g>
                                                      <path class="enriched-menu-icon-spreadsheet" d="m50 0c-27.613 0-50 22.387-50 50s22.387 50 50 50 50-22.387 50-50-22.387-50-50-50zm0 90c-22.059 0-40-17.941-40-40s17.941-40 40-40 40 17.941 40 40-17.941 40-40 40z"/>
                                                      <path class="enriched-menu-icon-spreadsheet" d="m71.613 36.719c0-2.2109-0.875-4.3281-2.4414-5.8945-1.5625-1.5664-3.6797-2.4414-5.8945-2.4414s-4.3281 0.87891-5.8945 2.4414l-8.25 8.25-8.25-8.25c-1.5625-1.5625-3.6797-2.4414-5.8945-2.4414-2.207 0.003907-4.3164 0.87891-5.8828 2.4453-1.5625 1.5625-2.4375 3.6836-2.4375 5.8906 0 2.2109 0.87891 4.3281 2.4414 5.8945l8.25 8.25-8.25 8.25c-1.5625 1.5586-2.4414 3.6758-2.4414 5.8867s0.875 4.3281 2.4414 5.8945c1.5625 1.5625 3.6797 2.4375 5.8906 2.4375s4.3281-0.87891 5.8945-2.4414l8.25-8.25 8.25 8.25c1.5586 1.5625 3.6758 2.4414 5.8867 2.4414s4.3281-0.875 5.8945-2.4414c1.5664-1.5625 2.4414-3.6797 2.4414-5.8945s-0.87891-4.3281-2.4414-5.8945l-8.25-8.25 8.25-8.25c1.5625-1.5547 2.4375-3.6719 2.4375-5.8828z"/>
                                                     </g>
                                                    </svg>
                                                </button>
                                                <button title="Duplicate Component" @click="addProperty($event,profileName,profileCompoent,true)">
                                                    <svg width="25px" height="25px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                     <g>
                                                      <path class="enriched-menu-icon-spreadsheet" d="m79.5 31.801h-43.398c-1.8008 0-3.3008 1.5-3.3008 3.3008v43.5c0 1.8008 1.5 3.3008 3.3008 3.3008h43.5c1.8008 0 3.3008-1.5 3.3008-3.3008l-0.003906-43.5c-0.097657-1.8008-1.5-3.3008-3.3984-3.3008z"/>
                                                      <path class="enriched-menu-icon-spreadsheet" d="m67.199 29.801v-7.5c0-2.3008-1.8008-4.1016-4.1016-4.1016h-41.797c-2.3008 0-4.1016 1.8984-4.1016 4.1016v41.801c0 2.3008 1.8008 4.1016 4.1016 4.1016h9.5v-33.102c0-2.8984 2.3984-5.3008 5.3008-5.3008z"/>
                                                     </g>
                                                    </svg>
                                                </button>
                                                <button title="Send To Instance" v-if="canSendToInstance(activeProfile.rt[profileName].pt[profileCompoent].propertyURI,profileName)" @click="sendToInstance($event,profileName,profileCompoent,activeProfile.rt[profileName].pt[profileCompoent])">
                                                    <svg width="25px" height="25px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                     <path class="enriched-menu-icon-spreadsheet" d="m100 50-100-44.414 9.4961 37.988 34.918 6.4258-34.918 6.4258-9.4961 37.988z" fill-rule="evenodd"/>
                                                    </svg>
                                                </button>

                                        </div>

                                    </div>
                                    
                                    <CompactEditMainComponent :componentIdx="1" :rowIdx="idx" :setNavAfterClick="setNavAfterClick" :resourceIdx="resourceIdx" :key="'component'+idx+'_'+keyCounter" v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true " :isMini="false" :class="['resources-grid-field-list-value', 'navable-level-'+idx, 'navable-col-2']" @showMiniEditorEdit="showMiniEditorClick"  :parentURI="activeProfile.rt[profileName].URI" :activeTemplate="activeProfile.rt[profileName].pt[profileCompoent]" :profileName="profileName" :profileCompoent="profileCompoent" :topLevelComponent="true" :ptGuid="activeProfile.rt[profileName].pt[profileCompoent]['@guid']" :parentStructure="activeProfile.rtOrder" :structure="activeProfile.rt[profileName].pt[profileCompoent]"/>
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

                        <template v-if="profileName.includes(':Instance')">
                            

                            <div v-for="(profileName2) in activeProfile.rtOrder.filter((p)=>{return (p.includes(':Item'))})"  :key="profileName2+'_'+keyCounter" :style="{ 'background-color': '#ececec' }" >

                                <div style="margin-top: 1em;" v-if="activeProfile.rt[profileName2].itemOf == activeProfile.rt[profileName].URI">

                                    <div style="display: flex; max-height: 2em; height: 2em;">
                                      <div style="flex: 0">

                                        <div style="display:inline-block;     width: 26px; margin-left: 25px; margin-right: 5px;" v-if="profileName2.includes(':Item')">
                                          <svg  viewBox="0 0 50 72" version="1.1" xmlns="http://www.w3.org/2000/svg">

                                               <rect width="50px" height="50px" style="fill:#eaeaea;stroke-width:0.5;stroke:rgb(0,0,0)" />
                                          </svg>
                                        </div>
                                      </div>
                                      <div style="flex-basis: auto; font-size: 1.25em; font-weight: bold; text-align: left;">{{profileName2.split(':').slice(-1)[0]}}</div>
                                      <div style="flex: 1; text-align: right;line-height: 1.25em;">{{activeProfile.rt[profileName2].URI.replace('http://id.loc.gov','').replace('https://id.loc.gov','')}}</div>

                                    </div>


                                </div>

                                <div class="resources-grid-field-list" :key="'resources-grid-field-list_'+profileName2+'_'+keyCounter">

                                    <template v-for="(profileCompoent2,idx2) in activeProfile.rt[profileName2].ptOrder">
                                        
                                        <template v-if="displayComponentCheck(activeProfile.rt[profileName2].pt[profileCompoent2]) === true">
                                            
                                            <div :class="['resources-grid-field-list-property', 'navable-level-'+activeProfile.rt[profileName].ptOrder.length+idx2, 'navable-col-1', `navable-${resourceIdx}-0-${activeProfile.rt[profileName].ptOrder.length+idx2}` ]" :id="`navable-${resourceIdx}-0-${activeProfile.rt[profileName].ptOrder.length+idx2}-0`" :data-mainrow="activeProfile.rt[profileName].ptOrder.length+idx2" :key="activeProfile.rt[profileName].ptOrder.length+idx2+'_'+keyCounter">
                                                {{returnPropertyShortName(activeProfile.rt[profileName2].pt[profileCompoent2].propertyURI)}}
                                            </div>
                                            
                                            <CompactEditMainComponent :componentIdx="1" :rowIdx="activeProfile.rt[profileName].ptOrder.length+idx2" :setNavAfterClick="setNavAfterClick" :resourceIdx="resourceIdx" :key="'component'+idx2+'_'+keyCounter" v-if="activeProfile.rt[profileName2].pt[profileCompoent2].deleted != true " :isMini="false" :class="['resources-grid-field-list-value', 'navable-level-'+idx2, 'navable-col-2']" @showMiniEditorEdit="showMiniEditorClick"  :parentURI="activeProfile.rt[profileName2].URI" :activeTemplate="activeProfile.rt[profileName2].pt[profileCompoent2]" :profileName="profileName2" :profileCompoent="profileCompoent2" :topLevelComponent="true" :ptGuid="activeProfile.rt[profileName2].pt[profileCompoent2]['@guid']" :parentStructure="activeProfile.rtOrder" :structure="activeProfile.rt[profileName2].pt[profileCompoent2]"/>
                                        </template>
                                        



                                    </template>

                                </div>





                            </div>     


                        </template>


                    </div>


                </div>

            </template>



        </div>




        <div v-if="sendToTempDispaly" id="send-to-modal">
            
            <ul>
                <li v-for="rt in activeProfile.rtOrder" :key="rt" @click="sendToSendIt(rt)">{{rt}}</li>

            </ul>

            <button @click="sendToTempDispaly=false" style="position:absolute; bottom: 5px; right: 5px;">Close</button>
        </div>



    </div>



</template>

<style>

/*.container-Work{
    background-color: white !important;
}
*/
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
     border-right: 1px solid black;
     border-bottom: 1px solid black;
}
.resources-grid-field-list-value{

     border: 1px solid transparent;
     border-bottom: 1px solid black;
}

.navable-active{
    padding: 0px;
    border: 1px solid blue !important;    
}
.resource-grid-field-list-navable{
    padding: 1px;
}
.resource-grid-field-list-navable:hover{
    padding: 0px;
    border: 1px solid gray !important;   
    cursor: pointer; 
}

#edit-left-menu-fixed{
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
#edit-left-menu-fixed::-webkit-scrollbar { 
  display: none;  /* Safari and Chrome */
}

.enriched-menu-spreadsheet{
    position: relative;
    cursor: pointer;
}

.enriched-menu-spreadsheet .enriched-menu-controls-spreadsheet{
    display: none;
    float: right;
    position: absolute;
    top: 0;
    right: 0;
}


.enriched-menu-spreadsheet:hover .enriched-menu-controls-spreadsheet{
    display: block;
}


.enriched-menu-controls-spreadsheet button{
    background-color: transparent;
    color: white;
    font-weight: bold;
    cursor: pointer;
    height: 25px;
    padding: 0;
}
.enriched-menu-controls-spreadsheet button:hover{
    /*background-color: white;*/
    color: black;
}
.enriched-menu-controls-spreadsheet button:hover .enriched-menu-icon-spreadsheet{
    /*background-color: white;*/
    fill: red;
    color: black;
}


</style>




<script>
// @ is an alias to /src
import CompactEditMainComponent from "@/components/CompactEditMainComponent.vue";
import EditNavToolBar from "@/components/EditNavToolBar.vue";

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
    EditNavToolBar,
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

    // document.addEventListener("visibilitychange", function() {
        
    //     console.log('document.hidden',document.hidden)
    //     this.keyCounter++
        





    // });





    // load them profiles if they aint  
    if (!this.profilesLoaded){
        this.$store.dispatch("fetchProfiles", { self: this }).then(async () => {


          console.log(this.$route.params.recordId)
          console.log('activeProfile',this.activeProfile)


          // did we already load the record from the load screen or other place?
          if (!this.activeProfile.eId && this.$route.params.recordId){

            // no
            let ap = await parseProfile.loadRecordFromBackend(this.$route.params.recordId)
            // mark the record as not saved

            // mark the record as saved and save the inital of it so it is registered in the undo log
            this.$store.dispatch("setActiveUndo", { self: this, msg:'Loaded record'}).then(()=>{

                this.$store.dispatch("forceSave", { self: this}, true).then(() => {
                    this.$store.dispatch("setActiveRecordSaved", { self: this}, true).then(() => {
                    })    
                })  

            })


            // this.$store.dispatch("setActiveRecordSaved", { self: this}, false)
            this.$store.dispatch("setActiveProfile", { self: this, profile: ap }).then(() => {
                // load the ontology lookups if they arnt
                this.loadProfileOntologyLookupsBuild()
                console.log('activeProfile',this.activeProfile)

            })

          }else{

            // load the ontology lookups if they arnt
            this.loadProfileOntologyLookupsBuild()


          }










      })       
    }else{


        console.log('this.activeProfile.eId',this.activeProfile.eId)

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
          console.log('ACtive proifiel:',this.activeProfile)
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

  // beforeRouteLeave (to, from , next) {
  //   const answer = window.confirm('Do you really want to leave the edit screen?')
  //   if (answer) {
  //     next()
  //   } else {
  //     next(false)
  //   }
  // },



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

      keyCounter: 0,

      color: 'black',



      navableResource: 0,
      navableCol: 0,
      navableRow: 0,
      navableComponent: 0,


      sendToTemp: {},
      sendToTempDispaly: false,

    }
  },

  methods: {

    prettifyXml: uiUtils.prettifyXml,

    
    // moveDown: uiUtils.globalMoveDown,
    // moveUp: uiUtils.globalMoveUp,
    movePageDown: uiUtils.globalMovePageDown,
    movePageUp: uiUtils.globalMovePageUp,

    dupeProperty: uiUtils.dupeProperty,



    addProperty: function(event, profileName, profileCompoent,dupeData){
      if (!dupeData){dupeData=false}
    console.log(event, profileName, profileCompoent,dupeData)
      this.$store.dispatch("duplicateProperty", { self: this, id: profileCompoent, profile:profileName, dupeData:dupeData }).then(() => {
        
      })   
      this.keyCounter++
      event.stopPropagation();

    },


    removeProperty: function(profileName, profileCompoent){


      const answer = window.confirm('Are you sure you want to remove the property?')
      if (answer) {
        this.$store.dispatch("removeProperty", { self: this, id: profileCompoent, profile:profileName }).then(() => {
          
        })         

      } else {
        
        return false

      }
      this.keyCounter++





    },


    sendToSendIt(rt){

        if (rt != this.sendToTemp.profileName){


            this.$store.dispatch("sendToInstance", { self: this, from: this.sendToTemp, to:rt }).then(async () => {

            })


        }
        this.sendToTempDispaly=false;
        this.keyCounter++
    },


    sendToInstance(event, profileName,profileCompoent,data){

        console.log(profileName,profileCompoent,data)

        this.sendToTemp = {'profile':profileName,componet:profileCompoent,data:data}

        this.sendToTempDispaly=true;

        event.stopPropagation();

    },

    canSendToInstance: function(uri,profileName){

        if (profileName.includes(':Work')){
            // add this to the config
            if (uri == 'http://id.loc.gov/ontologies/bibframe/contribution'){
                return true
            }
        }

        return false

    },



    setNavAfterClick: function(elId){


        let ids = elId.replace('navable-','').split('-')
        console.log(ids)
        if (ids.length<3){
            return false
        }

        this.navableResource = parseInt(ids[0])
        this.navableCol = parseInt(ids[1])
        this.navableRow = parseInt(ids[2])


        if (ids[3].includes('.')){
            this.navableComponent = parseFloat(ids[3])
        }else{
            this.navableComponent = parseInt(ids[3])
        }
        console.log(`navable-${this.navableResource}-${this.navableCol}-${this.navableRow}-${this.navableComponent}`)

        let newActiveCell =  document.getElementById(`navable-${this.navableResource}-${this.navableCol}-${this.navableRow}-${this.navableComponent}`)

        if (newActiveCell){
            Array.from(document.querySelectorAll('.navable-active')).forEach((el) => el.classList.remove('navable-active'));
            this.$nextTick(()=>{          
                newActiveCell.classList.add('navable-active')
            })        
        }



    },

    forceComponentRedraw: function(){


        console.log("do something to refresh here")


    },

    returnContainerBGColor: function(profileName){

        console.log(profileName)
        if (profileName.includes(':Work')){
            return '#deeaea73'    
        }
        if (profileName.includes(':Instance')){
            return 'whitesmoke'    
        }

        if (profileName.includes(':Item')){
            return 'rgb(234, 234, 234)'    
        }
        

        return 'white'

    },



    returnPropertyShortName: function(uri){

        uri = uri.replace('http://id.loc.gov/ontologies/bibframe/','')
        uri = uri.replace('http://id.loc.gov/ontologies/bflc/','bflc:')
        uri = uri.replace('http://www.w3.org/2000/01/rdf-schema#','rdfs:')
        return uri
    },


    moveDown: function(event){

        if (this.disableMacroKeyNav){ return false}

        let navableResource = this.navableResource
        let navableCol = this.navableCol
        let navableRow = this.navableRow
        let navableComponent = this.navableComponent


        // if we are just in the name col just move down one row
        if (navableCol == 0){
            
            navableRow = navableRow + 1
            navableComponent = 0


        // or we are in a component, in that case wee need to see if there are anymore 
        // components below this one, if so pick that one
        // if not then just jump to the next row down
        }else if (navableCol == 1){

            // increase navableComponent by at least one to move it off the current one
            navableComponent=navableComponent+0.1

            let possiblities = [];
            [...Array(40)].forEach((_, i) => {

                let addTo = i * 0.1
                addTo = Math.round(addTo * 10) / 10
                let n = Math.round((navableComponent+(addTo)) * 10) / 10

                let id=`navable-${navableResource}-${navableCol}-${navableRow}-${n}`

                if (document.getElementById(id)){
                    console.log('Looking for',id,document.getElementById(id))
                    possiblities.push(n)
                }
            });

            if (possiblities.length>0){
                navableComponent=possiblities[0]
            }else{
                // nothing was found, so jump rows
                // but we also need to look for rows that are not in sequence
                let found = false;
                [...Array(10)].forEach(() => {  
                    if (found){return false}
                    navableRow = navableRow + 1;
                    console.log("navableRow",navableRow)
                    // but we still need to find the first component of that next row
                    // so do the same thing
                    navableComponent = 0
                    let possiblities = [];
                    [...Array(40)].forEach((_, i) => {         
                        let addTo = i * 0.1
                        addTo = Math.round(addTo * 10) / 10
                        let n = Math.round((navableComponent+(addTo)) * 10) / 10

                        if (document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${n}`)){
                            console.log('Looking for',`navable-${navableResource}-${navableCol}-${navableRow}-${n}`,document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${n}`))
                            possiblities.push(n)
                        }
                    });
                    if (possiblities.length>0){
                        navableComponent=possiblities[0]
                        found=true
                    }else{
                        console.warn('No next component found in the next row MoveDown')
                    }   

                })            
            }
        }



        let newActiveCell =  document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)

        if (newActiveCell){
            Array.from(document.querySelectorAll('.navable-active')).forEach((el) => el.classList.remove('navable-active'));
            this.$nextTick(()=>{          
                newActiveCell.classList.add('navable-active')
            })        
            newActiveCell.focus()
            // set it back 
            this.navableRow = navableRow
            this.navableComponent = navableComponent
        }else{

            // was not found for some reason

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


        // if we are just in the name col just move up one row
        if (navableCol == 0){
            
            navableRow = navableRow - 1
            navableComponent = 0


        // or we are in a component, in that case wee need to see if there are anymore 
        // components aboce this one, if so pick that one
        // if not then just jump to the next row down
        }else if (navableCol == 1){

            // increase navableComponent by at least one to move it off the current one
            navableComponent = navableComponent -0.1


            let possiblities = [];
            [...Array(40)].forEach((_, i) => {
            
                let addTo = i * 0.1
                addTo = Math.round(addTo * 10) / 10
                let n = Math.round((navableComponent-(addTo)) * 10) / 10

                if (document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${n}`)){
                    console.log('Looking for', n,`navable-${navableResource}-${navableCol}-${navableRow}-${n}`,document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${n}`))
                    possiblities.push(n)
                }

            });

            if (possiblities.length>0){
                navableComponent=possiblities[0]
            }else{
                // nothing was found, so jump rows
                // but we also need to look for rows that are not in sequence
                let found = false;
                [...Array(10)].forEach(() => {  
                    if (found){return false}
                    navableRow = navableRow - 1;

                    // but we gota find the last component of the row above
                    navableComponent = 20
                    let possiblities = [];
                    [...Array(1000)].forEach((_, i) => {         
                        let addTo = i * 0.1
                        addTo = Math.round(addTo * 10) / 10
                        let n = Math.round((navableComponent-(addTo)) * 10) / 10

                        if (document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${n}`)){
                            console.log('Looking for', n,`navable-${navableResource}-${navableCol}-${navableRow}-${n}`,document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${n}`))
                            possiblities.push(n)
                        }
                    });   

                    if (possiblities.length>0){
                        navableComponent=possiblities[0]
                        found=true
                    }else{
                        console.warn('No previous component found in the next row MoveUp')
                    }

                })
            }

            console.log(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
        }



        let newActiveCell =  document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)

        if (newActiveCell){

            Array.from(document.querySelectorAll('.navable-active')).forEach((el) => el.classList.remove('navable-active'));
            this.$nextTick(()=>{          
                newActiveCell.classList.add('navable-active')
            })        
            newActiveCell.focus()
            // set it back 
            this.navableRow = navableRow
            this.navableComponent = navableComponent
        }else{

            // was not found for some reason

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

        // if we are in the name col move over to the component col
        if (navableCol==0){
            navableCol = navableCol + 1  

            // but we want to find the first component div, it could be that it is x-x-x-0 or x-x-x-1 or even x-x-x-2 for some reason
            // so look for the first one regardles if it 0/1/2 etc
            navableComponent=0

            let possiblities = [];
            [...Array(40)].forEach((_, i) => {

                let addTo = i * 0.1
                addTo = Math.round(addTo * 10) / 10
                let n = Math.round((navableComponent+(addTo)) * 10) / 10

                let id=`navable-${navableResource}-${navableCol}-${navableRow}-${n}`

                if (document.getElementById(id)){
                    console.log('Looking for',id,document.getElementById(id))
                    possiblities.push(n)
                }
            });

            if (possiblities.length>0){
                navableComponent=possiblities[0]
            }



        // if we are in the componet col move over to the next resource
        }else{

            navableCol = 0
            navableComponent = 0
            navableResource=navableResource+1
        }
              

        let newActiveCell = document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
        console.log(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`,newActiveCell)

        if (newActiveCell){

            Array.from(document.querySelectorAll('.navable-active')).forEach((el) => el.classList.remove('navable-active'));
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
            
            // we cannot find the next nav component

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
            navableCol = 1
            navableResource=navableResource-1
        }
              
        // need to find the active component
        navableComponent=0

        let possiblities = [];
        [...Array(40)].forEach((_, i) => {

            let addTo = i * 0.1
            addTo = Math.round(addTo * 10) / 10
            let n = Math.round((navableComponent+(addTo)) * 10) / 10

            let id=`navable-${navableResource}-${navableCol}-${navableRow}-${n}`

            if (document.getElementById(id)){
                console.log('Looking for',id,document.getElementById(id))
                possiblities.push(n)
            }
        });

        if (possiblities.length>0){
            navableComponent=possiblities[0]
        }


        let newActiveCell = document.getElementById(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`)
        // console.log(`navable-${navableResource}-${navableCol}-${navableRow}-${navableComponent}`,newActiveCell)

        if (newActiveCell){
            Array.from(document.querySelectorAll('.navable-active')).forEach((el) => el.classList.remove('navable-active'));
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

      if (structure.propertyURI == "http://id.loc.gov/ontologies/bibframe/instanceOf"){

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
        console.log('this.ontologyLookupTodo',this.ontologyLookupTodo)
        // grab one
        let uri = this.ontologyLookupTodo.pop()
        console.log("uri",uri)
        this.$store.dispatch("fetchOntology", { self: this, uri: uri }).then(() => {          
          this.loadProfileOntologyLookupsRequest()
        })   

        

      }

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


