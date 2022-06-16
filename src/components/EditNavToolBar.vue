<style>

.option-button{
        position: absolute;
    top: 15px;
    font-size: larger;
    border-radius: 0.25em;
    width: 100px;
    background-color: white;
    color: rgb(44, 62, 80);
    border: 1px solid #2c3e50;
    padding: 0;
    font-weight: bold;
}


.subject-list-button{
position: absolute;
    top: 15px;
    font-size: larger;
    border-radius: 0.25em;
    width: 50px;
    background-color: white;
    color: rgb(44, 62, 80);
    border: 1px solid #2c3e50;
    padding: 0;
    font-weight: bold;
    left: -58px;
    max-height: 28px;
    min-height: 28px;
}


.subject-edit-link{
  cursor: pointer;
}

.subject-edit-link:hover{
  font-weight: bold;

}


.option-button:hover, .subject-list-button:hover{
    background-color: whitesmoke;
    cursor: pointer;
}

.log-button{
    position: absolute;
    top: 15px;
    left: 160px;
    font-size: larger;
    border-radius: 0;
    width: 50px;
    height: 26px;
    max-height: 26px;
    min-height: 26px;
    
    background-color: white;
    color: rgb(44, 62, 80);
    border: 1px solid #2c3e50;
    padding: 0;
    font-weight: bold;
    border-left: none;
    border-right: none;

}
.log-button:hover{
    background-color: whitesmoke;
    cursor: pointer;
}

#undo-log-container{
  border: 1px solid #2c3e50;
  padding: 0.25em;
  border-radius: 0.25em;
  z-index: 10000;
  position:absolute;
  height: 80vh;
  top: 100%;
  width: 450px;
  background-color:white;   
}
.undo-log{
  padding: 0.1em;
}
.undo-log:hover{
  background-color: rgb(43 71 255 / 8%) !important;
}

#undo-log-container .undo-log:nth-child(odd){
  background-color: whitesmoke;
}


.undo-current-index{
  border: 2px solid #0000ff3b;
}

.undo-restore-link:hover{
  font-weight: bold;

}

button:disabled,
button[disabled]{
  cursor: not-allowed;
  opacity: 0.25;
}


.undo-button{
    position: absolute;
    top: 15px;
    left: 110px;
    height: 26px;
    max-height: 26px;
    min-height: 26px;

    border-radius: 0.25em;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    width: 50px;
    background-color: white;
    color: rgb(44, 62, 80);
    border: 1px solid #2c3e50;
    padding: 0;
    font-weight: bold;
}
.undo-button:hover{
    background-color: whitesmoke;
    cursor: pointer;
}
.redo-button{
    position: absolute;
    top: 15px;
    left: 210px;
    height: 26px;
    max-height: 26px;
    min-height: 26px;

    border-radius: 0.25em;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    width: 50px;
    background-color: white;
    color: rgb(44, 62, 80);
    border: 1px solid #2c3e50;
    padding: 0;
    font-weight: bold;
}
.redo-button:hover{
    background-color: whitesmoke;
    cursor: pointer;
}

.toolbar-main-button{
    background-color:white; 
    cursor:pointer; 
    margin-right: 1em;
    border: 1px solid #2c3e5063;
    color:  #2c3e50;
    text-decoration: none !important;
    height: 96%;
    margin-top: 1px;    
}

.toolbar-main-button:hover{
    background-color: whitesmoke !important;
}

.component-default{
    margin: 1em 0 1em 0;
    padding: 1em 0 1em 0;
    transition: background-color 400ms;
}
.component-compact{
    margin: 0;
    padding: 0;
    transition: background-color 400ms;
}



  .slider input[type=checkbox]{
    height: 0;
    width: 0;
    visibility: hidden;
  }

  .slider label {
    cursor: pointer;
    text-indent: -9999px;
    width: 50px;
    height: 25px;
    background: grey;
    display: block;
    border-radius: 25px;
    position: relative;
  }

  .slider label:after {
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

  .slider input:checked + label {
    background: #bada55;
  }

  .slider input:checked + label:after {
    left: calc(100% - 5px);
    transform: translateX(-100%);
  }

  .slider label:active:after {
    width: 45px;
  }


.is-hidden-li::before{
    content: "";
}


.enriched-menu{
    position: relative;
    cursor: pointer;
}
.enriched-menu .enriched-menu-controls{
    display: none;
    float: right;
    position: absolute;
    top: 0;
    right: 0;
}



.enriched-menu-icon{
    fill: white;
}
/*.enriched-menu-controls:hover .enriched-menu-icon{
    fill: blue;
}
*/
.enriched-menu:hover{
    background-color: #6f6f6f;
}

.enriched-menu:hover .enriched-menu-controls{
    display: block;
}

.enriched-menu-controls button{
    background-color: transparent;
    color: white;
    font-weight: bold;
    cursor: pointer;
    height: 25px;
    padding: 0;
}
.enriched-menu-controls button:hover{
    /*background-color: white;*/
    color: black;
}
.enriched-menu-controls button:hover .enriched-menu-icon{
    /*background-color: white;*/
    fill: red;
    color: black;
}


#subject-reorder-display{
  width: 75%; 
  left: 12%;
  border: solid 2px black;
  height: 470px;
  background-color: white;
  position: absolute;
  z-index: 100;
}



.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
  margin: 0;
  padding: 0;

}



.list-group-item:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
}

.list-group-item {
  cursor: move;
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid rgba(0,0,0,.125);
  width: 90%;
  margin-left: auto;
  margin-right: auto;

}

.list-group-item::before{
  content: "";
}



.list-group-item i {
  cursor: pointer;
}


.logo-home-text {
  stroke: rgb(42, 42, 42);
  stroke-width: 0;
  
}

.logo-home-text:hover {
  fill: white;
  stroke-width: 1;
  stroke-linejoin: round;
  stroke-dasharray: 100 100;
  stroke-dashoffset: 0;
  animation: stroke 5s infinite linear;
}

.logo-home-text:hover:nth-child(5n+1) {
  stroke: rgb(42, 42, 42);
  animation-delay: -1.2s;
}


@-webkit-keyframes stroke {
  100% {
    stroke-dashoffset: -400;
  }
}
@keyframes stroke {
  100% {
    stroke-dashoffset: -400;
  }
}   



.template-td:hover{
    background-color: #f8fec6;
    cursor: pointer;
}

</style>

