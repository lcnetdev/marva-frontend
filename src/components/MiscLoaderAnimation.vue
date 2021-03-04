<template>


  <div id="hourglass" style="width: 100px"></div>


</template>

<script>



export default {
  name: "MiscLoaderAnimation",
  components: {
      // Keypress: () => import('vue-keypress')
  },
  props: {
  },
  methods: {

    hourglassFill() {
        let hourglass = document.getElementById('hourglass');
        console.log(hourglass,hourglass,hourglass,hourglass)
        hourglass.innerHTML = '<svg height="100px" width="100px"  fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path fill="#000000" d="M28.5,14h43c1.105,0,2,0.895,2,2v17.886c0,0.46-0.158,0.906-0.449,1.262L60.818,50.186   l12.226,14.855c0.295,0.358,0.456,0.807,0.456,1.271V84c0,1.105-0.895,2-2,2h-43c-1.105,0-2-0.895-2-2V66.312   c0-0.464,0.161-0.913,0.456-1.271l12.226-14.855L26.949,35.148c-0.29-0.357-0.449-0.802-0.449-1.262V16   C26.5,14.895,27.395,14,28.5,14z M68.5,19h-37v13.819l13.627,16.749c0.3,0.369,0.299,0.899-0.004,1.267L31.5,67.388V81h37V67.388   L54.877,50.835c-0.302-0.368-0.304-0.897-0.004-1.267L68.5,32.819V19z"></path><path fill="#000000" d="M64,23.5v7.924L52.137,46.097c-0.524,0.648-1.303,1.021-2.137,1.021   s-1.613-0.372-2.138-1.021L36,31.424V23.5H64z"></path></g></svg>';

        // half
        window.hourglassTimeout1 = setTimeout(function () {
            hourglass.innerHTML = '<svg height="100px" width="100px"  fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path fill="#000000" d="M28.5,14h43c1.105,0,2,0.895,2,2v17.886c0,0.46-0.158,0.906-0.449,1.262L60.818,50.186   l12.226,14.855c0.295,0.358,0.456,0.807,0.456,1.271V84c0,1.105-0.895,2-2,2h-43c-1.105,0-2-0.895-2-2V66.312   c0-0.464,0.161-0.913,0.456-1.271l12.226-14.855L26.949,35.148c-0.29-0.357-0.449-0.802-0.449-1.262V16   C26.5,14.895,27.395,14,28.5,14z M68.5,19h-37v13.819l13.627,16.749c0.3,0.369,0.299,0.899-0.004,1.267L31.5,67.388V81h37V67.388   L54.877,50.835c-0.302-0.368-0.304-0.897-0.004-1.267L68.5,32.819V19z"></path><path fill="#000000" d="M62.683,33.053L52.226,45.987c-0.423,0.523-0.994,0.937-1.652,1.072   c-1.041,0.213-2.068-0.166-2.711-0.962L37.317,33.053c-0.529-0.654-0.063-1.629,0.778-1.629h23.811   C62.746,31.424,63.212,32.399,62.683,33.053z"></path><path fill="#000000" d="M36,76.5v-5.218c0-0.423,0.266-0.799,0.663-0.942l11.99-4.285   c0.87-0.311,1.822-0.311,2.692,0l11.99,4.285C63.734,70.483,64,70.859,64,71.282V76.5H36z"></path></g></svg>';
        }, 1000);

        // end
        window.hourglassTimeout2 = setTimeout(function () {
            hourglass.innerHTML = '<svg height="100px" width="100px"  fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path fill="#000000" d="M36,76.301v-6.653l12.635-11.865c0.768-0.721,1.963-0.723,2.733-0.004l12.587,11.744   L64,76.301c0.001,0.11-0.088,0.199-0.198,0.199H36.199C36.089,76.5,36,76.411,36,76.301z"></path><g><path fill="#000000" d="M28.5,14h43c1.105,0,2,0.895,2,2v17.886c0,0.46-0.158,0.906-0.449,1.262L60.818,50.186    l12.226,14.855c0.295,0.358,0.456,0.807,0.456,1.271V84c0,1.105-0.895,2-2,2h-43c-1.105,0-2-0.895-2-2V66.312    c0-0.464,0.161-0.913,0.456-1.271l12.226-14.855L26.949,35.148c-0.29-0.357-0.449-0.802-0.449-1.262V16    C26.5,14.895,27.395,14,28.5,14z M68.5,19h-37v13.819l13.627,16.749c0.3,0.369,0.299,0.899-0.004,1.267L31.5,67.388V81h37V67.388    L54.877,50.835c-0.302-0.368-0.304-0.897-0.004-1.267L68.5,32.819V19z"></path><path fill="#000000" d="M43.66,40.899l4.112,5.086c0.423,0.523,0.994,0.938,1.653,1.073    c1.041,0.214,2.069-0.166,2.712-0.962l4.202-5.197c0.529-0.654,0.063-1.629-0.778-1.629H44.438    C43.597,39.271,43.132,40.245,43.66,40.899z"></path></g></g></svg>';
        }, 1500);

        // end
        window.hourglassTimeout3 = setTimeout(function () {
            hourglass.innerHTML = '<svg height="100px" width="100px"  fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path fill="#000000" d="M71.5,86h-43c-1.105,0-2-0.895-2-2V66.114c0-0.46,0.158-0.906,0.449-1.262l12.234-15.037   L26.956,34.959c-0.295-0.358-0.456-0.807-0.456-1.271V16c0-1.105,0.895-2,2-2h43c1.105,0,2,0.895,2,2v17.688   c0,0.464-0.161,0.913-0.456,1.271L60.818,49.814l12.234,15.037c0.29,0.357,0.449,0.802,0.449,1.262V84   C73.5,85.105,72.605,86,71.5,86z M31.5,81h37V67.181L54.873,50.432c-0.3-0.369-0.299-0.899,0.004-1.267L68.5,32.612V19h-37v13.612   l13.623,16.553c0.302,0.368,0.304,0.897,0.004,1.267L31.5,67.181V81z"></path><path fill="#000000" d="M36,76.5v-7.924l11.863-14.673c0.524-0.648,1.303-1.021,2.137-1.021   s1.613,0.372,2.138,1.021L64,68.576V76.5H36z"></path></g></svg>';
        }, 2000);



        // rotate
        setTimeout(function () {
            hourglass.classList.toggle('rotated');
        }, 3000);

        // rotate again to the original position
        window.hourglassTimeout4 = setTimeout(function () {
            hourglass.classList.toggle('rotated');
            hourglass.innerHTML = '<svg height="100px" width="100px"  fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path fill="#000000" d="M28.5,14h43c1.105,0,2,0.895,2,2v17.886c0,0.46-0.158,0.906-0.449,1.262L60.818,50.186   l12.226,14.855c0.295,0.358,0.456,0.807,0.456,1.271V84c0,1.105-0.895,2-2,2h-43c-1.105,0-2-0.895-2-2V66.312   c0-0.464,0.161-0.913,0.456-1.271l12.226-14.855L26.949,35.148c-0.29-0.357-0.449-0.802-0.449-1.262V16   C26.5,14.895,27.395,14,28.5,14z M68.5,19h-37v13.819l13.627,16.749c0.3,0.369,0.299,0.899-0.004,1.267L31.5,67.388V81h37V67.388   L54.877,50.835c-0.302-0.368-0.304-0.897-0.004-1.267L68.5,32.819V19z"></path><path fill="#000000" d="M64,23.5v7.924L52.137,46.097c-0.524,0.648-1.303,1.021-2.137,1.021   s-1.613-0.372-2.138-1.021L36,31.424V23.5H64z"></path></g></svg>';
        }, 3500);
    }

  },
 
  data: function() {
    return {
     
      test: null

    }
  },
  mounted: function(){


            clearTimeout(window.hourglassTimeout1)
            clearTimeout(window.hourglassTimeout2)
            clearTimeout(window.hourglassTimeout3)
            clearTimeout(window.hourglassTimeout4)
            clearTimeout(window.hourglassTimeout5)

            this.hourglassFill();

            window.hourglassTimeout5 = setInterval(this.hourglassFill, 4000);



  },

  beforeDestroy: function(){

            clearTimeout(window.hourglassTimeout1)
            clearTimeout(window.hourglassTimeout2)
            clearTimeout(window.hourglassTimeout3)
            clearTimeout(window.hourglassTimeout4)
            clearTimeout(window.hourglassTimeout5)
    
  }
};
</script>


<style scoped>

 .icon-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto;
}

.icon-wrapper div.fa {
    margin: 20px 0;
}

.rotated {
    -webkit-transform: rotate(180deg);
    -moz-transform: rotate(180deg);
    -ms-transform: rotate(180deg);
    -o-transform: rotate(180deg);
    transform: rotate(180deg);

    -webkit-transition: all 0.5s ease-in-out;
    -moz-transition: all 0.5s ease-in-out;
    -o-transition: all 0.5s ease-in-out;
    transition: all 0.5s ease-in-out;
}

</style>
