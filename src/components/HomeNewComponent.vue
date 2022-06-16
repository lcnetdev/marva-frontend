<template>
  <div id="home-new">

    <Keypress key-event="keydown" :key-code="40" @success="moveDown" />
    <Keypress key-event="keydown" :key-code="38" @success="moveUp" />
    <Keypress key-event="keydown" :key-code="13" @success="selectTemplate" />

<!--     <Keypress key-event="keydown" :key-code="34" @success="movePageDown" />          
    <Keypress key-event="keydown" :key-code="33" @success="movePageUp" />

    <Keypress key-event="keydown" :multiple-keys="[{keyCode: 187, modifiers: ['ctrlKey'],preventDefault: true}]" @success="dupeProperty" />
 -->

    <h1>Create new record</h1>

    <hr>

    <h3>My templates</h3>

    <table>
        <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Based on profile</th>
                <th scope="col">Modified</th>
                <th scope="col">


<svg fill="#FFFFFF" width="1.2em" height="1.2em" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
 <path d="m94.895 75.828l5.2305-12.797-5.9062-5.2852c-2.2539-2.0156-3.5508-4.8945-3.5664-7.918v-0.003906c-0.015625-3.0352 1.2578-5.9258 3.4961-7.9688l5.8594-5.3359-5.3477-12.75-7.9102 0.44141c-3.0234 0.16797-5.9883-0.95313-8.1367-3.0898 0 0-0.003906 0-0.003906-0.003906-2.1445-2.1289-3.2891-5.0703-3.1523-8.0938l0.37109-7.918-12.801-5.2305-5.2852 5.9102c-2.0156 2.2539-4.8984 3.5508-7.9219 3.5664h-0.007812c-3.0234 0.015626-5.9219-1.2578-7.9609-3.4961l-5.3398-5.8594-12.75 5.3477 0.44141 7.9102c0.16406 3.0273-0.95703 5.9844-3.0938 8.1367 0 0 0 0.003906-0.003906 0.003906-2.1289 2.1484-5.0703 3.293-8.0938 3.1523l-7.9219-0.37109-5.2305 12.797 5.9102 5.2852c2.2539 2.0156 3.5508 4.8945 3.5664 7.918v0.003907c0.015624 3.0312-1.2578 5.9258-3.4961 7.9688l-5.8594 5.3359 5.3516 12.75 7.9062-0.44141c3.0273-0.16406 5.9883 0.95703 8.1406 3.0938h0.003906c2.1484 2.1289 3.2891 5.0703 3.1523 8.0938l-0.37109 7.918 12.797 5.2305 5.2578-5.8672c2.0312-2.2773 4.9375-3.5859 7.9883-3.6055h0.003907c3.0039-0.019531 5.8711 1.2383 7.8945 3.4609l5.3711 5.8945 12.75-5.3516-0.44141-7.9141c-0.16406-3.0234 0.95703-5.9805 3.0859-8.125 0-0.003906 0.003906-0.003906 0.003906-0.003906 2.1289-2.1484 5.0742-3.2969 8.0977-3.1562zm-52.02-8.4023c-9.625-3.9375-14.238-14.93-10.301-24.551 3.9336-9.625 14.926-14.234 24.551-10.297 9.6211 3.9297 14.23 14.926 10.297 24.547-3.9375 9.6211-14.926 14.23-24.547 10.301z"/>
</svg>

                </th>                
            </tr>
        </thead>

        <tbody v-if="userTemplates.length==0">
            <tr>
                <td colspan="4">Loading templates...</td>
            </tr>            
        </tbody>
        <tbody v-else>
            <tr v-for="t in userTemplates" :key="t.id">


                <td v-bind:class="['selectable-template']" @click="loadUserTemplate(t)">{{t.label}}</td>
                <td>{{t.basedOnProfile.map(v => v.replace('lc:RT:bf2:','') ).join(', ')}}</td>
                <td>{{new Date(t.timestamp*1000).toISOString().slice(0,10)}}</td>
                <td></td>


            </tr>            
        </tbody>

    </table>    



    <hr style="margin-top:2em">

    <h3>General templates</h3>


    <table>
        <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Modified</th>
                <th scope="col">