<template>

  <header ref="header" class="inital">

       <div style="display:flex; height: 50px;">

          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 88, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="togglePreview" />
          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 80, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="publish" />
          <Keypress key-event="keydown" :key-code="27" @success="escapeKey" />



            <div style="flex:1">



              <div v-if="diagramMiniMap !== false" style="height: 50px;">
                

                <router-link to="/">
                  <div  style="display:inline-block; cursor: pointer; width: 50px; height:50px;">





                    <svg viewBox="0 0 20 20">
                      <!-- Symbol-->
                      <symbol id="s-text">
                        <text style="font-family: sans-serif;" text-anchor="middle" x="50%" y="50%" dy=".35em">M</text>
                      </symbol>
                      <!-- Duplicate symbols-->
                      <use class="logo-home-text" xlink:href="#s-text"></use>
                      <use class="logo-home-text" xlink:href="#s-text"></use>
                      <use class="logo-home-text" xlink:href="#s-text"></use>
                      <use class="logo-home-text" xlink:href="#s-text"></use>
                      <use class="logo-home-text" xlink:href="#s-text"></use>
                    </svg>




                  </div>
                </router-link>


                  <div  style="display:inline-block; cursor: pointer" @click="miniMapClick(diagramMiniMap)">

                    <template v-if="diagramMiniMap.type != 'Hub'">
                        <svg v-if="activeMiniMap.URI != diagramMiniMap.URI" width="2.1em" height="3.1em" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle fill="#7badad" cx="1em" cy="1.5em" r="0.9em"/>
                        </svg>

                        <svg v-else  width="2.1em" height="3.1em" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle stroke="rgb(255 49 49)" stroke-width="2" fill="#7badad" cx="1em" cy="1.5em" r="0.9em"/>
                        </svg>
                    </template>
                    <template v-else>

                        <svg width="50px" height="50px"  version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                         <path fill="royalblue" d="m62.113 24.66 1.9023-15.238 18.875 32.691-7.5469 20.004 15.238 1.9023-32.691 18.875-20.004-7.5469-1.9023 15.238-18.875-32.691 7.5469-20.004-15.238-1.9023 32.691-18.875zm-17.684 15.695-4.0781 15.215 15.215 4.0781 4.0781-15.215z" fill-rule="evenodd"/>
                        </svg>   


                    </template>


                  </div>




                  <div style="display:inline-block; height: 50px; top: 0; line-height: 50px;" v-for="instance in diagramMiniMap.instances" v-bind:key="instance.uri">
                    

                    <div style="display:inline-block; width: 25px;">



                      <svg  viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="0" x2="100" y2="0" stroke="black" stroke-width="10" />
                      </svg>


                    </div>
                    <div style="display:inline-block;cursor: pointer;" @click="miniMapClick(instance)">


                      <svg v-if="activeMiniMap.URI != instance.URI" data-v-6fe723ec="" version="1.1" viewBox="0 0 100 100" style="width: 2em; height:3em"><path data-v-6fe723ec="" d="M50,1.4l48.8,48.8L50,99.1L1.2,50.3L50,1.4z" style="fill: rgb(139, 88, 139); stroke: rgb(10, 19, 26); stroke-width: 0.5; stroke-miterlimit: 10;"></path></svg>
                      <svg v-else data-v-6fe723ec="" version="1.1" viewBox="0 0 100 100" style="width: 2em; height:3em"><path data-v-6fe723ec="" d="M50,1.4l48.8,48.8L50,99.1L1.2,50.3L50,1.4z" style="fill: rgb(139, 88, 139); stroke: rgb(255 49 49); stroke-width: 5; stroke-miterlimit: 10;"></path></svg>

                    </div>
                  

                    <div style="display:inline-block; height: 50px; line-height: 50px;" v-for="item in instance.items" v-bind:key="item.uri">

                      
                      <div style="display:inline-block; width: 15px;">
                        <svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="0" x2="100" y2="0" stroke="black" stroke-width="10" />
                        </svg>
                      </div>

                      <div style="display:inline-block; height:50px; width: 25px;cursor: pointer;" @click="miniMapClick(item)">
                        <svg v-if="activeMiniMap.URI != item.URI" viewBox="0 0 50 72" version="1.1" xmlns="http://www.w3.org/2000/svg">

                             <rect width="50px" height="50px" style="fill:#eaeaea;stroke-width:0.5;stroke:rgb(0,0,0)" />
                        </svg>
                        <svg v-else viewBox="0 0 50 72" version="1.1" xmlns="http://www.w3.org/2000/svg">

                             <rect width="50px" height="50px" style="fill:#eaeaea;stroke-width:5;stroke:rgb(255 49 49)" />
                        </svg>

                        
                      </div>




                    </div>

                  </div>




                <div style="display:inline-block;height: 50px; position:relative; padding-left: 10px;">
                    

                    <select v-model="miniMapActionValue" @change="miniMapAction" v-if="activeMiniMap.type == 'Instance'" style="position:absolute; top:15px; font-size: larger; border-radius: 0.25em; width:100px">
                      <option selected disabled value="Actions">Actions</option>
                      <option value="cloneInstance">Clone and Replace Instance</option>
                      <option value="addItem">Add Item</option>
                      <option value="deleteInstance">Delete Instance</option>


                    </select>

                    <select v-else-if="activeMiniMap.type == 'Item'" v-model="miniMapActionValue" @change="miniMapAction"  style="position:absolute; top:15px; font-size: larger;    border-radius: 0.25em; width:100px">
                      <option selected disabled value="Actions">Actions</option>
                      <option value="deleteItem">Remove Item</option>
                      <option value="cloneItem">Duplicate Item</option>

                    </select>

                    <select v-else-if="diagramMiniMap.type == 'Hub'" v-model="miniMapActionValue" @change="miniMapAction"  style="position:absolute; top:15px; font-size: larger;    border-radius: 0.25em; width:100px">
                      <option selected disabled value="Actions">Actions</option>


                    </select>



                    <select v-else v-model="miniMapActionValue" @change="miniMapAction"  style="position:absolute; top:15px; font-size: larger;    border-radius: 0.25em; width:100px">
                      <option selected disabled value="Actions">Actions</option>
                      <option value="addInstance">Add Instance</option>
                      <option value="addItem">Add Item to First Instance</option>

                    </select>

    

                </div>


              </div>






            </div>


            <div style="flex:1; position:relative;">
                
                <button class="subject-list-button" name="subject-list" title="subject-list" @click="toggleSubjectListDisplay()" style="">

                  <svg width="25px" height="25px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                   <path d="m5 83c0-3.6406 2.1914-6.9219 5.5547-8.3164 3.3633-1.3906 7.2344-0.62109 9.8086 1.9531s3.3438 6.4453 1.9531 9.8086c-1.3945 3.3633-4.6758 5.5547-8.3164 5.5547-4.9688 0-9-4.0312-9-9zm9-57c3.6406 0 6.9219-2.1914 8.3164-5.5547 1.3906-3.3633 0.62109-7.2344-1.9531-9.8086s-6.4453-3.3438-9.8086-1.9531c-3.3633 1.3945-5.5547 4.6758-5.5547 8.3164 0 4.9688 4.0312 9 9 9zm0 33c3.6406 0 6.9219-2.1914 8.3164-5.5547 1.3906-3.3633 0.62109-7.2344-1.9531-9.8086s-6.4453-3.3438-9.8086-1.9531c-3.3633 1.3945-5.5547 4.6758-5.5547 8.3164 0 4.9688 4.0312 9 9 9zm30-36h45c3.3125 0 6-2.6875 6-6s-2.6875-6-6-6h-45c-3.3125 0-6 2.6875-6 6s2.6875 6 6 6zm0 33h45c3.3125 0 6-2.6875 6-6s-2.6875-6-6-6h-45c-3.3125 0-6 2.6875-6 6s2.6875 6 6 6zm0 33h45c3.3125 0 6-2.6875 6-6s-2.6875-6-6-6h-45c-3.3125 0-6 2.6875-6 6s2.6875 6 6 6z"/>
                  </svg>


                </button>

                <button class="option-button" name="optopns" title="options" @click="toggleOptionDisplay" style="">
                    Options
                </button>

                <div v-if="optionDisplay" style="border: 1px solid #2c3e50; padding: 1em; border-radius: 0.25em; z-index: 10000; position:absolute; height: 80vh; top: 100%; width: 450px; background-color:white; ">
                        
                    
                    <div style="display:flex; border: solid 2px whitesmoke;">

                        <div style="flex:1; align-self: center; text-align: center; margin-right: 5px; ">
                            Display Layout
                        </div>
                        <div style="flex:1; background-color: whitesmoke;">
                            <div>
                                <input type="radio" name="radio" @change="updateLayout('default')" id="display-select-default" :checked="(settingsDisplayMode=='default')">
                                <label for="display-select-default">Extra Space</label>
                            </div>

                            <div>
                                <input type="radio" name="radio" @change="updateLayout('compact')" id="display-select-compact" :checked="(settingsDisplayMode=='compact')">
                                <label for="display-select-compact">Compact</label>                                
                            </div>

                            <div>
                                <input type="radio" name="radio" @change="updateLayout('spreadsheet')" id="display-select-spreadsheet" :checked="(settingsDisplayMode=='spreadsheet')">
                                <label for="display-select-spreadsheet">Spreadsheet (BETA)</label>   
                            </div>                                                      
                        </div>                    
                    </div>
                    <div style="display:flex; border: solid 2px whitesmoke;" class="slider">

                        <div style="flex:1; align-self: center; text-align: center; margin-right: 5px; ">
                            Hide Empty Fields
                        </div>
                        <div style="flex:1; background-color: whitesmoke; align-self: center; text-align: center;">
                            <input  type="checkbox" id="switch" v-model="hideFields" @change="updateHideEmptyFields()"  /><label for="switch">Toggle</label>
                        </div>
                    </div>
                    <div style="display:flex; border: solid 2px whitesmoke;" class="slider">

                        <div style="flex:1; align-self: center; text-align: center; margin-right: 5px; ">
                            Enriched Left Menu
                        </div>
                        <div style="flex:1; background-color: whitesmoke; align-self: center; text-align: center;">
                            <input  type="checkbox" id="switch2" @change="updateLeftMenuEnriched()" v-model="leftMenuEnriched" /><label for="switch2">Toggle</label>
                        </div>
                    </div>    




