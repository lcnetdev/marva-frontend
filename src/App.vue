<template>
  <div id="app">
<!--     <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <div v-if="isLoggedIn == false" style="position: fixed; width: 100vw; height: 100vh; top: 0; left: 0; background-color: rgba(0,0,0,0.6); z-index: 1000">
      
      <div style="border: solid 1px #a6acb7; border-radius:0.5em; margin: auto; width: 25%; background-color: white; margin-top: 10%; min-height: 25%; padding: 1em;">
          
          <span style="font-weight: bold;">Hello! Before you start...</span> <div style="margin-top: 1em;">Please enter your cataloger ID and press [Enter] key. This is usually your Windows ID.</div>

          <input @keyup="login" v-model="catInitialsForm" type="text" name="id" autofocus placeholder="Cataloger ID" style="border: solid 1px #a6acb7; font-size: 2em; margin-top: 1em; border-top-right-radius: 0.25em; border-bottom-right-radius: 0.25em; width: 98%;">

      </div>


    </div>
    
    <router-view />
  </div>
</template>

<style>


#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>


<script>

import { mapState } from 'vuex'


export default {
  name: "App",
    computed: mapState({
      catInitials: 'catInitials',
      region: 'region',


      isLoggedIn: function(){
        if (!this.catInitials){return false}
        if (this.catInitials.trim()===''){return false}  


        return true
      }

    }),
  data: function() {
    return {


      catInitialsForm:""

    }
  },

  methods: {

    login: function(event){

      if (event.keyCode === 13) {
        localStorage.setItem('bfeCatInitials',this.catInitialsForm)
        this.$store.dispatch("setCatInitials", { self: this, catInitials: this.catInitialsForm  }).then(() => {
          
        })  

        // this.isLoggedIn=true;

      }


    },


  },

  created: function () {
  


    if (this.catInitials){
      // this.isLoggedIn=true;   

    }else if (localStorage.getItem('bfeCatInitials')!== null){
      // this.isLoggedIn=true;
      this.$store.dispatch("setCatInitials", { self: this, catInitials: localStorage.getItem('bfeCatInitials') }).then(() => {
        
      })   


    }else{
      // this.isLoggedIn=false;
    }



  }
}
</script>
