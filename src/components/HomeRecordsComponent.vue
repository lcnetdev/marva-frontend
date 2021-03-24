<template>
  <div id="home-load">
    <Keypress key-event="keydown" :key-code="40" @success="moveDown" />
    <Keypress key-event="keydown" :key-code="38" @success="moveUp" />
    <Keypress key-event="keydown" :key-code="13" @success="selectTemplate" />

    <table>
      <thead>
        <th>Title</th>
        <th>Resource</th>
        <th>Type</th>
        <th>ID</th>
        <th>Primary contribution</th>
        <th>LCCN</th>
        <th>User</th>
        <th>Modified</th>
        <th></th>
      </thead>

      <tbody>
        <tr v-for="record in records" v-bind:key="record.eid">
          <td :id="returnTemplateIdCount(record.eid)" @click="selectTemplateClick" v-bind:class="['selectable-template', { 'active' : (activeTemplateId==returnTemplateIdCount(record.eid))  }]" >{{record.title}}</td>
          <td>{{record.typeid}}</td>
          <td><div v-for="profile in record.profiletypes" v-bind:key="profile">{{profile}}</div></td>
          <td>{{record.eid}}</td>
          <td>{{record.contributor}}</td>

          <td :title="record.status" v-if="record.status=='unposted'">{{record.lccn}}</td>
          <td :title="record.status" v-else-if="record.status=='published'" style="background-color: lawngreen">
            {{record.lccn}}
            <div v-for="rl in resourceLinks(record)" v-bind:key="rl.url">
              <a :href="rl.url" target="_blank">View {{rl.type}} on {{rl.env}}</a>

            </div>
          </td>

          <td :title="record.status" v-else>{{record.lccn}}</td>



          <td>{{record.user}}</td>
          <td>{{record.time}}</td>
          <td style="    cursor: pointer;" @click="selectTemplateClickLoad(record.eid)">Load</td>

        </tr>


      </tbody>

    </table>



  </div>


</template>

<script>


import { mapState } from 'vuex'
import lookupUtil from "@/lib/lookupUtil"
import parseProfile from "@/lib/parseProfile"
import parseBfdb from '@/lib/parseBfdb'
import config from '@/lib/config'

// import HomeAllRecordsComponent from "@/components/HomeAllRecordsComponent.vue";

