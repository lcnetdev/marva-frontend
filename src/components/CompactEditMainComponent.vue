<template>

  <div class="">

    <div :id="profileName+'|'+profileCompoent" style="position: relative;">
      


          <template v-if="hasDynamicTemplate()" >

              <!--  -->
            
             <!-- <CompactEditTemplateRefComponent v-on="$listeners"  :ptGuid="ptGuid" :parentURI="parentURI" :key="useKey" :isMini="isMini" :structure="structure"  :parentStructureObj="parentStructureObj" :parentStructure="parentStructure" :nested="nested" :profileName="profileName" :profileCompoent="profileCompoent" :activeTemplate="activeTemplate"  ></CompactEditTemplateRefComponent> -->
             <div :class="['resource-grid-field-list-navable', `resource-${resourceIdx}`]" :id="`navable-${resourceIdx}-1-${rowIdx}-0`">{{rowIdx}} has dynamic</div>


          </template>

          <template v-else>

           <!-- <EditMetaComponent v-if="returnLookupType(structure) == 'meta'" :isMini="isMini" :ptGuid="ptGuid" :parentURI="parentURI" :nested="nested" :structure="structure" :profileName="profileName" :profileCompoent="profileCompoent" :parentStructureObj="parentStructureObj" :parentStructure="parentStructure" :activeTemplate="activeTemplate" ></EditMetaComponent> -->
           
           <!-- <EditAdminComponent v-else-if="returnLookupType(structure) == 'admin'" :ptGuid="ptGuid" :parentURI="parentURI" :nested="nested" :structure="structure" :profileName="profileName" :profileCompoent="profileCompoent" :parentStructureObj="parentStructureObj" :parentStructure="parentStructure" :activeTemplate="activeTemplate" ></EditAdminComponent> -->
           
           <CompactEditLiteralComponent v-if="structure.type == 'literal' || structure.type == 'literal-lang'" :key="useKey" :isMini="isMini" :ptGuid="ptGuid" :parentURI="parentURI" :resourceIdx="resourceIdx" :rowIdx="rowIdx" :componentIdx="componentIdx"  :nested="nested" :structure="structure" :profileName="profileName" :profileCompoent="profileCompoent" :parentStructureObj="parentStructureObj" :parentStructure="parentStructure" :activeTemplate="activeTemplate" :setNavAfterClick="setNavAfterClick" ></CompactEditLiteralComponent>

           <CompactEditSimpleLookupComponent v-else-if="returnLookupType(structure) == 'simple'" :ptGuid="ptGuid" :key="useKey" :isMini="isMini" :parentURI="parentURI" :structure="structure"  :parentStructureObj="parentStructureObj" :componentIdx="componentIdx" :resourceIdx="resourceIdx" :rowIdx="rowIdx" :parentStructure="parentStructure" :nested="nested"  :profileName="profileName" :profileCompoent="profileCompoent" :activeTemplate="activeTemplate" :setNavAfterClick="setNavAfterClick"></CompactEditSimpleLookupComponent>
           <CompactEditComplexLookupComponent v-on="$listeners" v-else-if="returnLookupType(structure) == 'complex'" :key="useKey" :isMini="isMini" @updated="forceUpdate" :ptGuid="ptGuid" :parentURI="parentURI" :structure="structure" :componentIdx="componentIdx" :resourceIdx="resourceIdx" :rowIdx="rowIdx"  :parentStructureObj="parentStructureObj" :parentStructure="parentStructure" :nested="nested" :profileName="profileName" :profileCompoent="profileCompoent" :activeTemplate="activeTemplate"  :setNavAfterClick="setNavAfterClick" ></CompactEditComplexLookupComponent>          
           <CompactEditTemplateRefComponent v-on="$listeners" v-else-if="structure.valueConstraint.valueTemplateRefs.length > 0" :isMini="isMini" :key="useKey" :ptGuid="ptGuid" :parentURI="parentURI" :structure="structure" :componentIdx="componentIdx"  :resourceIdx="resourceIdx" :rowIdx="rowIdx" :parentStructureObj="parentStructureObj" :parentStructure="parentStructure" :nested="nested" :profileName="profileName" :profileCompoent="profileCompoent" :activeTemplate="activeTemplate" :navLevel="0" :setNavAfterClick="setNavAfterClick" ></CompactEditTemplateRefComponent>
        
           <div  v-else :class="['resource-grid-field-list-navable', `resource-${resourceIdx}`]" :id="`navable-${resourceIdx}-1-${rowIdx}-0`">{{rowIdx}} {{structure.valueConstraint.valueTemplateRefs.length}}</div>

          </template>


    </div>



  </div>



