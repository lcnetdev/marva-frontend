<template>
  <div id="home-settings">



      <div class="grid">  
        <aside class="sidebar-left" style="background-color: #4b4b4b; color: #ffffff" >
            

            <ul class="sidebar-menu">

              <li v-bind:class="{ active: isDiacritics }"><router-link v-bind:class="{ active: isDiacritics }" to="/settings/diacritics">Diacritics</router-link></li>
              <li v-bind:class="{ active: isLookups }"><router-link v-bind:class="{ active: isLookups }" to="/settings/lookups">Authority &amp; Lookups</router-link></li>




            </ul>



        </aside>
      
        <article id="settings-content">

          <HomeSettingsDiacriticsComponent v-if="isDiacritics"></HomeSettingsDiacriticsComponent>
          <HomeSettingsAuthorityLookupComponent v-if="isLookups"></HomeSettingsAuthorityLookupComponent>



        </article>

      </div>      





  </div>


</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"
import HomeSettingsDiacriticsComponent from "@/components/HomeSettingsDiacriticsComponent.vue";
import HomeSettingsAuthorityLookupComponent from "@/components/HomeSettingsAuthorityLookupComponent.vue";



export default {
  name: "HomeSettingsComponent",
  components: {
      // Keypress: () => import('vue-keypress')
      HomeSettingsDiacriticsComponent,
      HomeSettingsAuthorityLookupComponent
  },
  props: {
  },
  methods: {



  },
  computed: mapState({
    profiles: 'profiles',
    profilesLoaded: 'profilesLoaded',
    isDiacritics () {
      return (this.$route.fullPath==="/settings/diacritics" || this.$route.fullPath==="/settings")
    },
    isLookups () {
      return (this.$route.fullPath==="/settings/lookups")
    },


    // assignedId (){


    //   return uiUtils.assignID(this.structure,this.parentStructure)

    // },    
  }), 

  data: function() {
    return {


    }
  },
  created: function(){


  },
};
</script>


<style scoped>


  #home-settings, .grid{
    height: 100vh;
    width: 100%;
  }

  .grid{
    grid-template-columns: 20% 80%;
  }


  
</style>
