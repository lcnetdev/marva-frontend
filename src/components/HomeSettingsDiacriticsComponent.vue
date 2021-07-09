<template>
  <div id="home-settings-diacritics">
    
    <h1>Diacritic Packs</h1>    
    <div>You can only have one enabled at a time:</div>
    <div style="display: flex; background-color: whitesmoke; padding: 5px;">

      <div style="flex:3;">

        <div>Voyager Macro Express Shortcuts</div>
        <details>
          <summary>Show shortcut keys:</summary>
          <table style="border-top:1px solid #c6c9cc">
            <tr v-for="(d,idx) of dPackVoyagerShortCuts" v-bind:key="idx">
              <td>{{d.combo}}</td>
              <td>{{d.nick}} {{(d.name) ? d.name : ''}}</td>
            </tr>
          </table>
        </details>

      </div>
      <div style="flex:1"><input v-model="dPackVoyager" @change="settingsChange" type="checkbox" id="switch" /><label for="switch">Toggle</label></div>

    </div>

    <div style="display: flex; background-color: whitesmoke; padding: 5px;">

      <div style="flex:3;">

        <div>Voyager Diacritic Entry Mode Shortcuts</div>
        <details>
          <summary>Show shortcut keys:</summary>
          <div>
            With this mode you press Control+e to put the input into diacritic mode, then press one of the short cuts listed below.<br><br>
            For example, to add an acute to a letter you would
            <ol>
              <li>Enter the letter, for example "a"</li>
              <li>Press Control+e</li>
              <li>Press they key "b"</li>
            </ol>

          </div>

          <table style="border-top:1px solid #c6c9cc">
            <tr v-for="(d,idx) of dPackVoyagerShortCutsNative" v-bind:key="idx">
              <td>{{d.combo}}</td>
              <td>{{d.nick}} {{(d.name) ? d.name : ''}}</td>
            </tr>
          </table>
        </details>

      </div>
      <div style="flex:1"><input v-model="dPackVoyagerNative" @change="settingsChange" type="checkbox" id="switchNative" /><label for="switchNative">Toggle</label></div>

    </div>


    <hr>

    <h1>Custom Diacritics</h1>

    <h3>Your custom defined diacritics</h3>

    <div class="current-diacritics" v-for="(rule, idx) in locatStorageDiacritics" :key="idx">
      


      <div class="component-container-input-container current-diacritics-display">
        <div v-bind:class="['component-container-fake-input', 'no-lower-right-border-radius']" style="background-color: #eaeaea">
          <form autocomplete="off" >
            <div  class="component-nested-container-title">diacritic</div>
            <input disabled :value="locatStorageDiacritics[idx].letter"  autocomplete="off" type="text" class="input-nested selectable-input">
          </form>
        </div>
        <div style="background-color: #eaeaea" v-bind:class="['component-container-fake-input', 'no-upper-border', 'no-lower-border', 'no-upper-right-border-radius', 'no-lower-right-border-radius']">
          <form autocomplete="off" >
            <div  class="component-nested-container-title">trigger key</div>
            <input disabled :value="'&quot;' +locatStorageDiacritics[idx].trigger + '&quot;'" bfeType="EditLiteralComponent-nested" autocomplete="off" type="text"  class="input-nested selectable-input">
          </form>
        </div>
        <div style="background-color: #eaeaea" v-bind:class="['component-container-fake-input', 'no-upper-border', 'no-upper-right-border-radius']">
          <form autocomplete="off" >
            <div  class="component-nested-container-title">description</div>
            <input disabled :value="locatStorageDiacritics[idx].desc" autocomplete="off" type="text"  class="input-nested selectable-input">
          </form>
        </div>
      </div>

      <div class="current-diacritics-button">
        <button @click="removeExisting(locatStorageDiacritics[idx].keycode)">Remove</button>
      </div>


    </div>

    <hr>

    <h3>Add new definition</h3>

    <details>
        <summary>Help</summary>
        The system provided a quick menu for inserting diacritic characters into a text field. You can add another diacritic to your quick menu below. The "diacritic" field is the character you would like to insert into text, for example é, ü, ø, etc.. The "trigger key" is the key, once the diacritic quick menue is open, that will insert the diacritic charater. Once you are in that field press the key you want to trigger it. The "description" field is a short description of this diacritic mark, like "acute e" or "umlaut u", etc..
    </details>    
    
    <div class="component-container-input-container">

      <div v-bind:class="['component-container-fake-input', 'no-lower-right-border-radius']">
        <form autocomplete="off" >
          <div  class="component-nested-container-title">diacritic</div>
          <input id="newDiacriticDiacritic" bfeType="EditLiteralComponent-nested" v-on:keydown.enter.prevent=""  autocomplete="off" type="text" @keyup="nav" v-model="newCutomDiacriticLetter"  class="input-nested selectable-input">
        </form>
      </div>
      <div v-bind:class="['component-container-fake-input', 'no-upper-border', 'no-lower-border', 'no-upper-right-border-radius', 'no-lower-right-border-radius']">
        <form autocomplete="off" >
          <div  class="component-nested-container-title">trigger key</div>
          <input id="newDiacriticKey" bfeType="EditLiteralComponent-nested" v-on:keydown.enter.prevent=""  autocomplete="off" type="text" @keyup="nav" placeholder="(press the key you want to use to select this diacritic from the menu)" @keypress="selectKeyField" @focus="clearKeyField" v-model="newCutomDiacriticKey"  class="input-nested selectable-input">
        </form>
      </div>
      <div v-bind:class="['component-container-fake-input', 'no-upper-border', 'no-upper-right-border-radius']">
        <form autocomplete="off" >
          <div  class="component-nested-container-title">description</div>
          <input id="newDiacriticDesc" bfeType="EditLiteralComponent-nested" v-on:keydown.enter.prevent=""  autocomplete="off" type="text" @keyup="nav" v-model="newCutomDiacriticDesc"  class="input-nested selectable-input">
        </form>
      </div>

      <button @click="addDiacritic">Add</button>
    </div>

  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"
