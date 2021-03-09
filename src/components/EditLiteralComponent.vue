<template>
  <div v-if="nested != true" class="component-container">



    <Keypress key-event="keydown" :multiple-keys="[{keyCode: 68, modifiers: ['ctrlKey','shiftKey'],preventDefault: false}]" @success="openDiacriticSelect" />

    <div class="component-container-title">{{structure.propertyLabel}}</div>
    <div class="component-container-input-container">
        <div v-bind:class="'component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border'" >
          <div style="display: flex;">
            <div style="flex:1">
              <form autocomplete="off">            
                <input  bfeType="EditLiteralComponent-unnested" :id="assignedId" v-on:keydown.enter.prevent="submitField" :name="assignedId" v-on:focus="focused" autocomplete="off" type="text" @keydown="nav" @keyup="change" v-model="inputValue"  class="input-single selectable-input">            
              </form>
            </div>
            <button tabindex="-1" class="temp-icon-keyboard fake-real-button simptip-position-top" :data-tooltip="'Diacritics [CTRL-SHIFT-D]'" @click="openDiacriticSelect"></button>

          </div>
          
        </div>
    </div>
    <div v-if="showDiacritics==true" class="diacritic-modal">
      <ul class="diacritic-modal-script-list">
        <li style="font-weight: bold">Custom</li>
        <li style="color:lightgrey">Other</li>
        <li style="color:lightgrey">Langs</li>
        <li style="color:lightgrey">Here</li>
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





  <div v-else>

        <Keypress key-event="keydown" :multiple-keys="[{keyCode: 68, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="openDiacriticSelect" />

        <div v-bind:class="['component-container-fake-input no-upper-right-border-radius no-lower-right-border-radius no-upper-border', { 'component-container-fake-input-note' : isNoteField(structure.propertyLabel)  }]">
          <div style="display: flex;">
            <div style="flex:1">

              <form autocomplete="off" >
                <div  class="component-nested-container-title">{{structure.propertyLabel}}</div>
                <input v-if="!isNoteField(structure.propertyLabel)"  bfeType="EditLiteralComponent-nested" :id="assignedId" :name="assignedId" v-on:keydown.enter.prevent="submitField" v-on:focus="focused" autocomplete="off" type="text" @keyup="change" @keydown="nav" v-model="inputValue"  class="input-nested selectable-input">
                <textarea v-if="isNoteField(structure.propertyLabel)"  bfeType="EditLiteralComponent-nested" :id="assignedId" :name="assignedId" v-on:keydown.enter.prevent="submitField" v-on:focus="focused" autocomplete="off" type="text" @keyup="change" @keydown="nav" v-model="inputValue"  class="input-nested selectable-input"></textarea>

              </form>
            </div>
            <button tabindex="-1" class="temp-icon-keyboard fake-real-button simptip-position-top" :data-tooltip="'Diacritics [CTRL-SHIFT-D]'" @click="openDiacriticSelect"></button>

          </div>
        </div>
        <div v-if="showDiacritics==true" class="diacritic-modal">
          <ul class="diacritic-modal-script-list">
            <li style="font-weight: bold">Custom</li>
            <li style="color:lightgrey">Other</li>
            <li style="color:lightgrey">Langs</li>
            <li style="color:lightgrey">Here</li>
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


