<template>



  

  <div v-if="dynamic == 'singleTemplate'">

    <EditMainComponent  v-for="(pt,idx) in activeTemplate.propertyTemplates" :ptGuid="ptGuid" :isMini="isMini" :key="idx" :position="idx" :activeTemplate="Object.assign({nested:true},activeTemplate)" :structure="activeTemplate.propertyTemplates[idx]" :profileCompoent="profileCompoent" :profileName="profileName" :grandParentStructureObj="parentStructureObj" :parentStructureObj="structure" :parentStructure="['nothing']"  :nested="true"></EditMainComponent>


  </div>


  <div v-else-if="nested == false" :class="'component-container' + ' component-container-' + settingsDisplayMode">

    <div :class="'component-container-title' + ' component-container-title-' + settingsDisplayMode ">{{structure.propertyLabel}}</div>
    <div :class="'component-container-input-container' + ' component-container-input-container-' + settingsDisplayMode">

      <template  v-if="structure.valueConstraint.valueTemplateRefs.length > 1">
        <div class="component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border" style="flex:4; max-height: 3em;">          
          <div style="display: flex">
            <div style="flex:1">
              <form autocomplete="off">
                <input bfeType="EditTemplateRefComponent-nested"  :id="assignedId"  v-on:focus="focused" class="selectable-input" autocomplete="off" @keydown="multiTemplateSelectKeydown($event)" type="text" v-bind:value="multiTemplateSelect" style="width: 95%; border:none; height: 90%; font-size: 1.5em; padding: 0.1em; background: none">
              </form>              
            </div>
            <button tabindex="-1" class="temp-icon-switch fake-real-button simptip-position-top" :data-tooltip="labels.refComponentSwitchButton" @click="multiTemplateSelectKeydown($event, true)">
            </button>
          </div>
        </div>
      </template>
      <div v-if="activeTemplate != null && activeTemplate.propertyTemplates.length > 0">
        <!-- <EditMainComponent name="pt." v-for="pt in this.activeTemplate.propertyTemplates" v-bind:key="pt" v-bind:structure="pt"></EditMainComponent> -->
        <!-- <EditMainComponent name="yeet"></EditMainComponent> -->

        <EditMainComponent  v-for="(pt,idx) in activeTemplate.propertyTemplates" :ptGuid="ptGuid" :key="idx" :isMini="isMini" :activeTemplate="activeTemplate" :structure="activeTemplate.propertyTemplates[idx]" :parentStructureObj="structure" :parentStructure="['nothing']" :profileCompoent="profileCompoent" :profileName="profileName" :nested="true"></EditMainComponent>
      </div>
      <div v-else>
        <span>Missing resource template {{structure.valueConstraint.valueTemplateRefs}}</span>
        {{activeTemplate}}
      </div>

    </div>   

  </div>

  <div v-else-if="nested == true">
      <template v-if="structure.valueConstraint.valueTemplateRefs.length > 1">
        <div class="component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border" style="flex:4;  max-height: 3em">          
          <div style="display: flex">
            <div style="flex:1">
              <form autocomplete="off">
                <input bfeType="EditTemplateRefComponent-unnested" :id="assignedId"  v-on:focus="focused" class="selectable-input" autocomplete="off" @keydown="multiTemplateSelectKeydown($event)" type="text" v-bind:value="multiTemplateSelect" style="width: 95%; border:none; height: 90%; font-size: 1.5em; padding: 0.1em; background: none">
              </form>              
            </div>
            <button tabindex="-1" class="temp-icon-switch fake-real-button simptip-position-top" :data-tooltip="labels.refComponentSwitchButton"  @click="multiTemplateSelectKeydown($event, true)">
            </button>
          </div>
        </div>
      </template>
      <template v-if="activeTemplate != null && activeTemplate.propertyTemplates.length > 0">
        <!-- <EditMainComponent name="pt." v-for="pt in this.activeTemplate.propertyTemplates" v-bind:key="pt" v-bind:structure="pt"></EditMainComponent> -->
        <!-- <EditMainComponent name="yeet"></EditMainComponent> -->


        <EditMainComponent  v-for="(pt,idx) in activeTemplate.propertyTemplates" :ptGuid="ptGuid"  :key="idx" :isMini="isMini" :position="idx" :activeTemplate="Object.assign({nested:true},activeTemplate)" :structure="activeTemplate.propertyTemplates[idx]" :profileCompoent="profileCompoent" :profileName="profileName" :grandParentStructureObj="parentStructureObj" :parentStructureObj="structure" :parentStructure="['nothing']"  :nested="true"></EditMainComponent>
      </template>

  </div>







</template>

<script>



// import EditMainComponent from "@/components/EditMainComponent.vue";


