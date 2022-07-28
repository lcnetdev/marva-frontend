<template>
  <div id="">

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

            <tbody v-if="userTemplates===null">
                <tr>
                    <td colspan="4">You have no templates in the system.</td>
                </tr>            
            </tbody>

            <tbody v-else-if="userTemplates.length==0">
                <tr>
                    <td colspan="4">Loading templates...</td>
                </tr>            
            </tbody>
            <tbody v-else>

                <tr v-for="t in userTemplates" :key="t.id">
                    <td v-bind:class="['selectable-template']" @click="loadUserTemplate(t)">
                      <span v-if="t.invalid">

                        <svg width="20px" height="20px" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                         <path style="fill:red" d="m94.699 81.602l-39.801-68.898c-2.1992-3.8008-7.6992-3.8008-9.8984 0l-39.801 68.898c-2.1992 3.8008 0.5 8.6016 4.8984 8.6016h79.602c4.5-0.003906 7.1992-4.8047 5-8.6016zm-46-47.801c2.3984-0.60156 4.8008 0.60156 5.8984 2.8008 0.39844 0.80078 0.5 1.6992 0.39844 2.5-0.19922 2.5-0.30078 5-0.39844 7.6016-0.19922 3.8984-0.5 7.8984-0.69922 11.801-0.10156 1.1992-0.10156 2.3984-0.19922 3.6992-0.10156 2.1016-1.6992 3.6992-3.8008 3.6992-2 0-3.6992-1.6016-3.8008-3.6016-0.30078-6.1016-0.69922-12.199-1-18.301-0.10156-1.6016-0.19922-3.3008-0.30078-4.8984 0.003906-2.4023 1.6016-4.7031 3.9023-5.3008zm1.3008 45.801c-2.8008 0-5-2.3008-5-5.1016s2.3008-5.1016 5.1016-5.1016c2.8008 0 5 2.3008 5 5.1992-0.10156 2.7031-2.4023 5.0039-5.1016 5.0039z"/>
                        </svg>

                      </span>
                      <a href="#" :id="`template-${t.id}`" @click="loadUserTemplate(t)" style="text-decoration: none; color: inherit;">{{t.label}}</a>
                    </td>
                    <td>
                      <span v-for="v in t.basedOnProfile" v-bind:key="v" >
                        <svg v-if="v.includes(':Work')" style="width: 1.5em" version="1.1" viewBox="0 0 100 100"><path style="fill:#7BADAD;stroke:#231F20;stroke-width:0.5;stroke-miterlimit:10;" d="M88.8,33.6c-2.1-5-5.2-9.5-9-13.4c-3.9-3.9-8.4-6.9-13.4-9C61.2,9,55.7,7.8,50,7.8S38.8,9,33.6,11.2
                          c-5,2.1-9.5,5.2-13.4,9c-3.9,3.9-6.9,8.4-9,13.4C9,38.8,7.8,44.3,7.8,50S9,61.2,11.2,66.4c2.1,5,5.2,9.5,9,13.4
                          c3.9,3.9,8.4,6.9,13.4,9c5.2,2.2,10.7,3.3,16.4,3.3c5.7,0,11.2-1.1,16.4-3.3c5-2.1,9.5-5.2,13.4-9c3.9-3.9,6.9-8.4,9-13.4
                          c2.2-5.2,3.3-10.7,3.3-16.4C92.1,44.3,91,38.8,88.8,33.6L88.8,33.6z"/></svg>
                        <svg v-if="v.includes(':Instance')" style="width: 1.5em" version="1.1" viewBox="0 0 100 100"><path style="fill:#8B588B;stroke:#0A131A;stroke-width:0.5;stroke-miterlimit:10;" d="M50,1.4l48.8,48.8L50,99.1L1.2,50.3L50,1.4z"/></svg>
                        

                        <svg v-if="v.includes(':Item')" style="width: 2.2em" viewBox="-10 0 100 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
                             <rect width="50px" height="50px" style="fill:#eaeaea;stroke-width:0.5;stroke:rgb(0,0,0)" />
                        </svg>

                            <svg v-if="v.includes(':Hub')" width="30px" height="30px"  version="1.1" viewBox="0 -10 100 100" xmlns="http://www.w3.org/2000/svg">
                             <path fill="royalblue" d="m62.113 24.66 1.9023-15.238 18.875 32.691-7.5469 20.004 15.238 1.9023-32.691 18.875-20.004-7.5469-1.9023 15.238-18.875-32.691 7.5469-20.004-15.238-1.9023 32.691-18.875zm-17.684 15.695-4.0781 15.215 15.215 4.0781 4.0781-15.215z" fill-rule="evenodd"/>
                            </svg> 



                        <span class="general-template-type-label">{{v.replace('lc:RT:bf2:','')}}</span>
                      </span>

                      <div v-if="t.invalid" style="color:red; font-weight: bold;">
                        The profiles this template was based on have change. Please delete this template and create a new one based off the updated profile below.
                      </div>
                    </td>
                    <td>{{new Date(t.timestamp*1000).toISOString().slice(0,10)}}</td>
                    <td>
                      <button @click="deleteUserTemplate(t)">delete</button>
                      <button @click="copyTemplateId($event,t)" style="margin-left:0.25em">copy ID</button>


                      <input v-if="parentComponent === 'HomeLoadComponent'" @input="toggleIsFavorite('template',t.id,t.label)" type="checkbox" :checked="isAlreadyFavorite('template',t.id)" :name="'template-'+t.id" :id="'template-'+t.id"><label :for="'template-'+t.id">Add to favorites</label>

                      




                    </td>


                </tr>            
            </tbody>

        </table>    

        
        <details style="margin-top:0.5em;">
          <summary style="cursor: pointer;">Copy Template Using ID</summary>
          <div>
            Enter the template ID: <input type="text" placeholder="paste id here" ref="copyTemplateId" /><button @click="copyTemplate" style="font-size: 0.75em;">Copy</button>
          </div>
        </details>



  </div>

