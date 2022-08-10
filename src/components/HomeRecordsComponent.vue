<template>
  <div id="home-load">
    <Keypress key-event="keydown" :key-code="40" @success="moveDown" />
    <Keypress key-event="keydown" :key-code="38" @success="moveUp" />
    <Keypress key-event="keydown" :key-code="13" @success="selectTemplate" />

    <div style="display: flex;">
      
      <div style="flex:2">
        <fieldset class="multiswitch" data-theme="stoplight" v-if="this.browseType != 'searching'">
          <legend>Select what type of records to browse:</legend>

          <div class="slide-container">
            <input type="radio" name="stoplight" @change="browseTypeChange" v-model="browseType" value="unposted" id="stoplight1">
            <label for="stoplight1">Unposted Records ({{this.records.length}})</label>
            <input type="radio" name="stoplight" @change="browseTypeChange" v-model="browseType" value="posted" id="stoplight2">
            <label for="stoplight2">Posted Records ({{this.recordsPublished.length}})</label>
            <input type="radio" name="stoplight" @change="browseTypeChange" v-model="browseType" value="deleted" id="stoplight3">
            <label for="stoplight3">Deleted (from Marva) ({{this.recordsDeleted.length}})</label>
            <!-- leave this "slide" -->
            <a class="slide" aria-hidden="true"></a>
          </div>
        </fieldset>        


      </div>

      <div style="flex:1; border-left: solid 1px darkgray; padding-left: 2em;">
        <div style="display: block;margin-bottom: 10px;font-weight: 600;">Search for records older than 2 week:</div>
        <div>
          <input id="search"  type="text" placeholder="Search For..." v-model="searchValue" v-on:keyup.enter="search"  /><button @click="search" style="margin-right: 0.5em;">Search</button><button @click="clear">Clear</button>
        </div>
      </div>



    </div>

    <template v-if="browseType == 'searching'"> 

      <h1> <span id="loading-icon">⟳</span> Loading data...</h1>

    </template>

    <template v-if="browseType == 'unposted'"> 

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
            <td :id="returnTemplateIdCount(record.eid)" v-bind:class="['selectable-template', { 'active' : (activeTemplateId==returnTemplateIdCount(record.eid))  }]" >{{record.title}}</td>
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
<!--             <td v-if="!allrecords" style="cursor: pointer;" @click="deleteRecord(record.eid)">Delete</td>

            <td style="cursor: pointer;" @click="selectTemplateClickLoad(record.eid)">Load</td>
 -->
            <td v-if="!allrecords"><a class="delete-link" href="#" @click="deleteRecord($event, record.eid)">Delete</a></td>
            <td><a href="#" class="load-link" @click="selectTemplateClickLoad($event,record.eid)">Load</a></td>





          </tr>


        </tbody>

      </table>

    </template>



    <template v-if="browseType == 'posted'"> 

      <h3>Posted Records</h3>
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

            <td><a href="#" class="load-link" @click="loadRecord(false,record.eid,$event)">Load</a></td>

          </tr>


        </tbody>

      </table>
    </template>

    <template v-if="browseType == 'deleted'"> 

      <h3>Deleted Records</h3>

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

            <td style="cursor: pointer;" class="load-link" @click="loadRecord(false,record.eid,$event)">Load</td>

          </tr>


        </tbody>

      </table>

    </template>



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

    clear: function(){

      this.searchValue = ''
      this.refreshRecords()      

    },

    search: function(){

      console.log(this.searchValue)
      if (this.searchValue.trim() != ''){


        this.browseType = "searching"

        this.$store.dispatch("fetchAllRecords", { self: this, search: this.searchValue, user: (this.allrecords) ? "all" : this.catInitials  }).then(() => {
          
          this.records = this.allRecords.filter((f) => (f.status=='unposted') ? true : false)
          this.recordsDeleted = this.allRecords.filter((f) => (f.status=='deleted') ? true : false)
          this.recordsPublished = this.allRecords.filter((f) => (f.status=='published') ? true : false)
          this.browseType = "unposted"

        }) 

      }





    },

    browseTypeChange: function(){

      console.log(this.browseType)

    },

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

          // GPO HACK HERE
          if (record.typeid.includes('GPO')){
            url = url.replace('preprod-8230','preprod-8210')
          }

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

    loadRecord: async function(recId,eId,event){


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


        // this.$router.push({ name: 'Edit', params: { recordId: recordId } })

        if (this.settingsDisplayMode == 'spreadsheet'){
          this.$router.push({ name: 'CompactEdit', params: { recordId: recordId } })
        }else{
          this.$router.push({ name: 'Edit', params: { recordId: recordId } })

        }


      })


      if (event){
        event.preventDefault()
      }


    },

    selectTemplateClick: async function(event){


      let recId = this.returnSpByTemplateId(event.target.id)

      this.loadRecord(recId)






    },



    selectTemplateClickLoad: async function(event, recId){

      let c = 0
      for (let r of this.records){
        if (r.eid == recId) break
        c++
      }

      this.loadRecord(c)
      event.preventDefault()

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


    async deleteRecord(event, eId){


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


     this.browseType = "searching"

     if (this.allrecords){
        
        this.$store.dispatch("fetchAllRecords", { self: this, user: null  }).then(() => {
          
          this.records = this.allRecords.filter((f) => (f.status=='unposted') ? true : false)
          this.recordsDeleted = this.allRecords.filter((f) => (f.status=='deleted') ? true : false)
          this.recordsPublished = this.allRecords.filter((f) => (f.status=='published') ? true : false)
          this.browseType = "unposted"

        })  

        
      }else{
        
        this.$store.dispatch("fetchMyRecords", { self: this, user: this.catInitials  }).then(() => {

          this.records = this.myRecords.filter((f) => (f.status=='unposted') ? true : false)
          this.recordsDeleted = this.myRecords.filter((f) => (f.status=='deleted') ? true : false)
          this.recordsPublished = this.myRecords.filter((f) => (f.status=='published') ? true : false)
          this.browseType = "unposted"

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
    catInitials:'catInitials',
    settingsDisplayMode:'settingsDisplayMode',

    
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
      recordsSearched: [],
      activeTemplateId: null,
      actibveTemplateIdCount:0,
      browseType: 'unposted',   
      searchValue: '',

    }
  },
  created: function(){



    this.refreshRecords()

 





  },
};
</script>


<style scoped>


#search{
  height: 2em;
  margin-right: 1em;
}
button{
  background: white;
  color: black;
  border: solid 1px black;
}


.load-link{
  text-decoration: none;
  color: black !important;
  padding-left: 1.5em;
  padding-right: 1.5em;
}

.delete-link{
  text-decoration: none;
  color: black !important;
}

.delete-link:hover{
  color: red !important;
  text-shadow: 2px 2px 2px #CE5937;
}

.load-link:hover{
  text-decoration: none;
  color: darkblue !important;
  text-shadow: 2px 2px 2px darkblue;
}

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

  tr:hover{
    /*background-color: yellow;*/
  }

  .selectable-template{
    padding:4px;
  }
  .selectable-template:hover, td.active{
    cursor: default !important;
/*    background: transparent !important;
    cursor: default !important;
    border-right: 1px solid #c6c9cc !important;
    border-bottom: 1px solid #c6c9cc !important;
    border-top: none !important;
    border-left: 1px solid #c6c9cc !important;*/
  }


/*
 CSS for the main interaction
*/
.multiswitch input {
  position: absolute;
  left: -200vw;
}

.multiswitch .slide-container {
  position: relative;
  display: flex;
  max-width: 50em;
  line-height: 2em;
  /* don't allow highlighting the text inside the toggle */
  user-select: none; 
}

.multiswitch .slide-container label {
  /* Even though we're using "flex" to display, we have to assign widths so that we know exactly where to position the slide */
  width: 50%;
  text-align: center;
  padding-left: 1em;
  padding-right: 1em;
  z-index: 2;
  font-weight: bold;
}

.multiswitch .slide-container a {
  position: absolute;
  left: 50%;
  z-index: 1;
  height: 100%;
  width: 50%;
  transition: left 0.1s ease-out;
  box-shadow: 1px 0 0 rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/*
  Auto adjusting widths
*/
.multiswitch label:nth-last-child(6),
.multiswitch label:nth-last-child(6) ~ label,
.multiswitch label:nth-last-child(6) ~ a {
  width: 33.3334%;
}

.multiswitch label:nth-last-child(8),
.multiswitch label:nth-last-child(8) ~ label,
.multiswitch label:nth-last-child(8) ~ a {
  width: 25%;
}

.multiswitch label:nth-last-child(10),
.multiswitch label:nth-last-child(10) ~ label,
.multiswitch label:nth-last-child(10) ~ a {
  width: 20%;
}

.multiswitch label:nth-last-child(12),
.multiswitch label:nth-last-child(12) ~ label,
.multiswitch label:nth-last-child(12) ~ a {
  width: 16.6667%;
}

/*
 Slider
*/

/* all options, first selected */
.multiswitch input:checked ~ a {
  left: 0;
  box-shadow: 1px 0 0 rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
/* 2 options, 2nd selected */
.multiswitch label:nth-last-child(4) ~ input:nth-child(3):checked ~ a {
  left: 50%;
}
/* 3 options, 2nd selected */
.multiswitch label:nth-last-child(6) ~ input:nth-child(3):checked ~ a {
  left: 33.3334%;
}
/* 3 options, 3rd selected */
.multiswitch label:nth-last-child(6) ~ input:nth-child(5):checked ~ a {
  left: 66.6667%;
}
/* 4 options, 2nd selected */
.multiswitch label:nth-last-child(8) ~ input:nth-child(3):checked ~ a {
  left: 25%;
}
/* 4 options, 3rd selected */
.multiswitch label:nth-last-child(8) ~ input:nth-child(5):checked ~ a {
  left: 50%;
}
/* 4 options, 4th selected */
.multiswitch label:nth-last-child(8) ~ input:nth-child(7):checked ~ a {
  left: 75%;
}
/* 5 options, 2nd selected */
.multiswitch label:nth-last-child(10) ~ input:nth-child(3):checked ~ a {
  left: 20%;
}
/* 5 options, 3rd selected */
.multiswitch label:nth-last-child(10) ~ input:nth-child(5):checked ~ a {
  left: 40%;
}
/* 5 options, 4th selected */
.multiswitch label:nth-last-child(10) ~ input:nth-child(7):checked ~ a {
  left: 60%;
}
/* 5 options, 5th selected */
.multiswitch label:nth-last-child(10) ~ input:nth-child(9):checked ~ a {
  left: 80%;
}
/* 6 options, 2nd selected */
.multiswitch label:nth-last-child(12) ~ input:nth-child(3):checked ~ a {
  left: 16.6667%;
}
/* 6 options, 3rd selected */
.multiswitch label:nth-last-child(12) ~ input:nth-child(5):checked ~ a {
  left: 33.3334%;
}
/* 6 options, 4th selected */
.multiswitch label:nth-last-child(12) ~ input:nth-child(7):checked ~ a {
  left: 50%;
}
/* 6 options, 5th selected */
.multiswitch label:nth-last-child(12) ~ input:nth-child(9):checked ~ a {
  left: 66.6667%;
}
/* 6 options, 6th selected */
.multiswitch label:nth-last-child(12) ~ input:nth-child(11):checked ~ a {
  left: 83.3334%;
}

/*
  Slider shadows
*/
/* middle spots */
.multiswitch input:not(:first-child):checked ~ a {
  box-shadow: 1px 0 0 rgba(0, 0, 0, 0.2),
              -1px 0 0 rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
/* last spots */
.multiswitch label:nth-last-child(4) ~ input:nth-child(3):checked ~ a,
.multiswitch label:nth-last-child(6) ~ input:nth-child(5):checked ~ a,
.multiswitch label:nth-last-child(8) ~ input:nth-child(7):checked ~ a,
.multiswitch label:nth-last-child(10) ~ input:nth-child(9):checked ~ a,
.multiswitch label:nth-last-child(12) ~ input:nth-child(11):checked ~ a {
  box-shadow: -1px 0 0 rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.25);
}


/*
 RH Brand Styling
*/
body {
  font: 16px/1.5em "Overpass", "Open Sans", Helvetica, sans-serif;
  color: #333;
}

fieldset {
  border: 0;
  padding: 0;
}

fieldset legend {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

.multiswitch .slide-container {
  background: #333;
  color: #fff;
  transition: background 0.1s ease-out;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
}

.multiswitch .slide-container label {
  cursor: pointer;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .4);
}

.multiswitch .slide-container a {
  background: #0088ce;
  border: 1px solid #005f90;
}

/* Stoplight theme */
.multiswitch[data-theme="stoplight"] .slide-container > a {
  background: #2196f3;
    border-color: #00bcd4;
}

.multiswitch[data-theme="stoplight"] input:not(:first-child):checked ~ a {
background: #4caf50;
    border-color: #cddc39;
}

.multiswitch[data-theme="stoplight"] label:nth-last-child(4) ~ input:nth-child(3):checked ~ a,
.multiswitch[data-theme="stoplight"] label:nth-last-child(6) ~ input:nth-child(5):checked ~ a,
.multiswitch[data-theme="stoplight"] label:nth-last-child(8) ~ input:nth-child(7):checked ~ a,
.multiswitch[data-theme="stoplight"] label:nth-last-child(10) ~ input:nth-child(9):checked ~ a,
.multiswitch[data-theme="stoplight"] label:nth-last-child(12) ~ input:nth-child(11):checked ~ a {
background: #ff9800;
    border-color: #ffc107;
}

/*
 Horizontal layout
*/
.switch {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
}

/*
 Because a11y
*/
.multiswitch input:focus ~ a {
  outline: 2px solid #0088ce;
}


@keyframes rotate {
    100% {
        transform: rotate(1turn);
    }
}

#loading-icon{
  display: inline-block;
   animation: rotate 2s linear infinite;
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
