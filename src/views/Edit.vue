
<style>

#edit-left-menu-fixed{
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
#edit-left-menu-fixed::-webkit-scrollbar { 
  display: none;  /* Safari and Chrome */
}



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
.option-button:hover{
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


.enriched-menu .enriched-menu-controls{
    display: none;
    text-align: center;
}

.enriched-menu:hover{
    background-color: #6f6f6f;
}

.enriched-menu:hover .enriched-menu-controls{
    display: block;
}

.enriched-menu-controls button{
    border:  solid 1px white;
    width: 50px;
    font-size: 1.1em;
    color: white;
    font-weight: bold;
    cursor: pointer;
}
.enriched-menu-controls button:hover{
    background-color: white;
    color: black;
}

</style>


<template>
    <div class="grid">






      <header ref="header" class="inital">
                    <!-- <div style="display: ">loaded profile -- {{profilesLoaded}} </div> -->
<!-- 
                      <router-link style="font-size: 1.5em;color: black;text-decoration: none;padding-left: 0.5em;" to="/myrecords">&lt; Back</router-link>

                      <span style="color:red; margin-left:20%" v-if="!isProd()"> THIS IS THE STAGING (TEST) REGION -- DATA IS NOT SAVED TO PRODUCTION</span>

                      <a @click="reportError" href="#" style="float:right;font-size: 1.5em;color: black;text-decoration: none;padding-left: 0.5em;">Report Error</a>


 -->
        <div style="display:flex; height: 50px;">
            
            <div style="flex:1">

              <div v-if="diagramMiniMap !== false" style="height: 50px; padding-left: 10px;">
                
                  <div  style="display:inline-block; cursor: pointer" @click="miniMapClick(diagramMiniMap)">
                    
<!-- 
<svg width="100pt" height="100pt" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
 <path d="m62.113 24.66 1.9023-15.238 18.875 32.691-7.5469 20.004 15.238 1.9023-32.691 18.875-20.004-7.5469-1.9023 15.238-18.875-32.691 7.5469-20.004-15.238-1.9023 32.691-18.875zm-17.684 15.695-4.0781 15.215 15.215 4.0781 4.0781-15.215z" fill-rule="evenodd"/>
</svg>
    
 -->



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


            <div style="flex:1">
                
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
                                <label for="display-select-spreadsheet">Spreadsheet</label>   
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



      </header>

          <Keypress key-event="keydown" :key-code="40" @success="moveDown" />
          <Keypress key-event="keydown" :key-code="38" @success="moveUp" />
          <Keypress key-event="keydown" :key-code="34" @success="movePageDown" />          
          <Keypress key-event="keydown" :key-code="33" @success="movePageUp" />

          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 187, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="dupeProperty" />


          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 88, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="togglePreview" />
          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 80, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="publish" />

          <Keypress key-event="keydown" :key-code="27" @success="escapeKey" />




        <aside id="edit-left-menu" class="sidebar-left" style="background-color: #2a2a2a; color: #ffffff" >
        
            <div id="edit-left-menu-fixed" ref="editLeftMenuFixed" style="height: 98vh; overflow-y:scroll; position: fixed; width: 20%;" v-if="profilesLoaded">
                <!-- <div style="color:#bfbfbf; font-size: 1.5em; text-align: center;">{{sartingPoint}}</div> -->
                <div v-for="profileName in activeProfile.rtOrder" :key="profileName">

                    <div v-if="activeProfile.rt[profileName].noData != true">
                        <div class="container-type-icon" style="color: #ffffff">
                            <div>   
                                <svg v-if="profileName.split(':').slice(-1)[0] == 'Work'" width="1.5em" height="1.1em" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <circle fill="#7badad" cx="0.55em" cy="0.6em" r="0.45em"/>
                                </svg>
                                <div v-if="profileName.includes('Instance')" style="height: 1em;width: 1em; display: inline-block;" class="temp-icon-instance"></div>
                                
                                <div v-if="profileName.includes(':Item')" style="height: 1em;width: 1em; display: inline-block;">
                                  <svg  viewBox="0 -32 50 72" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                       <rect width="40px" height="40px" style="fill:#eaeaea;stroke-width:0.5;stroke:rgb(0,0,0)" />
                                  </svg>
                                </div>

                                <div v-if="profileName.endsWith(':Hub')" style="height: 1.25em;width: 1.25em; display: inline-block;">
                                    <svg  version="1.1" viewBox="0 -20 100 100" xmlns="http://www.w3.org/2000/svg">
                                     <path fill="royalblue" d="m62.113 24.66 1.9023-15.238 18.875 32.691-7.5469 20.004 15.238 1.9023-32.691 18.875-20.004-7.5469-1.9023 15.238-18.875-32.691 7.5469-20.004-15.238-1.9023 32.691-18.875zm-17.684 15.695-4.0781 15.215 15.215 4.0781 4.0781-15.215z" fill-rule="evenodd"/>
                                    </svg>                           
                                </div>




                                <span>{{profileName.split(':').slice(-1)[0]}}</span>
                            </div>
                            

                        </div>

                        <ul style="padding-left: 0;" :key="'leftmenu' + activeEditCounter">
                            <li v-bind:class="['left-menu-list-item', 'enriched-menu', { 'left-menu-list-item-has-data' :  liHasData(activeProfile.rt[profileName].pt[profileCompoent]) && returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue).length != 0, 'left-menu-list-item-active':(activeComponent==profileCompoent &&activeProfileName==profileName), 'left-menu-list-item-hide':(!displayComponentCheck(activeProfile.rt[profileName].pt[profileCompoent])), 'is-hidden-li': (hideFields === true && activeProfile.rt[profileName].pt[profileCompoent].canBeHidden) }]"  :id="'menu'+profileName+profileCompoent"  v-for="(profileCompoent,idx) in activeProfile.rt[profileName].ptOrder" :key="profileCompoent">
                              
                                <template v-if="!hideFields">
                                    <a :key="'left_li_'+idx+'_'+keyCounter" v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true" @click="scrollFieldContainerIntoView($event,profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_'))" href="#">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}</a>
                                    <a :key="'left_li_'+idx+'_'+keyCounter" v-else-if="activeProfile.rt[profileName].pt[profileCompoent].deleted === true" href="#" style="color: rgba(255,255,255,0.75) !important;" @click="restoreDelete($event, profileName, profileCompoent)" class="simptip-position-right" data-tooltip="Click to restore">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}} [Deleted]</a>
                                </template>
                                <template v-else>                                    
                                    <a :key="'left_li_'+idx+'_'+keyCounter" v-if="activeProfile.rt[profileName].pt[profileCompoent].canBeHidden && !activeProfile.rt[profileName].pt[profileCompoent].deleted" href="#" @click="makeVisible($event,profileCompoent,profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_'))">

                                        <svg width="25px" height="25px" version="1.1" viewBox="0 -25 100 100" xmlns="http://www.w3.org/2000/svg">
                                         <g>
                                          <path style="fill:rgba(255,255,255,0.75)" d="m94.199 48.398c-6.7969-4.9766-13.879-9.543-21.211-13.684-0.78125-0.42969-1.7539-0.29297-2.3828 0.33594l-32.574 32.574c-0.48047 0.48047-0.68359 1.1641-0.54297 1.8281 0.13672 0.66016 0.60156 1.207 1.2305 1.4531 3.5742 1.5391 7.3945 2.4297 11.281 2.6211 14.695 0 43-21.031 44.199-21.926 0.50391-0.37891 0.80078-0.97266 0.80078-1.6016s-0.29688-1.2227-0.80078-1.6016z"/>
                                          <path style="fill:rgba(255,255,255,0.75)" d="m27.98 65.535c0.53125 0 1.0391-0.21094 1.4141-0.58594l32.574-32.574c0.48047-0.48047 0.68359-1.1641 0.54297-1.8281-0.13672-0.66016-0.60156-1.207-1.2305-1.4531-4.5312-1.7617-8.2227-2.6211-11.281-2.6211-14.695 0-43 21.031-44.199 21.926-0.50391 0.37891-0.80078 0.97266-0.80078 1.6016s0.29688 1.2227 0.80078 1.6016c6.7969 4.9766 13.879 9.543 21.211 13.684 0.29688 0.16406 0.62891 0.25 0.96875 0.25z"/>
                                          <path style="fill:rgba(255,255,255,0.75)" d="m86.414 13.586c-0.78125-0.78125-2.0469-0.78125-2.8281 0l-70 70c-0.38281 0.375-0.60156 0.88281-0.60547 1.418 0 0.53516 0.21094 1.0508 0.58594 1.4297 0.37891 0.375 0.89453 0.58594 1.4297 0.58594 0.53516-0.003906 1.043-0.22266 1.418-0.60547l70-70c0.78125-0.78125 0.78125-2.0469 0-2.8281z"/>
                                         </g>
                                        </svg>
                                        

                                        <span style="color: rgba(255,255,255,0.75) !important;">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}</span>
                                    </a>
                                    <a :key="'left_li_'+idx+'_'+keyCounter" v-else-if="activeProfile.rt[profileName].pt[profileCompoent].canBeHidden === false" href="#" @click="scrollFieldContainerIntoView($event,profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_'))" style="font-weight: bold;">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}</a>
                                    <a :key="'left_li_'+idx+'_'+keyCounter" v-else-if="activeProfile.rt[profileName].pt[profileCompoent].deleted === true" href="#" style="color: rgba(255,255,255,0.75) !important;" @click="restoreDelete($event, profileName, profileCompoent)" class="simptip-position-right" data-tooltip="Click to restore">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}} [Deleted]</a>



                                </template>

                                <div v-if="settingsLeftMenuEnriched" >
                                    <template v-if="activeProfile.rt[profileName].pt[profileCompoent].valueConstraint.valueTemplateRefs.length>1">
                                        <ul>
                                            <li :key="t" v-for="t in returnTemplateTypes(activeProfile.rt[profileName].pt[profileCompoent].valueConstraint.valueTemplateRefs)"><a href="#" v-on:click.prevent.stop="scrollFieldContainerIntoView($event,profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_'))">{{t}}</a></li>
                                        </ul>

                                    </template>


                                    <div class="enriched-menu-controls">
                                        
                                        <template v-if="!hideFields || (hideFields && !activeProfile.rt[profileName].pt[profileCompoent].canBeHidden) ">
                                            <button @click="addProperty(profileName,profileCompoent)">Add</button>
                                            
                                            <button @click="removeProperty(profileName,profileCompoent)">Del</button>
                                            <button @click="addProperty(profileName,profileCompoent,true)">Dup</button>
                                            <button v-if="canSendToInstance(activeProfile.rt[profileName].pt[profileCompoent].propertyURI,profileName)">Send</button>
                                        </template>
                                    </div>
                                </div>
                                    

                            </li>
                        </ul>
                    </div>



                </div>

            </div>


        </aside>

        <article >
            
            <div v-if="profilesLoaded">

                <div v-for="profileName in activeProfile.rtOrder" :key="profileName">

                    
                    <div v-if="activeProfile.rt[profileName].noData != true" :class="['container-' + profileName.split(':').slice(-1)[0].split('-')[0]]">


                        <div style="display: flex;">
                          <div style="flex: 0">

                            <div v-if="profileName.includes('Instance')" style="height: 1.75em;width: 2em; margin-left: 1.5em;" class="temp-icon-instance"></div>

                            <svg v-if="profileName.split(':').slice(-1)[0] == 'Work'" width="3em" height="2.5em" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <circle fill="#7badad" cx="1.5em" cy="1em" r="0.75em"/>
                            </svg>

                            <div style="display:inline-block;     width: 26px; margin-left: 25px; margin-right: 5px;" v-if="profileName.includes(':Item')">
                              <svg  viewBox="0 0 50 72" version="1.1" xmlns="http://www.w3.org/2000/svg">

                                   <rect width="50px" height="50px" style="fill:#eaeaea;stroke-width:0.5;stroke:rgb(0,0,0)" />
                              </svg>
                            </div>

                                <div v-if="profileName.endsWith(':Hub')" style="height: 15px;  display:inline-block;  width: 26px; margin-left: 25px; margin-right: 5px;">
                                    <svg width="50px" height="40px"  version="1.1" viewBox="25 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                     <path fill="royalblue" d="m62.113 24.66 1.9023-15.238 18.875 32.691-7.5469 20.004 15.238 1.9023-32.691 18.875-20.004-7.5469-1.9023 15.238-18.875-32.691 7.5469-20.004-15.238-1.9023 32.691-18.875zm-17.684 15.695-4.0781 15.215 15.215 4.0781 4.0781-15.215z" fill-rule="evenodd"/>
                                    </svg>                           
                                </div>








                          </div>
                          <div style="flex-basis: auto; font-size: 1.25em; font-weight: bold; text-align: left;">{{profileName.split(':').slice(-1)[0]}}</div>
                          <div style="flex: 1; text-align: right;line-height: 1.25em;">{{activeProfile.rt[profileName].URI}}</div>

                        </div>
                       




                        <div v-for="(profileCompoent,idx) in activeProfile.rt[profileName].ptOrder" :key="profileCompoent" :id="'container-for-'+profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')">
                            
                            <template v-if="!hideFields">      
                              <EditMainComponent v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true && displayComponentCheck(activeProfile.rt[profileName].pt[profileCompoent]) === true" :isMini="false" @showMiniEditorEdit="showMiniEditorClick"  :class="'component component-'+settingsDisplayMode" :parentURI="activeProfile.rt[profileName].URI" :activeTemplate="activeProfile.rt[profileName].pt[profileCompoent]" :profileName="profileName" :profileCompoent="profileCompoent" :topLevelComponent="true" :ptGuid="activeProfile.rt[profileName].pt[profileCompoent]['@guid']" :parentStructure="activeProfile.rtOrder" :structure="activeProfile.rt[profileName].pt[profileCompoent]"/>
                            </template>
                            <template v-else>
                              <EditMainComponent v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true && displayComponentCheck(activeProfile.rt[profileName].pt[profileCompoent]) === true && activeProfile.rt[profileName].pt[profileCompoent].canBeHidden === false" :isMini="false" @showMiniEditorEdit="showMiniEditorClick"  :class="'component component-'+settingsDisplayMode" :parentURI="activeProfile.rt[profileName].URI" :activeTemplate="activeProfile.rt[profileName].pt[profileCompoent]" :profileName="profileName" :profileCompoent="profileCompoent" :topLevelComponent="true" :ptGuid="activeProfile.rt[profileName].pt[profileCompoent]['@guid']" :parentStructure="activeProfile.rtOrder" :structure="activeProfile.rt[profileName].pt[profileCompoent]"/>
                            </template>
                        </div>

                        <div v-if="activeProfile.rt[profileName].unusedXml" style="background-color: #fde4b7; overflow-x: hidden;">
                          <h3>There was some XML that could not be loaded into this profile ({{profileName}}):</h3>
                          <details>
                            <summary>View</summary>
                            <code><pre>{{prettifyXml(activeProfile.rt[profileName].unusedXml)}}</pre></code>
                          </details>
                        </div>
                    </div>


                </div>

            </div>


        </article>


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

        <aside id="sidebar-right" class="sidebar-right" style="background-color: white" :key="activeEditCounter">

            <div ref="editRightMenuFixed"  style="height: 100vh; overflow-y:scroll; position: fixed; width: 26%;"  v-if="profilesLoaded">
                <!-- <div style="color:#bfbfbf; font-size: 1.5em; text-align: center;">{{sartingPoint}}</div> -->
                <div v-for="profileName in activeProfile.rtOrder" :key="profileName">

                        <div v-if="activeProfile.rt[profileName].noData != true" class="container-type-icon" style="color: #2c3e50">
                            <div>   
                                
                              <div v-if="profileName.includes('Work')">
                                <svg v-if="profileName.includes('Work')" width="1.5em" height="1.1em" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <circle fill="#7badad" cx="0.55em" cy="0.6em" r="0.45em"/>
                                </svg><span>Work</span>
                              </div>