import diacrticsVoyagerMacroExpress from "@/lib/diacritics/diacritic_pack_voyager_macro_express.json"
import diacrticsVoyagerNative from "@/lib/diacritics/diacritic_pack_voyager_native.json"


export default {
  name: "HomeSettingsDiacriticsComponent",
  components: {
      // Keypress: () => import('vue-keypress')
      
  },
  props: {
  },
  methods: {


    removeExisting(keycode){

      let existing = this.locatStorageDiacritics
      existing = existing.filter((d)=>{ return d.keycode != keycode })
      localStorage.setItem('bfeDiacritics',JSON.stringify(existing))

      this.locatStorageDiacritics = existing

    },

    addDiacritic(){

      if (this.newCutomDiacriticLetter===null || this.newCutomDiacriticLetter.trim() === ""){
        alert("Please fill out the 'diacritic' field")
        return false
      }
      if (this.newCutomDiacriticKeyCode===null || this.newCutomDiacriticKeyCode === "" ){
        alert("Please fill out the 'trigger key' field")
        return false 
      }
      if (this.newCutomDiacriticDesc===null || this.newCutomDiacriticDesc.trim() === ""){
        alert("Please fill out the 'description' field")
        return false
      }

      // add
      let bfeDiacritics = localStorage.getItem('bfeDiacritics')
      if (bfeDiacritics === null){
        bfeDiacritics = []
      }else{
        bfeDiacritics = JSON.parse(bfeDiacritics)
      }

      let newD = {letter: this.newCutomDiacriticLetter, trigger: this.newCutomDiacriticKey.replace('"','').replace('"',''), keycode:this.newCutomDiacriticKeyCode, desc: this.newCutomDiacriticDesc }

      // make sure we don't have that keycoe in use

      if (bfeDiacritics.filter((d)=>{return d.keycode == newD.keycode}).length>0){
          alert('You are already using this trigger key, please pick a different one')
          return false
      }


      bfeDiacritics.push(newD)

      localStorage.setItem('bfeDiacritics',JSON.stringify(bfeDiacritics))

      this.locatStorageDiacritics = bfeDiacritics

      
      this.newCutomDiacriticLetter = null
      this.newCutomDiacriticKey = ""
      this.newCutomDiacriticKeyCode = null
      this.newCutomDiacriticDesc = null
      document.getElementById('newDiacriticDiacritic').focus()

    },

    nav(event){

      if (event.key == 'ArrowDown'){
        if (event.target.id === 'newDiacriticDiacritic') document.getElementById('newDiacriticKey').focus()
        if (event.target.id === 'newDiacriticKey') document.getElementById('newDiacriticDesc').focus()
      }
      if (event.key == 'ArrowUp'){
        if (event.target.id === 'newDiacriticDesc') document.getElementById('newDiacriticKey').focus()
        if (event.target.id === 'newDiacriticKey') document.getElementById('newDiacriticDiacritic').focus()
      }
      if (event.key == 'Enter' && event.target.id === 'newDiacriticDesc'){
        this.addDiacritic()
      }
    

    },

    clearKeyField(){

      this.newCutomDiacriticKey = ""
      this.newCutomDiacriticKeyCode = null


    },

    selectKeyField(event){

      this.newCutomDiacriticKeyCode = event.keyCode
      // this.newCutomDiacriticKey = `"${event.key}" [key code: ${event.keyCode}]`
      this.newCutomDiacriticKey = `"${event.key}"`
      event.preventDefault()      
      
      document.getElementById('newDiacriticDesc').focus()
      return false
    },



    settingsChange(){






      

      this.$store.dispatch("setSettingsDPackVoyager", { self: this, settingsDPackVoyager: this.dPackVoyager }).then(() => {
        
        
        // you can't have everything
        if (this.dPackVoyager && this.dPackVoyagerNative){
          this.dPackVoyagerNative = false
          this.settingsChange()          
        }


      })   


      this.$store.dispatch("setSettingsDPackVoyagerNative", { self: this, settingsDPackVoyagerNative: this.dPackVoyagerNative }).then(() => {
        
        
        // you can't have everything
        if (this.dPackVoyager && this.dPackVoyagerNative){
          this.dPackVoyagerNative = false
          this.settingsChange()
        }


      })   



    }




  },
  computed: mapState({
    profiles: 'profiles',
    profilesLoaded: 'profilesLoaded',
    settingsDPackVoyager: 'settingsDPackVoyager',
    settingsDPackVoyagerNative: 'settingsDPackVoyagerNative',

    // isDiacritics () {
    //   return (this.$route.fullPath==="/settings/diacritics" || this.$route.fullPath==="/settings")
    // },
    // cutomDiacriticsStorage(){

    //   // is the local version of it empty
    //   if (this.locatStorageDiacritics.length==0){
    //     let bfeDiacritics = localStorage.getItem('bfeDiacritics')
    //     if (bfeDiacritics === null){
    //       bfeDiacritics = []
    //     }else{
    //       bfeDiacritics = JSON.parse(bfeDiacritics)
    //     }
    //   }


    //   return JSON.parse(localStorage.getItem('bfeDiacritics'))
    //   return locatStorageDiacritics
    // } 
  }), 

  data: function() {
    return {

      newCutomDiacriticLetter: null,
      newCutomDiacriticKey: null,
      newCutomDiacriticDesc: null,
      newCutomDiacriticKeyCode: null,
      dPackVoyager:true,
      dPackVoyagerNative: false,

      dPackVoyagerShortCuts: [],
      dPackVoyagerShortCutsNative: [],
      locatStorageDiacritics: []

    }
  },
  created: function(){

    let bfeDiacritics = localStorage.getItem('bfeDiacritics')
    if (bfeDiacritics === null){
      bfeDiacritics = []
    }else{
      bfeDiacritics = JSON.parse(bfeDiacritics)
    }


    for (let k in diacrticsVoyagerMacroExpress){
      for (let d of diacrticsVoyagerMacroExpress[k]){
        this.dPackVoyagerShortCuts.push(d)
      }
    }

    for (let k in diacrticsVoyagerNative){
      for (let d of diacrticsVoyagerNative[k]){
        this.dPackVoyagerShortCutsNative.push(d)
      }
    }


    



    this.dPackVoyager = this.settingsDPackVoyager
    this.dPackVoyagerNative = this.settingsDPackVoyagerNative




    this.locatStorageDiacritics = bfeDiacritics

  },
};
</script>


