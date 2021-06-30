<template>
    <div class="grid">






      <header>
                    <!-- <div style="display: ">loaded profile -- {{profilesLoaded}} </div> -->
                    <div>
                      <router-link style="font-size: 1.5em;color: black;text-decoration: none;padding-left: 0.5em;" to="/myrecords">&lt; Back</router-link>

                      <span style="color:red; margin-left:20%" v-if="!isProd()"> THIS IS THE STAGING (TEST) REGION -- DATA IS NOT SAVED TO PRODUCTION</span>

                      <a @click="reportError" href="#" style="float:right;font-size: 1.5em;color: black;text-decoration: none;padding-left: 0.5em;">Report Error</a>
                    </div>




      </header>

          <Keypress key-event="keydown" :key-code="40" @success="moveDown" />
          <Keypress key-event="keydown" :key-code="38" @success="moveUp" />
          <Keypress key-event="keydown" :key-code="34" @success="movePageDown" />          
          <Keypress key-event="keydown" :key-code="33" @success="movePageUp" />

          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 187, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="dupeProperty" />


          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 88, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="togglePreview" />
          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 80, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="publish" />

          <Keypress key-event="keydown" :key-code="27" @success="escapeKey" />




        <aside id="edit-left-menu" class="sidebar-left" style="background-color: #2a2a2a; color: #ffffff" >
        
            <div id="edit-left-menu-fixed" ref="editLeftMenuFixed" style="height: 98vh; overflow-y:scroll; position: fixed; width: 20%;" v-if="profilesLoaded">
                <!-- <div style="color:#bfbfbf; font-size: 1.5em; text-align: center;">{{sartingPoint}}</div> -->
                <div v-for="profileName in activeProfile.rtOrder" :key="profileName">

                    <div v-if="activeProfile.rt[profileName].noData != true">
                        <div class="container-type-icon" style="color: #ffffff">
                            <div>   
                                <svg v-if="profileName.split(':').slice(-1)[0] == 'Work'" width="1.5em" height="1.1em" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <circle fill="#7badad" cx="0.55em" cy="0.6em" r="0.45em"/>
                                </svg>
                                <div v-if="profileName.includes('Instance')" style="height: 1em;width: 1em; display: inline-block;" class="temp-icon-instance"></div>
                                <span>{{profileName.split(':').slice(-1)[0]}}</span>
                            </div>
                            

                        </div>

                        <ul style="padding-left: 0;" :key="'leftmenu' + activeEditCounter">
                            <li v-bind:class="['left-menu-list-item', { 'left-menu-list-item-has-data' :  liHasData(activeProfile.rt[profileName].pt[profileCompoent]) && returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue).length != 0, 'left-menu-list-item-active':(activeComponent==profileCompoent &&activeProfileName==profileName)}]" :id="'menu'+profileName+profileCompoent"  v-for="(profileCompoent,idx) in activeProfile.rt[profileName].ptOrder" :key="profileCompoent">
                              
                                <a v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true" @click="scrollFieldContainerIntoView($event,profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_'))" href="#">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}</a>
                                <a v-else href="#" style="color: rgba(255,255,255,0.75) !important;" @click="restoreDelete($event, profileName, profileCompoent)" class="simptip-position-right" data-tooltip="Click to restore">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}} [Deleted]</a>

                            </li>
                        </ul>
                    </div>


                </div>

            </div>


        </aside>

        <article >
            
            <div v-if="profilesLoaded">

                <div v-for="profileName in activeProfile.rtOrder" :key="profileName">

                    
                    <div v-if="activeProfile.rt[profileName].noData != true" :class="['container-' + profileName.split(':').slice(-1)[0].split('-')[0]]">


                        <div style="display: flex;">
                          <div style="flex: 0">
                            <div v-if="profileName.includes('Instance')" style="height: 1.75em;width: 2em; margin-left: 1.5em;" class="temp-icon-instance"></div>
                            <svg v-if="profileName.split(':').slice(-1)[0] == 'Work'" width="3em" height="2.5em" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <circle fill="#7badad" cx="1.5em" cy="1em" r="0.75em"/>
                            </svg>
                          </div>
                          <div style="flex-basis: auto; font-size: 1.25em; font-weight: bold; text-align: left;">{{profileName.split(':').slice(-1)[0]}}</div>
                          <div style="flex: 1; text-align: right;line-height: 1.25em;">{{activeProfile.rt[profileName].URI}}</div>

                        </div>
                       




                        <div v-for="(profileCompoent,idx) in activeProfile.rt[profileName].ptOrder" :key="profileCompoent" :id="'container-for-'+profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')">
                              <EditMainComponent v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true" class="component" :parentURI="activeProfile.rt[profileName].URI" :activeTemplate="activeProfile.rt[profileName].pt[profileCompoent]" :profileName="profileName" :profileCompoent="profileCompoent" :topLevelComponent="true" :ptGuid="activeProfile.rt[profileName].pt[profileCompoent]['@guid']" :parentStructure="activeProfile.rtOrder" :structure="activeProfile.rt[profileName].pt[profileCompoent]"/>
                        </div>

                        <div v-if="activeProfile.rt[profileName].unusedXml" style="background-color: #fde4b7; overflow-x: hidden;">
                          <h3>There was some XML that could not be loaded into this profile ({{profileName}}):</h3>
                          <details>
                            <summary>View</summary>
                            <code><pre>{{prettifyXml(activeProfile.rt[profileName].unusedXml)}}</pre></code>
                          </details>
                        </div>
                    </div>


                </div>

            </div>


        </article>


        <div v-if="displayPreview===true" style="height: 100vh; background-color: #fffff1; position: fixed;left: 0;width: 100%;z-index: 1000;">
          <div style="display: flex;">
            <div style="flex: 1">
              <h1 style="margin-top: 0;">RDF XML Preview</h1>    

            </div>
            <div style="flex: 1">
              <button style="font-size: 1.5em; float:right; margin: 0.25em;" @click="togglePreview">CLOSE (ESC Key)</button>


            </div>            
          </div>

          <textarea spellcheck="false" v-model="xmlPreview" style="width: 99%;font-size: 1.25em;height: 90vh;">
          </textarea>
        </div>

        <aside id="sidebar-right" class="sidebar-right" style="background-color: white" :key="activeEditCounter">

            <div ref="editRightMenuFixed"  style="height: 100vh; overflow-y:scroll; position: fixed; width: 26%;"  v-if="profilesLoaded">
                <!-- <div style="color:#bfbfbf; font-size: 1.5em; text-align: center;">{{sartingPoint}}</div> -->
                <div v-for="profileName in activeProfile.rtOrder" :key="profileName">

                        <div v-if="activeProfile.rt[profileName].noData != true" class="container-type-icon" style="color: #2c3e50">
                            <div>   
                                
                              <div v-if="profileName.includes('Work')">
                                <svg v-if="profileName.includes('Work')" width="1.5em" height="1.1em" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <circle fill="#7badad" cx="0.55em" cy="0.6em" r="0.45em"/>
                                </svg><span>Work</span>
                              </div>