<!-- 
                              <div v-if="profileName.split(':').slice(-1)[0] == 'Instance'" style="height: 1em;width: 1em; display: inline-block;" class="temp-icon-instance"></div>
 -->



                                <div v-if="profileName.includes('Instance')" style="height: 1em;width: 1em; display: inline-block;" class="temp-icon-instance"></div>
                                <span v-if="profileName.includes('Instance')">{{profileName.split(':').slice(-1)[0]}}</span>



                              <div v-if="profileName.includes(':Item')">
                                <div style="display:inline-block; height: 28px;   width: 26px;margin-right: 5px;" v-if="profileName.includes(':Item')">
                                  <svg  viewBox="0 -25 70 72" version="1.1" xmlns="http://www.w3.org/2000/svg">

                                       <rect width="40px" height="40px" style="fill:#eaeaea;stroke-width:0.5;stroke:rgb(0,0,0)" />
                                  </svg>
                                </div>
                                <span>Item</span>
                              </div>

                            <div v-if="profileName.endsWith(':Hub')">
                                <div style="display:flex;">
                                    <div style="flex:0">
                                        <svg style="height:1.25em"  version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                         <path fill="royalblue" d="m62.113 24.66 1.9023-15.238 18.875 32.691-7.5469 20.004 15.238 1.9023-32.691 18.875-20.004-7.5469-1.9023 15.238-18.875-32.691 7.5469-20.004-15.238-1.9023 32.691-18.875zm-17.684 15.695-4.0781 15.215 15.215 4.0781 4.0781-15.215z" fill-rule="evenodd"/>
                                        </svg>   
                                    </div>
                                    <div style="flex:1; text-align:left;"><span>Hub</span> </div>
                                </div>

                                                       
                            </div>





                            </div>
                            

                        </div>


                        <div v-if="activeProfile.rt[profileName].noData != true" style="margin-left: 1%; border-left: 1px solid rgba(44, 62, 80, 0.25); padding-left: 0.2em">
                            
                            <div v-for="profileCompoent in activeProfile.rt[profileName].ptOrder" :key="profileCompoent">



                              <div style="margin-bottom: 1em;" v-bind:class="[ {'opac-field-active':(activeComponent==profileCompoent &&activeProfileName==profileName)}]" v-if="Object.keys(activeProfile.rt[profileName].pt[profileCompoent].userValue).length>0 && returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue).length != 0 && activeProfile.rt[profileName].pt[profileCompoent].deleted != true">
                                <span class="opac-field-title">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}</span>
                                <div class="opac-field-value">
                                  <div v-bind:key="index" v-for="(val, index) in returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue)">
                                    <span v-if="!val.startsWith('http')">{{val}}</span>
                                    <EditLabelDereference v-else :URI="val"/>
                                  </div>
                                </div>
                              </div>


                            </div>

                          
                        </div>

