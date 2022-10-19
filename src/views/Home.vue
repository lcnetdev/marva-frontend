<template>



    <div id="home">


       <Keypress key-event="keydown" :key-code="40" @success="moveDown" />

       <Keypress key-event="keydown" :multiple-keys="[{keyCode: 77, modifiers: ['ctrlKey','altKey'],preventDefault: true}]" @success="navRoute" />
       <Keypress key-event="keydown" :multiple-keys="[{keyCode: 69, modifiers: ['ctrlKey','altKey'],preventDefault: true}]" @success="navRoute" />
       <Keypress key-event="keydown" :multiple-keys="[{keyCode: 78, modifiers: ['ctrlKey','altKey'],preventDefault: true}]" @success="navRoute" />
       <Keypress key-event="keydown" :multiple-keys="[{keyCode: 79, modifiers: ['ctrlKey','altKey'],preventDefault: true}]" @success="navRoute" />
       <Keypress key-event="keydown" :multiple-keys="[{keyCode: 73, modifiers: ['ctrlKey','altKey'],preventDefault: true}]" @success="navRoute" />

      <div class="grid">  
        <aside class="sidebar-left" style="background-color: #2a2a2a; color: #ffffff; position: relative;" >
                  
<!--           <svg viewBox="0 0 125 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.0698 1.26944C10.5984 1.29437 8.02988 1.29437 7.48125 1.29437C6.9825 1.29437 3.56606 1.26944 2.76806 1.26944C2.21944 1.26944 1.74563 1.2445 1.24688 0.571186H1.07231L0 3.93775L0.29925 4.16219C1.04738 2.94025 2.26931 2.01756 3.96506 2.01756H6.1845C6.384 2.01756 6.48375 2.16719 6.48375 2.36669V17.8778L5.43638 18.6509V19H9.52613V18.6509L8.40394 17.8778V2.36669C8.40394 2.16719 8.50369 2.01756 8.70319 2.01756H9.99994C10.9476 2.01756 12.6932 1.89287 14.6882 3.96269L14.9376 3.71331L13.7655 0.571186H13.5909C13.0922 1.2445 12.6184 1.26944 12.0698 1.26944Z" fill="white"/>
            <path d="M31.5867 19V18.8254L30.4395 17.9028V2.34175L31.437 1.61856V1.29437H27.4969L27.472 1.46894L28.4944 2.34175V9.17462H20.2401V2.34175L21.2376 1.61856V1.29437H17.2975L17.2725 1.46894L18.295 2.34175V17.9776L17.1728 18.8254V19H21.3872V18.8254L20.2401 17.9028V10.0474H28.4944V17.9776L27.3722 18.8254V19H31.5867Z" fill="white"/>
            <path d="M39.2129 2.06744L42.4547 1.96769C44.9984 1.96769 45.6717 2.21706 47.143 4.16219L47.4422 4.06244L46.7939 1.29437H36.0707V1.49387L37.2677 2.51631V17.9526L36.37 18.7506V19H46.6941C46.8687 19 47.0183 18.9252 47.0682 18.7257C47.3175 17.5786 47.4173 17.404 47.9659 16.0574L47.542 15.8579C46.2203 17.9277 44.9235 18.3516 42.8537 18.3516C41.2577 18.3516 41.0084 18.3267 40.3849 18.2768C39.7615 18.2269 39.2627 17.8778 39.2378 17.1546V10.0474H45.0732L45.8961 12.1172H46.2203V6.98012H45.8462L45.0981 9.19956H39.2378L39.2129 2.06744Z" fill="white"/>
            <path d="M7.75556 44C11.7705 44 14.8129 42.2793 14.8129 39.1871C14.8129 36.3941 12.4937 34.9976 10.374 34.3991V34.2494C11.9949 33.7257 13.6408 32.6285 13.6408 30.5337C13.6408 27.8156 10.9476 26.2944 7.75556 26.2944H2.24437V26.5437L3.34162 27.5662V42.8529L2.31919 43.7007V44H7.75556ZM6.50869 43.2269H5.28675V34.9477H5.86031C8.00494 34.9477 12.5685 35.0724 12.5685 39.1621C12.4438 43.1771 8.5785 43.2269 6.50869 43.2269ZM5.28675 34.1996V27.0674H6.63338C8.35406 27.0674 11.4713 27.1173 11.4713 30.5587C11.4713 34.0749 7.83038 34.1996 5.985 34.1996H5.28675Z" fill="white"/>
            <path d="M22.1422 44V43.8254L20.995 42.9027V27.3417L21.9925 26.6186V26.2944H18.0524L18.0275 26.4689L19.0499 27.3417V42.9776L17.9277 43.8254V44H22.1422Z" fill="white"/>
            <path d="M32.1329 44C36.1479 44 39.1903 42.2793 39.1903 39.1871C39.1903 36.3941 36.8711 34.9976 34.7514 34.3991V34.2494C36.3723 33.7257 38.0182 32.6285 38.0182 30.5337C38.0182 27.8156 35.3249 26.2944 32.1329 26.2944H26.6218V26.5437L27.719 27.5662V42.8529L26.6966 43.7007V44H32.1329ZM30.8861 43.2269H29.6641V34.9477H30.2377C32.3823 34.9477 36.9459 35.0724 36.9459 39.1621C36.8212 43.1771 32.9559 43.2269 30.8861 43.2269ZM29.6641 34.1996V27.0674H31.0108C32.7314 27.0674 35.8486 27.1173 35.8486 30.5587C35.8486 34.0749 32.2078 34.1996 30.3624 34.1996H29.6641Z" fill="white"/>
            <path d="M46.719 44V43.7506L45.4722 42.9526V35.222H51.3574L52.2302 37.4165H52.5544L52.5045 31.9552H52.1804L51.3574 34.3492H45.4722V27.0674L49.3624 26.9677C52.9534 26.9677 53.4023 28.5886 53.8512 29.4365L54.325 29.4116L53.502 26.2944H42.4547V26.6934L43.527 27.5662V42.9277L42.3051 43.7756V44H46.719Z" fill="white"/>
            <path d="M57.1379 44H61.3024V43.7007L60.1054 42.9027V35.2719H61.2027C62.9732 35.2719 63.8211 36.419 64.3697 37.3916C64.9184 38.3392 66.7139 41.7806 66.8635 42.1048C67.4869 43.4264 68.5592 44.2494 70.1054 44.2743C71.6265 44.2743 72.0505 43.8254 72.0505 43.8254L72.0006 43.6509C70.4295 43.7756 70.1303 43.3766 69.1328 41.8554C68.7837 41.3317 67.5119 38.7881 66.9882 37.7158C66.1154 36.02 64.9433 35.1971 64.9433 35.1971V35.0474C66.8136 34.5736 69.5069 33.4764 69.5069 30.6834C69.5069 27.8654 66.664 26.2944 63.073 26.2944H57.063V26.5437L58.1603 27.5662V42.8529L57.1379 43.7007V44ZM60.1054 34.4489V27.0674H61.9508C63.8211 27.0674 67.2625 27.1173 67.2625 30.7083C67.2625 34.3492 63.2725 34.4489 61.3024 34.4489H60.1054Z" fill="white"/>
            <path d="M77.3049 37.1671L79.7238 29.8355L82.7911 37.1671H77.3049ZM74.6615 41.7556C74.3373 42.7033 74.0879 43.4015 73.0406 43.7756V44H76.2326V43.8254L75.26 43.2269L77.0056 37.9901H83.1901L85.4844 43.1022L84.462 43.7506L84.4869 44H88.6265V43.7007C88.1527 43.6259 87.4295 42.9277 87.0056 41.9053L80.2974 26.1946H80.0979C79.8734 26.7183 79.4994 27.5163 78.7762 28.1148L79.0256 28.7632L74.6615 41.7556Z" fill="white"/>
            <path d="M105.348 26.2944L99.5873 37.4913L99.4128 37.1671L93.5774 26.0201L91.1086 26.2694V26.4191L91.9564 27.7657V43.0274L91.1335 43.7506V44H93.7519V43.8005L93.0038 43.0274V29.0624L98.8641 40.2594H99.2133L105.074 29.0375V42.9776L104.226 43.8254V44H107.916V43.8254L107.019 42.9027V27.2171L107.642 26.5188V26.2944H105.348Z" fill="white"/>
            <path d="M115.535 27.0674L118.777 26.9677C121.321 26.9677 121.994 27.2171 123.465 29.1622L123.765 29.0624L123.116 26.2944H112.393V26.4939L113.59 27.5163V42.9526L112.692 43.7506V44H123.016C123.191 44 123.341 43.9252 123.391 43.7257C123.64 42.5786 123.74 42.404 124.288 41.0574L123.864 40.8579C122.543 42.9277 121.246 43.3516 119.176 43.3516C117.58 43.3516 117.331 43.3267 116.707 43.2768C116.084 43.2269 115.585 42.8778 115.56 42.1546V35.0474H121.396L122.218 37.1172H122.543V31.9801H122.169L121.42 34.1996H115.56L115.535 27.0674Z" fill="white"/>
            <path d="M5.3865 52.0674L8.62838 51.9677C11.172 51.9677 11.8453 52.2171 13.3166 54.1622L13.6159 54.0624L12.9675 51.2944H2.24437V51.4939L3.44138 52.5163V67.9526L2.54363 68.7506V69H12.8678C13.0423 69 13.1919 68.9252 13.2418 68.7257C13.4912 67.5786 13.5909 67.404 14.1396 66.0574L13.7156 65.8579C12.3939 67.9277 11.0972 68.3516 9.02738 68.3516C7.43137 68.3516 7.182 68.3267 6.55856 68.2768C5.93513 68.2269 5.43638 67.8778 5.41144 67.1546V60.0474H11.2468L12.0698 62.1172H12.3939V56.9801H12.0199L11.2718 59.1996H5.41144L5.3865 52.0674Z" fill="white"/>
            <path d="M23.7144 69C30.1233 69 32.8914 65.2843 32.8914 60.1472C32.8914 55.0849 29.1258 51.2944 23.7144 51.2944H17.9788V51.6186L18.7269 52.242L18.7518 67.6783L17.8541 68.5012V69H23.7144ZM20.672 52.0924H23.5897C27.2056 52.0924 30.6969 54.1123 30.6969 60.2469C30.6969 66.3067 28.1034 68.202 23.6645 68.202H21.9438C21.4451 68.202 20.697 68.0524 20.697 67.1047L20.672 52.0924Z" fill="white"/>
            <path d="M40.48 69V68.8254L39.3329 67.9027V52.3417L40.3304 51.6186V51.2944H36.3902L36.3653 51.4689L37.3877 52.3417V67.9776L36.2656 68.8254V69H40.48Z" fill="white"/>
            <path d="M54.785 51.2694C53.3136 51.2944 50.7451 51.2944 50.1965 51.2944C49.6977 51.2944 46.2813 51.2694 45.4833 51.2694C44.9346 51.2694 44.4608 51.2445 43.9621 50.5712H43.7875L42.7152 53.9377L43.0145 54.1622C43.7626 52.9402 44.9845 52.0176 46.6803 52.0176H48.8997C49.0992 52.0176 49.199 52.1672 49.199 52.3667V67.8778L48.1516 68.6509V69H52.2413V68.6509L51.1191 67.8778V52.3667C51.1191 52.1672 51.2189 52.0176 51.4184 52.0176H52.7151C53.6628 52.0176 55.4084 51.8929 57.4034 53.9627L57.6528 53.7133L56.4807 50.5712H56.3061C55.8074 51.2445 55.3336 51.2694 54.785 51.2694Z" fill="white"/>
            <path d="M67.3751 50.9203C62.2629 50.9203 58.3477 55.1098 58.3477 60.1971C58.3477 65.5586 62.238 69.3741 67.6245 69.3741C72.7366 69.3741 76.6518 65.1846 76.6518 60.0973C76.6518 54.7358 72.7616 50.9203 67.3751 50.9203ZM67.7491 68.5761C63.6843 68.5761 60.5422 65.1596 60.5422 59.9477C60.5422 55.0101 63.3601 51.7183 67.2504 51.7183C71.3152 51.7183 74.4573 55.1347 74.4573 60.3467C74.4573 65.2843 71.6394 68.5761 67.7491 68.5761Z" fill="white"/>
            <path d="M79.9079 69H84.0725V68.7007L82.8755 67.9027V60.2719H83.9727C85.7433 60.2719 86.5912 61.419 87.1398 62.3916C87.6884 63.3392 89.4839 66.7806 89.6336 67.1047C90.257 68.4264 91.3293 69.2494 92.8754 69.2743C94.3966 69.2743 94.8206 68.8254 94.8206 68.8254L94.7707 68.6509C93.1996 68.7756 92.9004 68.3766 91.9029 66.8554C91.5537 66.3317 90.2819 63.7881 89.7582 62.7158C88.8854 61.02 87.7134 60.1971 87.7134 60.1971V60.0474C89.5837 59.5736 92.2769 58.4764 92.2769 55.6834C92.2769 52.8654 89.4341 51.2944 85.8431 51.2944H79.8331V51.5437L80.9304 52.5662V67.8529L79.9079 68.7007V69ZM82.8755 59.4489V52.0674H84.7209C86.5912 52.0674 90.0326 52.1173 90.0326 55.7083C90.0326 59.3492 86.0426 59.4489 84.0725 59.4489H82.8755Z" fill="white"/>
          </svg> -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.48 18.48">
            <g id="Layer_2" data-name="Layer 2">
              <g id="Layer_1-2" data-name="Layer 1">
                <path d="M65.16,11.65l2.42-7.34,3.07,7.34Zm-2.64,4.58c-.33.95-.58,1.65-1.62,2v.23h3.19V18.3l-1-.59,1.74-5.24h6.19l2.29,5.11-1,.65,0,.25h4.14v-.3a2.94,2.94,0,0,1-1.62-1.8L68.15.67H68a4.7,4.7,0,0,1-1.32,1.92l.25.65Z" fill="white"/>
                <path d="M14.24.27,8.48,11.47l-.18-.32L2.47,0,0,.25V.4L.85,1.75V17L0,17.73V18H2.64v-.2L1.9,17V3l5.86,11.2H8.1L14,3V17l-.85.85V18h3.69v-.17l-.9-.93V1.2l.62-.7V.27Z" fill="white"/>
                <path d="M22.28,11.15,24.7,3.82l3.07,7.33Zm-2.64,4.59c-.32.94-.57,1.64-1.62,2V18h3.19v-.17l-1-.6L22,12h6.19l2.29,5.11-1,.65,0,.25H33.6v-.3A2.92,2.92,0,0,1,32,15.89L25.28.17h-.2a4.84,4.84,0,0,1-1.33,1.92l.25.65Z" fill="white"/>
                <path d="M34.89,18h4.16v-.3l-1.19-.8V9.28H39a3.51,3.51,0,0,1,3.17,2.12c.55.95,2.35,4.39,2.5,4.72a3.46,3.46,0,0,0,3.24,2.16c1.52,0,1.94-.44,1.94-.44l0-.18c-1.57.13-1.87-.27-2.87-1.79-.34-.53-1.62-3.07-2.14-4.14a7.35,7.35,0,0,0-2-2.52V9.06c1.87-.48,4.56-1.57,4.56-4.37S44.42.3,40.83.3h-6V.55l1.09,1V16.86l-1,.85Zm3-9.55V1.08H39.7c1.87,0,5.31,0,5.31,3.64s-4,3.74-6,3.74Z" fill="white"/>
                <path d="M62,3c.33-.95.37-1.74,1.42-2.11V.67H60.2V.85l.6.44L59.13,6,56.2,14.72,50.94,1.57l1-.65,0-.25H47.8V1a2.92,2.92,0,0,1,1.62,1.8l6.71,15.71h.33c.22-.52.12-.27.68-1.52L60,8.69Z" fill="white"/>
              </g>
            </g>
          </svg>


            <div v-if="!isProd()" style="color:red;font-size:1.25em;">THIS IS THE STAGING (TEST) REGION DATA IS NOT SAVED TO PRODUCTION</div>

              <ul class="sidebar-menu">
                <li v-bind:class="{ active: isMyRecords }"><router-link v-bind:class="{ active: isMyRecords }" to="/myrecords">My records</router-link><span v-bind:class="{ active: isMyRecords }">CTRL+ALT+M</span></li>
                <li v-bind:class="{ active: isAllRecords }"><router-link v-bind:class="{ active: isAllRecords }" to="/allrecords">Everyone's records</router-link><span v-bind:class="{ active: isAllRecords }">CTRL+ALT+E</span></li>
                <li v-bind:class="{ active: isNew }"><router-link v-bind:class="{ active: isNew }" to="/new">Create new record</router-link><span v-bind:class="{ active: isNew }">CTRL+ALT+N</span></li>
                <li v-bind:class="{ active: isLoad }"><router-link v-bind:class="{ active: isLoad }" to="/load">Load existing record</router-link><span v-bind:class="{ active: isLoad }">CTRL+ALT+O</span></li>
                <li v-bind:class="{ active: isSettings }"><router-link v-bind:class="{ active: isSettings }" to="/settings">Settings</router-link><span v-bind:class="{ active: isSettings }">CTRL+ALT+I</span></li>
                <li v-bind:class="{ active: isHelp }"><router-link v-bind:class="{ active: isHelp }" to="/help">Help</router-link><span v-bind:class="{ active: isHelp }"></span></li>

              </ul>

              
              
              <div style="padding: 0.5em; font-size: 1.2em; position: absolute; bottom: 1.2em;">v{{version}}</div> 
              <div style="padding: 0.5em; font-size: 1.2em; position: absolute; bottom: 0;">Logged in as: {{catInitials}} <a @click="changeCatId" href="#" style="color:white !important;">Change</a></div>



        </aside>


      
        <article id="home-content">


        <HomeNewComponent v-if="isNew"></HomeNewComponent>
        <HomeLoadComponent v-if="isLoad"></HomeLoadComponent>
        <HomeSettingsComponent v-if="isSettings"></HomeSettingsComponent>
        <HomeMyRecordsComponent v-if="isMyRecords"></HomeMyRecordsComponent>
        <HomeAllRecordsComponent v-if="isAllRecords"></HomeAllRecordsComponent>
        <HomeHelpComponent v-if="isHelp"></HomeHelpComponent>




        </article>

      </div>      



    </div>

