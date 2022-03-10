<template>
  
  <div tabindex="-1" @click="displayModeClick($event)" @keydown="displayModeElementKeydown($event)"  :class="['resource-grid-field-list-navable', `resource-${resourceIdx}`]" :id="`navable-${resourceIdx}-1-${rowIdx}-${componentIdx}`" v-if="hideField == false">
    <Keypress key-event="keydown" :multiple-keys="[{keyCode: 68, modifiers: ['shiftKey','ctrlKey','altKey'],preventDefault: false}]" @success="openDiacriticSelect" />

    <template v-if="editMode"> 

      <div style="position: relative;">
        <div style="">
          <form autocomplete="off">            
            <input :placeholder="structure.propertyLabel" @blur="literalBlur() "  bfeType="EditLiteralComponent-unnested" :id="assignedId" v-on:keydown.enter.prevent="submitField" :name="assignedId" ref="input" v-on:focus="focused" autocomplete="off" type="text" @keydown="nav" @keyup="change" v-model="inputValue"  :class="['input-single', {'selectable-input': (isMini==false), 'selectable-input-mini':(isMini==true), 'input-accommodate-diacritics': (containsNonLatinCodepoints(inputValue))}]">            
          </form>
        </div>
        <button tabindex="-1" class="temp-icon-keyboard fake-real-button simptip-position-top" :data-tooltip="'Diacritics [CTRL-ALT-D]'" @click="openDiacriticSelect"></button>

      </div>
    </template>
    <template v-else>

        <div ref="displayModeElement" v-if="inputValue !== null && inputValue.trim().length>0" style="min-height: 1em;">{{inputValue}}</div>
        <div ref="displayModeElement" v-else style="font-size: 0.85em; font-style: oblique;">{{structure.propertyLabel}}</div>        
      

    </template>




    <div v-if="showDiacritics==true" class="diacritic-modal">
      <ul class="diacritic-modal-script-list">
        <li style="font-weight: bold">Custom</li>
  
<!--         <li style="color:lightgrey">Other</li>
        <li style="color:lightgrey">Langs</li>
        <li style="color:lightgrey">Here</li> -->
      </ul>
      <hr style="margin:2px;">

      <div class="diacritic-list-holder">
        <table>
          <tr  v-for="(d,idx) in diacriticData" ref="diacriticTable" @click="diacriticSelect" :data-id="idx" v-bind:key="idx">
            <td><span class="diacritic-modal-list-diacritic">{{d.letter}}</span><span style="padding-left: 2em">{{d.desc}}</span></td>
            <td>{{d.trigger}}</td>
          </tr>

        </table>
      </div>
    </div>

  </div>




</template>

<script>


import { mapState } from 'vuex'
import uiUtils from "@/lib/uiUtils"
import config from "@/lib/config"
import diacrticsVoyagerMacroExpress from "@/lib/diacritics/diacritic_pack_voyager_macro_express.json"
import diacrticsVoyagerNative from "@/lib/diacritics/diacritic_pack_voyager_native.json"



