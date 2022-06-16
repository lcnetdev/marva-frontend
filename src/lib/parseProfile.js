import config from "./config"
import lookupUtil from "./lookupUtil";
import parseBfdb from "./parseBfdb";
import exportXML from "./exportXML"
import store from "../store";



const short = require('short-uuid');
// const translator = short();
const translator = short();
const decimalTranslator = short("0123456789");
var md5 = require('md5');

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

        
        // TEMP HACK ADD IN HUBS
        if (this.startingPointData[0]){
            this.startingPointData[0].json.push(
                {
                    "menuGroup": "Hub",
                    "menuItems": [
                        {
                            "label": "Hub",
                            "type": [
                                "http://id.loc.gov/ontologies/bibframe/Hub"
                            ],
                            "useResourceTemplates": [
                                "lc:RT:bf2:Hub:Hub"
                            ]
                        }                    
                    ]
                }
            )
        }else if (this.startingPointData.json){
            this.startingPointData.json.push(
                {
                    "menuGroup": "Hub",
                    "menuItems": [
                        {
                            "label": "Hub",
                            "type": [
                                "http://id.loc.gov/ontologies/bibframe/Hub"
                            ],
                            "useResourceTemplates": [
                                "lc:RT:bf2:Hub:Hub"
                            ]
                        }                    
                    ]
                }
            )


        }



        

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
                    if (pt.propertyLabel && (pt.propertyLabel.startsWith('Input RDA relationship designator ter') ||
                        pt.propertyLabel.startsWith('Input Geographic Coverage (if not on list)'))){
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

                if (rt.id == 'lc:RT:bf2:GPORelWorkBrief'){                    
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
                                        "https://preprod-8295.id.loc.gov/resources/works"
                                    ],
                                    "valueDataType": {
                                        "dataTypeURI": ""
                                    },
                                    "valueTemplateRefs": []
                                }
                            }]

                } 







                if (rt.id == 'lc:RT:bf2:Brief:Instance'){                    
                    rt.propertyTemplates = [
                            {
                                "mandatory": "false",
                                "propertyLabel": "Lookup",
                                "propertyURI": "http://id.loc.gov/ontologies/bibframe/Instance",
                                "repeatable": "true",
                                "resourceTemplates": [],
                                "type": "lookup",
                                "valueConstraint": {
                                    "defaults": [],
                                    "useValuesFrom": [
                                        "https://preprod-8230.id.loc.gov/resources/instances"
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
                        // }else if (pt.propertyURI == 'http://id.loc.gov/ontologies/bflc/CaptureStorage'){
                        //     pt.propertyURI = 'http://id.loc.gov/ontologies/bflc/captureStorage'

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
                                pt.canBeHidden = false
                                
                                if (pt.type === 'literal-lang'){
                                    this.profiles[p.json.Profile.id].rt[rt.id].hasLiteralLangFields = true
                                }

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

        

        // HACKHACKHACKHACK
        if (config.returnUrls().env != 'production'){
            this.startingPointData.json.splice(2,0,{
                "menuGroup": "GPO Monograph",
                "menuItems": [
                    {
                        "label": "Instance",
                        "type": [
                            "http://id.loc.gov/ontologies/bibframe/Instance"
                        ],
                        "useResourceTemplates": [
                            "lc:RT:bf2:GPOMono:Instance"
                        ]
                    },
                    {
                        "label": "Work",
                        "type": [
                            "http://id.loc.gov/ontologies/bibframe/Work"
                        ],
                        "useResourceTemplates": [
                            "lc:RT:bf2:GPOMono:Work"
                        ]
                    }
                ]
            })
            this.startingPointData.json.splice(3,0,{
                "menuGroup": "GPO Serial",
                "menuItems": [
                    {
                        "label": "Instance",
                        "type": [
                            "http://id.loc.gov/ontologies/bibframe/Instance"
                        ],
                        "useResourceTemplates": [
                            "lc:RT:bf2:GPOSerial:Instance"
                        ]
                    },
                    {
                        "label": "Work",
                        "type": [
                            "http://id.loc.gov/ontologies/bibframe/Work"
                        ],
                        "useResourceTemplates": [
                            "lc:RT:bf2:GPOSerial:Work"
                        ]
                    }
                ]
            })
        }


        this.startingPointData.json.forEach((sp)=>{

            this.startingPoints[sp.menuGroup] = {name:sp.menuGroup, work: null, instance: null, item: null }
            sp.menuItems.forEach((mi)=>{
                
                if (mi.type.indexOf('http://id.loc.gov/ontologies/bibframe/Instance')>-1){
                    
                    this.startingPoints[sp.menuGroup].instance = mi.useResourceTemplates[0]
                }
                if (mi.type.indexOf('http://id.loc.gov/ontologies/bibframe/Work')>-1){
                    
                    this.startingPoints[sp.menuGroup].work = mi.useResourceTemplates[0]
                }
                if (mi.type.indexOf('http://id.loc.gov/ontologies/bibframe/Item')>-1){
                    
                    this.startingPoints[sp.menuGroup].item = mi.useResourceTemplates[0]
                }
                if (mi.type.indexOf('http://id.loc.gov/ontologies/bibframe/Hub')>-1){
                    
                    this.startingPoints[sp.menuGroup].hub = mi.useResourceTemplates[0]
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
            if (this.startingPoints[sp.menuGroup].hub){
                this.profiles[sp.menuGroup].rt[this.startingPoints[sp.menuGroup].hub] = plookup[this.startingPoints[sp.menuGroup].hub]
                this.profiles[sp.menuGroup].rtOrder.push(this.startingPoints[sp.menuGroup].hub)
            }


        })


        
        
        // console.log("this.profiles")
        // console.log(this.profiles)

        return { profiles: this.profiles, lookup: this.rtLookup, startingPoints: this.startingPoints}
    },


    populateDefaultValuesIntoUserValues: function(profile,onlyNew){


        // loop thorugh the profile being passed and add in the default values to all the userValue property

        for (let rt in profile.rt){


            // if the optional onlyNew is passeds and an arg then make sure
            // the RT we are working on is a brand new one with that flag
            // and don't reprocess existing RTs, this is for when a new instance/item is added
            if (onlyNew && !profile.rt[rt].isNew){
                continue
            }else{
                delete profile.rt[rt].isNew
            }
            
            

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

                            if (pt.valueConstraint.valueDataType && pt.valueConstraint.valueDataType.dataTypeURI){
                                pt.userValue[pt.propertyURI]['@type'] = pt.valueConstraint.valueDataType.dataTypeURI
                            }

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
                                        // console.log('subpt',subpt)
                                        if (pt.userValue[subpt.propertyURI][0]){
                                            pt.userValue[subpt.propertyURI][0]['@id'] = subpt.valueConstraint.defaults[0].defaultURI    
                                            if (subpt.valueConstraint.valueDataType && subpt.valueConstraint.valueDataType.dataTypeURI){
                                                pt.userValue[subpt.propertyURI][0]['@type'] = subpt.valueConstraint.valueDataType.dataTypeURI
                                            }

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


    duplicateProperty: function(id,profile,activeProfile,dupeData){

        console.log(id,'|',profile,'|',activeProfile,'|',dupeData)

        let propertyIndex = activeProfile.rt[profile].ptOrder.indexOf(id)
        let newPropertyId = id + '|'+ (+ new Date())

        // insert the new property id
        activeProfile.rt[profile].ptOrder.splice(propertyIndex+1, 0, newPropertyId);

        // activeProfile.rt[profile].pt[newPropertyId] = Object.assign({},activeProfile.rt[profile].pt[id])
        activeProfile.rt[profile].pt[newPropertyId] = JSON.parse(JSON.stringify(activeProfile.rt[profile].pt[id]))

        if (!dupeData){
            store.state.activeUndoLog.push(`Added another property ${exportXML.namespaceUri(activeProfile.rt[profile].pt[id].propertyURI)}`)

            // console.log(activeProfile.rt[profile].pt[newPropertyId])
            // console.log(profile,newPropertyId)
            activeProfile.rt[profile].pt[newPropertyId].userValue = {
                '@guid': short.generate(),
                '@root' : activeProfile.rt[profile].pt[newPropertyId].propertyURI
            }

            // we also want to add any default values in if it is just a empty new property and not duping

            let idPropertyId = activeProfile.rt[profile].pt[id].propertyURI  



            // let defaults = null
            let defaultsProperty


            let useProfile = profile
            // if the profile is a multiple, like lc:RT:bf2:Monograph:Item-0 split off the -0 for it to find it in the RT lookup
            if (!store.state.rtLookup[useProfile]){
                if (useProfile.includes('-')){
                    useProfile = useProfile.split('-')[0]
                }
            }
            // first check the top level
            if (store.state.rtLookup[useProfile]){
                defaultsProperty = store.state.rtLookup[useProfile].propertyTemplates.filter((x)=>{ return (x.propertyURI === idPropertyId) ? true : false})
                if (defaultsProperty.length>0){
                    defaultsProperty=defaultsProperty[0]

                }
            }



            if (defaultsProperty && defaultsProperty.valueConstraint.defaults.length>0){

                // there are defauts at this level
                // its not a nested component just add it in the first level                
                if (defaultsProperty.valueConstraint.defaults[0].defaultLiteral){
                    console.log(activeProfile.rt[profile].pt[newPropertyId])
                    activeProfile.rt[profile].pt[newPropertyId].userValue['http://www.w3.org/2000/01/rdf-schema#label'] = [{
                        '@guid': short.generate(),
                        'http://www.w3.org/2000/01/rdf-schema#label':defaultsProperty.valueConstraint.defaults[0].defaultLiteral
                    }]
                }
                if (defaultsProperty.valueConstraint.defaults[0].defaultURI){
                    activeProfile.rt[profile].pt[newPropertyId].userValue['@id'] = defaultsProperty.valueConstraint.defaults[0].defaultURI
                }                  


            }else if (defaultsProperty && defaultsProperty.valueConstraint.valueTemplateRefs.length>0){

                // it doesn't exist at the top level, see if it has at least one reference template, if so use the first one and look up if that one has defualt values
                // the first one since it is the default for the referencetemplace componment
                let useRef = defaultsProperty.valueConstraint.valueTemplateRefs[0]

                // look through all of them and add in any default
                for (let refPt of store.state.rtLookup[useRef].propertyTemplates){
                    if (refPt.valueConstraint.defaults.length>0){

                        let defaults = refPt.valueConstraint.defaults[0]


                        if (defaults.defaultLiteral){

                            activeProfile.rt[profile].pt[newPropertyId].userValue[refPt.propertyURI]= [{
                                '@guid': short.generate(),
                                'http://www.w3.org/2000/01/rdf-schema#label': [
                                    {
                                        'http://www.w3.org/2000/01/rdf-schema#label':defaults.defaultLiteral,
                                        '@guid': short.generate(),
                                    }
                                ]
                                
                            }]
                        }

                        if (defaults.defaultURI){
                            if (activeProfile.rt[profile].pt[newPropertyId].userValue[refPt.propertyURI][0]){
                                activeProfile.rt[profile].pt[newPropertyId].userValue[refPt.propertyURI][0]['@id'] = defaults.defaultURI    
                                if (refPt.valueConstraint.valueDataType && refPt.valueConstraint.valueDataType.dataTypeURI){
                                    activeProfile.rt[profile].pt[newPropertyId].userValue[refPt.propertyURI][0]['@type'] = refPt.valueConstraint.valueDataType.dataTypeURI
                                }

                            }
                            
                        }      







                    }
                }


            }






        }else{

            store.state.activeUndoLog.push(`Duplicated property ${exportXML.namespaceUri(activeProfile.rt[profile].pt[id].propertyURI)}`)


            // we need to change the @guid for all the parts of the user data
            activeProfile.rt[profile].pt[newPropertyId].userValue['@guid'] = short.generate()

            for (let key in activeProfile.rt[profile].pt[newPropertyId].userValue){

                if (Array.isArray(activeProfile.rt[profile].pt[newPropertyId].userValue[key])){
                    for (let val of activeProfile.rt[profile].pt[newPropertyId].userValue[key]){
                        if (val['@guid']){
                            val['@guid'] = short.generate()
                        }

                        for (let key2 in val){
                            if (Array.isArray(val[key2])){
                                for (let val2 of val[key2]){
                                    if (val2['@guid']){
                                        val2['@guid'] = short.generate()
                                    }
                                   

                                }
                            }
                        }

                    }
                }

            }
            console.log(activeProfile.rt[profile].pt[newPropertyId].userValue)

        }


        activeProfile.rt[profile].pt[newPropertyId]['@guid'] = short.generate()
        activeProfile.rt[profile].pt[newPropertyId].xmlSource= ""

        // just does a little yellow flash animation
        setTimeout(()=>{
            if (document.getElementById(profile+'|'+newPropertyId)){
                document.getElementById(profile+'|'+newPropertyId).style.backgroundColor="yellow"    
                document.getElementById(profile+'|'+newPropertyId).scrollIntoView({ behavior: 'smooth', block: 'center' })
                setTimeout(()=>{
                    document.getElementById(profile+'|'+newPropertyId).style.removeProperty('background-color');       
                },500)   
                
            }
                 
        },0)

        

        return(activeProfile)

    },

    removeProperty: function(id,profile,activeProfile){
        let propertyIndex = activeProfile.rt[profile].ptOrder.indexOf(id)

        store.state.activeUndoLog.push(`Removed property ${exportXML.namespaceUri(activeProfile.rt[profile].pt[id].propertyURI)}`)



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

        store.state.activeUndoLog.push(`Restored property ${exportXML.namespaceUri(activeProfile.rt[profile].pt[id].propertyURI)}`)

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


    sendToInstance: function(from,to,activeProfile){


        store.state.activeUndoLog.push(`Transfered property ${exportXML.namespaceUri(activeProfile.rt[from.profile].pt[from.componet].propertyURI)}`)

        let c = JSON.parse(JSON.stringify(from.data))


        // // remove it from the source
        // console.log(activeProfile.rt[from.profile])

        // console.log(activeProfile.rt[from.profile].pt[from.componet])

        delete activeProfile.rt[from.profile].pt[from.componet]

        activeProfile.rt[from.profile].ptOrder.splice(activeProfile.rt[from.profile].ptOrder.indexOf(from.componet), 1)


        // try our best to change the parent string
        c.parent = c.parent.replaceAll(from.profile,to)
        // change the parent id on it        
        c.parentId = to.profile

        // this is custom code, to check for various things of transfering specific properties

        if (c.userValue['@type'] === "http://id.loc.gov/ontologies/bflc/PrimaryContribution"){
            c.userValue['@type'] = 'http://id.loc.gov/ontologies/bibframe/Contribution'
        }

        // check to see if we already have something in the list for this already
        if (activeProfile.rt[to].ptOrder.indexOf(from.componet)>-1){
            from.componet = from.componet + short.generate()
        }

        // insert it into the profile

        activeProfile.rt[to].ptOrder.unshift(from.componet)
        activeProfile.rt[to].pt[from.componet] = c


        return(activeProfile)
        
    },

    refTemplateChange: function(currentState, component, key, activeProfileName, template, parentId, thisRef, nextRef){

        if (currentState.rt[activeProfileName].pt[component]){


            // keep track at the top level what is the active type for this template
            currentState.rt[activeProfileName].pt[component].activeType = nextRef.resourceURI
                

            // always remove the @id
            if (currentState.rt[activeProfileName].pt[component].userValue['@id']){
                delete currentState.rt[activeProfileName].pt[component].userValue['@id']
            }


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
 
            // This part keeps track of values in previous templates not just the last and next
            // so it could keep them around, but lets try not doing that, it will loose a value 
            // if it cycles through one template without one of the properties but that's fine

            // if (currentState.rt[activeProfileName].pt[component].refTemplateUserValueKeys[thisRef.id]){
            //     currentState.rt[activeProfileName].pt[component].refTemplateUserValueKeys[thisRef.id].forEach((k)=>{
            //         console.log('addding',k)
            //         if (possibleProperties.indexOf(k)==-1){
            //             possibleProperties.push(k)
            //         }
            //     })
            // }            



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
                    // don't use http://id.loc.gov/ontologies/bibframe/assigner aka source
                    // kind of a hackish thing, but the source is really not transferable between
                    // differnt types of classifications so leave it out, it will get populated with the default so
                    // we shouldn't loose any data, only if they change it then cycle the options then it will be lost and need to re-add
                    if (pp != 'http://id.loc.gov/ontologies/bibframe/assigner'){
                        currentState.rt[activeProfileName].pt[component].userValue[pp]= JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].refTemplateUserValue[pp]))
                    }
                    delete currentState.rt[activeProfileName].pt[component].refTemplateUserValue[pp]
                }

            }

            // also check to see if there are default values in the orignal profile that we might need to over write with if they are switching 

            
            for (let pt of store.state.rtLookup[nextRef.id].propertyTemplates){
                if (pt.valueConstraint.defaults && pt.valueConstraint.defaults.length>0){
                    // console.log("These fdautls:",pt.valueConstraint.defaults && pt.valueConstraint.defaults[0])
                    // console.log(pt.propertyURI)
                    // if there is already this property in the uservalue remove it
                    if (currentState.rt[activeProfileName].pt[component].userValue[pt.propertyURI]){
                        currentState.rt[activeProfileName].pt[component].userValue[pt.propertyURI] = []
                    }

                    // popualte with the default

                    if (pt.valueConstraint.defaults[0].defaultLiteral){



                        // if the default is for a label property, don't double nest it
                        if (pt.propertyURI === 'http://www.w3.org/2000/01/rdf-schema#label'){

                            currentState.rt[activeProfileName].pt[component].userValue[pt.propertyURI]= [
                                {
                                    'http://www.w3.org/2000/01/rdf-schema#label':pt.valueConstraint.defaults[0].defaultLiteral,
                                    '@guid': short.generate(),
                                }                              
                            ]

                        }else{
                            currentState.rt[activeProfileName].pt[component].userValue[pt.propertyURI]= [{
                                '@guid': short.generate(),
                                'http://www.w3.org/2000/01/rdf-schema#label': [
                                    {
                                        'http://www.w3.org/2000/01/rdf-schema#label':pt.valueConstraint.defaults[0].defaultLiteral,
                                        '@guid': short.generate(),
                                    }
                                ]
                                
                            }]

                        }



                    }

                    if (pt.valueConstraint.defaults[0].defaultURI && pt.valueConstraint.defaults[0].defaultURI.trim() != ""){


                        currentState.rt[activeProfileName].pt[component].userValue[pt.propertyURI][0]['@id'] = pt.valueConstraint.defaults[0].defaultURI

                        if (pt.valueConstraint.valueDataType && pt.valueConstraint.valueDataType.dataTypeURI){
                            currentState.rt[activeProfileName].pt[component].userValue[pt.propertyURI][0]['@type'] = pt.valueConstraint.valueDataType.dataTypeURI
                        }



                    }      




                }
            }








        

        }


        return currentState
    },

    // eslint-disable-next-line
    removeValueSimple: function(currentState, idGuid, labelGuid){


        // console.log('idGuid',idGuid)
        // console.log('labelGuid',labelGuid)
        // find the pt for the value we are editing
        for (let rt in currentState.rt){
            for (let pt in currentState.rt[rt].pt){


                let removed = false


                // the root node is the lookup val, reset the uservale to remove
                if (idGuid != null && currentState.rt[rt].pt[pt].userValue['@guid'] == idGuid){
                    currentState.rt[rt].pt[pt].userValue = {'@root':currentState.rt[rt].pt[pt].propertyURI}
                    removed = true
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
                                    removed = true
                                }
                            }



                        }

                    }



                }



                if (removed){


                    
                    store.state.activeUndoLog.push(`Removed lookup value from ${exportXML.namespaceUri(currentState.rt[rt].pt[pt].propertyURI)}`)

                    break
                }


            }
        }


        // store.state.activeUndoLog.push(`Transfered property ${exportXML.namespaceUri(activeProfile.rt[from.profile].pt[from.componet].propertyURI)}`)



        return currentState
    },




    setValueSimple: async function(currentState, ptGuid, parentURI, URI, valueURI, valueLabel){

        let results = {newData:{}}

        // console.log("-------------Adding DATA---------------")
        // console.log('currentState',currentState)
        // console.log('ptGuid',ptGuid)
        // console.log('parentURI',parentURI)
        // console.log('URI',URI)
        // console.log('valueURI',valueURI)
        // console.log('valueLabel',valueLabel)


        // find the pt for the value we are editing
        for (let rt in currentState.rt){

            for (let pt in currentState.rt[rt].pt){

                if (currentState.rt[rt].pt[pt]['@guid'] == ptGuid){

                    let userValue = currentState.rt[rt].pt[pt].userValue


                    // top level
                    if (currentState.rt[rt].pt[pt].propertyURI == URI){
                        // console.log("--- top level")
                        //s

                        let topLvlTmpGuid = short.generate()
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
                                                    

                            userValue['@guid'] = topLvlTmpGuid
                            userValue['http://www.w3.org/2000/01/rdf-schema#label'].push(

                                {
                                    '@guid': tmpGuid,
                                    'http://www.w3.org/2000/01/rdf-schema#label':valueLabel

                                }

                            )
                            store.state.activeUndoLog.push(`Added lookup value ${valueLabel} to ${exportXML.namespaceUri(URI)}`)

                            
                        }
                        if (valueURI && !userValue['@id']){
                            userValue['@id'] = valueURI
                        }


                        
                        results.newData = {'guid': topLvlTmpGuid, valueLabel: valueLabel, valueURI:valueURI }




                    }else{

                        if (!userValue[URI]){
                            userValue[URI] = []
                        }

                        // console.log("--- not top level")

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
                            store.state.activeUndoLog.push(`Added lookup value ${valueLabel} to ${exportXML.namespaceUri(URI)}`)


                            
                        }
                        if (valueURI){
                            newData['@id'] = valueURI
                        }

                        userValue[URI].push(newData)
                        
                        results.newData = {'guid': newData['@guid'], valueLabel: valueLabel, valueURI:valueURI }


                      


                    }

                    // always make sure there is a type
                    if (!userValue['@type']){
                        userValue['@type'] = await exportXML.suggestType(currentState.rt[rt].pt[pt].propertyURI)
                        
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


        
        // console.log(currentState, ptGuid, guid, parentURI, URI, value)
        // console.log('before:',JSON.parse(JSON.stringify(currentState)))

        // find the pt for the value we are editing
        for (let rt in currentState.rt){

            for (let pt in currentState.rt[rt].pt){
                if (currentState.rt[rt].pt[pt]['@guid'] == ptGuid){

                    // console.log("found the existing PTguid",currentState.rt[rt].pt[pt])
                    let userValue = currentState.rt[rt].pt[pt].userValue

                    if (guid){
                        // console.log("here1")
                        // it already has a guid, so we are editing an existing value
                        if (parentURI){
                            // console.log("here2")
                            // if we have the parent URi try to search using both 
                            if (userValue[parentURI]){
                                // console.log("here3")
                                for (let parentValueArray of userValue[parentURI]){
                                    if (parentValueArray[URI]){          
                                      // console.log(JSON.parse(JSON.stringify(parentValueArray[URI])))
                                      for (let childValue of parentValueArray[URI]){
                                        if (childValue['@guid'] == guid){
                                            // console.log(JSON.parse(JSON.stringify(childValue)))
                                            // console.log("here5",childValue,guid,URI)
                                            childValue[URI] = value                                            
                                            if (value && value.length==0){
                                                // value is null remove the property
                                                // if it is a multiliteral make sure we remvoe the correct one                                            
                                                if (parentValueArray[URI].length>1){
                                                    parentValueArray[URI] = parentValueArray[URI].filter((v)=>{ return (v['@guid'] != guid) })
                                                }else{
                                                    delete parentValueArray[URI]    
                                                }
                                                results.newGuid=false
                                                // console.log("here5a")
                                            }else if (!value){
                                                // value is null remove the property
                                                // if it is a multiliteral make sure we remvoe the correct one
                                                if (parentValueArray[URI].length>1){
                                                    parentValueArray[URI] = parentValueArray[URI].filter((v)=>{ return (v['@guid'] != guid) })
                                                }else{
                                                    delete parentValueArray[URI]    
                                                }

                                                results.newGuid=false
                                                // console.log("here5b")
                                            }

                                        }
                                      }
                                    }
                                }
                            }else{

                                // console.log("here6")
                                // just search using the propertyURI
                                if (userValue[URI]){
                                  // console.log("here611")  
                                  for (let childValue of userValue[URI]){
                                    if (childValue['@guid'] == guid){
                                        childValue[URI] = value
                                        if (value && value.length==0){


                                            if (userValue[URI].length>1){
                                                userValue[URI] = userValue[URI].filter((v)=>{ return (v['@guid'] != guid) })
                                            }else{
                                                delete userValue[URI]    
                                            }

                                            results.newGuid=false
                                            // console.log("here66")
                                        }else if (!value){
                                            // value is null remove the property
                                            if (userValue[URI].length>1){
                                                userValue[URI] = userValue[URI].filter((v)=>{ return (v['@guid'] != guid) })
                                            }else{
                                                delete userValue[URI]    
                                            }


                                            results.newGuid=false
                                            // console.log("here666")
                                        }

                                    }
                                  }
                                }

                            }
                        }else{
                            // console.log("here7")
                            // not nested
                            if (userValue[URI]){
                              for (let childValue of userValue[URI]){
                                if (childValue['@guid'] == guid){
                                    childValue[URI] = value
                                    if (value && value.length==0){

                                        if (userValue[URI].length>1){
                                            userValue[URI] = userValue[URI].filter((v)=>{ return (v['@guid'] != guid) })
                                        }else{
                                            delete userValue[URI]    
                                        }

                                        results.newGuid=false
                                    }else if (!value){
                                        // value is null remove the property

                                        if (userValue[URI].length>1){
                                            userValue[URI] = userValue[URI].filter((v)=>{ return (v['@guid'] != guid) })
                                        }else{
                                            delete userValue[URI]    
                                        }

                                        results.newGuid=false
                                    }

                                }


                              }
                            }


                        }





                    }else{

                        

                        // we are not editing, we are creating a new node
                        // can we find the uri to use, 

                        let data = {'@guid': short.generate()}

                        // if there is no type yet and this is not a literal component PT then
                        // it needs to have a type assigned
                        // console.log('creating',currentState.rt[rt].pt[pt])
                        if (currentState.rt[rt].pt[pt].type != 'literal' && !currentState.rt[rt].pt[pt].userValue['@type']){

                            currentState.rt[rt].pt[pt].userValue['@type'] = await exportXML.suggestType(currentState.rt[rt].pt[pt].propertyURI)

                            // it might be that it is a reftemplate though
                            // so see if the ref templates have any valueDataType we should use (use the first one if so)
                            if (currentState.rt[rt].pt[pt].valueConstraint.valueTemplateRefs.length>0){
                                if (this.rtLookup[currentState.rt[rt].pt[pt].valueConstraint.valueTemplateRefs[0]]){
                                    if (this.rtLookup[currentState.rt[rt].pt[pt].valueConstraint.valueTemplateRefs[0]].resourceURI){
                                        currentState.rt[rt].pt[pt].userValue['@type'] = this.rtLookup[currentState.rt[rt].pt[pt].valueConstraint.valueTemplateRefs[0]].resourceURI
                                    }
                                }
                                
                            }

                            // console.log(structure)
                        }

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




        let pURI = (parentURI) ? parentURI : URI;

        // see if the previous edit of this literal is already in the log, if so remove
        store.state.activeUndoLog = store.state.activeUndoLog.filter((f) => (f.includes(exportXML.namespaceUri(pURI)) ? false : true ))
        store.state.activeUndoLog.push(`Changed literal value "${value}" on ${exportXML.namespaceUri(pURI)}`)


        // console.log('after:',JSON.parse(JSON.stringify(currentState)))

        results.currentState = currentState

        return results


    },

    
    reorderSubjects: function(profile, subjects){


        
        for (let rt of profile.rtOrder){

            if (rt.includes(':Work')){
                    
                let subjectsStartAtIndex = 0

                for (let pt of profile.rt[rt].ptOrder){

                    if (pt.includes('http://id.loc.gov/ontologies/bibframe/subject')){
                        break
                    }
                    subjectsStartAtIndex++
                }

                let ptOrderNoSubjects = profile.rt[rt].ptOrder.filter((p)=>{ return (!p.includes('http://id.loc.gov/ontologies/bibframe/subject')) })

                
                
                let subjectNewOrder = subjects.map((s)=>{return s.pt})

                // add them in 
                ptOrderNoSubjects.splice(subjectsStartAtIndex, 0, ...subjectNewOrder);

                profile.rt[rt].ptOrder = ptOrderNoSubjects
            }
        }

        return profile

    },

    returnSubjectList: function(profile){

        let list = []

        for (let rt of profile.rtOrder){

            if (rt.includes(':Work')){
                
                for (let pt of profile.rt[rt].ptOrder){

                    if (pt.includes('id.loc.gov/ontologies/bibframe/subject')){
                        

                        let label = "!Unkown Subject Label!"
                        let source = ''

                        if (profile.rt[rt].pt[pt].userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'] && profile.rt[rt].pt[pt].userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0] && profile.rt[rt].pt[pt].userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'] ){
                            label = profile.rt[rt].pt[pt].userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'][0]['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']
                        }

                        if (profile.rt[rt].pt[pt].userValue['http://www.w3.org/2000/01/rdf-schema#label'] && profile.rt[rt].pt[pt].userValue['http://www.w3.org/2000/01/rdf-schema#label'][0] && profile.rt[rt].pt[pt].userValue['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label'] ){
                            label = profile.rt[rt].pt[pt].userValue['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label']
                        }

                        if (profile.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/source'] && profile.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/source'][0] && profile.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/source'][0] ){
                            let s = profile.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/source'][0]
                            if (s['@id'] &&  s['@id'] == 'http://id.loc.gov/authorities/subjects'){
                                source = 'lcsh'
                            }
                            if (s['@id'] &&  s['@id'] == 'http://id.loc.gov/vocabulary/subjectSchemes/fast'){
                                source = 'fast'
                            }


                        }

                        
                        list.push({
                            guid: profile.rt[rt].pt[pt]['@guid'],
                            source: source,
                            label: label,
                            pt: pt

                        })
                    }

                }
            }
        }


        return list

    },


    // a special funtion just for subject headings (how fun)
    
    setValueSubject: async function(currentState, component, activeProfileName, subjectComponents){

        // we're just going to overwrite the whole userValue with the constructed headings



        // find it
        if (currentState.rt[activeProfileName].pt[component]){




            // hard code some properties that are used
            let userValue = {
                "@root": currentState.rt[activeProfileName].pt[component].userValue['@root'],
                "@guid": currentState.rt[activeProfileName].pt[component].userValue['@guid'],
                "@type": "http://id.loc.gov/ontologies/bibframe/Topic",
                "http://www.loc.gov/mads/rdf/v1#isMemberOfMADSScheme": [{
                    "@guid": "7M2siXsnQb73NRmttF333f",
                    "@id": "http://id.loc.gov/authorities/subjects"
                }],
                // "http://id.loc.gov/ontologies/bibframe/source": [{
                //     "@guid": short.generate(),
                //     "@type": "http://id.loc.gov/ontologies/bibframe/Source",
                //     "http://www.w3.org/2000/01/rdf-schema#label": [{
                //         "@guid": short.generate(),
                //         "http://www.w3.org/2000/01/rdf-schema#label": "Library of Congress subject headings"
                //     }],
                //     "http://id.loc.gov/ontologies/bibframe/code": [{
                //         "@guid": short.generate(),
                //         "http://id.loc.gov/ontologies/bibframe/code": "lcsh"
                //     }],                    
                //     "@id": "http://id.loc.gov/vocabulary/subjectSchemes/lcsh"
                // }]
            }

            // but find a source predicates so we can add those back in
            if (currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/source']){
                userValue['http://id.loc.gov/ontologies/bibframe/source'] = JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/source']))
             }

            // overwrite the guid if it already exists in the source
            // if (currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/source']){
            //     userValue['http://id.loc.gov/ontologies/bibframe/source']['@guid'] = currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/source']['@guid']
            // }


            // if it is a solo subject heading
            if (subjectComponents.length==1){

                userValue['@id'] = subjectComponents[0].uri

                userValue["http://www.loc.gov/mads/rdf/v1#authoritativeLabel"] = [{
                    "@guid": short.generate(),
                    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": subjectComponents[0].label
                }]
                userValue["http://www.w3.org/2000/01/rdf-schema#label"] = [{
                    "@guid": short.generate(),
                    "http://www.w3.org/2000/01/rdf-schema#label": subjectComponents[0].label
                }]
                
                store.state.activeUndoLog.push(`Added subject heading ${subjectComponents[0].label}`)


            }else if (subjectComponents.length>1){

                //userValue

                
                let fullLabel = subjectComponents.map((c)=>{return c.label}).join('--')

                store.state.activeUndoLog.push(`Added subject heading ${fullLabel}`)

                userValue["http://www.loc.gov/mads/rdf/v1#authoritativeLabel"] = [{
                    "@guid": short.generate(),
                    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": fullLabel
                }]
                userValue["http://www.w3.org/2000/01/rdf-schema#label"] = [{
                    "@guid": short.generate(),
                    "http://www.w3.org/2000/01/rdf-schema#label": fullLabel
                }]

                // we need to make the component list then


                userValue["http://www.loc.gov/mads/rdf/v1#componentList"] = []

                for (let c of subjectComponents){

                    let compo = {
                            "@guid": short.generate(),
                            "@type": c.type.replace('madsrdf:','http://www.loc.gov/mads/rdf/v1#'),
                            "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [{
                                "@guid": short.generate(),
                                "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": c.label
                            }]
                    }

                    if (c.uri){
                        compo['@id'] = c.uri
                    }

                    userValue["http://www.loc.gov/mads/rdf/v1#componentList"].push(compo)


                }







            }



            currentState.rt[activeProfileName].pt[component].userValue = userValue

        }







        return currentState



    },

    setValueComplex: async function(currentState, component, key, activeProfileName, template, value, structure,parentStructure){

            console.log("setvaluecomplex")
            console.log(currentState, component, key, activeProfileName, template, value, structure,parentStructure)
            // if it is a top level Work uri don't let them change it
            if (!parentStructure && structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Work'){

                alert("You cannot change the existing URI of this work.")
                return currentState

            }

            let relatedEdgecaseParentProperty = -1

            if (parentStructure){
               relatedEdgecaseParentProperty = ['http://id.loc.gov/ontologies/bibframe/relatedTo','http://id.loc.gov/ontologies/bflc/relation','http://id.loc.gov/ontologies/bibframe/expressionOf'].indexOf(parentStructure.propertyURI)
            }


            if (!activeProfileName){
                console.warn('setValueComplex no activeProfileName')
                return currentState
            }

            // console.log('currentState, component, key, activeProfileName, template, value, structure,parentStructure')
            // console.log(currentState, component, key, activeProfileName, template, value, structure,parentStructure)

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

                let pURI = (parentStructure) ? parentStructure.propertyURI : structure.propertyURI
                store.state.activeUndoLog.push(`Removed lookup value from ${exportXML.namespaceUri(pURI)}`)

                return currentState
            }


            
            if (currentState.rt[activeProfileName].pt[component]){
                    
                // console.log('>>>>',structure.type, parentStructure)

                // need tofigure out what property to store this under the in the userValue
                if (parentStructure && key == 'http://www.w3.org/2002/07/owl#sameAs' && currentState.rt[activeProfileName].pt[component].propertyURI != parentStructure.propertyURI){
                    // console.log('case 1')
                    if (!currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]){
                        currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = []
                    }

                    let userValue = currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]

                    if (value.contextValue){

                        // testing just making sure there is only one value in there
                        userValue = []

                        if (!value.typeFull && value.type == "Literal Value"){

                            if (structure && structure.propertyURI == "http://id.loc.gov/ontologies/bibframe/agent"){
                                value.typeFull = 'http://id.loc.gov/ontologies/bibframe/Agent'
                            }else if (parentStructure && parentStructure.propertyURI == "http://id.loc.gov/ontologies/bibframe/agent"){
                                value.typeFull = 'http://id.loc.gov/ontologies/bibframe/Agent'
                            }

                            // if its looking up from an agent 

                        }



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

                    currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = userValue

                    if (currentState.rt[activeProfileName].pt[component].valueConstraint 
                        && currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType 
                        && currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType.dataTypeURI){
                        currentState.rt[activeProfileName].pt[component].userValue['@type'] = currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType.dataTypeURI
                    }

                    if (!currentState.rt[activeProfileName].pt[component].userValue['@type']){

                        // just make sure it has a type
                        currentState.rt[activeProfileName].pt[component].userValue['@type'] = await exportXML.suggestType(currentState.rt[activeProfileName].pt[component].propertyURI)

                    }



                }else if (parentStructure && key == 'http://www.w3.org/2002/07/owl#sameAs' && currentState.rt[activeProfileName].pt[component].propertyURI == parentStructure.propertyURI){
                    // console.log('case 2')
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
                    // console.log('case 3')
                    // thre are some very nested template, which we are just checking for
                    if (!currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]){
                        currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = []
                    }

                    // we dont want multiple values here
                    currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = []

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
                    // console.log('case 4')
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

                    console.log('case 5')

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

        let pValue = (value && value.title) ? ` (${value.title})` : "";
        let pURI = (parentStructure) ? parentStructure.propertyURI : structure.propertyURI;
        store.state.activeUndoLog.push(`Added lookup value${pValue} to ${exportXML.namespaceUri(pURI)}`)



        return currentState
    },


    rebuildHubURI: function(currentState){




        // look through to see if any piece of it is a hub profile
        for (let rt in currentState.rt){

            if (rt.endsWith(':Hub')){



                // console.log('Modify this URI',currentState.rt[rt].URI)
                let title = null
                let primaryContribution = null

                // look for the primary contrubitor and the maintitle if we have both 
                // build the URI as a md5 hash of those normalized strings
                for (let pt in currentState.rt[rt].pt){

                    if (currentState.rt[rt].pt[pt].propertyURI === 'http://id.loc.gov/ontologies/bfsimple/prefTitle'){
                        if (currentState.rt[rt].pt[pt].userValue && currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bfsimple/prefTitle'] && currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bfsimple/prefTitle'][0] && currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bfsimple/prefTitle'][0]['http://id.loc.gov/ontologies/bfsimple/prefTitle']){
                            title = currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bfsimple/prefTitle'][0]['http://id.loc.gov/ontologies/bfsimple/prefTitle']
                        }
                    }

                    if (currentState.rt[rt].pt[pt].propertyURI === 'http://id.loc.gov/ontologies/bibframe/contribution'){
                        if (currentState.rt[rt].pt[pt].valueConstraint.valueDataType.dataTypeURI === 'http://id.loc.gov/ontologies/bflc/PrimaryContribution'){                            

                            if (
                                currentState.rt[rt].pt[pt].userValue && 
                                currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/agent'] && 
                                currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/agent'][0] && 
                                currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/agent'][0]['http://www.w3.org/2000/01/rdf-schema#label'] && 
                                currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/agent'][0]['http://www.w3.org/2000/01/rdf-schema#label'][0] && 
                                currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/agent'][0]['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label'] 
                                ){
                                primaryContribution = currentState.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/agent'][0]['http://www.w3.org/2000/01/rdf-schema#label'][0]['http://www.w3.org/2000/01/rdf-schema#label']
                            }
                        }
                    }

                    
                }

                if (title && primaryContribution){

                    // we have the two pieces make a hash based on contrib and title
                    let aap = this.returnAap(primaryContribution,title)
                    let hash = md5(aap)
                    // add hyphen
                    let uri = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`


                    currentState.rt[rt].URI = `http://id.loc.gov/resources/hubs/${uri}`
                    // console.log('modified this URI',currentState.rt[rt].URI)
                }
            }
        }
        return currentState
    },

    returnLiterals: function(activeProfile){


        let literals = {}


        for (let rtKey in activeProfile.rt){

            if (!literals[rtKey]){
                literals[rtKey] = []
            }

            for (let ptKey in activeProfile.rt[rtKey].pt){

                let pt = activeProfile.rt[rtKey].pt[ptKey]

                // if the whole component is a literal
                // if (pt.type === '')


                // see if there are any literals here
                // let foundLiterals = []

                if (pt.userValue['@id']){
                    // if there is an URI then it is controlled, so skipp this one
                    continue
                }

                for (let k in pt.userValue){

                    if (!k.startsWith('@')){
                        for (let val of pt.userValue[k]){

                            // if this one has a URI then skipp it as well (might not happen?)
                            if (val['@id']){
                                // if there is an URI then it is controlled, so skipp this one
                                continue
                            }

                            // some things we don't want to keep track of
                            if (['http://id.loc.gov/ontologies/bibframe/adminMetadata'].indexOf(pt.propertyURI)>-1){
                                continue
                            }



                            let stringValue = ''

                            for (let kk in val){
                                if (!kk.startsWith('@')){
                                    stringValue=stringValue+val[kk]
                                }
                            }

                            if (isNaN(stringValue)==false){
                                continue
                            }

                            if (stringValue==='[object Object]'){
                                continue
                            }

                            

                            
                            if (config.literalLangOptions.ignorePtURIs.indexOf(pt.propertyURI)>-1){
                                continue
                            }

        

                            literals[rtKey].push({
                                rt: rtKey,
                                ptGuid: pt['@guid'],
                                ptLabel: pt.propertyLabel,
                                ptURI: pt.propertyURI,
                                userValueGuid: pt.userValue['@guid'],
                                guid: val['@guid'],
                                language: (val['@language']) ? val['@language'] : null,
                                value: stringValue,
                            })



                        }
                    }

                }


            }


        }





        return literals

    },



    setLangLiterals: function(activeProfile, guid, lang){



        for (let rtKey in activeProfile.rt){
            for (let ptKey in activeProfile.rt[rtKey].pt){
                let pt = activeProfile.rt[rtKey].pt[ptKey]

                if (pt.userValue['@id']){
                    // if there is an URI then it is controlled, so skipp this one
                    continue
                }

                for (let k in pt.userValue){

                    if (!k.startsWith('@')){
                        for (let val of pt.userValue[k]){

                            
                            if (val['@guid'] === guid['guid']){
                                

                                // if it already that undo it
                                if (val['@language'] === lang){
                                    store.state.activeUndoLog.push(`Removing ${val['@language']} language for ${exportXML.namespaceUri(pt.propertyURI)}`)
                                    delete val['@language']
                                    
                                }else{
                                    //set it otherwise
                                    val['@language'] = lang
                                    store.state.activeUndoLog.push(`Setting ${val['@language']} language for ${exportXML.namespaceUri(pt.propertyURI)}`)


                                }
                            }
                            

                        }
                    }

                }


            }


        }





        return activeProfile

    },


    returnAap: function(contributor,title){

        if (!contributor || !title){
            return false
        }

        let aap = `${contributor}${title}`

        // remove trailing spaces
        aap = aap.trim()

        // remove semicolin if it ends in one
        if (aap.endsWith(';')){
            aap=aap.slice(0, -1)
        }

        aap = aap.toLowerCase()
        //remove all spaces
        aap = aap.replace(/\s/g, '')

        // remove commas periods hyphens
        aap = aap.replace(/[.,-]/g, '')

        return aap




    },

    returnUserValues: function(currentState, activeRt, component, propertyURI){
        let results = false

        // eslint-disable-next-line
        let temp = propertyURI 

        // Object.keys(currentState.rt[activeRt]).forEach((rt)=>{
            // check if this profile has the pt we are looking for
            // console.log('currentState',currentState)
            // console.log('activeRt=',activeRt)


            if (currentState.rt[activeRt].pt[component]){
                results = currentState.rt[activeRt].pt[component].userValue
 
            }

        // })
        
        return results

    },

    returnGuid: function(currentState, component, propertyURI){
        let results = false

        // eslint-disable-next-line
        let temp = propertyURI 

        Object.keys(currentState.rt).forEach((rt)=>{
            // check if this profile has the pt we are looking for
            if (currentState.rt[rt].pt[component]){
                results = currentState.rt[rt].pt[component]['@guid']
 
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


    suggestURI: function(profile,type,URI){


        // for items find the instance URI and then count up the items and add it as a suffix to the instance URI pattern
        if (type === 'bf:Item'){


            for (let rtId in profile.rt){
                if (profile.rt[rtId].URI == URI){

                    let newURI = profile.rt[rtId].URI.replace('/instances/','/items/')

                    let itemCount = 0

                    for (let rtId2 in profile.rt){
                        if (rtId2.includes(":Item")){
                            itemCount++
                        }
                    }


                    let itemCountLabel = String(itemCount).padStart(4, '0');

                    newURI = newURI + '-' + itemCountLabel
                    return newURI
                }
            }

        }


        if (type === 'bf:Instance'){

            let instanceURIbasedOnWork = URI.replace('/works/','/instances/')
            // let workID = URI.split('/').slice(-1)[0]

            // if there are no instances yet, make a new instance and just use the work's URI
            let instanceCount = 0
            // let workUriUsed = false
            for (let rtId2 in profile.rt){
                if (rtId2.includes(":Instance")){
                    instanceCount++
                    if (profile.rt.URI == instanceURIbasedOnWork){
                        // workUriUsed=true
                    }
                }
            }
            

            // if there are no instances yet use the instanceURIbasedOnWork
            if (instanceCount==0){
                return instanceURIbasedOnWork
            }else{


                // there are already instances, so use the work id but append a suffix to it
                return instanceURIbasedOnWork + '-' + String(instanceCount).padStart(4, '0');

            }






        }




    },


    addItem: function(profile, uri){

        // the URI is acutally the profile name, so turn that into a URI

        if (!uri.startsWith('http')){
            uri = profile.rt[uri].URI
        }


        
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
        // mark it for when we process the default values
        itemRt.isNew = true
        profile.rt[newRdId] = itemRt
        profile.rtOrder.push(newRdId)


        

        // setup the new instance's properies
        //profile.rt[newRdId].URI = 'http://id.loc.gov/resources/items/'+ translator.toUUID(translator.new())
        profile.rt[newRdId].URI = this.suggestURI(profile,'bf:Item',uri)

        profile.rt[newRdId].itemOf = uri

        // give it all new guids

        for (let pt in profile.rt[newRdId].pt){
            profile.rt[newRdId].pt[pt]['@guid'] = short.generate()
        }


        
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



        let adminMetadataProperty = {
          "mandatory": false,
          "propertyLabel": "Admin Metadata",
          "propertyURI": "http://id.loc.gov/ontologies/bibframe/adminMetadata",
          "repeatable": false,
          "resourceTemplates": [],
          '@guid': short.generate(),
          "type": "resource",
          "userValue": {
            "@root":"http://id.loc.gov/ontologies/bibframe/adminMetadata",
            "@type": "http://id.loc.gov/ontologies/bibframe/AdminMetadata",
            "http://id.loc.gov/ontologies/bflc/catalogerId": [
              {
              "@guid": short.generate(),
              "http://id.loc.gov/ontologies/bflc/catalogerId": store.state.catInitials
              }
            ]

          },
          "valueConstraint": {
            "defaults": [],
            "useValuesFrom": [],
            "valueDataType": {},
          "valueTemplateRefs": this.returnAdminMedataToUse(newRdId)
          }
        }

        let adminMetadataPropertyLabel = 'http://id.loc.gov/ontologies/bibframe/adminMetadata|Admin Metadata'
        profile.rt[newRdId].pt[adminMetadataPropertyLabel] = JSON.parse(JSON.stringify(adminMetadataProperty))
        profile.rt[newRdId].ptOrder.push(adminMetadataPropertyLabel)





        profile = this.populateDefaultValuesIntoUserValues(profile,true)



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

                let instanceURI = profile.rt[rtId].itemOf

                //see how many of these there are
                let itemCount = Object.keys(profile.rt).filter(i => i.includes(":Item")).length

                //unless we are cloning a cloned item....
                if (rtId.includes('-')){
                    itemCount = parseInt(rtId.split('-')[1])
                }

                itemCount++

                let newRdId = rtId.split('-')[0]+'-'+itemCount                
                profile.rt[newRdId] = JSON.parse(JSON.stringify(profile.rt[rtId]))

                // give it all new guids
                for (let pt in profile.rt[newRdId].pt){
                    profile.rt[newRdId].pt[pt]['@guid'] = short.generate()
                }



                // insert into the rtOrder
                profile.rtOrder.splice(profile.rtOrder.indexOf(rtId), 0, newRdId)



                // setup the new instance's properies
                // profile.rt[newRdId].URI = 'http://id.loc.gov/resources/instances/'+ translator.toUUID(translator.new())

                
                profile.rt[newRdId].URI = this.suggestURI(profile,'bf:Item',instanceURI)


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
        instanceRt.isNew = true
        profile.rt[newRdId] = instanceRt
        profile.rtOrder.push(newRdId)

        // give it all new guids
        for (let pt in profile.rt[newRdId].pt){
            profile.rt[newRdId].pt[pt]['@guid'] = short.generate()
        }


        // setup the new instance's properies
        // profile.rt[newRdId].URI = 'http://id.loc.gov/resources/instances/'+ translator.toUUID(translator.new())

        profile.rt[newRdId].URI = this.suggestURI(profile,'bf:Instance',workUri)

        profile.rt[newRdId].instanceOf = workUri



        let adminMetadataProperty = {
          "mandatory": false,
          "propertyLabel": "Admin Metadata",
          "propertyURI": "http://id.loc.gov/ontologies/bibframe/adminMetadata",
          "repeatable": false,
          "resourceTemplates": [],
          '@guid': short.generate(),
          "type": "resource",
          "userValue": {
            "@root":"http://id.loc.gov/ontologies/bibframe/adminMetadata",
            "@type": "http://id.loc.gov/ontologies/bibframe/AdminMetadata",
            "http://id.loc.gov/ontologies/bflc/catalogerId": [
              {
              "@guid": short.generate(),
              "http://id.loc.gov/ontologies/bflc/catalogerId": store.state.catInitials
              }
            ]

          },
          "valueConstraint": {
            "defaults": [],
            "useValuesFrom": [],
            "valueDataType": {},
          "valueTemplateRefs": this.returnAdminMedataToUse(newRdId)
          }
        }

        let adminMetadataPropertyLabel = 'http://id.loc.gov/ontologies/bibframe/adminMetadata|Admin Metadata'
        profile.rt[newRdId].pt[adminMetadataPropertyLabel] = JSON.parse(JSON.stringify(adminMetadataProperty))
        profile.rt[newRdId].ptOrder.push(adminMetadataPropertyLabel)


        profile = this.populateDefaultValuesIntoUserValues(profile,true)


        return profile

    },


    cloneInstance: function(profile, uri){

        
        


        // find the instance first
        for (let rtId in profile.rt){

            if (profile.rt[rtId].URI && profile.rt[rtId].URI == uri){

                let workUri = profile.rt[rtId].instanceOf

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


                // give it all new guids
                for (let pt in profile.rt[newRdId].pt){
                    profile.rt[newRdId].pt[pt]['@guid'] = short.generate()
                }


                // setup the new instance's properies
                profile.rt[newRdId].URI = this.suggestURI(profile,'bf:Instance',workUri)



                // // setup the new instance's properies
                // profile.rt[newRdId].URI = 'http://id.loc.gov/resources/instances/'+ translator.toUUID(translator.new())


                // admin metadata
                for (let key in profile.rt[newRdId].pt){

                    if (profile.rt[newRdId].pt[key].propertyURI == 'http://id.loc.gov/ontologies/bibframe/adminMetadata'){
                        // 

                        // replace with our id
                        profile.rt[newRdId].pt[key].userValue['http://id.loc.gov/ontologies/bflc/catalogerId'] = [
                            {
                                "@guid": short.generate(),
                                "http://id.loc.gov/ontologies/bflc/catalogerId": store.state.catInitials
                            }
                        ]
                    }
                }





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


    loadRecordFromBackend: async function(recordId){



      let xml = await lookupUtil.loadSavedRecord(recordId)

      let meta = parseProfile.returnMetaFromSavedXML(xml)


      

      parseBfdb.parse(meta.xml)

      // alert(parseBfdb.hasItem)

      let useProfile = null


      if (this.profiles[meta.profile]){
        useProfile = JSON.parse(JSON.stringify(this.profiles[meta.profile]))
      }else{
        alert('Cannot find that profile:',meta.profile)
      }

      // we might need to load in a item
      if (parseBfdb.hasItem>0){ 

        
        let useItemRtLabel
        // look for the RT for this item
        let instanceId = meta.rts.filter((id)=>{ return id.includes(':Instance')  })
        if (instanceId.length>0){
          useItemRtLabel = instanceId[0].replace(':Instance',':Item')          
        }

        if (!useItemRtLabel){
          let instanceId = meta.rts.filter((id)=>{ return id.includes(':Work')  })
          if (instanceId.length>0){
            useItemRtLabel = instanceId[0].replace(':Work',':Item')          
          }

        }


        for (let step = 0; step < parseBfdb.hasItem; step++) {
     

            for (let pkey in this.profiles){
              
              for (let rtkey in this.profiles[pkey].rt){
                if (rtkey == useItemRtLabel){
                  let useItem = JSON.parse(JSON.stringify(this.profiles[pkey].rt[rtkey]))
                  useProfile.rtOrder.push(useItemRtLabel+'-'+step)
                  useProfile.rt[useItemRtLabel+'-'+step] = useItem                
                }
              }
            }



        }         

        


      }

      
      
      if (!useProfile.log){
        useProfile.log = []
      
      }
      useProfile.log.push({action:'loadInstanceFromSave',from:meta.eid})
      // useProfile.procInfo= "update instance"


      useProfile.procInfo = meta.procInfo
      
      // console.log('meta',meta)

      // also give it an ID for storage
      useProfile.eId= meta.eid
      useProfile.user = meta.user
      useProfile.status = meta.status


      
      let transformResults  = await parseBfdb.transform(useProfile)

      transformResults = this.reorderRTOrder(transformResults)


      return transformResults



    },



    reorderRTOrder: function(profile){

        //send it a profile and it will reorder the rtOrder based on how it should flow Work->Instance1->Item1,Item2->Instance2-Item2-1,etc..

        //build an item lookup
        let itemLookup = {}

        for (let rt of profile.rtOrder){

            if (rt.includes(':Item')){
                if (profile.rt[rt] && profile.rt[rt].itemOf){
                    itemLookup[rt] = profile.rt[rt].itemOf
                }else{
                    console.warn('Cannot find the itemOf of this item',rt)
                }                
            }
        }

        let newOrder = []
        let theWork = null

        for (let rt of profile.rtOrder){
            if (rt.includes(':Work')){
                theWork = rt
            }

            if (rt.includes(':Instance')){

                
                // add itself in 
                newOrder.push(rt)
                let thisInstanceURI = profile.rt[rt].URI

                // then look for its items
                for (let k in itemLookup){
                    if (itemLookup[k] == thisInstanceURI){
                        
                        newOrder.push(k)                        
                    }
                }
            }
        }

        // add the work first
        if (theWork){
            newOrder.unshift(theWork)
        }


        // as a backup if there is anything in the old order than is not present just toss it in
        for (let rt of profile.rtOrder){
            if (newOrder.indexOf(rt)===-1){
                newOrder.push(rt)
            }


        }


        profile.rtOrder = JSON.parse(JSON.stringify(newOrder))


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


        let user = null
        for (let el of voidData.getElementsByTagName('lclocal:user')){
            user = el.innerHTML
        }




        voidData.remove()

        xml = (new XMLSerializer()).serializeToString(xml)


        return {
            rts:rts,
            xml:xml,
            eid: eid,
            status:status,
            profile:profile,
            procInfo:procInfo,
            user:user

        }
    },




    returnDiagramMiniMap: function(activeProfile){


        
        console.log(activeProfile)

        // this.hasInstance = []
        // this.hasItem = []
        // this.instanceOf = null

        let miniMapWork= false
        let miniMapHub= false
        let miniMapInstance = []

        let workCounter = 0
        let instanceCounter = 0
        let itemCounter = 0

        for (let rt of Object.keys(activeProfile.rt)){        
           
            // there can be only one work, so build the instances this work has in this record
            if (activeProfile.rt[rt].instanceOf){                                             
                miniMapInstance.push({type:'Instance',URI:activeProfile.rt[rt].URI, rt:rt, counter: instanceCounter, jumpTo:activeProfile.rt[rt].ptOrder[1],  details: activeProfile.rt[rt].pt[activeProfile.rt[rt].ptOrder[1]], items:[] })
                instanceCounter++
            }

            // // there is only one work, so all instances are instancOf that work...
            if (rt.includes(':Work')){              
                miniMapWork = {type:'Work',URI:activeProfile.rt[rt].URI, rt:rt, counter:workCounter, jumpTo:activeProfile.rt[rt].ptOrder[1],  details: activeProfile.rt[rt].pt[activeProfile.rt[rt].ptOrder[1]], instances:[]}
                workCounter++
            }

            // // there is only one hub
            if (rt.endsWith(':Hub')){              
                miniMapHub = {type:'Hub',URI:activeProfile.rt[rt].URI, rt:rt, counter:0, jumpTo:activeProfile.rt[rt].ptOrder[1],  details: activeProfile.rt[rt].pt[activeProfile.rt[rt].ptOrder[1]], works:[]}
            }



            // if (rt.includes(':Instance') ){

            //   let thisURI = activeProfile.rt[rt].URI
              
            //   for (let rt2 of Object.keys(activeProfile.rt)){
            //     if (activeProfile.rt[rt2].itemOf && activeProfile.rt[rt2].itemOf == thisURI){
            //       this.hasItem.push(activeProfile.rt[rt2].URI)
            //     }
            //   }
            // }
        }

        for (let instanceData of miniMapInstance){

            instanceData.parent = miniMapWork.URI


            let thisURI = instanceData.URI

            for (let rt2 of Object.keys(activeProfile.rt)){
                if (activeProfile.rt[rt2].itemOf && activeProfile.rt[rt2].itemOf == thisURI){
                  

                    instanceData.items.push({type:'Item', parent:thisURI,URI:activeProfile.rt[rt2].URI, rt:rt2, counter:itemCounter, jumpTo:activeProfile.rt[rt2].ptOrder[1],  details: activeProfile.rt[rt2].pt[activeProfile.rt[rt2].ptOrder[1]]})
                    // itemCounter++
                }
            }

        }

        if (miniMapWork){
            miniMapWork.instances = miniMapInstance
        }

        if(miniMapHub){
            return miniMapHub
        }

        return miniMapWork

    },

    returnAdminMedataToUse: function(rtName){
        if (rtName.includes(":GPO")){
            return ['lc:RT:bf2:GPOMono:AdminMetadata']            
        }
        return ['lc:RT:bf2:AdminMetadata:BFDB']
    },





    // does all the work to setup a new profile read to be eaded and posted as new
    loadNewTemplate(useStartingPoint,addAdmin,userTemplateSupplied){

      if (typeof addAdmin === 'undefined'){
        addAdmin=true
      } 

      let useProfile

      if (userTemplateSupplied){
        useProfile = userTemplateSupplied
      }else{
        useProfile = JSON.parse(JSON.stringify(store.state.profiles[useStartingPoint]))  
      }
      
      
      // some profiles have nested components at the root level used in that component
      // so if it doesn't end with one of the main type of resources we want to edit 
      // then we don't want to render it, since it is probably being used in the main RT somewhere
      let toRemove = []
      let toKeep = []
      for (let rt of useProfile.rtOrder){
        if (!rt.includes(':Work')&&!rt.includes(':Item')&&!rt.includes(':Instance')&&!rt.includes(':Hub')){
          toRemove.push(rt)
        }else{
          toKeep.push(rt)
        }
      }

      for (let rt of toRemove){
        delete useProfile.rt[rt]
      }
      useProfile.rtOrder = toKeep




      if (!useProfile.log){
        useProfile.log=[]
      }
      useProfile.log.push({action:'createWorkInstance'})
      useProfile.procInfo= "create work"


      // also give it an ID for storage
      if (!useProfile.eId){
      let uuid = 'e' + decimalTranslator.new()
      uuid = uuid.substring(0,8)        
      useProfile.eId= uuid

      }

      if (!useProfile.user){
      useProfile.user = this.catInitials
      }

      if (!useProfile.status){
      useProfile.status = 'unposted'
      }

      let workUri = null
      let workUriId = translator.toUUID(translator.new())

      for (let rt in useProfile.rt){
        let uri = null

        // make a new uri for each one
        if (rt.endsWith(':Work')){
          uri = 'http://id.loc.gov/resources/works/' + workUriId
          workUri = uri
        }else if (rt.endsWith(':Instance')){
       
          // when making a new instance from scratch use the work URI Id peice as the instance ID piece
          uri = 'http://id.loc.gov/resources/instances/' + workUriId

        }else if (rt.endsWith(':Item')){  
          uri = 'http://id.loc.gov/resources/items/' + translator.toUUID(translator.new())   
        }else if (rt.endsWith(':Hub')){  
          uri = 'http://id.loc.gov/resources/hubs/' + translator.toUUID(translator.new())   
        }else{
          // dunno what this is give it a random uri
          uri = 'http://id.loc.gov/resources/unknown/' + translator.toUUID(translator.new())       
        }        

        useProfile.rt[rt].URI = uri

        for (let pt in useProfile.rt[rt].pt){

          if (useProfile.rt[rt].pt[pt].propertyURI == "http://id.loc.gov/ontologies/bibframe/Work"){
            // useProfile.rt[rt].pt[pt].userValue['http://id.loc.gov/ontologies/bibframe/Work'] = uri

            useProfile.rt[rt].pt[pt].userValue={
              '@root': 'http://id.loc.gov/ontologies/bibframe/Work',
              '@guid': short.generate() ,
              '@id': uri,
            }



          }
        }


      }


      // apply the data we gathered / created above
      for (let rt in useProfile.rt){
        if (rt.includes(':Work')){
          // something
        }else if (rt.includes(':Instance')){
          //something          
          useProfile.rt[rt].instanceOf = workUri
        }else if (rt.includes(':Item')){  
          //something        
        }  
      }

      console.log('------useProfile-------')
      console.log(useProfile)

      if (addAdmin){


        for (let rt in useProfile.rt){

          let adminMetadataProperty = {
              "mandatory": false,
              "propertyLabel": "Admin Metadata",
              "propertyURI": "http://id.loc.gov/ontologies/bibframe/adminMetadata",
              "repeatable": false,
              "resourceTemplates": [],
              '@guid': short.generate(),
              "type": "resource",
              "userValue": {
                "@root":"http://id.loc.gov/ontologies/bibframe/adminMetadata",
                "@type": "http://id.loc.gov/ontologies/bibframe/AdminMetadata",
                '@guid': short.generate(),
                "http://id.loc.gov/ontologies/bflc/catalogerId": [
                  {
                  "@guid": short.generate(),
                  "http://id.loc.gov/ontologies/bflc/catalogerId": addAdmin
                  }
                ]

              },
              "valueConstraint": {
                "defaults": [],
                "useValuesFrom": [],
                "valueDataType": {},
                "valueTemplateRefs": [  (!rt.includes(':GPO')) ? 'lc:RT:bf2:AdminMetadata:BFDB' :   'lc:RT:bf2:GPOMono:AdminMetadata'   ]
              }
            }

          let adminMetadataPropertyLabel = 'http://id.loc.gov/ontologies/bibframe/adminMetadata|Admin Metadata'

          
          useProfile.rt[rt].pt[adminMetadataPropertyLabel] = JSON.parse(JSON.stringify(adminMetadataProperty))
          useProfile.rt[rt].ptOrder.push(adminMetadataPropertyLabel)
        }
      }





      // console.log(JSON.stringify(useProfile,null,2))


      return useProfile


    },


    prepareTemplate: async function(profile,overwrite){

        console.log(overwrite)
        console.log( profile   )


        profile = JSON.parse(JSON.stringify(profile))


        // we clean up the profile some removing things that are 
        delete profile.eId
        delete profile.log
        delete profile.procInfo
        delete profile.status

        for (let rt in profile.rt){
            delete profile.rt[rt].URI
            delete profile.rt[rt].instanceOf
            delete profile.rt[rt].propertyLoadRatio
            delete profile.rt[rt].propertyLoadReport        
            delete profile.rt[rt].unusedXml
            delete profile.rt[rt].status
        }

        let savedTemplate = {

            id: (profile.templateId) ? (profile.templateId) : md5(profile.user+new Date().toLocaleString()),
            profile: JSON.stringify(profile),
            user:profile.user,
            label:profile.templateLabel,
            basedOnProfile: Object.keys(profile.rt),
            timestamp: parseInt(Date.now()/1000)

        }

        // if the overwrite flag is set then make a new md5 id always

        if (overwrite && profile.templateId){
            savedTemplate.id = md5(profile.user+new Date().toLocaleString())
        }

        let utilUrl = config.returnUrls().util

        let url = `${utilUrl}templates/`

        console.log("savedTemplate",savedTemplate)

        const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(savedTemplate)
        });


        if (!response.ok) {

            const content = await JSON.stringify(response.json());

            alert('Could not save template' + content)

        }



    },



}



export default parseProfile;


