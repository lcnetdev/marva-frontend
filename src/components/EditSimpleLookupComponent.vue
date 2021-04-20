<template>
  <div v-if="nested != true" class="component-container">
    <div class="component-container-title">{{structure.propertyLabel}}</div>
    <div class="component-container-input-container">
        <div class="component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border temp-icon-search">          
          <form autocomplete="off" v-on:submit.prevent>
            <div style=" display: flex; height: 100%">
            <!-- <input autocomplete="off" v-bind:value="activeSelect"  type="text" disabled style="width: 95%; border:none; height: 90%; font-size: 1.5em; padding: 0.1em; position: relative; background: none; color: lightgray"> -->
              
              <div v-for="(avl,idx) in activeLookupValue" :key="idx" class="selected-value-container">
                  <span style="padding-right: 0.3em; font-weight: bold">{{avl['http://www.w3.org/2000/01/rdf-schema#label']}}<span class="uncontrolled" v-if="avl.BFE2METAnotControled">(uncontrolled)</span></span>
                  <span @click="removeValue(idx)" style="border-left: solid 1px black; padding: 0 0.5em; font-size: 1em; cursor: pointer;">x</span>
              </div>
              <input bfeType="EditSimpleLookupComponent-unnested" ref="lookupInput"  :id="assignedId" autocomplete="off" v-on:blur="blur" v-bind:value="activeValue"  type="text" @focus="autoFocus($event)" @keydown="keyDownEvent($event)" @keyup="keyUpEvent($event)" class="input-single selectable-input">
            </div>
          </form>
        </div>
      <div v-if="displayAutocomplete==true" class="autocomplete-container">
        <ul>
          <li v-for="(item, idx) in displayList" :data-idx="idx" v-bind:key="idx" @click="clickAdd">
              <span v-if="item==activeSelect" :data-idx="idx" class="selected">{{item}}</span>
              <span v-else :data-idx="idx">{{item}}</span>
          </li>
        </ul>
      </div>
    </div>

<!--             <pre>{{JSON.stringify(structure,null,2)}}</pre>
 -->
  </div>


  <div v-else style="position: relative;">
      <div  v-bind:class="['component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border temp-icon-search']" style="">          
        <form autocomplete="off" v-on:submit.prevent style="">
          <div style="">
          <!-- <input autocomplete="off" v-bind:value="activeSelect"  type="text" disabled style="width: 95%; border:none; height: 90%; font-size: 1.5em; padding: 0.1em; position: relative; background: none; color: lightgray"> -->
            <div class="component-nested-container-title component-nested-container-title-simple-lookup" >{{structure.propertyLabel}}</div>            
            <div style="display: flex">
              <div v-for="(avl,idx) in activeLookupValue" :key="idx" class="selected-value-container-nested">
                  <span style="padding-right: 0.3em; font-weight: bold">{{avl['http://www.w3.org/2000/01/rdf-schema#label']}}<span class="uncontrolled" v-if="avl.BFE2METAnotControled">(uncontrolled)</span></span>
                  <span @click="removeValue(idx)" style="border-left: solid 1px black; padding: 0 0.5em; font-size: 1em; cursor: pointer;">x</span>
              </div>




              <input bfeType="EditSimpleLookupComponent-nested" ref="lookupInput"  :id="assignedId" autocomplete="off" v-on:blur="blur" v-bind:value="activeValue"  type="text" @focus="autoFocus($event)" @keydown="keyDownEvent($event)"  @keyup="keyUpEvent($event)"  class="input-nested selectable-input">
            </div>              

          </div>
          

        </form>
      </div>
    <div v-if="displayAutocomplete==true" class="autocomplete-container">
      <ul>
        <li v-for="(item, idx) in displayList" :data-idx="idx" v-bind:key="idx" @click="clickAdd">
            <span v-if="item==activeSelect" :data-idx="idx" class="selected">{{item}}</span>
            <span v-else :data-idx="idx">{{item}}</span>
        </li>
      </ul>
    </div>

<!--             <pre>{{JSON.stringify(structure,null,2)}}</pre>
 -->
  </div>



</template>

<script>


import { mapState } from 'vuex'
import uiUtils from "@/lib/uiUtils"