<!-- 
                              <div v-if="profileName.split(':').slice(-1)[0] == 'Instance'" style="height: 1em;width: 1em; display: inline-block;" class="temp-icon-instance"></div>
 -->



                                <div v-if="profileName.includes('Instance')" style="height: 1em;width: 1em; display: inline-block;" class="temp-icon-instance"></div>
                                <span v-if="profileName.includes('Instance')">{{profileName.split(':').slice(-1)[0]}}</span>

                            </div>
                            

                        </div>


                        <div v-if="activeProfile.rt[profileName].noData != true" style="margin-left: 1%; border-left: 1px solid rgba(44, 62, 80, 0.25); padding-left: 0.2em">
                            
                            <div v-for="profileCompoent in activeProfile.rt[profileName].ptOrder" :key="profileCompoent">



                              <div style="margin-bottom: 1em;" v-bind:class="[ {'opac-field-active':(activeComponent==profileCompoent &&activeProfileName==profileName)}]" v-if="Object.keys(activeProfile.rt[profileName].pt[profileCompoent].userValue).length>0 && returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue).length != 0 && activeProfile.rt[profileName].pt[profileCompoent].deleted != true">
                                <span class="opac-field-title">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}</span>
                                <div class="opac-field-value">
                                  <div v-bind:key="index" v-for="(val, index) in returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue)">{{val}}</div>
                                </div>
                              </div>


                            </div>

                          
                        </div>

