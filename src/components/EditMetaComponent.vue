<template>
  <div class="component-container">

    <template v-if="structure.propertyURI=='http://id.loc.gov/ontologies/bibframe/hasInstance'"> 

      <div class="component-container-title">Manage Instances</div>
      <div>
         <table style="width: 100%">
           <tr v-for="io in hasInstance" v-bind:key="io">
             <td style="background-color: whitesmoke;">{{io}}</td><td  style="text-align: right; background-color: whitesmoke;"><a href="#" @click="duplicateInstance($event)" style="color:#2c3e50">duplicate</a></td><td  style="text-align: right; background-color: whitesmoke;"><a href="#" @click="deleteInstance($event)" style="color:#2c3e50">delete</a></td>
           </tr>
           <tr>
             <td ><a @click="deleteInstance($event)" href="#" style="color:#2c3e50">Add</a> another Instance</td>
           </tr>

         </table> 


      </div>


    </template>

    <template v-if="structure.propertyURI=='http://id.loc.gov/ontologies/bibframe/instanceOf'"> 

      <div class="component-container-title">Instance Of</div>

         <table style="width: 100%">
           <tr >
             <td style="background-color: whitesmoke;">{{instanceOf}}</td>
           </tr>
           
         </table> 


    </template>

    <template v-if="structure.propertyURI=='http://id.loc.gov/ontologies/bibframe/hasItem'"> 

      <div class="component-container-title">Has Item</div>

         <table style="width: 100%">
           <tr v-for="io in hasItem" v-bind:key="io">
             <td style="background-color: whitesmoke;">{{io}}</td><td  style="text-align: right; background-color: whitesmoke;"><a href="#" @click="duplicateInstance($event)" style="color:#2c3e50">duplicate</a></td><td  style="text-align: right; background-color: whitesmoke;"><a href="#" @click="deleteInstance($event)" style="color:#2c3e50">delete</a></td>
           </tr>
           <tr>
             <td ><a @click="deleteInstance($event)" href="#" style="color:#2c3e50">Add</a> another Item</td>
           </tr>

         </table> 


    </template>


    



  </div>

<!--     <Keypress key-event="keydown" :multiple-keys="[{keyCode: 68, modifiers: ['ctrlKey','shiftKey'],preventDefault: false}]" @success="openDiacriticSelect" />

 -->



</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"


export default {
  name: "EditMetaComponent",
  components: {
    // Keypress: () => import('vue-keypress')    
  },

  props: {
    structure: Object,
    parentStructure: Array,
    profileCompoent: String,
    profileName: String,
    activeTemplate: Object,
    nested: Boolean,
    parentURI: String,
  },

  methods: { 

    duplicateInstance:function(event){


      event.preventDefault()
      return false
    },
    deleteInstance: function(event){


      event.preventDefault()
      return false
    },
   
    buildData: function(){

      for (let rt of Object.keys(this.activeProfile.rt)){

        // there can be only one work, so build the instances this work has in this record
        if (this.activeProfile.rt[rt].instanceOf){
          this.hasInstance.push(this.activeProfile.rt[rt].URI)
        }

        // there is only one work, so all instances are instancOf that work...
        if (rt.endsWith(':Work')){
          
          this.instanceOf = this.activeProfile.rt[rt].URI

        }


        if (rt.endsWith(':Instance')){

          let thisURI = this.activeProfile.rt[rt].URI
          
          for (let rt2 of Object.keys(this.activeProfile.rt)){
            if (this.activeProfile.rt[rt2].itemOf && this.activeProfile.rt[rt2].itemOf == thisURI){
              this.hasItem.push(this.activeProfile.rt[rt2].URI)
            }
          }




        }





      }

        console.log("structure",this.structure)
        console.log("parentStructure",this.parentStructure)
        console.log("profileName",this.profileName)


    }


  },
  computed: mapState({
    activeInput: 'activeInput',
    activeProfile: 'activeProfile',
    // assignedId (){


    //   return uiUtils.assignID(this.structure,this.parentStructure)

    // },    
  }), 

  data: function() {
    return {

      hasInstance: [],
      hasItem: [],
      instanceOf: null


    }
  },
  created: function(){

    console.log(this.activeProfile, "<<<activeProfile")
    this.buildData()

  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->


<style scoped>

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
