import config from "./config"


const parseProfile = {

    profileSource: {},
    rtLookup: {},
    profiles: {},
    startingPoints: {},

    // fetches the profile data from supplied URL or from the config URL if empty
    fetchProfiles: async function(url) {
      url = url || config.profileUrl
      try{
        let response = await fetch(url);
        let data =  await response.json()
        return  data;

      }catch(err){
        console.error(err);

        // Handle errors here
      }
    },

    // builds the lookup structure for the profiles
    buildProfiles: async function(){

        // save the profile data, wait for the promise to resolve 
        this.profileSource = await this.fetchProfiles()


        console.log(this.profileSource ,'this.profileSource ')

        // TEMP HACK, striping RDA fields for some things for the new editor
        for (let p of this.profileSource){
            // console.log("p",p.json.Profile)
            if (p.json.Profile.id == 'lc:profile:bf2:Agents:Attributes'){

                for (let rt of p.json.Profile.resourceTemplates){
                    if (['lc:RT:bf2:Agent:Person','lc:RT:bf2:Agent:Family','lc:RT:bf2:Agent:CorporateBody','lc:RT:bf2:Agent:Conference','lc:RT:bf2:Agent:Jurisdiction'].indexOf(rt.id)>-1){
                        rt.propertyTemplates = [rt.propertyTemplates[0]]
                    }
                }

            }
        }


        this.profileSource.forEach((p)=>{

            // build the first level profiles
            if (p.json && p.json.Profile){
                // for example monograph -> work
                this.profiles[p.json.Profile.id] = {
                    rtOrder: [],
                    rt: {},
                    id: p.json.Profile.id
                }
                // now make obj of all the properties in each top level
                // for example monograph -> work -> title
                if (p.json.Profile.resourceTemplates){
                    p.json.Profile.resourceTemplates.forEach((rt)=>{
                        this.profiles[p.json.Profile.id].rtOrder.push(rt.id)
                        this.profiles[p.json.Profile.id].rt[rt.id] = {ptOrder:[],pt:{}}
                        if (rt.propertyTemplates){
                            rt.propertyTemplates.forEach((pt)=>{
                                pt.parent = p.json.Profile.id + rt.id + p.id
                                pt.userValue =  {}
                                let key = pt.propertyURI + '|' + ((pt.propertyLabel) ? pt.propertyLabel : "plabel")
                                this.profiles[p.json.Profile.id].rt[rt.id].ptOrder.push(key)
                                this.profiles[p.json.Profile.id].rt[rt.id].pt[key] = pt
                            })
                        }
                    })
                }
            }

            // loop through each profile and extract the resource template, save them as their own look up for later use
            if (p.json && p.json.Profile && p.json.Profile.resourceTemplates){
                p.json.Profile.resourceTemplates.forEach((rt)=>{
                    this.rtLookup[rt.id] = rt
                })
            }
        })

        // make a copy of the obj to cut refs to the orginal
        // this.profiles = Object.assign({}, this.profiles)
        this.profiles = JSON.parse(JSON.stringify(this.profiles))


        // make a lookup for just the profiles rts
        let plookup = {}
        for (let p of Object.keys(this.profiles)){
            this.profiles[p].rtOrder.forEach((rtname)=>{
                plookup[rtname] = this.profiles[p].rt[rtname]
            })
        }

        // we have starting points, generate those profiles based on their requirements
        // this is just converting the format of the old BFE starting points format
        config.startingPoint.json.forEach((sp)=>{

            this.startingPoints[sp.menuGroup] = {name:sp.menuGroup, work: null, instance: null, item: null }
            sp.menuItems.forEach((mi)=>{

                if (mi.type.indexOf('http://id.loc.gov/ontologies/bibframe/Instance')){
                    this.startingPoints[sp.menuGroup].instance = mi.useResourceTemplates[0]
                }
                if (mi.type.indexOf('http://id.loc.gov/ontologies/bibframe/Work')){
                    this.startingPoints[sp.menuGroup].work = mi.useResourceTemplates[0]
                }
                if (mi.type.indexOf('http://id.loc.gov/ontologies/bibframe/Item')){
                    this.startingPoints[sp.menuGroup].item = mi.useResourceTemplates[0]
                }


            })

            // create a "profile" for this starting point in our profiles
            this.profiles[sp.menuGroup] ={ id: sp.menuGroup, rt: {}, rtOrder : [] }
            if (this.startingPoints[sp.menuGroup].instance){
                this.profiles[sp.menuGroup].rt[this.startingPoints[sp.menuGroup].instance] = plookup[this.startingPoints[sp.menuGroup].instance]
                this.profiles[sp.menuGroup].rtOrder.push(this.startingPoints[sp.menuGroup].instance)
            }

            if (this.startingPoints[sp.menuGroup].work){
                this.profiles[sp.menuGroup].rt[this.startingPoints[sp.menuGroup].work] = plookup[this.startingPoints[sp.menuGroup].work]
                this.profiles[sp.menuGroup].rtOrder.push(this.startingPoints[sp.menuGroup].work)
            }

        })


        console.log(this.rtLookup)

        return { profiles: this.profiles, lookup: this.rtLookup, startingPoints: this.startingPoints}
    },


    duplicateProperty: function(id,profile,activeProfile){

        let propertyIndex = activeProfile.rt[profile].ptOrder.indexOf(id)
        let newPropertyId = id + '|'+ (+ new Date())

        // insert the new property id
        activeProfile.rt[profile].ptOrder.splice(propertyIndex+1, 0, newPropertyId);

        // activeProfile.rt[profile].pt[newPropertyId] = Object.assign({},activeProfile.rt[profile].pt[id])
        activeProfile.rt[profile].pt[newPropertyId] = JSON.parse(JSON.stringify(activeProfile.rt[profile].pt[id]))

        activeProfile.rt[profile].pt[newPropertyId].userValue = {}

        // just does a little yellow flash animation
        setTimeout(()=>{
            document.getElementById(profile+'|'+newPropertyId).style.backgroundColor="yellow"    
            document.getElementById(profile+'|'+newPropertyId).scrollIntoView({ behavior: 'smooth', block: 'center' })
            setTimeout(()=>{
                document.getElementById(profile+'|'+newPropertyId).style.removeProperty('background-color');       
            },500)                    
        },0)

        return(activeProfile)

    },

    removeProperty: function(id,profile,activeProfile){
        let propertyIndex = activeProfile.rt[profile].ptOrder.indexOf(id)
        activeProfile.rt[profile].ptOrder.splice(propertyIndex,1)
        delete activeProfile.rt[profile].pt[id]        
        return(activeProfile)

    },


    setValue: function(currentState, component, key, activeProfileName, template, value){

        // loop through the profiles
        // Object.keys(currentState.rt).forEach((rt)=>{
            // console.log(activeProfileName,"!!!!")
            // console.log(template,'templatetemplatetemplatetemplatetemplatetemplate')
            // check if this profile has the pt we are looking for
            if (currentState.rt[activeProfileName].pt[component]){

                // is this a lookup entitiy or a literal / simple value
                if (value.contextValue){

                    // is it a nested lookup entitiy or a standa alone component
                    if (template && !template.nested){
                        currentState.rt[activeProfileName].pt[component].userValue[key] = {literal: value.title,URI:value.uri, '@type': value.type, context: value}
                        currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI
                    }else if (template && template.nested){
                        currentState.rt[activeProfileName].pt[component].userValue[key] = {literal: value.title,URI:value.uri, '@type': value.type, context: value}
                        currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI
                        // console.log('valuevaluevaluevaluevaluevalue',value)      
                        // currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI
                        // currentState.rt[activeProfileName].pt[component].userValue[currentState.rt[activeProfileName].pt[component].propertyURI] = {literal: value.title,URI:value.uri, '@type': value.type}
                        // currentState.rt[activeProfileName].pt[component].userValue.context = value
                    }
                }else{


                    // are we clearing the state
                    if (typeof value === 'object' && Object.keys(value).length==0){
                        if (currentState.rt[activeProfileName].pt[component].userValue[key]) delete currentState.rt[activeProfileName].pt[component].userValue[key]                        
                        if (currentState.rt[activeProfileName].pt[component].userValue['literal']) delete currentState.rt[activeProfileName].pt[component].userValue['literal'] 
                        if (currentState.rt[activeProfileName].pt[component].userValue['@type']) delete currentState.rt[activeProfileName].pt[component].userValue['@type'] 
                        if (currentState.rt[activeProfileName].pt[component].userValue['uri']) delete currentState.rt[activeProfileName].pt[component].userValue['uri'] 

                    }else{
                        currentState.rt[activeProfileName].pt[component].userValue[key] = value
                        currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI

                    }


                }
                
                

                // console.log(currentState.rt[activeProfileName].pt[component])
                // console.log(currentState.rt[activeProfileName].pt)
                // console.log(value, Object.keys(value))
                // console.log(currentState,'currentState')
                // console.log(component,'component')
                // console.log(currentState.rt[activeProfileName].pt[component].userValue[key])
                // console.log(key,'key')
                // console.log(currentState.rt[activeProfileName].pt[component].userValue)
                // console.log(activeProfileName,'activeProfileName')
                // console.log("^^^^^^^^^^^^^^^^")
            }

        // })

        return currentState
    },


    returnUserValues: function(currentState, component, propertyURI){
        let results = false
        // console.log(currentState,component)
        Object.keys(currentState.rt).forEach((rt)=>{
            // check if this profile has the pt we are looking for
            if (currentState.rt[rt].pt[component]){
                results = currentState.rt[rt].pt[component].userValue

                // do some modifications to fit the user data in to the format a complex lookup components will expect
                // console.log("zzzzzzzzzz")
                // console.log(propertyURI)
                // console.log(results)
                // console.log("zzzzzzzzzz")
                if (results.literal){
                    results[propertyURI] = {literal: results.literal, URI: results.URI, '@type':results['@type']}
                }

            }
        })
        return results
    }

}



export default parseProfile;