export default {
  name: "EditLiteralComponent",
  components: {
    Keypress: () => import('vue-keypress')    
  },

  props: {
    structure: Object,
    parentStructure: Array,
    profileCompoent: String,
    profileName: String,
    activeTemplate: Object,

    nested: Boolean
  },

  methods: {

    // this stores the active input at the global var level so it knows how to tab forward
    focused: function(event){     
      this.$store.dispatch("setActiveInput", { self: this, id: event.target.id, profileCompoent: this.profileCompoent, profileName: this.profileName }).then(()=>{

        // now add the highlights to the side bars for this field
        uiUtils.focusSidebars()
        // console.log(this.activeInput,event.target.id)


      })
      



    },
    submitField: uiUtils.globalMoveDown,


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

    },


    change: function(event){


      // this resizes the textarea as there is more content
      if (event.target && event.target.localName && event.target.localName == 'textarea'){
        event.target.style.height = ""
        event.target.style.height = event.target.scrollHeight + "px"
      }

      //event.target.style.height='auto'
      // console.log('----')
      // console.log('----')
      // console.log('----')
      // console.log('----')
      // console.log(this.profileCompoent)
      // console.log(this.structure)
      // console.log(this.inputValue)
      // console.log(this.activeTemplate,"Object")
      // console.log('----')
      // console.log('----')
      // console.log('----')
      // console.log('----')
      if (this.inputValue === null) return false
      if (this.inputValue.trim() === '') return false
      this.$store.dispatch("addValueLiteral", { self: this, profileComponet: this.profileCompoent, structure: this.structure, template:this.activeTemplate, value:this.inputValue }).then(() => {
       
      })   


    }



  },
  computed: mapState({
    activeInput: 'activeInput',
    activeProfile: 'activeProfile',
    assignedId (){


      return uiUtils.assignID(this.structure,this.parentStructure)

    },    
  }), 

  data: function() {
    return {

      inputValue: null,
      showDiacritics: false,
      diacriticData: [],
      diacriticDataNav: 0


    }
  },
  created: function(){


    let data = this.activeProfile.rt[this.profileName].pt[this.profileCompoent]
    // console.log(this.structure.propertyURI, "HERE",data.propertyURI)

    // testing something with notes
    if (this.structure.parent.includes('lc:RT:bf2:Noted')){

      
      if (data.userValue['http://id.loc.gov/ontologies/bibframe/note'] && data.userValue['http://id.loc.gov/ontologies/bibframe/note'][this.structure.propertyURI]){
        this.inputValue = data.userValue['http://id.loc.gov/ontologies/bibframe/note'][this.structure.propertyURI]
      }else if (data.userValue['http://id.loc.gov/ontologies/bibframe/note'] && data.userValue['http://id.loc.gov/ontologies/bibframe/note'][data.propertyURI]){
        this.inputValue = data.userValue['http://id.loc.gov/ontologies/bibframe/note'][data.propertyURI]
      }else{

        // it is not a bnode
        if (data.userValue['@type']=='http://id.loc.gov/ontologies/bibframe/Note'){
          this.inputValue = data.userValue[this.structure.propertyURI]
        }



      }

      // unless it is a note on the thing itself




    }else if (data.userValue[this.structure.propertyURI]){
      this.inputValue = data.userValue[this.structure.propertyURI]


    }else if (this.structure.propertyURI === 'http://www.w3.org/2000/01/rdf-schema#label'){

      // check to see if it exists in the bnode
      if (data.userValue[data.propertyURI] && data.userValue[data.propertyURI][this.structure.propertyURI]){
        this.inputValue = data.userValue[data.propertyURI][this.structure.propertyURI]
      }

      
      // console.log('no',data,data.propertyURI)
      
    }




    // }else if (data.userValue[data.propertyURI] && data.userValue[data.propertyURI][this.structure.propertyURI]){
    //   this.inputValue = data.userValue[data.propertyURI][this.structure.propertyURI]
    // }    

    // }else if (data.userValue['http://id.loc.gov/ontologies/bibframe/note'] && data.userValue['http://id.loc.gov/ontologies/bibframe/note'][this.structure.propertyURI]){
    //   this.inputValue = data.userValue['http://id.loc.gov/ontologies/bibframe/note'][this.structure.propertyURI]
    // }
    // bad idea
    // }else if (this.structure.propertyURI === 'http://www.w3.org/2000/01/rdf-schema#label' && data.userValue[data.propertyURI]){
    //   this.inputValue = data.userValue[data.propertyURI]
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
  font-size: 1.5em;
  padding: 0.1em;
  background: none;
}
.input-single{
  width: 95%;
  border:none;
  /*height: 90%;*/
  font-size: 1.5em;
  padding: 0.5em 0 0 0.1em;
  background: none;
}


.fake-real-button{
  height: 4em;
  min-width: 4em;
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
