import Vue from "vue";
import Vuex from "vuex";
import parseProfile from "@/lib/parseProfile"
import lookupUtil from "@/lib/lookupUtil"
import exportXML from "@/lib/exportXML"
// import exportXMLWorker from "@/lib/exportXMLWorker"

Vue.use(Vuex);

const unique = (arr) => [...new Set(arr)];


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
    profilesUnmodified: [],
    rtLookup: {},
    rtLookupUnmodified: {},
    startingPoints: {},

    activeProfile: {},
    // lastActiveProfile: null,
    activeProfileIdCounter: {},

    workingOnMiniProfile: false,
    activeProfileMini: {},

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

    settingsDisplayMode: 'default',

    settingsHideEmptyFields: false,
    settingsLeftMenuEnriched: true,

    settingsTreatLikeNoteFields: "ALL_FIELDS",


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

    supportedRomanizations: [],


    idWorkSearchResults: [],
    idXML:"",
    bfdbXML:"",


    allRecords : [],
    myRecords: [],

    subjectList: [],



    diagramMiniMap: false,


    undo: [],
    undoIndex: -1,
    undoCounter: 0,
    activeUndoLog: [],


    loadResourceFavorites: [], 


    subjectEditorMode: 'build',


    saveRecord : debounce((state,commit) => {

      console.log("--------------------SAVING NOW ----------------------")
      console.log("--------------------SAVING NOW ----------------------")
      console.log("--------------------SAVING NOW ----------------------")
      console.log("--------------------SAVING NOW ----------------------")

      // console.log(state, commit,exportXML)
      // state.lastActiveProfile = JSON.parse(JSON.stringify(state.activeProfile))
      // exportXMLWorker.test()
      
      exportXML.toBFXML(state.activeProfile)
      .then((xml)=>{

        console.log("NEW STATE:",JSON.parse(JSON.stringify(state.activeProfile)))
        
        lookupUtil.saveRecord(xml.xlmStringBasic, state.activeProfile.eId)
        commit('ACTIVERECORDSAVED',true)  
        
        console.log("state.undoIndex:",state.undoIndex, "state.undo.length - 1:",state.undo.length - 1)

        if (state.undo.length - 1 > state.undoIndex){
          console.log('Splicing this shit')
          state.undo.splice(state.undoIndex + 1)
          // state.undoIndex = state.undo.length - 1

        }

        state.undoIndex= state.undoIndex + 1
        
        console.log("NEW STATE:",JSON.parse(JSON.stringify(state.activeProfile)))

        if (state.activeUndoLog.length==0){
          state.activeUndoLog.push('Unknown change...')
        }
        // make unique
        state.activeUndoLog = unique(state.activeUndoLog);
        state.undo.push({'state':JSON.parse(JSON.stringify(state.activeProfile)),'log':JSON.parse(JSON.stringify(state.activeUndoLog))})
        state.activeUndoLog=[]
        console.log(state.undo)
        state.undoCounter++

      })
      

    }, 2000),


  },
  mutations: {

    // one time profile load
    PROFILES(state, profiles) {
      state.profiles = profiles
      state.profilesLoaded = true
      // 
      // 
    },
    PROFILESUNMODIFIED(state, profiles) {
      state.profiles = profiles
    },


    RTLOOKUP(state, lookup) {
      state.rtLookup = lookup
    },

    RTLOOKUPUNMODIFIED(state, lookup) {
      state.rtLookupUnmodified = lookup
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
    ACTIVEPROFILEMINI(state,val) {
      state.activeProfileMini = val
    },
    // LASTACTIVEPROFILE(state,val) {
    //   state.lastActiveProfile = val
    // },


    ACTIVEPROFILECOUNTER(state,val) {
      state.activeProfileIdCounter = val
    },
    ACTIVEPROFILENAME(state,val) {
      state.activeProfileName = val
    },
    ACTIVEPROFILEMININAME(state,val) {
      state.activeProfileMiniName = val
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


    WORKINGONMINIPROFILE(state, val) {
      state.workingOnMiniProfile = val
    },

    SETTINGSDPACKVOYAGER(state, val) {
      state.settingsDPackVoyager = val
    },   

    SUBJECTLIST(state, val) {
      state.subjectList = val
    },   
    
    SETTINGSDPACKVOYAGERNATIVE(state, val) {
      state.settingsDPackVoyagerNative = val
    },   
    SETTINGSLOOKUPSUSETEXTSUBJECTEDITOR(state, val) {
      state.settingsLookupsUseTextSubjectEditor = val
    },   
    SETTINGSDISPLAYMODE(state, val) {
      state.settingsDisplayMode = val
    },   

    SETTINGSHIDEEMPTYFIELDS(state, val) {
      state.settingsHideEmptyFields = val
    },   

    SETTINGSLEFTMENUENRICHED(state, val) {
      state.settingsLeftMenuEnriched = val
    },   


    
    SETUNDO(state, val) {
      state.undo = val
    }, 


    TREATLIKENOTEFIELDS(state, val) {
      state.settingsTreatLikeNoteFields = val
    }, 



    INCREMENTUNDOCOUNTER(state) {
      state.undoCounter = state.undoCounter + 1
    }, 

    

    UNDOLOG(state, val) {
      state.activeUndoLog = val
    }, 

    SETUNDOINDEX(state, val) {
      state.undoIndex = val
    }, 
    



    ACTIVERECORDSAVED(state, val) {
      state.activeRecordSaved = val
    }, 


    DIAGRAMMINIMAP(state, val) {
      state.diagramMiniMap = val
    }, 


    SUPORTEDROMANIZATIONS(state, val) {
      state.supportedRomanizations = val
    }, 
 

 
    LOADRESOURCEFAVORITES(state, val) {
      state.loadResourceFavorites = val
    }, 


    SUBJECTEDITORMODE(state, val) {
      state.subjectEditorMode = val
    }


    
    

    




  },
  actions: {

    // loads the profile json from the server and parses it
    async fetchProfiles ({ commit }) {
      let p = await parseProfile.buildProfiles()
      commit('PROFILES', p.profiles)
      commit('RTLOOKUP', p.lookup)

      commit('PROFILESUNMODIFIED',JSON.parse(JSON.stringify(p.profiles)))
      commit('RTLOOKUPUNMODIFIED',JSON.parse(JSON.stringify(p.lookup)))

      commit('STARTINGPOINTS', p.startingPoints)



      // set the default profile
      // var copy = Object.assign({}, p.profiles[this.state.sartingPoint]);
      // // 
      // commit('ACTIVEPROFILE', copy)
    },

    async fetchLookupValues ({ commit },data) {
      let p
      if (data.keyword){
        p = await lookupUtil.loadSimpleLookupKeyword(data.url, data.keyword)
      }else{
        p = await lookupUtil.loadSimpleLookup(data.url)  
      }
      
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
      console.log('data',data)
      let results = await lookupUtil.fetchOntology(data.uri)
      
      console.log('results',results)
      commit('ONYOLOGYLOOKUP', results)  

    },


    async fetchAllRecords ({ commit },data) {
      let results = await lookupUtil.fetchRecords(data.user,data.search)
      commit('ALLRECORDS', results)
    },
    async fetchMyRecords ({ commit },data) {
      let results = await lookupUtil.fetchRecords(data.user)
      commit('MYRECORDS', results)
    },



    
    setWorkingOnMiniProfile({commit}, data){
      commit('WORKINGONMINIPROFILE', data.value)
    },


    clearContext ({ commit }) {   
      commit('CONTEXT', {})    
    },
    
    setContextManually({ commit}, data){
      commit('CONTEXT', data.context)
      // 
      // 
    },



    
    // setLastActiveProfile({ commit, state}, data){
    //   commit('LASTACTIVEPROFILE', data.profile)
    // },

    setActiveProfile({ commit, state}, data){
      
      if (data.useDefaultValues){
        data.profile = parseProfile.populateDefaultValuesIntoUserValues(data.profile)
      }

      data.profile = parseProfile.reorderRTOrder(data.profile)

      console.log("Working on setActiveProfile", state.workingOnMiniProfile)
      if (state.workingOnMiniProfile){

        commit('ACTIVEPROFILEMINI', data.profile)

      }else{

        commit('ACTIVEPROFILE', data.profile)

        let mini = parseProfile.returnDiagramMiniMap(data.profile)
        commit('DIAGRAMMINIMAP', mini)    


      }



      
    },


    setCatInitials({ commit}, data){
      commit('CATINITALS', data.catInitials)
    },



    



    async  setValueComplex ({ commit, state }, data) {   
      // we know the value bc it is the active context value in this case
      let nap

      if (state.workingOnMiniProfile){

        nap = await parseProfile.setValueComplex(state.activeProfileMini, data.profileComponet, data.structure.propertyURI, state.activeProfileName, data.template, state.contextData, data.structure, data.parentStructure)
        nap = parseProfile.rebuildHubURI(nap)

        commit('ACTIVEPROFILEMINI', nap)

      }else{

        nap = await parseProfile.setValueComplex(state.activeProfile, data.profileComponet, data.structure.propertyURI, state.activeProfileName, data.template, state.contextData, data.structure, data.parentStructure)
        nap = parseProfile.rebuildHubURI(nap)


        commit('ACTIVEPROFILE', nap)
        commit('ACTIVEEDITCOUNTER') 
        commit('ACTIVERECORDSAVED', false)      


        state.saveRecord(state,commit)

      }


    },

    setSubjectOrder({ commit, state}, subjects){
     
        let nap = parseProfile.reorderSubjects(state.activeProfile, subjects)
        commit('ACTIVEPROFILE', nap)

    },

    
    forceSave({ commit, state }) { 

      state.saveRecord(state,commit)

    },


    incrementUndoCounter({ commit }){

      commit('INCREMENTUNDOCOUNTER')

    },


    setActiveUndo({ commit, state}, data){
      let msg = [data.msg]
      if (state.activeUndoLog.length>0){
        msg = JSON.parse(JSON.stringify(state.activeUndoLog))
        msg.push(data.msg)
      }
      commit('UNDOLOG', msg)
    },


    clearUndo({ commit}){
      commit('SETUNDO', [])
      commit('UNDOLOG', [])
      commit('SETUNDOINDEX', -1)
    },



    undoRedoAction({ commit, state }, data) { 


      if (data.undo){


        let goto = state.undoIndex - data.undo


        // can we undo? 
      if (goto >= 0){
          // yes, so go back to that index of the undo hisotry
          let newState = JSON.parse(JSON.stringify(state.undo[goto].state))



          
          commit('SETUNDOINDEX', goto)
          commit('ACTIVEPROFILE', newState)

          console.log("going vack to this state:",goto,state.undo[goto])

        }

      }else if (data.redo){


        let goto = state.undoIndex + data.redo

        if (goto <= state.undo.length){
         
          let newState = JSON.parse(JSON.stringify(state.undo[goto].state))



          
          commit('SETUNDOINDEX', goto)
          commit('ACTIVEPROFILE', newState)

          console.log("going forward to this state:",goto,state.undo[goto])

        }

      }else if ('goto' in data){

        let newState = JSON.parse(JSON.stringify(state.undo[data.goto].state))

        commit('SETUNDOINDEX', data.goto)
        commit('ACTIVEPROFILE', newState)




      }
 


    }, 

    
    setLangLiterals({ commit, state }, data) { 

      let nap = parseProfile.setLangLiterals(state.activeProfile, data.guid, data.lang)

      commit('ACTIVEPROFILE', nap)
      commit('ACTIVEEDITCOUNTER') 

      commit('ACTIVERECORDSAVED', false)
      state.saveRecord(state,commit)

    }, 


    setTemplateDataFlow({ commit, state }, data) { 



      if (!state.activeProfile.templateDataFlow){
        state.activeProfile.templateDataFlow={}
      }

      if (data.value == 'both'){
        // if the value is both then it is the default behavior, we don't need to store it
        delete state.activeProfile.templateDataFlow[data.id]
      }else{
        state.activeProfile.templateDataFlow[data.id] = data.value
      }

      // don't even keep it around if there are no values
      if (Object.keys(state.activeProfile.templateDataFlow)==0){
        delete state.activeProfile.templateDataFlow
      }

      commit('ACTIVEPROFILE', state.activeProfile)

    },


    setTemplateName({ commit, state }, data) { 
      state.activeProfile.templateLabel = data.value
      commit('ACTIVEPROFILE', state.activeProfile)
    },


    

    async setValueSubject({ commit, state }, data) { 

      let nap = await parseProfile.setValueSubject(state.activeProfile, data.profileComponet, state.activeProfileName, data.subjectComponents)

      commit('ACTIVEPROFILE', nap)
      commit('ACTIVEEDITCOUNTER') 

      commit('ACTIVERECORDSAVED', false)
      state.saveRecord(state,commit)

    }, 


    /**
    * Which interface to use in the subject editor tool
    * It will also save the state to the localstorage for later use
    * @param {string} data.mode - should be "build" "link" ...
    * @return {void}
    */
    subjectEditorMode ({ commit }, data) {    
      commit('SUBJECTEDITORMODE', data.mode)    
      localStorage.setItem('bfeSettingsSubjectBuildMode',data.mode)
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
      localStorage.setItem('bfeSettingsLookupsUseTextSubjectEditor',data.settingsLookupsUseTextSubjectEditor)
    },


    // use which layout
    settingsDisplayMode({ commit}, data){
      commit('SETTINGSDISPLAYMODE', data.settingsDisplayMode)
      localStorage.setItem('bfeSettingsDisplayMode',data.settingsDisplayMode)
    },

    settingsHideEmptyFields({ commit}, data){
      commit('SETTINGSHIDEEMPTYFIELDS', data.settingsHideEmptyFields)
      localStorage.setItem('bfeSettingsHideEmptyFields',data.settingsHideEmptyFields)
    },


    settingsLeftMenuEnriched({ commit}, data){
      commit('SETTINGSLEFTMENUENRICHED', data.settingsLeftMenuEnriched)
      localStorage.setItem('bfeSettingsLeftMenuEnriched',data.settingsLeftMenuEnriched)
    },


    setTreatLikeNoteFields({ commit}, data){
      commit('TREATLIKENOTEFIELDS', data.fields)
      localStorage.setItem('bfeTreatLikeNoteFields',data.fields)
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

      let results

      if (state.workingOnMiniProfile){
        results = await parseProfile.setValueSimple(state.activeProfileMini, data.ptGuid, data.parentURI, data.URI, data.valueURI, data.valueLabel)
        commit('ACTIVEPROFILEMINI', results.currentState)
      }else{
        results = await parseProfile.setValueSimple(state.activeProfile, data.ptGuid, data.parentURI, data.URI, data.valueURI, data.valueLabel)
        commit('ACTIVEPROFILE', results.currentState)
        commit('ACTIVEEDITCOUNTER')    
        commit('ACTIVERECORDSAVED', false)
        state.saveRecord(state,commit)
      }

      return results.newData

    },

    async setValueLiteral ({ commit, state }, data) {   
      console.log('-----------setValueLiteral-----------')
      console.log(data)
      console.log('-----------setValueLiteral-----------')
      let results

      if (state.workingOnMiniProfile){
        results = await parseProfile.setValueLiteral(state.activeProfileMini, data.ptGuid, data.guid, data.parentURI, data.URI, data.value)
        
        results.currentState = parseProfile.rebuildHubURI(results.currentState)

        commit('ACTIVEPROFILEMINI', results.currentState)
      }else{
        results = await parseProfile.setValueLiteral(state.activeProfile, data.ptGuid, data.guid, data.parentURI, data.URI, data.value)
        
        console.log('HEREEEEE',results)
        results.currentState = parseProfile.rebuildHubURI(results.currentState)

        commit('ACTIVEPROFILE', results.currentState)
        commit('ACTIVEEDITCOUNTER')    
        commit('ACTIVERECORDSAVED', false)

        console.log('doing set literal value ', JSON.parse(JSON.stringify(results)))



        state.saveRecord(state,commit)
      }


      return results.newGuid
    },


    async refTemplateChange ({ commit, state }, data) {   

      let nap = parseProfile.refTemplateChange(state.activeProfile, data.profileComponet, data.structure.propertyURI,  state.activeProfileName, data.template, data.parentId, data.thisRef, data.nextRef)
      commit('ACTIVEPROFILE', nap)    


    },





    returnDiagramMiniMap ({ commit, state }) {   
      let mini = parseProfile.returnDiagramMiniMap(state.activeProfile)
      commit('DIAGRAMMINIMAP', mini)    
    },



    setSubjectList ({ commit, state }) {   
      let list = parseProfile.returnSubjectList(state.activeProfile)
      console.log(list)
      commit('SUBJECTLIST', list)    


     
    },



    async setSupportedRomanizations ({ commit }) {   
    


      let supportedRomanizations = await lookupUtil.supportedRomanizations() 
      console.log('supportedRomanizations',supportedRomanizations)
      commit('SUPORTEDROMANIZATIONS', supportedRomanizations)    
     
    },

 








    cloneInstance ({ commit, state }, data) {    
      let nap = parseProfile.cloneInstance(state.activeProfile, data.uri)
      commit('ACTIVEPROFILE', nap)   

      let mini = parseProfile.returnDiagramMiniMap(nap)
      commit('DIAGRAMMINIMAP', mini)    

    },






    addInstance ({ commit, state }) {    
      let nap = parseProfile.addInstance(state.activeProfile)
      nap = parseProfile.reorderRTOrder(nap)
      commit('ACTIVEPROFILE', nap)   
      

      let mini = parseProfile.returnDiagramMiniMap(nap)
      commit('DIAGRAMMINIMAP', mini)    


    },
    deleteInstance ({ commit, state }, data) {    
      let nap = parseProfile.deleteInstance(state.activeProfile, data.uri)
      nap = parseProfile.reorderRTOrder(nap)
      commit('ACTIVEPROFILE', nap)   

      let mini = parseProfile.returnDiagramMiniMap(nap)
      commit('DIAGRAMMINIMAP', mini)    


    },
    deleteItem ({ commit, state }, data) {    
      let nap = parseProfile.deleteItem(state.activeProfile, data.uri)
      nap = parseProfile.reorderRTOrder(nap)
      commit('ACTIVEPROFILE', nap)   


      let mini = parseProfile.returnDiagramMiniMap(nap)
      commit('DIAGRAMMINIMAP', mini)    

    },
    duplicateItem ({ commit, state }, data) {    
      let nap = parseProfile.duplicateItem(state.activeProfile, data.uri)
      nap = parseProfile.reorderRTOrder(nap)
      commit('ACTIVEPROFILE', nap)   

      let mini = parseProfile.returnDiagramMiniMap(nap)
      commit('DIAGRAMMINIMAP', mini)    


    },
    

    addItem ({ commit, state }, data) {    
      let nap = parseProfile.addItem(state.activeProfile, data.uri)
      nap = parseProfile.reorderRTOrder(nap)
      commit('ACTIVEPROFILE', nap)   

      let mini = parseProfile.returnDiagramMiniMap(nap)
      commit('DIAGRAMMINIMAP', mini)    
      console.log('mini',mini)

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



    sendToInstance: ({commit, state}, data) => {
      let newProfile = parseProfile.sendToInstance(data.from,data.to,state.activeProfile)
      commit('ACTIVEPROFILE', newProfile)    
      state.saveRecord(state,commit)
    },



    restoreProperty: ({commit, state}, data) => {
      let newProfile = parseProfile.restoreProperty(data.id,data.profile,state.activeProfile)
      commit('ACTIVEPROFILE', newProfile)    
    },


    async duplicateProperty ({commit, state}, data) {

      if (state.workingOnMiniProfile){

        let newProfile = parseProfile.duplicateProperty(data.id,data.profile,state.activeProfileMini)
        commit('ACTIVEPROFILEMINI', newProfile) 
        // state.saveRecord(state,commit)

      }else{
        console.log(data.dupeData)
        let newProfile = parseProfile.duplicateProperty(data.id,data.profile,state.activeProfile,data.dupeData)
        commit('ACTIVEPROFILE', newProfile) 

        state.saveRecord(state,commit)


      }

    },



    /**
    * Add a favorite method to the loadResourceFavorites state
    * It will also save the state to the localstorage for later use
    * @param {string} data.type - the type of favorite either "profile" or "template"
    * @param {string} data.name - the name of the profile or template
    * @param {string} data.label - the display label to use
    * @return {void}
    */
    addLoadResourceFavorite: ({commit, state}, data) => {
        
      let currentFavorites = JSON.parse(JSON.stringify(state.loadResourceFavorites)) 
      // if it doesn't have it addd it
      if (currentFavorites.filter((cf)=>{ return (cf.type === data.type && cf.name === data.name)}).length==0){
        currentFavorites.push({
          type: data.type,
          name: data.name,
          label: data.label
        })
      }
      commit('LOADRESOURCEFAVORITES', currentFavorites)
      localStorage.setItem('bfeLoadResourceFavorites',JSON.stringify(currentFavorites))
    
    },


    /**
    * remove a favorite method to the loadResourceFavorites state
    * It will also save the state to the localstorage for later use
    * @param {string} data.type - the type of favorite either "profile" or "template"
    * @param {string} data.name - the name of the profile or template
    * @return {void}
    */
    removeLoadResourceFavorite: ({commit, state}, data) => {
        
      let currentFavorites = JSON.parse(JSON.stringify(state.loadResourceFavorites)).filter((cf)=>{ return (`${cf.name}${cf.type}` != `${data.name}${data.type}`)}) 


      commit('LOADRESOURCEFAVORITES', currentFavorites)
      localStorage.setItem('bfeLoadResourceFavorites',JSON.stringify(currentFavorites))
    },




























  },
  modules: {}
});
