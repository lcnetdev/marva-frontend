<template>

  <div :class="['subject-editor-container', {'subject-editor-container-lowres':lowResMode}]">
    

    <div :class="['subject-editor-container-left', {'subject-editor-container-left-lowres':lowResMode}]">

      <div id="search-in-holder" style="position: absolute; top:0">
        <span>Search In:</span>


        <button @click="searchModeSwitch('LCSHNAF')" :data-tooltip="'Shortcut: CTRL+ALT+1'" :class="['simptip-position-bottom',{'active':(searchMode==='LCSHNAF')}]">LCSH/NAF</button>
        <button @click="searchModeSwitch('GEO')" :data-tooltip="'Shortcut: CTRL+ALT+2'" :class="['simptip-position-bottom',{'active':(searchMode==='GEO')}]">Indirect Geo</button>
        <button @click="searchModeSwitch('WORKS')" :data-tooltip="'Shortcut: CTRL+ALT+3'" :class="['simptip-position-bottom',{'active':(searchMode==='WORKS')}]">Works</button>
        <button @click="searchModeSwitch('HUBS')" :data-tooltip="'Shortcut: CTRL+ALT+4'" :class="['simptip-position-bottom',{'active':(searchMode==='HUBS')}]">Hubs</button>

      </div>


      <div style="flex:1; align-self: flex-end;">

        <div v-if="activeSearch!==false">{{activeSearch}}</div>
        <div v-if="searchResults !== null">
          <div v-if="searchResults.names.length>0">

            <div v-for="(name,idx) in searchResults.names" @click="selectContext((searchResults.names.length - idx)*-1)" @mouseover="loadContext((searchResults.names.length - idx)*-1)" :data-id="(searchResults.names.length - idx)*-1" :key="name.uri" :class="['fake-option', {'unselected':(pickPostion != (searchResults.names.length - idx)*-1 ), 'selected':(pickPostion == (searchResults.names.length - idx)*-1 ),'picked': (pickLookup[(searchResults.names.length - idx)*-1] && pickLookup[(searchResults.names.length - idx)*-1].picked)}]">
                <span v-if="name.suggestLabel.length>41">{{name.suggestLabel.substring(0,41)}}...</span>
                <span v-else>{{name.suggestLabel}}</span>
                <span> [LCNAF]</span>
              </div>
            <hr>
          </div>

          <div v-if="searchResults.subjectsComplex.length>0">
            <div v-for="(subjectC,idx) in searchResults.subjectsComplex" @click="selectContext(idx)" @mouseover="loadContext(idx)" :data-id="idx" :key="subjectC.uri" :class="['fake-option', {'unselected':(pickPostion != idx), 'selected':(pickPostion == idx), 'picked': (pickLookup[idx] && pickLookup[idx].picked)}]">{{subjectC.suggestLabel}}<span></span></div>
            <hr>
          </div>

          <div v-if="searchResults.subjectsSimple.length>0">
            <div v-for="(subject,idx) in searchResults.subjectsSimple" @click="selectContext(searchResults.subjectsComplex.length + idx)" @mouseover="loadContext(searchResults.subjectsComplex.length + idx)" :data-id="searchResults.subjectsComplex.length + idx" :key="subject.uri" :class="['fake-option', {'unselected':(pickPostion != searchResults.subjectsComplex.length + idx ), 'selected':(pickPostion == searchResults.subjectsComplex.length + idx ), 'picked': (pickLookup[searchResults.subjectsComplex.length + idx] && pickLookup[searchResults.subjectsComplex.length + idx].picked), 'literal-option':(subject.literal)}]" >{{subject.suggestLabel}}<span  v-if="subject.literal">{{subject.label}}</span> <span  v-if="subject.literal">[Literal]</span></div>
          </div>




        </div>
      </div>


      <div :class="['subject-editor-container-right', {'subject-editor-container-right-lowres':lowResMode}]">



        <div v-if="contextRequestInProgress" style="font-weight: bold;">Retrieving data...</div>
        <div class="modal-context" :style="{ }" v-if="Object.keys(contextData).length>0">

          
          <h3><span class="modal-context-icon simptip-position-top" :data-tooltip="'Type: ' + contextData.type" v-html="returnAuthIcon(contextData.type)"></span>{{contextData.title}}</h3>

          <div class="modal-context-data-title">{{contextData.type}}</div>
          <a style="color:#2c3e50" :href="contextData.uri" target="_blank">view on id.loc.gov</a>
          <div v-if="contextData.variant && contextData.variant.length>0">
            <div class="modal-context-data-title">Variants:</div>
            <ul>
              <li class="modal-context-data-li" v-for="(v,idx) in contextData.variant" v-bind:key="'var' + idx">{{v}}</li>
            </ul>


          </div>

          <div v-for="key in Object.keys(contextData.nodeMap)" :key="key">
            <div class="modal-context-data-title">{{key}}:</div>
              <ul>
                <li class="modal-context-data-li" v-for="v in contextData.nodeMap[key]" v-bind:key="v">{{v}}</li>
              </ul>
          </div>


          <div v-if="contextData.source && contextData.source.length>0">
            <div class="modal-context-data-title">Sources:</div>
            <ul>
              <li class="modal-context-data-li" v-for="v in contextData.source" v-bind:key="v">{{v}}</li>
            </ul>
          </div>






        </div>  








      </div>
      

    </div>

    <div class="">



        <div class="component-container-fake-input">
          <div  style="display: flex;">
            <div  style="flex:1; position: relative;">
              <form autocomplete="off" style="height: 3em;">            
                <input v-on:keydown.enter.prevent="navInput" placeholder="Enter Subject Headings Here" ref="subjectInput"  autocomplete="off" type="text" v-model="subjectString" @input="subjectStringChanged" @keydown="navInput" @keyup="navString" @click="navStringClick"  class="input-single-subject subject-input">            
              </form>

              <div v-for="(c, idx) in components" :ref="'cBackground' + idx" :class="['color-holder',{'color-holder-okay':(c.uri !== null || c.literal)},{'color-holder-type-okay':(c.type !== null || showTypes===false)}]" v-bind:key="idx" >
                {{c.label}}
              </div>
            </div>
          </div>          
        </div>
        <div ref="toolbar" style="display: flex;">          
          <div style="flex:2">
            <ol v-if="showTypes" :class="['type-list-ol',{'type-list-ol-lowres':lowResMode}]">
              <li :class="['type-item', {'type-item-selected':(type.selected)}]" v-for="type in activeTypes" :key="type.value" @click="setTypeClick($event,type.value)">{{type.label}}</li>
            </ol>
          </div>
          <div style="flex:1">

            <button v-if="lowResMode" @click="closeEditor" style="float: right;margin: 0.6em; background-color: white; border: solid 1px rgb(42,42,42); color: rgb(42,42,42);" :class="[{'add-button-lowres':lowResMode}]">Close</button>
            <button v-if="okayToAdd==true" style="float: right;margin: 0.6em;" @click="add" :class="[{'add-button-lowres':lowResMode}]">Add [SHIFT+Enter]</button>
            <button v-else-if="okayToAdd==false && subjectString.length==0" disabled style="float: right;margin: 0.6em; display: none;" :class="[{'add-button-lowres':lowResMode}]">Can't Add</button>
            <button v-else-if="okayToAdd==false" disabled style="float: right;margin: 0.6em;" :class="[{'add-button-lowres':lowResMode}]">Can't Add</button>

            
            
          </div>
        </div>




    </div>

   

  </div>