<!-- 
                        <ul style="padding-left: 0;">
                            <li v-bind:class="['left-menu-list-item', { 'left-menu-list-item-has-data' :  liHasData(activeProfile.rt[profileName].pt[profileCompoent]), 'left-menu-list-item-active':(activeComponent==profileCompoent &&activeProfileName==profileName)}]" style="padding-left: 2em;" :id="'menu'+profileCompoent"  v-for="profileCompoent in activeProfile.rt[profileName].ptOrder" :key="profileCompoent">
                                {{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}

                            </li>
                        </ul> -->


                </div>
                <div style="margin-bottom: 2em; background-color: whitesmoke; padding: 1.5em">

  

                  <div style="text-align: center; margin-bottom: 1em">
                    <button style="font-size: 1.5em; width: 100%;" @click="togglePreview">PREVIEW XML<br><span style="font-size: 0.75em;">[CTRL+SHIFT+X]</span></button>
                  </div>



                  <div style="text-align: center;">
                    <button style="font-size: 1.5em; width: 100%;" @click="publish">POST<br><span style="font-size: 0.75em;">[CTRL+SHIFT+P]</span></button>
                  </div>

                  <button v-if="!activeRecordSaved" style="font-size: 1.5em; margin-left: 0.5em; display: none" @click="triggerSave">SAVE</button>
                  <button v-if="activeRecordSaved" style="color: lawngreen; font-size: 1.5em; margin-left: 0.5em; display: none" disabled="">SAVED</button>
                  

                </div>
            </div>




        </aside>


        <footer style="display: none;">
            Footer
        </footer>




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




        <div v-if="displayMiniEditor === true" class="modaloverlay modal-display mini-editor" style="z-index: 1000000;">
            <div class="modal" style="overflow-y: scroll; overflow-x: hidden;">
                <div v-if="displayMiniEditor" class="modal-content" >

                  <EditMini :key="displayMiniEditorKey" :miniEdiorKey="displayMiniEditorKey"  ref="miniEditorHub" miniProfile="Hub"></EditMini>


                  <div style="text-align: center; padding: 1em;">
                    <button @click="postAndUseMini">Post & Use this Hub</button> <button @click="closeMiniEditor">Cancel</button>
                  </div>
                </div>
            </div>
        </div>




       <div v-if="displayLiteralLanguage === true" class="modaloverlay modal-display select-lanague" style="z-index: 1000000;">
            <div class="modal" style="overflow-y: scroll; overflow-x: hidden;">

                  <EditLiteralLanguage ref="literalLanguageModal"></EditLiteralLanguage>

            </div>
        </div>







    </div>




</template>




<script>
// @ is an alias to /src
// import EditMainComponent from "@/components/EditMainComponent.vue";

import lookupUtil from "@/lib/lookupUtil"
import config from "@/lib/config"

import uiUtils from "@/lib/uiUtils"
import parseProfile from "@/lib/parseProfile"

import labels from "@/lib/labels"
import exportXML from "@/lib/exportXML"

import EditMini from "@/views/EditMini"
import EditLiteralLanguage from "@/components/EditLiteralLanguage"

import EditLabelDereference from "@/components/EditLabelDereference.vue";




import { mapState } from 'vuex'


export default {
  name: "Edit",
  components: {
    // EditMainComponent, // this is defined globaly to allow recursivness to work
    EditMini,
    EditLiteralLanguage,
    EditLabelDereference,


    Keypress: () => import('vue-keypress'),
    
  },
    computed: mapState({
        profilesLoaded: 'profilesLoaded',
        profiles: 'profiles',
        sartingPoint: 'sartingPoint',
        activeInput: 'activeInput',
        activeProfile: 'activeProfile',
        activeComponent: 'activeComponent',
        activeProfileName: 'activeProfileName',
        activeProfileMini: 'activeProfileMini',
        activeEditCounter: 'activeEditCounter',
        activeRecordSaved: 'activeRecordSaved',
        diagramMiniMap: 'diagramMiniMap',
        rtLookup: 'rtLookup',

        

        settingsHideEmptyFields: 'settingsHideEmptyFields',
        settingsDisplayMode: 'settingsDisplayMode',
        settingsLeftMenuEnriched: 'settingsLeftMenuEnriched',


        catInitials: 'catInitials',
        workingOnMiniProfile: 'workingOnMiniProfile',

      // to access local state with `this`, a normal function must be used
      // countPlusLocalState (state) {
      //   return state.count + this.localCount
      // }
    }),


  created: async function () {





    // load them profiles if they aint  
    if (!this.profilesLoaded){
        this.$store.dispatch("fetchProfiles", { self: this }).then(async () => {


          console.log(this.$route.params.recordId)
          console.log(this.activeProfile)


          // did we already load the record from the load screen or other place?
          if (!this.activeProfile.eId && this.$route.params.recordId){

            // no
            let ap = await parseProfile.loadRecordFromBackend(this.$route.params.recordId)
            // mark the record as not saved
            this.$store.dispatch("setActiveRecordSaved", { self: this}, false)
            this.$store.dispatch("setActiveProfile", { self: this, profile: ap }).then(() => {


                // this.sideBarGrabDragInit()

                // load the ontology lookups if they arnt
                this.loadProfileOntologyLookupsBuild()

                console.log('-----diagramMiniMap:',this.diagramMiniMap)

                this.hideFields  = this.settingsHideEmptyFields
                this.leftMenuEnriched = this.settingsLeftMenuEnriched
                this.updateHideEmptyFieldsReDraw()


            })

          }else{

            // this.sideBarGrabDragInit()

            // load the ontology lookups if they arnt
            this.loadProfileOntologyLookupsBuild()


          }










      })       
    }else{




        // did we already load the record from the load screen or other place?
        if (!this.activeProfile.eId && this.$route.params.recordId){

          // no
          let ap = await parseProfile.loadRecordFromBackend(this.$route.params.recordId)
          // mark the record as not saved
          this.$store.dispatch("setActiveRecordSaved", { self: this}, false)
          this.$store.dispatch("setActiveProfile", { self: this, profile: ap }).then(() => {


            this.$nextTick(()=>{
              // this.sideBarGrabDragInit()
              this.loadProfileOntologyLookupsBuild()

            })

            console.log('-----diagramMiniMap:',this.diagramMiniMap)
            this.hideFields  = this.settingsHideEmptyFields
            this.leftMenuEnriched = this.settingsLeftMenuEnriched
            this.updateHideEmptyFieldsReDraw()


          })

        }else{

          this.$nextTick(()=>{
            // this.sideBarGrabDragInit()
            this.loadProfileOntologyLookupsBuild()
            this.hideFields  = this.settingsHideEmptyFields
            this.updateHideEmptyFieldsReDraw()


          })

          
        }




    }

    this.$nextTick(function () {
        uiUtils.renderBorders()
        window.setTimeout(()=>{document.getElementsByTagName('input')[0].focus()},500)
  

        

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

  mounted: function(){



  },

  beforeRouteLeave (to, from , next) {
    const answer = window.confirm('Do you really want to leave the edit screen?')
    if (answer) {
      next()
    } else {
      next(false)
    }
  },



  updated: function () {
    this.$nextTick(function () {
        uiUtils.renderBorders()
    })
  },  

  data: function() {
    return {
      labels: labels,
      ontologyLookupTodo: [],
      displayPreview: false,
      xmlPreview: 'Loading...',
      showPostModal: false,
      showPostModalErrorMsg: false,
      resourceLinks: [],
      headerState: 'inital',
      activeMiniMap: {URI:null},
      miniMapActionValue: 'Actions',
      displayMiniEditor: false,
      displayMiniEditorKey: 12345,
      lastMouseY: 10,
      sourceLaunchId: null,
      sourceOfMiniComponent: null,
      displayLiteralLanguage: false,

      keyCounter: 0,


      optionDisplay: false,
      hideFields: false,

      leftMenuEnriched: false,      

    }
  },

  methods: {

    prettifyXml: uiUtils.prettifyXml,

    
    moveDown: uiUtils.globalMoveDown,
    moveUp: uiUtils.globalMoveUp,
    movePageDown: uiUtils.globalMovePageDown,
    movePageUp: uiUtils.globalMovePageUp,

    dupeProperty: uiUtils.dupeProperty,



    addProperty: function(profileName, profileCompoent,dupeData){
      if (!dupeData){dupeData=false}
      this.$store.dispatch("duplicateProperty", { self: this, id: profileCompoent, profile:profileName, dupeData:dupeData }).then(() => {
        
      })   

    },


    removeProperty: function(profileName, profileCompoent){


      const answer = window.confirm('Are you sure you want to remove the property?')
      if (answer) {
        this.$store.dispatch("removeProperty", { self: this, id: profileCompoent, profile:profileName }).then(() => {
          
        })         

      } else {
        
        return false

      }






    },




    canSendToInstance: function(uri,profileName){

        if (profileName.includes(':Work')){
            // add this to the config
            if (uri == 'http://id.loc.gov/ontologies/bibframe/contribution'){
                return true
            }
        }

        return false

    },

    returnTemplateTypes: function(templates){

        let titles = []
        for (let t of templates){
            console.log()    
            titles.push(this.rtLookup[t].resourceLabel)
        }
        
        return titles


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


        this.keyCounter++




    },

    updateLayout: async function(mode){
        
        this.$store.dispatch("settingsDisplayMode", { self: this, settingsDisplayMode: mode }).then(async () => {
            console.log(this.activeProfile)


            if (mode == 'spreadsheet'){
                await this.triggerSave()
                this.$router.push('/compactedit/'+this.activeProfile.eId) 
            }

        })


    },


    toggleOptionDisplay: function(){
        this.optionDisplay = (this.optionDisplay) ? false : true;        
    },


    displayComponentCheck: function(structure){

      if (structure.propertyURI == "http://id.loc.gov/ontologies/bibframe/hasItem"){

        return false;
      }
      if (structure.propertyURI == "http://id.loc.gov/ontologies/bibframe/hasInstance"){

        return false;
      }

      return true;
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

    postAndUseMini: async function(){

        this.$refs.miniEditorHub.triggerSave()

        let useData = await this.$refs.miniEditorHub.publish()



        // we are going to send this uri to the source component that asked the mini editor to load
        let tempContext = {
          "contextValue": true,                  
          "source": [],
          "type": "Hub",
          "variant": [],
          "uri": useData.useURI,
          "typeFull": "http://id.loc.gov/ontologies/bibframe/Hub",
          "title": useData.useCreator + ' ' + useData.useTitle,
          "contributor": [],
          "date": null,
          "genreForm": null,
          "nodeMap": {},
          "precoordinated" : false,
          "literal": false
        }     

        // turn off the mini editor as active profile
        this.$store.dispatch("setWorkingOnMiniProfile", { self: this, value: false }).then(() => {

            // set the context with the value to use
            this.$store.dispatch("setContextManually", { self: this.sourceOfMiniComponent, context: tempContext, }).then(() => {
                //tell it to set the value
                this.$store.dispatch("setValueComplex", { self: this.sourceOfMiniComponent, profileComponet: this.sourceOfMiniComponent.profileCompoent, template:this.sourceOfMiniComponent.activeTemplate, structure: this.sourceOfMiniComponent.structure, parentStructure: this.sourceOfMiniComponent.parentStructureObj }).then(() => {
                    // ask the UI to refresh from store
                    this.sourceOfMiniComponent.checkForUserData()

                })
            })


        })





        this.closeMiniEditor();

        return useData

    },


    closeMiniEditor: function(){

        this.displayMiniEditor = false


        this.$store.dispatch("setWorkingOnMiniProfile", { self: this, value: false }).then(() => {

            if (this.sourceLaunchId){
                document.getElementById(this.sourceLaunchId).focus()
            }

        })





    },


    showMiniEditorClick: function(payload){

        // TEMP hack, the children components aren't refreshing
        // need to figure out why, but two cycles clear the problem
        console.log("showMiniEditorClick")
        this.showMiniEditor(payload, ()=>{
            this.closeMiniEditor(payload)
            console.log("showMiniEditorClick 2")
            this.showMiniEditor(payload)
        })
        
        

    },

    showMiniEditor: function(payload, callback){

        // make a new key for each time it is loaded
        this.displayMiniEditorKey = `miniEditor-${Date.now()}`

        this.displayMiniEditor = true
        this.sourceLaunchId = payload.sourceId
        this.sourceOfMiniComponent = payload.component



        this.$store.dispatch("setWorkingOnMiniProfile", { self: this, value: true }).then(() => {

            if (this.profiles[payload.useProfile]){
                let profile = parseProfile.loadNewTemplate(payload.useProfile, this.catInitials)

                profile.user = this.catInitials
                console.log('-------')
                console.log(profile)
                console.log('-------')
                this.$store.dispatch("setActiveProfile", { self: this, profile: profile }).then(() => {
                   
                    this.$nextTick(()=>{
                  
                        document.getElementsByClassName('selectable-input-mini')[0].focus()
                        if (callback) callback()

                    })


                })

            }else{
                alert('Cannot find profile:',payload.useProfile)
            }


        })









        

    },


    cleanUpErrorResponse: function(msg){

        msg = JSON.stringify(msg,null,2)

        msg = msg.replace(/\\n|\\t/g, '').replace(/\\"/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>')

        return msg

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
      this.scrollFieldContainerIntoView(null,id)


      

      this.activeMiniMap = value




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

    escapeKey: function(){

      if (this.displayPreview){
        this.displayPreview = false
      }


      if (this.showPostModal){
        this.showPostModal = false
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


    isProd: function(){

      if (config.returnUrls().env == 'dev') return false
      if (config.returnUrls().env == 'staging') return false
      if (config.returnUrls().env == 'production') return true  
    },
          


    reportError: async function(event){

        let desc = prompt("Please enter descripion of the problem");

        if (!desc){
          return false
        }

        let contact = prompt("Your Email Address (Optional) ");




        const rawResponse = await fetch(config.returnUrls().util + 'error/report', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({eId: this.activeProfile.eId, desc:desc, contact:contact, activeProfile: this.activeProfile})
        });
        const content = await rawResponse.json();
        if (content.result){
          alert("Thanks!")
        }
        console.log(content);



        event.preventDefault()
        return false

    },

    

    triggerSave: async function(){

      let xml = await exportXML.toBFXML(this.activeProfile)
      lookupUtil.saveRecord(xml.xlmStringBasic, this.activeProfile.eId)

      this.$store.dispatch("setActiveRecordSaved", { self: this}, true).then(() => {

      })

    },



    restoreDelete: function(event, profile, id){

      this.$store.dispatch("restoreProperty", { self: this, id: id, profile:profile  }).then(() => {
        
      })   




    },

    makeVisible: function(event,profileCompoent,id){


        for (let rt in this.activeProfile.rt){
            for (let pt in this.activeProfile.rt[rt].pt){
                if (pt == profileCompoent){
                    this.activeProfile.rt[rt].pt[pt].canBeHidden = false
                    // this changes the key on a lot of things forcing the ui to update
                    this.keyCounter++
                }
            }
        }

        this.$nextTick(()=>{

          this.scrollFieldContainerIntoView(null,id)

        })

    },

    scrollFieldContainerIntoView: function(event,id){
      console.log('-----')
      console.log(id)
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

    sideBarGrabDragInit: function(){
       // we need to do some dom stuff here after we know the profiles have been loaded
        const ele = this.$refs.editLeftMenuFixed
        // console.log(ele, 'editLeftMenuFixed')

        ele.style.cursor = 'grab';

        

        let pos = { top: 0, left: 0, x: 0, y: 0 };

        const mouseDownHandler = function(e) {
            ele.style.cursor = 'grabbing';
            ele.style.userSelect = 'none';

            pos = {
                left: ele.scrollLeft,
                top: ele.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = function(e) {
            // How far the mouse has been moved
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;

            // Scroll the element
            ele.scrollTop = pos.top - dy;
            ele.scrollLeft = pos.left - dx;
        };

        const mouseUpHandler = function() {
            ele.style.cursor = 'grab';
            ele.style.removeProperty('user-select');

            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        // Attach the handler
        ele.addEventListener('mousedown', mouseDownHandler);



        // --- right menu


        const ele2 = this.$refs.editRightMenuFixed


        ele2.style.cursor = 'grab';

        

        let pos2 = { top: 0, left: 0, x: 0, y: 0 };

        const mouseDownHandler2 = function(e) {
            ele2.style.cursor = 'grabbing';
            ele2.style.userSelect = 'none';

            pos2 = {
                left: ele.scrollLeft,
                top: ele.scrollTop,
                // Get the current mouse pos2ition
                x: e.clientX,
                y: e.clientY,
            };

            document.addEventListener('mousemove', mouseMoveHandler2);
            document.addEventListener('mouseup', mouseUpHandler2);
        };

        const mouseMoveHandler2 = function(e) {
            // How far the mouse has been moved
            const dx = e.clientX - pos2.x;
            const dy = e.clientY - pos2.y;

            // Scroll the element
            ele2.scrollTop = pos2.top - dy;
            ele2.scrollLeft = pos2.left - dx;
        };

        const mouseUpHandler2 = function() {
            ele2.style.cursor = 'grab';
            ele2.style.removeProperty('user-select');

            document.removeEventListener('mousemove', mouseMoveHandler2);
            document.removeEventListener('mouseup', mouseUpHandler2);
        };

        // Attach the handler
        ele2.addEventListener('mousedown', mouseDownHandler2);        


    },


    loadProfileOntologyLookupsBuild: function(){

      // loop through the now active profile and request each property uri from cache or id.loc.gov

      Object.keys(this.activeProfile.rt).forEach((rtk)=>{
        Object.keys(this.activeProfile.rt[rtk].pt).forEach((ptk)=>{
          if (this.activeProfile.rt[rtk].pt[ptk].propertyURI == 'http://id.loc.gov/ontologies/bibframe/title'){

            if (this.ontologyLookupTodo.indexOf(this.activeProfile.rt[rtk].pt[ptk].propertyURI) == -1){
              this.ontologyLookupTodo.push(this.activeProfile.rt[rtk].pt[ptk].propertyURI)  
            }           
          }

        })
      })

      this.loadProfileOntologyLookupsRequest()
    },


    loadProfileOntologyLookupsRequest: function(){
      // this makes the reqeusts but does it one at a time


      if (this.ontologyLookupTodo.length>0){
        // grab one
        let uri = this.ontologyLookupTodo.pop()
        this.$store.dispatch("fetchOntology", { self: this, uri: uri }).then(() => {          
          this.loadProfileOntologyLookupsRequest()
        })   

        

      }

    },



    returnOpacFormat: function(userValue){
      let r = []
      try{


        // console.log(userValue)
        // console.log(Object.keys(userValue))
        Object.keys(userValue).forEach((k)=>{  
          // console.log(k)    
          // console.log(userValue[k])    
          if (!k.startsWith('@')){
            // console.log(k,userValue[k],"<----")
            for (let objVal of userValue[k]){
              // console.log(objVal)
              let addedValue = false
              Object.keys(objVal).forEach((kk)=>{

                

                if (!kk.startsWith('@')){
                  if (typeof objVal[kk] == 'string'){
                    r.push(objVal[kk])   
                    addedValue = true               
                  }else if (Array.isArray(objVal[kk])){

                    for (let objVal2 of objVal[kk]){
                      Object.keys(objVal2).forEach((kkk)=>{
                        if (!kkk.includes('@')){
                          if (typeof objVal2[kkk] == 'string'){
                            r.push(objVal2[kkk])
                            addedValue = true  
                          }                      
                        }
                      })


                    }
                  }
                }else if (kk=='@context'){

                    if (objVal[kk].title){
                        if (r.indexOf(objVal[kk].title)==-1){
                            r.push(objVal[kk].title)
                            addedValue = true  
                        }
                    }

                }
              })

                // if it went through all that and did not a it because it did not have a label, but it did have 
                // a URI add in the URI and the dereference component will look it up
                if (!addedValue){

                    if (objVal['@id']){
                        r.push(objVal['@id'])
                    }


                }


            }
          }



        })

        if (r.length == 0 && userValue['@id']){
          r.push(userValue['@id'])
        }
        // console.log('--------')
        // console.log(r)
        // console.log(userValue)


        r = [...new Set(r)];

      }catch{
        return "error"
      }
      return r
    },


    liHasData: function(structure){

      if (Object.keys(structure.userValue).length>0){
        return true
      }else if (structure.valueConstraint && structure.valueConstraint.defaults && structure.valueConstraint.defaults.length>0){
        return true
      } else{
        return false  
      }      
      
    }
  }  
};
</script>



