<template>
  <div id="app">
<!--     <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <div v-if="isLoggedIn == false" style="position: fixed; width: 100vw; height: 100vh; top: 0; left: 0; background-color: rgba(0,0,0,0.6); z-index: 1000">
      
      <div style="border: solid 1px #a6acb7; border-radius:0.5em; margin: auto; width: 25%; background-color: white; margin-top: 10%; min-height: 25%; padding: 1em;">
          
          <span style="font-weight: bold;">Hello! Before you start...</span> <div style="margin-top: 1em;">Please enter your cataloger ID and press [Enter] key. This is usually your Windows ID.</div>

          <input @keyup="login" v-model="catInitialsForm" type="text" name="id" autofocus placeholder="Cataloger ID" style="border: solid 1px #a6acb7; font-size: 2em; margin-top: 1em; border-top-right-radius: 0.25em; border-bottom-right-radius: 0.25em; width: 98%;">

      </div>


    </div>

    <div v-if="outOfDate == true" style="position: fixed; width: 100vw; height: 100vh; top: 0; left: 0; background-color: rgba(0,0,0,0.6); z-index: 1000">
      
      <div style="border: solid 1px #a6acb7; border-radius:0.5em; margin: auto; width: 25%; background-color: white; margin-top: 10%; min-height: 25%; padding: 1em;">
          
          <div v-if="systemType=='mac'">
            <h1>Out of Date</h1>
            <div>The editor version open in your browser is out of date. Please do a hard refresh to use the latest version.</div><br>
            <div>On your keyboard press <strong>Cmd</strong> and <strong>Shift</strong> and the letter <strong>R</strong> </div>

          </div>
          <div v-if="systemType=='win'">
            <h1>Out of Date</h1>
            <div>The editor version open in your browser is out of date. Please do a hard refresh to use the latest version.</div><br>
            <div>On your keyboard press <strong>Ctrl</strong> and <strong>F5</strong> </div>

          </div>
          <div v-if="systemType=='other'">
            <h1>Out of Date</h1>
            <div>The editor version open in your browser is out of date. Please do a hard refresh to use the latest version.</div><br>


          </div>

      </div>


    </div>

    
    <router-view />
  </div>
</template>

<style>


#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>


<script>

import { mapState } from 'vuex'
import lookupUtil from "@/lib/lookupUtil"