</template>

<script>
// @ is an alias to /src
import HomeNewComponent from "@/components/HomeNewComponent.vue";
import HomeLoadComponent from "@/components/HomeLoadComponent.vue";
import HomeSettingsComponent from "@/components/HomeSettingsComponent.vue";

import HomeMyRecordsComponent from "@/components/HomeMyRecordsComponent.vue";
import HomeAllRecordsComponent from "@/components/HomeAllRecordsComponent.vue";
import HomeHelpComponent from "@/components/HomeHelpComponent.vue";
import config from "@/lib/config"



import { mapState } from 'vuex'



export default {
  name: "Home",
  components: {
    HomeNewComponent,
    HomeLoadComponent,
    HomeSettingsComponent,
    HomeMyRecordsComponent,
    HomeAllRecordsComponent,
    HomeHelpComponent,
    Keypress: () => import('vue-keypress')

  },
  data: function() {
    return {

      activeTemplate: null,



    }
  },

  methods: {


    moveDown(){


      console.log('home press')
    },


    changeCatId(event){

      localStorage.removeItem('bfeCatInitials')
      this.$store.dispatch("setCatInitials", { self: this, catInitials: null }).then(() => {
        
      })  

      event.preventDefault()

    },

    isProd: function(){

      if (config.returnUrls().env == 'dev') return false
      if (config.returnUrls().env == 'staging') return false
      if (config.returnUrls().env == 'production') return true  
    },


          

    navRoute(event){

      if (event.event.keyCode == 77 && this.$route.fullPath!="/myrecords"){
        this.$router.push({ path: '/myrecords' })
      }

      if (event.event.keyCode == 69 && this.$route.fullPath!="/allrecords"){
        this.$router.push({ path: '/allrecords' })
      }


      if (event.event.keyCode == 78 && this.$route.fullPath!="/new"){
        this.$router.push({ path: '/new' })
      }


      if (event.event.keyCode == 79 && this.$route.fullPath!="/load"){
        this.$router.push({ path: '/load' })
      }
 

      if (event.event.keyCode == 73 && this.$route.fullPath!="/settings"){
        this.$router.push({ path: '/settings' })
      }


    }


  },
  computed: mapState({
    profilesLoaded: 'profilesLoaded',
    startingPoints: 'startingPoints',
    catInitials: 'catInitials',


    version: () =>{
      return `${config.versionMajor}.${config.versionMinor}.${config.versionPatch}`
    },


    // to access local state with `this`, a normal function must be used
    isMyRecords () {
      return (this.$route.fullPath==="/myrecords")
    },

    isAllRecords () {
      return (this.$route.fullPath==="/allrecords")
    },

    isNew () {
      // the default view
      if (this.$route.fullPath==="/new" || this.$route.fullPath==="/"){
        return true      
      }else{
        return false
      }

    },

    isLoad () {
      return (this.$route.fullPath.includes("/load"))
    },


    isSettings () {
      return (this.$route.fullPath.startsWith('/settings'))
    },
    isHelp () {
      return (this.$route.fullPath.startsWith('/help'))
    }    



  }),
  created: function () {
    // kick off the fetching of profiles on load
    this.$store.dispatch("fetchProfiles", { self: this })    

  },

  beforeCreate: function() {
      document.body.classList.add('height-100');
      console.log(document.getElementById('app'))
      document.getElementById('app').classList.add('height-100')
  }  
};
</script>



<style scoped>
  

  .sidebar-left svg{
    width: 55%;
    padding: 1.25em;
  }

  body{
    background-color: rgb(42, 42, 42);
  }
  #home{
    height: 100%;
    background-color: rgb(42, 42, 42);
  }

  #home-content{
    background-color: white;
    min-height: 100vh;
  }

  .grid{
    grid-template-columns: 25% 75%;
    height: 100%;
  }

 

</style>

