<template>
    <div class="">



          <Keypress key-event="keydown" :key-code="40" @success="moveDown" />
          <Keypress key-event="keydown" :key-code="38" @success="moveUp" />
          <Keypress key-event="keydown" :key-code="34" @success="movePageDown" />          
          <Keypress key-event="keydown" :key-code="33" @success="movePageUp" />

          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 187, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="dupeProperty" />


          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 88, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="togglePreview" />
          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 80, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="publish" />

          <Keypress key-event="keydown" :key-code="27" @success="escapeKey" />





        <article >
            
            <div v-if="profilesLoaded">

                <div v-for="profileName in activeProfileMini.rtOrder" :key="profileName">

                    
                    <div v-if="activeProfileMini.rt[profileName].noData != true" :class="['container-' + profileName.split(':').slice(-1)[0].split('-')[0]]">


                        <div style="display: flex;">
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
                          <div style="flex: 1; text-align: right;line-height: 1.25em;">{{activeProfileMini.rt[profileName].URI}}</div>

                        </div>
                       




                        <div v-for="(profileCompoent,idx) in activeProfileMini.rt[profileName].ptOrder" :key="profileCompoent" :id="'container-for-mini'+profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')">
                              <EditMainComponent v-if="activeProfileMini.rt[profileName].pt[profileCompoent].deleted != true" class="component" :parentURI="activeProfileMini.rt[profileName].URI" :activeTemplate="activeProfileMini.rt[profileName].pt[profileCompoent]" :profileName="profileName" :profileCompoent="profileCompoent" :topLevelComponent="true" :ptGuid="activeProfileMini.rt[profileName].pt[profileCompoent]['@guid']" :parentStructure="activeProfileMini.rtOrder" :structure="activeProfileMini.rt[profileName].pt[profileCompoent]"/>
                        </div>

                        <div v-if="activeProfileMini.rt[profileName].unusedXml" style="background-color: #fde4b7; overflow-x: hidden;">
                          <h3>There was some XML that could not be loaded into this profile ({{profileName}}):</h3>
                          <details>
                            <summary>View</summary>
                            <code><pre>{{prettifyXml(activeProfileMini.rt[profileName].unusedXml)}}</pre></code>
                          </details>
                        </div>
                    </div>


                </div>

            </div>


        </article>


       

       


        <footer style="display: none;">
            Footer
        </footer>




    </div>




</template>




<script>
// @ is an alias to /src
// import EditMainComponent from "@/components/EditMainComponent.vue";

import lookupUtil from "@/lib/lookupUtil"
import config from "@/lib/config"

import uiUtils from "@/lib/uiUtils"
import parseProfile from "@/lib/parseProfile"

import labels from "@/lib/labels"
import exportXML from "@/lib/exportXML"


import { mapState } from 'vuex'


export default {
  name: "EditMini",
  props:{
    miniProfile: String
  },
  components: {
    // EditMainComponent,
    Keypress: () => import('vue-keypress'),
    
  },
    computed: mapState({
      profilesLoaded: 'profilesLoaded',
      profiles: 'profiles',
      sartingPoint: 'sartingPoint',
      activeInput: 'activeInput',
      activeProfileMini: 'activeProfileMini',
      activeComponent: 'activeComponent',
      activeProfileName: 'activeProfileName',
      activeEditCounter: 'activeEditCounter',
      activeRecordSaved: 'activeRecordSaved',
      catInitials: 'catInitials',

      // to access local state with `this`, a normal function must be used
      // countPlusLocalState (state) {
      //   return state.count + this.localCount
      // }
    }),


  created: async function () {

    // load them profiles if they aint  
    if (!this.profilesLoaded){
        this.$store.dispatch("fetchProfiles", { self: this }).then(async () => {

            this.$store.dispatch("setWorkingOnMiniProfile", { self: this, value: true }).then(() => {



                if (this.profiles[this.miniProfile]){
                    let profile = parseProfile.loadNewTemplate(this.miniProfile, this.catInitials)
                    console.log(profile)
                    this.$store.dispatch("setActiveProfile", { self: this, profile: profile }).then(() => {
                       
                    })

                }else{
                    alert('Cannot find profile:',this.miniProfile)
                }


            })


      })       
    }else{


            this.$store.dispatch("setWorkingOnMiniProfile", { self: this, value: true }).then(() => {



                if (this.profiles[this.miniProfile]){
                    let profile = parseProfile.loadNewTemplate(this.miniProfile, this.catInitials)
                    console.log(profile)
                    this.$store.dispatch("setActiveProfile", { self: this, profile: profile }).then(() => {
                       
                    })

                }else{
                    alert('Cannot find profile:',this.miniProfile)
                }


            })


    }

    this.$nextTick(function () {
        uiUtils.renderBorders()
        window.setTimeout(()=>{document.getElementsByTagName('input')[0].focus()},500)
  

        

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
      resourceLinks: [],
      headerState: 'inital',
      activeMiniMap: {URI:null},
      miniMapActionValue: 'Actions',
      lastMouseY: 10,
    }
  },

  methods: {

    prettifyXml: uiUtils.prettifyXml,

    
    moveDown: uiUtils.globalMoveDown,
    moveUp: uiUtils.globalMoveUp,
    movePageDown: uiUtils.globalMovePageDown,
    movePageUp: uiUtils.globalMovePageUp,

    dupeProperty: uiUtils.dupeProperty,


    cleanUpErrorResponse: function(msg){

        msg = JSON.stringify(msg,null,2)

        msg = msg.replace(/\\n|\\t/g, '').replace(/\\"/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>')

        return msg

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