<svg fill="#FFFFFF" width="1.2em" height="1.2em" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
 <path d="m94.895 75.828l5.2305-12.797-5.9062-5.2852c-2.2539-2.0156-3.5508-4.8945-3.5664-7.918v-0.003906c-0.015625-3.0352 1.2578-5.9258 3.4961-7.9688l5.8594-5.3359-5.3477-12.75-7.9102 0.44141c-3.0234 0.16797-5.9883-0.95313-8.1367-3.0898 0 0-0.003906 0-0.003906-0.003906-2.1445-2.1289-3.2891-5.0703-3.1523-8.0938l0.37109-7.918-12.801-5.2305-5.2852 5.9102c-2.0156 2.2539-4.8984 3.5508-7.9219 3.5664h-0.007812c-3.0234 0.015626-5.9219-1.2578-7.9609-3.4961l-5.3398-5.8594-12.75 5.3477 0.44141 7.9102c0.16406 3.0273-0.95703 5.9844-3.0938 8.1367 0 0 0 0.003906-0.003906 0.003906-2.1289 2.1484-5.0703 3.293-8.0938 3.1523l-7.9219-0.37109-5.2305 12.797 5.9102 5.2852c2.2539 2.0156 3.5508 4.8945 3.5664 7.918v0.003907c0.015624 3.0312-1.2578 5.9258-3.4961 7.9688l-5.8594 5.3359 5.3516 12.75 7.9062-0.44141c3.0273-0.16406 5.9883 0.95703 8.1406 3.0938h0.003906c2.1484 2.1289 3.2891 5.0703 3.1523 8.0938l-0.37109 7.918 12.797 5.2305 5.2578-5.8672c2.0312-2.2773 4.9375-3.5859 7.9883-3.6055h0.003907c3.0039-0.019531 5.8711 1.2383 7.8945 3.4609l5.3711 5.8945 12.75-5.3516-0.44141-7.9141c-0.16406-3.0234 0.95703-5.9805 3.0859-8.125 0-0.003906 0.003906-0.003906 0.003906-0.003906 2.1289-2.1484 5.0742-3.2969 8.0977-3.1562zm-52.02-8.4023c-9.625-3.9375-14.238-14.93-10.301-24.551 3.9336-9.625 14.926-14.234 24.551-10.297 9.6211 3.9297 14.23 14.926 10.297 24.547-3.9375 9.6211-14.926 14.23-24.547 10.301z"/>
