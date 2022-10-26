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

const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)


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
            if (this.startingPoints[sp.menuGroup].hub){
                this.profiles[sp.menuGroup].rt[this.startingPoints[sp.menuGroup].hub] = plookup[this.startingPoints[sp.menuGroup].hub]
                this.profiles[sp.menuGroup].rtOrder.push(this.startingPoints[sp.menuGroup].hub)
            }
            if (this.startingPoints[sp.menuGroup].work){
                this.profiles[sp.menuGroup].rt[this.startingPoints[sp.menuGroup].work] = plookup[this.startingPoints[sp.menuGroup].work]
                this.profiles[sp.menuGroup].rtOrder.push(this.startingPoints[sp.menuGroup].work)
            }


            if (this.startingPoints[sp.menuGroup].instance){
                this.profiles[sp.menuGroup].rt[this.startingPoints[sp.menuGroup].instance] = plookup[this.startingPoints[sp.menuGroup].instance]
                this.profiles[sp.menuGroup].rtOrder.push(this.startingPoints[sp.menuGroup].instance)
            }

            // if there is a hub and work and instance then always put the hub at the start
            if (this.startingPoints[sp.menuGroup].hub && this.startingPoints[sp.menuGroup].work && this.startingPoints[sp.menuGroup].instance){

                this.profiles[sp.menuGroup].rtOrder = []
                this.profiles[sp.menuGroup].rtOrder.push(this.startingPoints[sp.menuGroup].hub)
                this.profiles[sp.menuGroup].rtOrder.push(this.startingPoints[sp.menuGroup].work)
                this.profiles[sp.menuGroup].rtOrder.push(this.startingPoints[sp.menuGroup].instance)


            }





        })




        

        for (let p in this.profiles){
            this.profiles[p].hashRts = {}
            this.profiles[p].hashPts = {}

            for (let rt in this.profiles[p].rt){
                if (this.profiles[p].rt[rt]){
                    this.profiles[p].hashRts[rt] = this.hashRt(this.profiles[p].rt[rt])

                }   

                if (this.profiles[p].rt[rt] && this.profiles[p].rt[rt].pt){
                    for (let pt in this.profiles[p].rt[rt].pt){
                        // build the key to the property
                        let id = rt + '|' + this.profiles[p].rt[rt].pt[pt].propertyURI
                        if (this.profiles[p].rt[rt].pt[pt].valueConstraint && this.profiles[p].rt[rt].pt[pt].valueConstraint.valueDataType && this.profiles[p].rt[rt].pt[pt].valueConstraint.valueDataType.dataTypeURI && this.profiles[p].rt[rt].pt[pt].valueConstraint.valueDataType.dataTypeURI.trim() != ''){
                            id = id + '|' + this.profiles[p].rt[rt].pt[pt].valueConstraint.valueDataType.dataTypeURI
                        }                        
                        // builds an id like this: lc:RT:bf2:35mmFeatureFilm:Work|http://id.loc.gov/ontologies/bibframe/contribution|http://id.loc.gov/ontologies/bflc/PrimaryContribution
                        let ptVal = JSON.parse(JSON.stringify(this.profiles[p].rt[rt].pt[pt]))
                        delete ptVal['@guid']
                        this.profiles[p].hashPts[id] = hashCode(JSON.stringify(ptVal))
                    }


                }
            }
        }
        // console.log("this.profiles")
        // console.log(this.profiles)
        return { profiles: this.profiles, lookup: this.rtLookup, startingPoints: this.startingPoints}
    },


    // remove the things that change in rts to get a consitant hash
    hashRt: function(rt){
        rt = JSON.parse(JSON.stringify(rt))
        for (let pt in rt.pt){
            delete rt.pt[pt]['@guid']
        }
        return hashCode(JSON.stringify(rt))
    },




    /**
    * a convience function to say if a sepcific type of URI is a literal
    * this allows a single place to change what qualifies as a literal
    * @param {string} URI - the string URI to test
    * @return {bolean}
    */    
    isUriALiteral: function(URI){
        console.log(URI)
        if (config.isLiteral.map((v) => {return v.toLowerCase()}).indexOf(URI.toLowerCase()) > -1){
            return true
        }
        return false
    },


    populateDefaultValuesIntoUserValues: async function(profile,onlyNew){


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

                // console.log("Doing ", pt.propertyURI)

                // if its right there in the PT
                if (pt.valueConstraint.defaults && pt.valueConstraint.defaults.length>0){

                    // make the base predicate

                    pt.userValue[pt.propertyURI] = [{}]

              
                    let userValue = pt.userValue[pt.propertyURI][0]
                    
                    // set the type if needed
                    let thisLevelType = await exportXML.suggestType(pt.propertyURI,rt)

                    if (!this.isUriALiteral(thisLevelType)){
                        userValue['@type'] = thisLevelType
                    }      




                    pt.userValue['@guid'] = short.generate()
                    // its the root level property uri
                    if (pt.propertyURI == pt.userValue['@root']){
                        
                        if (pt.valueConstraint.defaults[0].defaultLiteral){
                            userValue['http://www.w3.org/2000/01/rdf-schema#label'] = [{
                                '@guid': short.generate(),
                                'http://www.w3.org/2000/01/rdf-schema#label':pt.valueConstraint.defaults[0].defaultLiteral
                            }]
                        }
                        if (pt.valueConstraint.defaults[0].defaultURI){
                            userValue['@id'] = pt.valueConstraint.defaults[0].defaultURI
                        }      

                    }else{


                        if (pt.valueConstraint.defaults[0].defaultLiteral){



                            userValue[pt.propertyURI]= [{
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
                            userValue[pt.propertyURI]['@id'] = pt.valueConstraint.defaults[0].defaultURI

                            if (pt.valueConstraint.valueDataType && pt.valueConstraint.valueDataType.dataTypeURI){
                                userValue[pt.propertyURI]['@type'] = pt.valueConstraint.valueDataType.dataTypeURI
                            }

                        }      




                    }
                    // console.log("userValue",userValue)

                }

                // it might be in the reference template, so look at the first one and populate the 
                // default value if it is there, since the first one will be the one on inital display in the editor

                

                if (pt.valueConstraint.valueTemplateRefs && pt.valueConstraint.valueTemplateRefs.length > 0){
                    
                    // does it have reftemplates
                    if (this.rtLookup[pt.valueConstraint.valueTemplateRefs[0]]){
                        // loop through all of the ref templates PTs
                        for (let subpt of this.rtLookup[pt.valueConstraint.valueTemplateRefs[0]].propertyTemplates ){
                            if (subpt.valueConstraint.defaults && subpt.valueConstraint.defaults.length>0){

                                // make the base predicate

                                if (!pt.userValue[pt.propertyURI]){
                                    pt.userValue[pt.propertyURI] = [{}]
                                }
                                
                                let userValue = pt.userValue[pt.propertyURI][0]
                                
                                // set the type if needed
                                let thisLevelType = await exportXML.suggestType(pt.propertyURI,rt)

                                if (!this.isUriALiteral(thisLevelType)){
                                    userValue['@type'] = thisLevelType
                                }     

                                if (subpt.propertyURI == pt.userValue['@root']){
                                    
                                    if (subpt.valueConstraint.defaults[0].defaultLiteral){
                                        userValue['http://www.w3.org/2000/01/rdf-schema#label'] = [{
                                            '@guid': short.generate(),
                                            'http://www.w3.org/2000/01/rdf-schema#label':subpt.valueConstraint.defaults[0].defaultLiteral
                                        }]
                                    }
                                    if (subpt.valueConstraint.defaults[0].defaultURI){
                                        userValue['@id'] = subpt.valueConstraint.defaults[0].defaultURI
                                    }                

                                }else{


                                    if (subpt.valueConstraint.defaults[0].defaultLiteral){

                                        userValue[subpt.propertyURI]= [{
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
                                        if (userValue[subpt.propertyURI][0]){
                                            userValue[subpt.propertyURI][0]['@id'] = subpt.valueConstraint.defaults[0].defaultURI    
                                            if (subpt.valueConstraint.valueDataType && subpt.valueConstraint.valueDataType.dataTypeURI){
                                                userValue[subpt.propertyURI][0]['@type'] = subpt.valueConstraint.valueDataType.dataTypeURI
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

            let baseURI = activeProfile.rt[profile].pt[newPropertyId].propertyURI


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

                
                // make sure the base URI exists in the uservalue
                if (!activeProfile.rt[profile].pt[newPropertyId].userValue[baseURI]){
                    activeProfile.rt[profile].pt[newPropertyId].userValue[baseURI] = [{}]
                }
                let userValue = activeProfile.rt[profile].pt[newPropertyId].userValue[baseURI][0]

                // there are defauts at this level
                // its not a nested component just add it in the first level                
                if (defaultsProperty.valueConstraint.defaults[0].defaultLiteral){
                    console.log(activeProfile.rt[profile].pt[newPropertyId])
                    userValue['http://www.w3.org/2000/01/rdf-schema#label'] = [{
                        '@guid': short.generate(),
                        'http://www.w3.org/2000/01/rdf-schema#label':defaultsProperty.valueConstraint.defaults[0].defaultLiteral
                    }]
                }
                if (defaultsProperty.valueConstraint.defaults[0].defaultURI){
                    userValue['@id'] = defaultsProperty.valueConstraint.defaults[0].defaultURI
                }                  


            }else if (defaultsProperty && defaultsProperty.valueConstraint.valueTemplateRefs.length>0){

                if (!activeProfile.rt[profile].pt[newPropertyId].userValue[baseURI]){
                    activeProfile.rt[profile].pt[newPropertyId].userValue[baseURI] = [{}]
                }
                let userValue = activeProfile.rt[profile].pt[newPropertyId].userValue[baseURI][0]


                // it doesn't exist at the top level, see if it has at least one reference template, if so use the first one and look up if that one has defualt values
                // the first one since it is the default for the referencetemplace componment
                let useRef = defaultsProperty.valueConstraint.valueTemplateRefs[0]

                // look through all of them and add in any default
                for (let refPt of store.state.rtLookup[useRef].propertyTemplates){
                    if (refPt.valueConstraint.defaults.length>0){

                        let defaults = refPt.valueConstraint.defaults[0]


                        if (defaults.defaultLiteral){

                            userValue[refPt.propertyURI]= [{
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
                            if (userValue[refPt.propertyURI][0]){
                                userValue[refPt.propertyURI][0]['@id'] = defaults.defaultURI    
                                if (refPt.valueConstraint.valueDataType && refPt.valueConstraint.valueDataType.dataTypeURI){
                                    userValue[refPt.propertyURI][0]['@type'] = refPt.valueConstraint.valueDataType.dataTypeURI
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
            
            let baseURI = currentState.rt[activeProfileName].pt[component].propertyURI

            console.log('baseURI',baseURI)
            console.log('baseURI',baseURI)
            console.log("nextRef.resourceURI",nextRef.resourceURI)

            // map to the first level
            if (!currentState.rt[activeProfileName].pt[component].userValue[baseURI]){
                currentState.rt[activeProfileName].pt[component].userValue[baseURI]=[{}]
            }

            let userValue = currentState.rt[activeProfileName].pt[component].userValue[baseURI][0]
           
            // always remove the @id
            if (userValue['@id']){
                delete userValue['@id']
            }

            console.log("NEW userValue",userValue)

            // if the @type is stored at the root level change it otherwise it lives in the /agent or /subject or whatever
            // change it there
            if (key == currentState.rt[activeProfileName].pt[component].propertyURI){

                userValue['@type'] = nextRef.resourceURI

            }else{
                // we need to change it in whatever its stored
                if (userValue[key] && userValue[key][0] && userValue[key][0]['@type']){
                    userValue[key][0]['@type'] = nextRef.resourceURI
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
            
            


            for (let key in userValue){
                if (!key.startsWith('@')){
                    if (possibleProperties.indexOf(key)==-1){
                        // 
                        // this property has no place in the ref template we are about to switch to
                        // so store them over in the refTemplateUserValue for later if needed
                        currentState.rt[activeProfileName].pt[component].refTemplateUserValue[key] =JSON.parse(JSON.stringify(userValue[key]))
                        delete userValue[key]
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
                        userValue[pp]= JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].refTemplateUserValue[pp]))
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
                    if (userValue[pt.propertyURI]){
                        userValue[pt.propertyURI] = []
                    }

                    // popualte with the default

                    if (pt.valueConstraint.defaults[0].defaultLiteral){



                        // if the default is for a label property, don't double nest it
                        if (pt.propertyURI === 'http://www.w3.org/2000/01/rdf-schema#label'){

                            userValue[pt.propertyURI]= [
                                {
                                    'http://www.w3.org/2000/01/rdf-schema#label':pt.valueConstraint.defaults[0].defaultLiteral,
                                    '@guid': short.generate(),
                                }                              
                            ]

                        }else{
                            userValue[pt.propertyURI]= [{
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


                        userValue[pt.propertyURI][0]['@id'] = pt.valueConstraint.defaults[0].defaultURI

                        if (pt.valueConstraint.valueDataType && pt.valueConstraint.valueDataType.dataTypeURI){
                            userValue[pt.propertyURI][0]['@type'] = pt.valueConstraint.valueDataType.dataTypeURI
                        }



                    }      




                }
            }







            //currentState.rt[activeProfileName].pt[component].userValue[baseURI][0] = userValue

        

        }
        

        return currentState
    },

    // eslint-disable-next-line
    removeValueSimple: function(currentState, ptGuid, idGuid, labelGuid, propertyPath){


        console.log('idGuid',idGuid)
        console.log('labelGuid',labelGuid)
        // find the pt for the value we are editing
        for (let rt in currentState.rt){
            for (let pt in currentState.rt[rt].pt){

                if (currentState.rt[rt].pt[pt]['@guid'] == ptGuid){

                    // console.log("propertyPath",propertyPath)

                    let removed = false
                    let userValue = currentState.rt[rt].pt[pt].userValue

                    // filter out any bnodes with that guid starting from the bottom of the hiearchy
                    // then go through and check if we left an empty bnode hiearchy and if so delete it
                    if (propertyPath.length==4){
                        let L0URI = propertyPath[0].propertyURI
                        let L1URI = propertyPath[1].propertyURI
                        let L2URI = propertyPath[2].propertyURI
                        let L3URI = propertyPath[3].propertyURI

                        let f = userValue[L0URI][0][L1URI][0][L2URI][0][L3URI].filter((v=>{ return (v['@guid'] && (v['@guid'] != idGuid && v['@guid'] != labelGuid))}))
                        if (f.length < userValue[L0URI][0][L1URI][0][L2URI][0][L3URI].length){
                            removed = true
                            userValue[L0URI][0][L1URI][0][L2URI][0][L3URI] = f
                        }
                        if (userValue[L0URI][0][L1URI][0][L2URI][0][L3URI].length==0){
                            delete userValue[L0URI][0][L1URI][0][L2URI][0][L3URI]
                        }


                        // then check to see if the parent bnode of the thing we just deleted is now an empty bnode
                        // if so then remove it. filter on any of the keys that are not important if the bnode is empty and if it is zero then there is nothing to save
                        if (Object.keys(userValue[L0URI][0][L1URI][0][L2URI][0]).filter((k) => { return (k != '@guid' && k != '@id' && k !='@type' && k !='@flags') }).length==0){
                            userValue[L0URI][0][L1URI][0][L2URI].pop()
                        }
                    }

                    if (propertyPath.length==3){
                        let L0URI = propertyPath[0].propertyURI
                        let L1URI = propertyPath[1].propertyURI
                        let L2URI = propertyPath[2].propertyURI
                        // console.log("here userValue[L0URI][0][L1URI][0][L2URI]",userValue[L0URI][0][L1URI][0][L2URI])
                        let f = userValue[L0URI][0][L1URI][0][L2URI].filter((v=>{ return (v['@guid'] && v['@guid'] != idGuid && v['@guid'] != labelGuid)}))
                        // console.log("f is",f)

                        if (f.length < userValue[L0URI][0][L1URI][0][L2URI].length){
                            removed = true
                            userValue[L0URI][0][L1URI][0][L2URI] = f
                        }
     

                        if (userValue[L0URI][0][L1URI][0][L2URI].length==0){
                            delete userValue[L0URI][0][L1URI][0][L2URI]
                        }

                        // then check to see if the parent bnode of the thing we just deleted is now an empty bnode
                        // if so then remove it. filter on any of the keys that are not important if the bnode is empty and if it is zero then there is nothing to save
                        if (Object.keys(userValue[L0URI][0][L1URI][0]).filter((k) => { return (k != '@guid' && k != '@id' && k !='@type' && k !='@flags') }).length==0){
                            userValue[L0URI][0][L1URI].pop()
                        }

                    }
                    if (propertyPath.length==2){
                        let L0URI = propertyPath[0].propertyURI
                        let L1URI = propertyPath[1].propertyURI

                        // console.log("userValue[L0URI]",userValue[L0URI])
                        let f = userValue[L0URI][0][L1URI].filter((v=>{ return (v['@guid'] && v['@guid'] != idGuid && v['@guid'] != labelGuid)}))
                        if (f.length < userValue[L0URI][0][L1URI].length){
                            removed = true
                            userValue[L0URI][0][L1URI] = f
                        }
     

                        if (userValue[L0URI][0][L1URI].length==0){
                            delete userValue[L0URI][0][L1URI]
                        }

                        // then check to see if the parent bnode of the thing we just deleted is now an empty bnode
                        // if so then remove it. filter on any of the keys that are not important if the bnode is empty and if it is zero then there is nothing to save
                        if (Object.keys(userValue[L0URI][0]).filter((k) => { return (k != '@guid' && k != '@id' && k !='@type' && k !='@flags') }).length==0){
                            userValue[L0URI].pop()
                        }



                    }
                    if (propertyPath.length==1){
                        let L0URI = propertyPath[0].propertyURI

                        let f = userValue[L0URI].filter((v=>{ return (v['@guid'] && v['@guid'] != idGuid && v['@guid'] != labelGuid)}))
                        if (f.length < userValue[L0URI].length){
                            removed = true
                            userValue[L0URI] = f
                        }


                        if (userValue[L0URI].length==0){
                            delete userValue[L0URI]
                        }



                    }




                    // // the root node is the lookup val, reset the uservale to remove
                    // if (idGuid != null && currentState.rt[rt].pt[pt].userValue['@guid'] == idGuid){
                    //     currentState.rt[rt].pt[pt].userValue = {'@root':currentState.rt[rt].pt[pt].propertyURI}
                    //     removed = true
                    // }else if (idGuid != null) {

                    //     // search through the properties to see if we have this guid anywhere

                    //     for (let uvLvl1PropertyName in currentState.rt[rt].pt[pt].userValue){

                    //         if (Array.isArray(currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName])){

                    //             let removeIdx = -1
                    //             let counter = -1
                    //             for (let childValueObj of currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName]){
                    //                 counter++
                    //                 if (childValueObj['@guid'] && childValueObj['@guid'] == idGuid){
                    //                     removeIdx = counter
                    //                     removed = true
                    //                 }
                    //             }
                    //             if (removeIdx>-1){
                    //                 currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName].splice(removeIdx,1)
                    //                 // if we removed the only/last one remove the property
                    //                 if (currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName].length==0){
                    //                     delete currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName]
                    //                 }
                    //             }
                    //         }
                    //     }
                    // }else if (labelGuid != null) {

                    //     // search through the properties to see if we have this guid anywhere
                    //     for (let uvLvl1PropertyName in currentState.rt[rt].pt[pt].userValue){

                    //         if (Array.isArray(currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName])){

                    //             let removeIdx = -1
                    //             let counter = -1
                    //             for (let childValueObj of currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName]){
                    //                 counter++


                    //                 // look for the label that has that label guid and delte the parent
                    //                 for (let uvLvl2PropertyName in childValueObj){
                    //                     if (Array.isArray(childValueObj[uvLvl2PropertyName])){

                    //                         // if it is an array see what guids it has

                    //                         let guids = childValueObj[uvLvl2PropertyName].map((x)=>{ return x['@guid']})

                    //                         if (guids.indexOf(labelGuid)>-1){
                    //                             removeIdx = counter
                    //                         }
                    //                     }

                    //                 }

                    //             }
                    //             if (removeIdx>-1){
                    //                 currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName].splice(removeIdx,1)
                    //                 // if we removed the only/last one remove the property
                    //                 if (currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName].length==0){
                    //                     delete currentState.rt[rt].pt[pt].userValue[uvLvl1PropertyName]
                    //                     removed = true
                    //                 }
                    //             }



                    //         }

                    //     }



                    // }



                    if (removed){


                        
                        store.state.activeUndoLog.push(`Removed lookup value from ${exportXML.namespaceUri(currentState.rt[rt].pt[pt].propertyURI)}`)

                        break
                    }

                }


            }
        }


        // store.state.activeUndoLog.push(`Transfered property ${exportXML.namespaceUri(activeProfile.rt[from.profile].pt[from.componet].propertyURI)}`)



        return currentState
    },




    setValueSimple: async function(currentState, ptGuid, valueURI, valueLabel, propertyPath){

        let results = {newData:{}}

        console.log("-------------Adding DATA---------------")
        console.log('currentState',currentState)
        console.log('ptGuid',ptGuid)
        console.log('propertyPath',propertyPath)
        console.log('valueURI',valueURI)
        console.log('valueLabel',valueLabel)


        for (let rt in currentState.rt){
            for (let pt in currentState.rt[rt].pt){
                if (currentState.rt[rt].pt[pt]['@guid'] == ptGuid){

                    let userValue = currentState.rt[rt].pt[pt].userValue

                    // we are adding the rdfs:label and the @id to this property
                    // we just need to know where to put it

                    // a reference to allow us to write to the end of the hierarchy
                    let currentUserValuePos = userValue

                    // used as a reference to the last postion's parent, so we can easily add a new sibling
                    let currentUserValuePosParent = null

                    // keeps track of the @type, will be the last @type of the hiearchy when done looping
                    let thisLevelType

                    // console.log(currentState.rt[rt].pt[pt])


                    for (let p of propertyPath){



                        if (!currentUserValuePos[p.propertyURI]){
                            currentUserValuePos[p.propertyURI] = []
                        }


                        thisLevelType = await this.suggestTypeImproved(p.propertyURI,currentState.rt[rt].pt[pt])
                        // console.log("thisLevelType frist",thisLevelType)

                        if (!thisLevelType){
                            thisLevelType = await exportXML.suggestType(p.propertyURI,rt)
                        }
                        
                        // console.log("p.propertyURI",p.propertyURI)

                        // console.log("thisLevelType",thisLevelType)
                        let thisLevel = {'@guid':short.generate()}
                        if (!this.isUriALiteral(thisLevelType)){
                            thisLevel['@type'] = thisLevelType
                        }

                        if (currentUserValuePos[p.propertyURI].length==0){
                            currentUserValuePos[p.propertyURI].push(thisLevel)
                        }

                        currentUserValuePosParent = currentUserValuePos[p.propertyURI]
                        currentUserValuePos = currentUserValuePos[p.propertyURI][0]
                    }

                    

                    // now the hiearchy exists, if it did not before, add in the value
                    // if it doesn't have a value yet over write the [0] which is the one we just made
                    if (!currentUserValuePos['@id'] && !currentUserValuePos['http://www.w3.org/2000/01/rdf-schema#label']){

                        if (valueLabel){
                            currentUserValuePos['http://www.w3.org/2000/01/rdf-schema#label']  = [{
                                '@guid' : short.generate(),
                                'http://www.w3.org/2000/01/rdf-schema#label': valueLabel
                            }]
                        }
                        if (valueURI){
                            currentUserValuePos['@id']  = valueURI
                        }

                        results.newData = {'guid': currentUserValuePos['@guid'], valueLabel: valueLabel, valueURI:valueURI }

                    }else{

                        // it has a value, so create a new one and through it into 
                        let newVal = {'@guid':short.generate()}
                        
                        if (!this.isUriALiteral(thisLevelType)){
                            newVal['@type'] = thisLevelType
                        }

                        if (valueLabel){
                            newVal['http://www.w3.org/2000/01/rdf-schema#label']  = [{
                                '@guid' : short.generate(),
                                'http://www.w3.org/2000/01/rdf-schema#label': valueLabel
                            }]
                        }
                        if (valueURI){
                            newVal['@id']  = valueURI
                        }

                        currentUserValuePosParent.push(newVal)
                        results.newData = {'guid': newVal['@guid'], valueLabel: valueLabel, valueURI:valueURI }


                    }


                    store.state.activeUndoLog.push(`Added lookup value ${valueLabel} to ${exportXML.namespaceUri( propertyPath[propertyPath.length-1].propertyURI  )}`)

                    console.log("userValue =",userValue)


                }
            }
        }





        // // find the pt for the value we are editing
        // for (let rt in currentState.rt){

        //     for (let pt in currentState.rt[rt].pt){

        //         if (currentState.rt[rt].pt[pt]['@guid'] == ptGuid){

        //             let userValue = currentState.rt[rt].pt[pt].userValue


        //             // top level
        //             if (currentState.rt[rt].pt[pt].propertyURI == URI){
        //                 // console.log("--- top level")
        //                 //s

        //                 let topLvlTmpGuid = short.generate()
        //                 let tmpGuid = short.generate()
                        

        //                 if (valueLabel){

        //                     if (!userValue['http://www.w3.org/2000/01/rdf-schema#label']){
        //                         userValue['http://www.w3.org/2000/01/rdf-schema#label'] = []    
        //                     }else{

        //                         // if we are adding multi values to the top level simple look up give the 
        //                         // exporter a little help to know what to do
        //                         // this is not really a expected behavior ( to add multiple lookups to a top level simple look up but..)
        //                         if (!userValue['@flags']){
        //                             userValue['@flags'] = ['simpleLookupTopLevelMulti']
        //                         }
        //                     }
                                                    

        //                     userValue['@guid'] = topLvlTmpGuid
        //                     userValue['http://www.w3.org/2000/01/rdf-schema#label'].push(

        //                         {
        //                             '@guid': tmpGuid,
        //                             'http://www.w3.org/2000/01/rdf-schema#label':valueLabel

        //                         }

        //                     )
        //                     store.state.activeUndoLog.push(`Added lookup value ${valueLabel} to ${exportXML.namespaceUri(URI)}`)

                            
        //                 }
        //                 if (valueURI && !userValue['@id']){
        //                     userValue['@id'] = valueURI
        //                 }


                        
        //                 results.newData = {'guid': topLvlTmpGuid, valueLabel: valueLabel, valueURI:valueURI }




        //             }else{

        //                 if (!userValue[URI]){
        //                     userValue[URI] = []
        //                 }

        //                 // console.log("--- not top level")

        //                 let newData = {'@guid': short.generate()}
        //                 newData['@type'] = await exportXML.suggestType(URI)
        //                 if (valueLabel){
        //                     newData['http://www.w3.org/2000/01/rdf-schema#label'] = []

        //                     newData['http://www.w3.org/2000/01/rdf-schema#label'].push(

        //                         {
        //                             '@guid': short.generate(),
        //                             'http://www.w3.org/2000/01/rdf-schema#label':valueLabel

        //                         }

        //                     )
        //                     store.state.activeUndoLog.push(`Added lookup value ${valueLabel} to ${exportXML.namespaceUri(URI)}`)


                            
        //                 }
        //                 if (valueURI){
        //                     newData['@id'] = valueURI
        //                 }

        //                 userValue[URI].push(newData)
                        
        //                 results.newData = {'guid': newData['@guid'], valueLabel: valueLabel, valueURI:valueURI }


                      


        //             }

        //             // always make sure there is a type
        //             if (!userValue['@type']){
        //                 userValue['@type'] = await exportXML.suggestType(currentState.rt[rt].pt[pt].propertyURI)
                        
        //             }

        //         }

                


        //     }

        // }



        results.currentState = currentState

        return results


    },

    // eslint-disable-next-line
    setValueLiteral: async function(currentState, ptGuid, guid, value, propertyPath){


        let results = {newGuid:null}



        // console.log("Start New STATE ---------down arrow down arrow down arrow---------------")
        // console.log("currentState",currentState)
        // console.log("ptGuid",ptGuid)
        // console.log("guid",guid)
        // console.log("value",value)
        // console.log("propertyPath",propertyPath)


        // find the pt for the value we are editing
        for (let rt in currentState.rt){
            for (let pt in currentState.rt[rt].pt){
                if (currentState.rt[rt].pt[pt]['@guid'] == ptGuid){

                    let userValue = currentState.rt[rt].pt[pt].userValue
                    // console.log('propertyPath',propertyPath)
                    // console.log(userValue)
                    // if the guid was passed that means we are editing an existing value in the userValue
                    // otherwise we are creating one
                    if (guid){

                        //
                        // console.log("guidguidguidguid",guid)

                        // we know where to look because we have the property path
                        if (propertyPath.length === 1){

                            let L0URI = propertyPath[0].propertyURI
                            if (userValue[L0URI]){
                                for (let uv of userValue[L0URI]){
                                    if (uv[L0URI] && uv['@guid'] === guid){
                                        uv[L0URI] = value
                                        break
                                    }
                                }
                            }
                        }else if (propertyPath.length === 2){

                            let L0URI = propertyPath[0].propertyURI
                            let L1URI = propertyPath[1].propertyURI

                            if (userValue[L0URI] && userValue[L0URI][0] && userValue[L0URI][0][L1URI]){
                                let filterVal = userValue[L0URI][0][L1URI].filter((v) => { return (v['@guid'] === guid)})
                                if (filterVal && filterVal[0]){
                                    filterVal[0][L1URI] = value
                                }
                            }

                        }else if (propertyPath.length === 3){

                            let L0URI = propertyPath[0].propertyURI
                            let L1URI = propertyPath[1].propertyURI
                            let L2URI = propertyPath[2].propertyURI

                            if (userValue[L0URI] && userValue[L0URI][0] && userValue[L0URI][0][L1URI] && userValue[L0URI][0][L1URI][0] && userValue[L0URI][0][L1URI][0][L2URI]){
                                let filterVal = userValue[L0URI][0][L1URI][0][L2URI].filter((v) => { return (v['@guid'] === guid)})
                                if (filterVal && filterVal[0]){
                                    filterVal[0][L2URI] = value
                                }
                            }




                        }else if (propertyPath.length === 4){

                            let L0URI = propertyPath[0].propertyURI
                            let L1URI = propertyPath[1].propertyURI
                            let L2URI = propertyPath[2].propertyURI
                            let L3URI = propertyPath[3].propertyURI
                            
                            if (userValue[L0URI] && userValue[L0URI][0] && userValue[L0URI][0][L1URI] && userValue[L0URI][0][L1URI][0] && userValue[L0URI][0][L1URI][0][L2URI] && userValue[L0URI][0][L1URI][0][L2URI][0] && userValue[L0URI][0][L1URI][0][L2URI][0][L3URI]){
                                let filterVal = userValue[L0URI][0][L1URI][0][L2URI][0][L3URI].filter((v) => { return (v['@guid'] === guid)})
                                if (filterVal && filterVal[0]){
                                    filterVal[0][L3URI] = value
                                }
                            }



                        }else{

                            console.error("Error trying to update literal value but cannot find guid")
                        }



                    }else{

                        //
                         // console.log("propertyPath.length",propertyPath.length)

                        // this will be the new userValue
                        //let data = {'@guid': short.generate()}

                        if (propertyPath.length==0){ 
                            console.error("Something is wrong with propertyPath, reading zero levels, no place to set data.")

                        // we need to build the hiearchy or reuse the hiearchy 
                        // we could do a recursive thing here but the depth is really usually only 2 levels max, 3 is extream, so we will accomdate 3 levels   

                        }else if(propertyPath.length === 1){

                            // this level is like
                            // <bf:orignDate>1234</bf:orignDate>


                            let L0URI = propertyPath[0].propertyURI

                            let data = {'@guid': short.generate()}

                            // length is one, it means it is a rool level value, not in a bnode
                            // so set the value 
                            data[L0URI] = value
                            // does this proerty exist at this level yet, if so push it otherwise make it
                            if (!userValue[L0URI]){
                                userValue[L0URI] = []
                            }
                            userValue[L0URI].push(data)
                            results.newGuid = data['@guid']


                        }else if (propertyPath.length >= 2){

                            // this level is like
                            // <bf:title>
                            //   <bf:Title>
                            //     <bf:mainTitle>hallo</bf:mainTitle>

                            let L0URI = propertyPath[0].propertyURI
                            let L1URI = propertyPath[1].propertyURI

                            // build the L0 if it doesn't exist
                            // if it does find it and referenece it


                            let L0Type = await this.suggestTypeImproved(L0URI,currentState.rt[rt].pt[pt])
                            if (!L0Type){
                                L0Type = await exportXML.suggestType(L0URI,rt)
                            }


                            // we may or maynot need this
                            let L0New = {
                                '@guid': short.generate(),
                                '@type': L0Type
                            }

                            if (!userValue[L0URI]){
                                userValue[L0URI] = [L0New]
                            }else{
                                if (userValue[L0URI].length===0){
                                    // it exists but is empty for some reason
                                    // add it in
                                    userValue[L0URI].push(L0New)
                                }else if (userValue[L0URI].length>1){
                                    console.error(L0URI, 'has more than one blank node of the same type?')
                                }
                            }


                            // let L1Type = await exportXML.suggestType(L1URI)
                            let L1Type = await this.suggestTypeImproved(L1URI,currentState.rt[rt].pt[pt])
                            if (!L1Type){
                                L1Type = await exportXML.suggestType(L1URI,rt)
                            }

                            let L1New = {
                                '@guid': short.generate(),
                                '@type': L1Type
                            }
                            // if we done at this level then set the value
                            // it may be the case that we need to keep going deeper
                            if (propertyPath.length === 2){
                                L1New[L1URI] = value
                                results.newGuid = L1New['@guid']
                            }

                            // literals dont have @types in our export process
                            // its used to test, so remove it if this level is a literal
                            if (this.isUriALiteral(L1Type)){
                                delete L1New['@type']
                            }

                            // we can attach the L1 to the L0 bnode
                            if (!userValue[L0URI][0][L1URI]){
                                userValue[L0URI][0][L1URI] = []
                            }
                            userValue[L0URI][0][L1URI].push(L1New)
                            

                            // keep it going if needed
                            if (propertyPath.length >= 3){

                                let L2URI = propertyPath[2].propertyURI
                                // let L2Type = await exportXML.suggestType(L2URI)
                                let L2Type = await this.suggestTypeImproved(L2URI,currentState.rt[rt].pt[pt])
                                if (!L2Type){
                                    L2Type = await exportXML.suggestType(L2URI,rt)
                                }

                                let L2New = {
                                    '@guid': short.generate(),
                                    '@type': L2Type
                                }
                                

                                // literals dont have @types in our export process
                                // its used to test, so remove it if this level is a literal
                                if (this.isUriALiteral(L2Type)){
                                    delete L2New['@type']
                                }

                                // we can attach the L2 to the L1 bnode
                                if (!userValue[L0URI][0][L1URI][0][L2URI]){
                                    userValue[L0URI][0][L1URI][0][L2URI] = []
                                }
                                userValue[L0URI][0][L1URI][0][L2URI].push(L2New)

                                if (propertyPath.length === 3){
                                    results.newGuid = L2New['@guid']
                                    L2New[L2URI] = value
                                }

                                // keep it going if needed
                                if (propertyPath.length >= 4){

                                    let L3URI = propertyPath[3].propertyURI
                                    // let L3Type = await exportXML.suggestType(L3URI)
                                    let L3Type = await this.suggestTypeImproved(L3URI,currentState.rt[rt].pt[pt])
                                    if (!L3Type){
                                        L3Type = await exportXML.suggestType(L3URI,rt)
                                    }

                                    let L3New = {
                                        '@guid': short.generate(),
                                        '@type': L3Type
                                    }
                                    

                                    // literals dont have @types in our export process
                                    // its used to test, so remove it if this level is a literal
                                    if (this.isUriALiteral(L3Type)){
                                        delete L3New['@type']
                                    }

                                    if (propertyPath.length === 4){
                                        results.newGuid = L3New['@guid']
                                        L3New[L3URI] = value
                                    }


                                    // we can attach the L3 to the L2 bnode
                                    if (!userValue[L0URI][0][L1URI][0][L2URI][0][L3URI]){
                                        userValue[L0URI][0][L1URI][0][L2URI][0][L3URI] = []
                                    }
                                    userValue[L0URI][0][L1URI][0][L2URI][0][L3URI].push(L3New)


                                }



                            }

                        }else{
                            console.error("Error trying to write to the correct literal level")
                        }



                    }

                    // if we found the ptGuid thats it
                    break

                }
            }
        }




        // console.log("End New STATE  -----------^^^^^^-------------")

        // if (guid === 3){

            
        //     // console.log(currentState, ptGuid, guid, parentURI, URI, value)
        //     // console.log('before:',JSON.parse(JSON.stringify(currentState)))

        //     // find the pt for the value we are editing
        //     for (let rt in currentState.rt){

        //         for (let pt in currentState.rt[rt].pt){
        //             if (currentState.rt[rt].pt[pt]['@guid'] == ptGuid){

        //                 // console.log("found the existing PTguid",currentState.rt[rt].pt[pt])
        //                 let userValue = currentState.rt[rt].pt[pt].userValue

        //                 if (guid){
        //                     // console.log("here1")
        //                     // it already has a guid, so we are editing an existing value
        //                     if (parentURI){
        //                         // console.log("here2")
        //                         // if we have the parent URi try to search using both 
        //                         if (userValue[parentURI]){
        //                             // console.log("here3")
        //                             for (let parentValueArray of userValue[parentURI]){
        //                                 if (parentValueArray[URI]){          
        //                                   // console.log(JSON.parse(JSON.stringify(parentValueArray[URI])))
        //                                   for (let childValue of parentValueArray[URI]){
        //                                     if (childValue['@guid'] == guid){
        //                                         // console.log(JSON.parse(JSON.stringify(childValue)))
        //                                         // console.log("here5",childValue,guid,URI)
        //                                         childValue[URI] = value                                            
        //                                         if (value && value.length==0){
        //                                             // value is null remove the property
        //                                             // if it is a multiliteral make sure we remvoe the correct one                                            
        //                                             if (parentValueArray[URI].length>1){
        //                                                 parentValueArray[URI] = parentValueArray[URI].filter((v)=>{ return (v['@guid'] != guid) })
        //                                             }else{
        //                                                 delete parentValueArray[URI]    
        //                                             }
        //                                             results.newGuid=false
        //                                             // console.log("here5a")
        //                                         }else if (!value){
        //                                             // value is null remove the property
        //                                             // if it is a multiliteral make sure we remvoe the correct one
        //                                             if (parentValueArray[URI].length>1){
        //                                                 parentValueArray[URI] = parentValueArray[URI].filter((v)=>{ return (v['@guid'] != guid) })
        //                                             }else{
        //                                                 delete parentValueArray[URI]    
        //                                             }

        //                                             results.newGuid=false
        //                                             // console.log("here5b")
        //                                         }

        //                                     }
        //                                   }
        //                                 }
        //                             }
        //                         }else{

        //                             // console.log("here6")
        //                             // just search using the propertyURI
        //                             if (userValue[URI]){
        //                               // console.log("here611")  
        //                               for (let childValue of userValue[URI]){
        //                                 if (childValue['@guid'] == guid){
        //                                     childValue[URI] = value
        //                                     if (value && value.length==0){


        //                                         if (userValue[URI].length>1){
        //                                             userValue[URI] = userValue[URI].filter((v)=>{ return (v['@guid'] != guid) })
        //                                         }else{
        //                                             delete userValue[URI]    
        //                                         }

        //                                         results.newGuid=false
        //                                         // console.log("here66")
        //                                     }else if (!value){
        //                                         // value is null remove the property
        //                                         if (userValue[URI].length>1){
        //                                             userValue[URI] = userValue[URI].filter((v)=>{ return (v['@guid'] != guid) })
        //                                         }else{
        //                                             delete userValue[URI]    
        //                                         }


        //                                         results.newGuid=false
        //                                         // console.log("here666")
        //                                     }

        //                                 }
        //                               }
        //                             }

        //                         }
        //                     }else{
        //                         // console.log("here7")
        //                         // not nested
        //                         if (userValue[URI]){
        //                           for (let childValue of userValue[URI]){
        //                             if (childValue['@guid'] == guid){
        //                                 childValue[URI] = value
        //                                 if (value && value.length==0){

        //                                     if (userValue[URI].length>1){
        //                                         userValue[URI] = userValue[URI].filter((v)=>{ return (v['@guid'] != guid) })
        //                                     }else{
        //                                         delete userValue[URI]    
        //                                     }

        //                                     results.newGuid=false
        //                                 }else if (!value){
        //                                     // value is null remove the property

        //                                     if (userValue[URI].length>1){
        //                                         userValue[URI] = userValue[URI].filter((v)=>{ return (v['@guid'] != guid) })
        //                                     }else{
        //                                         delete userValue[URI]    
        //                                     }

        //                                     results.newGuid=false
        //                                 }

        //                             }


        //                           }
        //                         }


        //                     }





        //                 }else{

                            

        //                     // we are not editing, we are creating a new node
        //                     // can we find the uri to use, 

        //                     let data = {'@guid': short.generate()}

        //                     // if there is no type yet and this is not a literal component PT then
        //                     // it needs to have a type assigned
        //                     // console.log('creating',currentState.rt[rt].pt[pt])
        //                     if (currentState.rt[rt].pt[pt].type != 'literal' && !currentState.rt[rt].pt[pt].userValue['@type']){

        //                         currentState.rt[rt].pt[pt].userValue['@type'] = await exportXML.suggestType(currentState.rt[rt].pt[pt].propertyURI)

        //                         // it might be that it is a reftemplate though
        //                         // so see if the ref templates have any valueDataType we should use (use the first one if so)
        //                         if (currentState.rt[rt].pt[pt].valueConstraint.valueTemplateRefs.length>0){
        //                             if (this.rtLookup[currentState.rt[rt].pt[pt].valueConstraint.valueTemplateRefs[0]]){
        //                                 if (this.rtLookup[currentState.rt[rt].pt[pt].valueConstraint.valueTemplateRefs[0]].resourceURI){
        //                                     currentState.rt[rt].pt[pt].userValue['@type'] = this.rtLookup[currentState.rt[rt].pt[pt].valueConstraint.valueTemplateRefs[0]].resourceURI
        //                                 }
        //                             }
                                    
        //                         }

        //                         // console.log(structure)
        //                     }

        //                     results.newGuid = data['@guid']
        //                     data[URI] = value

        //                     if (userValue['@root'] == parentURI && !userValue[URI]){
        //                         //we have no data at all yet
                                
                                
        //                         userValue[URI] = []
        //                         userValue[URI].push(data)


        //                     }else if (userValue['@root'] == parentURI && userValue[URI]){
        //                         // we have the property created already, just add it to that one
        //                         userValue[URI].push(data)
                                

        //                     }else if (userValue['@root'] != parentURI && parentURI && !userValue[parentURI]){
        //                         // we are using the parent but its not made yet
        //                         userValue[parentURI] = []
        //                         let subUri = {'@guid': short.generate()}
        //                         subUri['@type'] = await exportXML.suggestType(parentURI)

        //                         subUri[URI] = []
        //                         subUri[URI].push(data)
        //                         userValue[parentURI].push(subUri)


                                


        //                     }else if (userValue['@root'] != parentURI && userValue[parentURI] && userValue[parentURI].length == 1 && !userValue[parentURI][0][URI]){
        //                         // we are using the parent but the child URI is not made yet
        //                         userValue[parentURI][0][URI] = []
        //                         userValue[parentURI][0][URI].push(data)
                                

        //                     }else if (userValue['@root'] != parentURI && userValue[parentURI] && userValue[parentURI].length == 1 && userValue[parentURI][0][URI]){
        //                         // everything exists, just add the new value
        //                         userValue[parentURI][0][URI].push(data)
                                

        //                     }else if (userValue['@root'] == URI && !userValue[URI]){

        //                         // no data yet
        //                         userValue[URI] = []
        //                         userValue[URI].push(data)



        //                     }else{

        //                         console.error('---------------------------------------------')
        //                         console.error('Cannot find the right place to insert this value')
        //                         console.error('currentState, ptGuid, guid, parentURI, URI, value')
        //                         console.error(currentState, ptGuid, guid, parentURI, URI, value)
        //                         console.error('---------------------------------------------')

        //                     }
                            



        //                 }

                        

        //                 // we found it stop looping
        //                 break
        //             }
        //         }
                
        //     }        

        // }


        // let pURI = (parentURI) ? parentURI : URI;
        let pURI = propertyPath[propertyPath.length - 1].propertyURI


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
    
    setValueSubject: async function(currentState, component, activeProfileName, subjectComponents,propertyPath){

        // we're just going to overwrite the whole userValue with the constructed headings

        console.log(propertyPath)

        // find it
        if (currentState.rt[activeProfileName].pt[component]){


            // build out the hiearchy
            let userValue = {}

            // build the hiearchy if it doesn't exist to place the data

            // we are adding the rdfs:label and the @id to this property
            // we just need to know where to put it

            // a reference to allow us to write to the end of the hierarchy
            let currentUserValuePos = userValue

            // used as a reference to the last postion's parent, so we can easily add a new sibling
            // let currentUserValuePosParent = null

            // keeps track of the @type, will be the last @type of the hiearchy when done looping
            let thisLevelType

            for (let p of propertyPath){

                // if the property is owl:sameAs it is the last field 
                // of where we are building the entitiy, so we don't  want
                // bf:Agent -> owl:sameAs we just want the bf:Agent with values filed in there
                if (p.propertyURI=='http://www.w3.org/2002/07/owl#sameAs'){
                    break
                }
                // same with component list, we'll build that manually
                if (p.propertyURI=='http://www.loc.gov/mads/rdf/v1#componentList'){
                    break
                }



                if (!currentUserValuePos[p.propertyURI]){
                    currentUserValuePos[p.propertyURI] = []
                }
                thisLevelType = await exportXML.suggestType(p.propertyURI)
                let thisLevel = {'@guid':short.generate()}
                if (!this.isUriALiteral(thisLevelType)){
                    thisLevel['@type'] = thisLevelType
                }
                if (currentUserValuePos[p.propertyURI].length==0){
                    currentUserValuePos[p.propertyURI].push(thisLevel)
                }
                // currentUserValuePosParent = currentUserValuePos[p.propertyURI]
                currentUserValuePos = currentUserValuePos[p.propertyURI][0]
            } 


            if (currentState.rt[activeProfileName].pt[component].userValue["http://id.loc.gov/ontologies/bibframe/subject"] &&
                currentState.rt[activeProfileName].pt[component].userValue["http://id.loc.gov/ontologies/bibframe/subject"][0] &&
                currentState.rt[activeProfileName].pt[component].userValue["http://id.loc.gov/ontologies/bibframe/subject"][0]["http://id.loc.gov/ontologies/bibframe/source"] &&
                currentState.rt[activeProfileName].pt[component].userValue["http://id.loc.gov/ontologies/bibframe/subject"][0]["http://id.loc.gov/ontologies/bibframe/source"][0]){

                userValue["http://id.loc.gov/ontologies/bibframe/subject"][0]["http://id.loc.gov/ontologies/bibframe/source"] = JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].userValue["http://id.loc.gov/ontologies/bibframe/subject"][0]["http://id.loc.gov/ontologies/bibframe/source"]))
            }               

            if (currentState.rt[activeProfileName].pt[component].userValue['@root']){
                userValue['@root'] = JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].userValue['@root']))
            }
            if (currentState.rt[activeProfileName].pt[component].userValue['@guid']){
                userValue['@guid'] = JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].userValue['@guid']))
            }

            currentUserValuePos["http://www.loc.gov/mads/rdf/v1#isMemberOfMADSScheme"] = [{
                "@guid": short.generate(),
                "@id": "http://id.loc.gov/authorities/subjects"
            }]



            // if it is a solo subject heading
            if (subjectComponents.length==1){

                currentUserValuePos['@id'] = subjectComponents[0].uri

                currentUserValuePos['@type'] = subjectComponents[0].type.replace('madsrdf:','http://www.loc.gov/mads/rdf/v1#')

                currentUserValuePos["http://www.loc.gov/mads/rdf/v1#authoritativeLabel"] = [{
                    "@guid": short.generate(),
                    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": subjectComponents[0].label
                }]
                currentUserValuePos["http://www.w3.org/2000/01/rdf-schema#label"] = [{
                    "@guid": short.generate(),
                    "http://www.w3.org/2000/01/rdf-schema#label": subjectComponents[0].label
                }]
                
                store.state.activeUndoLog.push(`Added subject heading ${subjectComponents[0].label}`)


            }else if (subjectComponents.length>1){

                //userValue

                
                let fullLabel = subjectComponents.map((c)=>{return c.label}).join('--')

                store.state.activeUndoLog.push(`Added subject heading ${fullLabel}`)

                currentUserValuePos["http://www.loc.gov/mads/rdf/v1#authoritativeLabel"] = [{
                    "@guid": short.generate(),
                    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": fullLabel
                }]
                currentUserValuePos["http://www.w3.org/2000/01/rdf-schema#label"] = [{
                    "@guid": short.generate(),
                    "http://www.w3.org/2000/01/rdf-schema#label": fullLabel
                }]

                // we need to make the component list then


                currentUserValuePos["http://www.loc.gov/mads/rdf/v1#componentList"] = []

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

                    currentUserValuePos["http://www.loc.gov/mads/rdf/v1#componentList"].push(compo)


                }
            }






            // // hard code some properties that are used
            // let userValue = {
            //     "@root": currentState.rt[activeProfileName].pt[component].userValue['@root'],
            //     "@guid": currentState.rt[activeProfileName].pt[component].userValue['@guid'],
            //     "@type": "http://id.loc.gov/ontologies/bibframe/Topic",
            //     "http://www.loc.gov/mads/rdf/v1#isMemberOfMADSScheme": [{
            //         "@guid": "7M2siXsnQb73NRmttF333f",
            //         "@id": "http://id.loc.gov/authorities/subjects"
            //     }],
            //     // "http://id.loc.gov/ontologies/bibframe/source": [{
            //     //     "@guid": short.generate(),
            //     //     "@type": "http://id.loc.gov/ontologies/bibframe/Source",
            //     //     "http://www.w3.org/2000/01/rdf-schema#label": [{
            //     //         "@guid": short.generate(),
            //     //         "http://www.w3.org/2000/01/rdf-schema#label": "Library of Congress subject headings"
            //     //     }],
            //     //     "http://id.loc.gov/ontologies/bibframe/code": [{
            //     //         "@guid": short.generate(),
            //     //         "http://id.loc.gov/ontologies/bibframe/code": "lcsh"
            //     //     }],                    
            //     //     "@id": "http://id.loc.gov/vocabulary/subjectSchemes/lcsh"
            //     // }]
            // }

            // // but find a source predicates so we can add those back in
            // if (currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/source']){
            //     userValue['http://id.loc.gov/ontologies/bibframe/source'] = JSON.parse(JSON.stringify(currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/source']))
            //  }

            // // overwrite the guid if it already exists in the source
            // // if (currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/source']){
            // //     userValue['http://id.loc.gov/ontologies/bibframe/source']['@guid'] = currentState.rt[activeProfileName].pt[component].userValue['http://id.loc.gov/ontologies/bibframe/source']['@guid']
            // // }


            // // if it is a solo subject heading
            // if (subjectComponents.length==1){

            //     userValue['@id'] = subjectComponents[0].uri

            //     userValue['@type'] = subjectComponents[0].type.replace('madsrdf:','http://www.loc.gov/mads/rdf/v1#')

            //     userValue["http://www.loc.gov/mads/rdf/v1#authoritativeLabel"] = [{
            //         "@guid": short.generate(),
            //         "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": subjectComponents[0].label
            //     }]
            //     userValue["http://www.w3.org/2000/01/rdf-schema#label"] = [{
            //         "@guid": short.generate(),
            //         "http://www.w3.org/2000/01/rdf-schema#label": subjectComponents[0].label
            //     }]
                
            //     store.state.activeUndoLog.push(`Added subject heading ${subjectComponents[0].label}`)


            // }else if (subjectComponents.length>1){

            //     //userValue

                
            //     let fullLabel = subjectComponents.map((c)=>{return c.label}).join('--')

            //     store.state.activeUndoLog.push(`Added subject heading ${fullLabel}`)

            //     userValue["http://www.loc.gov/mads/rdf/v1#authoritativeLabel"] = [{
            //         "@guid": short.generate(),
            //         "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": fullLabel
            //     }]
            //     userValue["http://www.w3.org/2000/01/rdf-schema#label"] = [{
            //         "@guid": short.generate(),
            //         "http://www.w3.org/2000/01/rdf-schema#label": fullLabel
            //     }]

            //     // we need to make the component list then


            //     userValue["http://www.loc.gov/mads/rdf/v1#componentList"] = []

            //     for (let c of subjectComponents){

            //         let compo = {
            //                 "@guid": short.generate(),
            //                 "@type": c.type.replace('madsrdf:','http://www.loc.gov/mads/rdf/v1#'),
            //                 "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [{
            //                     "@guid": short.generate(),
            //                     "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": c.label
            //                 }]
            //         }

            //         if (c.uri){
            //             compo['@id'] = c.uri
            //         }

            //         userValue["http://www.loc.gov/mads/rdf/v1#componentList"].push(compo)


            //     }
            // }



            currentState.rt[activeProfileName].pt[component].userValue = userValue

        }







        return currentState



    },

    setValueComplex: async function(currentState, component, key, activeProfileName, template, value, structure,parentStructure, propertyPath){

            // console.log("setvaluecomplex")
            // console.log(currentState, component, key, activeProfileName, template, value, structure,parentStructure)
            // console.log("propertyPath",propertyPath)
            // if it is a top level Work uri don't let them change it
            if (!parentStructure && structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Work'){
                alert("You cannot change the existing URI of this work.")
                return currentState
            }

            // let relatedEdgecaseParentProperty = -1
            // if (parentStructure){
            //    relatedEdgecaseParentProperty = ['http://id.loc.gov/ontologies/bibframe/relatedTo','http://id.loc.gov/ontologies/bflc/relation','http://id.loc.gov/ontologies/bibframe/expressionOf'].indexOf(parentStructure.propertyURI)
            // }

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


                    let foundWhatToDelete = false

                    if (propertyPath.length>=4 && !foundWhatToDelete){
                        // there are only two levels, the [0] is always root predicate
                        if (currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI][0] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI][0][propertyPath[2].propertyURI] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI][0][propertyPath[2].propertyURI][0] && 
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI][0][propertyPath[2].propertyURI][0][propertyPath[3].propertyURI]){

                            delete currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI][0][propertyPath[2].propertyURI][0][propertyPath[3].propertyURI]
                            foundWhatToDelete = true
                        }
                    }

                    if (propertyPath.length>=3 && !foundWhatToDelete){
                        // there are only two levels, the [0] is always root predicate
                        if (currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI][0] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI][propertyPath[2].propertyURI]){
                            
                            delete currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI][propertyPath[2].propertyURI]
                            foundWhatToDelete = true
                        }
                    }


                    if (propertyPath.length>=2 && !foundWhatToDelete){

                        // there are only two levels, the [0] is always root predicate
                        if (currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0] &&
                            currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI]){
                            
                            delete currentState.rt[activeProfileName].pt[component].userValue[propertyPath[0].propertyURI][0][propertyPath[1].propertyURI]
                            foundWhatToDelete = true
                        }
                    }



                    // currentState.rt[activeProfileName].pt[component].userValue = {
                    //     '@guid': short.generate(),                        
                    //     '@root': currentState.rt[activeProfileName].pt[component].propertyURI
                    // }

                //     // first remove the root @id and @type if its there
                //     if (currentState.rt[activeProfileName].pt[component].userValue['@id']){
                //        delete currentState.rt[activeProfileName].pt[component].userValue['@id']
                //     }
                //     if (currentState.rt[activeProfileName].pt[component].userValue['@type']){
                //        delete currentState.rt[activeProfileName].pt[component].userValue['@type']
                //     }


                //     // remove the root property if there
                //     if (currentState.rt[activeProfileName].pt[component].userValue[currentState.rt[activeProfileName].pt[component].propertyURI]){
                //         delete currentState.rt[activeProfileName].pt[component].userValue[currentState.rt[activeProfileName].pt[component].propertyURI]
                        

                //     }
                //     if (currentState.rt[activeProfileName].pt[component].userValue[structure.propertyURI]){
                //         delete currentState.rt[activeProfileName].pt[component].userValue[structure.propertyURI]
                        

                //     }
                //     if (currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]){
                //         delete currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]
                        
                //     }                    



                //     // loop through and remove anything that doesn't have a @type, a bnode
                //     for (let key in currentState.rt[activeProfileName].pt[component].userValue){
                //         if (!key.startsWith('@')){
                            
                //             let remove = true
                //             if (Array.isArray(currentState.rt[activeProfileName].pt[component].userValue[key])){
                //                 for (let obj of currentState.rt[activeProfileName].pt[component].userValue[key]){
                //                     if (obj['@type']){
                //                         remove = false
                //                     }
                //                 }
                //             }
                            
                //             if (remove){
                                
                //                 delete currentState.rt[activeProfileName].pt[component].userValue[key]
                //             }

                //         }
                //     }




                }

                let pURI = (parentStructure) ? parentStructure.propertyURI : structure.propertyURI
                store.state.activeUndoLog.push(`Removed lookup value from ${exportXML.namespaceUri(pURI)}`)

                return currentState
            }


            
            if (currentState.rt[activeProfileName].pt[component]){




                // build the hiearchy if it doesn't exist to place the data
                let userValue = currentState.rt[activeProfileName].pt[component].userValue

                // we are adding the rdfs:label and the @id to this property
                // we just need to know where to put it

                // a reference to allow us to write to the end of the hierarchy
                let currentUserValuePos = userValue

                // used as a reference to the last postion's parent, so we can easily add a new sibling
                // let currentUserValuePosParent = null

                // keeps track of the @type, will be the last @type of the hiearchy when done looping
                let thisLevelType

                for (let p of propertyPath){
                    console.log("on p",p)
                    // if the property is owl:sameAs it is the last field 
                    // of where we are building the entitiy, so we don't  want
                    // bf:Agent -> owl:sameAs we just want the bf:Agent with values filed in there

                    if (p.propertyURI=='http://www.w3.org/2002/07/owl#sameAs'){
                        break
                    }

                    
                    
                    


                    
                    if (!currentUserValuePos[p.propertyURI]){
                        currentUserValuePos[p.propertyURI] = []
                    }


                    thisLevelType = await this.suggestTypeImproved(p.propertyURI,currentState.rt[activeProfileName].pt[component])

                    if (!thisLevelType){
                        thisLevelType = await exportXML.suggestType(p.propertyURI,activeProfileName)
                    }

                    

                    let thisLevel = {'@guid':short.generate()}
                    if (!this.isUriALiteral(thisLevelType)){
                        thisLevel['@type'] = thisLevelType
                        
                    }

                    if (currentUserValuePos[p.propertyURI].length==0){
                        currentUserValuePos[p.propertyURI].push(thisLevel)
                    }

                    // currentUserValuePosParent = currentUserValuePos[p.propertyURI]
                    currentUserValuePos = currentUserValuePos[p.propertyURI][0]
                
                }                


                // some possible options to set the @type

                if (thisLevelType !== 'http://www.w3.org/2000/01/rdf-schema#Literal'){

                    // if there is a valueConstraint.valueDataType.dataTypeURI set it to that
                    if (currentState.rt[activeProfileName].pt[component].valueConstraint 
                        && currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType 
                        && currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType.dataTypeURI){
                        currentUserValuePos['@type'] = currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType.dataTypeURI
                        
                        // console.log("1 setting type ", currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType.dataTypeURI)
                    }

                    // if it or its parent have a valueConstraint.valueDataType.dataTypeURI then use it
                    if (parentStructure && parentStructure.valueConstraint && parentStructure.valueConstraint.valueDataType && parentStructure.valueConstraint.valueDataType.dataTypeURI && parentStructure.valueConstraint.valueDataType.dataTypeURI.trim()  != ''){
                        currentUserValuePos['@type'] = parentStructure.valueConstraint.valueDataType.dataTypeURI
                        // console.log("2 setting type ", currentUserValuePos['@type'])

                    }else if (structure && structure.valueConstraint.valueDataType && structure.valueConstraint.valueDataType.dataTypeURI && structure.valueConstraint.valueDataType.dataTypeURI.trim()  != ''){
                        currentUserValuePos['@type'] = structure.valueConstraint.valueDataType.dataTypeURI
                        // console.log("3 setting type ", currentUserValuePos['@type'])
                    }

                }


                // if it is a ref component one see if we need to set it based on what the refcomponent is set to
                if (currentState.rt[activeProfileName].pt[component].valueConstraint && currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs && currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs.length > 1){
                    if (!currentState.rt[activeProfileName].pt[component].activeType){
                       currentState.rt[activeProfileName].pt[component].activeType =  this.rtLookup[currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs[0]].resourceURI
                    }
                    currentUserValuePos['@type'] = currentState.rt[activeProfileName].pt[component].activeType
                    // console.log("4 setting type ", currentUserValuePos['@type'])
                }

                // we might have the type stored in the context of the thing we just looked up and selected to use
                if (key == 'http://www.w3.org/2002/07/owl#sameAs'){
                    if (value.contextValue){
                        if (!value.typeFull && value.type == "Literal Value"){
                            if (structure && structure.propertyURI == "http://id.loc.gov/ontologies/bibframe/agent"){
                                value.typeFull = 'http://id.loc.gov/ontologies/bibframe/Agent'
                            }else if (parentStructure && parentStructure.propertyURI == "http://id.loc.gov/ontologies/bibframe/agent"){
                                value.typeFull = 'http://id.loc.gov/ontologies/bibframe/Agent'
                            }
                        }
                        // if its looking up from an agent 
                        currentUserValuePos['@type'] = value.typeFull
                        // console.log("5 setting type ", currentUserValuePos['@type'])

                    }
                }


                if (!currentUserValuePos['@type']){
                    // just make sure it has a type
                    currentUserValuePos['@type'] = await exportXML.suggestType(currentState.rt[activeProfileName].pt[component].propertyURI,activeProfileName)
                    

                }                

                // set the label and the uri
                currentUserValuePos['@id'] = value.uri
                currentUserValuePos['http://www.w3.org/2000/01/rdf-schema#label'] = [
                                {
                                    'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                                    '@guid': short.generate()
                                }
                            ]


                
                


                    
                // console.log('>>>>',structure.type, parentStructure)

                // need tofigure out what property to store this under the in the userValue
                // if (parentStructure && key == 'http://www.w3.org/2002/07/owl#sameAs' && currentState.rt[activeProfileName].pt[component].propertyURI != parentStructure.propertyURI){
                //     // console.log('case 1')
                //     if (!currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]){
                //         currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = []
                //     }

                //     let userValue = currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]

                //     if (value.contextValue){

                //         // testing just making sure there is only one value in there
                //         userValue = []

                //         if (!value.typeFull && value.type == "Literal Value"){

                //             if (structure && structure.propertyURI == "http://id.loc.gov/ontologies/bibframe/agent"){
                //                 value.typeFull = 'http://id.loc.gov/ontologies/bibframe/Agent'
                //             }else if (parentStructure && parentStructure.propertyURI == "http://id.loc.gov/ontologies/bibframe/agent"){
                //                 value.typeFull = 'http://id.loc.gov/ontologies/bibframe/Agent'
                //             }

                //             // if its looking up from an agent 

                //         }



                //         userValue.push({
                //             '@guid': short.generate(),
                //             '@type': value.typeFull,
                //             '@id' : value.uri,
                //             '@context': value,
                //             'http://www.w3.org/2000/01/rdf-schema#label': [
                //                 {
                //                     'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                //                     '@guid': short.generate()
                //                 }
                //             ]
                //         })


                //     }

                //     currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = userValue

                //     if (currentState.rt[activeProfileName].pt[component].valueConstraint 
                //         && currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType 
                //         && currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType.dataTypeURI){
                //         currentState.rt[activeProfileName].pt[component].userValue['@type'] = currentState.rt[activeProfileName].pt[component].valueConstraint.valueDataType.dataTypeURI
                //     }

                //     if (!currentState.rt[activeProfileName].pt[component].userValue['@type']){

                //         // just make sure it has a type
                //         currentState.rt[activeProfileName].pt[component].userValue['@type'] = await exportXML.suggestType(currentState.rt[activeProfileName].pt[component].propertyURI)

                //     }



                // }else if (parentStructure && key == 'http://www.w3.org/2002/07/owl#sameAs' && currentState.rt[activeProfileName].pt[component].propertyURI == parentStructure.propertyURI){
                //     // console.log('case 2')
                //     currentState.rt[activeProfileName].pt[component].userValue = {
                //             '@guid': short.generate(),
                //             '@type': await exportXML.suggestType(parentStructure.propertyURI),
                //             '@id' : value.uri,
                //             '@root': parentStructure.propertyURI,
                //             '@context': value,
                //             'http://www.w3.org/2000/01/rdf-schema#label': [
                //                 {
                //                     'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                //                     '@guid': short.generate()
                //                 }
                //             ]
                //         }

                // }else if (structure.type == 'lookup' && parentStructure && relatedEdgecaseParentProperty > -1){
                //     // console.log('case 3')
                //     // thre are some very nested template, which we are just checking for
                //     if (!currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI]){
                //         currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = []
                //     }

                //     // we dont want multiple values here
                //     currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI] = []

                //     if (!currentState.rt[activeProfileName].pt[component].userValue['@type']){
                //         currentState.rt[activeProfileName].pt[component].userValue['@type'] = await exportXML.suggestType(currentState.rt[activeProfileName].pt[component].propertyURI)
                  
                //     }


                    

                //     let data = {
                //         '@guid': short.generate(),
                //         '@type': await exportXML.suggestType(parentStructure.propertyURI),
                //         '@id' : value.uri,
                //         '@context': value,
                //         'http://www.w3.org/2000/01/rdf-schema#label': [
                //             {
                //                 'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                //                 '@guid': short.generate()
                //             }
                //         ]           
                //     }

                //     // we don't want to make bnodes for things like Works in related to stuff
                //     if (structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Work' || structure.propertyURI == 'http://id.loc.gov/ontologies/bibframe/Instance'){
                //         delete data['@type']
                //         delete data['http://www.w3.org/2000/01/rdf-schema#label']
                //     }


                //     currentState.rt[activeProfileName].pt[component].userValue[parentStructure.propertyURI].push(data)



                // }else if (currentState.rt[activeProfileName].pt[component].valueConstraint && currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs && currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs.length > 1){
                //     // console.log('case 4')
                //     // this is ref template, so they select what Type it is from the refTemeplate selector

                //     // does it have it set? otherwise we need to set it to the default, first refTempalte
                //     if (!currentState.rt[activeProfileName].pt[component].activeType){
                //        currentState.rt[activeProfileName].pt[component].activeType =  this.rtLookup[currentState.rt[activeProfileName].pt[component].valueConstraint.valueTemplateRefs[0]].resourceURI
                //     }
                    

                    
                //     currentState.rt[activeProfileName].pt[component].userValue = {
                //             '@guid': short.generate(),
                //             '@type': currentState.rt[activeProfileName].pt[component].activeType,
                //             '@id' : value.uri,
                //             '@root': currentState.rt[activeProfileName].pt[component].propertyURI,
                //             '@context': value,
                //             'http://www.w3.org/2000/01/rdf-schema#label': [
                //                 {
                //                     'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                //                     '@guid': short.generate()
                //                 }
                //             ]
                //         }


                

                
                // }else{

                //     console.log('case 5')

                //     // dunno, use the root level
                //     currentState.rt[activeProfileName].pt[component].userValue = {
                //             '@guid': short.generate(),
                //             '@type': await exportXML.suggestType(currentState.rt[activeProfileName].pt[component].propertyURI),
                //             '@id' : value.uri,
                //             '@root': currentState.rt[activeProfileName].pt[component].propertyURI,
                //             '@context': value,
                //             'http://www.w3.org/2000/01/rdf-schema#label': [
                //                 {
                //                     'http://www.w3.org/2000/01/rdf-schema#label': value.title,
                //                     '@guid': short.generate()
                //                 }
                //             ]
                //         }


                //     // console.error('---------------------------------------------')
                //     // console.error('Cannot gereate userValue for this complext Lookup')
                //     // console.error('component, key, activeProfileName, template, value, structure,parentStructure')
                //     // console.error(component, key, activeProfileName, template, value, structure,parentStructure)
                //     // console.error('---------------------------------------------')


                // }



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


        // TODO

        // let pValue = (value && value.title) ? ` (${value.title})` : "";
        // let pURI = (parentStructure) ? parentStructure.propertyURI : structure.propertyURI;
        // store.state.activeUndoLog.push(`Added lookup value${pValue} to ${exportXML.namespaceUri(pURI)}`)



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

    /**
    * Digs through the userValue of a component to return the speicific value for that input
    * @param {object} currentState - current state
    * @param {string} activeRt - current state
    * @param {string} component - current state
    * @param {string} propertyURI - current state
    * @param {array} propertyPath - array of the property hierarchy
    * @return {results} - object of the uservalue for that bnode
    */    
    returnUserValues: function(currentState, activeRt, component, propertyURI, propertyPath){
        // console.log(currentState, activeRt, component, propertyURI)

        let results = false

        // eslint-disable-next-line
        let temp = propertyURI 

        // Object.keys(currentState.rt[activeRt]).forEach((rt)=>{
            // check if this profile has the pt we are looking for
            // console.log('currentState',currentState)
            // console.log('activeRt=',activeRt)


            if (currentState.rt[activeRt] && currentState.rt[activeRt].pt[component]){


                // now navigate to the correct part of the userValue

                // results = currentState.rt[activeRt].pt[component].userValue


                let userValue = currentState.rt[activeRt].pt[component].userValue

                // we are adding the rdfs:label and the @id to this property
                // we just need to know where to put it

                // a reference to allow us to write to the end of the hierarchy
                let currentUserValuePos = userValue
                // used as a reference to the last postion's parent, so we can easily add a new sibling
                // let currentUserValuePosParent = null

                for (let p of propertyPath){

                    // if the property is owl:sameAs it is the last field 
                    // of where we are building the entitiy, so we don't  want
                    // bf:Agent -> owl:sameAs we just want the bf:Agent with values filed in there

                    if (p.propertyURI=='http://www.w3.org/2002/07/owl#sameAs'){
                        break
                    }
                    // same with component list, we don't want to go that far in to look for the auth label and uri etc.
                    if (p.propertyURI=='http://www.loc.gov/mads/rdf/v1#componentList'){
                        break
                    }

                    // currentUserValuePosParent = currentUserValuePos[p.propertyURI]
                    if (currentUserValuePos[p.propertyURI] && currentUserValuePos[p.propertyURI][0]){
                        currentUserValuePos = currentUserValuePos[p.propertyURI][0]
                    }else{
                        break
                    }
                }             


                results = currentUserValuePos


 
            }else{
                console.warn('Trying to reference rt',activeRt, 'and pt',component,'but one or both not found.')
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
    suggestType: function(propertyURI,resourceTemplateId){

        if (resourceTemplateId){
            console.log("!!!!!!!!!!!!")
            console.log(resourceTemplateId)
            console.log(parseProfile.rtLookup[resourceTemplateId])
            console.log(parseProfile.rtLookup)

            if (parseProfile.rtLookup[resourceTemplateId]){
                for (let pt of parseProfile.rtLookup[resourceTemplateId].propertyTemplates ){
                    if (pt.propertyURI == propertyURI){
                        if (pt.valueConstraint.valueDataType && pt.valueConstraint.valueDataType.dataTypeURI)
                        return pt.valueConstraint.valueDataType.dataTypeURI
                    }
                }
            }

        }else{

            for (let key in this.rtLookup){
                for (let pt of parseProfile.rtLookup[key].propertyTemplates ){
                    if (pt.propertyURI == propertyURI){
                        if (pt.valueConstraint.valueDataType && pt.valueConstraint.valueDataType.dataTypeURI)
                        return pt.valueConstraint.valueDataType.dataTypeURI
                    }
                }
            }

        }




        return false
    },

    // returns a Class type basedon the predicate from the the profiles
    suggestTypeImproved: async function(propertyURI,pt){


        // if the component itself has it set then just return it we dont need to dig around
        if (propertyURI == pt.propertyURI){
            if (pt.valueConstraint &&
                pt.valueConstraint.valueDataType &&
                pt.valueConstraint.valueDataType.dataTypeURI &&
                pt.valueConstraint.valueDataType.dataTypeURI.trim() != ''){
                return pt.valueConstraint.valueDataType.dataTypeURI.trim()
            }
        }


        // console.log("pt",pt)
        

        // find a template name to use
        if (pt && pt.valueConstraint && pt.valueConstraint && pt.valueConstraint.valueTemplateRefs && pt.valueConstraint.valueTemplateRefs.length>0){

    
            let possibleTypes = []
            for (let rtKey of pt.valueConstraint.valueTemplateRefs){


                if (parseProfile.rtLookup[rtKey]){

                    for (let p of parseProfile.rtLookup[rtKey].propertyTemplates){
                        if (p.propertyURI == propertyURI){

                            if (p.valueConstraint &&
                                p.valueConstraint.valueDataType &&
                                p.valueConstraint.valueDataType.dataTypeURI &&
                                p.valueConstraint.valueDataType.dataTypeURI.trim() != ''){
                                possibleTypes.push(p.valueConstraint.valueDataType.dataTypeURI.trim())
                            }
                        }
                    }

                }else{
                    console.warn("Did not find the requested template name", rtKey)
                }

            } 
            console.log("possibleTypes1",possibleTypes)
            possibleTypes = [...new Set(possibleTypes)];

            if (possibleTypes.length == 1){
                return possibleTypes[0]
            }

            // possibleTypes = []


            // console.log("HERE IS PT",pt)
            // console.log("!pt.userValue[pt.propertyURI]",(!pt.userValue[pt.propertyURI]))
            // console.log(pt.userValue[pt.propertyURI])
            // console.log("(!pt.userValue[pt.propertyURI] || (pt.userValue[pt.propertyURI] && pt.userValue[pt.propertyURI][0] && !pt.userValue[pt.propertyURI][0]['@type']))",(!pt.userValue[pt.propertyURI] || (pt.userValue[pt.propertyURI] && pt.userValue[pt.propertyURI][0] && !pt.userValue[pt.propertyURI][0]['@type'])))
            // however if is brand NEW like they are just creating it now
            // meaning there is no @type on it yet then just look at the very first ref template and use that val

            let lookForResourceURI = false

            if (!pt.userValue[pt.propertyURI]){
                lookForResourceURI = true                
            }else{
                if (pt.userValue[pt.propertyURI] && pt.userValue[pt.propertyURI][0]){
                    if (!pt.userValue[pt.propertyURI][0]['@type']){
                        lookForResourceURI = true     
                    }
                }else{
                    lookForResourceURI = true     
                }

            }


            if (lookForResourceURI){
                if (pt && pt.valueConstraint && pt.valueConstraint && pt.valueConstraint.valueTemplateRefs && pt.valueConstraint.valueTemplateRefs.length>0){
                    let rtKey = pt.valueConstraint.valueTemplateRefs[0]
                    // console.log("parseProfile.rtLookup[rtKey]",parseProfile.rtLookup[rtKey])


                    if (parseProfile.rtLookup[rtKey]){
                        // suggest the resource                        
                        return parseProfile.rtLookup[rtKey].resourceURI
                    }else{
                        console.warn("Did not find the requested template name", rtKey)
                    }

                }

            }

            // }else{

            //     console.log("it alreay has a typ!")
            //     console.log(JSON.parse(JSON.stringify(pt.userValue)))
            // }

          

        }
        // console.log("returninf false we have faild oh no :)")

        return false
        // parseProfile.rtLookup[key].propertyTemplates



        // if (resourceTemplateId){
        //     console.log("!!!!!!!!!!!!")
        //     console.log(resourceTemplateId)
        //     console.log(parseProfile.rtLookup[resourceTemplateId])
        //     console.log(parseProfile.rtLookup)

        //     if (parseProfile.rtLookup[resourceTemplateId]){
        //         for (let pt of parseProfile.rtLookup[resourceTemplateId].propertyTemplates ){
        //             if (pt.propertyURI == propertyURI){
        //                 if (pt.valueConstraint.valueDataType && pt.valueConstraint.valueDataType.dataTypeURI)
        //                 return pt.valueConstraint.valueDataType.dataTypeURI
        //             }
        //         }
        //     }

        // }else{

        //     for (let key in this.rtLookup){
        //         for (let pt of parseProfile.rtLookup[key].propertyTemplates ){
        //             if (pt.propertyURI == propertyURI){
        //                 if (pt.valueConstraint.valueDataType && pt.valueConstraint.valueDataType.dataTypeURI)
        //                 return pt.valueConstraint.valueDataType.dataTypeURI
        //             }
        //         }
        //     }

        // }





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


    addItem: async function(profile, uri){

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
            "http://id.loc.gov/ontologies/bibframe/adminMetadata":[{
                "@type": "http://id.loc.gov/ontologies/bibframe/AdminMetadata",
                "http://id.loc.gov/ontologies/bflc/catalogerId": [
                  {
                  "@guid": short.generate(),
                  "http://id.loc.gov/ontologies/bflc/catalogerId": store.state.catInitials
                  }
                ]                
            }]

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





        profile = await this.populateDefaultValuesIntoUserValues(profile,true)



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





    addInstance: async function(profile){

        
        
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
            "http://id.loc.gov/ontologies/bibframe/adminMetadata": [{
                "@type": "http://id.loc.gov/ontologies/bibframe/AdminMetadata",
                "http://id.loc.gov/ontologies/bflc/catalogerId": [
                  {
                  "@guid": short.generate(),
                  "http://id.loc.gov/ontologies/bflc/catalogerId": store.state.catInitials
                  }
                ],
                "http://id.loc.gov/ontologies/bibframe/identifiedBy": [{
                    "@guid": short.generate(),
                    "@type": "http://id.loc.gov/ontologies/bibframe/Local",
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#value": [{
                        "@guid": short.generate(),
                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#value": profile.rt[newRdId].URI.split("/")[profile.rt[newRdId].URI.split("/").length-1]
                    }]                
                }]
            }]

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


        profile = await this.populateDefaultValuesIntoUserValues(profile,true)


        return profile

    },


    cloneInstance: function(profile, uri){
        // find the correct instance to clone
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
                        if (!profile.rt[newRdId].pt[key].userValue['http://id.loc.gov/ontologies/bibframe/adminMetadata']){
                            profile.rt[newRdId].pt[key].userValue['http://id.loc.gov/ontologies/bibframe/adminMetadata'] = [{}]
                        }
                        profile.rt[newRdId].pt[key].userValue['http://id.loc.gov/ontologies/bibframe/adminMetadata'][0]['http://id.loc.gov/ontologies/bflc/catalogerId'] = [
                            {
                                "@guid": short.generate(),
                                "http://id.loc.gov/ontologies/bflc/catalogerId": store.state.catInitials 
                            }
                        ]


                        // add/replace with our new local id
                        profile.rt[newRdId].pt[key].userValue['http://id.loc.gov/ontologies/bibframe/adminMetadata'][0]["http://id.loc.gov/ontologies/bibframe/identifiedBy"] = [{
                            "@guid": short.generate(),
                            "@TEST": "HELLO",
                            "@type": "http://id.loc.gov/ontologies/bibframe/Local",
                            "http://www.w3.org/1999/02/22-rdf-syntax-ns#value": [{
                                "@guid": short.generate(),
                                "http://www.w3.org/1999/02/22-rdf-syntax-ns#value": profile.rt[newRdId].URI.split("/")[profile.rt[newRdId].URI.split("/").length-1]
                            }]                
                        }]

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

                // if its a hub put it up front
                if (rt.includes(':Hub')){
                    newOrder.unshift(rt);
                }else{
                    newOrder.push(rt)
                }


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



    /**
    * The minimap object
    * @typedef {diagramMiniMap} diagramMiniMap
    * @property {string} type - the top level of the minimap is probably a "work" or "hub"
    * @property {string} URI - the URI created for that resource
    * @property {string} rt - the resoruce template id for that resource
    * @property {interger} counter - the position number for that resource out of all of the same type
    * @property {string} jumpTo - the id used to navigate when user clicks on the minimap icon for that resource
    * @property {string} details - also used to navigate when clicking on the minimap, the first component of the resource to jump to
    * @property {array} instances - if type is work then this will be at the top level with all of the instances with the same diagramMiniMap properties
    * @property {array} items - if at the instance level it will be an array of diagramMiniMap for the items 
    * @property {array} work - if type is hub then this will be at the top level with all of the instances with the same diagramMiniMap properties
    */

    /**
    * Takes the active profile and builds a minimap representation of its structure to be used in the navigation bar
    * @param {object} profiles - a profile object
    * @return {TestProfilesResult} - {@link diagramMiniMap} test results
    */
    returnDiagramMiniMap: function(activeProfile){
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
                miniMapHub = {type:'Hub',URI:activeProfile.rt[rt].URI, rt:rt, counter:0, jumpTo:activeProfile.rt[rt].ptOrder[1],  details: activeProfile.rt[rt].pt[activeProfile.rt[rt].ptOrder[1]]}
            }
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

        if (miniMapWork && miniMapHub){
            miniMapHub.work = miniMapWork     
            miniMapHub.instances = miniMapInstance
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




    userTemplatesValidate: function(templates){
        
        // loop through the user templates an comapre the hashes of each, if there is a problem flag the user template as bad

        // if the profiles aren't even processed yet don't do anything
        if (!store.state.profiles) return templates
        if (store.state.profiles && Object.keys(store.state.profiles).length==0) return templates

        // return 
        if (!templates) return templates

        let hashes = {}
        // build a quick lookup of the RTs hashes
        for (let p in store.state.profiles){
            for (let rt in store.state.profiles[p].hashRts){
                hashes[rt] = store.state.profiles[p].hashRts[rt]
            }
        }



        console.log('hashes',hashes)
        for (let t of templates){

            let template = JSON.parse(t.profile)
            console.log(template)
            for (let rt in template.hashRts){
                
                // when multuple RTs are added of the same RT it has a numerical suffix like "xxx-1"
                let rtOrginal = rt.split('-')[0]

                console.log('hash rtOrginal',rtOrginal,hashes[rtOrginal])
                console.log('hash rt',rt,template.hashRts[rt])

                if (hashes[rtOrginal] != template.hashRts[rt]){
                    t.invalid = true
                }



            }


        }





        return templates
    },



    // does all the work to setup a new profile read to be eaded and posted as new
    loadNewTemplate(useStartingPoint,addAdmin,userTemplateSupplied){

      // should be the catinitals to insert into admin if being passed
      if (typeof addAdmin === 'undefined'){
        addAdmin=false
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

      // console.log('------useProfile-------')
      // console.log(useProfile)

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
                "http://id.loc.gov/ontologies/bibframe/adminMetadata":[{

                    "@type": "http://id.loc.gov/ontologies/bibframe/AdminMetadata",
                    '@guid': short.generate(),
                    "http://id.loc.gov/ontologies/bflc/catalogerId": [
                      {
                      "@guid": short.generate(),
                      "http://id.loc.gov/ontologies/bflc/catalogerId": addAdmin
                      }
                    ]
                }]

              },
              "valueConstraint": {
                "defaults": [],
                "useValuesFrom": [],
                "valueDataType": {},
                "valueTemplateRefs": [  (!rt.includes(':GPO')) ? 'lc:RT:bf2:AdminMetadata:BFDB' :   'lc:RT:bf2:GPOMono:AdminMetadata'   ]
              }
            }

          let adminMetadataPropertyLabel = 'http://id.loc.gov/ontologies/bibframe/adminMetadata|Admin Metadata'



          if (useProfile.rt[rt].pt[adminMetadataPropertyLabel]){
            console.log("Admin already exists for ", rt, 'chahhing userid')
            // it already exists, so update the catalogerId and use the existing userValue

            if (useProfile.rt[rt].pt[adminMetadataPropertyLabel].userValue['http://id.loc.gov/ontologies/bibframe/adminMetadata'][0]["http://id.loc.gov/ontologies/bflc/catalogerId"]){
                useProfile.rt[rt].pt[adminMetadataPropertyLabel].userValue['http://id.loc.gov/ontologies/bibframe/adminMetadata'][0]["http://id.loc.gov/ontologies/bflc/catalogerId"] =  [
                  {
                  "@guid": short.generate(),
                  "http://id.loc.gov/ontologies/bflc/catalogerId": addAdmin
                  }
                ]
            }

            // TODO remove local system number

          }else{
            console.log("Admin does not exists for ", rt, 'adding it')
            // doesn't exist, add it to the ptOrder and pt
            useProfile.rt[rt].ptOrder.push(adminMetadataPropertyLabel)
            useProfile.rt[rt].pt[adminMetadataPropertyLabel] = JSON.parse(JSON.stringify(adminMetadataProperty))
          }


          // add it to the pt


          
        }
      }





      // console.log(JSON.stringify(useProfile,null,2))


      return useProfile


    },


    prepareTemplate: async function(profile,overwrite){

        console.log(overwrite)
        console.log( profile   )


        profile = JSON.parse(JSON.stringify(profile))


        let hashesProfiles = {}
        let hashesProfilesPts = {}
        // build a quick lookup of the RTs hashes
        for (let p in store.state.profiles){
            for (let rt in store.state.profiles[p].hashRts){
                hashesProfiles[rt] = store.state.profiles[p].hashRts[rt]
                hashesProfilesPts[rt] = store.state.profiles[p].hashPts
            }
        }



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

            //update the hash from what is acutally used in the template
            let useRt = rt.split('-')[0]
            profile.hashRts[useRt] = hashesProfiles[useRt]
            for (let pt in hashesProfilesPts[useRt]){
                 profile.hashPts[pt] = hashesProfilesPts[useRt][pt] 
            }


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


