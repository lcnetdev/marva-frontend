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

          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 187, modifiers: ['ctrlKey'],preventDefault: true}]" @success="dupeProperty" />


        




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
                            <li v-bind:class="['left-menu-list-item', { 'left-menu-list-item-has-data' :  liHasData(activeProfile.rt[profileName].pt[profileCompoent]) && returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue) != '', 'left-menu-list-item-active':(activeComponent==profileCompoent &&activeProfileName==profileName)}]" :id="'menu'+profileCompoent"  v-for="profileCompoent in activeProfile.rt[profileName].ptOrder" :key="profileCompoent">
                                <a v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true" @click="scrollFieldContainerIntoView($event,profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_'))" href="#">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}</a>
                                <a v-else href="#" style="color: rgba(255,255,255,0.75) !important;" @click="restoreDelete($event, profileName, profileCompoent)" class="simptip-position-right" data-tooltip="Click to restore">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}} [Deleted]</a>

                            </li>
                        </ul>
                    </div>


                </div>

            </div>


        </aside>

        <article v-if="displayPreview===false">
            
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
                       




                        <div v-for="profileCompoent in activeProfile.rt[profileName].ptOrder" :key="profileCompoent" :id="'container-for-'+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')">
                              <EditMainComponent v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true" class="component" :parentURI="activeProfile.rt[profileName].URI" :activeTemplate="activeProfile.rt[profileName].pt[profileCompoent]" :profileName="profileName" :profileCompoent="profileCompoent" :topLevelComponent="true" :parentStructure="activeProfile.rtOrder" :structure="activeProfile.rt[profileName].pt[profileCompoent]"/>
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

        <article v-else>
          <div style="height: 100vh; background-color: #fffff1">
            <h1 style="margin-top: 0;">RDF XML Preview</h1>
            <button style="font-size: 1.5em" @click="togglePreview">CLOSE</button>
            <textarea spellcheck="false" v-model="xmlPreview" style="width: 99%;font-size: 2em;height: 83vh;">

            </textarea>
            <button style="font-size: 1.5em" @click="togglePreview">CLOSE</button>


          </div>
        </article>

        <aside id="sidebar-right" class="sidebar-right" style="background-color: white" :key="activeEditCounter">

            <div ref="editRightMenuFixed"  style="height: 100vh; overflow-y:scroll; position: fixed; width: 21%;"  v-if="profilesLoaded">
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



                              <div style="margin-bottom: 1em;" v-bind:class="[ {'opac-field-active':(activeComponent==profileCompoent &&activeProfileName==profileName)}]" v-if="Object.keys(activeProfile.rt[profileName].pt[profileCompoent].userValue).length>0 && returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue) != '' && activeProfile.rt[profileName].pt[profileCompoent].deleted != true">
                                <span class="opac-field-title">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}</span>
                                <div class="opac-field-value">{{returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue)}}</div>

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

                  <div v-for="rl in resourceLinks" v-bind:key="rl.url">
                    <a :href="rl.url" target="_blank">View {{rl.type}} on {{rl.env}}</a>

                  </div>

                  <div style="text-align: center; margin-bottom: 1em">
                    <button style="font-size: 1.5em; width: 100%;" @click="togglePreview">PREVIEW XML</button>
                  </div>



                  <div style="text-align: center;">
                    <button style="font-size: 1.5em; width: 100%;" @click="publish">POST</button>
                  </div>

                  <button v-if="!activeRecordSaved" style="font-size: 1.5em; margin-left: 0.5em; display: none" @click="triggerSave">SAVE</button>
                  <button v-if="activeRecordSaved" style="color: lawngreen; font-size: 1.5em; margin-left: 0.5em; display: none" disabled="">SAVED</button>
                  

                </div>
            </div>




        </aside>


        <footer style="display: none;">
            Footer
        </footer>



    </div>




</template>




<script>
// @ is an alias to /src
import EditMainComponent from "@/components/EditMainComponent.vue";

import lookupUtil from "@/lib/lookupUtil"
import config from "@/lib/config"

import uiUtils from "@/lib/uiUtils"
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


  created: function () {

    // load them profiles if they aint  
    if (!this.profilesLoaded){
        this.$store.dispatch("fetchProfiles", { self: this }).then(() => {
          this.sideBarGrabDragInit()

          // load the ontology lookups if they arnt
          this.loadProfileOntologyLookupsBuild()

      })       
    }else{
      this.$nextTick(()=>{
        this.sideBarGrabDragInit()
        this.loadProfileOntologyLookupsBuild()

      })

    }

    this.$nextTick(function () {
        uiUtils.renderBorders()
        window.setTimeout(()=>{document.getElementsByTagName('input')[0].focus()},500)
        
    })
  },

  mounted: function(){



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

    publish: async function(){

      let xml = await exportXML.toBFXML(this.activeProfile)
      let pubResuts = await lookupUtil.publish(xml.xlmString)

      if (pubResuts){
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


      }

    },


    isProd: function(){

      if (config.returnUrls().env == 'dev') return false
      if (config.returnUrls().env == 'staging') return false
      if (config.returnUrls().env == 'prod') return true  
    },
          


    reportError: async function(event){

        let desc = prompt("Please enter descripion of the problem");

        if (!desc){
          return false
        }

        let contact = prompt("Contact Info (Optional) ");




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

    triggerXMLExport: function(){

      console.log(exportXML.toBFXML(this.activeProfile))


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
      let r = ''
      Object.keys(userValue).forEach((k)=>{


        if (typeof userValue[k] == 'string' && !userValue[k].includes('http') && !r.includes(userValue[k])){
          r = r + userValue[k]+ ' '
        }else if (userValue[k] && userValue[k].literal && !userValue[k].literal.includes('http') && !r.includes(userValue[k].literal)){
            r = r + userValue[k].literal + ' '
          

        }else if (k == 'http://www.w3.org/2002/07/owl#sameAs'){

          if (userValue[k]['http://www.w3.org/2000/01/rdf-schema#label']){
            r = r + userValue[k]['http://www.w3.org/2000/01/rdf-schema#label']
          }

        }else if (typeof userValue[k] == 'object'){

          for (let subK in userValue[k]){
            if (typeof userValue[k][subK] == 'string' && !userValue[k][subK].includes('http') && !r.includes(userValue[k][subK])){
              r = r + userValue[k][subK] + ' '
            }


          }
        }


        if (Array.isArray(userValue[k])){
          for (let userValueAryItem of userValue[k]){

            Object.keys(userValueAryItem).forEach((kk)=>{
              if (typeof userValueAryItem[kk] == 'string' && !userValueAryItem[kk].includes('http') && !r.includes(userValueAryItem[kk])){
                r = r + userValueAryItem[kk] + ' '   
              }      
            })

          }
        }


      })
      r=r.trim()
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

