
<style>

#edit-left-menu-fixed{
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
#edit-left-menu-fixed::-webkit-scrollbar { 
  display: none;  /* Safari and Chrome */
}





#send-to-modal{

    position: fixed;
    top: 10%;
    left: 15%;
    width: 40vw;
    height: 40vh;
    background-color: whitesmoke;
    border: solid 1px black;
    border-radius: 0.5em;
    -webkit-box-shadow: 5px 5px 15px 5px rgba(0,0,0,0.14); 
    box-shadow: 5px 5px 15px 5px rgba(0,0,0,0.14);


}
#send-to-modal li{
    padding-top: 1em;
    cursor: pointer;
}
#send-to-modal li:hover{
    background-color: white;

}

</style>


<template>
    <div class="grid">






      


        <EditNavToolBar ref="navToolBar" :forceComponentRedraw="forceComponentRedraw"/>




          <Keypress key-event="keydown" :key-code="40" @success="moveDown" />
          <Keypress key-event="keydown" :key-code="38" @success="moveUp" />
          <Keypress key-event="keydown" :key-code="34" @success="movePageDown" />          
          <Keypress key-event="keydown" :key-code="33" @success="movePageUp" />

          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 187, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="dupeProperty" />
          <Keypress key-event="keydown" :multiple-keys="[{keyCode: 189, modifiers: ['ctrlKey','shiftKey'],preventDefault: true}]" @success="removeProperty" />



          




        <aside id="edit-left-menu" class="sidebar-left" style="background-color: #2a2a2a; color: #ffffff" >
        
            <div id="edit-left-menu-fixed" ref="editLeftMenuFixed" style="height: 98vh; overflow-y:scroll; position: fixed; width: 20%;" v-if="profilesLoaded">
                <!-- <div style="color:#bfbfbf; font-size: 1.5em; text-align: center;">{{sartingPoint}}</div> -->
                <div v-for="profileName in activeProfile.rtOrder" :key="profileName">

                    <div v-if="activeProfile.rt[profileName].noData != true">
                        <div class="container-type-icon" style="color: #ffffff; width: inherit; text-align: left;">
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
                            <li v-bind:class="['left-menu-list-item', 'enriched-menu', { 'left-menu-list-item-has-data' :  liHasData(activeProfile.rt[profileName].pt[profileCompoent]) && returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue).length != 0, 'left-menu-list-item-active':(activeComponent==profileCompoent &&activeProfileName==profileName), 'left-menu-list-item-hide':(!displayComponentCheck(activeProfile.rt[profileName].pt[profileCompoent])), 'is-hidden-li': (settingsHideEmptyFields === true && activeProfile.rt[profileName].pt[profileCompoent].canBeHidden) }]"  :id="'menu'+profileName+profileCompoent"  v-for="(profileCompoent,idx) in activeProfile.rt[profileName].ptOrder" :key="profileCompoent" @click="scrollFieldContainerIntoView($event,profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_'))">
                                <template v-if="!settingsHideEmptyFields">
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
                                        
                                        <template v-if="!settingsHideEmptyFields || (settingsHideEmptyFields && !activeProfile.rt[profileName].pt[profileCompoent].canBeHidden) ">
                                            <button title="Add Blank Component [CRTL+SHIFT+PLUS_SIGN(+)]" class="left-menu-button-dupe-blank" @click="addProperty($event, profileName,profileCompoent)">
                                                <svg width="25px" height="25px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                 <path class="enriched-menu-icon" d="m50 2.6797c-26.082 0-47.395 21.23-47.395 47.32 0 26.082 21.238 47.32 47.395 47.32 26.082 0 47.32-21.234 47.32-47.32 0-26.082-21.234-47.32-47.32-47.32zm0 10.996c20.039 0 36.324 16.289 36.324 36.324 0 20.039-16.289 36.324-36.324 36.324-20.039 0-36.324-16.289-36.324-36.324 0-20.039 16.289-36.324 36.324-36.324zm0 9.625c-3.0117 0-5.5352 2.5234-5.5352 5.5352v15.164h-15.16c-3.0117 0-5.5391 2.5234-5.5391 5.5352 0 3.0156 2.5234 5.5352 5.5391 5.5352h15.16v15.16c0 3.0117 2.5234 5.5352 5.5352 5.5352s5.5352-2.5234 5.5352-5.5352v-15.16h15.16c3.0117 0 5.5391-2.5234 5.5391-5.5352 0-3.0156-2.5938-5.457-5.5391-5.457h-15.16v-15.242c0-3.0117-2.5234-5.5352-5.5352-5.5352z"/>
                                                </svg>
                                            </button>
                                            
                                            <button  class="left-menu-button-remove" title="Remove Component [CRTL+SHIFT+MINUS_SIGN(-)]" @click="removeProperty(profileName,profileCompoent)">
                                                <svg width="25px" height="25px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                 <g>
                                                  <path class="enriched-menu-icon" d="m50 0c-27.613 0-50 22.387-50 50s22.387 50 50 50 50-22.387 50-50-22.387-50-50-50zm0 90c-22.059 0-40-17.941-40-40s17.941-40 40-40 40 17.941 40 40-17.941 40-40 40z"/>
                                                  <path class="enriched-menu-icon" d="m71.613 36.719c0-2.2109-0.875-4.3281-2.4414-5.8945-1.5625-1.5664-3.6797-2.4414-5.8945-2.4414s-4.3281 0.87891-5.8945 2.4414l-8.25 8.25-8.25-8.25c-1.5625-1.5625-3.6797-2.4414-5.8945-2.4414-2.207 0.003907-4.3164 0.87891-5.8828 2.4453-1.5625 1.5625-2.4375 3.6836-2.4375 5.8906 0 2.2109 0.87891 4.3281 2.4414 5.8945l8.25 8.25-8.25 8.25c-1.5625 1.5586-2.4414 3.6758-2.4414 5.8867s0.875 4.3281 2.4414 5.8945c1.5625 1.5625 3.6797 2.4375 5.8906 2.4375s4.3281-0.87891 5.8945-2.4414l8.25-8.25 8.25 8.25c1.5586 1.5625 3.6758 2.4414 5.8867 2.4414s4.3281-0.875 5.8945-2.4414c1.5664-1.5625 2.4414-3.6797 2.4414-5.8945s-0.87891-4.3281-2.4414-5.8945l-8.25-8.25 8.25-8.25c1.5625-1.5547 2.4375-3.6719 2.4375-5.8828z"/>
                                                 </g>
                                                </svg>
                                            </button>
                                            <button title="Duplicate Component" class="left-menu-button-dupe" @click="addProperty($event,profileName,profileCompoent,true)">
                                                <svg width="25px" height="25px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                 <g>
                                                  <path class="enriched-menu-icon" d="m79.5 31.801h-43.398c-1.8008 0-3.3008 1.5-3.3008 3.3008v43.5c0 1.8008 1.5 3.3008 3.3008 3.3008h43.5c1.8008 0 3.3008-1.5 3.3008-3.3008l-0.003906-43.5c-0.097657-1.8008-1.5-3.3008-3.3984-3.3008z"/>
                                                  <path class="enriched-menu-icon" d="m67.199 29.801v-7.5c0-2.3008-1.8008-4.1016-4.1016-4.1016h-41.797c-2.3008 0-4.1016 1.8984-4.1016 4.1016v41.801c0 2.3008 1.8008 4.1016 4.1016 4.1016h9.5v-33.102c0-2.8984 2.3984-5.3008 5.3008-5.3008z"/>
                                                 </g>
                                                </svg>
                                            </button>
                                            <button title="Send To Instance" class="left-menu-button-send" v-if="canSendToInstance(activeProfile.rt[profileName].pt[profileCompoent].propertyURI,profileName)" @click="sendToInstance($event,profileName,profileCompoent,activeProfile.rt[profileName].pt[profileCompoent])">
                                                <svg width="25px" height="25px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                 <path class="enriched-menu-icon" d="m100 50-100-44.414 9.4961 37.988 34.918 6.4258-34.918 6.4258-9.4961 37.988z" fill-rule="evenodd"/>
                                                </svg>
                                            </button>
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
                          <div style="flex: 1; text-align: right;line-height: 1.25em;">{{activeProfile.rt[profileName].URI.replace('http://id.loc.gov/','/').replace('https://id.loc.gov/','/')}}</div>

                        </div>
                       




                        <div v-for="(profileCompoent,idx) in activeProfile.rt[profileName].ptOrder" :key="profileCompoent" :id="'container-for-'+profileName.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')+idx+profileCompoent.replace(/\(|\)|\s|\/|:|\.|\|/g,'_')">
                            
                            <template v-if="!settingsHideEmptyFields">      
                              <EditMainComponent v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true && displayComponentCheck(activeProfile.rt[profileName].pt[profileCompoent]) === true" :level="0" :isMini="false" @showMiniEditorEdit="showMiniEditorClick"  :class="'component component-'+settingsDisplayMode" :parentURI="activeProfile.rt[profileName].URI" :activeTemplate="activeProfile.rt[profileName].pt[profileCompoent]" :profileName="profileName" :profileCompoent="profileCompoent" :topLevelComponent="true" :ptGuid="activeProfile.rt[profileName].pt[profileCompoent]['@guid']" :parentStructure="activeProfile.rtOrder" :structure="activeProfile.rt[profileName].pt[profileCompoent]"/>
                            </template>
                            <template v-else>
                              <EditMainComponent v-if="activeProfile.rt[profileName].pt[profileCompoent].deleted != true && displayComponentCheck(activeProfile.rt[profileName].pt[profileCompoent]) === true && activeProfile.rt[profileName].pt[profileCompoent].canBeHidden === false" :level="0" :isMini="false" @showMiniEditorEdit="showMiniEditorClick"  :class="'component component-'+settingsDisplayMode" :parentURI="activeProfile.rt[profileName].URI" :activeTemplate="activeProfile.rt[profileName].pt[profileCompoent]" :profileName="profileName" :profileCompoent="profileCompoent" :topLevelComponent="true" :ptGuid="activeProfile.rt[profileName].pt[profileCompoent]['@guid']" :parentStructure="activeProfile.rtOrder" :structure="activeProfile.rt[profileName].pt[profileCompoent]"/>
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


                                <template v-if="!ignoreRightMenuProperty(activeProfile.rt[profileName].pt[profileCompoent])">
                                    

                                

                                  <div style="margin-bottom: 1em;" v-bind:class="[ {'opac-field-active':(activeComponent==profileCompoent &&activeProfileName==profileName)}]" v-if="Object.keys(activeProfile.rt[profileName].pt[profileCompoent].userValue).length>0 && returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue).length != 0 && activeProfile.rt[profileName].pt[profileCompoent].deleted != true">
                                    <span class="opac-field-title">{{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}</span>
                                    <div class="opac-field-value">
                                      <div v-bind:key="index" v-for="(val, index) in returnOpacFormat(activeProfile.rt[profileName].pt[profileCompoent].userValue)">
                                        <span v-if="!val.startsWith('http')">{{val}}</span>
                                        <EditLabelDereference v-else :URI="val"/>
                                      </div>
                                    </div>
                                  </div>

                                </template>


                            </div>

                          
                        </div>

<!-- 
                        <ul style="padding-left: 0;">
                            <li v-bind:class="['left-menu-list-item', { 'left-menu-list-item-has-data' :  liHasData(activeProfile.rt[profileName].pt[profileCompoent]), 'left-menu-list-item-active':(activeComponent==profileCompoent &&activeProfileName==profileName)}]" style="padding-left: 2em;" :id="'menu'+profileCompoent"  v-for="profileCompoent in activeProfile.rt[profileName].ptOrder" :key="profileCompoent">
                                {{activeProfile.rt[profileName].pt[profileCompoent].propertyLabel}}

                            </li>
                        </ul> -->


                </div>

<!--                 
                <div style="margin-bottom: 2em; background-color: whitesmoke; padding: 1.5em">

  

                  <div style="text-align: center; margin-bottom: 1em">
                    <button style="font-size: 1.5em; width: 100%;" @click="togglePreview">PREVIEW XML<br><span style="font-size: 0.75em;">[CTRL+SHIFT+X]</span></button>
                  </div>



                  <div style="text-align: center;">
                    <button style="font-size: 1.5em; width: 100%;" @click="publish">POST<br><span style="font-size: 0.75em;">[CTRL+SHIFT+P]</span></button>
                  </div>

                  <button v-if="!activeRecordSaved" style="font-size: 1.5em; margin-left: 0.5em; display: none" @click="triggerSave">SAVE</button>
                  <button v-if="activeRecordSaved" style="color: lawngreen; font-size: 1.5em; margin-left: 0.5em; display: none" disabled="">SAVED</button>
                  

                </div> -->
            </div>




        </aside>


        <footer style="display: none;">
            Footer
        </footer>







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









        <div v-if="sendToTempDispaly" id="send-to-modal">
            
            <ul>
                <li v-for="rt in activeProfile.rtOrder" :key="rt" @click="sendToSendIt(rt)">{{rt}}</li>

            </ul>

            <button @click="sendToTempDispaly=false" style="position:absolute; bottom: 5px; right: 5px;">Close</button>
        </div>





    </div>




</template>




<script>
// @ is an alias to /src
// import EditMainComponent from "@/components/EditMainComponent.vue";

// import lookupUtil from "@/lib/lookupUtil"
import config from "@/lib/config"

import uiUtils from "@/lib/uiUtils"
import parseProfile from "@/lib/parseProfile"

import labels from "@/lib/labels"
// import exportXML from "@/lib/exportXML"

import EditMini from "@/views/EditMini"


import EditLabelDereference from "@/components/EditLabelDereference.vue";

import EditNavToolBar from "@/components/EditNavToolBar.vue";




import { mapState } from 'vuex'


export default {
  name: "Edit",
  components: {
    // EditMainComponent, // this is defined globaly to allow recursivness to work
    EditMini,
    EditLabelDereference,
    EditNavToolBar,

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

    let yourDate = new Date()
    
    if (yourDate.toISOString().split('T')[0] == '2022-10-19' || yourDate.toISOString().split('T')[0] == '2022-10-20'){
      Object.keys(localStorage)
       .filter(x =>
          x.startsWith('ontology_'))
       .forEach(x => 
          localStorage.removeItem(x))
    }

    if (yourDate.toISOString().split('T')[0].indexOf('2022-10') > -1){
      Object.keys(localStorage)
       .filter(x =>
          x.startsWith('ontology_'))
       .forEach(x => 
          localStorage.removeItem(x))
    }




    // load them profiles if they aint  
    if (!this.profilesLoaded){
        this.$store.dispatch("fetchProfiles", { self: this }).then(async () => {


          console.log(this.$route.params.recordId)
          console.log(this.activeProfile)


          // did we already load the record from the load screen or other place?
          if (!this.activeProfile.eId && this.$route.params.recordId){

            // no
            this.$store.dispatch("clearUndo", { self: this})

            let ap = await parseProfile.loadRecordFromBackend(this.$route.params.recordId)


            // mark the record as saved and save the inital of it so it is registered in the undo log
            this.$store.dispatch("setActiveUndo", { self: this, msg:'Loaded record'}).then(()=>{

                this.$store.dispatch("forceSave", { self: this}, true).then(() => {
                    this.$store.dispatch("setActiveRecordSaved", { self: this}, true).then(() => {
                    })    
                })  

            })







            this.$store.dispatch("setActiveProfile", { self: this, profile: ap }).then(() => {


                // this.sideBarGrabDragInit()

                // load the ontology lookups if they arnt
                this.loadProfileOntologyLookupsBuild()

                console.log('-----diagramMiniMap:',this.diagramMiniMap)

                this.$store.dispatch("setSubjectList")

                

                
                this.leftMenuEnriched = this.settingsLeftMenuEnriched
                this.$refs.navToolBar.updateHideEmptyFieldsReDraw()
                this.forceComponentRedraw()

            })

          }else{

            // this.sideBarGrabDragInit()

            // load the ontology lookups if they arnt
            this.loadProfileOntologyLookupsBuild()
            this.$store.dispatch("setSubjectList")

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
            this.$store.dispatch("setSubjectList")

            this.leftMenuEnriched = this.settingsLeftMenuEnriched
            this.$refs.navToolBar.updateHideEmptyFieldsReDraw()
            this.forceComponentRedraw()

          })

        }else{

          this.$nextTick(()=>{
            // this.sideBarGrabDragInit()
            this.loadProfileOntologyLookupsBuild()
            this.$store.dispatch("setSubjectList")
            
            this.$refs.navToolBar.updateHideEmptyFieldsReDraw()
            this.forceComponentRedraw()

          })

          
        }




    }

    this.$nextTick(function () {
        uiUtils.renderBorders()
        window.setTimeout(()=>{document.getElementsByTagName('input')[0].focus()},500)
  

    })
  },

  mounted: function(){



  },

  // beforeRouteLeave (to, from , next) {
  //   const answer = window.confirm('Do you really want to leave the edit screen?')
  //   if (answer) {
  //     next()
  //   } else {
  //     next(false)
  //   }
  // },



  updated: function () {
    this.$nextTick(function () {
        uiUtils.renderBorders()
    })
  },  

  data: function() {
    return {
      labels: labels,
      ontologyLookupTodo: [],

      
      

      displayMiniEditor: false,
      displayMiniEditorKey: 12345,
      
      sourceLaunchId: null,
      sourceOfMiniComponent: null,

      keyCounter: 0,



       


      sendToTemp: {},
      sendToTempDispaly: false,

    }
  },

  methods: {

    prettifyXml: uiUtils.prettifyXml,

    
    moveDown: uiUtils.globalMoveDown,
    moveUp: uiUtils.globalMoveUp,
    movePageDown: uiUtils.globalMovePageDown,
    movePageUp: uiUtils.globalMovePageUp,

    dupeProperty: uiUtils.dupeProperty,


    ignoreRightMenuProperty: function(component){

        if (component.propertyURI == 'http://id.loc.gov/ontologies/bibframe/instanceOf'){
            return true
        }
        return false

    },

    forceComponentRedraw: function(){

        console.log(this.keyCounter)

        this.keyCounter++

    },

    addProperty: function(event, profileName, profileCompoent,dupeData){
      if (!dupeData){dupeData=false}
      this.$store.dispatch("duplicateProperty", { self: this, id: profileCompoent, profile:profileName, dupeData:dupeData }).then(() => {
        
      })   

      event.stopPropagation();

    },


    removeProperty: function(profileName, profileCompoent){

        // if they use the keyboard shortcut we can't just pass the right info so lookitup
        if (!profileName || !profileCompoent){
            for (let rt in this.activeProfile.rt){
                for (let pt in this.activeProfile.rt[rt].pt){
                    if (pt == this.activeComponent){
                        profileName = rt
                    }
                }
            }
            profileCompoent = this.activeComponent
        }
        

      const answer = window.confirm('Are you sure you want to remove the property?')
      if (answer) {
        this.$store.dispatch("removeProperty", { self: this, id: profileCompoent, profile:profileName }).then(() => {
          
        })         

      } else {
        
        return false

      }

    },


    sendToSendIt(rt){

        if (rt != this.sendToTemp.profileName){


            this.$store.dispatch("sendToInstance", { self: this, from: this.sendToTemp, to:rt }).then(async () => {

            })


        }
        this.sendToTempDispaly=false;
        this.keyCounter++
    },


    sendToInstance(event, profileName,profileCompoent,data){

        console.log(profileName,profileCompoent,data)

        this.sendToTemp = {'profile':profileName,componet:profileCompoent,data:data}

        this.sendToTempDispaly=true;
        this.keyCounter++
        event.stopPropagation();

    },

    canSendToInstance: function(uri,profileName){

        if (profileName.includes(':Work')){
            // add this to the config
            if (uri == 'http://id.loc.gov/ontologies/bibframe/contribution'){
                return true
            }
            if (uri == 'http://id.loc.gov/ontologies/bibframe/language'){
                return true
            }
            if (uri == 'http://id.loc.gov/ontologies/bibframe/note'){
                return true
            }
            if (uri == 'http://id.loc.gov/ontologies/bibframe/genreForm'){
                return true
            }

            
        }

        return false

    },

    returnTemplateTypes: function(templates){

        let titles = []
        for (let t of templates){
            if (this.rtLookup[t] && this.rtLookup[t].resourceLabel){
                titles.push(this.rtLookup[t].resourceLabel)
            }
        }
        
        return titles


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







    // isProd: function(){

    //   if (config.returnUrls().env == 'dev') return false
    //   if (config.returnUrls().env == 'staging') return false
    //   if (config.returnUrls().env == 'production') return true  
    // },
          


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
      console.log(document.getElementById('container-for-'+id))
      document.getElementById('container-for-'+id).scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
      window.setTimeout(()=>{
        if (document.querySelector('#container-for-'+id + ' input')){
          document.querySelector('#container-for-'+id + ' input').focus()  
        }else if (document.querySelector('#container-for-'+id + ' textarea')){
          document.querySelector('#container-for-'+id + ' textarea').focus()  
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
          // if (this.activeProfile.rt[rtk].pt[ptk].propertyURI == 'http://id.loc.gov/ontologies/bibframe/title'){

            if (this.ontologyLookupTodo.indexOf(this.activeProfile.rt[rtk].pt[ptk].propertyURI) == -1){
              this.ontologyLookupTodo.push(this.activeProfile.rt[rtk].pt[ptk].propertyURI)  
            }           
          // }

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

        // find the base predicate and use that to get to the base bnode
        let usekey = Object.keys(userValue).filter((v)=>{ return (v.indexOf('@') == -1) })



        if (usekey.length>0 && userValue[usekey[0]]){



            userValue = userValue[usekey[0]][0]




            Object.keys(userValue).forEach((k)=>{  
              // console.log(k)    
              // console.log(userValue[k])    
              if (!k.startsWith('@')){
                // console.log(k,userValue[k],"<----")
                let addedValue = false

                // this is for the top level literal values
                if (typeof userValue[k] === 'string'){
                    r.push(userValue[k])   
                    addedValue = true  
                    return
                }

                for (let objVal of userValue[k]){
                  // console.log(objVal)
                  
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


            r = [...new Set(r)];

            for (let x of r){
                x = x.replace(/&amp;/g, '&'); 
            }
        }

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



