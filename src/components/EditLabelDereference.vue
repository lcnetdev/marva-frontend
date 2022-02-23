<template>
 <span>{{displayLabel}}</span>
</template>

<script>


export default {
  name: "EditLabelDereference",
  components: {



  },

  props: {
    URI: String,
  },

  data:function() {
    return {

      displayLabel: this.URI

    }
  },

  created: function(){

    if (this.URI.startsWith('http://') || this.URI.startsWith('https://') ){

      if (this.URI.includes('id.loc.gov')){

        // if its a instance/work/hub getthe x-pref label from the head request
        if (
            this.URI.includes('/resources/instances/') || 
            this.URI.includes('/resources/works/') || 
            this.URI.includes('/resources/hubs/') ||

            this.URI.includes('/vocabulary/') 
          ){

          if (this.URI.endsWith('/')){
            this.URI = this.URI.slice(0, -1)
          }

          let URL = this.URI + '.nt'

          let self = this

          fetch(URL.replace('http://','https://'), {method: 'HEAD', redirect: "follow" }).then(
            function(response)
              {
              let preflabel = response.headers.get("x-preflabel");
              if (preflabel){
                self.displayLabel = preflabel
              }
              }
            );




        }



      }else{
          this.displayLabel = this.URI
      }



    }else{
      this.displayLabel = this.URI
    }

      
      


  },

};

</script>