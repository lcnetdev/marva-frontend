<template>
  
  <div v-if="nested == false && hideField == false" :class="'component-container' + ' component-container-' + settingsDisplayMode">
   
    <Keypress key-event="keydown" :multiple-keys="[{keyCode: 68, modifiers: ['shiftKey','ctrlKey','altKey'],preventDefault: false}]" @success="openDiacriticSelect" />
    <Keypress key-event="keydown" :multiple-keys="[{keyCode: 86, modifiers: ['shiftKey','ctrlKey','altKey'],preventDefault: true}]" @success="openDiacriticSelect" />


    <div :class="'component-container-title' + ' component-container-title-' + settingsDisplayMode ">{{structure.propertyLabel}} <EditLabelRemark :remark="structure.remark" /></div>
    <div :class="'component-container-input-container' + ' component-container-input-container-' + settingsDisplayMode">

        <div v-for="(inputV,idx) in inputValue" :key="`input_${idx}`" v-bind:class="'component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border'">
          <div style="display: flex; position: relative;">
            <div style="flex:1">
              <form autocomplete="off">    
                <div style="position: absolute;" v-if="settingsDisplayMode=='compact'" class="component-nested-container-title">
                  <span>{{structure.propertyLabel}}</span>                  
                </div>
                <input  v-if="!isNoteField(structure.propertyLabel, inputV.value)" bfeType="EditLiteralComponent-unnested" :id="assignedId + '_' + idx" :data-guid="inputV.guid" v-on:keydown.enter.prevent="submitField" :name="assignedId" :ref="'input'+ '_' + inputV.guid" v-on:focus="focused" v-on:blur="blured" autocomplete="off" type="text" @keydown="nav" @keyup="change($event,inputV)" v-model="inputV.value" :class="['input-single', {'selectable-input': (isMini==false), 'selectable-input-mini':(isMini==true), 'input-accommodate-diacritics': (containsNonLatinCodepoints(inputV.value))}]">            
                <textarea div="auto" v-if="isNoteField(structure.propertyLabel, inputV.value)" style="height:36px" bfeType="EditLiteralComponent-unnested" :id="assignedId + '_' + idx" :data-guid="inputV.guid" :name="assignedId" v-on:keydown.enter.prevent="submitField" :ref="'input'+ '_' + inputV.guid" v-on:focus="focused" v-on:blur="blured" autocomplete="off" type="text" @keyup="change($event,inputV)" @keydown="nav" v-model="inputV.value"  :class="['input-single', 'input-textarea-nested', {'selectable-input': (isMini==false), 'selectable-input-mini':(isMini==true),'input-accommodate-diacritics-textarea': (containsNonLatinCodepoints(inputV.value))}]"></textarea>
              

              </form>
            </div>
            <button tabindex="-1" class="temp-icon-keyboard fake-real-button simptip-position-top" :data-guid="inputV.guid" :data-tooltip="'Diacritics [CTRL-ALT-D]'" @click="openDiacriticSelect"></button>
            <button tabindex="-1" class="temp-icon-expand fake-real-button simptip-position-top" :data-guid="inputV.guid" :data-tooltip="'Editor [CTRL-ALT-SHIFT-V]'" @click="openEditor"></button>

          </div>   
        </div>






    </div>
    <div v-if="showDiacritics==true" class="diacritic-modal">
      <div style="float: right;">[x]</div>
      <ul class="diacritic-modal-script-list">
        <li style="font-weight: bold">Custom</li>


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



    <div :id="assignedId"  v-bind:class="['modaloverlay',{'modal-display':showEditor}]">
      <div v-bind:class="['modal']">

        <div>


          <div class="modal-content">

              <EditLiteralEditor ref="literalEditor" :initalValue="showEditorValue" @closeEditor="closeEditor" @updateFromEditor="updateFromEditor"/>

          </div> <!--- end modal-content --->
          

        </div>
      </div>
    </div>






  </div>





  <div v-else-if="hideField == false">






        <Keypress key-event="keydown" :multiple-keys="[{keyCode: 68, modifiers: ['shiftKey','ctrlKey','altKey'],preventDefault: true}]" @success="openDiacriticSelect" />
        <Keypress key-event="keydown" :multiple-keys="[{keyCode: 86, modifiers: ['shiftKey','ctrlKey','altKey'],preventDefault: true}]" @success="openEditor" />
       <Keypress key-event="keydown" :multiple-keys="[{keyCode: 90, modifiers: ['shiftKey','ctrlKey','altKey'],preventDefault: true}]" @success="addAnotherLiteral" />


        <div v-for="(inputV,idx) in inputValue" :key="`input_${idx}`" v-bind:class="['component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border', { 'component-container-fake-input-note' : isNoteField(structure.propertyLabel, inputV.value)  }]" >
          <div style="display: flex; position: relative;">
            <div style="flex:1">
              <form autocomplete="off" >
                <div  class="component-nested-container-title">
                  <span v-if="settingsDisplayMode=='compact'">{{parentStructureObj.propertyLabel}} -- </span>
                  <span>{{structure.propertyLabel}}</span>                  
                </div>
                <input v-if="!isNoteField(structure.propertyLabel, inputV.value)"   :ref="'input'+ '_' + inputV.guid"  :data-guid="inputV.guid"  bfeType="EditLiteralComponent-nested" :id="assignedId + '_' + idx"  :name="assignedId" v-on:keydown.enter.prevent="submitField" v-on:focus="focused" v-on:blur="blured" autocomplete="off" type="text" @keyup="change($event,inputV)" @keydown="nav" v-model="inputV.value"  :class="['input-nested', {'selectable-input': (isMini==false), 'selectable-input-mini':(isMini==true),'input-accommodate-diacritics': (containsNonLatinCodepoints(inputV.value))}]">
                <textarea dir="auto" v-if="isNoteField(structure.propertyLabel, inputV.value)" :ref="'input'+ '_' + inputV.guid"  :data-guid="inputV.guid"  bfeType="EditLiteralComponent-nested" :id="assignedId + '_' + idx"  :name="assignedId" v-on:keydown.enter.prevent="submitField" v-on:focus="focused" v-on:blur="blured" autocomplete="off" type="text" @keyup="change($event,inputV)" @keydown="nav" v-model="inputV.value"  :class="['input-nested', 'input-textarea-nested', {'selectable-input': (isMini==false), 'selectable-input-mini':(isMini==true),'input-accommodate-diacritics-textarea': (containsNonLatinCodepoints(inputV.value))}]"></textarea>
              </form>
            </div>
            
            <button tabindex="-1" class="temp-icon-keyboard fake-real-button simptip-position-top" :data-guid="inputV.guid" :data-tooltip="'Diacritics [CTRL-ALT-SHIFT-D]'" @click="openDiacriticSelect"></button>
            <button tabindex="-1" class="temp-icon-expand fake-real-button simptip-position-top" :data-guid="inputV.guid" :data-tooltip="'Editor [CTRL-ALT-SHIFT-V]'" @click="openEditor"></button>
     
            <button v-if="showAddAddditonalLiteralButton" tabindex="-1" class="temp-icon-add fake-real-button simptip-position-top" :data-guid="inputV.guid" :data-tooltip="'Add Literal [CTRL-ALT-SHIFT-Z]'" @click="addAnotherLiteral"></button>


          </div>
        </div>




        <div v-if="showDiacritics==true" class="diacritic-modal">
          <div style="float: right; cursor: pointer;" @click="showDiacritics=false">[x]</div>

          <ul class="diacritic-modal-script-list">
            <li style="font-weight: bold">Custom</li>