</svg>

                </th>                
            </tr>
        </thead>
        <tbody>
            <tr v-for="sp in Object.keys(startingPoints)" :key="sp" >
                <td :id="returnTemplateIdCount(sp)" @click="selectTemplateClick" v-bind:class="['selectable-template', { 'active' : (activeTemplateId==returnTemplateIdCount(sp))  }]" style="width:50%">{{sp}}</td>
                <td>

                  <span v-if="startingPoints[sp].work">
                  <svg style="width: 1.5em" version="1.1" viewBox="0 0 100 100"><path style="fill:#7BADAD;stroke:#231F20;stroke-width:0.5;stroke-miterlimit:10;" d="M88.8,33.6c-2.1-5-5.2-9.5-9-13.4c-3.9-3.9-8.4-6.9-13.4-9C61.2,9,55.7,7.8,50,7.8S38.8,9,33.6,11.2
  c-5,2.1-9.5,5.2-13.4,9c-3.9,3.9-6.9,8.4-9,13.4C9,38.8,7.8,44.3,7.8,50S9,61.2,11.2,66.4c2.1,5,5.2,9.5,9,13.4
  c3.9,3.9,8.4,6.9,13.4,9c5.2,2.2,10.7,3.3,16.4,3.3c5.7,0,11.2-1.1,16.4-3.3c5-2.1,9.5-5.2,13.4-9c3.9-3.9,6.9-8.4,9-13.4
  c2.2-5.2,3.3-10.7,3.3-16.4C92.1,44.3,91,38.8,88.8,33.6L88.8,33.6z"/></svg>
                  <span class="general-template-type-label">Work</span>
                  </span>
                  <span v-if="startingPoints[sp].instance">
                    <svg style="width: 1.5em" version="1.1" viewBox="0 0 100 100"><path style="fill:#8B588B;stroke:#0A131A;stroke-width:0.5;stroke-miterlimit:10;" d="M50,1.4l48.8,48.8L50,99.1L1.2,50.3L50,1.4z"/></svg>
                    <span class="general-template-type-label">Instance</span>
                  </span>


                  <span v-if="startingPoints[sp].hub">

                        <svg width="30px" height="30px"  version="1.1" viewBox="0 -10 100 100" xmlns="http://www.w3.org/2000/svg">
                         <path fill="royalblue" d="m62.113 24.66 1.9023-15.238 18.875 32.691-7.5469 20.004 15.238 1.9023-32.691 18.875-20.004-7.5469-1.9023 15.238-18.875-32.691 7.5469-20.004-15.238-1.9023 32.691-18.875zm-17.684 15.695-4.0781 15.215 15.215 4.0781 4.0781-15.215z" fill-rule="evenodd"/>
                        </svg>  
                        <span class="general-template-type-label">Hub</span>

                  </span> 

                </td>
                <td colspan="2"></td>

            </tr>
            
        </tbody>
    </table>    




    <div>

      <details style="margin-top: 2em;">
        
        <summary>Show All Profiles</summary>
        <ul style="margin-left:0; padding-left: 0;">

          <li style="margin-bottom:0.75em" v-for="p in Object.keys(profiles)" v-bind:key="p"><span style="font-weight: bold;">{{p}}</span>
            <a href="#" v-on:click.prevent="loadTemplate(p,false)" style="color: #2c3e50; padding-left: 0.5em;">Load</a>
            <details style="margin-left: 2em;font-size: 0.75em; cursor: pointer;">

              <summary>View RTs</summary>
              <ol><li style="font-size: 0.9em;" v-for="rt in profiles[p].rtOrder" v-bind:key="rt">{{rt}}</li></ol>
            </details>
          </li>


        </ul>

      </details>

    </div>

  </div>





</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"
import parseProfile from "@/lib/parseProfile"
import lookupUtil from "@/lib/lookupUtil"




