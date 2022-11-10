<template>

  <div>




  <textarea placeholder="Enter Text Here" dir="auto" id="literal-editor-textarea" ref="textarea" v-model="inputValue"></textarea>


  <select ref="scriptShifterSelected" style="margin-left: 1em; margin-top: 1em; margin-right: 1em; font-size: 1.5em;" @change="scriptShiftChange($event)">
    <option v-for="l in Object.keys(supportedScriptShifter)" :selected="(l==scriptShifterDefault)" :value="l" :key="l">{{supportedScriptShifter[l].name}}</option>
  </select>

  <button @click="scriptShift()">Romanize</button>


  <textarea style="margin-top:1em" placeholder="Romaization will appear here" dir="auto" id="literal-output-textarea" ref="output"></textarea>









  </div>
</template>


<style type="text/css" scoped>
    #literal-editor-textarea, #literal-output-textarea{
      font-family: inherit;  
      width: 99vw;
      height: 30vh;
      font-size: 2em;
      padding: 10px;
    }
   

</style>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";


import { mapState } from 'vuex'
// // import parseId from '@/lib/parseId'
import config from "@/lib/config"




export default {
  name: "ScriptShifter",
  components: {
    
    
  },

  data: function() {
    return { 

      inputValue:"",
      scriptShifterDefault: false,
      nonLatinRegex: /[^\u0000-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF]/g, // eslint-disable-line
      isNonLatin: false,

     }
  },


  computed: mapState({
      profilesLoaded: 'profilesLoaded',
      activeProfile: 'activeProfile', 
      idWorkSearchResults: 'idWorkSearchResults',
      rtLookup:'rtLookup',
      profiles: 'profiles',
      contextData: 'contextData',
      supportedRomanizations: 'supportedRomanizations',
      supportedScriptShifter: 'supportedScriptShifter',


  }),

  created: async function () {


    console.log("HEY")

    if (localStorage.getItem('bfeScriptShifterDefault')!== null){  

      this.scriptShifterDefault = localStorage.getItem('bfeScriptShifterDefault')

    }




  },



  methods:{

    scriptShiftChange: function(event){


      localStorage.setItem('bfeScriptShifterDefault',event.target.value)
      this.scriptShifterDefault = event.target.value
    },

    scriptShift: async function(){


          let fromLang = this.$refs.scriptShifterSelected.value
          let literal = 'text=' + this.$refs.textarea.value


          let r = await fetch(`${config.returnUrls().scriptshifter}trans/${fromLang}`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            // body: JSON.stringify({value:"חצוף הארצישראלי : פרקים מחייו של הילד העברי הראשון"})
            // body: JSON.stringify({value:"ha-Ḥatsuf ha-Eretsyiśreʼeli : peraḳim me-ḥayaṿ shel ha-yeled ha-ʻIvri ha-rishon"})
            // body: JSON.stringify({value:"لأساس في تعليم العربية للناطقين بغيرها"})
            // body: JSON.stringify({value:"Bader, Fawzīyah Aḥmad. Asās fī taʻlīm al-ʻArabīyah lil-nāṭiqīn bi-ghayrihā"})
            // body: JSON.stringify({value:"Русская нация в XX веке : русское, советское, российское в этнополитической истории России : Монография"})
            body: literal
            
          })

          let results =  await r.text()
          if (r.status !== 200){
            alert(results)
          }else{
            this.$refs.output.value = results
          }
          
          


  },






  }




  
};
</script>
