<template>
 <span class="trigger-open">{{displayLabel}}</span>
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
          URL = URL.replace('http://','https://')

          let cache = sessionStorage.getItem(URL);
          
          if (cache){

            this.displayLabel = cache

          }else{

            let self = this
            fetch(URL, {method: 'HEAD', redirect: "follow" }).then(
              function(response)
                {
                  let preflabel = response.headers.get("x-preflabel");
                  if (preflabel){
                    self.displayLabel = preflabel


                    sessionStorage.setItem(URL, preflabel);


                  }
                }
              ).catch(function() {
                    
                    // there was something with the request, ignore


              });


          }





        }else{

          // some common hardcoded values
          if (this.URI == 'http://id.loc.gov/authorities/subjects'){
            this.displayLabel = 'Library of Congress subject headings'
          }



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