import { mapState } from 'vuex'
import uiUtils from "@/lib/uiUtils"
import labels from "@/lib/labels"




export default {
  name: "EditTemplateRefComponent",
  components: {
    EditMainComponent : () => import('@/components/EditMainComponent.vue')
  },   
  props: {
    structure: Object,
    parentStructure: Array,
    parentStructureObj: Object,
    profileCompoent: String,
    parentURI: String,
    profileName: String,
    nested: Boolean,
    isMini: Boolean,
    dynamic: String,
    ptGuid: String
  },  
  data: function() {
    return {
      multiTemplateSelect: "",
      multiTemplateSelectURI: "",
      multiTemplateSelectOptions: [],
      activeTemplate: null,
      propertyTemplatesOrderLookup: {},
      propertyTemplatesOrderTypeLookup: {},
      labels: labels

    }
  },
  computed: mapState({
    rtLookup: 'rtLookup',
    activeInput: 'activeInput',
    activeProfile: 'activeProfile',
    settingsDisplayMode: 'settingsDisplayMode',


    assignedId (){
      return uiUtils.assignID(this.structure,this.parentStructure)
    },  


    // to access local state with `this`, a normal function must be used
    // lookupVocab (state) {
    //   // let uri = this.structure.valueConstraint.useValuesFrom[0]

    //   // let returnVal = []
    //   // Object.keys(state.lookupLibrary).forEach((s)=>{
    
    //   // })
    
    //   // if (state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]){
    
    //   //   return state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]
    //   // }else{
    //   //   return []
    //   // }
    //   return state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]

      
    // }
  }),
  created: function () {
    
    // grab the first component from the struecture, but there might be mutluple ones
    let useId = this.structure.valueConstraint.valueTemplateRefs[0]
    let foundBetter = false


    
    // do we have user data and a possible @type to use
    if (this.structure.userValue['@type'] || (this.parentStructureObj && this.parentStructureObj.userValue['@type'])){


      // loop thrugh all the refs and see if there is a URI that matches it better
      this.structure.valueConstraint.valueTemplateRefs.forEach((tmpid)=>{


        if (foundBetter) return false

        if (this.rtLookup[tmpid].resourceURI === this.structure.userValue['@type']){
          useId = tmpid
          foundBetter = true
        }

        for (let key in this.structure.userValue){

          if (Array.isArray(this.structure.userValue[key])){
            for (let val of this.structure.userValue[key]){
              if (val['@type'] && this.rtLookup[tmpid].resourceURI === val['@type']){
                useId = tmpid
                foundBetter = true

              }

            }
          }

        }

        // also look into the parent that might have the data
        if (this.parentStructureObj){
          for (let key in this.parentStructureObj.userValue){
            if (Array.isArray(this.parentStructureObj.userValue[key])){
              for (let val of this.parentStructureObj.userValue[key]){
                if (val['@type'] && this.rtLookup[tmpid].resourceURI === val['@type']){
                  useId = tmpid
                  foundBetter = true
                }
              }
            }

          }
        }




      })

    } 


    

    // do not render recursivly if the thing we are trying to render recursivly is one the of the things thAT WER ARE RENDERING TO BEGIN WITHHHHH!!!1
    if (this.parentStructure && this.parentStructure.indexOf(useId) ==-1){
      if (this.rtLookup[useId]){

        let use = JSON.parse(JSON.stringify(this.rtLookup[useId]))

        this.multiTemplateSelect = use.resourceLabel
        
        this.multiTemplateSelectURI = useId
        this.activeTemplate = use     
        this.buildPropertyTemplatesOrderLookup()        
      }
    }else{




      // little hack here for now
      if (useId == 'lc:RT:bf2:Monograph:Dissertation'){
        this.multiTemplateSelect = this.rtLookup[useId].resourceLabel
        this.multiTemplateSelectURI = useId
        this.activeTemplate = this.rtLookup[useId]     
        this.buildPropertyTemplatesOrderLookup()          
      }

      if (useId == 'lc:RT:bf2:Hub:Contribution'){
        this.multiTemplateSelect = this.rtLookup[useId].resourceLabel
        this.multiTemplateSelectURI = useId
        this.activeTemplate = this.rtLookup[useId]     
        this.buildPropertyTemplatesOrderLookup()          
      }



    }
    // }else{
    
    // else if (!this.parentStructure){
    //   this.multiTemplateSelect = this.rtLookup[useId].resourceLabel
    //   this.multiTemplateSelectURI = useId
    //   this.activeTemplate = this.rtLookup[useId]      
    //   this.buildPropertyTemplatesOrderLookup()
    // }
    
  },
  methods: {

    buildPropertyTemplatesOrderLookup: function(){
      

      this.propertyTemplatesOrderLookup = {}
      this.activeTemplate.propertyTemplates.forEach((pt, i)=>{
        this.propertyTemplatesOrderLookup[pt.propertyURI+pt.propertyLabel] = i
      })

      // fill in the order type, start end or middle, solo

      if (this.activeTemplate.propertyTemplates.length==1){
        let useId = this.activeTemplate.propertyTemplates[0].propertyURI + this.activeTemplate.propertyTemplates[0].propertyLabel
        this.propertyTemplatesOrderTypeLookup[useId] = 'solo'
      }else if (this.activeTemplate.propertyTemplates.length==2){
        let useId = this.activeTemplate.propertyTemplates[0].propertyURI + this.activeTemplate.propertyTemplates[0].propertyLabel
        this.propertyTemplatesOrderTypeLookup[useId] = 'start'
        useId = this.activeTemplate.propertyTemplates[1].propertyURI + this.activeTemplate.propertyTemplates[1].propertyLabel
        this.propertyTemplatesOrderTypeLookup[useId] = 'end'
      }else if (this.activeTemplate.propertyTemplates.length>2){
        this.activeTemplate.propertyTemplates.forEach((pt, i)=>{
          if (i == 0){
            this.propertyTemplatesOrderTypeLookup[pt.propertyURI+pt.propertyLabel] = 'start'
          } else if (i == this.activeTemplate.propertyTemplates.length-1){
            this.propertyTemplatesOrderTypeLookup[pt.propertyURI+pt.propertyLabel] = 'end'
          } else {
            this.propertyTemplatesOrderTypeLookup[pt.propertyURI+pt.propertyLabel] = 'middle'
          }
        })

      }



    },

    multiTemplateSelectKeydown: function(event, buttonPush){
      

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


      if (event.key==='ArrowRight' || event.key==='ArrowLeft'){
        // get the current pos, and if we are at the end loop back to the beginning
        let nextRefID
        let currentRefID

        if (event.key==='ArrowRight'){
          let currPos = this.structure.valueConstraint.valueTemplateRefs.indexOf(this.multiTemplateSelectURI)
          currentRefID = this.structure.valueConstraint.valueTemplateRefs[currPos]          
          if (currPos+1 > this.structure.valueConstraint.valueTemplateRefs.length-1){
            currPos=-1
          }
          nextRefID = this.structure.valueConstraint.valueTemplateRefs[currPos+1]


        }else{

          let currPos = this.structure.valueConstraint.valueTemplateRefs.indexOf(this.multiTemplateSelectURI)
          currentRefID = this.structure.valueConstraint.valueTemplateRefs[currPos]
          

          if (currPos == 0){
            currPos=this.structure.valueConstraint.valueTemplateRefs.length
          }

          nextRefID = this.structure.valueConstraint.valueTemplateRefs[currPos-1]

        }


        // get the profile ready before we change the UI
        this.$store.dispatch("refTemplateChange", { self: this, profileName:this.profileName, profileComponet: this.profileCompoent, structure: this.structure, template:this.activeTemplate, parentId: this.structure.parentId, nextRef:this.rtLookup[nextRefID], thisRef: this.rtLookup[currentRefID] }).then(() => {
         
          let nextRef = JSON.parse(JSON.stringify(this.rtLookup[nextRefID]))
          console.log(nextRef)
          this.multiTemplateSelect = nextRef.resourceLabel
          this.multiTemplateSelectURI = nextRefID
          this.activeTemplate = nextRef
          
          this.buildPropertyTemplatesOrderLookup()
          this.focused(event)
          uiUtils.renderBorders(true)  




        }) 






      }else if (event.key==='Tab'){
        return true


      }else{
        event.preventDefault();
        return false        
      }


    },
    focused: function(event){

      // just make sure it is turned on so they can nav out of the field
     

      this.$nextTick(()=>{
         this.$store.dispatch("enableMacroNav")
      })


      
      this.$store.dispatch("setActiveInput", { self: this, id: event.target.id, profileCompoent: this.profileCompoent, profileName: this.profileName }).then(()=>{

        // now focus the side bars
        this.$nextTick(()=>{
          uiUtils.focusSidebars()
        })


      })
    } 



  }


};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

    <!-- <pre>{{JSON.stringify(structure,null,2)}}</pre> -->

<style scoped>

.component-container-fake-input:focus-within {
  border: solid 1px #a6acb7;
  background-color: #dfe5f1;
}
input{
  border: none;
  color: transparent;
  text-shadow: 0 0 0 gray;
  text-align: left;  
}
.fake-real-button{
  height: 4em;
  min-width: 4em;
  background-color: transparent;
  border: none;
  outline: none;
  margin: 0.15em;  
}

input{
  outline:none;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
form{
  height: 100%;
}
</style>