<!--                     <div style="display:flex; border: solid 2px whitesmoke;">

                        <div style="flex:1; align-self: center; text-align: center; margin-right: 5px; ">
                            Large Literal Display
                        </div>
                        <div style="flex:1; background-color: whitesmoke;">
                            <div>
                                <input type="radio" name="literalOptionRadio" @change="updateLiteralOption('LARGE_FIELDS')" id="literal-option-large-fields" :checked="(settingsTreatLikeNoteFields=='LARGE_FIELDS')">
                                <label for="literal-option-large-fields">For any large value</label>
                            </div> 

                            <div>
                                <input type="radio" name="literalOptionRadio" @change="updateLiteralOption('NOTE_FIELDS')" id="literal-option-note-fields" :checked="(settingsTreatLikeNoteFields=='NOTE_FIELDS')">
                                <label for="literal-option-note-fields">Just Note type fields</label>                                
                            </div>

                            <div>
                                <input type="radio" name="literalOptionRadio" @change="updateLiteralOption('ALL_FIELDS')" id="literal-option-all-fields" :checked="(settingsTreatLikeNoteFields=='ALL_FIELDS')">
                                <label for="literal-option-all-fields">All Fields</label>   
                            </div>                                                      
                        </div>                    
                    </div> -->



          
                  
                </div>


                <button class="undo-button" :disabled="(undoIndex==0)" title="undo" @click="undoRedo('undo',1)">
                  <svg width="25px" height="25px" version="1.1" viewBox="0 0 105 105" xmlns="http://www.w3.org/2000/svg">
                   <path d="m36.605 58.57v-17.141h17.145c9.4531 0 17.145 7.6914 17.145 17.141 0 9.4531-7.6914 17.145-17.145 17.145h-17.145v19.285h17.145c20.086 0 36.43-16.344 36.43-36.43 0-20.086-16.344-36.43-36.43-36.43h-17.145v-17.141l-26.785 26.785z"/>
                  </svg>
                                 

                </button>
                <button class="log-button" title="log" @click="toggleUndoDisplay">
                    Log
                </button>

                <button class="redo-button" :disabled="(undoIndex==undoLog.length-1)"   title="redo" @click="undoRedo('redo',1)">
                  <svg width="25px" height="25px" version="1.1" viewBox="0 0 105 105" xmlns="http://www.w3.org/2000/svg">
                   <path d="m90.18 31.785-26.785-26.785v17.141h-17.145c-20.086 0-36.43 16.344-36.43 36.43 0 20.09 16.344 36.43 36.43 36.43h17.145v-19.285h-17.145c-9.4531 0-17.145-7.6914-17.145-17.145 0-9.4531 7.6914-17.141 17.145-17.141h17.145v17.141z"/>
                  </svg>
                </button>


                <div v-if="undoDisplay" id="undo-log-container">
                    <div class="undo-log" v-for="(u,idx) in Array.from(undoLog).reverse()" :key="'undo_'+idx" >
                      <div :class="{ 'undo-current-index' : (undoLog.length - idx - 1  == undoIndex) }" style="display:flex; align-items: center; justify-content: center;">
                        <div style="flex:2; ">
                          <div v-for="(l,idx2) in u.log" :key="'undolog_'+idx+'_'+idx2">{{l}}</div>
                        </div>
                        <div class="undo-restore-link" style="flex:1; text-align:center; cursor: pointer;" @click="undoRedo('goto',undoLog.length - idx - 1)">Restore</div>

                      </div>
                      
                    </div>      
                      
                  
                </div>






            </div>
            <div style="flex:1; text-align: right;">


              <div style="display:inline-block; margin-right:1em;">
                <div class="simptip-position-left" data-tooltip="View the editor manual" style="display:flex; height: 20px;max-height: 20px;">
                  <div style="flex:1">

                  <a href="https://guides.loc.gov/c.php?g=1170551&p=8550706&preview=003264c97f504caf990125066b248e24" target="_blank">
                  <svg width="20px" height="20px" version="1.1" viewBox="5 -10 110 110" xmlns="http://www.w3.org/2000/svg">
                   <path d="m45.102 84.898l52.801-30.699-5.6992-3.3008-47.102 27.402-7.8984-4.6016-29.102-16.699v-7.6992l26 15 11 6.3008 52.801-30.699-5.6992-3.3008-47.102 27.398-7.8984-4.6016-29-16.699-0.003906-7.6992 36.801 21.301 52.801-30.699-42.801-24.801-52.898 30.699v42.902l32 18.398 11 6.3008 52.801-30.699-5.6992-3.3008-47.102 27.5-7.9023-4.6016-29-16.699v-7.6992l26 15zm-5.7031-55.598c1.6016-0.80078 3.1016-1.1992 4.3984-1.3984 1.8008-0.19922 4.3008-0.10156 7.6016 0.19922 1.6016 0.19922 3.1992 0.19922 4.6992 0 1.5-0.19922 2.8008-0.69922 4-1.3008 1.1992-0.69922 1.8984-1.5 2-2.3008 0.10156-0.80078-0.5-1.6016-1.6992-2.3008-1-0.60156-2.1016-0.89844-3.3984-0.89844-0.80078 0-1.6016 0.10156-2.3984 0.30078-0.89844 0.30078-2.1016 0.19922-2.8984-0.30078l-4.7031-2.8008c-0.60156-0.39844-0.60156-0.89844 0.10156-1.1992 2.6992-1.3984 5.6016-1.8984 8.8008-1.6992 3.6016 0.30078 7 1.3984 10.301 3.3008 3.5 2 5.3984 4.1992 5.6992 6.3984 0.30078 2.1992-1.1016 4.1992-4.1016 5.8984-1.8008 1.1016-4.1016 1.6992-6.8008 2s-5.3008 0.19922-7.8984-0.30078c-1.6016-0.19922-2.8984-0.19922-3.8984 0.10156-0.69922 0.19922-1.5 0.39844-2.3008 0.80078-0.60156 0.30078-1.6016 0.30078-2.1992-0.10156l-5.1992-3c-0.80469-0.39844-0.80469-1.0977-0.10547-1.3984zm-8.7969 5.0977l2.6992-1.6016c0.89844-0.5 2.3984-0.5 3.3008 0l4.1992 2.3984c0.89844 0.5 0.89844 1.3984 0 1.8984l-2.6992 1.6016c-0.89844 0.5-2.3984 0.5-3.3008 0l-4.1992-2.3984c-0.90234-0.49609-0.90234-1.3984 0-1.8984z"/>
                  </svg>
                  </a>

                  </div>

                  <div style="flex:1">
                                    <a style="color:#2c3e50" href="https://guides.loc.gov/c.php?g=1170551&p=8550706&preview=003264c97f504caf990125066b248e24" target="_blank">Manual</a></div>


                </div>

                <div class="simptip-position-left" data-tooltip="This record is saved in your My Records page" v-if="activeRecordSaved">
                    
                    <div  style="display: inline-block; height: 10px; margin-right: 5px; width:10px; border-radius:1em; background-color:green"></div><div style="display: inline-block;">Saved</div>

                </div>
                <div class="simptip-position-left" data-tooltip="The record has not yet saved to your My Records page" v-else>

                    <div  style="display: inline-block; height: 10px; margin-right: 5px; width:10px; border-radius:1em; background-color:orange"></div><div style="display: inline-block;">Saving</div>

                </div>


              </div>




                <button class="simptip-position-left toolbar-main-button" @click="toggleTemplate" data-tooltip="Create Template ([CTRL+SHIFT+T])">
                    <svg width="50px" height="34px"  version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                     <path d="m11.719 11.723v15.613h15.629v-15.613zm20.312 0v15.613h15.629v-15.613zm20.309 0v15.613h15.633v-15.613zm20.312 0v15.613h15.633v-15.613zm-60.934 20.312v15.625l15.629 0.003906v-15.629zm20.312 0v15.625l15.629 0.003906v-15.629zm20.309 0v15.625l15.633 0.003906v-15.629zm20.312 0v15.625l15.633 0.003906v-15.629zm-60.934 20.309v15.629l15.629 0.003906v-15.633zm20.312 0v15.629l15.629 0.003906v-15.633zm20.309 0v15.629l15.633 0.003906v-15.633zm20.312 0v15.629l15.633 0.003906v-15.633zm-60.934 20.312v15.625l15.629 0.003906v-15.629zm20.312 0v15.625l15.629 0.003906v-15.629zm20.309 0v15.625l15.633 0.003906v-15.629zm20.312 0v15.625l15.633 0.003906v-15.629z" fill-rule="evenodd"/>
                    </svg>

                </button>

                <button class="simptip-position-left toolbar-main-button" @click="togglePreview" data-tooltip="Preview XML ([CTRL+SHIFT+X])">
                    <svg width="50px" height="34px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                     <path d="m60.199 12.367c2.1836 0.58984 3.4766 2.8281 2.8906 5.0156l-18.273 67.949c-0.48828 1.8281-2.1406 3.0312-3.9492 3.0312-0.35156 0-0.71484-0.042969-1.0664-0.14453-2.1836-0.58984-3.4766-2.8281-2.8906-5.0156l18.273-67.949c0.58984-2.1875 2.8555-3.4844 5.0156-2.8867zm-30.332 17.617c1.5977 1.5977 1.5977 4.1914 0 5.7891l-14.445 14.445 14.461 14.617c1.5938 1.6094 1.5742 4.2031-0.03125 5.793-0.80078 0.78125-1.8359 1.1758-2.8789 1.1758-1.0547 0-2.1055-0.40234-2.9141-1.2109l-17.32-17.508c-0.84375-0.84766-1.2344-1.9766-1.1758-3.0859 0.046875-0.98047 0.44531-1.9453 1.1914-2.6953l17.324-17.32c1.5977-1.5898 4.1914-1.5898 5.7891 0zm45.855-0.027344 17.504 17.324c0.67188 0.66016 1.0625 1.5 1.1797 2.3633 0.16797 1.2266-0.21875 2.5156-1.1602 3.4609l-17.508 17.508c-0.80078 0.78906-1.8516 1.1914-2.8945 1.1914s-2.0977-0.40234-2.8945-1.1914c-1.6016-1.6016-1.6016-4.1953 0-5.793l14.602-14.605-14.586-14.434c-1.6094-1.5898-1.6172-4.1797-0.035156-5.7891 1.582-1.6055 4.1758-1.625 5.793-0.035157z"/>
                    </svg>
                </button>

                <button class="simptip-position-left toolbar-main-button" @click="toggleLiteralLanguage" data-tooltip="Select Language"> 
                    <svg width="50px" height="34px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                     <path d="m93.75 6.25v68.75h-37.5l-25 18.75v-18.75h-25v-68.75zm-21.875 15.625v-6.25h-6.25v6.25h-9.375v6.25h15.488c-0.16016 1.9023-0.46094 3.7891-0.91016 5.6484-0.66406 2.7422-1.6484 5.3984-2.9062 7.918-0.39453-0.46875-0.77344-0.94922-1.1484-1.4297-1.6836-2.1914-3.1641-4.5312-4.4453-6.9766-0.054687-0.11328-0.11719-0.22656-0.17578-0.33984l-5.5547 2.8594 0.18359 0.35937 0.19531 0.375c2.0625 3.8555 4.5625 7.5117 7.5273 10.734-0.62109 0.84375-1.2734 1.6641-1.957 2.4531-1.3164 1.5234-2.7461 2.9414-4.2773 4.2461-0.66797 0.56641-1.3555 1.1016-2.0586 1.6289-0.41406 0.29688-0.41406 0.29688-0.83203 0.59375-0.42578 0.28906-0.42578 0.28906-0.85547 0.57422l3.4531 5.2109c2.2031-1.4609 4.2812-3.0977 6.1992-4.918 1.7852-1.6953 3.4258-3.5312 4.9141-5.4883 1.5664 1.2422 3.2383 2.3438 5.0234 3.2461 0.96484 0.48438 1.957 0.89453 2.9766 1.2539l2.0703-5.8984c-0.65625-0.23047-1.2969-0.48438-1.9219-0.78516-1.6914-0.8125-3.2578-1.8711-4.7031-3.0703 1.8281-3.2539 3.2461-6.7383 4.1914-10.359 0.66797-2.5742 1.0859-5.1914 1.2773-7.8359h3.2461v-6.25zm-40.625 3.125h-4.1211l-13.395 31.25h6.8008l2.6797-6.25h16.07l2.6797 6.25h6.8008l-13.395-31.25zm-5.3555 18.75h10.711l-5.3555-12.5z" fill-rule="evenodd"/>
                    </svg>
                </button>

                <button class="simptip-position-left toolbar-main-button" @click="publish" data-tooltip="Post record ([CTRL+SHIFT+P])">
                    <svg width="50px" height="34px" version="1.1" viewBox="25 20 55 55" xmlns="http://www.w3.org/2000/svg">
                     <path d="m19.805 59.453s-1.2109 1.6445 5.0625 4.3242c1.8203 0.77734 4.6055-1.5 7.6328-0.875 2.6367 0.54297 6.7695 2.5664 10.359 2.5664s7.8203-2.5664 11.785-2.5664c6.2227 0 8.7891 3.6406 12.918 3.0938 2.7695-0.36328 5.6055-2.8203 7.3516-3.2188 1.7422-0.40234 3.7227 0.66016 5.1328 0 5.668-2.6602 5.8906-9.9258 5.8906-9.9258zm33.434-20.445c-0.24609-6.0273-4.6172-20.863-4.6172-20.863s10.688 9.1953 16.551 16.535c5.8672 7.3359 10.711 16.473 10.711 16.473l-22.645 1.7656s0.24609-7.793 0-13.91zm-3.8984-8.6523s-2.0781 10.699-5.5547 16.309c-3.4727 5.6133-8.8867 8.7227-8.8867 8.7227l15.836-1.9531zm28.012 35.406c-4.3516 0-7.5117 3.1172-11.363 2.7188-3.1055-0.32031-8.1875-2.6523-11.32-2.7188-3.6523-0.078125-8.5977 2.2812-11.719 2.043-4.9883-0.37891-9.5859-2.043-11.32-2.043-7.3086 0-11.629 5.7656-11.629 5.7656s8.1016-3.0469 11.629-3.0469c4.3828 0 5.5664 2.5508 11.32 3.0469 3.7656 0.32031 7.7109-2.6758 11.719-2.5742 4.793 0.11719 6.8906 2.5078 11.32 3.1758 3.9062 0.58594 7.6289-3.2109 11.363-3.1758 5.7734 0.050781 8.3633 3.5508 8.3633 3.5508s-4.0078-6.7422-8.3633-6.7422z" fill-rule="evenodd"/>
                    </svg>
                </button>


            </div>





        </div>


        <div v-if="displayTemplate===true" style="height: 100vh; background-color: rgb(248 241 255); position: fixed;left: 0;width: 100%;z-index: 1000;">
          <div style="display: flex; padding: 1em; height:100%;">
            <div style="flex: 1; position: relative; height:100%;">
                
                <div style="font-weight:bold">Create Template</div>
                <input type="" class="input" style="font-size:1.25em; width:95%" @change="templateNameChange" v-model="templateLabel" name="" placeholder="Name of Template">
                
                <div style="margin-top: 25%">
                    <button style="font-size: 1.5em;  margin: 0.25em;" @click="displayTemplate===false">Cancel</button>
                    <button style="font-size: 1.5em;  margin: 0.25em;" @click="saveTemplate(false)">Create</button>
                </div>


            </div>
            <div style="flex: 1;">
                

                <div style="height:100%; background-color: transparent; overflow: scroll">
                    <div>
                        How should data flow into the template when merging with a resource record?<br>
                        Template = Data from template should overwrite resource<br>
                        Resource = Data from resource should overwrite template data<br>
                        Both = Keep both on import<br>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <td>Property</td>
                                <td>Template</td>
                                <td>Resource</td>
                                <td>Both</td>
                            </tr>
                        </thead>
                        <tbody>
                            
                            <template v-for="rt in Object.keys(activeProfile.rt)">
                                <template v-if="!rt.match(/-[0-9]+$/)">
                                    
                                    
                                    <tr :key="rt">
                                        <td colspan="4">
                                            <span v-if="rt.includes(':Work')" style="font-weight:bold;">Work</span>
                                            <span v-if="rt.includes(':Instance')" style="font-weight:bold;">Instance</span>
                                            <span v-if="rt.includes(':Item')" style="font-weight:bold;">Item</span>
                                            <span v-if="rt.includes(':Hub')" style="font-weight:bold;">Hub</span>

                                        </td>
                                    </tr>
                                    <tr v-for="pt in activeProfile.rt[rt].ptOrder" :key="rt+pt">


                                        <template v-if="Object.keys(activeProfile.rt[rt].pt[pt].userValue).length>1 && templatesDataFlowHide.filter((v)=> { return pt.includes(v) }).length==0">
                                            <td>
                                            <span style="padding-left: 10px">{{pt.split('|')[1]}}</span>
                                            </td>
                                            <td class="template-td" style="text-align: center;" @click="templatesTDClick">
                                                <input type="radio" :name="buildPropFlowId(rt,pt)" value="template" @change="templatesPropFlowChange" :checked="templatesPropertyIsChecked(buildPropFlowId(rt,pt),'template')">
                                            </td>
                                            <td class="template-td" style="text-align: center;" @click="templatesTDClick">
                                                <input type="radio" :name="buildPropFlowId(rt,pt)" value="resource" @change="templatesPropFlowChange" :checked="templatesPropertyIsChecked(buildPropFlowId(rt,pt),'resource')">
                                            </td>
                                            <td class="template-td" style="text-align: center;" @click="templatesTDClick" v-if="templatesDataFlowCantBeBoth.filter((v)=> { return pt.includes(v) }).length==0">
                                                <input type="radio" :name="buildPropFlowId(rt,pt)" value="both" @change="templatesPropFlowChange" :checked="templatesPropertyIsChecked(buildPropFlowId(rt,pt),'both')">
                                            </td>
                                        </template>


                                    </tr>
                                </template>
                            </template>
                            

                        </tbody>

                    </table>

                </div>

            </div>

          </div>
        </div>  


        <div v-if="displayPreview===true" style="height: 100vh; background-color: #fffff1; position: fixed;left: 0;width: 100%;z-index: 1000;">
          <div style="display: flex;">
            <div style="flex: 1">
              <h1 style="margin-top: 0;">RDF XML Preview</h1>    

            </div>
            <div style="flex: 1">
              <button style="font-size: 1.5em; float:right; margin: 0.25em;" @click="togglePreview">CLOSE (ESC Key)</button>


            </div>            
          </div>

          <textarea spellcheck="false" v-model="xmlPreview" style="width: 99%;font-size: 1.25em;height: 90vh;">
          </textarea>
        </div>        

       <div v-if="displayLiteralLanguage === true" class="modaloverlay modal-display select-lanague" style="z-index: 1000000;">
            <div class="modal" style="overflow-y: scroll; overflow-x: hidden;">
                  <EditLiteralLanguage ref="literalLanguageModal"></EditLiteralLanguage>
            </div>
        </div>

       <div v-if="displayLiteralOptions === true" class="modaloverlay modal-display select-lanague" style="z-index: 1000000;">
            <div class="modal" style="overflow-y: scroll; overflow-x: hidden;">
                  <EditNavLiteralDisplayOptions ref="literalDisplayOptionsModal"></EditNavLiteralDisplayOptions>
            </div>
        </div>



        <div v-if="showPostModal" style="position: fixed; width: 100vw; height: 100vh; top: 0; left: 0; background-color: rgba(0,0,0,0.6); z-index: 1000">
          
          <div style="border: solid 1px #a6acb7; border-radius:0.5em; margin: auto; width: 50%; background-color: white; margin-top: 10%; min-height: 35%; padding: 1em;">
              <div style="font-weight: bold;">Posting Record...</div>


              <div v-if="showPostModalErrorMsg" style="max-height: 500px; overflow-x:auto; overflow-y:auto;">
                <div style="font-weight: bold; color: red">We were unable to post the record. Please report this error.</div>
                <div>Full Response</div>
                <pre>
                  <code>
                    {{JSON.stringify(showPostModalErrorMsg,null,2)}}
                  </code>
                </pre>
                
                <template v-if="showPostModalErrorMsg && showPostModalErrorMsg.message && showPostModalErrorMsg.message.message">
                    <hr>
                    <div>Message</div>

                    
                    <pre style="white-space:normal">
                      <code style="white-space:normal">
                        {{cleanUpErrorResponse(showPostModalErrorMsg.message.message)}}

                      </code>
                    </pre>


                </template>
                <template v-if="showPostModalErrorMsg && showPostModalErrorMsg.message && showPostModalErrorMsg.message.error">
                    <hr>
                    <div>Error</div>

                    
                    <pre style="white-space:normal">
                      <code style="white-space:normal">

                        {{cleanUpErrorResponse(showPostModalErrorMsg.message.error)}}
                      </code>
                    </pre>


                </template>



              </div>





              <div v-if="resourceLinks.length>0" style="margin: 0.5em 0 0.5em 0;background-color: #90ee9052;padding: 0.5em;border-radius: 0.25em;">
                The record was accepted by the system. To view the record follow these links:
                <div v-for="rl in resourceLinks" v-bind:key="rl.url">
                  <a :href="rl.url+'?blastdacache=' + Date.now()" target="_blank">View {{rl.type}} on {{rl.env}}</a>
                </div>
                
              </div>


              <button style="font-size: 1em;" @click="escapeKey">Close (ESC Key)</button>


          </div>


        </div>


        <div v-if="subjectListDisplay" id="subject-reorder-display">
          
          <div style="font-size: 1.25em;font-weight: bold;padding: 5px;margin-bottom: 1em;">Subject Headings (drag to reorder):</div>

          <draggable
            class="list-group"
            tag="ul"
            v-model="list"
            v-bind="dragOptions"
            @start="drag = true"
            @end="drag = false; subjectDragEnd()"
          >
            <transition-group type="transition" :name="!drag ? 'flip-list' : null">
              <li
                class="list-group-item"
                v-for="element in list"
                :key="element.guid"
              >               
                <span style="display:inline-block">{{ element.label }} {{ (element.source) ? `(${element.source})` : ''}}</span>
                <a class="subject-edit-link" @click="editSubjectClick(element.guid)" style="display:inline-block; float: right;">Edit</a>
              </li>
            </transition-group>
          </draggable>
          <div style="font-style: italic;     margin-left: 4%; margin-top: 1em;">Subject reordering is for display purposes only, order on posting is not guaranteed.</div>


        </div>




  </header>


