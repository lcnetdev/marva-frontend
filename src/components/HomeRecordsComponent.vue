<template>
  <div id="home-load">
    <Keypress key-event="keydown" :key-code="40" @success="moveDown" />
    <Keypress key-event="keydown" :key-code="38" @success="moveUp" />
    <Keypress key-event="keydown" :key-code="13" @success="selectTemplate" />


    <h3>Unposted Records - Workspace</h3>


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
        <th v-if="!allrecords"></th>
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
              <a :href="rl.url+'?blastdacache=' + Date.now()" target="_blank">View {{rl.type}} on {{rl.env}}</a>

            </div>
          </td>

          <td :title="record.status" v-else>{{record.lccn}}</td>



          <td>{{record.user}}</td>
          <td>{{record.time}}</td>
          <td v-if="!allrecords" style="cursor: pointer;" @click="deleteRecord(record.eid)">Delete</td>

          <td style="cursor: pointer;" @click="selectTemplateClickLoad(record.eid)">Load</td>

        </tr>


      </tbody>

    </table>


    <h3>Posted Records</h3>

    <details>
      <summary>Show posted records</summary>
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
          <th></th>
        </thead>

        <tbody>
          <tr v-for="record in recordsPublished" v-bind:key="record.eid">
            <td >{{record.title}}</td>
            <td>{{record.typeid}}</td>
            <td><div v-for="profile in record.profiletypes" v-bind:key="profile">{{profile}}</div></td>
            <td>{{record.eid}}</td>
            <td>{{record.contributor}}</td>

            <td :title="record.status" v-if="record.status=='unposted'">{{record.lccn}}</td>
            <td :title="record.status" v-else-if="record.status=='published'" style="background-color: lawngreen">
              {{record.lccn}}
              <div v-for="rl in resourceLinks(record)" v-bind:key="rl.url">
                <a :href="rl.url+'?blastdacache=' + Date.now()" target="_blank">View {{rl.type}} on {{rl.env}}</a>

              </div>
            </td>

            <td :title="record.status" v-else>{{record.lccn}}</td>



            <td>{{record.user}}</td>
            <td>{{record.time}}</td>
            <td style="cursor: pointer;" @click="deleteRecord(record.eid)">Delete</td>

            <td style="cursor: pointer;" @click="loadRecord(false,record.eid)">Load</td>

          </tr>


        </tbody>

      </table>
    </details>


    <h3>Deleted Records</h3>
    <details>
      <summary>Show deleted records</summary>

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
          <tr v-for="record in recordsDeleted" v-bind:key="record.eid">
            <td >{{record.title}}</td>
            <td>{{record.typeid}}</td>
            <td><div v-for="profile in record.profiletypes" v-bind:key="profile">{{profile}}</div></td>
            <td>{{record.eid}}</td>
            <td>{{record.contributor}}</td>

            <td :title="record.status" v-if="record.status=='unposted'">{{record.lccn}}</td>
            <td :title="record.status" v-else-if="record.status=='published'" style="background-color: lawngreen">
              {{record.lccn}}
              <div v-for="rl in resourceLinks(record)" v-bind:key="rl.url">
                <a :href="rl.url+'?blastdacache=' + Date.now()" target="_blank">View {{rl.type}} on {{rl.env}}</a>

              </div>
            </td>

            <td :title="record.status" v-else>{{record.lccn}}</td>



            <td>{{record.user}}</td>
            <td>{{record.time}}</td>

            <td style="cursor: pointer;" @click="loadRecord(false,record.eid)">Load</td>

          </tr>


        </tbody>

      </table>
    </details>




  </div>


</template>

<script>


import { mapState } from 'vuex'
// import lookupUtil from "@/lib/lookupUtil"
import parseProfile from "@/lib/parseProfile"
// import parseBfdb from '@/lib/parseBfdb'
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
      
      let sp = null
      let c = 1
      Object.keys(this.records).forEach((k)=>{
        if (`template-id-${c++}` === templateId){
          
          sp = k
        }
      })

      return sp

    },

    resourceLinks(record){

      let results = []

      if (record && record.externalid){
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
      

      if (justLength){
        return Object.keys(map).length
      }else{
        return map[uniqueId]  
      }
      
    },

    loadRecord: async function(recId,eId){


      let recordId

      if (recId !== false){
        recordId = this.records[recId].eid
      }else if (!recId && eId){
        recordId = eId
      }

      this.transformResults = await parseProfile.loadRecordFromBackend(recordId)


      console.log('this.transformResults',this.transformResults)
      console.log(recordId)


      // let workkey = this.transformResults.rtOrder.filter((k)=> k.includes(":Instance"))[0]
      // this.transformResultsDisplay = this.transformResults.rt[workkey]
      this.$store.dispatch("setActiveRecordSaved", { self: this}, false).then(() => {

      })

      this.$store.dispatch("setActiveProfile", { self: this, profile: this.transformResults }).then(() => {


        this.$router.push({ name: 'Edit', params: { recordId: recordId } })
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
    },


    async deleteRecord(eId){


      let url = config.returnUrls().util
      let stage = config.returnUrls().env

      url = `${url}delete/${stage}/${this.catInitials}/${eId}`


      const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: "{}"
      });

      const content = await rawResponse.json();



      if (!content.result){
        alert("Could not delete record, connection problems?")
      }



      this.refreshRecords()

    },


    refreshRecords(){

     if (this.allrecords){
        
        this.$store.dispatch("fetchAllRecords", { self: this, user: this.catInitials  }).then(() => {
          
          this.records = this.allRecords.filter((f) => (f.status=='unposted') ? true : false)
          this.recordsDeleted = this.allRecords.filter((f) => (f.status=='deleted') ? true : false)
          this.recordsPublished = this.allRecords.filter((f) => (f.status=='published') ? true : false)

        })  

        
      }else{
        
        this.$store.dispatch("fetchMyRecords", { self: this, user: this.catInitials  }).then(() => {

          this.records = this.myRecords.filter((f) => (f.status=='unposted') ? true : false)
          this.recordsDeleted = this.myRecords.filter((f) => (f.status=='deleted') ? true : false)
          this.recordsPublished = this.myRecords.filter((f) => (f.status=='published') ? true : false)

        })  

      }




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
      recordsDeleted: [],
      recordsPublished: [],
      activeTemplateId: null,
      actibveTemplateIdCount:0      

    }
  },
  created: function(){



    this.refreshRecords()

 





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
