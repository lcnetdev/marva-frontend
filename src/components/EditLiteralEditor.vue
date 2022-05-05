<template>

  <div :class="['literal-editor-container']">
    

    <div id="literal-editor-layout" style="display: flex;">
      <div style="flex:4">
        <textarea dir="auto" id="literal-editor-textarea" @input="literalChange" ref="textarea" v-model="inputValue"></textarea>





      </div>
      <div style="flex:1">

      <div style="height: 100%; overflow-y: scroll; border-bottom: solid 1px lightgray;">
        <div style="font-weight: bold; background-color: white;">Custom Diacritics</div>
        <div class="diacritic-key" v-for="(d,idx) in diacriticData" @click="insertDiacritic(d.letter)" :key="d.keycode + '_' + idx">
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px darkgray;">{{d.letter}}</span>
          <span style="padding-left: 0.5em">{{d.desc}}</span>
        </div>
        <div style="font-weight: bold; background-color: white;">Combining Diacritics</div>


        <div class="diacritic-key" v-for="d in combiningDiacritics" @click="insertDiacritic(d.symbol)" :key="d.titlt">
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px darkgray;">{{d.symbol}}</span>
          <span style="padding-left: 0.5em">{{d.title}}</span>
        </div>

      </div>



      </div>  
    </div>

    <div  style="display: flex; padding: 5px;">
      <div style="flex:1; background-color: #f0f8ff8f; border-radius: 1em; text-align: center; min-height: 100px;">
          <template v-if="isNonLatin">
          <div >Romanization / <span style="color:tomato;">Non-LC/ALA compliant</span></div>
          <ul>
            

            <li v-for="al in activeLanguages" :key="al.name">{{al.name}} 
              <button v-if="supportedRomanizations.includes(al.name)" @click="romanize(al.name)">Romanize</button>
              <button disabled v-else>Not Supported</button>
            </li>

            <li v-if="activeLanguages.length==0">No auto-suggest, use manual below</li>


          </ul>

          <select style="margin-left: 1em; margin-top: 1em;" @change="romanize($event)">
            <option selected>Manual Select</option>
            <option v-for="l in supportedRomanizations" :key="l">{{l}}</option>
          </select>
        </template>
        <template v-else>
          <div >Romanization</div>
          <div >Enter non-latin text to see options</div>
        </template>


      </div>
      <div style="flex:1; background-color: #fffff0db; border-radius: 1em; text-align: center; min-height: 100px;">
          Manual language settings here

      </div>  
      <div style="flex:1; background-color: #ffe4e161; border-radius: 1em; text-align: center; min-height: 100px;">
          <div>Toolbox</div>
          <p>What are common text editing actions that could go here? <a href="https://git.loc.gov/lcnetdev/marva/-/issues/new?issue[title]=Literal%20editor%20toolbox%20suggestion" target="_blank">Add suggestion</a></p>
      </div>  
      <div style="flex:1; text-align:center; padding-top:2em">

        <button style="font-size:1.25em; margin-right: 1em;" @click="closeEditor">Cancel</button>
        <button style="font-size:1.25em;" @click="updateFromEditor">Save</button>

      </div>  
    </div>
    
    <!-- <button @click="test">TEST</button> -->

  </div>

</template>


<style type="text/css" scoped="true">

    .diacritic-key{
      cursor: pointer;
      background-color: transparent;
      transition-duration: 500ms !important;
      transition: all;


    }
    .diacritic-key:hover{
      background-color: lightblue;
    }
    .literal-editor-container{
      width: 99%; 
      margin-left: auto; 
      margin-right: auto; 
/*      height: 480px;
*/      background: whitesmoke;
      padding: 5px;
    }

    #literal-editor-layout{
      height: 370px;
    }

    textarea{
      font-size: 2em;
      width: 99%;
      height: 99%;
    }

    ul{
      margin: 0;  
      padding: 0;
      font-weight: bold;

    }

    button{

            font-size: 0.75em;
            text-align: center;
            cursor: pointer;
            outline: none;
            color: #fff;
            border: none;
            border-radius: 5px;

    }

    button:active {
            transform: translateY(4px);
            color: yellow;
            /* Moving button 4px to y-axis */
        }

</style>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

import { mapState } from 'vuex'
// // import parseId from '@/lib/parseId'
import config from "@/lib/config"

// import lookupUtil from "@/lib/lookupUtil"



// const debounce = (callback, wait) => {
//   let timeoutId = null;
//   return (...args) => {
//     window.clearTimeout(timeoutId);
//     timeoutId = window.setTimeout(() => {
//       callback.apply(null, args);
//     }, wait);
//   };
// }