</template>

<script>

import { mapState } from 'vuex'

import exportXML from "@/lib/exportXML"
import lookupUtil from "@/lib/lookupUtil"
import parseProfile from "@/lib/parseProfile"

import config from "@/lib/config"
import EditLiteralLanguage from "@/components/EditLiteralLanguage"
import EditNavLiteralDisplayOptions from "@/components/EditNavLiteralDisplayOptions"

import draggable from 'vuedraggable'



export default {
  name: "EditLabelDereference",
  components: {
    EditLiteralLanguage,
    EditNavLiteralDisplayOptions,
    draggable,

    Keypress: () => import('vue-keypress'),


  },

    computed: mapState({
        diagramMiniMap: 'diagramMiniMap',
        activeRecordSaved: 'activeRecordSaved',
        settingsHideEmptyFields: 'settingsHideEmptyFields',
        settingsDisplayMode: 'settingsDisplayMode',
        settingsLeftMenuEnriched: 'settingsLeftMenuEnriched',
        activeProfile: 'activeProfile',
        undoLog: 'undo',
        undoIndex: 'undoIndex',

        settingsTreatLikeNoteFields:'settingsTreatLikeNoteFields',

        subjectList: 'subjectList',


        dragOptions() {
          return {
            animation: 200,
            group: "description",
            disabled: false,
            ghostClass: "ghost"
        }},
     

      // to access local state with `this`, a normal function must be used
      // countPlusLocalState (state) {
      //   return state.count + this.localCount
      // }
    }),


  props: {
    URI: String,
    forceComponentRedraw: { type: Function },

  },

  data:function() {
    return {

      activeMiniMap: {URI:null},
      miniMapActionValue: 'Actions',
      headerState: 'inital',
      optionDisplay: false,
      undoDisplay: false,
      subjectListDisplay: false,
      hideFields: false,
      leftMenuEnriched: false,   
      displayLiteralLanguage: false,

      displayTemplate: false,

      displayLiteralOptions: false, // Not used currently
      lastMouseY: 10,
      resourceLinks: [],
      displayPreview: false,
      xmlPreview: 'Loading...',
      showPostModal: false,
      showPostModalErrorMsg: false,

      templateLabel: "",

      templatesDataFlowCantBeBoth: [
        'id.loc.gov/ontologies/bibframe/adminMetadata',


      ],
      templatesDataFlowHide: [
        'id.loc.gov/ontologies/bibframe/instanceOf',
        

      ],  


      list: [],
      drag: false


    }
  },


  watch: {

    // watch when the undoindex changes, means they are undoing redoing, so refresh the
    // value in the acutal input box
    subjectList: function(){

      this.list = this.subjectList.map((value, index) => {

        return { label: value.label, source: value.source, guid:value.guid, index:index, pt:value.pt };

      })
    }


  },


  created: function(){
      
      this.hideFields = this.settingsHideEmptyFields
      this.leftMenuEnriched = this.settingsLeftMenuEnriched




      this.$nextTick(function () {
      
          window.addEventListener( 'scroll', () => {         

            // if they clicked it with their mouse at the top don't hide it  
            if (this.lastMouseY <= 75){
              this.headerState = 'deployed'
            }      

            if (this.headerState == 'deployed'){

              if (this.$refs.header){
                this.$refs.header.classList.remove('retracted')
                this.$refs.header.classList.remove('inital')
                this.$refs.header.classList.add('deployed')
              }

              return false
            }




            if (window.pageYOffset>5){
              if (this.displayLiteralLanguage){ return false}
              if (this.displayLiteralOptions){ return false}


              if (this.showPostModal){ return false}
              if (this.displayTemplate){ return false}
              if (this.optionDisplay){ return false}
              if (this.subjectListDisplay){ return false}


              if (this.undoDisplay){ return false}             
              if (this.displayPreview){ return false}



              this.headerState='retracted'
              if (this.$refs.header){
                this.$refs.header.classList.remove('inital')
                this.$refs.header.classList.remove('deployed')
                this.$refs.header.classList.add('retracted')
              }

            }else if (window.pageYOffset<=5){

              if (this.$refs.header){
                this.$refs.header.classList.remove('retracted')
                this.$refs.header.classList.remove('deployed')

                this.$refs.header.classList.add('inital')
              }
              this.headerState='inital'

            }


          } );

          window.addEventListener('mousemove', (e) => {

            this.lastMouseY = e.y

            if (e.y < 75){

              if (this.headerState == 'retracted'){
                if (this.$refs.header){              
                  this.$refs.header.classList.remove('retracted')
                  this.$refs.header.classList.remove('inital')
                  this.$refs.header.classList.add('deployed')
                }
                this.headerState = 'deployed'
              }
            }else if (e.y > 75 && this.headerState == 'deployed'){
              if (this.optionDisplay){ return false}
              if (this.subjectListDisplay){ return false}



              if (this.undoDisplay){ return false}
              if (this.displayLiteralLanguage){ return false}
              if (this.displayLiteralOptions){ return false}


              if (this.showPostModal){ return false}
              if (this.displayTemplate){ return false}
              if (this.displayPreview){ return false}

                
              this.headerState='retracted'
              if (this.$refs.header){
                this.$refs.header.classList.remove('inital')
                this.$refs.header.classList.remove('deployed')

                this.$refs.header.classList.add('retracted')
              }

            }



          });

      })



  },


  methods:{



    buildPropFlowId: function(rt,pt){

        // the id will be the profile, the property URI and the primary data type dataTypeURI
        let id = rt + '|' + this.activeProfile.rt[rt].pt[pt].propertyURI
        if (this.activeProfile.rt[rt].pt[pt].valueConstraint && this.activeProfile.rt[rt].pt[pt].valueConstraint.valueDataType && this.activeProfile.rt[rt].pt[pt].valueConstraint.valueDataType.dataTypeURI && this.activeProfile.rt[rt].pt[pt].valueConstraint.valueDataType.dataTypeURI.trim() != ''){
            id = id + '|' + this.activeProfile.rt[rt].pt[pt].valueConstraint.valueDataType.dataTypeURI
        }


        return id

    },

    templatesPropFlowChange: function(event){
        this.$store.dispatch("setTemplateDataFlow",{ id: event.target.name, value: event.target.value   }).then(() => {   
        });   
    },

    templateNameChange: function(){

        this.$store.dispatch("setTemplateName",{ value: this.templateLabel  }).then(() => {   
        });  
    },

    templatesTDClick: function(event){

        if (event.target.tagName=='TD'){
            event.target.children[0].checked="checked"
            this.templatesPropFlowChange({target:event.target.children[0]})
        }
        


    },

    templatesPropertyIsChecked: function(property,checkingFor){

        // if there is no data stored then its a "both"
        // unless its on the the ones that cant be both then its a resource
        if (this.templatesDataFlowCantBeBoth.filter((v)=> { return property.includes(v) }).length>0){            
            if (!this.activeProfile.templateDataFlow){
                if (checkingFor == 'resource'){
                    return "checked"            
                }else{
                    return false
                }
            }else if (this.activeProfile.templateDataFlow[property]){
                if (checkingFor == this.activeProfile.templateDataFlow[property]){
                    console.log("IT WORKED")
                    return "checked"
                }else{
                    return false
                }
            }else{
                return false // just say no
            }            
        }else{

            if (!this.activeProfile.templateDataFlow){
                
                // the default return val is both
                if (checkingFor == 'both'){
                    return "checked"
                }else{
                    return false
                }

            }else if (this.activeProfile.templateDataFlow[property]){
                if (checkingFor == this.activeProfile.templateDataFlow[property]){
                    return "checked"
                }else{
                    return false
                }
            }else{
                
                // the default return val is both
                if (checkingFor == 'both'){
                    return "checked"
                }else{
                    return false
                }
            }  


        }


    },

    async saveTemplate(overwrite){

        if (this.templateLabel.trim()==''){
            alert("Please name the template")
            return false
        }

        await parseProfile.prepareTemplate(this.activeProfile,overwrite)


    },

    subjectDragEnd: function(){

      this.$store.dispatch("setSubjectOrder",this.list).then(() => {   

        console.log("YEAH")
      });    


    },

    undoRedo: function(type,steps){

    let action = {undo:steps}

    if (type === 'redo'){
      action = {redo:steps}
    }

    if (type === 'goto'){
      action = {goto:steps}
    }




    this.$store.dispatch("undoRedoAction",action).then(() => {   

          
      this.$store.dispatch("incrementUndoCounter") 
    

    })



    },

    sort() {
      this.list = this.list.sort((a, b) => a.order - b.order);
    },

    editSubjectClick: function(guid){

      document.getElementById(guid+'_subjectButton').click()
      this.subjectListDisplay=false
    },


    miniMapAction: function(){


      if (this.miniMapActionValue == 'addItem'){

        // console.log(this.activeMiniMap.parent)
        // console.log(this.activeMiniMap)

        if (!this.activeMiniMap.URI || (this.activeMiniMap.type && this.activeMiniMap.type == 'Work')){
            // console.log('no instance selected')
            // find the first instance            
            for (let rt in this.activeProfile.rt){
                if (rt.endsWith(':Instance')){
                    this.$store.dispatch("addItem",{uri:this.activeProfile.rt[rt].URI}).then(() => {        
                      console.log(this.activeProfile)
                    })
                    break
                }
            }
            

        }else{
            // console.log('normal')
            this.$store.dispatch("addItem",{uri:this.activeMiniMap.URI}).then(() => {        
              console.log(this.activeProfile)
            })

        }



      }
      if (this.miniMapActionValue == 'deleteItem'){


        this.$store.dispatch("deleteItem",{uri:this.activeMiniMap.URI}).then(() => {        

        })

      }
      if (this.miniMapActionValue == 'cloneInstance'){


        this.$store.dispatch("cloneInstance",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      }
      if (this.miniMapActionValue == 'cloneItem'){


        this.$store.dispatch("duplicateItem",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      }      
      if (this.miniMapActionValue == 'deleteItem'){


        this.$store.dispatch("deleteItem",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      } 
      if (this.miniMapActionValue == 'deleteInstance'){


        this.$store.dispatch("deleteInstance",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      } 
      if (this.miniMapActionValue == 'addInstance'){


        this.$store.dispatch("addInstance",{uri:this.activeMiniMap.URI}).then(() => {        

        }) 
      } 


      this.miniMapActionValue='Actions'

    },

    miniMapClick: function(value){

      let rtName = value.rt

      if (value.counter == 0){
        rtName=rtName+'1'      
      }else if (value.counter>0){

        rtName=rtName+'1'
      }

      


      let id = rtName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_') + value.jumpTo.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')

      console.log(value)
      console.log(id)

      if (this.settingsDisplayMode!='spreadsheet'){
        this.scrollFieldContainerIntoView(null,id)
      }


      

      this.activeMiniMap = value




    },

    toggleOptionDisplay: function(){
        this.optionDisplay = (this.optionDisplay) ? false : true;  

        if (this.optionDisplay){
          this.undoDisplay = false
          this.subjectListDisplay = false
        }  
    },

    toggleSubjectListDisplay: function(){

        this.$store.dispatch("setSubjectList")

        this.subjectListDisplay = (this.subjectListDisplay) ? false : true;  

        if (this.subjectListDisplay){
          this.undoDisplay = false
          this.optionDisplay = false
        }  
    },

    

    toggleUndoDisplay: function(){
        this.undoDisplay = (this.undoDisplay) ? false : true;        
        if (this.undoDisplay){
          this.optionDisplay = false
          this.subjectListDisplay = false
        }  

    },

    

    updateLeftMenuEnriched: async function(){
        this.$store.dispatch("settingsLeftMenuEnriched", { self: this, settingsLeftMenuEnriched: this.leftMenuEnriched }).then(async () => {

        })

    },


    updateHideEmptyFields: async function(){
        this.$store.dispatch("settingsHideEmptyFields", { self: this, settingsHideEmptyFields: this.hideFields }).then(async () => {
            console.log('after',this.settingsHideEmptyFields)
        })
        this.updateHideEmptyFieldsReDraw()
    },



    updateHideEmptyFieldsReDraw: function(){

        if (this.hideFields){

            // loop through all of the properties and

            for (let rt in this.activeProfile.rt){
                for (let pt in this.activeProfile.rt[rt].pt){

                    let p = this.activeProfile.rt[rt].pt[pt]
                    console.log(p)

                    p.canBeHidden = true
                    if (Object.keys(p.userValue).length>1){
                        p.canBeHidden = false
                    }

                }
            }


        }


        // this.keyCounter++
        this.forceComponentRedraw()




    },


    updateLiteralOption: async function(mode){
        
        this.$store.dispatch("setTreatLikeNoteFields", { self: this, fields: mode }).then(async () => {



        })

    },

    updateLayout: async function(mode){
        
        this.$store.dispatch("settingsDisplayMode", { self: this, settingsDisplayMode: mode }).then(async () => {
            console.log(this.activeProfile)

            if (window.location.pathname.includes('/compactedit/')){
              if (mode == 'default'){
                  await this.triggerSave()
                  this.$router.push('/edit/'+this.activeProfile.eId).then(()=>{


                    // window.location.reload();

                  }) 
                  
              }
              if (mode == 'compact'){
                  await this.triggerSave()
                  this.$router.push('/edit/'+this.activeProfile.eId).then(()=>{


                    // window.location.reload();

                  }) 
              }
            }


            if (window.location.pathname.includes('/edit/')){
              if (mode == 'spreadsheet'){
                  await this.triggerSave()
                  this.$router.push('/compactedit/'+this.activeProfile.eId).then(()=>{


                    // window.location.reload();

                  }) 
              }
            }

        })


    },
    
    triggerSave: async function(){

      let xml = await exportXML.toBFXML(this.activeProfile)
      lookupUtil.saveRecord(xml.xlmStringBasic, this.activeProfile.eId)

      this.$store.dispatch("setActiveRecordSaved", { self: this}, true).then(() => {

      })

    },

    togglePreview: async function(){

      if (this.displayPreview){

        this.displayPreview = false


        this.xmlPreview = 'Loading...'



      }else{

        let xml = await exportXML.toBFXML(this.activeProfile)
        this.xmlPreview = xml.xmlStringFormatted
        
        this.displayPreview = true
      }


    },

    toggleTemplate: async function(){

      if (!this.displayTemplate){
            this.displayTemplate=true



      }else{
        this.displayTemplate=false
       

      }


    },

    

    escapeKey: function(){

      if (this.displayPreview){
        this.displayPreview = false
      }


      if (this.showPostModal){
        this.showPostModal = false
      }

    if (this.displayTemplate){ this.displayTemplate = false}


      if (this.displayLiteralOptions){
        this.displayLiteralOptions = false
      }


    },

    publish: async function(){

      this.showPostModal = true

      let xml = await exportXML.toBFXML(this.activeProfile)
      let pubResuts = await lookupUtil.publish(xml.xlmString,this.activeProfile.eId,this.activeProfile)

      this.showPostModalErrorMsg = false

      if (pubResuts.status){
        // if it posted we want to also save the record and mark it as posted

        this.activeProfile.status = 'published'

        this.$store.dispatch("setActiveProfile", { self: this, profile: this.activeProfile }).then(async () => {

          this.resourceLinks=[]

          // build it again for the new status
          xml = await exportXML.toBFXML(this.activeProfile)
          lookupUtil.saveRecord(xml.xlmStringBasic, this.activeProfile.eId)



          for (let rt in this.activeProfile.rt){
            let type = rt.split(':').slice(-1)[0]
            let url = config.convertToRegionUrl(this.activeProfile.rt[rt].URI)
            let env = config.returnUrls().env
            this.resourceLinks.push({
              'type':type,
              'url': url,
              'env': env
            })
          }




        })


      }else{

        this.showPostModalErrorMsg = JSON.parse(pubResuts.msg)

      }

    },

    toggleLiteralLanguage: function(){

          if (this.displayLiteralLanguage){
              this.displayLiteralLanguage=false
          }else{
              this.displayLiteralLanguage=true
              // refresh once it is open            
              this.$nextTick(()=>{          
                  this.$refs.literalLanguageModal.refreshDisplay()
              })
          }
    },
    toggleDisplayLiteralOptions: function(){

          if (this.displayLiteralOptions){
              this.displayLiteralOptions=false
          }else{
              this.displayLiteralOptions=true
              // refresh once it is open            
              // this.$nextTick(()=>{          
              //     this.$refs.literalLanguageModal.refreshDisplay()
              // })
          }
    },





    scrollFieldContainerIntoView: function(event,id){
      console.log(document.getElementById('container-for-'+id))
      document.getElementById('container-for-'+id).scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
      window.setTimeout(()=>{
        if (document.querySelector('#container-for-'+id + ' input')){
          document.querySelector('#container-for-'+id + ' input').focus()  
        }
        
      },400)

      if (event){
        event.preventDefault()
        return false
      }


    },

    cleanUpErrorResponse: function(msg){

        msg = JSON.stringify(msg,null,2)

        msg = msg.replace(/\\n|\\t/g, '').replace(/\\"/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>')

        return msg

    },


  }

};

</script>