<style scoped>


  input[type=checkbox]{
    height: 0;
    width: 0;
    visibility: hidden;
  }

  label {
    cursor: pointer;
    text-indent: -9999px;
    width: 50px;
    height: 25px;
    background: grey;
    display: block;
    border-radius: 25px;
    position: relative;
  }

  label:after {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    width: 22px;
    height: 22px;
    background: #fff;
    border-radius: 22px;
    transition: 0.3s;
  }

  input:checked + label {
    background: #bada55;
  }

  input:checked + label:after {
    left: calc(100% - 5px);
    transform: translateX(-100%);
  }

  label:active:after {
    width: 45px;
  }

  
  .current-diacritics{
    display: flex;
    margin-bottom: 1em;
  }

  .current-diacritics-display{
    flex:2;
  }

  .current-diacritics-button{
    flex:1;
  }
  .current-diacritics-button button{
   margin-top: 20%;
   margin-left: 35%;
  }



  button{
    margin-top: 1em;
  }

  summary{
    cursor: pointer;
  }
  details{
    margin-bottom: 1em;
  }
  h1{
    margin: 0;
    font-weight: bold;
    font-size:2em;
  }

  .input-single{
  width: 95%;
  border:none;
  height: 90%;
  font-size: 1.5em;
  padding: 0.5em 0 0 0.1em;
  background: none;
}
.input-nested{
  width: 95%;
  border:none;
  font-size: 1.5em;
  padding: 0.1em;
  background: none;
}
.component-container-fake-input:focus-within {
  /*border: solid 1px #718ec3 !important;*/
  /*padding: 2px !important;*/
  background-color: #dfe5f1;
}
input{
  outline:none;
}

  #home-settings-diacritics{
    padding:2em; 
  }
  
</style>