export default {
  name: "EditSimpleLookupComponent",
  props: {
    structure: Object,
    parentStructure: Array,
    nested: Boolean,
    profileName: String,
    activeTemplate: Object,

    profileCompoent: String

  },
  data: function() {
    return {
      displayAutocomplete: false,
      uri: this.structure.valueConstraint.useValuesFrom[0],
      displayList: [],
      activeFilter: '',
      activeSelect: '',
      activeValue: '',
      doubleDelete: false,
      activeLookupValue: []


    }
  },
  created: function(){





    // fill in the defaults if it comes with them
    // only if this was not loaded from a record
    // if (!this.activeProfile.procInfo || (this.activeProfile.procInfo && !this.activeProfile.procInfo.includes("update"))){
    //   if (this.structure.valueConstraint.defaults.length>0){

    //     console.log("SIMPLE DEFUALTS")
    //     console.log(this.structure.valueConstraint.defaults)
        

    //     this.activeLookupValue.push({})
    //     this.activeLookupValue[0]['http://www.w3.org/2000/01/rdf-schema#label'] = this.structure.valueConstraint.defaults[0].defaultLiteral
    //     this.activeLookupValue[0].URI = this.structure.valueConstraint.defaults[0].defaultURI


    //     // this.$store.dispatch("addValueLiteral", { self: this, profileName:this.profileName, profileComponet: this.profileCompoent, structure: this.structure, template:this.activeTemplate, value:this.activeLookupValue }).then(() => {
         
    //     // })  

    //     console.log('createdddd')
    //     // dispatch and add to the acutal data




    //   }
    // }

    let data = this.activeProfile.rt[this.profileName].pt[this.profileCompoent]


      
      
      
      
      
      
      


    // what URI was the data stored in

    // HACK - figure out whats going on here
    let altPropertyURI = this.structure.propertyURI.toLowerCase()
    let dataField = data.userValue[data.propertyURI]


    if (data.userValue[this.structure.propertyURI]){
      dataField = data.userValue[this.structure.propertyURI]


    }else if (data.userValue[altPropertyURI]){
      dataField = data.userValue[altPropertyURI]    
      
    }else if (data.userValue['http://www.w3.org/2002/07/owl#sameAs'] && data.userValue['http://www.w3.org/2002/07/owl#sameAs'][this.structure.propertyURI]){
      dataField = data.userValue['http://www.w3.org/2002/07/owl#sameAs'][this.structure.propertyURI]
    
    }else if (data.userValue['http://www.w3.org/2002/07/owl#sameAs'] && data.userValue['http://www.w3.org/2002/07/owl#sameAs'][altPropertyURI]){
      dataField = data.userValue['http://www.w3.org/2002/07/owl#sameAs'][altPropertyURI]  



    }else if (data.userValue['http://www.w3.org/2002/07/owl#sameAs']){
      dataField = data.userValue['http://www.w3.org/2002/07/owl#sameAs']         
    }else if (data.userValue['@type'] && data.userValue[data.userValue['@type']]){
      dataField = data.userValue[this.structure.propertyURI]

    }

    // Kind of a HACK here, need to sort out what URI the data is being stored under here
    
    

    if (!Array.isArray(dataField)){
      dataField = [dataField]
    }

    for (let aDataField of dataField){
      
      
      if (data.userValue && aDataField){
        let alv = {}
        if (aDataField.literal){
          alv['http://www.w3.org/2000/01/rdf-schema#label'] = aDataField.literal
        }
        if (aDataField['http://www.w3.org/2000/01/rdf-schema#label']){
          alv['http://www.w3.org/2000/01/rdf-schema#label'] = aDataField['http://www.w3.org/2000/01/rdf-schema#label']
        }

        if (aDataField['http://id.loc.gov/ontologies/bibframe/code']){
          alv['http://www.w3.org/2000/01/rdf-schema#label'] = aDataField['http://id.loc.gov/ontologies/bibframe/code']
        }


        if (aDataField.URI){
          alv.URI = aDataField.URI
        }else{
          alv.URI = null
          alv.BFE2METAnotControled = true
        }

        if (aDataField.BFE2METAnotControled){
          alv.BFE2METAnotControled = aDataField.BFE2METAnotControled
        }

        // no literal
        if (!alv['http://www.w3.org/2000/01/rdf-schema#label'] && alv.URI){
          alv['http://www.w3.org/2000/01/rdf-schema#label'] = alv.URI.split('/').slice(-1)[0] + " (no label)"
        }
        
        
        this.activeLookupValue.push(alv)
      }

    }

    
    



  },

  computed: mapState({
    lookupLibrary: 'lookupLibrary',
    activeInput: 'activeInput',
    activeProfile: 'activeProfile',
    assignedId (){
      return uiUtils.assignID(this.structure,this.parentStructure)
    },  
    // to access local state with `this`, a normal function must be used
    lookupVocab (state) {
      // let uri = this.structure.valueConstraint.useValuesFrom[0]

      // let returnVal = []
      // Object.keys(state.lookupLibrary).forEach((s)=>{
      
      // })
      
      // if (state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]){
      
      //   return state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]
      // }else{
      //   return []
      // }
      return state.lookupLibrary[this.structure.valueConstraint.useValuesFrom[0]]

      
    }
  }),  
  methods:{

    fakeContainerFocus: function(event){

        // console.log(event.target.querySelectorAll('input'))

        return event
    },

    removeValue: function(idx){


      this.activeLookupValue.splice(idx,1)


      // if (this.activeLookupValue.length>1){
      //   this.activeLookupValue.splice(-1,1)
      // }else{
      //   this.activeLookupValue = []
      // }

    },  

    // Takes the list of values from this lookup uri and filters it based on the input
  
    filter: function(){

      this.displayList = []
      this.activeSelect = ''
      Object.keys(this.lookupLibrary[this.uri]).forEach((v)=>{

        // the list has a special key metdata that contains more info
        if (v==='metadata'){return false}

        // no filter yet show first 25
        if (this.activeFilter.trim()===''){
          this.lookupLibrary[this.uri][v].forEach((x)=>{
            // if (this.displayList.length<=25){
              if (this.displayList.indexOf(x)==-1){
                this.displayList.push(x)  
              }
            // }
          })          
        }else{

          // loop through each one, each is a array, so each element of array
          this.lookupLibrary[this.uri][v].forEach((x)=>{
            console.log(x)
            // simple includes value check
            if (x.toLowerCase().startsWith(this.activeFilter.toLowerCase())){
                if (this.displayList.indexOf(x)==-1){
                  this.displayList.push(x)    
                }
            }       

            if (x.toLowerCase().includes(' (' +this.activeFilter.toLowerCase())){
                if (this.displayList.indexOf(x)==-1){
                  this.displayList.push(x)    
                }
            }  



          })
        }


      })



      this.displayList.sort()

      
      // take the first hit and make it the autocomplete text
      if (this.displayList.length>0 && this.activeFilter.length>0){
        this.activeSelect = this.displayList[0]
        this.displayAutocomplete = true
      }
      if (this.displayList.length==0){
        this.displayList.push('No Match - Press [Enter] to add uncontrolled value')
        this.displayAutocomplete = true
      }
      if (this.activeFilter.length==0){
        this.displayAutocomplete = true
      }

      if (this.displayAutocomplete){        
        this.$store.dispatch("disableMacroNav")
      }else{
        this.$store.dispatch("enableMacroNav")
      }

    },
    autoFocus: function(event){

      // let the rest of the app know what is the active input right now
      this.$store.dispatch("setActiveInput", { self: this, id: event.target.id, profileCompoent: this.profileCompoent, profileName: this.profileName }).then(()=>{

        // now focus the side bars
        uiUtils.focusSidebars()


      })
      // assing the input value to the filter value
      this.activeFilter = event.target.value;
      // tell the store to load this specific lookup table into memory
      this.$store.dispatch("fetchLookupValues", { self: this, url: this.structure.valueConstraint.useValuesFrom[0] }).then(() => {
        
        // if there is already a value don't open up the full list, they can type ahead but dont open everything
        // if (this.activeLookupValue.length==0){
          // this.filter()
        // }
      })    
      
      
      

    },
    keyUpEvent: function(event){

      if (event && event.key && (event.key!=='ArrowUp' && event.key !=='ArrowDown' && event.key!=='Escape' && event.key!=='Backspace' && event.key!=='Enter' && event.key!=='PageUp' && event.key!=='PageDown')){
        

        // if we already have a value, do not let it add another
        // if (this.activeLookupValue != null){
        //   event.target.value = ''
        //   event.preventDefault()
        //   return false
        // }



        this.activeValue = event.target.value.trimStart()
        this.doubleDelete = false
        this.activeValue = event.target.value.trimStart()
        this.activeFilter = event.target.value.trimStart()
        this.displayAutocomplete = true
        this.$store.dispatch("disableMacroNav")
        this.filter()




      }





    },    
    keyDownEvent: function(event){
      

      this.activeValue = event.target.value

      if (event && event.key && this.displayAutocomplete == true && (event.key==='ArrowUp' || event.key==='ArrowDown')){
        this.doubleDelete = false
        if (this.displayList.length<=1){
          return false
        }
        if (!this.displayAutocomplete) this.displayAutocomplete = true

        this.activeFilter =''
        this.activeValue = ''
        // if there is nothing selected yet then pick the first one
        if (this.activeSelect.trim()=='' && this.displayList.length>0){
          this.activeSelect = this.displayList[0]
          this.activeValue = this.displayList[0]


        }else{

          // check if there is one further from the actively selected item
          for (let step=0; step<this.displayList.length;step++){
            if (this.displayList[step]===this.activeSelect){

              if (event.key==='ArrowDown'){
                if (step+1 < this.displayList.length){
                  this.activeSelect = this.displayList[step+1]
                  this.activeValue = this.displayList[step+1]
                  break
                }
              }
              if (event.key==='ArrowUp'){
                if (step-1 >= 0){
                  this.activeSelect = this.displayList[step-1]
                  this.activeValue = this.displayList[step-1]
                  break
                }
              }

            }

          }
        }

        return false
      // }else if (event && event.key && this.displayAutocomplete == false && (event.key==='ArrowUp' || event.key==='ArrowDown')){

      }else if (event && event.key && event.key==='Escape'){
        this.doubleDelete = false
        this.activeFilter = ''
        this.activeValue = ''
        this.displayAutocomplete = false
      
      }else if (event && event.key && event.key==='Backspace'){

        if (!this.doubleDelete && this.activeValue === ''){
          this.doubleDelete = true
          return false
        }
        if (this.activeValue == '' && this.doubleDelete){
          this.doubleDelete = false
          // were gonna delete the last one
          
          if (this.activeLookupValue.length>1){
            this.activeLookupValue.splice(-1,1)
          }else{
            this.activeLookupValue = []
          }
          this.doubleDelete = false
          this.displayAutocomplete = false
        }else if (this.activeValue == ''){
          this.activeValue
        }

      }else if (event && event.key && event.key==='Enter'){
        this.doubleDelete = false

        let metadata = this.lookupLibrary[this.uri].metadata.values

        // find the active selected in the data
        Object.keys(metadata).forEach((key)=>{

          let idx = metadata[key].displayLabel.indexOf(this.activeSelect)
          if (idx >-1){
            this.activeLookupValue.push({'http://www.w3.org/2000/01/rdf-schema#label':metadata[key].label[idx],URI:metadata[key].uri})
            this.activeFilter = ''
            this.activeValue = ''
            this.activeSelect = ''
            this.displayAutocomplete=false
            event.target.value = ''
            this.$store.dispatch("addValueLiteral", { self: this, profileComponet: this.profileCompoent, structure: this.structure, template:this.activeTemplate, value:this.activeLookupValue }).then(() => {
             
            })               

          }
          // let data = this.lookupLibrary[this.uri].metadata[v]
          
          // let idx = data.defaultsisplayLabel.indexOf(this.activeSelect)
          // if (idx > -1){
          //   this.structure.valueConstraint.defaults.push({defaultLiteral:data.label[idx],defaultURI:data.uri[idx]})
          // }
        })


        if (event.target.value == ''){
          this.submitField()
        }

        // if there is a value still that means the value did not match a item in the list
        // so add the value as a uncontrolled value
        if (event.target.value !== ''){  
          this.activeLookupValue.push({'http://www.w3.org/2000/01/rdf-schema#label':event.target.value,URI:null, BFE2METAnotControled:true})
          this.activeFilter = ''
          this.activeValue = ''
          this.activeSelect = ''
          this.displayAutocomplete=false
          this.$store.dispatch("addValueLiteral", { self: this, profileComponet: this.profileCompoent, structure: this.structure, template:this.activeTemplate, value:this.activeLookupValue }).then(() => {


          })
  
          this.submitField()

        }


        event.preventDefault()


      }else if (event.target.value == ''){


            this.activeFilter = ''
            this.activeValue = ''
            this.activeSelect = ''
            this.displayAutocomplete=false



      }


      if (this.displayAutocomplete){        
        this.$store.dispatch("disableMacroNav")
      }else{
        this.$store.dispatch("enableMacroNav")
      }




    },

    blur: function(){

     // we want to hide the menu on deblur but not if they just click an item in the list

     this.$store.dispatch("enableMacroNav") 
     setTimeout(()=>{ 
      this.displayAutocomplete=false 
      this.$store.dispatch("enableMacroNav") 
    },500)


    },

    clickAdd: function(event){

      this.displayAutocomplete=false


      let label = this.displayList[event.target.dataset.idx]

      let metadata = this.lookupLibrary[this.uri].metadata.values

      // find the active selected in the data
      Object.keys(metadata).forEach((key)=>{

        let idx = metadata[key].displayLabel.indexOf(label)
        if (idx >-1){
          this.activeLookupValue.push({'http://www.w3.org/2000/01/rdf-schema#label':metadata[key].label[idx],URI:metadata[key].uri})
          this.activeFilter = ''
          this.activeValue = ''
          this.activeSelect = ''
          this.displayAutocomplete=false
          this.$store.dispatch("addValueLiteral", { self: this, profileComponet: this.profileCompoent, structure: this.structure, template:this.activeTemplate, value:this.activeLookupValue }).then(() => {
           
          })           
          this.$store.dispatch("enableMacroNav")    

        }


      })

      // refocus
      this.$refs.lookupInput.focus()



    },

    submitField: uiUtils.globalMoveDown  


  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

    <!-- <pre>{{JSON.stringify(structure,null,2)}}</pre> -->

<style scoped>

.input-single{
  width: 95%;
  border:none;
  font-size: 1.5em;
  min-height: 2em;
  max-height: 2em;  
  background:none;
}
.input-nested{
  width: 95%;
  border: none;
  font-size: 1.5em;
  padding: 0.1em;
  background: none;

}
.component-nested-container-title-simple-lookup{
  /*top: -4.5em;*/
}

li::before{
  content: '';
}

li{
  padding:0.1em;
}

li span{
  padding:0.1em;
}
input{
  outline: none;
}
.uncontrolled{
  margin-left: 0.25em;
  color: darkred;
}
.component-container-fake-input:focus-within {
  border: solid 1px #a6acb7;
  background-color: #dfe5f1;

  
}
.selected-value-container{
  margin: 0.95em;
  border: solid 1px;
  border-radius: 0.5em;
  padding: 0.35em;
  font-size: 0.75em;
  background-color: whitesmoke;
  white-space: nowrap;

}
.selected-value-container-nested{
  margin: 0.25em;
  border: solid 1px;
  border-radius: 0.5em;
  padding: 0.35em;
  font-size: 0.75em;
  background-color: whitesmoke;
  white-space: nowrap;
  display: inline;
}
.selected{
  border:solid 4px lightblue;
  border-radius: 5px;
}
.autocomplete-container{
  padding: 0.45em;
  position: absolute;
  z-index: 100;
  background-color: white;
  border-radius: 15px;
  -webkit-box-shadow: 0px 5px 7px -1px rgba(150,150,150,1);
  -moz-box-shadow: 0px 5px 7px -1px rgba(150,150,150,1);
  box-shadow: 0px 5px 7px -1px rgba(150,150,150,1);  
}
.autocomplete-container li{
  cursor: pointer;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0 10px;
}
a {
  color: #42b983;
}
form{
  height: 100%;
}
</style>