</template>

<script>


import { mapState } from 'vuex'
import lookupUtil from "@/lib/lookupUtil"
import parseProfile from "@/lib/parseProfile"
import config from '@/lib/config'


export default {
  name: "HomeUserTemplateList",
  components: {
      // Keypress: () => import('vue-keypress')
  },
  props: {
      parentComponent: String
  },
  methods: {

    loadTemplate: parseProfile.loadNewTemplate,



    /**
    * Sets a profile or template as a favorite which is stored in the state
    * @param {string} type - the favorite catagory / type, template or profile
    * @param {string} name - the unique name the favorite is stored as
    * @param {string} label - the dispaly label to use, sometimes starting points have better labels than just the profile idenfiter
    * @return {void}
    */
    toggleIsFavorite: function(type, name, label){
      // check to add or remove
      if (this.isAlreadyFavorite(type,name)){
        this.$store.dispatch("removeLoadResourceFavorite", { self: this, type: type, name: name, label: label })
      }else{
        this.$store.dispatch("addLoadResourceFavorite", { self: this, type: type, name: name, label: label })
      }      
    },


    /**
    * Tests if a profile type and name is already a favorite
    * @param {string} type - the favorite catagory / type, template or profile
    * @param {string} name - the unique name the favorite is stored as
    * @return {boolean} - returns true if it is and false if not
    */
    isAlreadyFavorite: function(type, name){

      // see if the requested is in the favorites list
      if (this.loadResourceFavorites.filter((f)=>{ return (f.type === type && f.name === name)}).length>0){
        return true
      }else{
        return false
      }

    },

    /**
    * makes a fetch call to the api to kick off a copy request, it passes the active template id in the input box
    * it then refreshes and validates the templates
    * @return {void}
    */    
    copyTemplate(){      
      let utilUrl = config.returnUrls().util
      fetch(`${utilUrl}/copytemplate/${this.catInitials}/${this.$refs.copyTemplateId.value}`, {
        method: 'GET',
      })
      .then(async res => { // eslint-disable-line
        // console.log(res.status)
        // console.log(await res.text())
        this.userTemplates = await lookupUtil.userTemplates(this.catInitials)
        this.validateUserTemplates()
      })

    },


    /**
    * copies the template id to the clip board so the user can share it
    * @param {event} event - from the dom, we use modify the target style
    * @param {string} profile.id - we use the id from the profile object 
    * @return {void}
    */    
    copyTemplateId(event, profile){
      event.target.innerHTML="copied"
      event.target.style.color="yellow"
      event.target.style.fontWeight="bold"
      window.setTimeout(()=>{
        event.target.innerHTML="copy ID"
        event.target.style.removeProperty('color')
        event.target.style.fontWeight="normal"
      },500)
      navigator.clipboard.writeText(profile.id)
    },


    /**
    * Sends API request to to remove template from the user acct
    * @param {string} profile.id - we use the id from the profile object 
    * @return {void}
    */   
    deleteUserTemplate(profile){
      let utilUrl = config.returnUrls().util
      fetch(`${utilUrl}/templates/${profile.id}`, {
        method: 'DELETE',
      })
      .then(async res => {
        if (res.status==200){
          this.userTemplates = []
          this.userTemplates = await lookupUtil.userTemplates(this.catInitials)
          if (this.userTemplates.length==0){
            this.userTemplates = null
          }
        }else{
          alert('Was an error deleteing')
        }
      }) 
      .then(data => console.log(data))

    },

    /**
    * validates property using the parseProfile library
    * @return {void}
    */   
    validateUserTemplates(){
      this.userTemplates = parseProfile.userTemplatesValidate(this.userTemplates) 
    },    

    /**
    * Depending if this component was loaded from the home create new screen or the load resource screen it will
    * make the state ready for a new blank record or it will emit a trigger to the load component to load a resource with a template
    * @param {string} profile - profile object from the API
    * @return {void}
    */   
    loadUserTemplate(profile){
      if (this.parentComponent === 'HomeNewComponent'){
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
      }else{
        this.$emit('loadUsingUserTemplate', profile)
      }
    }


  },
  computed: mapState({
    activeProfile: 'activeProfile',
    startingPoints: 'startingPoints',
    profiles: 'profiles',
    profilesLoaded: 'profilesLoaded',
    catInitials: 'catInitials',
    loadResourceFavorites: 'loadResourceFavorites',

    
   
  }), 

  data: function() {
    return {

      userTemplates: [],
      validateUserTemplatesInterval: null,


    }
  },

  watch: {

  

      profiles: function(){
         
          this.validateUserTemplates()

      }


  },



  mounted: async function(){
    this.userTemplates = await lookupUtil.userTemplates(this.catInitials)
    if (this.userTemplates.length==0){
      this.userTemplates = null
    }else{
      this.validateUserTemplates()
    }

  },


  created: async function(){



    this.userTemplates = await lookupUtil.userTemplates(this.catInitials)
    if (this.userTemplates.length==0){
      this.userTemplates = null
    }else{
      this.validateUserTemplates()
    }



  },
};
</script>


<style scoped>



</style>
