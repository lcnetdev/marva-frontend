// braks non-chromium browsers
// const jsdom = require("jsdom");
import store from "../store";



const parseId = {

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
						}else{


							for (let child of e.children){
								// console.log(child.tagName,"~~~~",this.isClass(child.tagName))



								// lvl 1
								if (this.isClass(child.tagName)){
									// example > <bf:title><bf:Title> 
									populateData.userValue['@type'] = this.UriNamespace(child.tagName)

									// does it have a URI?
									let childUri = null
									if (child.attributes && child.attributes['rdf:about']){
										childUri = child.attributes['rdf:about'].value
									}

									let childLabel = null

									// lvl 2, loop through all of its properties
									for (let grandchild of child.children){

										// example > <bf:title><bf:Title> <bf:mainTitle>
										if (!this.isClass(grandchild.tagName)){

											if (grandchild.tagName == 'rdfs:label'){
												childLabel = grandchild.innerHTML
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



















	testXml : `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
				  <bf:Work rdf:about="http://id.loc.gov/resources/works/2998171" xmlns:bf="http://id.loc.gov/ontologies/bibframe/">
				    <bflc:aap xmlns:bflc="http://id.loc.gov/ontologies/bflc/">Woolf, Virginia, 1882-1941. To the lighthouse</bflc:aap>
				    <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">woolfvirginia18821941tothelighthouse</bflc:aap-normalized>
				    <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Text"/>
				    <bf:language>
				      <bf:Language rdf:about="http://id.loc.gov/vocabulary/languages/eng">
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">English</rdfs:label>
				      </bf:Language>
				    </bf:language>
				    <bf:supplementaryContent>
				      <bf:SupplementaryContent rdf:about="http://id.loc.gov/authorities/genreForms/gf2014026048">
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">bibliographies</rdfs:label>
				      </bf:SupplementaryContent>
				    </bf:supplementaryContent>
				    <bf:supplementaryContent>
				      <bf:SupplementaryContent rdf:about="http://id.loc.gov/vocabulary/msupplcont/index">
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Index present</rdfs:label>
				      </bf:SupplementaryContent>
				    </bf:supplementaryContent>
				    <bf:genreForm>
				      <bf:GenreForm rdf:about="http://id.loc.gov/authorities/genreForms/gf2014026339">
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">fiction</rdfs:label>
				      </bf:GenreForm>
				    </bf:genreForm>
				    <bf:identifiedBy>
				      <bf:Lccn>
				        <rdf:value>93038757 </rdf:value>
				      </bf:Lccn>
				    </bf:identifiedBy>
				    <bf:geographicCoverage>
				      <bf:GeographicCoverage rdf:about="http://id.loc.gov/vocabulary/geographicAreas/e-uk-en">
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">England</rdfs:label>
				      </bf:GeographicCoverage>
				    </bf:geographicCoverage>
				    <bf:classification>
				      <bf:ClassificationLcc>
				        <bf:source>
				          <bf:Source rdf:about="http://id.loc.gov/vocabulary/organizations/dlc"/>
				        </bf:source>
				        <bf:classificationPortion>PR6045.O72</bf:classificationPortion>
				        <bf:itemPortion>T6 1994</bf:itemPortion>
				      </bf:ClassificationLcc>
				    </bf:classification>
				    <bf:classification>
				      <bf:ClassificationDdc>
				        <bf:classificationPortion>823/.912</bf:classificationPortion>
				        <bf:edition rdf:datatype="http://www.w3.org/2001/XMLSchema#anyURI">http://id.loc.gov/vocabulary/classSchemes/ddc20</bf:edition>
				        <bf:edition>full</bf:edition>
				        <bf:assigner>
				          <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc"/>
				        </bf:assigner>
				      </bf:ClassificationDdc>
				    </bf:classification>
				    <bf:contribution>
				      <bf:Contribution>
				        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bflc/PrimaryContribution"/>
				        <bf:agent>
				          <bf:Agent rdf:about="http://id.loc.gov/rwo/agents/n79041870">
				            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
				            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Woolf, Virginia, 1882-1941.</rdfs:label>
				            <madsrdf:isIdentifiedByAuthority rdf:resource="http://id.loc.gov/authorities/names/n79041870" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				          </bf:Agent>
				        </bf:agent>
				        <bf:role>
				          <bf:Role rdf:about="http://id.loc.gov/vocabulary/relators/ctb">
				            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Contributor</rdfs:label>
				          </bf:Role>
				        </bf:role>
				      </bf:Contribution>
				    </bf:contribution>
				    <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">To the lighthouse</rdfs:label>
				    <bf:title>
				      <bf:Title>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">To the lighthouse</rdfs:label>
				        <bf:mainTitle>To the lighthouse</bf:mainTitle>
				      </bf:Title>
				    </bf:title>
				    <bf:hasSeries>
				      <bf:Work rdf:about="http://id.loc.gov/resources/hubs/8a8cae2fea46062d5e392a9bdf369df0">
				        <bflc:aap xmlns:bflc="http://id.loc.gov/ontologies/bflc/">Routledge English texts</bflc:aap>
				        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">routledgeenglishtexts</bflc:aap-normalized>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Routledge English texts</rdfs:label>
				        <bf:title>
				          <bf:Title>
				            <bf:mainTitle>Routledge English texts</bf:mainTitle>
				          </bf:Title>
				        </bf:title>
				      </bf:Work>
				    </bf:hasSeries>
				    <bf:supplementaryContent>
				      <bf:SupplementaryContent>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Includes bibliographical references (p. 219-222) and index.</rdfs:label>
				      </bf:SupplementaryContent>
				    </bf:supplementaryContent>
				    <bf:subject>
				      <bf:Place>
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Skye, Island of (Scotland)--Fiction.</rdfs:label>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Skye, Island of (Scotland)--Fiction.</madsrdf:authoritativeLabel>
				        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
				          <madsrdf:Geographic>
				            <madsrdf:authoritativeLabel>Skye, Island of (Scotland)</madsrdf:authoritativeLabel>
				          </madsrdf:Geographic>
				          <madsrdf:GenreForm>
				            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
				          </madsrdf:GenreForm>
				        </madsrdf:componentList>
				        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">skyeislandof(scotland)fiction</bflc:aap-normalized>
				      </bf:Place>
				    </bf:subject>
				    <bf:subject>
				      <bf:Topic rdf:about="http://id.loc.gov/authorities/subjects/sh2009125026">
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">English--Scotland--Fiction.</rdfs:label>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">English--Scotland--Fiction.</madsrdf:authoritativeLabel>
				        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
				          <madsrdf:Topic>
				            <madsrdf:authoritativeLabel>English</madsrdf:authoritativeLabel>
				          </madsrdf:Topic>
				          <madsrdf:Geographic>
				            <madsrdf:authoritativeLabel>Scotland</madsrdf:authoritativeLabel>
				          </madsrdf:Geographic>
				          <madsrdf:GenreForm>
				            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
				          </madsrdf:GenreForm>
				        </madsrdf:componentList>
				        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">englishscotlandfiction</bflc:aap-normalized>
				      </bf:Topic>
				    </bf:subject>
				    <bf:subject>
				      <bf:Topic rdf:about="http://id.loc.gov/authorities/subjects/sh2008106913">
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Loss (Psychology)--Fiction.</rdfs:label>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Loss (Psychology)--Fiction.</madsrdf:authoritativeLabel>
				        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
				          <madsrdf:Topic>
				            <madsrdf:authoritativeLabel>Loss (Psychology)</madsrdf:authoritativeLabel>
				          </madsrdf:Topic>
				          <madsrdf:GenreForm>
				            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
				          </madsrdf:GenreForm>
				        </madsrdf:componentList>
				        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">loss(psychology)fiction</bflc:aap-normalized>
				      </bf:Topic>
				    </bf:subject>
				    <bf:subject>
				      <bf:Topic rdf:about="http://id.loc.gov/authorities/subjects/sh2008107230">
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Mothers--Death--Fiction.</rdfs:label>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Mothers--Death--Fiction.</madsrdf:authoritativeLabel>
				        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
				          <madsrdf:Topic>
				            <madsrdf:authoritativeLabel>Mothers</madsrdf:authoritativeLabel>
				          </madsrdf:Topic>
				          <madsrdf:Topic>
				            <madsrdf:authoritativeLabel>Death</madsrdf:authoritativeLabel>
				          </madsrdf:Topic>
				          <madsrdf:GenreForm>
				            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
				          </madsrdf:GenreForm>
				        </madsrdf:componentList>
				        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">mothersdeathfiction</bflc:aap-normalized>
				      </bf:Topic>
				    </bf:subject>
				    <bf:subject>
				      <bf:Topic rdf:about="http://id.loc.gov/authorities/subjects/sh2008111402">
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Summer resorts--Fiction.</rdfs:label>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Summer resorts--Fiction.</madsrdf:authoritativeLabel>
				        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
				          <madsrdf:Topic>
				            <madsrdf:authoritativeLabel>Summer resorts</madsrdf:authoritativeLabel>
				          </madsrdf:Topic>
				          <madsrdf:GenreForm>
				            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
				          </madsrdf:GenreForm>
				        </madsrdf:componentList>
				        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">summerresortsfiction</bflc:aap-normalized>
				      </bf:Topic>
				    </bf:subject>
				    <bf:subject>
				      <bf:Topic rdf:about="http://id.loc.gov/authorities/subjects/sh2008107177">
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Married people--Fiction.</rdfs:label>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Married people--Fiction.</madsrdf:authoritativeLabel>
				        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
				          <madsrdf:Topic>
				            <madsrdf:authoritativeLabel>Married people</madsrdf:authoritativeLabel>
				          </madsrdf:Topic>
				          <madsrdf:GenreForm>
				            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
				          </madsrdf:GenreForm>
				        </madsrdf:componentList>
				        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">marriedpeoplefiction</bflc:aap-normalized>
				      </bf:Topic>
				    </bf:subject>
				    <bf:subject>
				      <bf:Topic rdf:about="http://id.loc.gov/authorities/subjects/sh2008107119">
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Lighthouses--Fiction.</rdfs:label>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Lighthouses--Fiction.</madsrdf:authoritativeLabel>
				        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
				          <madsrdf:Topic>
				            <madsrdf:authoritativeLabel>Lighthouses</madsrdf:authoritativeLabel>
				          </madsrdf:Topic>
				          <madsrdf:GenreForm>
				            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
				          </madsrdf:GenreForm>
				        </madsrdf:componentList>
				        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">lighthousesfiction</bflc:aap-normalized>
				      </bf:Topic>
				    </bf:subject>
				    <bf:subject>
				      <bf:Topic rdf:about="http://id.loc.gov/authorities/subjects/sh2008113433">
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Widowers--Fiction.</rdfs:label>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Widowers--Fiction.</madsrdf:authoritativeLabel>
				        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
				          <madsrdf:Topic>
				            <madsrdf:authoritativeLabel>Widowers</madsrdf:authoritativeLabel>
				          </madsrdf:Topic>
				          <madsrdf:GenreForm>
				            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
				          </madsrdf:GenreForm>
				        </madsrdf:componentList>
				        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">widowersfiction</bflc:aap-normalized>
				      </bf:Topic>
				    </bf:subject>
				    <bf:genreForm>
				      <bf:GenreForm rdf:about="http://id.loc.gov/authorities/subjects/sh85108438">
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Psychological fiction.</madsrdf:authoritativeLabel>
				        <bf:source>
				          <bf:Source>
				            <bf:code>lcsh</bf:code>
				          </bf:Source>
				        </bf:source>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Psychological fiction.</rdfs:label>
				      </bf:GenreForm>
				    </bf:genreForm>
				    <bf:genreForm>
				      <bf:GenreForm rdf:about="http://id.loc.gov/authorities/subjects/sh86004353">
				        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
				        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Domestic fiction.</madsrdf:authoritativeLabel>
				        <bf:source>
				          <bf:Source>
				            <bf:code>lcsh</bf:code>
				          </bf:Source>
				        </bf:source>
				        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Domestic fiction.</rdfs:label>
				      </bf:GenreForm>
				    </bf:genreForm>
				    <bf:contribution>
				      <bf:Contribution>
				        <bf:agent>
				          <bf:Agent rdf:about="http://id.loc.gov/rwo/agents/n87899079">
				            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
				            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Kemp, Sandra.</rdfs:label>
				            <madsrdf:isIdentifiedByAuthority rdf:resource="http://id.loc.gov/authorities/names/n87899079" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
				          </bf:Agent>
				        </bf:agent>
				        <bf:role>
				          <bf:Role rdf:about="http://id.loc.gov/vocabulary/relators/ctb">
				            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Contributor</rdfs:label>
				          </bf:Role>
				        </bf:role>
				      </bf:Contribution>
				    </bf:contribution>
				    <dcterms:isPartOf rdf:resource="http://id.loc.gov/resources/works" xmlns:dcterms="http://purl.org/dc/terms/"/>
				    <bf:hasInstance>
				      <bf:Instance rdf:about="http://id.loc.gov/resources/instances/2998171">
				        <bflc:aap xmlns:bflc="http://id.loc.gov/ontologies/bflc/">To the lighthouse</bflc:aap>
				      </bf:Instance>
				    </bf:hasInstance>
				    <bf:adminMetadata>
				      <bf:AdminMetadata>
				        <bf:generationProcess>
				          <bf:GenerationProcess>
				            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">DLC marc2bibframe2 v1.5.0-SNAPSHOT: 2019-06-13T11:45:19-04:00</rdfs:label>
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
				            <rdf:value>2998171</rdf:value>
				            <bf:assigner>
				              <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc"/>
				            </bf:assigner>
				          </bf:Local>
				        </bf:identifiedBy>
				        <bf:changeDate rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2005-02-15T16:40:14</bf:changeDate>
				        <bf:creationDate rdf:datatype="http://www.w3.org/2001/XMLSchema#date">1993-10-12</bf:creationDate>
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
				    <bf:expressionOf>
				      <bf:Work rdf:about="http://id.loc.gov/resources/hubs/03a711d5e5b9763d7a03d9f4d7d5c642">
				        <bflc:aap xmlns:bflc="http://id.loc.gov/ontologies/bflc/">Woolf, Virginia, 1882-1941. To the lighthouse</bflc:aap>
				      </bf:Work>
				    </bf:expressionOf>
				  </bf:Work>
				</rdf:RDF>`




}


export default parseId;