export default {
  name: "HomeRecordsComponent",
  components: {
      Keypress: () => import('vue-keypress')
  },
  props: {
      allrecords: Boolean
  },
  methods: {

    returnSpByTemplateId(templateId){
      console.log(this.records)
      let sp = null
      let c = 1
      Object.keys(this.records).forEach((k)=>{
        if (`template-id-${c++}` === templateId){
          console.log(k)
          sp = k
        }
      })

      return sp

    },

    resourceLinks(record){

      let results = []

      for (let uri of record.externalid){
        let type
        if (uri.includes("/items/"))(type = 'Item')
        if (uri.includes("/works/"))(type = 'Work')
        if (uri.includes("/instances/"))(type = 'Instance')

        let url = config.convertToRegionUrl(uri)
        let env = config.returnUrls().env

        results.push({
          'type':type,
          'url': url,
          'env': env
        })
      }

      return results

    },

    returnTemplateIdCount(uniqueId, justLength){

      let map = {}
      let c = 1
      // loop through all the starting profiles
      this.records.forEach((k)=>{
        map[k.eid] = `template-id-${c++}`
      })

      // DO THE SAME THING FOR USER TEMPLATES WHEN ADDED TO THE SYSTEM
      console.log(map)

      if (justLength){
        return Object.keys(map).length
      }else{
        return map[uniqueId]  
      }
      


    },

    loadRecord: async function(recId){

      let xml = await lookupUtil.loadSavedRecord(this.records[recId].eid)

      let meta = parseProfile.returnMetaFromSavedXML(xml)


      console.log(meta)

      parseBfdb.parse(meta.xml)

      // alert(parseBfdb.hasItem)

      let useProfile = null


      if (this.profiles[meta.profile]){
        useProfile = JSON.parse(JSON.stringify(this.profiles[meta.profile]))
      }else{
        alert('Cannot find that profile:',meta.profile)
      }
      
      // we might need to load in a item
      if (parseBfdb.hasItem>0){ 

        
        let useItemRtLabel
        // look for the RT for this item
        let instanceId = meta.rts.filter((id)=>{ return id.endsWith(':Instance')  })
        if (instanceId.length>0){
          useItemRtLabel = instanceId[0].replace(':Instance',':Item')          
        }

        if (!useItemRtLabel){
          let instanceId = meta.rts.filter((id)=>{ return id.endsWith(':Work')  })
          if (instanceId.length>0){
            useItemRtLabel = instanceId[0].replace(':Work',':Item')          
          }

        }


         

        for (let pkey in this.profiles){
          console.log(pkey)
          for (let rtkey in this.profiles[pkey].rt){
            if (rtkey == useItemRtLabel){
              let useItem = JSON.parse(JSON.stringify(this.profiles[pkey].rt[rtkey]))
              useProfile.rtOrder.push(useItemRtLabel)
              useProfile.rt[useItemRtLabel] = useItem                
            }
          }
        }


      }

      if (!useProfile.log){
        useProfile.log = []
      
      }
      useProfile.log.push({action:'loadInstanceFromSave',from:meta.eid})
      // useProfile.procInfo= "update instance"


      useProfile.procInfo = meta.procInfo
      


      // also give it an ID for storage
      useProfile.eId= meta.eid
      useProfile.user = this.catInitials
      useProfile.status = meta.status


      console.log(useProfile,'console.log(useProfile)')
      this.transformResults  = parseBfdb.transform(useProfile)

      // let workkey = this.transformResults.rtOrder.filter((k)=> k.endsWith(":Instance"))[0]
      // this.transformResultsDisplay = this.transformResults.rt[workkey]
      this.$store.dispatch("setActiveRecordSaved", { self: this}, false).then(() => {

      })

      this.$store.dispatch("setActiveProfile", { self: this, profile: this.transformResults }).then(() => {

        this.$router.push({ path: 'edit' })
      })





    },

    selectTemplateClick: async function(event){


      let recId = this.returnSpByTemplateId(event.target.id)

      this.loadRecord(recId)






    },

    selectTemplateClickLoad: async function(recId){

      let c = 0
      for (let r of this.records){
        if (r.eid == recId) break
        c++
      }

      this.loadRecord(c)

    },

    selectTemplate(event){

      if (this.actibveTemplateIdCount <= 0){ return false}

      let recId = this.returnSpByTemplateId(this.activeTemplateId)

      this.loadRecord(recId)

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
    activeProfile: 'activeProfile',
    startingPoints: 'startingPoints',
    profiles: 'profiles',
    profilesLoaded: 'profilesLoaded',
    myRecords: 'myRecords',
    allRecords: 'allRecords',
    catInitials:'catInitials'

    
    // to access local state with `this`, a normal function must be used
   
    // assignedId (){


    //   return uiUtils.assignID(this.structure,this.parentStructure)

    // },    
  }), 

  data: function() {
    return {

      records: [],
      activeTemplateId: null,
      actibveTemplateIdCount:0      

    }
  },
  created: function(){





    if (this.allrecords){
      console.log('allrecords')
      this.$store.dispatch("fetchAllRecords", { self: this, user: this.catInitials  }).then(() => {
        this.records = this.allRecords
      })  

      
    }else{
      
      this.$store.dispatch("fetchMyRecords", { self: this, user: this.catInitials  }).then(() => {
        this.records = this.myRecords
      })  

    }





  },
};
</script>


<style scoped>


#home-load{
  padding: 1em;
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


/*
table{
  border: 1px solid #2b2b2b;
  border-collapse: collapse;
  width: 100%;
}
td, th{
  padding: 0.25em;
  border: 1px solid #2b2b2b;


}
thead{
  background-color: #2b2b2b;
  color: white;

}
*/

</style>
