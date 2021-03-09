<template>
  <div v-if="nested != true" class="component-container">
    <div class="component-container-title">{{structure.propertyLabel}}</div>
    <div class="component-container-input-container">

      <template  v-if="structure.valueConstraint.valueTemplateRefs.length > 1">
        <div class="component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border" style="flex:4;">          
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

        <EditMainComponent v-for="(pt,idx) in activeTemplate.propertyTemplates" :key="idx" :activeTemplate="activeTemplate" :structure="activeTemplate.propertyTemplates[idx]" :parentStructureObj="structure" :parentStructure="['nothing']" :profileCompoent="profileCompoent" :profileName="profileName" :nested="true"></EditMainComponent>
      </div>
      <div v-else>
        <span>Missing resource template {{structure.valueConstraint.valueTemplateRefs}}</span>
        {{activeTemplate}}
      </div>

    </div>   

  </div>

  <div class="yehh" v-else>


      <template v-if="structure.valueConstraint.valueTemplateRefs.length > 1">
        <div class="component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border" style="flex:4;">          
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

        <EditMainComponent v-for="(pt,idx) in activeTemplate.propertyTemplates" :key="idx" :position="idx" :activeTemplate="Object.assign({nested:true},activeTemplate)" :structure="activeTemplate.propertyTemplates[idx]" :profileCompoent="profileCompoent" :profileName="profileName" :parentStructureObj="structure" :parentStructure="['nothing']"  :nested="true"></EditMainComponent>
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
    profileCompoent: String,
    profileName: String,
    nested: Boolean,
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
    //   //   console.log(s,this.structure.valueConstraint.useValuesFrom[0])
    //   // })
    //   // console.log(this.structure.valueConstraint.useValuesFrom[0])
    //   // if (state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]){
    //   //   console.log('yehhhh')
    //   //   return state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]
    //   // }else{
    //   //   return []
    //   // }
    //   return state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]

      
    // }
  }),
  created: function () {
    

    // if (this.structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/classification'){

    //   let data = this.activeProfile.rt[this.profileName].pt[this.profileCompoent]
    //   console.log(data,data.userValue[this.structure.propertyURI], this.structure.propertyURI, 'here')

    //   if (data.userValue[this.structure.propertyURI]){
    //     this.inputValue = data.userValue[this.structure.propertyURI]
    //   }

    //   console.log(data,"!")
    //   console.log(this.structure.userValue['@type'])

    // }

    // grab the first component from the struecture, but there might be mutluple ones
    let useId = this.structure.valueConstraint.valueTemplateRefs[0]
    let foundBetter = false
    // do we have user data and a possible @type to use
    if (this.structure.userValue['@type']){


      // loop thrugh all the refs and see if there is a URI that matches it better
      this.structure.valueConstraint.valueTemplateRefs.forEach((tmpid)=>{


        if (foundBetter) return false

        if (this.rtLookup[tmpid].resourceURI === this.structure.userValue['@type']){
          useId = tmpid
          foundBetter = true
        }

        // also check here
        if (this.rtLookup[tmpid].resourceURI === this.structure.userValue['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']){
          useId = tmpid
          foundBetter = true
        }




        // if (this.structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/subject'){
          
        //   console.log(this.rtLookup[tmpid].resourceURI, "||",this.structure.userValue['@type'] )
        //   console.log('this.rtLookup[useId] HEREERw')
        //   console.log(this.rtLookup[tmpid])
        //   console.log(useId)


        // }





      })
    } 
    
    // do not render recursivly if the thing we are trying to render recursivly is one the of the things thAT WER ARE RENDERING TO BEGIN WITHHHHH!!!1
    if (this.parentStructure && this.parentStructure.indexOf(useId) ==-1){
      if (this.rtLookup[useId]){
        this.multiTemplateSelect = this.rtLookup[useId].resourceLabel
        this.multiTemplateSelectURI = useId
        this.activeTemplate = this.rtLookup[useId]     
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


    }
    // }else{
    //   console.log(this.parentStructure, 'do not render this one!')
    // else if (!this.parentStructure){
    //   this.multiTemplateSelect = this.rtLookup[useId].resourceLabel
    //   this.multiTemplateSelectURI = useId
    //   this.activeTemplate = this.rtLookup[useId]      
    //   this.buildPropertyTemplatesOrderLookup()
    // }
    
  },
  methods: {

    buildPropertyTemplatesOrderLookup: function(){
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


      if (event.key==='ArrowRight'){
        // get the current pos, and if we are at the end loop back to the beginning
        let currPos = this.structure.valueConstraint.valueTemplateRefs.indexOf(this.multiTemplateSelectURI)
        if (currPos+1 > this.structure.valueConstraint.valueTemplateRefs.length-1){
          currPos=-1
        }
        let nextRefID = this.structure.valueConstraint.valueTemplateRefs[currPos+1]
        this.multiTemplateSelect = this.rtLookup[nextRefID].resourceLabel
        this.multiTemplateSelectURI = nextRefID
        this.activeTemplate = this.rtLookup[nextRefID]
        this.buildPropertyTemplatesOrderLookup()
        this.focused(event)
        uiUtils.renderBorders(true)  

        
      
      }else if (event.key==='ArrowLeft'){
        let currPos = this.structure.valueConstraint.valueTemplateRefs.indexOf(this.multiTemplateSelectURI)
        if (currPos == 0){
          currPos=this.structure.valueConstraint.valueTemplateRefs.length
        }

        let nextRefID = this.structure.valueConstraint.valueTemplateRefs[currPos-1]
        this.multiTemplateSelect = this.rtLookup[nextRefID].resourceLabel
        this.multiTemplateSelectURI = nextRefID
        this.activeTemplate = this.rtLookup[nextRefID]
        this.buildPropertyTemplatesOrderLookup()
        this.focused(event)
        uiUtils.renderBorders(true)
      }else if (event.key==='Tab'){
        return true


      }else{
        event.preventDefault();
        return false        
      }


    },
    focused: function(event){
      // console.log('regsrerd',this.activeInput)
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