<!-- 
                        <ul style="padding-left: 0;">
                            <li v-bind:class="['left-menu-list-item', { 'left-menu-list-item-has-data' :  liHasData(activeProfile.rt[profileName].pt[profileCompoent]), 'left-menu-list-item-active':(activeComponent==profileCompoent &&activeProfileName==profileName)}]" style="padding-left: 2em;" :id="'menu'+profileCompoent"  v-for="profileCompoent in activeProfile.rt[profileName].ptOrder" :key="profileCompoent">
                                {{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}

                            </li>
                        </ul> -->


                </div>
                <div style="margin-bottom: 2em; background-color: whitesmoke; padding: 1.5em">

  

                  <div style="text-align: center; margin-bottom: 1em">
                    <button style="font-size: 1.5em; width: 100%;" @click="togglePreview">PREVIEW XML<br><span style="font-size: 0.75em;">[CTRL+SHIFT+X]</span></button>
                  </div>



                  <div style="text-align: center;">
                    <button style="font-size: 1.5em; width: 100%;" @click="publish">POST<br><span style="font-size: 0.75em;">[CTRL+SHIFT+P]</span></button>
                  </div>

                  <button v-if="!activeRecordSaved" style="font-size: 1.5em; margin-left: 0.5em; display: none" @click="triggerSave">SAVE</button>
                  <button v-if="activeRecordSaved" style="color: lawngreen; font-size: 1.5em; margin-left: 0.5em; display: none" disabled="">SAVED</button>
                  

                </div>
            </div>




        </aside>


        <footer style="display: none;">
            Footer
        </footer>




        <div v-if="showPostModal" style="position: fixed; width: 100vw; height: 100vh; top: 0; left: 0; background-color: rgba(0,0,0,0.6); z-index: 1000">
          
          <div style="border: solid 1px #a6acb7; border-radius:0.5em; margin: auto; width: 50%; background-color: white; margin-top: 10%; min-height: 35%; padding: 1em;">
              <div style="font-weight: bold;">Posting Record...</div>


              <div v-if="showPostModalErrorMsg" style="max-height: 500px; overflow-x:auto;">
                <div style="font-weight: bold; color: red">We were unable to post the record. Please report this error.</div>
                <pre>
                  <code>
                    {{showPostModalErrorMsg}}
                  </code>
                </pre>
              </div>

              <div v-if="resourceLinks.length>0" style="margin: 0.5em 0 0.5em 0;background-color: #90ee9052;padding: 0.5em;border-radius: 0.25em;">
                The record was accepted by the system. To view the record follow these links:
                <div v-for="rl in resourceLinks" v-bind:key="rl.url">
                  <a :href="rl.url+'?blastdacache=' + Date.now()" target="_blank">View {{rl.type}} on {{rl.env}}</a>
                </div>
                
              </div>


              <button style="font-size: 1em;" @click="escapeKey">Close (ESC Key)</button>


          </div>


        </div>


    </div>




</template>




<script>
// @ is an alias to /src
import EditMainComponent from "@/components/EditMainComponent.vue";

import lookupUtil from "@/lib/lookupUtil"
import config from "@/lib/config"

import uiUtils from "@/lib/uiUtils"
import parseProfile from "@/lib/parseProfile"

import labels from "@/lib/labels"
import exportXML from "@/lib/exportXML"


import { mapState } from 'vuex'


export default {
  name: "Edit",
  components: {
    EditMainComponent,
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
      activeEditCounter: 'activeEditCounter',
      activeRecordSaved: 'activeRecordSaved'

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


              this.sideBarGrabDragInit()

              // load the ontology lookups if they arnt
              this.loadProfileOntologyLookupsBuild()



            })

          }else{

            this.sideBarGrabDragInit()

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
              this.sideBarGrabDragInit()
              this.loadProfileOntologyLookupsBuild()

            })



          })

        }else{

          this.$nextTick(()=>{
            this.sideBarGrabDragInit()
            this.loadProfileOntologyLookupsBuild()

          })

          
        }




    }

    this.$nextTick(function () {
        uiUtils.renderBorders()
        window.setTimeout(()=>{document.getElementsByTagName('input')[0].focus()},500)
        
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
    this.$nextTick(function () {
        uiUtils.renderBorders()
    })
  },  

  data: function() {
    return {
      labels: labels,
      ontologyLookupTodo: [],
      displayPreview: false,
      xmlPreview: 'Loading...',
      showPostModal: false,
      showPostModalErrorMsg: false,
      resourceLinks: []
    }
  },

  methods: {

    prettifyXml: uiUtils.prettifyXml,

    
    moveDown: uiUtils.globalMoveDown,
    moveUp: uiUtils.globalMoveUp,
    movePageDown: uiUtils.globalMovePageDown,
    movePageUp: uiUtils.globalMovePageUp,

    dupeProperty: uiUtils.dupeProperty,



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
      let pubResuts = await lookupUtil.publish(xml.xlmString)

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

        this.showPostModalErrorMsg = pubResuts.msg

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
      document.getElementById('container-for-'+id).scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
      window.setTimeout(()=>{
        if (document.querySelector('#container-for-'+id + ' input')){
          document.querySelector('#container-for-'+id + ' input').focus()  
        }
        
      },400)

      event.preventDefault()
      return false


    },

    sideBarGrabDragInit: function(){
       // we need to do some dom stuff here after we know the profiles have been loaded
        const ele = this.$refs.editLeftMenuFixed
        // console.log(ele, 'editLeftMenuFixed')

        ele.style.cursor = 'grab';

        

        let pos = { top: 0, left: 0, x: 0, y: 0 };

        const mouseDownHandler = function(e) {
            ele.style.cursor = 'grabbing';
            ele.style.userSelect = 'none';

            pos = {
                left: ele.scrollLeft,
                top: ele.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = function(e) {
            // How far the mouse has been moved
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;

            // Scroll the element
            ele.scrollTop = pos.top - dy;
            ele.scrollLeft = pos.left - dx;
        };

        const mouseUpHandler = function() {
            ele.style.cursor = 'grab';
            ele.style.removeProperty('user-select');

            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        // Attach the handler
        ele.addEventListener('mousedown', mouseDownHandler);



        // --- right menu


        const ele2 = this.$refs.editRightMenuFixed


        ele2.style.cursor = 'grab';

        

        let pos2 = { top: 0, left: 0, x: 0, y: 0 };

        const mouseDownHandler2 = function(e) {
            ele2.style.cursor = 'grabbing';
            ele2.style.userSelect = 'none';

            pos2 = {
                left: ele.scrollLeft,
                top: ele.scrollTop,
                // Get the current mouse pos2ition
                x: e.clientX,
                y: e.clientY,
            };

            document.addEventListener('mousemove', mouseMoveHandler2);
            document.addEventListener('mouseup', mouseUpHandler2);
        };

        const mouseMoveHandler2 = function(e) {
            // How far the mouse has been moved
            const dx = e.clientX - pos2.x;
            const dy = e.clientY - pos2.y;

            // Scroll the element
            ele2.scrollTop = pos2.top - dy;
            ele2.scrollLeft = pos2.left - dx;
        };

        const mouseUpHandler2 = function() {
            ele2.style.cursor = 'grab';
            ele2.style.removeProperty('user-select');

            document.removeEventListener('mousemove', mouseMoveHandler2);
            document.removeEventListener('mouseup', mouseUpHandler2);
        };

        // Attach the handler
        ele2.addEventListener('mousedown', mouseDownHandler2);        


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

<style>

#edit-left-menu-fixed{
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
#edit-left-menu-fixed::-webkit-scrollbar { 
  display: none;  /* Safari and Chrome */
}



</style>