export default {
  name: "App",
    computed: mapState({
      catInitials: 'catInitials',
      settingsDPackVoyager: 'settingsDPackVoyager',
      region: 'region',


      isLoggedIn: function(){
        if (!this.catInitials){return false}
        if (this.catInitials.trim()===''){return false}  


        return true
      },

      systemType: function(){
        if (navigator.platform.indexOf('Mac') > -1){
          return 'mac'
        }else if (navigator.platform.indexOf('Win') > -1){
          return 'win'
        }else{
          return 'other'
        }


      }


    }),
  data: function() {
    return {

      outOfDate: false,
      catInitialsForm:""

    }
  },


  methods: {

    login: function(event){

      if (event.keyCode === 13) {
        localStorage.setItem('bfeCatInitials',this.catInitialsForm)
        this.$store.dispatch("setCatInitials", { self: this, catInitials: this.catInitialsForm  }).then(() => {
          
        })  

        // this.isLoggedIn=true;

      }


    },


  },

  created: async function () {
  


    if (this.catInitials){
      // this.isLoggedIn=true;   

    }else if (localStorage.getItem('bfeCatInitials')!== null){
      // this.isLoggedIn=true;
      this.$store.dispatch("setCatInitials", { self: this, catInitials: localStorage.getItem('bfeCatInitials') }).then(() => {
        
      })   
    }else{
      // this.isLoggedIn=false;
    }

    if (localStorage.getItem('bfeSettingsDPackVoyagerNative') === 'undefined'){
      localStorage.removeItem('bfeSettingsDPackVoyagerNative')
    }
    if (localStorage.getItem('bfeSettingsDPackVoyager') === 'undefined'){
      localStorage.removeItem('bfeSettingsDPackVoyager')
    }
    if (localStorage.getItem('bfeSettingsLookupsUseTextSubjectEditor') === 'undefined'){
      localStorage.removeItem('bfeSettingsLookupsUseTextSubjectEditor')
    }



    if (localStorage.getItem('bfeSettingsDPackVoyager')!== null){
      this.$store.dispatch("setSettingsDPackVoyager", { self: this, settingsDPackVoyager: JSON.parse(localStorage.getItem('bfeSettingsDPackVoyager')) }).then(() => {
      })   
    }


    if (localStorage.getItem('bfeSettingsDPackVoyagerNative')!== null){
      this.$store.dispatch("setSettingsDPackVoyagerNative", { self: this, settingsDPackVoyagerNative: JSON.parse(localStorage.getItem('bfeSettingsDPackVoyagerNative')) }).then(() => {
      })   
    }


    if (localStorage.getItem('bfeSettingsLookupsUseTextSubjectEditor')!== null){
      console.log("APP Loading, set bfeSettingsLookupsUseTextSubjectEditor to:",localStorage.getItem('bfeSettingsLookupsUseTextSubjectEditor'), JSON.parse(localStorage.getItem('bfeSettingsLookupsUseTextSubjectEditor')))
      this.$store.dispatch("settingsLookupsUseTextSubjectEditor", { self: this, settingsLookupsUseTextSubjectEditor: JSON.parse(localStorage.getItem('bfeSettingsLookupsUseTextSubjectEditor')) }).then(() => {
      })   
    }        

    if (localStorage.getItem('bfeSettingsDisplayMode')!== null){
      console.log("APP Loading, set bfeSettingsDisplayMode to:",localStorage.getItem('bfeSettingsDisplayMode'), localStorage.getItem('bfeSettingsDisplayMode'))
      this.$store.dispatch("settingsDisplayMode", { self: this, settingsDisplayMode: localStorage.getItem('bfeSettingsDisplayMode') }).then(() => {
      })   
    }   


    if (localStorage.getItem('bfeSettingsHideEmptyFields')!== null){
      console.log("APP Loading, set bfeSettingsHideEmptyFields to:",localStorage.getItem('bfeSettingsHideEmptyFields'), JSON.parse(localStorage.getItem('bfeSettingsHideEmptyFields')))
      this.$store.dispatch("settingsHideEmptyFields", { self: this, settingsHideEmptyFields: JSON.parse(localStorage.getItem('bfeSettingsHideEmptyFields')) }).then(() => {
      })   
    } 


    if (localStorage.getItem('bfeSettingsLeftMenuEnriched')!== null){      
      console.log("APP Loading, set bfeSettingsLeftMenuEnriched to:",localStorage.getItem('bfeSettingsLeftMenuEnriched'), JSON.parse(localStorage.getItem('bfeSettingsLeftMenuEnriched')))
      this.$store.dispatch("settingsLeftMenuEnriched", { self: this, settingsLeftMenuEnriched: JSON.parse(localStorage.getItem('bfeSettingsLeftMenuEnriched')) }).then(() => {
      })   
    } 

    if (localStorage.getItem('bfeTreatLikeNoteFields')!== null){      
      this.$store.dispatch("setTreatLikeNoteFields", { self: this, fields: localStorage.getItem('bfeTreatLikeNoteFields') }).then(() => {
      })   
    } 


    this.$store.dispatch("setSupportedRomanizations", { self: this}).then(() => {
    

    })  


    if (localStorage.getItem('bfeLoadResourceFavorites')!== null){      

      for (let f of JSON.parse(localStorage.getItem('bfeLoadResourceFavorites'))){
        this.$store.dispatch("addLoadResourceFavorite", { self: this, type: f.type, name: f.name, label: f.label   }).then(() => {
        })
      }
    } 



    if (localStorage.getItem('bfeSettingsSubjectBuildMode')!== null){      
      this.$store.dispatch("subjectEditorMode", { self: this, mode: localStorage.getItem('bfeSettingsSubjectBuildMode') }).then(() => {
      })   
    } 







    let r = await lookupUtil.checkVersionOutOfDate()
    this.outOfDate = r
    
    



  }
}
</script>