</template>

<script>

import CompactEditLiteralComponent from "@/components/CompactEditLiteralComponent.vue";
import CompactEditSimpleLookupComponent from "@/components/CompactEditSimpleLookupComponent.vue";

import CompactEditTemplateRefComponent from "@/components/CompactEditTemplateRefComponent.vue";
import CompactEditComplexLookupComponent from "@/components/CompactEditComplexLookupComponent.vue";
// import EditMetaComponent from "@/components/EditMetaComponent.vue";
// import EditAdminComponent from "@/components/EditAdminComponent.vue";






import labels from "@/lib/labels"
import config from "@/lib/config"
import uiUtils from "@/lib/uiUtils"

// 
// import VueJsonPretty from 'vue-json-pretty'

const short = require('short-uuid');


export default {
  name: "CompactEditMainComponent",
  components: {
    CompactEditLiteralComponent,
    CompactEditSimpleLookupComponent,
    CompactEditTemplateRefComponent,
    CompactEditComplexLookupComponent,
    // EditMetaComponent,
    // EditAdminComponent,
    // VueJsonPretty


  },  
  props: {
    structure: Object,
    parentStructure: Array,
    parentStructureObj: Object,
    nested: Boolean,
    isMini: Boolean,
    profileCompoent: String,
    profileName: String,
    activeTemplate: Object,
    parentURI: String,
    ptGuid: String,
    dynamic: String,
    rowIdx:Number,
    resourceIdx: Number,
    componentIdx: Number,
    setNavAfterClick: { type: Function },
  },
  data: function() {
    return {
      // these are the labes that are used in the static text of compoennts
      labels: labels,
      displayDebug: false,
      useKey: short.generate(),

      // is a lookup url require a simple or complex lookup interface, and its options
      lookupType:config.lookupConfig
    }
  },
  methods: {

    prettifyXml: uiUtils.prettifyXml,


    forceUpdate: function(){

      // console.log('before',this.useKey)

      // this.useKey = short.generate()
      // // doesnt do anything
      // this.$forceUpdate();

      // console.log('after',this.useKey)


    },

    showDupeRemove: function(){

      let noControls = [
        'http://id.loc.gov/ontologies/bibframe/hasInstance',
        'http://id.loc.gov/ontologies/bibframe/instanceOf',
        'http://id.loc.gov/ontologies/bibframe/hasItem'
      ]

      if (noControls.indexOf(this.structure.propertyURI)>-1){
        return false
      }      

      return true


    },

    hasDynamicTemplate: function(){

      if (this.structure.valueConstraint.valueTemplateRefs.filter(t=> (t.startsWith('dynamic:'))).length>0){
        return true
      }else{
        return false
      }


    },

    toggleDebug: function(){
      
      if (this.displayDebug){this.displayDebug=false}else{this.displayDebug=true}

    },

    duplicateProperty: function(){

      this.$store.dispatch("duplicateProperty", { self: this, id: this.profileCompoent, profile:this.profileName }).then(() => {
        
      })   

    },


    removeProperty: function(){


      const answer = window.confirm('Are you sure you want to remove the property?')
      if (answer) {
        this.$store.dispatch("removeProperty", { self: this, id: this.profileCompoent, profile:this.profileName }).then(() => {
          
        })         

      } else {
        
        return false

      }






    },

    // use the config data to see what type of lookup this componet should use
    returnLookupType(cStructure){

      // these meta componets are structural things, like add new instances/items. etc
      if (cStructure.propertyURI == "http://id.loc.gov/ontologies/bibframe/hasInstance"){

        return "meta"
      }
      if (cStructure.propertyURI == "http://id.loc.gov/ontologies/bibframe/instanceOf"){

        return "hide"
      }

      // we handle this structural thing elsewhere
      if (cStructure.propertyURI == "http://id.loc.gov/ontologies/bibframe/hasItem"){

        return "hide"
      }

    
      

      let type = 'simple'
      if (cStructure.valueConstraint.useValuesFrom.length==0) return null
      cStructure.valueConstraint.useValuesFrom.forEach((cs)=>{
        if (this.lookupType[cs] && this.lookupType[cs].type == 'complex'){
          type='complex'
        }
      })
      return type
    }



  }



};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


.main-component-container:hover .debug-toggle{
  visibility: visible !important;
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
</style>