export default {
  name: "HomeNewComponent",
  components: {
      Keypress: () => import('vue-keypress')
  },
  props: {
  },
  methods: {


    returnSpByTemplateId(templateId){

      let sp = null
      let c = 1
      Object.keys(this.startingPoints).forEach((k)=>{
        if (`template-id-${c++}` === templateId){
          sp = k
        }
      })

      return sp

    },

    returnTemplateIdCount(uniqueId, justLength){

      let map = {}
      let c = 1
      // loop through all the starting profiles
      Object.keys(this.startingPoints).forEach((k)=>{
        map[k] = `template-id-${c++}`
      })

      // DO THE SAME THING FOR USER TEMPLATES WHEN ADDED TO THE SYSTEM

      if (justLength){
        return Object.keys(map).length
      }else{
        return map[uniqueId]  
      }
      


    },


    loadTemplate: parseProfile.loadNewTemplate,

    loadUserTemplate(profile){

      this.$store.dispatch("clearUndo", { self: this}).then(()=>{
        this.$store.dispatch("setActiveUndo", { self: this, msg:'Created blank record'})
      })

      // the profile is stored as string json in the db due to key naming conflicts in mongo
      let useProfile = JSON.parse(profile.profile)

      useProfile = this.loadTemplate(null, this.catInitials,useProfile)

      this.$store.dispatch("setActiveProfile", { self: this, profile: useProfile, useDefaultValues: false }).then(() => {
        
        if (this.settingsDisplayMode == 'spreadsheet'){
          this.$router.push({ name: 'CompactEdit', params: { recordId: useProfile.eId } })
        }else{
          this.$router.push({ name: 'Edit', params: { recordId: useProfile.eId } })
        }

        this.$store.dispatch("forceSave", { self: this}, true).then(() => {
          this.$store.dispatch("setActiveRecordSaved", { self: this}, true).then(() => {

            window.scrollTo(0, 0);


          })    
        })   
      })


    },

    selectTemplateClick(event){


      let useStartingPoint = this.returnSpByTemplateId(event.target.id)
      console.log('useStartingPoint',useStartingPoint)
      let useProfile = this.loadTemplate(useStartingPoint, this.catInitials)

      this.$store.dispatch("clearUndo", { self: this}).then(()=>{
        this.$store.dispatch("setActiveUndo", { self: this, msg:'Created blank record'})
      })


      this.$store.dispatch("setActiveProfile", { self: this, profile: useProfile, useDefaultValues: true }).then(() => {
        
        if (this.settingsDisplayMode == 'spreadsheet'){
          this.$router.push({ name: 'CompactEdit', params: { recordId: useProfile.eId } })
        }else{
          this.$router.push({ name: 'Edit', params: { recordId: useProfile.eId } })
        }

        this.$store.dispatch("forceSave", { self: this}, true).then(() => {
          this.$store.dispatch("setActiveRecordSaved", { self: this}, true).then(() => {

            window.scrollTo(0, 0);


          })    
        })   
      })



    },

    selectTemplate(event){

      if (this.actibveTemplateIdCount <= 0){ return false}

      let useStartingPoint = this.returnSpByTemplateId(this.activeTemplateId)

      this.loadTemplate(useStartingPoint)

      event.event.preventDefault()
      return false
    },

    moveDown(event){

      if (this.actibveTemplateIdCount >= this.returnTemplateIdCount(true,true)){ return false}
      this.actibveTemplateIdCount++
      this.activeTemplateId = 'template-id-' + this.actibveTemplateIdCount
      document.getElementById(this.activeTemplateId).scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
      event.event.preventDefault()
      return false
    },

    moveUp(event){
      if (this.actibveTemplateIdCount <= 1){ return false}

      this.actibveTemplateIdCount = this.actibveTemplateIdCount - 1

      this.activeTemplateId = 'template-id-' + this.actibveTemplateIdCount
      document.getElementById(this.activeTemplateId).scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
      event.event.preventDefault()
      return false
    }    


  },
  computed: mapState({
    activeInput: 'activeInput',
    activeProfile: 'activeProfile',
    startingPoints: 'startingPoints',
    profiles: 'profiles',
    profilesClean: 'profilesClean',
    catInitials: 'catInitials',
    settingsDisplayMode: 'settingsDisplayMode',

    // assignedId (){


    //   return uiUtils.assignID(this.structure,this.parentStructure)

    // },    
  }), 

  data: function() {
    return {

      activeTemplateId: null,
      actibveTemplateIdCount:0,
      userTemplates: [],

    }
  },
  created: async function(){


    


    setTimeout(()=>{
      console.log(this.profiles)
      console.log(this.startingPoints)
    },1000)

    this.userTemplates = await lookupUtil.userTemplates(this.catInitials)
    console.log(this.userTemplates)

  },
};
</script>


<style scoped>





  .general-template-type-label{
    position: relative;
    top: -0.35em;
    padding-right: 1em;    
    padding-left: 0.25em;
  }


  table{
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;



  }
  thead{
    background-color: black;
    color:white;
    
  }

  th{
    padding: 0.5em;
    /*border-radius: 0.5em;*/
  }



  tr:first-child th:first-child {
    border-top-left-radius: 6px;
  }
  tr:first-child th:last-child {
    border-top-right-radius: 6px;
  }
  td {
    border-right: 1px solid #c6c9cc;
    border-bottom: 1px solid #c6c9cc;
    padding: 0.25em;    
  }
  td:first-child {
    border-left: 1px solid #c6c9cc;
  }
  tr:nth-child(even) td {
    background: #eaeaed;
  }
  tr:last-child td:first-child {
    border-bottom-left-radius: 6px;
  }
  tr:last-child td:last-child {
    border-bottom-right-radius: 6px;
  }

  .selectable-template{
    padding:4px;
  }
  .selectable-template:hover, td.active{
    background-color: rgb(9 13 139 / 0.25) !important;
    border: solid 4px rgb(9 13 139 / 0.25);
    padding:1px;
    cursor: pointer;
  }

  h1{
    margin: 0;
    font-weight: bold;
    font-size:2em;
  }
  #home-new{
    padding:1em 2em 1em 2em;
  }

</style>
