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
          <td>{{record.lccn}}</td>
          <td>{{record.user}}</td>
          <td>{{record.time}}</td>
          <td>Load</td>

        </tr>


      </tbody>

    </table>



  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"

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

    selectTemplateClick(event){


      let useStartingPoint = this.returnSpByTemplateId(event.target.id)
      
      console.log(Object.assign({},this.profiles[useStartingPoint]), 'Object.assign({},this.profiles[useStartingPoint])')
      this.$store.dispatch("setActiveProfile", { self: this, profile: JSON.parse(JSON.stringify(this.profiles[useStartingPoint])) }).then(() => {
        this.$router.push({ path: 'edit' })
      })

    },

    selectTemplate(event){

      if (this.actibveTemplateIdCount <= 0){ return false}

      let useStartingPoint = this.returnSpByTemplateId(this.activeTemplateId)


      this.$store.dispatch("setActiveProfile", { self: this, profile: this.profiles[useStartingPoint] }).then(() => {
        this.$router.push({ path: 'edit' })
      })


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