</template>


<style type="text/css">

    body #app{
      background-color: white !important;
    }

    .subject-editor-container{
      width: 99%; 
      margin-left: auto; 
      margin-right: auto; 
      height: 470px;
    }

    .subject-editor-container-lowres{
      height: 350px;
      max-height: 350px;
    }

    .add-button-lowres{
      margin-top: 0 !important;
    }

    .subject-editor-container-left{
      display: flex; 
      height: 468px;
      position: relative;
    }

    .subject-editor-container-left .modal-context-data-li{
      /*font-size: 1em;*/
    }

    

    .subject-editor-container-left-lowres{

      font-size: 0.75em !important;
      height: 352px;
      max-height: 352px;

    }



    .subject-editor-container-right{
      flex:1; 
      align-self: flex-start; 
      padding: 2em;
      height: 403px;
      overflow-y: scroll;
      background: whitesmoke;
    }

    .subject-editor-container-right-lowres{
      height: 304px;
      max-height: 304px;
    }


    .type-list-ol{
      padding-left: 0
    }

    .type-list-ol-lowres{
      margin: 0;
    }




    .color-holder{

      font-size: 1.5em;
      position: absolute;
      padding-top: 0.3em;

      pointer-events: none;    
      border-style: solid;
      border-width: 3px;
      border-color: rgb(255 132 132 / 52%);
      border-radius: 0.25em;
      color: transparent;
      
      background-color: rgb(255 132 132 / 25%);
      /*letter-spacing: -0.04em;*/
      
      height: 1.5em;
      font-family: sans-serif;

      left: 0;
      top: 0;



    }

    .subject-input{
      font-family: sans-serif;
    }


    .input-single{
      width: 95%;
      border:none;
      height: 100%;
      font-size: 1.5em;


      background: none;
      transition-property: color;
      transition-duration: 500ms;
    }
    .input-single:focus {outline:none !important}


    .fake-option{
      font-size: 1.25em;
      cursor: pointer;
    } 

    .fake-option:hover{
      background-color: whitesmoke;
    }

    .literal-option{
      font-style: italic;
    }

    .unselected::before {
      content: "• ";
      color: #999999;
    }

    .selected{
      background-color: whitesmoke;
    }
    .selected::before {
      content: "> ";
      color: #999999;
    }
    .picked{
      font-weight: bold;
    }

    .picked::before{      
      content: "✓ " !important;
      transition-property: all;
      transition-duration: 500ms;
      font-weight: bold;
      color: green;
      font-size: larger;


    }



    .modal-context-data-title{
      font-size: 1.2em;
      font-weight: bold;
    }

    .modal-context ul{
      margin-top: 0;
      margin-bottom: 0;
    }
    .modal-context-data-li{
      font-size: 0.85em;
    }

    .modal-context  h3{
      margin: 0;
      padding: 0;
    }

    .modal-context-icon{
      font-family: "fontello", Avenir, Helvetica, Arial, sans-serif;
      font-size: 1.25em;
      padding-right: 0.25em;

    }

    .color-holder-okay{
      background-color: #0080001f;
    }

    .color-holder-type-okay{
      border-color: #00800047;
    }

    .type-item{
      display: inline-block;
      border: solid 1px #9aa4a4;
      border-radius: 0.5em;
      padding: 0.1em;
      margin-left: 1em;
      cursor: pointer;
      background-color: white;
    }

    .type-item::before{
      content: " ";
    }


    .type-item-selected{
      background-color: #0080001f;
    }

  .input-single-subject{
    width: 95%;
    border:none;
    font-size: 1.5em;
    min-height: 2em;
    max-height: 2em;  
    background:none;
  }

  .input-single-subject:focus {outline:0;}



  #search-in-holder button{
    font-size: 0.85em;
    background-color: white;
    color: black;
    border: solid 1px #c1c1c1;
  }

  #search-in-holder .active{
  background-color: whitesmoke;
  -webkit-box-shadow: inset 0px 0px 5px #c1c1c1;
  -moz-box-shadow: inset 0px 0px 5px #c1c1c1;
  box-shadow: inset 0px 0px 5px #c1c1c1;

  }