export default {
  name: "EditLiteralEditor",
  components: {
    // HelloWorld
    
  },
  props: {

    initalValue: String

  },



  data: function() {
    return { 

      inputValue:"",
      changeTimeout: null,
      diacriticData: null,
      activeLanguages: [],
      langs: [], 
      combiningDiacritics: [{"symbol":"\u0300","title":"Grave Accent"},{"symbol":"\u0301","title":"Acute Accent"},{"symbol":"\u0302","title":"Circumflex Accent"},{"symbol":"\u0303","title":"Tilde"},{"symbol":"\u0304","title":"Macron"},{"symbol":"\u0305","title":"Overline"},{"symbol":"\u0306","title":"Breve"},{"symbol":"\u0307","title":"Dot Above"},{"symbol":"\u0308","title":"Diaeresis"},{"symbol":"\u0309","title":"Hook Above"},{"symbol":"\u030a","title":"Ring Above"},{"symbol":"\u030b","title":"Double Acute Accent"},{"symbol":"\u030c","title":"Caron"},{"symbol":"\u030d","title":"Vertical Line Above"},{"symbol":"\u030e","title":"Double Vertical Line Above"},{"symbol":"\u030f","title":"Double Grave Accent"},{"symbol":"\u0310","title":"Candrabindu"},{"symbol":"\u0311","title":"Inverted Breve"},{"symbol":"\u0312","title":"Turned Comma Above"},{"symbol":"\u0313","title":"Comma Above"},{"symbol":"\u0314","title":"Reversed Comma Above"},{"symbol":"\u0315","title":"Comma Above Right"},{"symbol":"\u0316","title":"Grave Accent Below"},{"symbol":"\u0317","title":"Acute Accent Below"},{"symbol":"\u0318","title":"Left Tack Below"},{"symbol":"\u0319","title":"Right Tack Below"},{"symbol":"\u031a","title":"Left Angle Above"},{"symbol":"\u031b","title":"Horn"},{"symbol":"\u031c","title":"Left Half Ring Below"},{"symbol":"\u031d","title":"Up Tack Below"},{"symbol":"\u031e","title":"Down Tack Below"},{"symbol":"\u031f","title":"Plus Sign Below"},{"symbol":"\u0320","title":"Minus Sign Below"},{"symbol":"\u0321","title":"Palatalized Hook Below"},{"symbol":"\u0322","title":"Retroflex Hook Below"},{"symbol":"\u0323","title":"Dot Below"},{"symbol":"\u0324","title":"Diaeresis Below"},{"symbol":"\u0325","title":"Ring Below"},{"symbol":"\u0326","title":"Comma Below"},{"symbol":"\u0327","title":"Cedilla"},{"symbol":"\u0328","title":"Ogonek"},{"symbol":"\u0329","title":"Vertical Line Below"},{"symbol":"\u032a","title":"Bridge Below"},{"symbol":"\u032b","title":"Inverted Double Arch Below"},{"symbol":"\u032c","title":"Caron Below"},{"symbol":"\u032d","title":"Circumflex Accent Below"},{"symbol":"\u032e","title":"Breve Below"},{"symbol":"\u032f","title":"Inverted Breve Below"},{"symbol":"\u0330","title":"Tilde Below"},{"symbol":"\u0331","title":"Macron Below"},{"symbol":"\u0332","title":"Low Line"},{"symbol":"\u0333","title":"Double Low Line"},{"symbol":"\u0334","title":"Tilde Overlay"},{"symbol":"\u0335","title":"Short Stroke Overlay"},{"symbol":"\u0336","title":"Long Stroke Overlay"},{"symbol":"\u0337","title":"Short Solidus Overlay"},{"symbol":"\u0338","title":"Long Solidus Overlay"},{"symbol":"\u0339","title":"Right Half Ring Below"},{"symbol":"\u033a","title":"Inverted Bridge Below"},{"symbol":"\u033b","title":"Square Below"},{"symbol":"\u033c","title":"Seagull Below"},{"symbol":"\u033d","title":"X Above"},{"symbol":"\u033e","title":"Vertical Tilde"},{"symbol":"\u033f","title":"Double Overline"},{"symbol":"\u0340","title":"Grave Tone Mark"},{"symbol":"\u0341","title":"Acute Tone Mark"},{"symbol":"\u0342","title":"Greek Perispomeni"},{"symbol":"\u0343","title":"Greek Koronis"},{"symbol":"\u0344","title":"Greek Dialytika Tonos"},{"symbol":"\u0345","title":"Greek Ypogegrammeni"},{"symbol":"\u0346","title":"Bridge Above"},{"symbol":"\u0347","title":"Equals Sign Below"},{"symbol":"\u0348","title":"Double Vertical Line Below"},{"symbol":"\u0349","title":"Left Angle Below"},{"symbol":"\u034a","title":"Not Tilde Above"},{"symbol":"\u034b","title":"Homothetic Above"},{"symbol":"\u034c","title":"Almost Equal To Above"},{"symbol":"\u034d","title":"Left Right Arrow Below"},{"symbol":"\u034e","title":"Upwards Arrow Below"},{"symbol":"\u034f","title":"Grapheme Joiner"},{"symbol":"\u0350","title":"Right Arrowhead Above"},{"symbol":"\u0351","title":"Left Half Ring Above"},{"symbol":"\u0352","title":"Fermata"},{"symbol":"\u0353","title":"X Below"},{"symbol":"\u0354","title":"Left Arrowhead Below"},{"symbol":"\u0355","title":"Right Arrowhead Below"},{"symbol":"\u0356","title":"Right Arrowhead and Up Arrowhead Below"},{"symbol":"\u0357","title":"Right Half Ring Above"},{"symbol":"\u0358","title":"Dot Above Right"},{"symbol":"\u0359","title":"Asterisk Below"},{"symbol":"\u035a","title":"Double Ring Below"},{"symbol":"\u035b","title":"Zigzag Above"},{"symbol":"\u035c","title":"Double Breve Below"},{"symbol":"\u035d","title":"Double Breve"},{"symbol":"\u035e","title":"Double Macron"},{"symbol":"\u035f","title":"Double Macron Below"},{"symbol":"\u0360","title":"Double Tilde"},{"symbol":"\u0361","title":"Double Inverted Breve"},{"symbol":"\u0362","title":"Double Rightwards Arrow Below"},{"symbol":"\u0363","title":"Latin Small Letter A"},{"symbol":"\u0364","title":"Latin Small Letter E"},{"symbol":"\u0365","title":"Latin Small Letter I"},{"symbol":"\u0366","title":"Latin Small Letter O"},{"symbol":"\u0367","title":"Latin Small Letter U"},{"symbol":"\u0368","title":"Latin Small Letter C"},{"symbol":"\u0369","title":"Latin Small Letter D"},{"symbol":"\u036a","title":"Latin Small Letter H"},{"symbol":"\u036b","title":"Latin Small Letter M"},{"symbol":"\u036c","title":"Latin Small Letter R"},{"symbol":"\u036d","title":"Latin Small Letter T"},{"symbol":"\u036e","title":"Latin Small Letter V"},{"symbol":"\u036f","title":"Latin Small Letter X"}],
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
      

    }),
  methods: {

    loadDataFromInput: function(value){

      this.inputValue = value
      this.literalChange(null,0)
    },

    closeEditor: function(){
      this.$emit('closeEditor', true)
    },

    updateFromEditor: function(){
      this.$emit('updateFromEditor', this.inputValue.replaceAll('\n',' '))
    },



    insertDiacritic: function(diacritic){


      let insertAt = this.$refs.textarea.selectionStart


      this.inputValue = this.inputValue.substring(0, insertAt) + diacritic + this.inputValue.substring(insertAt);




    },

    romanize: async function(useLang){
        
          if (typeof useLang !== 'string'){
            let tmp = useLang.target.value
            

            useLang.target.value = 'Manual Select'

            useLang = tmp
          }

          let r = await fetch(`${config.returnUrls().utilLang}romanize`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            // body: JSON.stringify({value:"חצוף הארצישראלי : פרקים מחייו של הילד העברי הראשון"})
            // body: JSON.stringify({value:"ha-Ḥatsuf ha-Eretsyiśreʼeli : peraḳim me-ḥayaṿ shel ha-yeled ha-ʻIvri ha-rishon"})
            // body: JSON.stringify({value:"لأساس في تعليم العربية للناطقين بغيرها"})
            // body: JSON.stringify({value:"Bader, Fawzīyah Aḥmad. Asās fī taʻlīm al-ʻArabīyah lil-nāṭiqīn bi-ghayrihā"})
            // body: JSON.stringify({value:"Русская нация в XX веке : русское, советское, российское в этнополитической истории России : Монография"})
            body: JSON.stringify({value:this.inputValue, type:useLang})
            
          }).then(res => res.json())

          this.inputValue = this.inputValue + '\n' + r.value


    },

    literalChange: async function(event,timeout){

      if (!timeout){
        timeout=500
      }


      window.clearTimeout(this.changeTimeout)

      this.changeTimeout = window.setTimeout(async ()=>{

        this.activeLanguages=[]

        this.isNonLatin = this.nonLatinRegex.test(this.inputValue)
        

        let r = await fetch(`${config.returnUrls().utilLang}lang`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            // body: JSON.stringify({value:"חצוף הארצישראלי : פרקים מחייו של הילד העברי הראשון"})
            // body: JSON.stringify({value:"ha-Ḥatsuf ha-Eretsyiśreʼeli : peraḳim me-ḥayaṿ shel ha-yeled ha-ʻIvri ha-rishon"})
            // body: JSON.stringify({value:"لأساس في تعليم العربية للناطقين بغيرها"})
            // body: JSON.stringify({value:"Bader, Fawzīyah Aḥmad. Asās fī taʻlīm al-ʻArabīyah lil-nāṭiqīn bi-ghayrihā"})
            // body: JSON.stringify({value:"Русская нация в XX веке : русское, советское, российское в этнополитической истории России : Монография"})
            body: JSON.stringify({value:this.inputValue})
            
          }).then(res => res.json())
        

        this.activeLanguages = JSON.parse(JSON.stringify(r))

        

      },timeout)



    },

    test: async function() {
      



    },



  },




  created: async function () {

    
    let d = localStorage.getItem('bfeDiacritics')
    if (d){
      this.diacriticData = JSON.parse(d)
      
    }





  },


  mounted: function () {

    
    
  }
};
</script>
