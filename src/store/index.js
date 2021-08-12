import Vue from "vue";
import Vuex from "vuex";
import parseProfile from "@/lib/parseProfile"
import lookupUtil from "@/lib/lookupUtil"
import exportXML from "@/lib/exportXML"

Vue.use(Vuex);

const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}




export default new Vuex.Store({
  state: {


    // profile related
    profilesLoaded: false,
    profiles: [],
    rtLookup: {},
    startingPoints: {},

    activeProfile: {},
    activeProfileIdCounter: {},

    activeRecordSaved: false,

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

    catInitials: null,

    settingsDPackVoyager: true,
    settingsDPackVoyagerNative: false,
    settingsLookupsUseTextSubjectEditor: true,


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
    idXML:"",
    bfdbXML:"",


    allRecords : [],
    myRecords: [],


    saveRecord : debounce((state,commit) => {

      console.log(state, commit,exportXML)
      
      exportXML.toBFXML(state.activeProfile)
      .then((xml)=>{
        
        lookupUtil.saveRecord(xml.xlmStringBasic, state.activeProfile.eId)
        commit('ACTIVERECORDSAVED',true)  
      })
      

    }, 2500),


  },
  mutations: {

    // one time profile load
    PROFILES(state, profiles) {
      state.profiles = profiles
      state.profilesLoaded = true
      // 
      // 
    },
    RTLOOKUP(state, lookup) {
      state.rtLookup = lookup

      // 
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

    
    CATINITALS(state, val){
      state.catInitials = val
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

    BFDBXML(state, val) {
      state.bfdbXML = val
    }, 
    MYRECORDS(state, val) {
      state.myRecords = val
    }, 
    ALLRECORDS(state, val) {
      state.allRecords = val
    },     



    SETTINGSDPACKVOYAGER(state, val) {
      state.settingsDPackVoyager = val
    },   
    SETTINGSDPACKVOYAGERNATIVE(state, val) {
      state.settingsDPackVoyagerNative = val
    },   
    SETTINGSLOOKUPSUSETEXTSUBJECTEDITOR(state, val) {
      state.settingsLookupsUseTextSubjectEditor = val
    },   
    

    ACTIVERECORDSAVED(state, val) {
      state.activeRecordSaved = val
    }, 

    

    




  },
  actions: {

    // loads the profile json from the server and parses it
    async fetchProfiles ({ commit }) {
      let p = await parseProfile.buildProfiles()
      commit('PROFILES', p.profiles)
      commit('RTLOOKUP', p.lookup)
      // 
      commit('STARTINGPOINTS', p.startingPoints)



      // set the default profile
      // var copy = Object.assign({}, p.profiles[this.state.sartingPoint]);
      // // 
      // commit('ACTIVEPROFILE', copy)
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
    async fetchBfdbXML ({ commit },data) {   
      commit('BFDBXML', '')    
      let results = await lookupUtil.fetchBfdbXML(data.url)
      commit('BFDBXML', results)  
    },

    async fetchOntology ({ commit },data) {   

      let results = await lookupUtil.fetchOntology(data.uri)
      

      commit('ONYOLOGYLOOKUP', results)  

    },


    async fetchAllRecords ({ commit }) {
      let results = await lookupUtil.fetchRecords()
      commit('ALLRECORDS', results)
    },
    async fetchMyRecords ({ commit },data) {
      let results = await lookupUtil.fetchRecords(data.user)
      commit('MYRECORDS', results)
    },



    clearContext ({ commit }) {   
      commit('CONTEXT', {})    
    },
    
    setContextManually({ commit}, data){
      commit('CONTEXT', data.context)
      // 
      // 
    },
    setActiveProfile({ commit}, data){

      if (data.useDefaultValues){
        data.profile = parseProfile.populateDefaultValuesIntoUserValues(data.profile)
      }

      commit('ACTIVEPROFILE', data.profile)
      
      
    },



    // addNewItem({ commit},data){
    //   // commit('ACTIVEPROFILE', data.profile)
      
    //   // 
    //   // let nap = parseProfile.addNewItem(state.activeProfile)


    // },

    

    setCatInitials({ commit}, data){
      commit('CATINITALS', data.catInitials)
    },


    async  setValueComplex ({ commit, state }, data) {   
      // we know the value bc it is the active context value in this case
      // 
      // 

      //    setValueComplex: async function          (currentState,               component,    key,                       activeProfileName, template, value, structure,parentStructure){

      let nap = await parseProfile.setValueComplex(state.activeProfile, data.profileComponet, data.structure.propertyURI, state.activeProfileName, data.template, state.contextData, data.structure, data.parentStructure)
      commit('ACTIVEPROFILE', nap)
      commit('ACTIVEEDITCOUNTER') 


      commit('ACTIVERECORDSAVED', false)
      state.saveRecord(state,commit)

    },

    async setValueSubject({ commit, state }, data) { 

      let nap = await parseProfile.setValueSubject(state.activeProfile, data.profileComponet, state.activeProfileName, data.subjectComponents)

      commit('ACTIVEPROFILE', nap)
      commit('ACTIVEEDITCOUNTER') 

      commit('ACTIVERECORDSAVED', false)
      state.saveRecord(state,commit)

    }, 

    
    // this is the macro express one
    setSettingsDPackVoyager({ commit}, data){
      commit('SETTINGSDPACKVOYAGER', data.settingsDPackVoyager)
      localStorage.setItem('bfeSettingsDPackVoyager',data.settingsDPackVoyager)
    },

    // this is the native voyager one
    setSettingsDPackVoyagerNative({ commit}, data){
      commit('SETTINGSDPACKVOYAGERNATIVE', data.settingsDPackVoyagerNative)
      localStorage.setItem('bfeSettingsDPackVoyagerNative',data.settingsDPackVoyagerNative)
    },

    // use the new subject editor or not
    settingsLookupsUseTextSubjectEditor({ commit}, data){
      commit('SETTINGSLOOKUPSUSETEXTSUBJECTEDITOR', data.settingsLookupsUseTextSubjectEditor)
      localStorage.setItem('bfeSettingsDPackVoyagerNative',data.settingsLookupsUseTextSubjectEditor)
    },





    async removeValueSimple ({ commit, state }, data) {   
      let results = parseProfile.removeValueSimple(state.activeProfile, data.idGuid, data.labelGuid)
      commit('ACTIVEPROFILE', results)
      commit('ACTIVEEDITCOUNTER')    
      commit('ACTIVERECORDSAVED', false)
      state.saveRecord(state,commit)
      return results
    },


    async setValueSimple ({ commit, state }, data) {   

      console.log(state.activeProfile, data.ptGuid, data.parentURI, data.URI, data.valueURI, data.valueLabel)
      let results = await parseProfile.setValueSimple(state.activeProfile, data.ptGuid, data.parentURI, data.URI, data.valueURI, data.valueLabel)
      console.log(results)
      commit('ACTIVEPROFILE', results.currentState)
      commit('ACTIVEEDITCOUNTER')    
      commit('ACTIVERECORDSAVED', false)
      state.saveRecord(state,commit)
      return results.newData
    },

    async setValueLiteral ({ commit, state }, data) {   
      console.log('-----------setValueLiteral-----------')
      console.log(data)
      console.log('-----------setValueLiteral-----------')
      
      let results = await parseProfile.setValueLiteral(state.activeProfile, data.ptGuid, data.guid, data.parentURI, data.URI, data.value)
      commit('ACTIVEPROFILE', results.currentState)
      commit('ACTIVEEDITCOUNTER')    
      commit('ACTIVERECORDSAVED', false)
      state.saveRecord(state,commit)
      return results.newGuid
    },


    async refTemplateChange ({ commit, state }, data) {   

      let nap = parseProfile.refTemplateChange(state.activeProfile, data.profileComponet, data.structure.propertyURI,  state.activeProfileName, data.template, data.parentId, data.thisRef, data.nextRef)
      commit('ACTIVEPROFILE', nap)    


    },



    cloneInstance ({ commit, state }, data) {    
      let nap = parseProfile.cloneInstance(state.activeProfile, data.uri)
      commit('ACTIVEPROFILE', nap)   
    },

    addInstance ({ commit, state }) {    
      let nap = parseProfile.addInstance(state.activeProfile)
      commit('ACTIVEPROFILE', nap)   
    },
    deleteInstance ({ commit, state }, data) {    
      let nap = parseProfile.deleteInstance(state.activeProfile, data.uri)
      commit('ACTIVEPROFILE', nap)   
    },
    deleteItem ({ commit, state }, data) {    
      let nap = parseProfile.deleteItem(state.activeProfile, data.uri)
      commit('ACTIVEPROFILE', nap)   
    },
    duplicateItem ({ commit, state }, data) {    
      let nap = parseProfile.duplicateItem(state.activeProfile, data.uri)
      commit('ACTIVEPROFILE', nap)   
    },
    



    addItem ({ commit, state }, data) {    
      let nap = parseProfile.addItem(state.activeProfile, data.uri)
      commit('ACTIVEPROFILE', nap)   
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

    setActiveRecordSaved: ({commit}, newValue) => {
      commit('ACTIVERECORDSAVED', newValue)
    },



    async removeProperty ({commit, state}, data) {
      let newProfile = parseProfile.removeProperty(data.id,data.profile,state.activeProfile)
      commit('ACTIVEPROFILE', newProfile)    


      state.saveRecord(state,commit)
    },

    restoreProperty: ({commit, state}, data) => {
      let newProfile = parseProfile.restoreProperty(data.id,data.profile,state.activeProfile)
      commit('ACTIVEPROFILE', newProfile)    
    },







    async duplicateProperty ({commit, state}, data) {
      let newProfile = parseProfile.duplicateProperty(data.id,data.profile,state.activeProfile)
      commit('ACTIVEPROFILE', newProfile) 

      state.saveRecord(state,commit)

    },


  },
  modules: {}
});
