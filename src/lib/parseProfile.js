import config from "./config"
import lookupUtil from "./lookupUtil";

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

const parseProfile = {

    profileSource: {},
    rtLookup: {},
    profiles: {},
    startingPoints: {},
    startingPointData: {},
    // startingPointsData: null,

    // fetches the profile data from supplied URL or from the config URL if empty
    fetchProfiles: async function(url) {
      url = url || config.returnUrls().profiles
      try{
        let response = await fetch(url);
        let data =  await response.json()
        return  data;

      }catch(err){
        console.error(err);

        // Handle errors here
      }
    },

    fetchStartingPoints: async function(url) {
      url = url || config.returnUrls().starting
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
        this.startingPointData = await this.fetchStartingPoints()

        // TEMP HACK, striping RDA fields for some things for the new editor
        for (let p of this.profileSource){
            
            if (p.json.Profile.id == 'lc:profile:bf2:Agents:Attributes'){

                for (let rt of p.json.Profile.resourceTemplates){
                    if (['lc:RT:bf2:Agent:Person','lc:RT:bf2:Agent:Family','lc:RT:bf2:Agent:CorporateBody','lc:RT:bf2:Agent:Conference','lc:RT:bf2:Agent:Jurisdiction'].indexOf(rt.id)>-1){
                        rt.propertyTemplates = [rt.propertyTemplates[0]]
                    }
                }

            }

            
            // remove certine properties from the RTs
            p.json.Profile.resourceTemplates = p.json.Profile.resourceTemplates.filter((rt)=>{

                rt.propertyTemplates = rt.propertyTemplates.filter((pt)=>{

                    

                    if (pt.propertyLabel.startsWith('Input RDA relationship designator ter') ||
                        pt.propertyLabel.startsWith('Input Geographic Coverage (if not on list)')){
                        return false
                    }else{
                        return true
                    }
                })




                if (rt){
                    return true
                }


            })

            // modify specific PT values
            for (let rt of p.json.Profile.resourceTemplates){


                // modify the subject headings to match the new editor
                if (rt.id == 'lc:RT:bf2:Components'){
                    for (let pt of rt.propertyTemplates){
                        pt.valueConstraint.valueTemplateRefs = pt.valueConstraint.valueTemplateRefs.filter((ref)=>{if (ref == 'lc:RT:bf2:Topic:madsTopic'){ return true}})
                    }
                }        
                if (rt.id == 'lc:RT:bf2:Topic:Place:Components'){                    
                    for (let pt of rt.propertyTemplates){
                        pt.valueConstraint.valueTemplateRefs = pt.valueConstraint.valueTemplateRefs.filter((ref)=>{if (ref == 'lc:RT:bf2:Topic:madsGeogHeading'){ return true}})
                    }
                }   
                if (rt.id == 'lc:RT:bf2:Topic:Childrens:Components'){                    
                    for (let pt of rt.propertyTemplates){
                        pt.valueConstraint.valueTemplateRefs = pt.valueConstraint.valueTemplateRefs.filter((ref)=>{if (ref == 'lc:RT:bf2:Topic:Childrens:Topic'){ return true}})
                    }
                }   

                // if (['lc:RT:bf2:RelatedWork','lc:RT:bf2:RelatedExpression','lc:RT:bf2:RelatedInstance'].indexOf(rt.id)>-1){
                //     for (let pt of rt.propertyTemplates){                        
                //     }
                // }

                if (rt.id == 'lc:RT:bf2:Brief:Work'){                    
                    rt.propertyTemplates = [
                            {
                                "mandatory": "false",
                                "propertyLabel": "Lookup",
                                "propertyURI": "http://id.loc.gov/ontologies/bibframe/Work",
                                "repeatable": "true",
                                "resourceTemplates": [],
                                "type": "lookup",
                                "valueConstraint": {
                                    "defaults": [],
                                    "useValuesFrom": [
                                        "https://preprod-8230.id.loc.gov/resources/works"
                                    ],
                                    "valueDataType": {
                                        "dataTypeURI": ""
                                    },
                                    "valueTemplateRefs": []
                                }
                            }]

                }   



                if (rt.id.endsWith('Work')){
                    for (let pt of rt.propertyTemplates){
                        if (pt.propertyURI === 'http://id.loc.gov/ontologies/bibframe/Work'){
                            pt.type = 'literal'
                            pt.propertyLabel = 'Work URI'
                        }
                    }

                   
                }








            }



        }


        // -------- end HACKKCKCKCKCK


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
                                pt.parentId = rt.id
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
        if (Array.isArray(this.startingPointData)){
            this.startingPointData = this.startingPointData[0]
        }
        this.startingPointData.json.forEach((sp)=>{

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
        console.log("profiles:")
        console.log(this.profiles)

        return { profiles: this.profiles, lookup: this.rtLookup, startingPoints: this.startingPoints}
    },


    populateDefaultValuesIntoUserValues: function(profile){


        // loop thorugh the profile being passed and add in the default values to all the userValue property

        for (let rt in profile.rt){

            for (let pt in profile.rt[rt].pt){

                pt = profile.rt[rt].pt[pt]
                
                // if its right there in the PT
                if (pt.valueConstraint.defaults && pt.valueConstraint.defaults.length>0){
                    pt.userValue[pt.propertyURI] = {}
                    if (pt.valueConstraint.defaults[0].defaultLiteral){
                        pt.userValue[pt.propertyURI]['http://www.w3.org/2000/01/rdf-schema#label'] = pt.valueConstraint.defaults[0].defaultLiteral
                    }
                    if (pt.valueConstraint.defaults[0].defaultURI){
                        pt.userValue[pt.propertyURI].URI = pt.valueConstraint.defaults[0].defaultURI
                    }
                }

                // it might be in the reference template, so look at the first one and populate the 
                // default value if it is there, since the first one will be the one on inital display in the editor

                

                if (pt.valueConstraint.valueTemplateRefs && pt.valueConstraint.valueTemplateRefs.length > 0){
                    
                    // does it have reftemplates
                    if (this.rtLookup[pt.valueConstraint.valueTemplateRefs[0]]){
                        // loop through all of the ref templates PTs
                        for (let subpt of this.rtLookup[pt.valueConstraint.valueTemplateRefs[0]].propertyTemplates ){
                            if (subpt.valueConstraint.defaults && subpt.valueConstraint.defaults.length>0){
                                pt.userValue[subpt.propertyURI] = {}
                                if (subpt.valueConstraint.defaults[0].defaultLiteral){
                                    pt.userValue[subpt.propertyURI]['http://www.w3.org/2000/01/rdf-schema#label'] = subpt.valueConstraint.defaults[0].defaultLiteral
                                }
                                if (subpt.valueConstraint.defaults[0].defaultURI){
                                    pt.userValue[subpt.propertyURI].URI = subpt.valueConstraint.defaults[0].defaultURI
                                }
                            }
                        }

                    }



                }


            }
        }


        // console.log('----profile----')
        // console.log(profile)


        return profile



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

        // is this the last pt with this uri and label?
        let lastPtCount = 0
        for (let pt of Object.keys(activeProfile.rt[profile].pt)){
            if (activeProfile.rt[profile].pt[pt].propertyURI == activeProfile.rt[profile].pt[id].propertyURI && activeProfile.rt[profile].pt[pt].propertyLabel == activeProfile.rt[profile].pt[id].propertyLabel )
            lastPtCount++
        }

        if (lastPtCount==1){

            
            let tmp = JSON.parse(JSON.stringify(activeProfile.rt[profile].pt[id]))
            
            // delete the one that is in there
            activeProfile.rt[profile].ptOrder.splice(propertyIndex,1)
            delete activeProfile.rt[profile].pt[id]  

            // add in a new one with deleted flag
            tmp.deleted = true
            activeProfile.rt[profile].ptOrder.push(id)
            activeProfile.rt[profile].pt[id] = tmp
            

        }else{

            activeProfile.rt[profile].ptOrder.splice(propertyIndex,1)
            delete activeProfile.rt[profile].pt[id]  

        }

      
        return(activeProfile)

    },

    restoreProperty: function(id,profile,activeProfile){


        let propertyIndex = activeProfile.rt[profile].ptOrder.indexOf(id)
                
        let tmp = JSON.parse(JSON.stringify(activeProfile.rt[profile].pt[id]))
        
        // delete the one that is in there
        activeProfile.rt[profile].ptOrder.splice(propertyIndex,1)
        delete activeProfile.rt[profile].pt[id]  

        // add in a new one with deleted flag
        delete tmp.deleted
        activeProfile.rt[profile].ptOrder.push(id)
        activeProfile.rt[profile].pt[id] = tmp

        return(activeProfile)

    },

    refTemplateChange: function(currentState, component, key, activeProfileName, template, parentId, nextRef){

        console.log('yeet')
        console.log('currentState:',currentState)
        console.log('component:',component)
        console.log('key:',key)
        console.log('activeProfileName:',activeProfileName)
        console.log('template:',template)
        console.log('nextRef:',nextRef)

        console.log('parentId',parentId)
        console.log('parentId',this.rtLookup[parentId])

        if (currentState.rt[activeProfileName].pt[component]){

            console.log('component',currentState.rt[activeProfileName].pt[component])

            // we want to change the @type for sure at least
            // if there is a sameAs then we change it inside the sameAs otherwise just at the top level
            // if (currentState.rt[activeProfileName].pt[component].userValue)
            currentState.rt[activeProfileName].pt[component].userValue['@type'] = nextRef.resourceURI

            // if there are properties in the old template that are not in the new one then we need to remove them from the userValue
            let possibleProperties = nextRef.propertyTemplates.map((p) => {return p.propertyURI})

            // also add in the properties at the parent level, because there could be other pts that are not in this level RT but in the parent's children
            if (this.rtLookup[parentId]){
                possibleProperties =  possibleProperties.concat(this.rtLookup[parentId].propertyTemplates.map((p) => {return p.propertyURI}))
            }

            if (!currentState.rt[activeProfileName].pt[component].refTemplateUserValue){
                currentState.rt[activeProfileName].pt[component].refTemplateUserValue = {}
            }
            console.log("possibleProperties->",possibleProperties)


            for (let key in currentState.rt[activeProfileName].pt[component].userValue){
                if (key != '@type' && !key.includes('sameAs')){
                    if (possibleProperties.indexOf(key)==-1){
                        // console.log(key,'not in possible list')
                        // this property has no place in the ref template we are about to switch to
                        // so store them over in the refTemplateUserValue for later if needed
                        currentState.rt[activeProfileName].pt[component].refTemplateUserValue[key] =JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].userValue[key]))
                        delete currentState.rt[activeProfileName].pt[component].userValue[key]
                    }
                }
            }


            // do the same thing but this time check to see if there are properties in the next refTemplate that matches the ones stored, if so move them over
            for (let pp of possibleProperties){
                if (currentState.rt[activeProfileName].pt[component].refTemplateUserValue[pp]){
                    currentState.rt[activeProfileName].pt[component].userValue[pp]= JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].refTemplateUserValue[pp]))
                    delete currentState.rt[activeProfileName].pt[component].refTemplateUserValue[pp]
                }
            }

        }


        return currentState
    },



    setValue: function(currentState, component, key, activeProfileName, template, value){

        // HACK - need to figure what is going on here
        if (key==='http://id.loc.gov/ontologies/bibframe/Place'){
            key='http://id.loc.gov/ontologies/bibframe/place'
        }

        // loop through the profiles
        // Object.keys(currentState.rt).forEach((rt)=>{
            
            // console.log('currentState:',currentState)
            // console.log('component:',component)
            // console.log('key:',key)
            // console.log('activeProfileName:',activeProfileName)
            // console.log('template:',template)
            // console.log('value:',value)


            // check if this profile has the pt we are looking for
            if (currentState.rt[activeProfileName].pt[component]){

                // is this a lookup entitiy or a literal / simple value
                if (value.contextValue){

                    console.log("Doing entitiy")
                    console.log(currentState, component, key, activeProfileName, template, value)


                    
                    currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs'] = {'http://www.w3.org/2000/01/rdf-schema#label': value.title,URI:value.uri, '@type': value.typeFull, context: value}


                    // is it precoordinated
                    if (value.precoordinated){
                        currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.loc.gov/mads/rdf/v1#componentList'] = []
                        for (let pc of value.precoordinated){                            
                            currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.loc.gov/mads/rdf/v1#componentList'].push({
                                'http://www.w3.org/2000/01/rdf-schema#label': pc.label,
                                '@type': pc.typeFull,
                                'URI': pc.uri
                            })
                        }

                    }

                    //


                    // is it a nested lookup entitiy or a standa alone component
                    // if (template && !template.nested){
                    //     currentState.rt[activeProfileName].pt[component].userValue[key] = {'http://www.w3.org/2000/01/rdf-schema#label': value.title,URI:value.uri, '@type': value.type, context: value}
                    //     currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI
                    // }else if (template && template.nested){
                    //     currentState.rt[activeProfileName].pt[component].userValue[key] = {'http://www.w3.org/2000/01/rdf-schema#label': value.title,URI:value.uri, '@type': value.type, context: value}
                    //     currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI
                        
                    //     // currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI
                    //     // currentState.rt[activeProfileName].pt[component].userValue[currentState.rt[activeProfileName].pt[component].propertyURI] = {literal: value.title,URI:value.uri, '@type': value.type}
                    //     // currentState.rt[activeProfileName].pt[component].userValue.context = value
                    // }
                }else{

                    
                    // are we clearing the state
                    if (typeof value === 'object' && Object.keys(value).length==0){
                        // if (currentState.rt[activeProfileName].pt[component].userValue[key]) delete currentState.rt[activeProfileName].pt[component].userValue[key]                        
                        // if (currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2000/01/rdf-schema#label']) delete currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2000/01/rdf-schema#label'] 
                        // if (currentState.rt[activeProfileName].pt[component].userValue['@type']) delete currentState.rt[activeProfileName].pt[component].userValue['@type'] 
                        // if (currentState.rt[activeProfileName].pt[component].userValue['uri']) delete currentState.rt[activeProfileName].pt[component].userValue['uri'] 

                        if (currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']) delete currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']
                    }else{
                        console.log('here', activeProfileName, component, key, value)

                        // when we a storing a literal we want to store it under the URI of its componet, not just a label, since all properties are co-mingling
                        // bad idea
                        // if (key === 'http://www.w3.org/2000/01/rdf-schema#label'){
                        //     key = currentState.rt[activeProfileName].pt[component].propertyURI
                        // }

                        // notes hit differently
                        if (template.resourceURI == 'http://id.loc.gov/ontologies/bibframe/Note'){
                            
                            // doing a first level note, not a nested note
                            if (currentState.rt[activeProfileName].pt[component].propertyURI == 'http://id.loc.gov/ontologies/bibframe/note'){

                                currentState.rt[activeProfileName].pt[component].userValue[key] = value

                            }else{
                                // doing a bnode
                                if (!currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/note']){
                                    currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/note'] = {'@type':'http://id.loc.gov/ontologies/bibframe/Note'}
                                }
                                currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/note'][key] = value

                            }
                        }else{

                            // get the class/prdicate
                            let keySegment = key.split('/')[key.split('/').length-1]
                            if (keySegment.charAt(0) === keySegment.charAt(0).toUpperCase()){

                                // make the property version of it                                
                                keySegment = setCharAt(keySegment,0,keySegment.charAt(0).toLowerCase())
                                let url = key.split('/')
                                url.splice(url.length-1,1)
                                url.push(keySegment)
                                url = url.join('/')
                                
                                // does it exist in our ontology
                                if (lookupUtil.ontologyPropertyExists(url)){
                                    currentState.rt[activeProfileName].pt[component].userValue[url] = value
                                    // currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI                                    

                                }else{

                                    currentState.rt[activeProfileName].pt[component].userValue[key] = value
                                    currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI                                
                                }

                                

                            }else{
                                currentState.rt[activeProfileName].pt[component].userValue[key] = value
                                currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI                                
                            }


                        }



                    }


                }
                
                

                
                
                
                
                
                
                
                
                
                
            }

        // })

        return currentState
    },


    returnUserValues: function(currentState, component, propertyURI){
        let results = false
        
        Object.keys(currentState.rt).forEach((rt)=>{


            // check if this profile has the pt we are looking for
            if (currentState.rt[rt].pt[component]){


                results = currentState.rt[rt].pt[component].userValue
                console.log('resultsresultsresultsresultsresultsresultsresultsresultsresults')
                console.log(results)
                console.log(propertyURI)
                // console.log("!!!!!!!!!!!!!!!!!!!")
                // console.log(rt)
                // console.log(currentState.rt[rt])
                // console.log(component)
                // console.log(propertyURI)
                // console.log(results)



                // // do some modifications to fit the user data in to the format a complex lookup components will expect
                // console.log("~~~~",currentState.rt[rt].pt[component].userValue,'!!!!!')
                // if (currentState.rt[rt].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']){
                //     console.log('http://www.w3.org/2002/07/owl#sameAs')
                //     console.log('http://www.w3.org/2002/07/owl#sameAs')
                //     console.log('http://www.w3.org/2002/07/owl#sameAs')
                //     console.log('http://www.w3.org/2002/07/owl#sameAs')
                //     console.log('http://www.w3.org/2002/07/owl#sameAs')
                //     console.log('http://www.w3.org/2002/07/owl#sameAs')
                //     console.log('http://www.w3.org/2002/07/owl#sameAs')
                //     results = currentState.rt[rt].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']

                // }else if (results.literal){
                //     results[propertyURI] = {literal: results.literal, URI: results.URI, '@type':results['@type']}
                // }

            }
        })
        console.log(results)
        return results

    },


    returnMetaFromSavedXML: function(xml){


        let parser = new DOMParser();
        xml = parser.parseFromString(xml, "text/xml");

        let voidData = xml.getElementsByTagName('void:DatasetDescription')[0]

        let rts = []

        for (let rt of voidData.getElementsByTagName('lclocal:rtsused')){
            rts.push(rt.innerHTML)
        }

        let eid = null
        for (let el of voidData.getElementsByTagName('lclocal:eid')){
            eid = el.innerHTML
        }

        let status = null
        for (let el of voidData.getElementsByTagName('lclocal:status')){
            status = el.innerHTML
        }

        let profile = null
        for (let el of voidData.getElementsByTagName('lclocal:typeid')){
            profile = el.innerHTML
        }
        let procInfo = null
        for (let el of voidData.getElementsByTagName('lclocal:procinfo')){
            procInfo = el.innerHTML
        }


        voidData.remove()

        xml = (new XMLSerializer()).serializeToString(xml)


        return {
            rts:rts,
            xml:xml,
            eid: eid,
            status:status,
            profile:profile,
            procInfo:procInfo

        }
    }

}



export default parseProfile;


