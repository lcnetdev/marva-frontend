import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";


import parseProfile from "./lib/parseProfile"
import lookupUtil from "./lib/lookupUtil"



import './assets/main.css';

Vue.config.productionTip = false;
var app = new Vue({ // eslint-disable-line
  router,
  store,
  render: h => h(App)
}).$mount("#app"); 


parseProfile.buildProfiles()
	.then(results => lookupUtil.fetchAllOntology(results))


if (localStorage.getItem('bfeDiacritics') === null){
	localStorage.setItem('bfeDiacritics',JSON.stringify([{"letter":"ç","trigger":"c","keycode":99,"desc":"cedilla"},{"letter":"é","trigger":"e","keycode":101,"desc":"acute e"},{"letter":"â","trigger":"1","keycode":49,"desc":"circumflex a"},{"letter":"ê","trigger":"2","keycode":50,"desc":"circumflex e"},{"letter":"î","trigger":"3","keycode":51,"desc":"circumflex i"},{"letter":"ô","trigger":"4","keycode":52,"desc":"circumflex o"},{"letter":"û","trigger":"5","keycode":53,"desc":"circumflex u"},{"letter":"à","trigger":"6","keycode":54,"desc":"grave accent a"},{"letter":"è","trigger":"7","keycode":55,"desc":"grave accent e"},{"letter":"ì","trigger":"8","keycode":56,"desc":"grave accent i"},{"letter":"ò","trigger":"9","keycode":57,"desc":"grave accent o"},{"letter":"ù","trigger":"0","keycode":48,"desc":"grave accent u"},{"letter":"ë","trigger":"z","keycode":122,"desc":"trema e"},{"letter":"ï","trigger":"x","keycode":120,"desc":"trema i"},{"letter":"ü","trigger":"v","keycode":118,"desc":"trema u"}]))
}