/*
.left-menu-list-item-has-data::before {
    content: "✓ " !important;
    color: #999999;
}

li::before {
    content: "• ";
    color: #999999;
}*/

</style>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

import { mapState } from 'vuex'
// import parseId from '@/lib/parseId'
import uiUtils from "@/lib/uiUtils"

import lookupUtil from "@/lib/lookupUtil"



const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}





export default {
  name: "TestSubject",
  components: {
    // HelloWorld
    
  },

  data: function() {
    return {

      subjectString: '',
      components: [],
      lookup: {},
      searchResults: null,
      activeSearch: false,
      
      pickPostion: 0,
      pickLookup: {},
      activeComponent: null,
      oldActiveComponent: null,
      activeComponentIndex:0,
      oldActiveComponentIndex: 99,
      contextRequestInProgress: false,
      componetLookup: {},
      localContextCache: {},
      nextInputIsTypeSelection:false,
      typeLookup:{},
      okayToAdd: false,
      lowResMode: false,

      searchMode: "LCSHNAF",

      showTypes: false,

      activeTypes: {
        'madsrdf:Topic': {label:'Topic / Heading ($a $x)', value:'madsrdf:Topic',selected:false},
        'madsrdf:GenreForm': {label:'Genre ($v)', value:'madsrdf:GenreForm',selected:false},
        'madsrdf:Geographic': {label:'Geographic ($z)', value:'madsrdf:Geographic',selected:false},
        'madsrdf:Temporal': {label:'Chronological ($y)', value:'madsrdf:Temporal',selected:false},
      }


    }
  },

  computed: mapState({
      profilesLoaded: 'profilesLoaded',
      activeProfile: 'activeProfile', 
      idWorkSearchResults: 'idWorkSearchResults',
      rtLookup:'rtLookup',
      profiles: 'profiles',
      idXML:'idXML',

      contextData: 'contextData',
      

    }),
  methods: {


    returnAuthIcon: uiUtils.returnAuthIcon,


    searchModeSwitch: function(mode){

      this.searchMode = mode      
      if (this.activeComponent && this.activeComponent.label){        
        this.searchApis(this.activeComponent.label,this.subjectString,this)
      }
      this.$refs.subjectInput.focus()

    },


    // some context messing here, pass the debounce func a ref to the vue "this" as that to ref in the function callback
    searchApis: debounce(async (searchString,searchStringFull,that) => {
      
      that.searchResults=null
      that.x = 'Seaching...'
      that.pickPostion=0

      searchString = searchString.trim()
      searchStringFull = searchStringFull.trim()

      // make the "searching..." text grow
      let ti = window.setInterval(()=>{ that.activeSearch = ((!that.activeSearch) ? '' : that.activeSearch) + '.'},100)
      
      // a backup here just in case the search times out or takes forever
      let tiBackup = window.setTimeout(()=>{
        window.clearInterval(ti)
        that.activeSearch = false

      }, 10000)



      searchString=searchString.replaceAll('‑','-')
      searchStringFull=searchStringFull.replaceAll('‑','-')

      

      
      that.searchResults = await lookupUtil.subjectSearch(searchString,searchStringFull,that.searchMode) 


      // if they clicked around while it was doing this lookup bail out
      // if (that.activeSearchInterrupted){



      //   window.clearInterval(ti)
      //   window.clearTimeout(tiBackup)
      //   that.activeSearch = false
      //   that.activeSearchInterrupted = false
          
      //   console.log("that.activeSearchInterrupted",that.activeSearchInterrupted)

      //   return false

      // }



      // replace the true keyboard hypen with the werid hypen to prevent spliting on open lifedates
      for (let s of that.searchResults.names){
        s.labelOrginal = s.label
        s.label = s.label.replaceAll('-','‑')
      }


      for (let s of that.searchResults.subjectsComplex){
        s.labelOrginal = s.label
        s.complex=true
        s.label = s.label.replaceAll('-','‑')
      }

      for (let s of that.searchResults.subjectsSimple){


        if (s.suggestLabel && s.suggestLabel.includes('(DEPRECATED')){

          s.suggestLabel = s.suggestLabel.split('(DEPRECATED')[0] + "(DEPRECATED)"
        }


      }



      for (let s of that.searchResults.hierarchicalGeographic){
        if (s.suggestLabel && s.suggestLabel.includes(' (USE ')){
          s.suggestLabel = s.label
        }
      }
      if (that.searchMode == 'WORKS' || that.searchMode == 'HUBS'){
        for (let s of that.searchResults.subjectsSimple){
          if (s.suggestLabel && s.suggestLabel.includes(' (USE ')){
            s.suggestLabel = s.label
          }
        }
        for (let s of that.searchResults.subjectsComplex){
          if (s.suggestLabel && s.suggestLabel.includes(' (USE ')){
            s.suggestLabel = s.label
          }
        }

      }




      for (let s of that.searchResults.hierarchicalGeographic){
        s.labelOrginal = s.label
        s.hierarchicalGeographic=true
        s.label = s.label.replaceAll('-','‑')
      }


      if (that.searchResults.hierarchicalGeographic.length>0 && that.searchResults.subjectsComplex.length==0){
        that.searchResults.subjectsComplex = that.searchResults.hierarchicalGeographic
      }


      
      that.pickLookup = {}

      that.pickPostion = that.searchResults.subjectsSimple.length + that.searchResults.subjectsComplex.length -1
      



      for (let x in that.searchResults.subjectsComplex){
        that.pickLookup[x] = that.searchResults.subjectsComplex[x]
      }

      for (let x in that.searchResults.subjectsSimple){
        that.pickLookup[parseInt(x)+parseInt(that.searchResults.subjectsComplex.length)] = that.searchResults.subjectsSimple[x]
      }


      

      

      for (let x in that.searchResults.names){
        that.pickLookup[(that.searchResults.names.length - x)*-1] = that.searchResults.names[x]
      }
      
      for (let k in that.pickLookup){

        that.pickLookup[k].picked = false

        if (searchString.toLowerCase() == that.pickLookup[k].label.toLowerCase() && !that.pickLookup[k].literal ){
          // if the labels are the same for the current one selected don't overide it
          if (that.pickLookup[k].label.replaceAll('‑','-') == that.activeComponent.label.replaceAll('‑','-') && that.activeComponent.uri){
            if (that.activeComponent.uri == that.pickLookup[k].uri){
              console.log('that.activeComponent',that.activeComponent)
              that.pickPostion=k
              that.pickLookup[k].picked=true          
              that.selectContext()

            }

          }else{
            

            // if they started typing the next word already then stop this
            if (that.subjectString.replaceAll('‑','-')!=searchStringFull.replaceAll('‑','-')){
              break

            }

            // do they even have the same label currently, they might be clicking around in the interface
            // so at this point with the async lookup this is not even the right componen
            if (that.pickLookup[k].label !=  that.activeComponent.label){
              break

            }
            

            that.pickPostion=k
            that.pickLookup[k].picked=true          
            that.selectContext()

          }





        }
      }
      
      that.$store.dispatch("clearContext", { self: that})
      if (that.pickLookup[that.pickPostion] && !that.pickLookup[that.pickPostion].literal){
        that.contextRequestInProgress = true
        that.$store.dispatch("fetchContext", { self: that, searchPayload: that.pickLookup[that.pickPostion].uri }).then(() => {
          that.contextRequestInProgress = false
          // keep a local copy of it for looking up subject type
          if (that.contextData){
            that.localContextCache[that.contextData.uri] = JSON.parse(JSON.stringify(that.contextData))
          }

        })         
      }

 


      window.clearInterval(ti)
      window.clearTimeout(tiBackup)
      that.activeSearch = false

      that.$nextTick(() => {
        that.checkToolBarHeight()



        // window.setTimeout(()=> {

          // find out how small the smallest one is and then loop through and try to make all of them
          // that size so they fit on one line of the display
          let smallest_size = 1000;
          for (let el of document.getElementsByClassName("fake-option")){

            if (el.offsetHeight < smallest_size && el.offsetHeight!=0){
              smallest_size=el.offsetHeight
            }
          }
          // alert(smallest_size)
          for (let el of document.getElementsByClassName("fake-option")){
            if (el.offsetHeight > smallest_size){
              let startFontSize = 1.25
              while (el.offsetHeight >smallest_size){
                startFontSize=startFontSize-0.01
                el.style.fontSize = startFontSize + 'em';
                if (startFontSize<=0.01){
                  el.style.fontSize = "1.25em"
                  break
                }
              }
            }
          }




        // },100)
        



      })



    }, 500),

    navStringClick: function(event){
      // when clicked send it over to the navString func with fake key property to trigger if statement
      event.key='ArrowLeft'
      this.navString(event)
    },

    navString: function(event){

      if (event.key == 'ArrowLeft' || event.key == 'ArrowRight' ){



        // don't let them leave a trailing -- when they are clicking around like wild
        // if (this.subjectString.endsWith('--')){
        //   this.subjectString = this.subjectString.slice(0,this.subjectString.length-2)
        // }


        if (!event.target){
          event = {target:this.$refs.subjectInput}
        }
        
        
        for (let c of this.components){
          if (event.target.selectionStart >= c.posStart && event.target.selectionStart <= c.posEnd+1){
            this.activeComponent = c
            this.activeComponentIndex = c.id        
            break
          }
        }


        // keep track of where we were so that we don't do unessary refreshes
        if (this.oldActiveComponentIndex != this.activeComponentIndex){
          this.updateAvctiveTypeSelected()
          this.subjectStringChanged(event)
          this.oldActiveComponentIndex = this.activeComponentIndex
        }else if (this.activeComponent.uri === null){

          this.updateAvctiveTypeSelected()
          this.subjectStringChanged(event)
        }


      }


    },

    loadContext: function(pickPostion){


        this.pickPostion = pickPostion


        this.$store.dispatch("clearContext", { self: this})

        if (this.pickLookup[this.pickPostion].literal){
          return false
        }

        this.contextRequestInProgress = true
        this.$store.dispatch("fetchContext", { self: this, searchPayload: this.pickLookup[this.pickPostion].uri }).then(() => {
          
          // keep a local copy of it for looking up subject type
          if (this.contextData){
            this.localContextCache[this.contextData.uri] = JSON.parse(JSON.stringify(this.contextData))
          }

          this.contextRequestInProgress = false

        })  



    },

    selectContext: function(pickPostion){


      if (pickPostion){
        this.pickPostion=pickPostion
      }

      if (this.pickLookup[this.pickPostion].complex){
        // if it is a complex authorized heading then just replace the whole things with it
        this.subjectString = this.pickLookup[this.pickPostion].label
        this.activeComponentIndex = 0

        this.componetLookup = {}
        this.componetLookup[this.activeComponentIndex] = {}
        this.componetLookup[this.activeComponentIndex][this.pickLookup[this.pickPostion].label] = this.pickLookup[this.pickPostion]
        for (let k in this.pickLookup){
          this.pickLookup[k].picked=false
        }
        // complex headings are all topics (...probably)
        this.typeLookup[this.activeComponentIndex] = 'madsrdf:Topic'
        this.pickLookup[this.pickPostion].picked=true
        this.subjectStringChanged()
        this.$refs.subjectInput.focus()

      }else{

        console.log('1',JSON.parse(JSON.stringify(this.componetLookup)))

        // take the subject string and split
        let splitString = this.subjectString.split('--')

        // replace the string with what we selected

        splitString[this.activeComponentIndex] = this.pickLookup[this.pickPostion].label.replaceAll('-','‑')

        this.subjectString = splitString.join('--')


        if (!this.componetLookup[this.activeComponentIndex]){
          this.componetLookup[this.activeComponentIndex]= {}
        }


        this.componetLookup[this.activeComponentIndex][this.pickLookup[this.pickPostion].label.replaceAll('-','‑')] = this.pickLookup[this.pickPostion]

        for (let k in this.pickLookup){
          this.pickLookup[k].picked=false
        }

        this.pickLookup[this.pickPostion].picked=true


        console.log('2',JSON.parse(JSON.stringify(this.componetLookup)))
        this.subjectStringChanged()


      }


      
    },


    navInput: function(event){



      if (event.key == 'ArrowUp'){
        if (parseInt(this.pickPostion) <= this.searchResults.names.length*-1){
          return false
        }
        this.loadContext(parseInt(this.pickPostion) - 1 )
        event.preventDefault()
        return false
      }else if (event.key == 'ArrowDown'){
        
        if (parseInt(this.pickPostion) >= this.searchResults.subjectsSimple.length - 1 + this.searchResults.subjectsComplex.length){
          return false
        }
     

        this.loadContext(parseInt(this.pickPostion) + 1 )
        event.preventDefault()
        return false
      }else if (event.key == 'Enter'){



        if (event.shiftKey){
          this.add()
          return
        }




        this.selectContext()

      }else if (event.ctrlKey && event.key == "1"){

        this.searchModeSwitch("LCSHNAF")

      }else if (event.ctrlKey && event.key == "2"){

        this.searchModeSwitch("GEO")

      }else if (event.ctrlKey && event.key == "3"){

        this.searchModeSwitch("WORKS")

      }else if (this.searchMode == 'GEO' && event.key == "-"){


        if (this.components.length>0){
          let lastC = this.components[this.components.length-1]
          console.log(lastC)
          // if the last component has a URI then it was just selected
          // so we are not in the middle of a indirect heading, we are about to type it
          // so let them put in normal --
          if (lastC.uri){
            return true
          }

          // if the last string is a normal "-" then make this one normal too
          if (this.subjectString.slice(-1) == '-'){
            return true
          }

        }


        let start = event.target.selectionStart
        let end = event.target.selectionEnd
        console.log(this.subjectString.substring(0,start),'|',this.subjectString.substring(end,this.subjectString.length))
        
        this.subjectString = this.subjectString.substring(0,start) + '‑' + this.subjectString.substring(end,this.subjectString.length)
        this.subjectString=this.subjectString.trim()

        
        this.$nextTick(() => {

            console.log(start,end)
            event.target.setSelectionRange(start+1,end+1)


        })

        this.subjectStringChanged()

        event.preventDefault()
        return false

      }

          

    },

    updateAvctiveTypeSelected: function(){

      //set them all false
      for (let k in this.activeTypes){
        this.activeTypes[k].selected=false
      }

      if (this.activeComponent && this.activeComponent.type){
        if (this.activeTypes[this.activeComponent.type]){
          this.activeTypes[this.activeComponent.type].selected=true
        }
      }


    },



    setTypeClick: function(event,type){

      this.typeLookup[this.activeComponentIndex] =type
      this.subjectStringChanged()
      this.$refs.subjectInput.focus()

    },

    renderHintBoxes: function(){

        // wait for the UI to render
        this.$nextTick(() => {
          // loop through the current components
          let activeLeft=0
          for (let com of this.components){       
            // set the left 
            this.$refs['cBackground'+com.id][0].style.left = `${activeLeft}px`
            // add the width of all the existing components to the var
            // add 12 to accomodate the "--" seperator
            activeLeft = activeLeft + this.$refs['cBackground'+com.id][0].offsetWidth + 11
          }          
        })

    },

    validateOkayToAdd: function(){

      this.okayToAdd = false
      let allHaveURI = true
      let allHaveType = true

      for (let c of this.components){

        if (!c.uri && !c.literal){
          allHaveURI = false
        }
        if (!c.type){
          allHaveType = false
        }

      }

      if (allHaveURI && allHaveType){
        this.okayToAdd = true
      }
      if (allHaveURI && !allHaveType && this.components.length==1){
        this.okayToAdd = true
      }



    },

    subjectStringChanged: async function(event){

      // they are setting the type, next key inputed is important
      if (event && event.data === '$'){
        this.nextInputIsTypeSelection=true
        return false
      }

      // if the event coming in is the keystroke after a '$' then check to change the type
      if (event && this.nextInputIsTypeSelection){

        if (event.data.toLowerCase()==='a' || event.data.toLowerCase()==='x'){
          this.typeLookup[this.activeComponentIndex] = 'madsrdf:Topic'
          this.subjectString=this.subjectString.replace('$'+event.data,'')
        }
        if (event.data.toLowerCase()==='v'){
          this.typeLookup[this.activeComponentIndex] = 'madsrdf:GenreForm'
          this.subjectString=this.subjectString.replace('$'+event.data,'')
        }
        if (event.data.toLowerCase()==='z'){
          this.typeLookup[this.activeComponentIndex] = 'madsrdf:Geographic'
          this.subjectString=this.subjectString.replace('$'+event.data,'')
        }
        if (event.data.toLowerCase()==='y'){
          this.typeLookup[this.activeComponentIndex] = 'madsrdf:Temporal'
          this.subjectString=this.subjectString.replace('$'+event.data,'')
        }

        this.nextInputIsTypeSelection = false
        this.subjectStringChanged()

      }else{

        // its a normal keystroke not after '$' but check to see if it was a keyboard event
        // if not then event will be null and was just evoked from code, if its a event then they are typeing in a search value, clear out the old
        if (event){
          this.searchResults=null  
        }        
      }



      this.showTypes=true
      
      // if they erase everything remove the components
      if (this.subjectString.length==0){
        this.activeComponent = null
        this.activeComponentIndex=0
        this.componetLookup = {}
        this.typeLookup={}
      }

      let subjectStringSplit = this.subjectString.split('--')


      // clear the current
      this.components = []
      let id = 0      

      let activePosStart = 0

      for (let ss of subjectStringSplit){


        // check the lookup to see if we have the data for this label

        let uri = null
        let type = null
        let literal = null

        if (this.componetLookup[id] && this.componetLookup[id][ss]){
          uri = this.componetLookup[id][ss].uri
          literal = this.componetLookup[id][ss].literal
        }

        if (this.typeLookup[id]){
          type = this.typeLookup[id]
        }

        
        

        this.components.push({

          label: ss,
          uri: uri,
          id: id,
          type:type,
          complex: ss.includes('‑'),
          literal:literal,
          posStart: activePosStart,
          posEnd: activePosStart + ss.length - 1,
        })


        // increase the start length by the length of the string and also add 2 for the "--"
        activePosStart = activePosStart + ss.length + 2



        this.renderHintBoxes()


        id++
      }

      




      // if they are typing in the heading select it as we go
      if (event){
        for (let c of this.components){
          if (event.target.selectionStart >= c.posStart && event.target.selectionStart <= c.posEnd+1){
            this.activeComponent = c
            this.activeComponentIndex = c.id
            // it is not empty
            // it dose not end with "-" so it the '--' typing doesn't trigger
            if (c.label.trim() != '' && !c.label.endsWith('-')){
              this.searchApis(c.label,event.target.value,this)
            
            // BUT if it ends with a number and - then it is a name with open life dates
            // so do look that one up
            }else if (/[0-9]{4}\??-/.test(c.label)){
              this.searchApis(c.label,event.target.value,this)



            }else if (/,\s[0-9]{4}-/.test(c.label)){
              this.searchApis(c.label,event.target.value,this)



            }


            //            // BUT if it starts with 

            break
          }
        }
      }else{

        // if there is no event this was triggered from code
        // so the current active component is the one we need to update with anything changed
        // which would likely be the type if not a keyboard event

        this.activeComponent = this.components[this.activeComponentIndex]
        

      }

      this.updateAvctiveTypeSelected()

      if (this.components.length==1 && this.components[0].complex){
        this.showTypes=false

      }


      this.validateOkayToAdd()

      this.$nextTick(() => {
        this.checkToolBarHeight()


        // there are some senarios where we can safly assume the type, this is invoked when
        // we want to try that, often delayed after something has been selected

        window.setTimeout(()=>{
          for (let x of this.components){
            if (this.localContextCache[x.uri]){
              if (this.localContextCache[x.uri].type === 'GenreForm'){
                x.type = 'madsrdf:GenreForm'
              }
            }         
          }
          this.updateAvctiveTypeSelected()
          this.validateOkayToAdd()
        },100)
        
      })






      // if (event === null){
      //   console.log(event)
      // }

    },

    add: function(){

      // remove our werid hyphens before we send it back
      for (let c of this.components){
        c.label = c.label.replaceAll('‑','-')
      }

      this.$emit('subjectAdded', this.components)


      

    },


    closeEditor: function(){

      this.$emit('closeEditor', true)

    },

    checkToolBarHeight: function(){

      // also check to see if the toolbar is off the screen,
      // in very very low res setups sometimes this area gets clipped
      if (this.$refs.toolbar.getBoundingClientRect().bottom > window.innerHeight){
        this.lowResMode=true  
        this.$emit('lowResModeActivate', true)
      }

      
    },


    loadUserValue: function(userValue){

      // reset things if they might be opening this again for some reason
      this.components= []
      this.lookup= {}
      this.searchResults= null
      this.activeSearch= false
      this.pickPostion= 0
      this.pickLookup= {}
      this.activeComponent= null
      this.oldActiveComponent= null
      this.activeComponentIndex=0
      this.oldActiveComponentIndex= 99
      this.contextRequestInProgress= false
      this.componetLookup= {}
      this.nextInputIsTypeSelection=false
      this.typeLookup={}
      this.okayToAdd= false
      this.showTypes= false


      

      if (!userValue){
        return
      }


      if (typeof userValue == "string"){

        
        // they sometimes come in with '.' at the end of the authorized form
        if (userValue.slice(-1)=='.'){
          userValue=userValue.slice(0,-1)
        }
        this.subjectString=userValue
        this.$nextTick(() => {
          this.navString({key:'ArrowRight'})        
        })


        return
      }

      // if they just passed a string they are typing a new one not editing
      // if (typeof userValue == "string"){
      //   this.subjectString=userValue
      //   return
      // }





      let completeLabel = null

        // does it have a component list?

        if (userValue['http://www.loc.gov/mads/rdf/v1#componentList']){

          let authLabels = []
          
          let componentLabelParts = []

          // if there is a complex heading string use that as a backup for labels if needed
          if (userValue['http://www.w3.org/2000/01/rdf-schema#label']){
            if (userValue['http://www.w3.org/2000/01/rdf-schema#label'].length>0){
              authLabels = userValue['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label'].split('--')
              completeLabel = userValue['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label']
            }
          }else if (userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']){
            if (userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'].length>0){
              authLabels = userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'].split('--')
              completeLabel = userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']
            }
          }



          let id = 0
          let activePosStart = 0

          for (let component of userValue['http://www.loc.gov/mads/rdf/v1#componentList']){

            let label = ''
            let uri = null
            let type = null
            let literal = false




            // does it have a URI
            if (component['@id']){
              uri = component['@id']
            }else{
              
              // we can't assume it is a literal, it might just be a label without no uri
              // they need to check it
              // literal = true
            }

            if (component['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'] && component['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'].length>0){
              if (component['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']){
                label = component['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']
              }
            }else if (component['http://www.w3.org/2000/01/rdf-schema#label'] && component['http://www.w3.org/2000/01/rdf-schema#label'].length>0){
              if (component['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label']){
                label = component['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label']
              }
            }


            if (component['@type']){

              if (component['@type']=='http://www.loc.gov/mads/rdf/v1#Geographic'){
                type = 'madsrdf:Geographic'
              }
              if (component['@type']=='http://www.loc.gov/mads/rdf/v1#Topic'){
                type = 'madsrdf:Topic'
              }
              if (component['@type']=='http://www.loc.gov/mads/rdf/v1#GenreForm'){
                type = 'madsrdf:GenreForm'
              }
              if (component['@type']=='http://www.loc.gov/mads/rdf/v1#Temporal'){
                type = 'madsrdf:Temporal'
              }                            

            }


            if (label == '' && authLabels[id]){
              
              label = authLabels[id]
            }


            let toAdd = {
              label: label,
              uri: uri,
              id: id,
              type:type,
              complex: label.includes('‑'),
              literal:literal,
              posStart: activePosStart,
              posEnd: activePosStart + label.length - 1,
            }

            componentLabelParts.push(label)

            this.components.push(toAdd)

            if (!this.componetLookup[id]){
              this.componetLookup[id]={}
            }

            if (type){
              this.typeLookup[id]=type
            }

            this.componetLookup[id][label] = toAdd


            activePosStart = activePosStart + label.length + 2

            id++

          }


          
          completeLabel = componentLabelParts.join('--')



          

        }else{

          if (userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']){
            completeLabel = userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']
          }else if(userValue['http://www.w3.org/2000/01/rdf-schema#label']){
            completeLabel = userValue['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label']
          }


          // if it has a trailing '.' in the auth heading drop that for search 
          if (completeLabel.slice(-1)=='.'){
            completeLabel=completeLabel.slice(0,-1)
          }




        }








        this.subjectString=completeLabel

        // this.subjectStringChanged()
        // this.updateAvctiveTypeSelected()

        // wait for the ui to render and then pretend keydonw to trigger update of things
        this.$nextTick(() => {
          this.navString({key:'ArrowRight'})  

        })

    }




  },




  created: function () {

    this.loadUserValue()

  },


  mounted: function () {
    


  }
};
</script>
