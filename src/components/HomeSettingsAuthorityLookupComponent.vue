<template>
  <div id="home-settings-lookups">


    <div style="display: flex; background-color: whitesmoke; padding: 5px;">

      <div style="flex:3;">

        <div style="font-weight: bold;">Use the string based subject editor</div>
        <p>This option turns on the string based subject edtior which is designed to be a more user freindly interface for building subject strings. If you turn it off you will use the same lookup interface for names for subject headings.</p>

      </div>
      <div style="flex:1">
        <div style="margin-left: auto; margin-right: auto;">
          <input v-model="useStringEditor" @change="useStringEditorChange" type="checkbox" id="switchStringSubjectEditor" /><label for="switchStringSubjectEditor">Toggle</label>
        </div>
      </div>

    </div>   

  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"


export default {
  name: "HomeSettingsAuthorityLookupComponent",
  components: {
      // Keypress: () => import('vue-keypress')
      
  },
  props: {
  },
  methods: {


    useStringEditorChange: function(){

      console.log('seeting to ',this.useStringEditor)
      this.$store.dispatch("settingsLookupsUseTextSubjectEditor", { self: this, settingsLookupsUseTextSubjectEditor: this.useStringEditor }).then(() => {

      })   

    }


  },
  computed: mapState({
    profiles: 'profiles',
    profilesLoaded: 'profilesLoaded',
    settingsLookupsUseTextSubjectEditor: 'settingsLookupsUseTextSubjectEditor',

  }), 

  data: function() {
    return {

      useStringEditor: true,
 

    }
  },
  created: function(){

    console.log('settingsLookupsUseTextSubjectEditor',this.settingsLookupsUseTextSubjectEditor)


    this.useStringEditor = this.settingsLookupsUseTextSubjectEditor
    // let bfeDiacritics = localStorage.getItem('bfeDiacritics')
    // if (bfeDiacritics === null){
    //   bfeDiacritics = []
    // }else{
    //   bfeDiacritics = JSON.parse(bfeDiacritics)
    // }


    // for (let k in diacrticsVoyagerMacroExpress){
    //   for (let d of diacrticsVoyagerMacroExpress[k]){
    //     this.dPackVoyagerShortCuts.push(d)
    //   }
    // }

    // for (let k in diacrticsVoyagerNative){
    //   for (let d of diacrticsVoyagerNative[k]){
    //     this.dPackVoyagerShortCutsNative.push(d)
    //   }
    // }


    



    // this.dPackVoyager = this.settingsDPackVoyager
    // this.dPackVoyagerNative = this.settingsDPackVoyagerNative




    // this.locatStorageDiacritics = bfeDiacritics

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










  #home-settings-lookups{
    padding:2em; 
  }
  
</style>
