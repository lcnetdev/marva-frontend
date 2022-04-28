<template>

  <div :class="['literal-editor-container']">
    

    <div id="literal-editor-layout" style="display: flex;">
      <div style="flex:4">
        <textarea @input="literalChange" v-model="inputValue">لأساس في تعليم العربية للناطقين بغيرها</textarea>





      </div>
      <div style="flex:1">

      <div style="height: 100%; overflow-y: scroll;">
        <div class="diacritic-key" v-for="d in diacriticData" :key=d.keycode>
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px black">{{d.letter}}</span>
          <span style="padding-left: 1em">{{d.desc}}</span>
        </div>
          
        <div class="diacritic-key" v-for="d in diacriticData" :key=d.keycode>
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px black">{{d.letter}}</span>
          <span style="padding-left: 1em">{{d.desc}}</span>
        </div>

        <div class="diacritic-key" v-for="d in diacriticData" :key=d.keycode>
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px black">{{d.letter}}</span>
          <span style="padding-left: 1em">{{d.desc}}</span>
        </div>

        <div class="diacritic-key" v-for="d in diacriticData" :key=d.keycode>
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px black">{{d.letter}}</span>
          <span style="padding-left: 1em">{{d.desc}}</span>
        </div>

        <div class="diacritic-key" v-for="d in diacriticData" :key=d.keycode>
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px black">{{d.letter}}</span>
          <span style="padding-left: 1em">{{d.desc}}</span>
        </div>
          
        <div class="diacritic-key" v-for="d in diacriticData" :key=d.keycode>
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px black">{{d.letter}}</span>
          <span style="padding-left: 1em">{{d.desc}}</span>
        </div>

        <div class="diacritic-key" v-for="d in diacriticData" :key=d.keycode>
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px black">{{d.letter}}</span>
          <span style="padding-left: 1em">{{d.desc}}</span>
        </div>

        <div class="diacritic-key" v-for="d in diacriticData" :key=d.keycode>
          <span style="font-size: 1.5em; width: 1em; text-align: center; display: inline-block; border: solid 1px black">{{d.letter}}</span>
          <span style="padding-left: 1em">{{d.desc}}</span>
        </div>


      </div>



      </div>  
    </div>

    <div  style="display: flex; padding: 5px;">
      <div style="flex:1; background-color: aliceblue; border-radius: 1em; text-align: center;">
          <template v-if="isNonLatin">
          <div >Romanization (<span style="color:tomato;">Likely not LC/ALA compliant</span>)</div>
          <ul>
            

            <li v-for="al in activeLanguages" :key="al.name">{{al.name}} 
              <button v-if="supportedRomanizations.includes(al.name)" @click="romanize(al.name)">Romanize</button>
              <button disabled v-else>Not Supported</button>
            </li>

            


          </ul>

          <select style="margin-left: 1em; margin-top: 1em;" @change="romanize($event)">
            <option selected>Manual Select</option>
            <option v-for="l in supportedRomanizations" :key="l">{{l}}</option>
          </select>
        </template>

      </div>
      <div style="flex:1"></div>  
      <div style="flex:1"></div>  
      <div style="flex:1"></div>  
      <div style="flex:1"></div>  
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
      height: 470px;
      background: whitesmoke;
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

  data: function() {
    return { 

      inputValue:"",
      changeTimeout: null,
      diacriticData: null,
      activeLanguages: [],
      supportedRomanizations: [],
      langs: [], 
      combiningDiacritics: [{"symbol":"\u0300","title":"Combining Grave Accent"},{"symbol":"\u0301","title":"Combining Acute Accent"},{"symbol":"\u0302","title":"Combining Circumflex Accent"},{"symbol":"\u0303","title":"Combining Tilde"},{"symbol":"\u0304","title":"Combining Macron"},{"symbol":"\u0305","title":"Combining Overline"},{"symbol":"\u0306","title":"Combining Breve"},{"symbol":"\u0307","title":"Combining Dot Above"},{"symbol":"\u0308","title":"Combining Diaeresis"},{"symbol":"\u0309","title":"Combining Hook Above"},{"symbol":"\u030a","title":"Combining Ring Above"},{"symbol":"\u030b","title":"Combining Double Acute Accent"},{"symbol":"\u030c","title":"Combining Caron"},{"symbol":"\u030d","title":"Combining Vertical Line Above"},{"symbol":"\u030e","title":"Combining Double Vertical Line Above"},{"symbol":"\u030f","title":"Combining Double Grave Accent"},{"symbol":"\u0310","title":"Combining Candrabindu"},{"symbol":"\u0311","title":"Combining Inverted Breve"},{"symbol":"\u0312","title":"Combining Turned Comma Above"},{"symbol":"\u0313","title":"Combining Comma Above"},{"symbol":"\u0314","title":"Combining Reversed Comma Above"},{"symbol":"\u0315","title":"Combining Comma Above Right"},{"symbol":"\u0316","title":"Combining Grave Accent Below"},{"symbol":"\u0317","title":"Combining Acute Accent Below"},{"symbol":"\u0318","title":"Combining Left Tack Below"},{"symbol":"\u0319","title":"Combining Right Tack Below"},{"symbol":"\u031a","title":"Combining Left Angle Above"},{"symbol":"\u031b","title":"Combining Horn"},{"symbol":"\u031c","title":"Combining Left Half Ring Below"},{"symbol":"\u031d","title":"Combining Up Tack Below"},{"symbol":"\u031e","title":"Combining Down Tack Below"},{"symbol":"\u031f","title":"Combining Plus Sign Below"},{"symbol":"\u0320","title":"Combining Minus Sign Below"},{"symbol":"\u0321","title":"Combining Palatalized Hook Below"},{"symbol":"\u0322","title":"Combining Retroflex Hook Below"},{"symbol":"\u0323","title":"Combining Dot Below"},{"symbol":"\u0324","title":"Combining Diaeresis Below"},{"symbol":"\u0325","title":"Combining Ring Below"},{"symbol":"\u0326","title":"Combining Comma Below"},{"symbol":"\u0327","title":"Combining Cedilla"},{"symbol":"\u0328","title":"Combining Ogonek"},{"symbol":"\u0329","title":"Combining Vertical Line Below"},{"symbol":"\u032a","title":"Combining Bridge Below"},{"symbol":"\u032b","title":"Combining Inverted Double Arch Below"},{"symbol":"\u032c","title":"Combining Caron Below"},{"symbol":"\u032d","title":"Combining Circumflex Accent Below"},{"symbol":"\u032e","title":"Combining Breve Below"},{"symbol":"\u032f","title":"Combining Inverted Breve Below"},{"symbol":"\u0330","title":"Combining Tilde Below"},{"symbol":"\u0331","title":"Combining Macron Below"},{"symbol":"\u0332","title":"Combining Low Line"},{"symbol":"\u0333","title":"Combining Double Low Line"},{"symbol":"\u0334","title":"Combining Tilde Overlay"},{"symbol":"\u0335","title":"Combining Short Stroke Overlay"},{"symbol":"\u0336","title":"Combining Long Stroke Overlay"},{"symbol":"\u0337","title":"Combining Short Solidus Overlay"},{"symbol":"\u0338","title":"Combining Long Solidus Overlay"},{"symbol":"\u0339","title":"Combining Right Half Ring Below"},{"symbol":"\u033a","title":"Combining Inverted Bridge Below"},{"symbol":"\u033b","title":"Combining Square Below"},{"symbol":"\u033c","title":"Combining Seagull Below"},{"symbol":"\u033d","title":"Combining X Above"},{"symbol":"\u033e","title":"Combining Vertical Tilde"},{"symbol":"\u033f","title":"Combining Double Overline"},{"symbol":"\u0340","title":"Combining Grave Tone Mark"},{"symbol":"\u0341","title":"Combining Acute Tone Mark"},{"symbol":"\u0342","title":"Combining Greek Perispomeni"},{"symbol":"\u0343","title":"Combining Greek Koronis"},{"symbol":"\u0344","title":"Combining Greek Dialytika Tonos"},{"symbol":"\u0345","title":"Combining Greek Ypogegrammeni"},{"symbol":"\u0346","title":"Combining Bridge Above"},{"symbol":"\u0347","title":"Combining Equals Sign Below"},{"symbol":"\u0348","title":"Combining Double Vertical Line Below"},{"symbol":"\u0349","title":"Combining Left Angle Below"},{"symbol":"\u034a","title":"Combining Not Tilde Above"},{"symbol":"\u034b","title":"Combining Homothetic Above"},{"symbol":"\u034c","title":"Combining Almost Equal To Above"},{"symbol":"\u034d","title":"Combining Left Right Arrow Below"},{"symbol":"\u034e","title":"Combining Upwards Arrow Below"},{"symbol":"\u034f","title":"Combining Grapheme Joiner"},{"symbol":"\u0350","title":"Combining Right Arrowhead Above"},{"symbol":"\u0351","title":"Combining Left Half Ring Above"},{"symbol":"\u0352","title":"Combining Fermata"},{"symbol":"\u0353","title":"Combining X Below"},{"symbol":"\u0354","title":"Combining Left Arrowhead Below"},{"symbol":"\u0355","title":"Combining Right Arrowhead Below"},{"symbol":"\u0356","title":"Combining Right Arrowhead and Up Arrowhead Below"},{"symbol":"\u0357","title":"Combining Right Half Ring Above"},{"symbol":"\u0358","title":"Combining Dot Above Right"},{"symbol":"\u0359","title":"Combining Asterisk Below"},{"symbol":"\u035a","title":"Combining Double Ring Below"},{"symbol":"\u035b","title":"Combining Zigzag Above"},{"symbol":"\u035c","title":"Combining Double Breve Below"},{"symbol":"\u035d","title":"Combining Double Breve"},{"symbol":"\u035e","title":"Combining Double Macron"},{"symbol":"\u035f","title":"Combining Double Macron Below"},{"symbol":"\u0360","title":"Combining Double Tilde"},{"symbol":"\u0361","title":"Combining Double Inverted Breve"},{"symbol":"\u0362","title":"Combining Double Rightwards Arrow Below"},{"symbol":"\u0363","title":"Combining Latin Small Letter A"},{"symbol":"\u0364","title":"Combining Latin Small Letter E"},{"symbol":"\u0365","title":"Combining Latin Small Letter I"},{"symbol":"\u0366","title":"Combining Latin Small Letter O"},{"symbol":"\u0367","title":"Combining Latin Small Letter U"},{"symbol":"\u0368","title":"Combining Latin Small Letter C"},{"symbol":"\u0369","title":"Combining Latin Small Letter D"},{"symbol":"\u036a","title":"Combining Latin Small Letter H"},{"symbol":"\u036b","title":"Combining Latin Small Letter M"},{"symbol":"\u036c","title":"Combining Latin Small Letter R"},{"symbol":"\u036d","title":"Combining Latin Small Letter T"},{"symbol":"\u036e","title":"Combining Latin Small Letter V"},{"symbol":"\u036f","title":"Combining Latin Small Letter X"}],
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
      

    }),
  methods: {


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

    literalChange: async function(){




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

        console.log(this.activeLanguages)

      },500)



    },

    test: async function() {
      



    },



  },




  created: async function () {

    console.log(config.returnUrls().utilLang)
    let d = localStorage.getItem('bfeDiacritics')
    if (d){
      this.diacriticData = JSON.parse(d)
      console.log(this.diacriticData)
    }


    this.supportedRomanizations = await fetch(config.returnUrls().utilLang+'romanize').then(response => response.json())



  },


  mounted: function () {
    
  }
};
</script>
