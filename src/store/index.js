import Vue from "vue";
import Vuex from "vuex";
import parseProfile from "@/lib/parseProfile"
import lookupUtil from "@/lib/lookupUtil"

Vue.use(Vuex);

export default new Vuex.Store({
  state: {

    // profile related
    profilesLoaded: false,
    profiles: [],
    rtLookup: {},
    startingPoints: {},

    activeProfile: {},
    activeProfileIdCounter: {},

    sartingPoint: 'lc:profile:bf2:Monograph',
    // sartingPoint: 'test:profile:bf2:TestProfile',

                            // removed
                            // {
                            //     "mandatory": "false",
                            //     "repeatable": "true",
                            //     "type": "resource",
                            //     "resourceTemplates": [],
                            //     "valueConstraint": {
                            //         "valueTemplateRefs": [
                            //             "lc:RT:bflc:Agents:PrimaryContribution"
                            //         ],
                            //         "useValuesFrom": [],
                            //         "valueDataType": {
                            //             "dataTypeURI": "http://id.loc.gov/ontologies/bflc/PrimaryContribution"
                            //         },
                            //         "defaults": [],
                            //         "editable": "true",
                            //         "repeatable": "true"
                            //     },
                            //     "propertyURI": "http://id.loc.gov/ontologies/bibframe/contribution",
                            //     "propertyLabel": "Creator of Work",
                            //     "remark": "http://access.rdatoolkit.org/19.2.html"
                            // },
    



    // user related
    userName: 'demo',


    activeInput: null,



    // used for auto complete lookups 
    lookupLibrary: {},

    ontologyLookup: {},

    disableMacroKeyNav: false,


    activeComplexSearch: [],
    activeComplexSearchInProgress: false,

    activeComponent: null,
    activeProfileName: null,
    activeEditCounter: 0,

    contextData: {},



    idWorkSearchResults: [],
    idXML:""

  },
  mutations: {

    // one time profile load
    PROFILES(state, profiles) {
      state.profiles = profiles
      state.profilesLoaded = true
      // console.log('profiles')
      // console.log(profiles)
    },
    RTLOOKUP(state, lookup) {
      state.rtLookup = lookup

      // console.log(lookup)
    },
    STARTINGPOINTS(state, lookup) {
      state.startingPoints = lookup
    },

    LOOKUP(state, lookup) {
      state.lookupLibrary[lookup.metadata.uri] = lookup
    },
    LOOKUPCOMPLEX(state, lookup) {
      state.activeComplexSearch = lookup
    },

    LOOKUPCOMPLEXSTATUS(state, val) {
      state.activeComplexSearchInProgress = val
    },

    CONTEXT(state, val) {
      state.contextData = val
    },


    MACNAV(state,val) {
      state.disableMacroKeyNav = val
    },
    ACTIVEINPUT(state,val) {
      state.activeInput = val
    },
    ACTIVECOMPONET(state,val) {
      state.activeComponent = val
    },

    ACTIVEPROFILE(state,val) {
      state.activeProfile = val
    },
    ACTIVEPROFILECOUNTER(state,val) {
      state.activeProfileIdCounter = val
    },
    ACTIVEPROFILENAME(state,val) {
      state.activeProfileName = val
    },
    ACTIVEEDITCOUNTER(state) {
      state.activeEditCounter++
    },    

    ONYOLOGYLOOKUP(state, val){
      state.ontologyLookup[val.uri] = val
    },

    IDWORKSEARCH(state, val) {
      state.idWorkSearchResults = val
    }, 

    IDXML(state, val) {
      state.idXML = val
    }, 



  },
  actions: {

    // loads the profile json from the server and parses it
    async fetchProfiles ({ commit }) {
      let p = await parseProfile.buildProfiles()
      commit('PROFILES', p.profiles)
      commit('RTLOOKUP', p.lookup)
      // console.log('startingPoints',p.startingPoints)
      commit('STARTINGPOINTS', p.startingPoints)



      // set the default profile
      var copy = Object.assign({}, p.profiles[this.state.sartingPoint]);
      // console.log(copy,'copy')
      commit('ACTIVEPROFILE', copy)
    },

    async fetchLookupValues ({ commit },data) {
      let p = await lookupUtil.loadSimpleLookup(data.url)
      commit('LOOKUP', p)
    },

    async fetchLookupValuesComplex ({ commit },data) {   
      commit('LOOKUPCOMPLEX', [])    
      
      commit('LOOKUPCOMPLEXSTATUS', true)  
      let results = await lookupUtil.searchComplex(data.searchPayload)
      commit('LOOKUPCOMPLEXSTATUS', false)  
      commit('LOOKUPCOMPLEX', results)  
    },

    clearLookupValuesComplex ({ commit }) {   
      commit('LOOKUPCOMPLEX', [])          
    },

    async fetchContext ({ commit },data) {   
      commit('CONTEXT', {})    
      let results = await lookupUtil.returnContext(data.searchPayload)
      console.log(results,'results context')
      console.log(JSON.stringify(results))
      commit('CONTEXT', results)  
    },


    async fetchIdWorkSearch ({ commit },data) {   
      commit('IDWORKSEARCH', {})    

      let results = await lookupUtil.fetchIdWorkSearch(data.searchValue)
      commit('IDWORKSEARCH', results)  
    },

    async fetchIdXML ({ commit },data) {   
      commit('IDXML', '')    
      let results = await lookupUtil.fetchIdXML(data.url)
      commit('IDXML', results)  
    },


    async fetchOntology ({ commit },data) {   

      let results = await lookupUtil.fetchOntology(data.uri)
      console.log(results)

      commit('ONYOLOGYLOOKUP', results)  

    },



    clearContext ({ commit }) {   
      commit('CONTEXT', {})    
    },
    
    setContextManually({ commit}, data){
      commit('CONTEXT', data.context)
      // console.log(data)
      // console.log("^^^^^^^^data")
    },
    setActiveProfile({ commit}, data){
      commit('ACTIVEPROFILE', data.profile)
      // console.log(data)
      // console.log("^^^^^^^^data")
    },

    addValue ({ commit, state }, data) {   
      // we know the value bc it is the active context value in this case
      // console.log('-----------state.contextData-state.contextData-state.contextData------------')
      // console.log(state.contextData)
      console.log(data)
      let nap = parseProfile.setValue(state.activeProfile, data.profileComponet, data.structure.propertyURI, state.activeProfileName, data.template, state.contextData)
      commit('ACTIVEPROFILE', nap)
      commit('ACTIVEEDITCOUNTER')      
    },
    addValueLiteral ({ commit, state }, data) {   
      let nap = parseProfile.setValue(state.activeProfile, data.profileComponet, data.structure.propertyURI, state.activeProfileName, data.template, data.value)
      commit('ACTIVEPROFILE', nap)
      commit('ACTIVEEDITCOUNTER')      
    },


    disableMacroNav ({ commit }) {
      commit('MACNAV', true)
    },
    enableMacroNav ({ commit }) {
      commit('MACNAV', false)
    },

    setActiveInput: ({commit}, data) => {      
      commit('ACTIVEINPUT', data.id)
      commit('ACTIVECOMPONET', data.profileCompoent)
      commit('ACTIVEPROFILENAME', data.profileName)
    },

    setActiveProfileCounter: ({commit}, newValue) => {
      commit('ACTIVEPROFILECOUNTER', newValue)
    },

    
    removeProperty: ({commit, state}, data) => {
      let newProfile = parseProfile.removeProperty(data.id,data.profile,state.activeProfile)
      commit('ACTIVEPROFILE', newProfile)    
    },

    duplicateProperty: ({commit, state}, data) => {
      let newProfile = parseProfile.duplicateProperty(data.id,data.profile,state.activeProfile)
      commit('ACTIVEPROFILE', newProfile)    
    },


  },
  modules: {}
});
