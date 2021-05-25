import config from "./config"
// import lookupUtil from "./lookupUtil";
import exportXML from "./exportXML"


const short = require('short-uuid');
const decimalTranslator = short("0123456789");


// function setCharAt(str,index,chr) {
//     if(index > str.length-1) return str;
//     return str.substring(0,index) + chr + str.substring(index+1);
// }

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


            // p.json.Profile.resourceTemplates.filter((rt)=>{




            // })



            // for (let rt in p.json.Profile.resourceTemplates){
                
            //     rt = p.json.Profile.resourceTemplates[rt]




            //     for (let pt in rt.propertyTemplates){


            //         pt = rt.propertyTemplates[pt]


            //     }
            // }

            
            // remove certin properties from the RTs
            p.json.Profile.resourceTemplates = p.json.Profile.resourceTemplates.filter((rt)=>{
                rt.propertyTemplates = rt.propertyTemplates.filter((pt)=>{
                    if (pt.propertyLabel.startsWith('Input RDA relationship designator ter') ||
                        pt.propertyLabel.startsWith('Input Geographic Coverage (if not on list)')){
                        return false
                    }

                    if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/adminMetadata'){
                        return false
                    }

                    return true
                })

                if (rt){
                    return true
                }


            })

            // modify specific PT values
            for (let rt of p.json.Profile.resourceTemplates){



                if (config.profileHacks.profileParseFixLowerCaseContribution.enabled){
                    if (rt.id === 'lc:RT:bf2:Agents:contribution'){
                        rt.id = 'lc:RT:bf2:Agents:Contribution'
                    }
                }

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



                // if (rt.id.includes(':Work')){
                //     for (let pt of rt.propertyTemplates){
                //         if (pt.propertyURI === 'http://id.loc.gov/ontologies/bibframe/Work'){
                //             pt.type = 'literal'
                //             pt.propertyLabel = 'Work URI'
                //         }
                //     }

                   
                // }

                // add wikidata into any NAF lookup pt
                if (rt.id.includes(':Agent')){
                    for (let pt of rt.propertyTemplates){
                        if (pt.valueConstraint.useValuesFrom.indexOf('http://preprod.id.loc.gov/authorities/names')>-1){
                            if (pt.valueConstraint.useValuesFrom.indexOf('https://www.wikidata.org/w/api.php')==-1){
                                pt.valueConstraint.useValuesFrom.push('https://www.wikidata.org/w/api.php')
                            }
                        }
                    }                   
                }          




                for (let pt of rt.propertyTemplates){

                    if (config.profileHacks.profileParseFixPropertyURIWhenUpperCase.enabled){

                        // something to think about...?
                        if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Role'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/role'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Frequency'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/frequency'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/ProductionMethod'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/productionMethod'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/GrooveCharacteristic'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/soundCharacteristic'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/MusicNotation'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/notation'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bflc/Relation'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bflc/relation'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Scale'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/scale'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Frequency'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/frequency'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Place'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/place'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Illustration'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/illustrativeContent'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/PlaybackChannels'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/soundCharacteristic'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/RecordingMethod'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/soundCharacteristic'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/BroadcastStandard'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/videoCharacteristic'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bflc/CaptureStorage'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bflc/captureStorage'

                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/ColorContent'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/colorContent'

                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/ColorContent'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/colorContent'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/EncodingFormat'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/digitalCharacteristic'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/FileType'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/digitalCharacteristic'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/IntendedAudience'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/intendedAudience'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/PresentationFormat'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/projectionCharacteristic'

                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Language'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/language'
                        }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bibframe/SupplementaryContent'){
                            pt.propertyURI = 'http://id.loc.gov/ontologies/bibframe/supplementaryContent'

                        }

                        // others?
                        // "propertyURI": "http://id.loc.gov/ontologies/bflc/MovingImageTechnique",
                        // "propertyURI": "http://id.loc.gov/ontologies/bibframe/Generation",
                        // "propertyURI": "http://id.loc.gov/ontologies/bibframe/RecordingMedium",
                        // "propertyURI": "http://id.loc.gov/ontologies/bibframe/RegionalEncoding",
                        // "propertyURI": "http://id.loc.gov/ontologies/bibframe/SoundContent",
                        // "propertyURI": "http://id.loc.gov/ontologies/bibframe/PlaybackCharacteristic",
                        // "propertyURI": "http://id.loc.gov/ontologies/bibframe/MusicInstrument",
                        // "propertyURI": "http://id.loc.gov/ontologies/bibframe/MusicVoice",
                        // "propertyURI": "http://id.loc.gov/ontologies/bibframe/MusicEnsemble",
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
                                pt.userValue =  {'@root':pt.propertyURI}
                                pt.valueConstraint.valueTemplateRefs = pt.valueConstraint.valueTemplateRefs.filter((v)=>{return (v.length>0)})
                                pt['@guid'] = short.generate()
                                

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


        
        
        

        return { profiles: this.profiles, lookup: this.rtLookup, startingPoints: this.startingPoints}
    },


    populateDefaultValuesIntoUserValues: function(profile){


        // loop thorugh the profile being passed and add in the default values to all the userValue property

        for (let rt in profile.rt){

            for (let pt in profile.rt[rt].pt){

                pt = profile.rt[rt].pt[pt]
                
                // if its right there in the PT
                if (pt.valueConstraint.defaults && pt.valueConstraint.defaults.length>0){
                    pt.userValue['@guid'] = short.generate()
                    // its the root level property uri
                    if (pt.propertyURI == pt.userValue['@root']){
                        
                        if (pt.valueConstraint.defaults[0].defaultLiteral){
                            pt.userValue['http://www.w3.org/2000/01/rdf-schema#label'] = [{
                                '@guid': short.generate(),
                                'http://www.w3.org/2000/01/rdf-schema#label':pt.valueConstraint.defaults[0].defaultLiteral
                            }]
                        }
                        if (pt.valueConstraint.defaults[0].defaultURI){
                            pt.userValue['@id'] = pt.valueConstraint.defaults[0].defaultURI
                        }                        
                    }else{


                        if (pt.valueConstraint.defaults[0].defaultLiteral){

                            pt.userValue[pt.propertyURI]= [{
                                '@guid': short.generate(),
                                'http://www.w3.org/2000/01/rdf-schema#label': [
                                    {
                                        'http://www.w3.org/2000/01/rdf-schema#label':pt.valueConstraint.defaults[0].defaultLiteral,
                                        '@guid': short.generate(),
                                    }
                                ]
                                
                            }]
                        }

                        if (pt.valueConstraint.defaults[0].defaultURI){
                            pt.userValue[pt.propertyURI]['@id'] = pt.valueConstraint.defaults[0].defaultURI
                        }      




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


                                if (subpt.propertyURI == pt.userValue['@root']){
                                    
                                    if (subpt.valueConstraint.defaults[0].defaultLiteral){
                                        pt.userValue['http://www.w3.org/2000/01/rdf-schema#label'] = [{
                                            '@guid': short.generate(),
                                            'http://www.w3.org/2000/01/rdf-schema#label':subpt.valueConstraint.defaults[0].defaultLiteral
                                        }]
                                    }
                                    if (subpt.valueConstraint.defaults[0].defaultURI){
                                        pt.userValue['@id'] = subpt.valueConstraint.defaults[0].defaultURI
                                    }                

                                }else{


                                    if (subpt.valueConstraint.defaults[0].defaultLiteral){

                                        pt.userValue[subpt.propertyURI]= [{
                                            '@guid': short.generate(),
                                            'http://www.w3.org/2000/01/rdf-schema#label': [
                                                {
                                                    'http://www.w3.org/2000/01/rdf-schema#label':subpt.valueConstraint.defaults[0].defaultLiteral,
                                                    '@guid': short.generate(),
                                                }
                                            ]
                                            
                                        }]
                                    }

                                    if (subpt.valueConstraint.defaults[0].defaultURI){
                                        if (pt.userValue[subpt.propertyURI][0]){
                                            pt.userValue[subpt.propertyURI][0]['@id'] = subpt.valueConstraint.defaults[0].defaultURI    
                                        }
                                        
                                    }      




                                }






                                // pt.userValue[subpt.propertyURI] = {}
                                // if (subpt.valueConstraint.defaults[0].defaultLiteral){
                                //     pt.userValue[subpt.propertyURI]['http://www.w3.org/2000/01/rdf-schema#label'] = subpt.valueConstraint.defaults[0].defaultLiteral
                                // }
                                // if (subpt.valueConstraint.defaults[0].defaultURI){
                                //     pt.userValue[subpt.propertyURI].URI = subpt.valueConstraint.defaults[0].defaultURI
                                // }
                           

                            }
                        }

                    }



                }


            }
        }


        // 
        // 


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
        activeProfile.rt[profile].pt[newPropertyId]['@guid'] = short.generate()

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

    refTemplateChange: function(currentState, component, key, activeProfileName, template, parentId, thisRef, nextRef){

        if (currentState.rt[activeProfileName].pt[component]){

            // keep track at the top level what is the active type for this template
            currentState.rt[activeProfileName].pt[component].activeType = nextRef.resourceURI
            
            // if the @type is stored at the root level change it otherwise it lives in the /agent or /subject or whatever
            // change it there
            if (key == currentState.rt[activeProfileName].pt[component].propertyURI){

                currentState.rt[activeProfileName].pt[component].userValue['@type'] = nextRef.resourceURI

            }else{
                // we need to change it in whatever its stored
                if (currentState.rt[activeProfileName].pt[component].userValue[key] && currentState.rt[activeProfileName].pt[component].userValue[key][0] && currentState.rt[activeProfileName].pt[component].userValue[key][0]['@type']){
                    currentState.rt[activeProfileName].pt[component].userValue[key][0]['@type'] = nextRef.resourceURI
                }
            }


            // store the other properies as well
            if (!currentState.rt[activeProfileName].pt[component].refTemplateUserValueKeys){
                currentState.rt[activeProfileName].pt[component].refTemplateUserValueKeys = {}
            }

            if (!currentState.rt[activeProfileName].pt[component].refTemplateUserValueKeys[thisRef.id]){
                currentState.rt[activeProfileName].pt[component].refTemplateUserValueKeys[thisRef.id] = []
            }

            for (let key in currentState.rt[activeProfileName].pt[component].userValue){
                if (!key.startsWith('@')){
                    currentState.rt[activeProfileName].pt[component].refTemplateUserValueKeys[thisRef.id].push(key)
                }
            }


            // if there are properties in the old template that are not in the new one then we need to remove them from the userValue
            let possibleProperties = nextRef.propertyTemplates.map((p) => {return p.propertyURI})

            if (currentState.rt[activeProfileName].pt[component].refTemplateUserValueKeys[thisRef.id]){
                currentState.rt[activeProfileName].pt[component].refTemplateUserValueKeys[thisRef.id].forEach((k)=>{
                    if (possibleProperties.indexOf(k)==-1){
                        possibleProperties.push(k)
                    }
                })
            }            


            // also add in the properties at the parent level, because there could be other pts that are not in this level RT but in the parent's children
            
            if (!parentId.includes(":Work") && !parentId.includes(":Instance") && !parentId.includes(":Item")){
                if (this.rtLookup[parentId]){
                    possibleProperties =  possibleProperties.concat(this.rtLookup[parentId].propertyTemplates.map((p) => {return p.propertyURI}))
                }
            }


            if (!currentState.rt[activeProfileName].pt[component].refTemplateUserValue){
                currentState.rt[activeProfileName].pt[component].refTemplateUserValue = {}
            }
            
            


            for (let key in currentState.rt[activeProfileName].pt[component].userValue){
                if (!key.startsWith('@')){
                    if (possibleProperties.indexOf(key)==-1){
                        // 
                        // this property has no place in the ref template we are about to switch to
                        // so store them over in the refTemplateUserValue for later if needed
                        currentState.rt[activeProfileName].pt[component].refTemplateUserValue[key] =JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].userValue[key]))
                        delete currentState.rt[activeProfileName].pt[component].userValue[key]
                    }
                }
            }


            // see if there are any properties stored in refTemplateUserValue that 
            // can be filled into this template

            for (let pp of possibleProperties){
                if (currentState.rt[activeProfileName].pt[component].refTemplateUserValue[pp]){
                    currentState.rt[activeProfileName].pt[component].userValue[pp]= JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].refTemplateUserValue[pp]))
                    delete currentState.rt[activeProfileName].pt[component].refTemplateUserValue[pp]
                }

            }
        

        }


        return currentState
    },

    // eslint-disable-next-line
    removeValueSimple: function(currentState, idGuid, labelGuid){
        // find the pt for the value we are editing
        for (let rt in currentState.rt){
            for (let pt in currentState.rt[rt].pt){


                let removed = false

                // the root node is the lookup val, reset the uservale to remove
                if (idGuid != null && currentState.rt[rt].pt[pt].userValue['@guid'] == idGuid){
                    currentState.rt[rt].pt[pt].userValue = {'@root':currentState.rt[rt].pt[pt].propertyURI}
                }else if (idGuid != null) {

                    // search through the properties to see if we have this guid anywhere

                    for (let uvLvl1PropertyName in currentState.rt[rt].pt[pt].userValue){

                        if (Array.isArray(currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName])){

                            let removeIdx = -1
                            let counter = -1
                            for (let childValueObj of currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName]){
                                counter++
                                if (childValueObj['@guid'] && childValueObj['@guid'] == idGuid){
                                    removeIdx = counter
                                    removed = true
                                }
                            }
                            if (removeIdx>-1){
                                currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName].splice(removeIdx,1)
                                // if we removed the only/last one remove the property
                                if (currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName].length==0){
                                    delete currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName]
                                }
                            }
                        }
                    }
                }else if (labelGuid != null) {

                    // search through the properties to see if we have this guid anywhere
                    for (let uvLvl1PropertyName in currentState.rt[rt].pt[pt].userValue){

                        if (Array.isArray(currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName])){

                            let removeIdx = -1
                            let counter = -1
                            for (let childValueObj of currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName]){
                                counter++


                                // look for the label that has that label guid and delte the parent
                                for (let uvLvl2PropertyName in childValueObj){
                                    if (Array.isArray(childValueObj[uvLvl2PropertyName])){

                                        // if it is an array see what guids it has

                                        let guids = childValueObj[uvLvl2PropertyName].map((x)=>{ return x['@guid']})

                                        if (guids.indexOf(labelGuid)>-1){
                                            removeIdx = counter
                                        }
                                    }

                                }

                            }
                            if (removeIdx>-1){
                                currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName].splice(removeIdx,1)
                                // if we removed the only/last one remove the property
                                if (currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName].length==0){
                                    delete currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName]
                                }
                            }



                        }

                    }



                }



                if (removed){
                    break
                }


            }
        }

        return currentState
    },

    setValueSimple: async function(currentState, ptGuid, parentURI, URI, valueURI, valueLabel){

        let results = {newData:{}}

        


        // find the pt for the value we are editing
        for (let rt in currentState.rt){

            for (let pt in currentState.rt[rt].pt){

                if (currentState.rt[rt].pt[pt]['@guid'] == ptGuid){

                    let userValue = currentState.rt[rt].pt[pt].userValue


                    // top level
                    if (currentState.rt[rt].pt[pt].propertyURI == URI){

                        //s

                        let tmpGuid = short.generate()
                        

                        if (valueLabel){

                            if (!userValue['http://www.w3.org/2000/01/rdf-schema#label']){
                                userValue['http://www.w3.org/2000/01/rdf-schema#label'] = []    
                            }else{

                                // if we are adding multi values to the top level simple look up give the 
                                // exporter a little help to know what to do
                                // this is not really a expected behavior ( to add multiple lookups to a top level simple look up but..)
                                if (!userValue['@flags']){
                                    userValue['@flags'] = ['simpleLookupTopLevelMulti']
                                }
                            }
                                                    



                            userValue['http://www.w3.org/2000/01/rdf-schema#label'].push(

                                {
                                    '@guid': tmpGuid,
                                    'http://www.w3.org/2000/01/rdf-schema#label':valueLabel,
                                    '@id': valueURI

                                }

                            )
                            
                        }
                        if (valueURI && !userValue['@id']){
                            userValue['@id'] = valueURI
                        }


                        
                        results.newData = {'guid': tmpGuid, valueLabel: valueLabel, valueURI:valueURI }




                    }else{

                        if (!userValue[URI]){
                            userValue[URI] = []
                        }

                        

                        let newData = {'@guid': short.generate()}

                        newData['@type'] = await exportXML.suggestType(URI)
                        if (valueLabel){
                            newData['http://www.w3.org/2000/01/rdf-schema#label'] = []

                            newData['http://www.w3.org/2000/01/rdf-schema#label'].push(

                                {
                                    '@guid': short.generate(),
                                    'http://www.w3.org/2000/01/rdf-schema#label':valueLabel

                                }

                            )
                            
                        }
                        if (valueURI){
                            newData['@id'] = valueURI
                        }

                        userValue[URI].push(newData)
                        
                        results.newData = {'guid': newData['@guid'], valueLabel: valueLabel, valueURI:valueURI }


                      


                    }

                

                }

                


            }

        }



        results.currentState = currentState

        return results


    },

    // eslint-disable-next-line
    setValueLiteral: async function(currentState, ptGuid, guid, parentURI, URI, value){


        let results = {newGuid:null}
        
        

        // find the pt for the value we are editing
        for (let rt in currentState.rt){

            for (let pt in currentState.rt[rt].pt){
                if (currentState.rt[rt].pt[pt]['@guid'] == ptGuid){

                    
                    let userValue = currentState.rt[rt].pt[pt].userValue



                    if (guid){
                        // it already has a guid, so we are editing an existing value
                        if (parentURI){
                            // if we have the parent URi try to search using both 
                            if (userValue[parentURI]){
                                for (let parentValueArray of userValue[parentURI]){
                                    if (parentValueArray[URI]){          
                                      for (let childValue of parentValueArray[URI]){
                                        if (childValue['@guid'] == guid){
                                            childValue[URI] = value
                                        }
                                      }
                                    }
                                }
                            }else{

                                
                                // just search using the propertyURI
                                if (userValue[URI]){
                                  for (let childValue of userValue[URI]){
                                    if (childValue['@guid'] == guid){
                                        childValue[URI] = value
                                    }
                                  }
                                }

                            }
                        }else{

                            // not nested
                            if (userValue[URI]){
                              for (let childValue of userValue[URI]){
                                if (childValue['@guid'] == guid){
                                    childValue[URI] = value
                                }
                              }
                            }


                        }



                    }else{

                        

                        // we are not editing, we are creating a new node
                        // can we find the uri to use, 

                        let data = {'@guid': short.generate()}

                        results.newGuid = data['@guid']
                        data[URI] = value

                        if (userValue['@root'] == parentURI && !userValue[URI]){
                            //we have no data at all yet
                            
                            
                            userValue[URI] = []
                            userValue[URI].push(data)


                        }else if (userValue['@root'] == parentURI && userValue[URI]){
                            // we have the property created already, just add it to that one
                            userValue[URI].push(data)
                            

                        }else if (userValue['@root'] != parentURI && parentURI && !userValue[parentURI]){
                            // we are using the parent but its not made yet
                            userValue[parentURI] = []
                            let subUri = {'@guid': short.generate()}
                            subUri['@type'] = await exportXML.suggestType(parentURI)

                            subUri[URI] = []
                            subUri[URI].push(data)
                            userValue[parentURI].push(subUri)


                            


                        }else if (userValue['@root'] != parentURI && userValue[parentURI] && userValue[parentURI].length == 1 && !userValue[parentURI][0][URI]){
                            // we are using the parent but the child URI is not made yet
                            userValue[parentURI][0][URI] = []
                            userValue[parentURI][0][URI].push(data)
                            

                        }else if (userValue['@root'] != parentURI && userValue[parentURI] && userValue[parentURI].length == 1 && userValue[parentURI][0][URI]){
                            // everything exists, just add the new value
                            userValue[parentURI][0][URI].push(data)
                            

                        }else if (userValue['@root'] == URI && !userValue[URI]){

                            // no data yet
                            userValue[URI] = []
                            userValue[URI].push(data)



                        }else{

                            console.error('---------------------------------------------')
                            console.error('Cannot find the right place to insert this value')
                            console.error('currentState, ptGuid, guid, parentURI, URI, value')
                            console.error(currentState, ptGuid, guid, parentURI, URI, value)
                            console.error('---------------------------------------------')

                        }
                        



                    }

                    

                    // we found it stop looping
                    break
                }
            }
            
        }        

        results.currentState = currentState

        return results


    },

    setValueComplex: async function(currentState, component, key, activeProfileName, template, value, structure,parentStructure){

            // if it is a top level Work uri don't let them change it
            if (!parentStructure && structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Work'){

                alert("You cannot change the existing URI of this work.")
                return currentState

            }

            let relatedEdgecaseParentProperty = -1

            if (parentStructure){
               relatedEdgecaseParentProperty = ['http://id.loc.gov/ontologies/bibframe/relatedTo','http://id.loc.gov/ontologies/bflc/relation'].indexOf(parentStructure.propertyURI)
            }




            console.log('currentState, component, key, activeProfileName, template, value, structure,parentStructure')
            console.log(currentState, component, key, activeProfileName, template, value, structure,parentStructure)

            // clearing a value works by clearing the context in the store,
            // if it is an empy object then the context was clered before 
            // adding this value, so remove it and break
            if (typeof value === 'object' && Object.keys(value).length==0){
                if (currentState.rt[activeProfileName].pt[component]){
                    // currentState.rt[activeProfileName].pt[component].userValue = {
                    //     '@guid': short.generate(),                        
                    //     '@root': currentState.rt[activeProfileName].pt[component].propertyURI
                    // }

                    // first remove the root @id and @type if its there
                    if (currentState.rt[activeProfileName].pt[component].userValue['@id']){
                       delete currentState.rt[activeProfileName].pt[component].userValue['@id']
                    }
                    if (currentState.rt[activeProfileName].pt[component].userValue['@type']){
                       delete currentState.rt[activeProfileName].pt[component].userValue['@type']
                    }


                    // remove the root property if there
                    if (currentState.rt[activeProfileName].pt[component].userValue[currentState.rt[activeProfileName].pt[component].propertyURI]){
                        delete currentState.rt[activeProfileName].pt[component].userValue[currentState.rt[activeProfileName].pt[component].propertyURI]
                        

                    }
                    if (currentState.rt[activeProfileName].pt[component].userValue[structure.propertyURI]){
                        delete currentState.rt[activeProfileName].pt[component].userValue[structure.propertyURI]
                        

                    }
                    if (currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]){
                        delete currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]
                        
                    }                    



                    // loop through and remove anything that doesn't have a @type, a bnode
                    for (let key in currentState.rt[activeProfileName].pt[component].userValue){
                        if (!key.startsWith('@')){
                            
                            let remove = true
                            if (Array.isArray(currentState.rt[activeProfileName].pt[component].userValue[key])){
                                for (let obj of currentState.rt[activeProfileName].pt[component].userValue[key]){
                                    if (obj['@type']){
                                        remove = false
                                    }
                                }
                            }
                            
                            if (remove){
                                
                                delete currentState.rt[activeProfileName].pt[component].userValue[key]
                            }

                        }
                    }




                }


                return currentState
            }


            
            
            
            
            if (currentState.rt[activeProfileName].pt[component]){
                    
                console.log('>>>>',structure.type, parentStructure)

                // need tofigure out what property to store this under the in the userValue
                if (parentStructure && key == 'http://www.w3.org/2002/07/owl#sameAs' && currentState.rt[activeProfileName].pt[component].propertyURI != parentStructure.propertyURI){
                    console.log('case 1')
                    if (!currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]){
                        currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = []
                    }

                    let userValue = currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]

                    if (value.contextValue){

                        userValue.push({
                            '@guid': short.generate(),
                            '@type': value.typeFull,
                            '@id' : value.uri,
                            '@context': value,
                            'http://www.w3.org/2000/01/rdf-schema#label': [
                                {
                                    'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                                    '@guid': short.generate()
                                }
                            ]
                        })

                    }

                    if (currentState.rt[activeProfileName].pt[component].valueConstraint 
                        && currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType 
                        && currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType.dataTypeURI){
                        currentState.rt[activeProfileName].pt[component].userValue['@type'] = currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType.dataTypeURI
                    }



                    // // make sure we have the @type if this is ref template select component
                    // console.log(currentState.rt[activeProfileName].pt[component].valueConstraint)
                    // console.log(currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs)
                    // console.log(currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs.length)

                    // if (currentState.rt[activeProfileName].pt[component].valueConstraint && currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs && currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs.length > 1){
                    //     console.log('here')
                    //     if (!currentState.rt[activeProfileName].pt[component].activeType){
                    //        currentState.rt[activeProfileName].pt[component].activeType =  this.rtLookup[currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs[0]].resourceURI
                    //     }
                    //     currentState.rt[activeProfileName].pt[component].userValue['@type'] = currentState.rt[activeProfileName].pt[component].activeType
                    // }


                    // console.log(structure)
                    // console.log(structure.valueConstraint)
                    // console.log(structure.valueConstraint.valueTemplateRefs)
                    // console.log(structure.valueConstraint.valueTemplateRefs.length)

                    // // also check at the current level if it is a ref template
                    // if (structure.valueConstraint && structure.valueConstraint.valueTemplateRefs && structure.valueConstraint.valueTemplateRefs.length > 1){
                    //     console.log('here')
                    //     if (!currentState.rt[activeProfileName].pt[component].activeType){
                    //        currentState.rt[activeProfileName].pt[component].activeType =  this.rtLookup[structure.valueConstraint.valueTemplateRefs[0]].resourceURI
                    //     }
                    //     currentState.rt[activeProfileName].pt[component].userValue['@type'] = currentState.rt[activeProfileName].pt[component].activeType
                    // }



                    // if (parentStructure){
                    //     console.log(parentStructure)
                    //     console.log(parentStructure.valueConstraint)
                    //     console.log(parentStructure.valueConstraint.valueTemplateRefs)
                    //     console.log(parentStructure.valueConstraint.valueTemplateRefs.length)

                    //     // also check at the current level if it is a ref template
                    //     if (parentStructure.valueConstraint && parentStructure.valueConstraint.valueTemplateRefs && parentStructure.valueConstraint.valueTemplateRefs.length > 1){
                    //         console.log('here')
                    //         if (!currentState.rt[activeProfileName].pt[component].activeType){
                    //            currentState.rt[activeProfileName].pt[component].activeType =  this.rtLookup[parentStructure.valueConstraint.valueTemplateRefs[0]].resourceURI
                    //         }
                    //         currentState.rt[activeProfileName].pt[component].userValue['@type'] = currentState.rt[activeProfileName].pt[component].activeType
                    //     }
                    // }



                }else if (parentStructure && key == 'http://www.w3.org/2002/07/owl#sameAs' && currentState.rt[activeProfileName].pt[component].propertyURI == parentStructure.propertyURI){
                    console.log('case 2')
                    currentState.rt[activeProfileName].pt[component].userValue = {
                            '@guid': short.generate(),
                            '@type': await exportXML.suggestType(parentStructure.propertyURI),
                            '@id' : value.uri,
                            '@root': parentStructure.propertyURI,
                            '@context': value,
                            'http://www.w3.org/2000/01/rdf-schema#label': [
                                {
                                    'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                                    '@guid': short.generate()
                                }
                            ]
                        }

                }else if (structure.type == 'lookup' && parentStructure && relatedEdgecaseParentProperty > -1){

                    console.log('hurrr Triggerd')
                    // thre are some very nested template, which we are just checking for
                    if (!currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]){
                        currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = []
                    }

                    if (!currentState.rt[activeProfileName].pt[component].userValue['@type']){
                        currentState.rt[activeProfileName].pt[component].userValue['@type'] = await exportXML.suggestType(currentState.rt[activeProfileName].pt[component].propertyURI)
                    }


                    

                    let data = {
                        '@guid': short.generate(),
                        '@type': await exportXML.suggestType(parentStructure.propertyURI),
                        '@id' : value.uri,
                        '@context': value,
                        'http://www.w3.org/2000/01/rdf-schema#label': [
                            {
                                'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                                '@guid': short.generate()
                            }
                        ]           
                    }

                    // we don't want to make bnodes for things like Works in related to stuff
                    if (structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Work' || structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Instance'){
                        delete data['@type']
                        delete data['http://www.w3.org/2000/01/rdf-schema#label']
                    }


                    currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI].push(data)



                }else if (currentState.rt[activeProfileName].pt[component].valueConstraint && currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs && currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs.length > 1){
                    console.log('case 4')
                    // this is ref template, so they select what Type it is from the refTemeplate selector

                    // does it have it set? otherwise we need to set it to the default, first refTempalte
                    if (!currentState.rt[activeProfileName].pt[component].activeType){
                       currentState.rt[activeProfileName].pt[component].activeType =  this.rtLookup[currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs[0]].resourceURI
                    }
                    
                    
                    
                    currentState.rt[activeProfileName].pt[component].userValue = {
                            '@guid': short.generate(),
                            '@type': currentState.rt[activeProfileName].pt[component].activeType,
                            '@id' : value.uri,
                            '@root': currentState.rt[activeProfileName].pt[component].propertyURI,
                            '@context': value,
                            'http://www.w3.org/2000/01/rdf-schema#label': [
                                {
                                    'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                                    '@guid': short.generate()
                                }
                            ]
                        }


                

                
                }else{

                    console.log('ELES Triggerd')

                    // dunno, use the root level
                    currentState.rt[activeProfileName].pt[component].userValue = {
                            '@guid': short.generate(),
                            '@type': await exportXML.suggestType(currentState.rt[activeProfileName].pt[component].propertyURI),
                            '@id' : value.uri,
                            '@root': currentState.rt[activeProfileName].pt[component].propertyURI,
                            '@context': value,
                            'http://www.w3.org/2000/01/rdf-schema#label': [
                                {
                                    'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                                    '@guid': short.generate()
                                }
                            ]
                        }


                    // console.error('---------------------------------------------')
                    // console.error('Cannot gereate userValue for this complext Lookup')
                    // console.error('component, key, activeProfileName, template, value, structure,parentStructure')
                    // console.error(component, key, activeProfileName, template, value, structure,parentStructure)
                    // console.error('---------------------------------------------')


                }



                // is it precoordinated
                if (value.precoordinated){
                    currentState.rt[activeProfileName].pt[component].userValue['http://www.loc.gov/mads/rdf/v1#componentList'] = []
                    for (let pc of value.precoordinated){                            
                        currentState.rt[activeProfileName].pt[component].userValue['http://www.loc.gov/mads/rdf/v1#componentList'].push({
                            'http://www.w3.org/2000/01/rdf-schema#label': [ {'http://www.w3.org/2000/01/rdf-schema#label':pc.label}],
                            '@type': pc.typeFull,
                            '@id': pc.uri
                        })
                    }

                }


            }

            // // check if this profile has the pt we are looking for
            // if (currentState.rt[activeProfileName].pt[component]){

            //     // is this a lookup entitiy or a literal / simple value
            //     if (value.contextValue){
                    
            //         

            //         // currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs'] = {'http://www.w3.org/2000/01/rdf-schema#label': value.title,URI:value.uri, '@type': value.typeFull, context: value}

            //         // // is it precoordinated
            //         // if (value.precoordinated){
            //         //     currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.loc.gov/mads/rdf/v1#componentList'] = []
            //         //     for (let pc of value.precoordinated){                            
            //         //         currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.loc.gov/mads/rdf/v1#componentList'].push({
            //         //             'http://www.w3.org/2000/01/rdf-schema#label': pc.label,
            //         //             '@type': pc.typeFull,
            //         //             'URI': pc.uri
            //         //         })
            //         //     }

            //         // }

            //         //


            //         // is it a nested lookup entitiy or a standa alone component
            //         // if (template && !template.nested){
            //         //     currentState.rt[activeProfileName].pt[component].userValue[key] = {'http://www.w3.org/2000/01/rdf-schema#label': value.title,URI:value.uri, '@type': value.type, context: value}
            //         //     currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI
            //         // }else if (template && template.nested){
            //         //     currentState.rt[activeProfileName].pt[component].userValue[key] = {'http://www.w3.org/2000/01/rdf-schema#label': value.title,URI:value.uri, '@type': value.type, context: value}
            //         //     currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI
                        
            //         //     // currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI
            //         //     // currentState.rt[activeProfileName].pt[component].userValue[currentState.rt[activeProfileName].pt[component].propertyURI] = {literal: value.title,URI:value.uri, '@type': value.type}
            //         //     // currentState.rt[activeProfileName].pt[component].userValue.context = value
            //         // }
            //     }

            //     // else{

                    
            //     //     // are we clearing the state
            //     //     if (typeof value === 'object' && Object.keys(value).length==0){
            //     //         // if (currentState.rt[activeProfileName].pt[component].userValue[key]) delete currentState.rt[activeProfileName].pt[component].userValue[key]                        
            //     //         // if (currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2000/01/rdf-schema#label']) delete currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2000/01/rdf-schema#label'] 
            //     //         // if (currentState.rt[activeProfileName].pt[component].userValue['@type']) delete currentState.rt[activeProfileName].pt[component].userValue['@type'] 
            //     //         // if (currentState.rt[activeProfileName].pt[component].userValue['uri']) delete currentState.rt[activeProfileName].pt[component].userValue['uri'] 

            //     //         if (currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']) delete currentState.rt[activeProfileName].pt[component].userValue['http://www.w3.org/2002/07/owl#sameAs']
            //     //     }else{
                        

            //     //         // when we a storing a literal we want to store it under the URI of its componet, not just a label, since all properties are co-mingling
            //     //         // bad idea
            //     //         // if (key === 'http://www.w3.org/2000/01/rdf-schema#label'){
            //     //         //     key = currentState.rt[activeProfileName].pt[component].propertyURI
            //     //         // }

            //     //         // notes hit differently
            //     //         if (template.resourceURI == 'http://id.loc.gov/ontologies/bibframe/Note'){
                            
            //     //             // doing a first level note, not a nested note
            //     //             if (currentState.rt[activeProfileName].pt[component].propertyURI == 'http://id.loc.gov/ontologies/bibframe/note'){

            //     //                 currentState.rt[activeProfileName].pt[component].userValue[key] = value

            //     //             }else{
            //     //                 // doing a bnode
            //     //                 if (!currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/note']){
            //     //                     currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/note'] = {'@type':'http://id.loc.gov/ontologies/bibframe/Note'}
            //     //                 }
            //     //                 currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/note'][key] = value

            //     //             }
            //     //         }else{

            //     //             // get the class/prdicate
            //     //             let keySegment = key.split('/')[key.split('/').length-1]
            //     //             if (keySegment.charAt(0) === keySegment.charAt(0).toUpperCase()){

            //     //                 // make the property version of it                                
            //     //                 keySegment = setCharAt(keySegment,0,keySegment.charAt(0).toLowerCase())
            //     //                 let url = key.split('/')
            //     //                 url.splice(url.length-1,1)
            //     //                 url.push(keySegment)
            //     //                 url = url.join('/')
                                
            //     //                 // does it exist in our ontology
            //     //                 if (lookupUtil.ontologyPropertyExists(url)){
            //     //                     currentState.rt[activeProfileName].pt[component].userValue[url] = value
            //     //                     // currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI                                    

            //     //                 }else{

            //     //                     currentState.rt[activeProfileName].pt[component].userValue[key] = value
            //     //                     currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI                                
            //     //                 }

                                

            //     //             }else{
            //     //                 currentState.rt[activeProfileName].pt[component].userValue[key] = value
            //     //                 currentState.rt[activeProfileName].pt[component].userValue['@type'] = template.resourceURI                                
            //     //             }


            //     //         }



            //     //     }


            //     // }
                
                
            // }

        // })

        return currentState
    },


    returnUserValues: function(currentState, component, propertyURI){
        let results = false

        // eslint-disable-next-line
        let temp = propertyURI 

        Object.keys(currentState.rt).forEach((rt)=>{
            // check if this profile has the pt we are looking for
            if (currentState.rt[rt].pt[component]){
                results = currentState.rt[rt].pt[component].userValue
 
            }
        })
        
        return results

    },

    returnRootPropertyURI: function(currentState, component, propertyURI){
        let results = false

        // eslint-disable-next-line
        let temp = propertyURI 

        Object.keys(currentState.rt).forEach((rt)=>{
            // check if this profile has the pt we are looking for
            if (currentState.rt[rt].pt[component]){
                results = currentState.rt[rt].pt[component].propertyURI
 
            }
        })
        
        return results

    },


    

    // returns a Class type basedon the predicate from the the profiles
    suggestType: function(propertyURI){


        for (let key in this.rtLookup){
            for (let pt of parseProfile.rtLookup[key].propertyTemplates ){
                if (pt.propertyURI == propertyURI){
                    if (pt.valueConstraint.valueDataType && pt.valueConstraint.valueDataType.dataTypeURI)
                    return pt.valueConstraint.valueDataType.dataTypeURI
                }
            }
        }


        return false
    },


    addItem: function(profile, uri){

        // the URI is acutally the profile name, so turn that into a URI

        uri = profile.rt[uri].URI

        
        


        
        
        // find the RT for the instance of this profile orginally
        // get the work rt

        let itemName
        let itemRt

        for (let rtId in profile.rt){
            if (rtId.includes(":Work")){


                // now find the corosponding instance id
                for (let allRt in this.profiles){
                    if (this.profiles[allRt].rtOrder.indexOf(rtId)>-1){
                        
                        itemName = this.profiles[allRt].rtOrder.filter(i => i.includes(":Item"))[0]

                        // jsut in case the profile doesnt have an item.... 
                        if (!itemName){
                            continue
                        }
                        
                        
                        itemRt = JSON.parse(JSON.stringify(this.profiles[allRt].rt[itemName]))

                        break
                    }
                }

            }
        }

        
        

        let itemCount = 0;

        // gather info to add it 
        let items = Object.keys(profile.rt).filter(i => i.includes(":Item"))
        itemCount = items.length
        

        for (let i of items){
            if (i.includes('-')){
                let nid = parseInt(i.split('-')[1])
                if (nid > items.length){
                    itemCount = nid
                    

                }
            }
        }
        
        itemCount++

        let newRdId = itemName+'-'+itemCount  
        profile.rt[newRdId] = itemRt
        profile.rtOrder.push(newRdId)

        // setup the new instance's properies
        profile.rt[newRdId].URI = 'http://id.loc.gov/resources/item/e' + decimalTranslator.new()
        profile.rt[newRdId].itemOf = uri


        // add it into the pts as well


        for (let rtId in profile.rt){
            if (rtId.includes(":Instance")){

                if (profile.rt.URI == uri){

                    for (let ptId in profile.rt[rtId].pt){
                        if (profile.rt[rtId].pt[ptId].propertyURI == 'http://id.loc.gov/ontologies/bibframe/hasItem' ){
                            
                            // is it empty?
                            if (!profile.rt[rtId].pt[ptId].userValue['bf:hasItem']){                            
                                profile.rt[rtId].pt[ptId].userValue['bf:hasItem'] = {URI: profile.rt[newRdId].URI, label: null}
                            }

                        }
                    }



                }


            }
        }







        



        return profile






    },



    deleteItem: function(profile, uri){

        
        

        // find the items also and remove everything
        for (let rtId in profile.rt){

            if (profile.rt[rtId].URI && profile.rt[rtId].URI == uri){

                let toRemove = []                

                // and remove the orginal
                toRemove.push(rtId)

                for (let i of toRemove){
                    delete profile.rt[i]
                    profile.rtOrder.splice(profile.rtOrder.indexOf(i), 1)

                }




            }

        }

        return profile

    },




    duplicateItem: function(profile, uri){

        
        


        // find the instance first
        for (let rtId in profile.rt){

            if (profile.rt[rtId].URI && profile.rt[rtId].URI == uri){

                //see how many of these there are
                let itemCount = Object.keys(profile.rt).filter(i => i.includes(":Item")).length

                //unless we are cloning a cloned item....
                if (rtId.includes('-')){
                    itemCount = parseInt(rtId.split('-')[1])
                }

                itemCount++

                let newRdId = rtId.split('-')[0]+'-'+itemCount                
                profile.rt[newRdId] = JSON.parse(JSON.stringify(profile.rt[rtId]))


                // insert into the rtOrder
                profile.rtOrder.splice(profile.rtOrder.indexOf(rtId), 0, newRdId)

                // setup the new instance's properies
                profile.rt[newRdId].URI = 'http://id.loc.gov/resources/instances/e' + decimalTranslator.new()



            }

        }




        return profile


    },



    deleteInstance: function(profile, uri){

        
        

        // find the items also and remove everything
        for (let rtId in profile.rt){

            if (profile.rt[rtId].URI && profile.rt[rtId].URI == uri){

                let toRemove = []
                for (let rtId2 in profile.rt){

                    if (rtId2.includes(":Item")){

                        if (profile.rt[rtId2].itemOf && profile.rt[rtId2].itemOf == uri){
                            toRemove.push(rtId2)

                        }

                    }

                }

                // and remove the orginal
                toRemove.push(rtId)

                for (let i of toRemove){

                    delete profile.rt[i]
                    profile.rtOrder.splice(profile.rtOrder.indexOf(i), 1)

                }




            }

        }





        return profile

    },





    addInstance: function(profile){

        
        
        // find the RT for the instance of this profile orginally
        // get the work rt

        let instanceName
        let instanceRt
        let workUri

        for (let rtId in profile.rt){
            if (rtId.includes(":Work")){

                workUri = profile.rt[rtId].URI

                // now find the corosponding instance id
                for (let allRt in this.profiles){
                    if (this.profiles[allRt].rtOrder.indexOf(rtId)>-1){

                        instanceName = this.profiles[allRt].rtOrder.filter(i => i.includes(":Instance"))[0]
                        instanceRt = JSON.parse(JSON.stringify(this.profiles[allRt].rt[instanceName]))
                    }
                }

            }
        }

        
        

        let instanceCount = 0;

        // gather info to add it 
        let instances = Object.keys(profile.rt).filter(i => i.includes(":Instance"))

        for (let i of instances){
            if (i.includes('-')){
                let nid = parseInt(i.split('-')[1])
                if (nid > instances.length){
                    instanceCount = nid
                }
            }
        }
        
        instanceCount++

        let newRdId = instanceName+'-'+instanceCount  
        profile.rt[newRdId] = instanceRt
        profile.rtOrder.push(newRdId)

        // setup the new instance's properies
        profile.rt[newRdId].URI = 'http://id.loc.gov/resources/instances/e' + decimalTranslator.new()
        profile.rt[newRdId].instanceOf = workUri





        return profile

    },


    cloneInstance: function(profile, uri){

        
        


        // find the instance first
        for (let rtId in profile.rt){

            if (profile.rt[rtId].URI && profile.rt[rtId].URI == uri){

                //see how many of these there are
                let instanceCount = Object.keys(profile.rt).filter(i => i.includes(":Instance")).length

                //unless we are cloning a cloned instance....
                if (rtId.includes('-')){
                    instanceCount = parseInt(rtId.split('-')[1])
                }

                instanceCount++

                let newRdId = rtId.split('-')[0]+'-'+instanceCount                
                profile.rt[newRdId] = JSON.parse(JSON.stringify(profile.rt[rtId]))


                // insert into the rtOrder
                profile.rtOrder.splice(profile.rtOrder.indexOf(rtId), 0, newRdId)

                // setup the new instance's properies
                profile.rt[newRdId].URI = 'http://id.loc.gov/resources/instances/e' + decimalTranslator.new()




                // items, if it has items remove them from the profile, remove them from the http://id.loc.gov/ontologies/bibframe/hasItem
                for (let ptId in profile.rt[newRdId].pt){
                    if (profile.rt[newRdId].pt[ptId].propertyURI == 'http://id.loc.gov/ontologies/bibframe/hasItem' ){
                        profile.rt[newRdId].pt[ptId].userValue = {}
                    }
                }

                // find the item connteced to this one and remove it
                let toRemove = []
                for (let rtId2 in profile.rt){

                    if (rtId2.includes(":Item")){

                        if (profile.rt[rtId2].itemOf && profile.rt[rtId2].itemOf == uri){
                            toRemove.push(rtId2)

                        }

                    }

                }

                // and remove the orginal
                toRemove.push(rtId)



                for (let i of toRemove){

                    delete profile.rt[i]
                    profile.rtOrder.splice(profile.rtOrder.indexOf(i), 1)

                }


                

            }

        }

        


        return profile


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


