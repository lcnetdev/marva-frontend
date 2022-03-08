<template>



  

  <div v-if="dynamic == 'singleTemplate'">

    <CompactEditMainComponent  v-for="(pt,idx) in activeTemplate.propertyTemplates" :ptGuid="ptGuid" :isMini="isMini" :key="idx" :position="idx" :activeTemplate="Object.assign({nested:true},activeTemplate)" :structure="activeTemplate.propertyTemplates[idx]" :profileCompoent="profileCompoent" :profileName="profileName" :grandParentStructureObj="parentStructureObj" :parentStructureObj="structure" :parentStructure="['nothing']"  :nested="true"></CompactEditMainComponent>


  </div>


  <div v-else class="" style="overflow: hidden;" >
    <div class="">

      <template  v-if="structure.valueConstraint.valueTemplateRefs.length > 1">
          <div style="display: flex;" :class="['resource-grid-field-list-navable', `resource-${resourceIdx}`]" :id="'navable-' + resourceIdx + '-1-' + rowIdx + '-' + (parseInt(componentIdx))">
            <div style="flex:1">
              <form autocomplete="off">
                <input bfeType="CompactEditTemplateRefComponent-nested"  :id="assignedId"  v-on:focus="focused" class="selectable-input" autocomplete="off" @keydown="multiTemplateSelectKeydown($event)" type="text" v-bind:value="multiTemplateSelect" style="width: 95%; background-color: transparent; border:none; font-size: 1em;">
              </form>              
            </div>
            <button tabindex="-1" class="temp-icon-switch simptip-position-top" style="height: 1em; width: 1em;" :data-tooltip="labels.refComponentSwitchButton" @click="multiTemplateSelectKeydown($event, true)">
            </button>
          </div>

      </template>
      <div v-if="activeTemplate != null && activeTemplate.propertyTemplates.length > 0">
        
        

        <CompactEditMainComponent  v-for="(pt,idx) in activeTemplate.propertyTemplates" :resourceIdx="resourceIdx" :rowIdx="rowIdx" :componentIdx="returnComponentIdx(pt,componentIdx,idx)" :ptGuid="ptGuid" :key="idx" :isMini="isMini" :activeTemplate="activeTemplate" :structure="activeTemplate.propertyTemplates[idx]" :parentStructureObj="structure" :parentStructure="['nothing']" :profileCompoent="profileCompoent" :profileName="profileName" :nested="true" :navLevel="navLevel+1" :setNavAfterClick="setNavAfterClick"></CompactEditMainComponent>
        

      </div>
      <div v-else>
        <span>Missing resource template {{structure.valueConstraint.valueTemplateRefs}}</span>
        {{activeTemplate}}
      </div>

    </div>   

  </div>




</template>

<script>



// import CompactEditMainComponent from "@/components/CompactEditMainComponent.vue";


import { mapState } from 'vuex'
import uiUtils from "@/lib/uiUtils"
import labels from "@/lib/labels"




export default {
  name: "CompactEditTemplateRefComponent",
  components: {
    CompactEditMainComponent : () => import('@/components/CompactEditMainComponent.vue')
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
    ptGuid: String,
    rowIdx: Number,
    resourceIdx: Number,    
    componentIdx:Number,
    navLevel: Number,
    setNavAfterClick: { type: Function },
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


    returnComponentIdx: function(pt,componentIdx,idx){

      // console.log(">>>>>>",pt,componentIdx,idx)
      // if (parseInt(idx) == 0){
      //   idx = parseInt(idx) + 1
      // }else{
      //   idx = parseInt(idx) + 2
      // }
      return parseInt(componentIdx) + parseInt(idx) + 0.1;

    },

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
      
      this.$store.dispatch("setActiveInput", { self: this, id: event.target.id, profileCompoent: this.profileCompoent, profileName: this.profileName }).then(()=>{

        // now focus the side bars
        uiUtils.focusSidebars()


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

.temp-icon-switch {
    background-image: url(data:image/png;base64,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);
    background-position-x: right;
    background-repeat: no-repeat;
    background-size: 1em;
    background-position-y: top;
    background-color: whitesmoke;
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