export default {
  name: "EditLiteralComponent",
  components: {
    Keypress: () => import('vue-keypress')    
  },

  props: {
    structure: Object,
    parentStructure: Array,
    parentStructureObj: Object,
    profileCompoent: String,
    profileName: String,
    activeTemplate: Object,
    parentURI: String,
    nested: Boolean,
    isMini: Boolean,
    ptGuid: String,
    rowIdx: Number,
    resourceIdx: Number,
    componentIdx:Number,
    setNavAfterClick: { type: Function },

  },

  methods: {

    literalBlur: function(){

      this.editMode=false
      this.$store.dispatch("enableMacroNav")

    },

    
    displayModeClick: function(event){
      if (!this.editMode){
        this.editMode=true
        this.$store.dispatch("disableMacroNav")
        this.$nextTick(()=>{
          this.$refs.input.focus()
        })

        this.setNavAfterClick(event.target.parentNode.id)

      }


      
    },



    displayModeElementKeydown: function(event){

      console.log(event.key)
      if (event.key =='Enter'){
        if (this.editMode){
          this.editMode=false
          this.$store.dispatch("enableMacroNav")

        }else{
          this.editMode=true
          this.$store.dispatch("disableMacroNav")
          this.$nextTick(()=>{
            this.$refs.input.focus()
          })

        }

      }else{
        // ssss
        if (!this.editMode){
          event.target.blur()
        }
      }


      
      

      if (event.key=='Enter'){
        event.preventDefault()
        return false
      }
      


    },


    containsNonLatinCodepoints: function(s) {
        return /[^\u0000-\u00ff]/.test(s); // eslint-disable-line
    },


    // this stores the active input at the global var level so it knows how to tab forward
    focused: function(event){     
   
      this.$store.dispatch("setActiveInput", { self: this, id: event.target.id, profileCompoent: this.profileCompoent, profileName: this.profileName }).then(()=>{

        // now add the highlights to the side bars for this field
        uiUtils.focusSidebars()
        // console.log(this.activeInput,event.target.id)


      })
      



    },
    submitField: uiUtils.globalMoveDown,

    insertUnicodeHex: function(hex){

      this.inputValue = String.fromCodePoint(hex);


    },




    isNoteField: function(label){


      if (label == 'Note Text') return true
      if (label == 'Note') return true
      if (label == 'Contents note') return true


      return false
    },

   
    openDiacriticSelect: function(event){


      // we are using global dicratics so stop if this is one of the other components and not this one
      if (this.assignedId != this.activeInput){
        return false
      }

      this.$store.dispatch("disableMacroNav")
      this.showDiacritics=true

      this.$nextTick(()=>{
        this.$refs.diacriticTable[this.diacriticDataNav].style.backgroundColor="#dfe5f1"
      })


      // if they acticated it via button then put the focus back on the input text box to recive key commands
      if (event && event.target && event.target.localName && event.target.localName == 'button'){
        event.target.parentNode.querySelector('input').focus()

      }
      







    },

    diacriticSelect: function(event){

      // depending on where they click the parent maybe the td or it may be the tr where the data-id attrubture is storeing the trigger 
      let pos = (event.target.parentNode.dataset.id) ? event.target.parentNode.dataset.id : event.target.parentNode.parentNode.dataset.id
   
      
      if (this.inputValue){
        this.inputValue = this.inputValue + this.diacriticData[pos].letter
      }else{
        this.inputValue = this.diacriticData[pos].letter
      }
      this.showDiacritics=false
      this.$store.dispatch("enableMacroNav")

      // focus back on the input
      setTimeout(()=>{
        document.getElementById(this.assignedId).focus()
      },0)


    },

    nav: function(event){

      console.log(event)
      console.log(this.settingsDPackVoyagerNative, this.diacrticsVoyagerNativeMode,event.code,event.ctrlKey)
      // turn it on
      if (this.settingsDPackVoyagerNative && this.diacrticsVoyagerNativeMode == false && event.code == 'KeyE' && event.ctrlKey == true){
        this.$refs["input"].style.color="blue"
        this.diacrticsVoyagerNativeMode = true
        console.log("Here")
        event.preventDefault()
        return false
      // turn it off
      }else if (this.settingsDPackVoyagerNative && this.diacrticsVoyagerNativeMode == true && event.code == 'KeyE' && event.ctrlKey == true){
        this.diacrticsVoyagerNativeMode = false
        window.setTimeout(()=>{
          this.$refs["input"].style.color="black"
        },500)
        event.preventDefault()
        return false
      // execute it
      }









      if (event && event.key && this.showDiacritics == true){


        if (event.key == 'Escape'){
          this.showDiacritics=false
          console.log(this.inputValueLast)
          this.$store.dispatch("enableMacroNav")

        }else if (event.key == 'ArrowDown' || event.key == 'ArrowUp' ){
            if (event.key == 'ArrowDown' &&  this.diacriticDataNav < this.$refs.diacriticTable.length-1){
              this.diacriticDataNav++
            }else if (event.key == 'ArrowUp' && this.diacriticDataNav>0){
              this.diacriticDataNav = this.diacriticDataNav - 1
            }

            this.$refs.diacriticTable.forEach((el)=>{
              el.style.backgroundColor = 'transparent'
            })
            this.$refs.diacriticTable[this.diacriticDataNav].style.backgroundColor="#dfe5f1"
            console.log(this.$refs.diacriticTable[this.diacriticDataNav].style)
            this.$refs.diacriticTable[this.diacriticDataNav].scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"})
        }else if (event.key == 'Enter'){

          let letter = this.diacriticData[this.diacriticDataNav].letter

          if (this.inputValue){
            this.inputValue = this.inputValue + letter
          }else{
            this.inputValue = letter
          }

          this.showDiacritics=false
          this.$store.dispatch("enableMacroNav")


        }else{

          for (let key of this.diacriticData){
            if (event.key == key.trigger){
              if (this.inputValue){
                this.inputValue = this.inputValue + key.letter
              }else{
                this.inputValue = key.letter
              }
              
              this.showDiacritics=false
              this.$store.dispatch("enableMacroNav")              
            }            
          }


        }

        event.preventDefault()
        return false

      }






      if (event && (event.key == 'Escape')){
        console.log("HERE")
        console.log(this.inputValueOrginal)
        this.inputValue = this.inputValueOrginal
        this.editMode = false
        this.showDiacritics=false
        this.$store.dispatch("enableMacroNav")         

      }




    },


    change: function(event){


      if (!this.inputValueOrginal){
        this.inputValueOrginal = this.inputValue
      }

      if (diacrticsVoyagerMacroExpress[event.code] && this.settingsDPackVoyager){


        for (let macro of diacrticsVoyagerMacroExpress[event.code]){

          if (event.ctrlKey == macro.ctrlKey && event.altKey == macro.altKey && event.shiftKey == macro.shiftKey){

            event.preventDefault();

            console.log(this.$refs["input"])


            this.$refs["input"].style.color="blue"
            window.setTimeout(()=>{
              this.$refs["input"].style.color="black"
            },500)

            if (!macro.combining){

              // there is behavior where if it is a digit shortcut the numerial is still sent
              // so if thats the case remove the last digit from the value
              if (event.code.includes('Digit')){
                // if it is in fact a digit char then remove it
                if (this.inputValue.charAt(this.inputValue.length-1) == event.code.replace('Digit','')){
                  // remove the last char
                  this.inputValue = this.inputValue.slice(0, -1); 
                }
              }

              // same for euqal key
              if (event.code == 'Equal'){
                if (this.inputValue.charAt(this.inputValue.length-1) == '='){
                  // remove the last char
                  this.inputValue = this.inputValue.slice(0, -1); 
                }
              }
              // same for Backquote key
              console.log('event.code',event.code)
              if (event.code == 'Backquote'){
                console.log('this.inputValue',this.inputValue)
                if (this.inputValue.charAt(this.inputValue.length-1) == '`'){
                  // remove the last char
                  this.inputValue = this.inputValue.slice(0, -1); 
                }

              }


              // it is not a combining unicode char so just insert it into the value
              if (this.inputValue){
                this.inputValue=this.inputValue+macro.codeEscape
              }else{
                this.inputValue = macro.codeEscape
              }
              
            }else{


              // same for Backquote key
              console.log('event.code',event.code)
              if (event.code == 'Backquote'){
                console.log('this.inputValue',this.inputValue)
                if (this.inputValue.charAt(this.inputValue.length-1) == '`'){
                  // remove the last char
                  this.inputValue = this.inputValue.slice(0, -1); 
                }

              }


              // little cheap hack here, on macos the Alt+9 makes ª digits 1-0 do this with Alt+## but we only 
              // have one short cut that uses Alt+9 so just remove that char for now
              this.inputValue=this.inputValue.replace('ª','')
              this.inputValue=this.inputValue+macro.codeEscape
    


            }


          }

        }


      }

      // handled in the keydown
      if (this.settingsDPackVoyagerNative && this.diacrticsVoyagerNativeMode == false && event.code == 'KeyE' && event.ctrlKey == true){
        event.preventDefault()
        return false
      // turn it off
      }else if (this.settingsDPackVoyagerNative && this.diacrticsVoyagerNativeMode == true && event.code == 'KeyE' && event.ctrlKey == true){
        event.preventDefault()
        return false
      // execute it
      }else if (this.settingsDPackVoyagerNative && diacrticsVoyagerNative[event.code] && this.diacrticsVoyagerNativeMode == true){

        window.setTimeout(()=>{
          this.$refs["input"].style.color="black"
        },500)

        // remove the shortcut key we just dumped into the text box
        this.inputValue = this.inputValue.slice(0, -1); 

        this.diacrticsVoyagerNativeMode = false
        
        let useMacro
        for (let macro of diacrticsVoyagerNative[event.code]){          
          if (macro.shiftKey == event.shiftKey){
            useMacro = macro
            break
          }
        }


        if (!useMacro.combining){
          // it is not a combining unicode char so just insert it into the value
          if (this.inputValue){
            this.inputValue=this.inputValue+useMacro.codeEscape
          }else{
            this.inputValue = useMacro.codeEscape
          }

        }else{
              this.inputValue=this.inputValue+useMacro.codeEscape

        }

      }




      // }





      // if (event.ctrlKey && event.altKey && event.code == 'KeyH'){
      //   console.log('~~~~~~~~~~~~~~~~~~~~')
      //   console.log(event)

      //   this.inputValue=this.inputValue+'a\u0328'
      // }



      // don't update if nothing changed or havent entered anythign yet...
      if (this.inputValue == null){
        return false
      }

      if (this.inputValue == this.inputValueLast){
        return false
      }


      // this resizes the textarea as there is more content
      if (event.target && event.target.localName && event.target.localName == 'textarea'){
        event.target.style.height = ""
        event.target.style.height = event.target.scrollHeight + "px"
      }


      // if (this.inputValue === null) return false
      // if (this.inputValue.trim() === '') return false

      let parentURI = null
      if (this.parentStructureObj){
        parentURI = this.parentStructureObj.propertyURI
      }


      this.$store.dispatch("setValueLiteral", { self: this, ptGuid: this.ptGuid, guid: this.guid, parentURI:parentURI, URI: this.structure.propertyURI, value: this.inputValue }).then((newGuid) => {
       
        this.inputValueLast = this.inputValue
        // if this is here then we created a new value, store it for future edits
        if(newGuid){
          this.guid = newGuid
        }

        // but if it is explictly set to false that means we just unset the value, so reset the guid here
        if (newGuid===false){
          this.guid = null
        }



      })   


    }



  },
  computed: mapState({
    activeInput: 'activeInput',
    activeProfile: 'activeProfile',
    activeProfileMini: 'activeProfileMini',
    workingOnMiniProfile: 'workingOnMiniProfile',


    settingsDPackVoyager: 'settingsDPackVoyager',
    settingsDPackVoyagerNative: 'settingsDPackVoyagerNative',
    assignedId (){


      return uiUtils.assignID(this.structure,this.parentStructure)

    },    
  }), 

  data: function() {
    return {

      inputValue: null,
      inputValueLast: null,
      inputValueOrginal: null,
      inputValueCombiningDiacritic: null,
      showDiacritics: false,
      diacriticData: [],
      diacriticDataNav: 0,
      hideField: false,
      guid: null,
      diacrticsVoyagerNativeMode:false,
      editMode: false,


    }
  },
  created: function(){

    let data
    if (this.isMini){
      data = this.activeProfileMini.rt[this.profileName].pt[this.profileCompoent] 
    }else{
      data = this.activeProfile.rt[this.profileName].pt[this.profileCompoent]  
    }
    

    this.inputValue = ""
    // let bnodeHasURI = false

    // first test to see if this property exists in the user value at the parent structure / properturi lvl
    if (this.parentStructureObj && data.userValue[this.parentStructureObj.propertyURI]){
      for (let parentValueArray of data.userValue[this.parentStructureObj.propertyURI]){
        if (parentValueArray[this.structure.propertyURI]){          
          for (let childValue of parentValueArray[this.structure.propertyURI]){
            if (childValue[this.structure.propertyURI]){
              // if there are multiple literals of the same property, like multuple rdf:label (why?) then just merge them
              // together into the imput so we dont lose it and can be edited
              this.inputValue = this.inputValue + childValue[this.structure.propertyURI]

              // for use later, does this bnode have a URI?              
              // if (parentValueArray['@id']){
              //   bnodeHasURI = true
              // }

              // also set the guid
              this.guid = childValue['@guid']
            }
          }
        }
      }
    }else if (!this.parentStructureObj && data.userValue[this.structure.propertyURI]){
      // if it is not a nested template literal then it should be a first lvl one
      for (let value of data.userValue[this.structure.propertyURI]){
        if (value[this.structure.propertyURI]){
          // if there are multiple literals of the same property, like multuple rdf:label (why?) then just merge them
          // together into the imput so we dont lose it and can be edited
          this.inputValue = this.inputValue + value[this.structure.propertyURI]

          this.guid = value['@guid']
        }
      }
    }else if (this.parentStructureObj && this.parentStructureObj.propertyURI == data.userValue['@root'] && data.userValue[this.structure.propertyURI]){
      // there is aparent element, but it is the root element also

      // for (let value of data.userValue[this.structure.propertyURI]){
      //   if (value[this.structure.propertyURI]){
      //     // if there are multiple literals of the same property, like multuple rdf:label (why?) then just merge them
      //     // together into the imput so we dont lose it and can be edited
      //     this.inputValue = this.inputValue + value[this.structure.propertyURI]

      //     this.guid = value['@guid']
      //   }
      // }

      for (let value of data.userValue[this.structure.propertyURI]){
        if (value[this.structure.propertyURI]){
          // store some info about it in the parent about what literal has been used so far
          if (!this.parentStructureObj.multiLiteral){
            this.parentStructureObj.multiLiteral={}
          }

          if (!this.parentStructureObj.multiLiteral[value['@guid']]){
            // console.log(value[this.structure.propertyURI], 'not exist, setting its value')
            this.parentStructureObj.multiLiteral[value['@guid']] = value[this.structure.propertyURI]
            this.inputValue = value[this.structure.propertyURI]  
            this.guid = value['@guid']
            break
          }else{
            // if it is already in there it was taken by a previous copy of this literal property
            // console.log(value[this.structure.propertyURI], 'does alraedy exist, ')
          }      
        }
      }




    }


    // look at the config file to understand this flag
    if (config.profileHacks.agentsHideManualRDFLabelIfURIProvided.enabled){
      if (this.parentStructureObj && this.parentStructureObj.propertyURI == 'http://id.loc.gov/ontologies/bibframe/agent'){
        if (this.structure.propertyURI=='http://www.w3.org/2000/01/rdf-schema#label'){
          // always hide it
          // if (bnodeHasURI){

            if (
                !this.parentStructureObj.parentId.includes('Information') &&
                !this.structure.parentId.includes('PubPlace') &&
                !this.structure.parentId.includes('PubName') &&
                !this.structure.parentId.includes(':Provision:')

                
                ){
              this.hideField = true
            }



          // }
        }
      }


    }




    if (this.inputValue == ""){
      this.inputValue = null
    }

    this.inputValueLast = this.inputValue
    this.inputValueOrginal = this.inputValue

    // if it is a dynamic property and no data was populated, hide it
    // if (data.dynamic && this.inputValue == null){
    //   this.hideField = true
    // }
    // if (this.parentStructureObj && this.parentStructureObj.dynamic && this.inputValue == null){
    //   this.hideField = true
    // }



    let d = localStorage.getItem('bfeDiacritics')
    if (d){
      this.diacriticData = JSON.parse(d)
    }



  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

    <!-- <pre>{{JSON.stringify(structure,null,2)}}</pre> -->

<style scoped>

.input-nested{
  width: 95%;
  border:none;
  font-size: 1em;
  padding: 0.1em;
  background: none;
  transition-property: color;
  transition-duration: 500ms;

}
.input-single{
  width: 95%;
  border:none;
  /*height: 90%;*/
  height: auto;
  font-size: 1em;
  padding: 0.5em 0 0 0.1em;
  background: none;
  transition-property: color;
  transition-duration: 500ms;
  line-height: 1.6em;

}

.input-textarea-nested{
  width: 90%;
}

.input-accommodate-diacritics{
  line-height: 1.6em; /* this allows for diacritic ligatures to be visible */

}


.fake-real-button{
  height: 4em;
  min-width: 2.75em;
  background-color: transparent;
  border: none;
  outline: none;
  margin: 0.15em;  
}

.diacritic-modal{
  position: absolute;
  right: 26%;
  width: 25%;
  background-color: white;
  border-radius: 1em;
  box-shadow: 4px 14px 39px -10px rgba(0,0,0,0.75);
  height: 15em;
  z-index: 100;
  padding: 0.5em;  

}

@media all and (max-width: 1450px) {
 .diacritic-modal{
  width: 35%;
 }
}
@media all and (max-width: 1050px) {
 .diacritic-modal{
  width: 45%;
 }
}
.diacritic-modal-script-list{
  margin: 0;
  list-style: none;
}
.diacritic-modal-script-list li{
  display: inline-block;
  list-style: none;
}
.diacritic-modal-script-list li::before{
  content: '';
}

.diacritic-modal table{
  width: 100%;
  font-size: 1.25em;
  border-collapse: collapse;
}

.diacritic-modal tr:hover{
  background-color: #dfe5f1 !important;
  cursor: pointer;
}


.diacritic-modal td:nth-child(2){
  text-align: right;
  padding-right: 0.5em;
}

.diacritic-modal tr:nth-child(even) td{
  background-color: transparent;
}




.diacritic-modal-list-diacritic{
font-weight: bold;
    width: 1em;
    max-width: 1em;
    text-align: center;
    display: inline-block;  
}
.diacritic-list-holder{
  max-height: 13em;
  overflow-y: scroll;
}

textarea{
  border: none;
  overflow: auto;
  outline: none;

  height: 1.25em;
  max-height: 7em;
  width: 100%;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;  
}
.component-container-fake-input:focus-within {
  /*border: solid 1px #718ec3 !important;*/
  /*padding: 2px !important;*/
  background-color: #dfe5f1;
}

.temp-icon-keyboard{
  display: none;
  position: absolute;
  right: 0;
}
.component-container-fake-input:focus-within .temp-icon-keyboard {
  /*border: solid 1px #718ec3 !important;*/
  /*padding: 2px !important;*/
  display: block;
}


.component-container-fake-input-note{
  max-height: 10em;

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