<!--             <li style="color:lightgrey">Other</li>
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



    <div :id="assignedId"  v-bind:class="['modaloverlay',{'modal-display':showEditor}]">
      <div v-bind:class="['modal']">

        <div>


          <div class="modal-content">

              <EditLiteralEditor ref="literalEditor" :initalValue="showEditorValue" @closeEditor="closeEditor" @updateFromEditor="updateFromEditor"/>

          </div> <!--- end modal-content --->
          

        </div>
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
import EditLiteralEditor from "@/components/EditLiteralEditor.vue";
import EditLabelRemark from "@/components/EditLabelRemark.vue";


const short = require('short-uuid');




export default {
  name: "EditLiteralComponent",
  components: {
    EditLiteralEditor,
    EditLabelRemark,
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
    level: Number,
    propertyPath: Array
  },

  methods: {

    addAnotherLiteral: function(){

      this.inputValue.push({value:'',guid:'new_' + short.generate()})
    },

    closeEditor: function(){


      this.showEditor = false
      this.$store.dispatch("enableMacroNav")

    },

    updateFromEditor: function(value){



      if (!this.$refs[`input_${this.showDiacriticsGuid}`]){
        return false
      }
      if (this.$refs[`input_${this.showDiacriticsGuid}`][0].getAttribute('id') != this.activeInput){
        return false
      }



      this.showEditor = false

      this.$store.dispatch("enableMacroNav")

      // also kick off the save function
      for (let inputV of this.inputValue){
        
        if (inputV.guid == this.showDiacriticsGuid){
          inputV.value = value
          this.change({}, inputV)
        }
      }



    },





    containsNonLatinCodepoints: function(s) {
        return /[^\u0000-\u00ff]/.test(s); // eslint-disable-line
    },

    blured: function(){

      this.$store.dispatch("enableMacroNav")

    },

    // this stores the active input at the global var level so it knows how to tab forward
    focused: function(event){     

      // when we nav into a literal and its a text area type then turn off the global nav and we will handel it internally
      // this allows for default keyboard navigation inside the text area
      if (event && event.target && event.target.tagName === 'TEXTAREA'){
        this.$store.dispatch("disableMacroNav")

        // resize the field to accomdate the value
        // event.target.style.height = ""
        // event.target.style.height = event.target.scrollHeight + "px"



      } 

   
      this.$store.dispatch("setActiveInput", { self: this, id: event.target.id, profileCompoent: this.profileCompoent, profileName: this.profileName }).then(()=>{
        // now add the highlights to the side bars for this field
        this.$nextTick(()=>{
          uiUtils.focusSidebars()
        })
      })
      



    },
    submitField: uiUtils.globalMoveDown,


    insertUnicodeHex: function(hex){

      this.inputValue = String.fromCodePoint(hex);


    },




    isNoteField: function(label,value){



      if (this.settingsTreatLikeNoteFields && this.settingsTreatLikeNoteFields == 'NOTE_FIELDS'){

        if (label == 'Note Text') return true
        if (label == 'Note') return true
        if (label == 'Contents note') return true
        if (label == 'Summary') return true

      }else if(this.settingsTreatLikeNoteFields && this.settingsTreatLikeNoteFields == 'LARGE_FIELDS'){

        if (value.length>=50) return true

      }else if(this.settingsTreatLikeNoteFields && this.settingsTreatLikeNoteFields == 'ALL_FIELDS'){
        return true
      }






      return false
    },


    openEditor: function(event){
      
      if (!event.target && event.event){        
        event = event.event
      }      
      this.showDiacriticsGuid=event.target.dataset.guid
      // we are using global dicratics so stop if this is one of the other components and not this one
      if (!this.$refs[`input_${this.showDiacriticsGuid}`]){
        return false
      }
      if (this.$refs[`input_${this.showDiacriticsGuid}`][0].getAttribute('id') != this.activeInput){
        return false
      }

      // showDiacriticsGuid

      this.$store.dispatch("disableMacroNav")
      
      this.showEditorValue=this.$refs[`input_${this.showDiacriticsGuid}`][0].value
      
      this.showEditor=true



      this.$nextTick(()=>{
        document.getElementById('literal-editor-textarea').focus()
        this.$refs.literalEditor.loadDataFromInput(this.$refs[`input_${this.showDiacriticsGuid}`][0].value)
      })


      // // if they acticated it via button then put the focus back on the input text box to recive key commands
      // if (event && event.target && event.target.localName && event.target.localName == 'button'){
      //   if (event.target.parentNode.querySelector('input')){
      //     event.target.parentNode.querySelector('input').focus()
      //   }else if (event.target.parentNode.querySelector('textarea')){
      //     event.target.parentNode.querySelector('textarea').focus()
      //   }
      // }



    },


   
    openDiacriticSelect: function(event){
      
      
      if (!event.target && event.event){        
        event = event.event
      }      
      this.showDiacriticsGuid=event.target.dataset.guid
      
      // we are using global dicratics so stop if this is one of the other components and not this one
      if (!this.$refs[`input_${this.showDiacriticsGuid}`]){
        return false
      }
      if (this.$refs[`input_${this.showDiacriticsGuid}`][0].getAttribute('id') != this.activeInput){
        return false
      }

      // showDiacriticsGuid

      this.$store.dispatch("disableMacroNav")
      this.showDiacritics=true

      this.$nextTick(()=>{
        this.$refs.diacriticTable[this.diacriticDataNav].style.backgroundColor="#dfe5f1"
      })


      // if they acticated it via button then put the focus back on the input text box to recive key commands
      if (event && event.target && event.target.localName && event.target.localName == 'button'){
        if (event.target.parentNode.querySelector('input')){
          event.target.parentNode.querySelector('input').focus()
        }else if (event.target.parentNode.querySelector('textarea')){
          event.target.parentNode.querySelector('textarea').focus()
        }
      }



    },

    diacriticSelect: function(event){
      

      // depending on where they click the parent maybe the td or it may be the tr where the data-id attrubture is storeing the trigger 
      let pos = (event.target.parentNode.dataset.id) ? event.target.parentNode.dataset.id : event.target.parentNode.parentNode.dataset.id
      let insertAt = false
      
      
      for (let inputV of this.inputValue){

        if (inputV.guid == this.showDiacriticsGuid){

          insertAt = inputV.value.length
          if (this.$refs[`input_${this.showDiacriticsGuid}`] && this.$refs[`input_${this.showDiacriticsGuid}`][0] && this.$refs[`input_${this.showDiacriticsGuid}`][0].selectionStart){
            insertAt=this.$refs[`input_${this.showDiacriticsGuid}`][0].selectionStart
          }
      
          inputV.value = inputV.value.substring(0, insertAt) + this.diacriticData[pos].letter + inputV.value.substring(insertAt);

        }

      }



      // if (this.inputValue){
      //   this.inputValue = this.inputValue + this.diacriticData[pos].letter
      // }else{
      //   this.inputValue = this.diacriticData[pos].letter
      // }


      // focus back on the input
      this.$nextTick(()=>{
        
        // focus back on the element,  but also set the cursor at the point we inserted
        if (insertAt){
        
          document.getElementById(this.$refs[`input_${this.showDiacriticsGuid}`][0].getAttribute('id')).setSelectionRange(insertAt+1,insertAt+1)
        }
        document.getElementById(this.$refs[`input_${this.showDiacriticsGuid}`][0].getAttribute('id')).focus()
        

        this.showDiacriticsGuid=null
        this.showDiacritics=false
        this.$store.dispatch("enableMacroNav")

        // also kick off the save function
        for (let inputV of this.inputValue){
          if (inputV.guid == this.showDiacriticsGuid){
            this.change(event, inputV)
          }
        }






      })




    },

    nav: function(event){


      
      let guid = event.target.dataset.guid
      // turn it on
      if (this.settingsDPackVoyagerNative && this.diacrticsVoyagerNativeMode == false && event.code == 'KeyE' && event.ctrlKey == true){
        this.$refs["input_"+guid].style.color="blue"
        this.diacrticsVoyagerNativeMode = true
        event.preventDefault()
        return false
      // turn it off
      }else if (this.settingsDPackVoyagerNative && this.diacrticsVoyagerNativeMode == true && event.code == 'KeyE' && event.ctrlKey == true){
        this.diacrticsVoyagerNativeMode = false
        window.setTimeout(()=>{
          this.$refs["input_"+guid].style.color="black"
        },500)
        event.preventDefault()
        return false
      // execute it
      }









      if (event && event.key && this.showDiacritics == true){


        if (event.key == 'Escape'){
          this.showDiacritics=false
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
            this.$refs.diacriticTable[this.diacriticDataNav].scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"})
        }else if (event.key == 'Enter'){

          let letter = this.diacriticData[this.diacriticDataNav].letter
          
          let useGuid = guid
          if (!useGuid){
            useGuid=this.showDiacriticsGuid
          }
          let insertAt = false
          for (let inputV of this.inputValue){
            if (inputV.guid == useGuid){
              insertAt = inputV.value.length
              if (this.$refs[`input_${useGuid}`] && this.$refs[`input_${useGuid}`][0] && this.$refs[`input_${useGuid}`][0].selectionStart){
                insertAt=this.$refs[`input_${useGuid}`][0].selectionStart
              }
              inputV.value = inputV.value.substring(0, insertAt) + letter + inputV.value.substring(insertAt);

              
              if (insertAt){
                this.$nextTick(()=>{
                  this.$refs[`input_${useGuid}`][0].setSelectionRange(insertAt+1,insertAt+1)

                  this.$nextTick(()=>{
                    this.$refs[`input_${useGuid}`][0].focus()
                  })

                })
              }else{

                  this.$nextTick(()=>{
                    this.$refs[`input_${useGuid}`][0].focus()
                  })

              }
              



            }
          }


          this.showDiacritics=false
          this.$store.dispatch("enableMacroNav")


        }else{

          for (let key of this.diacriticData){
            if (event.key == key.trigger){

              
              let useGuid = guid
              if (!useGuid){
                useGuid=this.showDiacriticsGuid
              }
              let insertAt = false

              for (let inputV of this.inputValue){
                if (inputV.guid == useGuid){
                  insertAt = inputV.value.length
                  if (this.$refs[`input_${useGuid}`] && this.$refs[`input_${useGuid}`][0] && this.$refs[`input_${useGuid}`][0].selectionStart){
                    insertAt=this.$refs[`input_${useGuid}`][0].selectionStart
                  }
                  inputV.value = inputV.value.substring(0, insertAt) + key.letter + inputV.value.substring(insertAt);

                  if (insertAt){
                    this.$nextTick(()=>{
                      this.$refs[`input_${useGuid}`][0].setSelectionRange(insertAt+1,insertAt+1)

                      this.$nextTick(()=>{
                        this.$refs[`input_${useGuid}`][0].focus()
                      })

                    })
                  }else{

                      this.$nextTick(()=>{
                        this.$refs[`input_${useGuid}`][0].focus()
                      })
                    
                  }
                  


                }
              }



              // if (this.inputValue){
              //   this.inputValue = this.inputValue + key.letter
              // }else{
              //   this.inputValue = key.letter
              // }
              
              this.showDiacritics=false
              this.$store.dispatch("enableMacroNav")              
            }            
          }


        }

        event.preventDefault()
        return false

      }




      if (event && (event.key == 'ArrowDown' || event.key == 'ArrowUp') && this.showDiacritics == false){
        
        
        if (event.target.tagName === 'TEXTAREA' && this.disableMacroKeyNav){

        

          // nothing in the field then enable macro and nav it
          if (event.target.value.length === 0){
              
              this.$store.dispatch("enableMacroNav").then(()=>{
                if (event.key == 'ArrowDown'){
                  uiUtils.globalMoveDown()
                }else{
                  uiUtils.globalMoveUp()
                }
              })


          }else{

            // if its not empty are we at the very start of it or at the very end of it?
            if (event.target.selectionStart === 0 && event.key == 'ArrowUp'){

              this.$store.dispatch("enableMacroNav").then(()=>{
                  uiUtils.globalMoveUp()            
              })

            }else if (event.target.selectionStart === event.target.value.length && event.key == 'ArrowDown'){

              this.$store.dispatch("enableMacroNav").then(()=>{
                  uiUtils.globalMoveDown()            
              })

            }


          }



        }
        
      }




    },

    /**
    * Change the value of the field, via state change and parseProfile method
    * @param {object} event - the event obj passed
    * @param {string} inputV - the current value of the input element
    * @return {void}
    */
    change: function(event,inputV){


      // find where we are inserting the value into
      // default to the end of the string
      let insertAt = inputV.value.length
      
      if (this.$refs[`input_${inputV.guid}`] && this.$refs[`input_${inputV.guid}`][0] && this.$refs[`input_${inputV.guid}`][0].selectionStart){
        insertAt=this.$refs[`input_${inputV.guid}`][0].selectionStart
      }            


      if (diacrticsVoyagerMacroExpress[event.code] && this.settingsDPackVoyager){

        

        for (let macro of diacrticsVoyagerMacroExpress[event.code]){

          if (event.ctrlKey == macro.ctrlKey && event.altKey == macro.altKey && event.shiftKey == macro.shiftKey){

            
            event.preventDefault();

            this.$refs["input"+ '_' + inputV.guid][0].style.color="blue"
            window.setTimeout(()=>{
              this.$refs["input"+ '_' + inputV.guid][0].style.color="black"
            },500)

            if (!macro.combining){

              // there is behavior where if it is a digit shortcut the numerial is still sent
              // so if thats the case remove the last digit from the value
              if (event.code.includes('Digit')){
                // if it is in fact a digit char then remove it
                if (inputV.value.charAt(insertAt) == event.code.replace('Digit','')){
                  // remove the last char
                  // inputV.value = inputV.value.slice(0, -1); 
                  inputV.value = inputV.value.slice(0,insertAt) + inputV.value.slice(insertAt)

                }
              }

              // same for euqal key
              if (event.code == 'Equal'){
                if (inputV.value.charAt(inputV.value.length-1) == '='){
                  // remove the last char
                  // inputV.value = inputV.value.slice(0, -1);
                  inputV.value = inputV.value.slice(0,insertAt) + inputV.value.slice(insertAt)
 
                }
              }
              // same for Backquote key

              if (event.code == 'Backquote'){

                if (inputV.value.charAt(inputV.value.length-1) == '`'){
                  // remove the last char
                  // inputV.value = inputV.value.slice(0, -1);
                  inputV.value = inputV.value.slice(0,insertAt) + inputV.value.slice(insertAt) 
                }

              }


              // it is not a combining unicode char so just insert it into the value
              if (inputV.value){
                // inputV.value=inputV.value+macro.codeEscape

                inputV.value = inputV.value.substring(0, insertAt) + macro.codeEscape + inputV.value.substring(insertAt);


                if (insertAt){
                  this.$nextTick(()=>{
                    this.$refs[`input_${inputV.guid}`][0].setSelectionRange(insertAt+1,insertAt+1)

                    this.$nextTick(()=>{
                      this.$refs[`input_${inputV.guid}`][0].focus()
                    })

                  })
                }else{

                    this.$nextTick(()=>{
                      this.$refs[`input_${inputV.guid}`][0].focus()
                    })
                  
                }




              }else{
                inputV.value = macro.codeEscape
              }
              
            }else{


              // same for Backquote key

              if (event.code == 'Backquote'){

                if (inputV.value.charAt(inputV.value.length-1) == '`'){
                  // remove the last char
                  inputV.value = inputV.value.slice(0, -1); 
                }

              }


              // little cheap hack here, on macos the Alt+9 makes ª digits 1-0 do this with Alt+## but we only 
              // have one short cut that uses Alt+9 so just remove that char for now
              inputV.value=inputV.value.replace('ª','')

              inputV.value = inputV.value.substring(0, insertAt) + macro.codeEscape + inputV.value.substring(insertAt);
              // inputV.value=inputV.value+macro.codeEscape

              document.getElementById(this.$refs[`input_${inputV.guid}`][0].getAttribute('id')).setSelectionRange(insertAt+1,insertAt+1)
              document.getElementById(this.$refs[`input_${inputV.guid}`][0].getAttribute('id')).focus()


              if (insertAt){
                this.$nextTick(()=>{
                  this.$refs[`input_${inputV.guid}`][0].setSelectionRange(insertAt+1,insertAt+1)

                  this.$nextTick(()=>{
                    this.$refs[`input_${inputV.guid}`][0].focus()
                  })

                })
              }else{

                  this.$nextTick(()=>{
                    this.$refs[`input_${inputV.guid}`][0].focus()
                  })
                
              }
              




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
        inputV.value = inputV.value.slice(0, -1); 

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
          
          if (inputV.value){
            // inputV.value=inputV.value+useMacro.codeEscape
            inputV.value = inputV.value.substring(0, insertAt) + useMacro.codeEscape + inputV.value.substring(insertAt);


          }else{
            inputV.value = useMacro.codeEscape
          }

        }else{
              // inputV.value=inputV.value+useMacro.codeEscape
              inputV.value = inputV.value.substring(0, insertAt) + useMacro.codeEscape + inputV.value.substring(insertAt);

        }

      }


      let useGuid = inputV.guid
      if (inputV.guid.startsWith('new_')){
        useGuid = null
      }


      // find the previous value
      let previousValue = null
      if (this.inputValueLast && this.inputValueLast.length>0){
        for (let preval of this.inputValueLast){
          if (preval.guid == inputV.guid){
            previousValue = preval.value
          }
        }
      }

 


      // if its empty don't do anytihng, unless its newly empty, meaning they just deleted the whole thing
      if (inputV.value === null) return false
      if (inputV.value.trim() === '' && (previousValue === '' || previousValue === null)) return false

      
      // don't update if nothing changed or havent entered anythign yet...
      if (inputV.value == null){
           return false
      }

      if (JSON.stringify(this.inputValue) == this.inputValueLast){        
        return false
      }

      // if they "blank" out the value by just puttin a space for some reason then make it empty string
      if (inputV.value.trim() === '' && previousValue !== ''){
        inputV.value = inputV.value.trim()
      }


      // this resizes the textarea as there is more content
      if (event.target && event.target.localName && event.target.localName == 'textarea'){
        event.target.style.height = ""
        event.target.style.height = event.target.scrollHeight + "px"
      }



      let parentURI = null
      if (this.parentStructureObj){
        parentURI = this.parentStructureObj.propertyURI
      }

    
      // don't fire on command keys, heres a few common ones to ignore
      // when they do SHIFT+A the A gets its own keyup and so does the shift, so ignore the shift for example
      if (event && event.key && ['Shift','Control','Meta','Alt','CapsLock'].indexOf(event.key) > -1){
        return false
      }

      this.$store.dispatch("setValueLiteral", { self: this, ptGuid: this.ptGuid, guid: useGuid, parentURI:parentURI, URI: this.structure.propertyURI, value: inputV.value, propertyPath: this.propertyPath }).then((newGuid) => {
        // this.inputValueLast = this.inputValue
        // if this is here then we created a new value, store it for future edits
        if(newGuid){
          
          inputV.guid = newGuid
        }

        // but if it is explictly set to false that means we just unset the value, so reset the guid here
        if (newGuid===false){
          inputV.guid = 'new_' + short.generate()
        }

        this.inputValueLast = JSON.parse(JSON.stringify(this.inputValue))


      })   





    },



    refreshInputDisplay: function(){

      let data
      if (this.isMini){
        data = this.activeProfileMini.rt[this.profileName].pt[this.profileCompoent] 
      }else{
        data = this.activeProfile.rt[this.profileName].pt[this.profileCompoent]  
      }

      // this will keep track of all the guids for data found
      // it is used below to reconcile the component cache of the current values and
      // what is in state, which becomes unaligned when things like undos happen
      let allGuidsFound = []

      // if (this.profileCompoent=='http://id.loc.gov/ontologies/bflc/relationship|Input Transcribed Series'){
      //   console.log('http://id.loc.gov/ontologies/bflc/relationship --- DATA', this.profileCompoent)
      //   console.log(data)
      // }
      // depending on the depth 
      // we know where to look because we have the property path
      if (this.propertyPath.length === 1){
          let L0URI = this.propertyPath[0].propertyURI
          if (data.userValue[L0URI]){
              for (let uv of data.userValue[L0URI]){
                    allGuidsFound.push(uv['@guid'])
                    // check that it doesn't yet exist, if it does just update value
                    if (this.inputValue.map((v)=> {return v.guid} ).includes(uv['@guid'])){
                        for (let iv of this.inputValue){
                          if (iv.guid == uv['@guid']){
                            
                            if (typeof uv[L0URI] == 'object' && uv[L0URI] !== null && uv[L0URI][0][L0URI] ){
                              iv.value = uv[L0URI][0][L0URI]
                            }else{
                              iv.value = uv[L0URI]
                            }

                          }
                        }                  
                    }else{

                      if (typeof uv[L0URI] == 'object' && uv[L0URI] !== null && uv[L0URI][0][L0URI] ){
                        this.inputValue.push({value:uv[L0URI][0][L0URI], guid:uv['@guid'] })
                      }else{
                        this.inputValue.push({value:uv[L0URI], guid:uv['@guid'] })
                      }
                    }
              }
          }
      }else if (this.propertyPath.length === 2){
          let L0URI = this.propertyPath[0].propertyURI
          let L1URI = this.propertyPath[1].propertyURI
          if (data.userValue[L0URI] && data.userValue[L0URI][0] && data.userValue[L0URI][0][L1URI]){
              for (let uv of data.userValue[L0URI][0][L1URI]){
                    allGuidsFound.push(uv['@guid'])
                    // check that it doesn't yet exist, if it does just update value
                    if (this.inputValue.map((v)=> {return v.guid} ).includes(uv['@guid'])){
                        for (let iv of this.inputValue){
                          if (iv.guid == uv['@guid']){
                            iv.value = uv[L1URI]
                          }
                        }                  
                    }else{
                      this.inputValue.push({value:uv[L1URI], guid:uv['@guid'] })
                    }
              }
          }
      }else if (this.propertyPath.length === 3){
          let L0URI = this.propertyPath[0].propertyURI
          let L1URI = this.propertyPath[1].propertyURI
          let L2URI = this.propertyPath[2].propertyURI

          if (data.userValue[L0URI] && data.userValue[L0URI][0] && data.userValue[L0URI][0][L1URI] && data.userValue[L0URI][0][L1URI][0] && data.userValue[L0URI][0][L1URI][0][L2URI]){
              for (let uv of data.userValue[L0URI][0][L1URI][0][L2URI]){
                    allGuidsFound.push(uv['@guid'])
                    // check that it doesn't yet exist, if it does just update value
                    if (this.inputValue.map((v)=> {return v.guid} ).includes(uv['@guid'])){
                        for (let iv of this.inputValue){
                          if (iv.guid == uv['@guid']){
                            iv.value = uv[L2URI]
                          }
                        }                  
                    }else{
                      this.inputValue.push({value:uv[L2URI], guid:uv['@guid'] })
                    }
              }
          }

      }else if (this.propertyPath.length === 4){

          let L0URI = this.propertyPath[0].propertyURI
          let L1URI = this.propertyPath[1].propertyURI
          let L2URI = this.propertyPath[2].propertyURI
          let L3URI = this.propertyPath[3].propertyURI

          if (data.userValue[L0URI] && data.userValue[L0URI][0] && data.userValue[L0URI][0][L1URI] && data.userValue[L0URI][0][L1URI][0] && data.userValue[L0URI][0][L1URI][0][L2URI] && data.userValue[L0URI][0][L1URI][0][L2URI][0] && data.userValue[L0URI][0][L1URI][0][L2URI][0][L3URI]){
              for (let uv of data.userValue[L0URI][0][L1URI][0][L2URI][0][L3URI]){
                    allGuidsFound.push(uv['@guid'])
                    // check that it doesn't yet exist, if it does just update value
                    if (this.inputValue.map((v)=> {return v.guid} ).includes(uv['@guid'])){
                        for (let iv of this.inputValue){
                          if (iv.guid == uv['@guid']){
                            iv.value = uv[L3URI]
                          }
                        }                  
                    }else{
                      this.inputValue.push({value:uv[L3URI], guid:uv['@guid'] })
                    }
              }
          }
      }else{
          console.error("Error trying to update literal value but cannot find guid")
      }



      // // test to see if this property exists in the user value at the parent structure / properturi lvl
      // if (this.parentStructureObj && data.userValue[this.parentStructureObj.propertyURI]){
        
      //   for (let parentValueArray of data.userValue[this.parentStructureObj.propertyURI]){
      //     if (parentValueArray[this.structure.propertyURI]){          
      //       for (let childValue of parentValueArray[this.structure.propertyURI]){
      //         if (childValue[this.structure.propertyURI]){
  



      //               allGuidsFound.push(childValue['@guid'])
      //               // check that it doesn't yet exist, if it does just update value
      //               if (this.inputValue.map((v)=> {return v.guid} ).includes(childValue['@guid'])){
      //                   for (let iv of this.inputValue){
      //                     if (iv.guid == childValue['@guid']){
      //                       iv.value = childValue[this.structure.propertyURI]
      //                     }
      //                   }                  
      //               }else{
      //                 this.inputValue.push({value:childValue[this.structure.propertyURI], guid:childValue['@guid'] })
      //               }




      //         }
      //       }
      //     }
      //   }
      // }else if (!this.parentStructureObj && data.userValue[this.structure.propertyURI]){
        
      //   // if it is not a nested template literal then it should be a first lvl one
      //   for (let value of data.userValue[this.structure.propertyURI]){
      //     if (value[this.structure.propertyURI]){
         


      //         allGuidsFound.push(value['@guid'])
      //         // check that it doesn't yet exist, if it does just update value
      //         if (this.inputValue.map((v)=> {return v.guid} ).includes(value['@guid'])){
      //             for (let iv of this.inputValue){
      //               if (iv.guid == value['@guid']){
      //                 iv.value = value[this.structure.propertyURI]
      //               }
      //             }                  
      //         }else{
      //           this.inputValue.push({value:value[this.structure.propertyURI], guid:value['@guid'] })
      //         }




      //     }
      //   }
      // }else if (this.parentStructureObj && this.parentStructureObj.propertyURI == data.userValue['@root'] && data.userValue[this.structure.propertyURI]){


      //   for (let value of data.userValue[this.structure.propertyURI]){
      //     if (value[this.structure.propertyURI]){


      //           allGuidsFound.push(value['@guid'])

      //           // check that it doesn't yet exist, if it does just update value
      //           if (this.inputValue.map((v)=> {return v.guid} ).includes(value['@guid'])){
      //               for (let iv of this.inputValue){
      //                 if (iv.guid == value['@guid']){
      //                   iv.value = value[this.structure.propertyURI]
      //                 }
      //               }                  
      //           }else{
      //             this.inputValue.push({value:value[this.structure.propertyURI], guid:value['@guid'] })
      //           }

      //     }
      //   }

      // }


      // look at the config file to understand this flag
      if (config.profileHacks.agentsHideManualRDFLabelIfURIProvided.enabled){
        if (this.parentStructureObj && this.parentStructureObj.propertyURI == 'http://id.loc.gov/ontologies/bibframe/agent'){
          if (this.structure.propertyURI=='http://www.w3.org/2000/01/rdf-schema#label'){
              if (
                  !this.parentStructureObj.parentId.includes('Information') &&
                  !this.structure.parentId.includes('PubPlace') &&
                  !this.structure.parentId.includes('PubName') &&
                  !this.structure.parentId.includes(':Provision:')                
                  ){
                this.hideField = true
              }
          }
        }


      }


      // if we have more than the default empty value it means we have a value, so remvoe the default blank one
      if (this.inputValue.length>1){
        this.inputValue = this.inputValue.filter((iv) => {return (iv.value!='')})
      }

      // also look to see that the guids in there are really in the data
      // they might be leftovers from when they did an undo command and we need to clean up the inputValue
      this.inputValue = this.inputValue.filter((iv) => {

        if (iv.guid.startsWith('new_')){
          return true
        }

        if (allGuidsFound.indexOf(iv.guid)==-1){
          return false
        }


        return true


      })


      // the did an undo and now there is nothing in the data, make sure there is at least an empty one
      if (this.inputValue.length==0){
        this.inputValue.push({value:'',guid:'new_' + short.generate()})
      }


      
      // check to make sure if it is a rtl lang that there is room for the buttons, so they don't over lap the text
      for (let inputV of this.inputValue){


        // and also clean up any escape chars here
        inputV.value= inputV.value.replace(/&amp;/g, '&');
        

        if (this.rtlRegEx.test(inputV.value)){

          this.$nextTick(()=>{
            this.$refs[`input_${inputV.guid}`][0].classList.add('input-textarea-nested-rtl')
          })

        } 

      }


    }



  },
  computed: mapState({
    activeInput: 'activeInput',
    activeProfile: 'activeProfile',
    activeProfileMini: 'activeProfileMini',
    workingOnMiniProfile: 'workingOnMiniProfile',
    settingsDisplayMode: 'settingsDisplayMode',
    undoCounter: 'undoCounter',
    disableMacroKeyNav: 'disableMacroKeyNav',

    settingsTreatLikeNoteFields: 'settingsTreatLikeNoteFields',
    
    settingsDPackVoyager: 'settingsDPackVoyager',
    settingsDPackVoyagerNative: 'settingsDPackVoyagerNative',
    assignedId (){
      // return uiUtils.assignID(this.structure,this.parentStructure)
      if (this.internalAssignID){
        return this.internalAssignID
      }else{
        this.internalAssignID = uiUtils.assignID(this.structure,this.parentStructure)
        return this.internalAssignID
      }      


    },    

    showAddAddditonalLiteralButton (){


      // does the profile have a literal lang somewhere
      for (let rt in this.activeProfile.rt){
        if (this.activeProfile.rt[rt].hasLiteralLangFields){
          if (config.allowLiteralRepeatForNonRomain.includes(this.structure.propertyURI)){
            return true
          }
          if (this.parentStructureObj && config.allowLiteralRepeatForNonRomain.includes(this.parentStructureObj.propertyURI)){
            return true
          }

        }
      }
      

      return false


    },


  }), 

  watch: {

    // watch when the undoindex changes, means they are undoing redoing, so refresh the
    // value in the acutal input box
    undoCounter: function(){
     
      // put a little delay on it so there is no overlap of when the data value is saving and when it is asikng for the data value
      // to populate this input field
      window.setTimeout(()=>{
        this.refreshInputDisplay()
      },500)

    }


  },

  data: function() {
    return {

      inputValue: [{value:'',guid:'new_' + short.generate()}],
      inputValueLast: null,
      inputValueCombiningDiacritic: null,
      showDiacritics: false,
      showEditor:false,
      showEditorValue:'',
      showDiacriticsGuid: null,
      diacriticData: [],
      diacriticDataNav: 0,
      hideField: false,
      rtlRegEx: /[\u0591-\u07FF]/,
      guid: null,
      initalGuid: null,
      diacrticsVoyagerNativeMode:false,
      internalAssignID: false,
      
    }
  },
  created: function(){

    

    this.refreshInputDisplay()

    // this.settingsTreatLikeNoteFieldsInital = this.settingsTreatLikeNoteFields

    let d = localStorage.getItem('bfeDiacritics')
    if (d){
      this.diacriticData = JSON.parse(d)
    }




      this.$nextTick(()=>{

        for (let inputV of this.inputValue){
          let r = 'input'+ '_' + inputV.guid
          if (this.$refs[r] && this.$refs[r][0] && this.$refs[r][0].tagName == 'TEXTAREA'){
            if (this.$refs[r][0].value.length>0){
              this.$refs[r][0].style.height = "1px";
              this.$refs[r][0].style.height = (0+this.$refs[r][0].scrollHeight)+"px";
            }
          }       
        }

        this.inputValueLast = JSON.parse(JSON.stringify(this.inputValue))
      })




  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

    <!-- <pre>{{JSON.stringify(structure,null,2)}}</pre> -->

<style scoped>



.input-nested{
  width: 95%;
  border:none;
  font-size: 1.5em;
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
  font-size: 1.5em;
  padding: 0.5em 0 0 0.1em;
  background: none;
  transition-property: color;
  transition-duration: 500ms;
  line-height: 1.6em;

}

.input-textarea-nested{
  width: 95%;
}

.input-textarea-nested-rtl{
  width: 80%;
}

.input-accommodate-diacritics{
  line-height: 1.6em; /* this allows for diacritic ligatures to be visible */

}
.input-accommodate-diacritics-textarea{
  padding: 5px;
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
  top: 0%;
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
  overflow: hidden;
  outline: none;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  height: 1.25em;
  font-size: 1.25em !important;
  /*max-height: 7em;*/
  width: 100%;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;  
  resize: none;
}



.component-container-fake-input:focus-within {
  /*border: solid 1px #718ec3 !important;*/
  /*padding: 2px !important;*/
  background-color: #dfe5f1;
}

.temp-icon-keyboard{
  display: none;
  position: absolute;
  right: 45px;
}

.temp-icon-expand{
  display: none;
  position: absolute;
  right: 0;
}
.temp-icon-add{
  display: none;
  position: absolute;
  right: 90px;
}



.component-container-fake-input:focus-within .temp-icon-keyboard {
  /*border: solid 1px #718ec3 !important;*/
  /*padding: 2px !important;*/
  display: block;
}
.component-container-fake-input:focus-within .temp-icon-expand {
  /*border: solid 1px #718ec3 !important;*/
  /*padding: 2px !important;*/  
  display: block;
}
.component-container-fake-input:focus-within .temp-icon-add {
  /*border: solid 1px #718ec3 !important;*/
  /*padding: 2px !important;*/  
  display: block;
}


.component-container-fake-input-note{
  max-height: 500em;

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
