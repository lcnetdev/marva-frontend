// braks non-chromium browsers
// const jsdom = require("jsdom");
import store from "../store";



const parseBfdb = {

	data: {		
		work: [],
		instance: [],
		item:[]
	},


	namespace: {
		'bf':'http://id.loc.gov/ontologies/bibframe/',
		'bflc': 'http://id.loc.gov/ontologies/bflc/',
		'madsrdf': 'http://www.loc.gov/mads/rdf/v1#',
		'rdf' : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
	},


	isClass: function(uri){

		if (uri.match(/bf:[A-Z]/)){
			return true
		}


		return false

	},

	namespaceUri: function(uri){	
		for (let ns in this.namespace){
			let nsuri = this.namespace[ns]
			if (uri.includes(nsuri)){
				return uri.replace(nsuri,`${ns}:`)
			}

		}


	},

	UriNamespace: function(passedNS){

		for (let ns in this.namespace){
			let nsuri = this.namespace[ns]

			if (passedNS.includes(ns)){
				return passedNS.replace(`${ns}:`,nsuri)
			}

		}

	},

	returnOneWhereParentIs: function(selection, requiredParent){

		// console.log(selection, requiredParent)
		// console.log('-----',)


		if (selection.length == 1){
			return selection[0]
		}
		console.log('here')
		for (let el of selection){
			if (el.parentNode.tagName === requiredParent){
				return el
			}
		}

		return false

	},

	activeDom: null,


	specialTransforms: {


		'bf:subject' : function(xml,profile){

			//   <bf:subject>
			//      <bf:Place>
			//        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
			//        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Skye, Island of (Scotland)--Fiction.</rdfs:label>
			//        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Skye, Island of (Scotland)--Fiction.</madsrdf:authoritativeLabel>
			//        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
			//        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
			//          <madsrdf:Geographic>
			//            <madsrdf:authoritativeLabel>Skye, Island of (Scotland)</madsrdf:authoritativeLabel>
			//          </madsrdf:Geographic>
			//          <madsrdf:GenreForm>
			//            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
			//          </madsrdf:GenreForm>
			//        </madsrdf:componentList>
			//        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">skyeislandof(scotland)fiction</bflc:aap-normalized>
			//      </bf:Place>
			//    </bf:subject>


			// grab the label and uri and type
			let typeNode = xml.children[0]
			if (!typeNode){
				console.error('xml.children[0] for this subject does not exist')
				return profile
			}

			profile.userValue['@type'] = this.UriNamespace(typeNode.tagName)
			profile.userValue['URI'] = null
			let label = null

			if (typeNode.attributes && typeNode.attributes['rdf:about']){
				profile.userValue['URI'] = typeNode.attributes['rdf:about'].value
			}

			if (typeNode.getElementsByTagName('madsrdf:authoritativeLabel').length>0){
				label = typeNode.getElementsByTagName('madsrdf:authoritativeLabel')[0].innerHTML
			}
			let componentList = []

			
			profile.userValue['literal'] = label

			if (typeNode.getElementsByTagName('madsrdf:componentList').length>0){

				for (let child of typeNode.getElementsByTagName('madsrdf:componentList')[0].children){

					let ctype = this.UriNamespace(child.tagName)
					let clabel = null
					if (child.getElementsByTagName('madsrdf:authoritativeLabel').length>0){
						clabel = child.getElementsByTagName('madsrdf:authoritativeLabel')[0].innerHTML
					}

					componentList.push({'literal':clabel, '@type':ctype})


				}

			}
			profile.userValue['http://www.loc.gov/mads/rdf/v1#componentList'] = componentList


			// console.log('###################')
			// console.log(profile.userValue)
			// console.log('###################')

			return profile


		},
		'bf:Work' : function(xml,profile){

			console.log("~~~~~~~~~~~~~~~~~~~")
			console.log(xml)
			console.log(xml.attributes['rdf:about'])
			console.log(profile)

			
			
			let titleStr = xml.attributes['rdf:about'].value
			
			let titleEl = xml.getElementsByTagName("bflc:aap")[0]
			if (titleEl){
				titleStr = titleEl.innerHTML
			}

			// "http://www.w3.org/2002/07/owl#sameAs": {
			profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {
				'literal': titleStr,
				'URI' : xml.attributes['rdf:about'].value
			}

			profile.userValue.URI = xml.attributes['rdf:about'].value
			profile.userValue.literal = titleStr
			return profile
		},


		'bf:contribution' : function(xml,profile){


			// <bf:contribution>
			//   <bf:Contribution>
			//     <bf:agent>
			//       <bf:Agent rdf:about="http://id.loc.gov/rwo/agents/n87899079">
			//         <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
			//         <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Kemp, Sandra.</rdfs:label>
			//         <madsrdf:isIdentifiedByAuthority rdf:resource="http://id.loc.gov/authorities/names/n87899079" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
			//       </bf:Agent>
			//     </bf:agent>
			//     <bf:role>
			//       <bf:Role rdf:about="http://id.loc.gov/vocabulary/relators/ctb">
			//         <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Contributor</rdfs:label>
			//       </bf:Role>
			//     </bf:role>
			//   </bf:Contribution>
			// </bf:contribution>


			// grab the label and uri and type

			let typeNode = xml.getElementsByTagName("bf:agent")[0].children[0]

			if (!typeNode){
				console.error('xml.children[0] for this subject does not exist')
				return profile
			}

			// console.log(this)

			profile.userValue['@type'] = this.UriNamespace(typeNode.tagName)
			profile.userValue['URI'] = null
			let label = null

			if (typeNode.getElementsByTagName('rdf:type').length>0){
				profile.userValue['@type'] = typeNode.getElementsByTagName('rdf:type')[0].attributes['rdf:resource'].value
			}

			if (typeNode.attributes && typeNode.attributes['rdf:about']){
				profile.userValue['URI'] = typeNode.attributes['rdf:about'].value
			}

			if (typeNode.getElementsByTagName('madsrdf:authoritativeLabel').length>0){
				label = typeNode.getElementsByTagName('madsrdf:authoritativeLabel')[0].innerHTML
			}else if (typeNode.getElementsByTagName('rdfs:label').length>0){
				label = typeNode.getElementsByTagName('rdfs:label')[0].innerHTML
			}

			profile.userValue['literal'] = label



			if (xml.getElementsByTagName('bf:Role').length>0){
				let role = xml.getElementsByTagName('bf:Role')[0]

				let roleuri = null
				let rolelabel = null
				if (role.attributes && role.attributes['rdf:about']){
					roleuri = role.attributes['rdf:about'].value
				}

				if (role.getElementsByTagName('rdfs:label').length>0){
					rolelabel= role.getElementsByTagName('rdfs:label')[0].innerHTML
				}

				profile.userValue['http://id.loc.gov/ontologies/bibframe/role'] = {'URI':roleuri, 'literal': rolelabel}


			}

			



			// console.log('#########specialTransformContribution##########')
			// console.log(profile.userValue)
			// console.log('#########specialTransformContribution##########')

			return profile


		}



	},


	transform: function(profile){



		console.log(profile)

		for (const pkey in profile.rt) {

			let tle = ""			
			if (pkey.endsWith(':Work')){
				tle = "bf:Work"
			}else if (pkey.endsWith(':Instance')){
				tle = "bf:Instance"
			}else if (pkey.endsWith(':Item')){
				tle = "bf:Item"
			}

			// select the right part of the profile
			let pt = profile.rt[pkey].pt
			
			// select the right part of the XML
			let xml = this.activeDom.getElementsByTagName(tle)

			// only return the top level, no nested related things
			xml = this.returnOneWhereParentIs(xml, "rdf:RDF")
			console.log("Doing", tle)
			if (!xml){
				console.warn('Could not find the requested XML fragment, looking for ', tle)
				continue
			}

			// remove some things we will want to work with later but are just too complicated right now
			let adminMetadata = xml.getElementsByTagName('bf:adminMetadata')
			let adminMetadataData = Array.prototype.slice.call( adminMetadata )
			for (let item of adminMetadata) {
				item.parentNode.removeChild(item)
			}

			let hasSeries = xml.getElementsByTagName('bf:hasSeries')
			let hasSeriesData = Array.prototype.slice.call( hasSeries )
			for (let item of hasSeries) {
				item.parentNode.removeChild(item)
			}

			let sucessfulProperties  = []

			// at this point we have the main piece of the xml tree that has all our data
			// loop through properties we are looking for and build out the the profile

			for (let k in pt){
				// console.log(pt[k])
				// console.log(pt[k].propertyURI)
				let propertyURI = pt[k].propertyURI
				let prefixURI = this.namespaceUri(propertyURI)

				// see if we have that specific propertry in the xml
				let el = xml.getElementsByTagName(prefixURI)

				// console.log(prefixURI)
				// console.log(el)
				// console.log('******')

				if (el.length>0){
					// we have that element
					sucessfulProperties.push(prefixURI)
					// loop through all of them
					let counter = 0
					for (let e of el){
						// console.log(e,counter, e.children[0].tagName)

						// start populating the data
						let populateData = null
						populateData = JSON.parse(JSON.stringify(pt[k]))
						// save the source xml for later display
						populateData.xmlSource = e.outerHTML

						// console.log("----------DOING NOW-------------")
						// console.log(e.outerHTML)

						console.log(prefixURI)
						// we have some special functions to deal with tricky elements
						if (this.specialTransforms[prefixURI]){
							// make sure to pass the current 'this' context to the functions that use helper functions at this level like this.UriNamespace
							populateData = this.specialTransforms[prefixURI].call(this,e,populateData)	

						}else if (e.children.length == 0){

							console.log("GOT NO KIDS", (e.innerHTML===true), e.innerHTML.length)
							if (e.attributes && e.attributes['rdf:about'] && e.innerHTML.length == 0){
								populateData.userValue ={
									URI: e.attributes['rdf:about'].value,
									label: null
								} 
							}
							if (e.attributes && e.attributes['rdf:resource']){
								populateData.userValue ={
									URI: e.attributes['rdf:resource'].value,
									label: null
								} 								
							}	


							if (e.innerHTML && e.innerHTML.length!=0){
								populateData.userValue ={
									URI: null,
									label: e.innerHTML
								}								

							}


										
						}else{


							for (let child of e.children){
								console.log(child.tagName,"~~~~",this.isClass(child.tagName))



								// lvl 1
								if (this.isClass(child.tagName)){
									// example > <bf:title><bf:Title> 
									populateData.userValue['@type'] = this.UriNamespace(child.tagName)

									// does it have a URI?
									let childUri = null
									if (child.attributes && child.attributes['rdf:about']){
										childUri = child.attributes['rdf:about'].value
									}
									if (child.attributes && child.attributes['rdf:resource']){
										childUri = child.attributes['rdf:resource'].value
									}			
									// console.log(child.tagName)
									// console.log(child.attributes)


									let childLabel = null

									// lvl 2, loop through all of its properties
									for (let grandchild of child.children){

										// example > <bf:title><bf:Title> <bf:mainTitle>
										if (!this.isClass(grandchild.tagName)){

											if (grandchild.tagName == 'rdfs:label'){
												childLabel = grandchild.innerHTML
											}else if (grandchild.tagName == 'rdf:type'){

												console.log('rdf:type rdf:type rdf:type rdf:typerdf:type')
												console.log(grandchild)
												console.log(grandchild.attributes)
												console.log(grandchild.attributes['rdf:resource'])
												console.log(grandchild.attributes['rdf:resource'].value)

												if (grandchild.attributes['rdf:resource']){													
													populateData.userValue['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] = grandchild.attributes['rdf:resource'].value
												}else{
													console.log('something strange going on with rdf:resource of rdf:type')
												}


											}else{

												// set the value to whatever it is
												if (!this.UriNamespace(grandchild.tagName)){
													console.error(grandchild.tagName,'what is this')
												}

												// does this one also have children?
												if (grandchild.children.length==0){
													// no just assign the value
													populateData.userValue[this.UriNamespace(grandchild.tagName)] = grandchild.innerHTML
												}else{

													// console.log("-----------NESTED Property------------")
													// console.log(grandchild.innerHTML)

													let greatgrandchildUri = null
													let greatgrandchildValue = null
													let greatgrandchildType = null

													for (let greatgrandchild of grandchild.children){

														if (this.isClass(greatgrandchild.tagName)){
															// something like this
															// <bf:classification>
															// 	<bf:ClassificationLcc>
															// 		<bf:source>
															// 			<bf:Source>

															// small usecases here, might need to expand

															greatgrandchildType = this.UriNamespace(greatgrandchild.tagName)
															// console.log(grandchild)
															if (greatgrandchild.attributes && greatgrandchild.attributes['rdf:about']){
																greatgrandchildUri = greatgrandchild.attributes['rdf:about'].value
															}

															for (let greatgreatgrandchild of greatgrandchild.children){

																if (greatgreatgrandchild.tagName == 'rdfs:label'){
																	greatgrandchildValue = greatgreatgrandchild.nnerHTML
																}else if (greatgreatgrandchild.tagName == 'madsrdf:authoritativeLabel'){
																	greatgrandchildValue = greatgreatgrandchild.nnerHTML
																}else if (greatgreatgrandchild.tagName == 'bf:code'){
																	greatgrandchildValue = greatgreatgrandchild.nnerHTML
																}

															}

															// some hack stuff here
															if (greatgrandchildUri && !greatgrandchildValue){
																// so there is a URI, but no label or code for it, just use part of  the URI for the label then
																greatgrandchildValue = greatgrandchildUri.split('/')[greatgrandchildUri.split('/').length-1]
															}

															// console.log(greatgrandchildUri)
															// console.log(greatgrandchildValue)
															// console.log(greatgrandchildType)

														}else{

															console.log('not nested class? what is this',greatgrandchild.innerHTML)
														}
													}

													if (greatgrandchildUri && greatgrandchildValue && greatgrandchildType){
														populateData.userValue[this.UriNamespace(grandchild.tagName)] = {'@type':greatgrandchildType, 'literal':greatgrandchildValue, 'URI':greatgrandchildUri}
													}


												}
												

											}
										}else{
											console.error('cant handle nested classes yet')
										}
									}


									if (childUri && childLabel){
										// populateData.userValue['@value'] = {literal: childLabel, URI: childUri}
										populateData.userValue[propertyURI] = {literal: childLabel, URI: childUri}
									}else if (!childUri && childLabel && Object.keys(populateData.userValue).length==1){
										// populateData.userValue['@value'] = childLabel
										populateData.userValue[propertyURI] = {literal: childLabel, URI: null}
									}else if (childUri && !childLabel) {
										// we have a URI but no label for that value, take the last piece of the URL

										if (childUri.includes('id.loc.gov/vocabulary/')){
											childLabel = childUri.split('/')[childUri.split('/').length-1]
										}else{
											childLabel = childUri
										}
										populateData.userValue[propertyURI] = {literal: childLabel, URI: childUri}


									}else{

										// console.log("~~~~~~~~~~ HHERERERREREERERERER @#$%^&*(")
									}



									// console.log(childLabel,childUri,populateData)


								}

							}


						}

						// console.log('----~~~~~------')
						// console.log(populateData,'populateData',counter)

						// since we created a brand new populateData we either need to 
						// replace the orginal in the profile or if there is more than one we 
						// need to make a new one and add it to the resource template list
						// since each piece of data in the property is its own resource template

						if (counter === 0){
							pt[k] = populateData
						}else{

							let newKey = `${k}_${counter}`
							let currentpos = profile.rt[pkey].ptOrder.indexOf(k)
							profile.rt[pkey].ptOrder.splice(currentpos+1, 0, newKey);
							pt[newKey] = populateData


						}

						counter++

					}


				}
			}



			// we did something with it, so remove it from the xml
			for (let p of sucessfulProperties){
				let els = xml.getElementsByTagName(p)
				// this is a strange loop here because we need to remvoe elements without changing the parent order which will mess up the dom tree and the loop
				for (let step = els.length-1; step >= 0; step=step-1) {
					els[step].remove()
				}
			}

			// store the unused xml
			profile.rt[pkey].unusedXml = xml.outerHTML;

			let totalHasDataLoaded = 0
			let uniquePropertyURIs  = {}
			// we are now going to do some ananlyis on profile, see how many properties are acutally used, what is not used, etc
			for (let key in profile.rt[pkey].pt){

				// console.log(key,'key here')
				if (Object.keys(uniquePropertyURIs).indexOf(profile.rt[pkey].pt[key].propertyURI)===-1){
					uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI] = {status:false,data:[],resourceTemplates:{},unAssingedProperties:[]}
				}
				// mark if we have loaded data from the source for this properity
				if (Object.keys(profile.rt[pkey].pt[key].userValue).length==0){
					profile.rt[pkey].pt[key].dataLoaded=false
				}else{
					profile.rt[pkey].pt[key].dataLoaded=true
					totalHasDataLoaded++
					uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI].status = true

					uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI].data.push({'json':profile.rt[pkey].pt[key].userValue,'propertyLabel': profile.rt[pkey].pt[key].propertyLabel, 'xml':profile.rt[pkey].pt[key].xmlSource})

					uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI].resourceTemplates[key] = profile.rt[pkey].pt[key]

					// not look into the rt of this propertiy to see what properties we have sucuessfully mapped and things we did not map
					let allUris = []
					profile.rt[pkey].pt[key].valueConstraint.valueTemplateRefs.forEach((rtName)=>{
						store.state.rtLookup[rtName].propertyTemplates.forEach((ptObj)=>{
							if (allUris.indexOf(ptObj.propertyURI)==-1){
								allUris.push(ptObj.propertyURI)
							}

						})	
					})

					// console.log(allUris)
					// console.log(profile.rt[pkey].pt[key].userValue)
					// console.log('##################~~~~!!!!')
					profile.rt[pkey].pt[key].missingProfile = []
					// loop though the URIs we have
					Object.keys(profile.rt[pkey].pt[key].userValue).forEach((userURI)=>{
						if (userURI !== '@value' && userURI !== '@type' && userURI !== 'uri'){
							if (allUris.indexOf(userURI)===-1){
								console.log(userURI, 'not found')
								profile.rt[pkey].pt[key].missingProfile.push(userURI)

								uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI].unAssingedProperties.push(userURI)
							}
						}

					})

					if (uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI].unAssingedProperties.length>0){
						uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI].status='mixed'
					}

					// console.log('##################~~~~!!!!')


				}
			}



			profile.rt[pkey].propertyLoadReport = uniquePropertyURIs

			profile.rt[pkey].propertyLoadRatio = parseInt(Object.keys(uniquePropertyURIs).filter((k)=>uniquePropertyURIs[k].status).length /Object.keys(uniquePropertyURIs).length * 100)

			// console.log(uniquePropertyURIs)
			// console.log('uniquePropertyURIs')
			console.log(totalHasDataLoaded)


			// console.log("here")
			// console.log(pt,tle,xml)	
			// console.log(profile)	
			// console.log("^^^^^***")
			// console.log(xml.outerHTML)
			// console.log(sucessfulProperties)
			console.log(adminMetadataData,hasSeriesData)

			console.log('profile',profile)
			return profile

		}



	},

	parse: function(xml){

		if (!xml){
			xml = this.testXml
		}	
		// use the browser if we can, should be faster, fall back to the library if not running in the browser
		if (window.DOMParser){
			let parser = new DOMParser();
			this.activeDom = parser.parseFromString(xml, "text/xml");
		// }else{
		// 	this.activeDom = new jsdom.JSDOM(xml, {
		// 		contentType: "text/xml",
		// 		storageQuota: 10000000
		// 	})
		// 	this.activeDom = this.dom.window.document
		}



		console.log(this.activeDom.getElementsByTagName("rdf:type")[0].attributes)




	},



















	testXmlInstance : `<?xml version="1.0" encoding="UTF-8"?>
						<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
						  <bf:Instance rdf:about="http://id.loc.gov/resources/instances/c0010058400001" xmlns:bf="http://id.loc.gov/ontologies/bibframe/">
						    <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Print"/>
						    <bf:issuance>
						      <bf:Issuance rdf:about="http://id.loc.gov/vocabulary/issuance/mono"/>
						    </bf:issuance>
						    <bf:provisionActivity>
						      <bf:ProvisionActivity>
						        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Publication"/>
						        <bf:date rdf:datatype="http://id.loc.gov/datatypes/edtf">1988</bf:date>
						        <bf:place>
						          <bf:Place rdf:about="http://id.loc.gov/vocabulary/countries/nyu"/>
						        </bf:place>
						      </bf:ProvisionActivity>
						    </bf:provisionActivity>
						    <bf:identifiedBy>
						      <bf:Lccn>
						        <rdf:value>87023915 </rdf:value>
						      </bf:Lccn>
						    </bf:identifiedBy>
						    <bf:acquisitionTerms>$24.50</bf:acquisitionTerms>
						    <bf:identifiedBy>
						      <bf:Isbn>
						        <rdf:value>1555460348</rdf:value>
						        <bf:qualifier>alk. paper</bf:qualifier>
						      </bf:Isbn>
						    </bf:identifiedBy>
						    <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Virginia Woolf's To the lighthouse</rdfs:label>
						    <bf:title>
						      <bf:Title>
						        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Virginia Woolf's To the lighthouse</rdfs:label>
						        <bflc:titleSortKey xmlns:bflc="http://id.loc.gov/ontologies/bflc/">Virginia Woolf's To the lighthouse</bflc:titleSortKey>
						        <bf:mainTitle>Virginia Woolf's To the lighthouse</bf:mainTitle>
						      </bf:Title>
						    </bf:title>
						    <bf:responsibilityStatement>edited and with an introduction by Harold Bloom</bf:responsibilityStatement>
						    <bf:provisionActivity>
						      <bf:ProvisionActivity>
						        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Publication"/>
						        <bf:place>
						          <bf:Place>
						            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">New York</rdfs:label>
						          </bf:Place>
						        </bf:place>
						        <bf:agent>
						          <bf:Agent rdf:about="https://id.loc.gov/entities/providers/c1d5943c1d6758970d330c5ac19b7955">
						            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Chelsea House</rdfs:label>
						          </bf:Agent>
						        </bf:agent>
						        <bf:date>1988</bf:date>
						      </bf:ProvisionActivity>
						    </bf:provisionActivity>
						    <bf:provisionActivityStatement>New York : Chelsea House, 1988.</bf:provisionActivityStatement>
						    <bf:extent>
						      <bf:Extent>
						        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">vii, 164 p.</rdfs:label>
						      </bf:Extent>
						    </bf:extent>
						    <bf:dimensions>24 cm.</bf:dimensions>
						    <bf:seriesStatement>Modern critical interpretations</bf:seriesStatement>
						    <bf:note>
						      <bf:Note>
						        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Includes index.</rdfs:label>
						      </bf:Note>
						    </bf:note>
						    <bf:instanceOf rdf:resource="http://id.loc.gov/resources/works/c001005840"/>
						    <bf:adminMetadata>
						      <bf:AdminMetadata>
						        <bf:generationProcess>
						          <bf:GenerationProcess>
						            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">DLC marc2bibframe2 v1.6.0-SNAPSHOT</rdfs:label>
						            <bf:generationDate rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2020-06-26T05:25:04-04:00</bf:generationDate>
						          </bf:GenerationProcess>
						        </bf:generationProcess>
						        <bf:status>
						          <bf:Status>
						            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">increase in encoding level from prepublication</rdfs:label>
						            <bf:code>p</bf:code>
						          </bf:Status>
						        </bf:status>
						        <bflc:encodingLevel xmlns:bflc="http://id.loc.gov/ontologies/bflc/">
						          <bflc:EncodingLevel rdf:about="http://id.loc.gov/vocabulary/menclvl/f">
						            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">full</rdfs:label>
						          </bflc:EncodingLevel>
						        </bflc:encodingLevel>
						        <bf:descriptionConventions>
						          <bf:DescriptionConventions rdf:about="http://id.loc.gov/vocabulary/descriptionConventions/aacr">
						            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">aacr</rdfs:label>
						          </bf:DescriptionConventions>
						        </bf:descriptionConventions>
						        <bf:identifiedBy>
						          <bf:Local>
						            <rdf:value>1005840</rdf:value>
						            <bf:assigner>
						              <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc"/>
						            </bf:assigner>
						          </bf:Local>
						        </bf:identifiedBy>
						        <bf:changeDate rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">1988-07-25T00:00:00</bf:changeDate>
						        <bf:creationDate rdf:datatype="http://www.w3.org/2001/XMLSchema#date">1987-08-13</bf:creationDate>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Agent"/>
						            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">DLC</rdfs:label>
						          </bf:Source>
						        </bf:source>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Agent"/>
						            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">DLC</rdfs:label>
						          </bf:Source>
						        </bf:source>
						        <bf:descriptionModifier>
						          <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
						            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">DLC</rdfs:label>
						          </bf:Agent>
						        </bf:descriptionModifier>
						      </bf:AdminMetadata>
						    </bf:adminMetadata>
						  </bf:Instance>
						</rdf:RDF>`,


	testXmlWork: ``




}


export default parseBfdb;