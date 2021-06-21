<template>

  <div class="component-container">


    EditAdminComponent



  </div>

<!--     <Keypress key-event="keydown" :multiple-keys="[{keyCode: 68, modifiers: ['ctrlKey','shiftKey'],preventDefault: false}]" @success="openDiacriticSelect" />

 -->



</template>

<script>


import { mapState } from 'vuex'
// import uiUtils from "@/lib/uiUtils"


export default {
  name: "EditAdminComponent",
  components: {
    // Keypress: () => import('vue-keypress')    
  },

  props: {
    structure: Object,
    parentStructure: Array,
    profileCompoent: String,
    profileName: String,
    activeTemplate: Object,
    nested: Boolean,
    parentURI: String,
  },

  methods: { 

   
        


  },
  computed: mapState({
    activeInput: 'activeInput',
    activeProfile: 'activeProfile',
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

<!-- Add "scoped" attribute to limit CSS to this component only -->


<style scoped>

input{
  outline:none;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
form{
  height: 100%;
}
</style>
