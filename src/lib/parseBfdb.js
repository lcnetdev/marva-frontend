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
		'bflc': 'http://id.loc.gov/ontologies/bflc/',
		'bf':'http://id.loc.gov/ontologies/bibframe/',		
		'madsrdf': 'http://www.loc.gov/mads/rdf/v1#',
		'rdfs':'http://www.w3.org/2000/01/rdf-schema#',
		'rdf' : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		'lclocal':'http://id.loc.gov/ontologies/lclocal/', 		
		'pmo' :'http://performedmusicontology.org/ontology/',
		'datatypes': 'http://id.loc.gov/datatypes/',
		'xsd': 'http://www.w3.org/2001/XMLSchema#'
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

	// from prefiex to URI
	UriNamespace: function(passedNS){

		for (let ns in this.namespace){
			let nsuri = this.namespace[ns]

			if (passedNS.startsWith(`${ns}:`)){
				return passedNS.replace(`${ns}:`,nsuri)
			}

		}

	},


	returnOneWhereParentIs: function(selection, requiredParent){

		
		


		if (selection.length == 1){
			return selection[0]
		}
		
		for (let el of selection){
			if (el.parentNode.tagName === requiredParent){
				return el
			}
		}

		return false

	},

	activeDom: null,
	hasItem: false,


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

			// ---------------------

			// <bf:subject xmlns:bf="http://id.loc.gov/ontologies/bibframe/">
			//   <bf:Topic xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" rdf:about="http://bibframe.example.org/21468042#Topic650-26">
			//     <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Historians--Russia--Congresses.</rdfs:label>
			//     <madsrdf:isMemberOfMADSScheme xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#" rdf:resource="http://id.loc.gov/authorities/subjects"/>
			//     <madsrdf:componentList xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#" rdf:parseType="Collection">
			//       <madsrdf:Topic>
			//         <madsrdf:authoritativeLabel>Historians</madsrdf:authoritativeLabel>
			//       </madsrdf:Topic>
			//       <madsrdf:Geographic rdf:about="https://id.loc.gov/authorities/names/n80001203">
			//         <madsrdf:authoritativeLabel>Russia</madsrdf:authoritativeLabel>
			//       </madsrdf:Geographic>
			//       <madsrdf:GenreForm>
			//         <madsrdf:authoritativeLabel>Congresses</madsrdf:authoritativeLabel>
			//       </madsrdf:GenreForm>
			//     </madsrdf:componentList>
			//     <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Historians--Russia--Congresses.</madsrdf:authoritativeLabel>
			//     <bf:source>
			//       <bf:Source>
			//         <bf:code>lcsh</bf:code>
			//       </bf:Source>
			//     </bf:source>
			//   </bf:Topic>
			// </bf:subject>

			// grab the label and uri and type
			let typeNode = xml.children[0]
			if (!typeNode){
				console.error('xml.children[0] for this subject does not exist')
				return profile
			}

			profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {}
			let userValue = profile.userValue['http://www.w3.org/2002/07/owl#sameAs']




			userValue['@type'] = this.UriNamespace(typeNode.tagName)
			userValue['URI'] = null
			let label = null

			if (typeNode.attributes && typeNode.attributes['rdf:about']){
				userValue['URI'] = typeNode.attributes['rdf:about'].value
			}

			for (let el of typeNode.children){
				if (el.tagName == 'madsrdf:authoritativeLabel' || el.tagName == this.UriNamespace('madsrdf:authoritativeLabel') ){
					label = el.innerHTML
					userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'] = el.innerHTML
				}else if (el.tagName == 'http://www.loc.gov/mads/rdf/v1#isMemberOfMADSScheme' || el.tagName == this.UriNamespace('madsrdf:isMemberOfMADSScheme') ){
					if (el.attributes && el.attributes['rdf:resource']){
						userValue['http://www.loc.gov/mads/rdf/v1#isMemberOfMADSScheme'] = el.attributes['rdf:resource'].value
					}
				}


			}

			for (let el of typeNode.children){
				if ( (el.tagName == 'rdfs:label' || el.tagName == this.UriNamespace('rdfs:label ')) && label === null ){
					label = el.innerHTML
				}
			}

			if (typeNode.getElementsByTagName('bf:Source').length>0){
				for (let el of typeNode.getElementsByTagName('bf:Source')){

					userValue[this.UriNamespace('bf:source')] = {}

					for (let elc of el.children){
						userValue[this.UriNamespace('bf:source')][this.UriNamespace(elc.tagName)] = elc.innerHTML
					}

				}
			}

			let componentList = []

			
			userValue['http://www.w3.org/2000/01/rdf-schema#label'] = label

			if (typeNode.getElementsByTagName('madsrdf:componentList').length>0){

				for (let child of typeNode.getElementsByTagName('madsrdf:componentList')[0].children){

					let ctype = this.UriNamespace(child.tagName)
					let clabel = null
					if (child.getElementsByTagName('madsrdf:authoritativeLabel').length>0){
						clabel = child.getElementsByTagName('madsrdf:authoritativeLabel')[0].innerHTML
					}
					let URI = null

					
					if (child.attributes && child.attributes['rdf:about']){
						URI = child.attributes['rdf:about'].value
					}

					componentList.push({'http://www.w3.org/2000/01/rdf-schema#label':clabel, URI:URI, '@type':ctype})


				}

			}
			userValue['http://www.loc.gov/mads/rdf/v1#componentList'] = componentList



			
			
			

			return profile


		},
		// 'bf:Work' : function(xml,profile){

			
			
		// 	let titleStr = xml.attributes['rdf:about'].value
			
		// 	let titleEl = xml.getElementsByTagName("bflc:aap")[0]
		// 	if (titleEl){
		// 		titleStr = titleEl.innerHTML
		// 	}

		// 	// "http://www.w3.org/2002/07/owl#sameAs": {
		// 	profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {
		// 		'http://www.w3.org/2000/01/rdf-schema#label': titleStr,
		// 		'URI' : xml.attributes['rdf:about'].value
		// 	}

		


		// 	profile.userValue.URI = xml.attributes['rdf:about'].value
		// 	profile.userValue['http://www.w3.org/2000/01/rdf-schema#label'] = titleStr
		// 	return profile
		// },


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

			


			// a little tricky here because there are possibly multiple bf:contributor properties, one might be the primary contributor
			// the others are just other contributor
			// so test to see if they match, if we have the primary contributor xml and not the primary contributor PT then kick back
			// so it can be picked up by another correct PT

			let isPrimaryContribXML = false

			for (let el of xml.getElementsByTagName('rdf:type')){
				if (el.attributes['rdf:resource'] && el.attributes['rdf:resource'].value == 'http://id.loc.gov/ontologies/bflc/PrimaryContribution'){
					isPrimaryContribXML = true
				}
			}


			if (profile.valueConstraint.valueDataType.dataTypeURI && profile.valueConstraint.valueDataType.dataTypeURI == "http://id.loc.gov/ontologies/bflc/PrimaryContribution"){
				// the profile says yes, if the xml doesn't kick it back
				if (!isPrimaryContribXML){
					
					return false
				}
			}else{
				// the profile says no, if the xml says yesh then kick it back
				if (isPrimaryContribXML){
					
					return false
				}
			}



			

			// grab the label and uri and type
			let typeNode = xml.getElementsByTagName("bf:agent")[0].children[0]

			if (typeNode){

				profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {}

				profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type'] = this.UriNamespace(typeNode.tagName)
				profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = null
				let label = null

				if (typeNode.getElementsByTagName('rdf:type').length>0){
					profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type'] = typeNode.getElementsByTagName('rdf:type')[0].attributes['rdf:resource'].value
				}

				if (typeNode.attributes && typeNode.attributes['rdf:about']){
					profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = typeNode.attributes['rdf:about'].value
				}

				if (typeNode.getElementsByTagName('madsrdf:authoritativeLabel').length>0){
					label = typeNode.getElementsByTagName('madsrdf:authoritativeLabel')[0].innerHTML
				}else if (typeNode.getElementsByTagName('rdfs:label').length>0){
					label = typeNode.getElementsByTagName('rdfs:label')[0].innerHTML
				}

		

				profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.w3.org/2000/01/rdf-schema#label'] = label


				// add in any other properties in the agent bnode
				for (let c of typeNode.children){

					if (c.tagName != 'rdfs:label' && c.tagName != 'rdf:type'){
						profile.userValue['http://www.w3.org/2002/07/owl#sameAs'][this.UriNamespace(c.tagName)] = c.innerHTML
					}

				}



			}else{

				// no <bf:agent><bf:Person> or whatever
				// just <bf:agent/> with a rdf:resource

				//console.error('xml.children[0] for this agent does not exist')
				//return profile

				let justAgent = xml.getElementsByTagName("bf:agent")[0]

				profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {}

				profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type'] = this.UriNamespace("bf:Agent")
				profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = null
				let label = null


				if (justAgent.attributes && justAgent.attributes['rdf:about']){
					profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = justAgent.attributes['rdf:about'].value
				}
				if (justAgent.attributes && justAgent.attributes['rdf:resource']){
					profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = justAgent.attributes['rdf:resource'].value
				}

				if (justAgent.getElementsByTagName('madsrdf:authoritativeLabel').length>0){
					label = justAgent.getElementsByTagName('madsrdf:authoritativeLabel')[0].innerHTML
				}else if (justAgent.getElementsByTagName('rdfs:label').length>0){
					label = justAgent.getElementsByTagName('rdfs:label')[0].innerHTML
				}

				profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.w3.org/2000/01/rdf-schema#label'] = label


			}




			if (xml.getElementsByTagName('bf:Role').length>0){

				for (let roleEl of xml.getElementsByTagName('bf:Role')){

					


					let roleuri = null
					let rolelabel = null
					if (roleEl.attributes && roleEl.attributes['rdf:about']){
						roleuri = roleEl.attributes['rdf:about'].value
					}

					if (roleEl.getElementsByTagName('rdfs:label').length>0){
						rolelabel= roleEl.getElementsByTagName('rdfs:label')[0].innerHTML
					}

					
	



					//if it already exists then there are multiple
					if (profile.userValue['http://id.loc.gov/ontologies/bibframe/role']){
						if (!Array.isArray(profile.userValue['http://id.loc.gov/ontologies/bibframe/role'])){
							profile.userValue['http://id.loc.gov/ontologies/bibframe/role'] = [profile.userValue['http://id.loc.gov/ontologies/bibframe/role']]
						}
						
						let val = {'URI':roleuri, 'http://www.w3.org/2000/01/rdf-schema#label': rolelabel}

						// if it does not have a URI then it is a non controlled term
						if (!roleuri){
							val.BFE2METAnotControled = true 
						}

						profile.userValue['http://id.loc.gov/ontologies/bibframe/role'].push(val)


					}else{
						profile.userValue['http://id.loc.gov/ontologies/bibframe/role'] = {'URI':roleuri, 'http://www.w3.org/2000/01/rdf-schema#label': rolelabel}	
						if (!roleuri){
							profile.userValue['http://id.loc.gov/ontologies/bibframe/role'].BFE2METAnotControled = true 
						}

					}



					



				}


			}

			



			
			
			

			return profile


		}



	},


	transform: function(profile){ 

		// let profileOrginal = Object.assign(profile,{})
		

		let results = this.transformRts(profile)


		// find the unused properties and see if we can add them into the profile ad hoc


		// for (const pkey in results.rt) {

			// TODO 
			

			// ALSO Look inside, at the missingProperties for each component, things like
			// http://id.loc.gov/ontologies/bibframe/agent in the provision activity


		// }

		

		return results
	},


	transformRts: function(profile){

		let toDeleteNoData = []

		

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
				toDeleteNoData.push(pkey)
				continue
			}

			// remove some things we will want to work with later but are just too complicated right now
			let adminMetadata = xml.getElementsByTagName('bf:adminMetadata')
			if (adminMetadata.length>0){
				let adminMetadataData = Array.prototype.slice.call( adminMetadata )
				for (let item of adminMetadata) {
					item.parentNode.removeChild(item)
				}

				
				profile.rt[pkey].adminMetadataData= (new XMLSerializer()).serializeToString(adminMetadataData[0])



			}

			// let hasSeries = xml.getElementsByTagName('bf:hasSeries')
			// let hasSeriesData = Array.prototype.slice.call( hasSeries )
			// for (let item of hasSeries) {
			// 	item.parentNode.removeChild(item)
			// }


			// does this tle have a URI or a type?
			

			if (xml.attributes['rdf:resource']){
				profile.rt[pkey].URI = xml.attributes['rdf:resource'].value
			}else if(xml.attributes['rdf:about']){
				profile.rt[pkey].URI = xml.attributes['rdf:about'].value
			}



			//let rdftype = xml.getElementsByTagName('rdf:type')
			for (let child of xml.children){ 
				if (child.tagName == 'rdf:type'){
					if (child.attributes['rdf:resource']){
						profile.rt[pkey]['@type'] = child.attributes['rdf:resource'].value
						// remove it from the XML since we haev the data
						child.parentNode.removeChild(child)
					}
				}
			}


			// find the instanceOfs
			if (tle == 'bf:Instance'){
				if (xml.getElementsByTagName('bf:instanceOf').length>0){
					let instanceOf = xml.getElementsByTagName('bf:instanceOf')[0]
					if (instanceOf.attributes['rdf:resource']){
						profile.rt[pkey].instanceOf = instanceOf.attributes['rdf:resource'].value
					}else if(instanceOf.attributes['rdf:about']){
						profile.rt[pkey].instanceOf = instanceOf.attributes['rdf:about'].value
					}					


				}
				
			}

			// find itemOf
			if (tle == 'bf:Item'){
				if (xml.getElementsByTagName('bf:itemOf').length>0){
					let itemOf = xml.getElementsByTagName('bf:itemOf')[0]
					if (itemOf.attributes['rdf:resource']){
						profile.rt[pkey].itemOf = itemOf.attributes['rdf:resource'].value
					}else if(itemOf.attributes['rdf:about']){
						profile.rt[pkey].itemOf = itemOf.attributes['rdf:about'].value
					}			

					// delete it
					itemOf.remove()



				}
				
			}




			let sucessfulProperties  = []

			let sucessfulElements  = []




			// at this point we have the main piece of the xml tree that has all our data
			// loop through properties we are looking for and build out the the profile

			for (let k in pt){

				let ptk = JSON.parse(JSON.stringify(pt[k]))

				// remove any default values since we will be populating from the record
				ptk.valueConstraint.defaults=[]
				
				

				let propertyURI = ptk.propertyURI
				let prefixURI = this.namespaceUri(propertyURI)

				// see if we have that specific propertry in the xml
				// let el = xml.getElementsByTagName(prefixURI)

				// we only want top level elements, not nested things like dupe notes etc.
				let el = []
				for (let e of xml.children){
					if (this.UriNamespace(e.tagName) == propertyURI){
						el.push(e)
					}
				}
				


				// Some structural things here to hardcode
				if (propertyURI==='http://id.loc.gov/ontologies/bibframe/Work'){
					// did we find a URI for it?
					if (profile.rt[pkey].URI){
						ptk.userValue={}
						ptk.userValue['http://id.loc.gov/ontologies/bibframe/Work'] = profile.rt[pkey].URI
					}
					
					pt[k] = ptk
					continue

				}




				
				
				

				if (el.length>0){
					// we have that element
					sucessfulProperties.push(prefixURI)

					console.log("---------------")
					console.log(prefixURI)

					// loop through all of them
					let counter = 0
					for (let e of el){
						

						// start populating the data
						let populateData = null
						populateData = JSON.parse(JSON.stringify(ptk))
						// save the source xml for later display
						populateData.xmlSource = e.outerHTML

						
						

						
						// we have some special functions to deal with tricky elements
						if (this.specialTransforms[prefixURI]){
							// make sure to pass the current 'this' context to the functions that use helper functions at this level like this.UriNamespace
							populateData = this.specialTransforms[prefixURI].call(this,e,populateData)	
							

						}else if (e.children.length == 0){

							
							if (e.attributes && e.attributes['rdf:about'] && e.innerHTML.length == 0){
								populateData.userValue[prefixURI] ={
									URI: e.attributes['rdf:about'].value,
									label: null
								} 
							}
							if (e.attributes && e.attributes['rdf:resource']){
								populateData.userValue[prefixURI] ={
									URI: e.attributes['rdf:resource'].value,
									label: null
								} 								
							}	


							if (e.innerHTML && e.innerHTML.length!=0){
								populateData.userValue[this.UriNamespace(prefixURI)] =e.innerHTML								

							}


										
						}else{


							for (let child of e.children){
								



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
									
									
									


									let childLabel = null
									let childProperty = null
									// lvl 2, loop through all of its properties
									for (let grandchild of child.children){

										// example > <bf:title><bf:Title> <bf:mainTitle>
										if (!this.isClass(grandchild.tagName)){

											

											if (grandchild.tagName == 'rdfs:label'){
												
												childProperty = this.UriNamespace(grandchild.tagName)//this.UriNamespace(grandchild.tagName)
												childLabel = grandchild.innerHTML
											}else if (grandchild.tagName == 'rdf:type'){

												if (grandchild.attributes['rdf:resource']){													
													populateData.userValue['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] = grandchild.attributes['rdf:resource'].value
												}else{
													console.warn('something strange going on with rdf:resource of rdf:type')
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

													
													

													let greatgrandchildUriOther = {}
													for (let greatgrandchild of grandchild.children){

														


														let greatgrandchildUri = null
														let greatgrandchildValue = null
														let greatgrandchildType = null
														let greatgrandchildProperty = null
														if (this.isClass(greatgrandchild.tagName)){
															// something like this
															// <bf:classification>
															// 	<bf:ClassificationLcc>
															// 		<bf:source>
															// 			<bf:Source>

															// small usecases here, might need to expand

															greatgrandchildType = this.UriNamespace(greatgrandchild.tagName)
															
															if (greatgrandchild.attributes && greatgrandchild.attributes['rdf:about']){
																greatgrandchildUri = greatgrandchild.attributes['rdf:about'].value
															}

															for (let greatgreatgrandchild of greatgrandchild.children){

																


																if (greatgreatgrandchild.tagName == 'rdfs:label'){
																	greatgrandchildValue = greatgreatgrandchild.innerHTML
																	greatgrandchildProperty = this.UriNamespace(greatgreatgrandchild.tagName)
																}else if (greatgreatgrandchild.tagName == 'madsrdf:authoritativeLabel'){
																	greatgrandchildValue = greatgreatgrandchild.innerHTML
																	greatgrandchildProperty = this.UriNamespace(greatgreatgrandchild.tagName)
																}else if (greatgreatgrandchild.tagName == 'bf:code'){
																	greatgrandchildValue = greatgreatgrandchild.innerHTML
																	greatgrandchildProperty = this.UriNamespace(greatgreatgrandchild.tagName)
																}else if (greatgreatgrandchild.tagName == 'rdf:type'){

																	greatgrandchildUriOther[this.UriNamespace(greatgreatgrandchild.tagName)] = greatgreatgrandchild.attributes['rdf:resource'].value
																}else{

																	// this is a note propery or something like that, save it for later, better be a literal
																	greatgrandchildUriOther[this.UriNamespace(greatgreatgrandchild.tagName)] = greatgreatgrandchild.innerHTML

																}

															}

															// some hack stuff here
															if (greatgrandchildUri && !greatgrandchildValue){
																// so there is a URI, but no label or code for it, just use part of  the URI for the label then
																greatgrandchildValue = greatgrandchildUri.split('/')[greatgrandchildUri.split('/').length-1]
																greatgrandchildProperty = "http://www.w3.org/2000/01/rdf-schema#label"
															}

															

														}else{

															console.warn('not nested class? what is this',greatgrandchild.innerHTML)
														}



														if (greatgrandchildUri && greatgrandchildValue && greatgrandchildType){
															// if (!populateData.userValue[propertyURI]){
															// 	populateData.userValue[propertyURI] = {}
															// }
															populateData.userValue[this.UriNamespace(grandchild.tagName)] = {'@type':greatgrandchildType,'URI':greatgrandchildUri}
															populateData.userValue[this.UriNamespace(grandchild.tagName)][greatgrandchildProperty] = greatgrandchildValue

														}else if (!greatgrandchildUri && greatgrandchildValue && greatgrandchildType){
															// if (!populateData.userValue[propertyURI]){
															// 	populateData.userValue[propertyURI] = {}
															// }														
															populateData.userValue[this.UriNamespace(grandchild.tagName)] = {'@type':greatgrandchildType, 'URI':greatgrandchildUri}
															populateData.userValue[this.UriNamespace(grandchild.tagName)][greatgrandchildProperty] = greatgrandchildValue

														}


													}

													for (let u of Object.keys(greatgrandchildUriOther)){
														// if (!populateData.userValue[propertyURI]){
														// 	populateData.userValue[propertyURI] = {}
														// }	
														if (!populateData.userValue[this.UriNamespace(grandchild.tagName)]){
															populateData.userValue[this.UriNamespace(grandchild.tagName)] = {}
														}	

														populateData.userValue[this.UriNamespace(grandchild.tagName)][u] = greatgrandchildUriOther[u]
													}
													



												}
												

											}
										}else{
											console.error('cant handle nested classes yet')
										}
									}

									// Notes are special things
									// if (propertyURI == 'http://id.loc.gov/ontologies/bibframe/note'){
									// 	propertyURI= 'http://www.w3.org/2000/01/rdf-schema#label'
									// }


									
									
									

									console.log("childUri:",childUri)
									console.log("childLabel:",childLabel)
									console.log("TYPE?",populateData.userValue['@type'])


									
									if (childUri && childLabel){
										if (!populateData.userValue['http://www.w3.org/2002/07/owl#sameAs']){
											populateData.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {}
										}		
										// populateData.userValue[propertyURI].literal = childLabel
										// populateData.userValue[propertyURI].URI = childUri
										

										populateData.userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.w3.org/2000/01/rdf-schema#label'] = childLabel
										populateData.userValue['http://www.w3.org/2002/07/owl#sameAs'].URI = childUri
										populateData.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type'] = this.UriNamespace(child.tagName)
										
										// if we set the type undo it because we have mor specific bnode here
										if (populateData.userValue['@type']){
											delete populateData.userValue['@type']
										}


										// populateData.userValue['@value'] = {literal: childLabel, URI: childUri}
										// populateData.userValue[propertyURI] = {literal: childLabel, URI: childUri}
									// }else if (!childUri && childLabel && Object.keys(populateData.userValue).length==1){
									}else if (!childUri && childLabel){


										

										populateData.userValue[childProperty] = childLabel
										populateData.userValue.URI = null
										populateData.userValue['@type'] = this.UriNamespace(child.tagName)
										populateData.userValue.BFE2METAnotControled=true

										

										// if we set the type undo it because we have mor specific bnode here
										// if (populateData.userValue['@type']){
										// 	delete populateData.userValue['@type']
										// }



										// }else{
										// 	// add to it
										// 	populateData.userValue[propertyURI][]
										// }
										

										// just make it a literal if thetre is no URI
										// populateData.userValue[propertyURI] = childLabel

										// we don't need the higher level @type
										// delete populateData.userValue['@type']

										// testing some things with notes:								





									}else if (childUri && !childLabel) {
										// we have a URI but no label for that value, take the last piece of the URL

										// if (childUri.includes('id.loc.gov/vocabulary/')){
										// 	childLabel = childUri.split('/')[childUri.split('/').length-1]
										// }else{
										// 	childLabel = childUri
										// }


										if (!populateData.userValue['http://www.w3.org/2002/07/owl#sameAs']){
											populateData.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {}
										}		



										populateData.userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.w3.org/2000/01/rdf-schema#label'] = childLabel
										populateData.userValue['http://www.w3.org/2002/07/owl#sameAs'].URI = childUri
										populateData.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type'] = this.UriNamespace(child.tagName)


										// if we set the type undo it because we have mor specific bnode here
										if (populateData.userValue['@type']){
											delete populateData.userValue['@type']
										}



										// populateData.userValue[propertyURI] = {literal: childLabel, URI: childUri}
										



									}else{

										console.warn("Problem with child uri and child label", childUri, childLabel,populateData);
									}



									


								}

							}


						}

						

						if (populateData===false){
							// if it is false it means that the special transform kicked it back as not the right pt for the xml, so skip this one
							continue
						}else{

							sucessfulElements.push(e.outerHTML)

						}
						

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

				
				
				// we did something with it, so remove it from the xml
				// doing this inside the loop because some PT use the same element (like primary contribuitor vs contributor)

				for (let p of sucessfulProperties){
					let els = xml.getElementsByTagName(p)
					// this is a strange loop here because we need to remvoe elements without changing the parent order which will mess up the dom tree and the loop
					for (let step = els.length-1; step >= 0; step=step-1) {

						
						
						if (sucessfulElements.indexOf(els[step].outerHTML)> -1){
							els[step].remove()
						}
					}
				}




			}





			// store the unused xml
			profile.rt[pkey].unusedXml = xml.outerHTML;

			// let parser = new DOMParser();
			// profile.rt[pkey].unusedXmlNodes = parser.parseFromString(xml.outerHTML, "text/xml").children[0];

			
			

			// let totalHasDataLoaded = 0
			let uniquePropertyURIs  = {}
			// we are now going to do some ananlyis on profile, see how many properties are acutally used, what is not used, etc
			for (let key in profile.rt[pkey].pt){

				
				if (Object.keys(uniquePropertyURIs).indexOf(profile.rt[pkey].pt[key].propertyURI)===-1){
					uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI] = {status:false,data:[],resourceTemplates:{},unAssingedProperties:[]}
				}
				// mark if we have loaded data from the source for this properity
				if (Object.keys(profile.rt[pkey].pt[key].userValue).length==0){
					profile.rt[pkey].pt[key].dataLoaded=false
				}else{
					profile.rt[pkey].pt[key].dataLoaded=true
					// totalHasDataLoaded++
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

					
					
					
					profile.rt[pkey].pt[key].missingProfile = []
					// loop though the URIs we have
					Object.keys(profile.rt[pkey].pt[key].userValue).forEach((userURI)=>{
						if (userURI !== '@value' && userURI !== '@type' && userURI !== 'uri'){
							if (allUris.indexOf(userURI)===-1){
								
								profile.rt[pkey].pt[key].missingProfile.push(userURI)

								uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI].unAssingedProperties.push(userURI)
							}
						}

					})

					if (uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI].unAssingedProperties.length>0){
						uniquePropertyURIs[profile.rt[pkey].pt[key].propertyURI].status='mixed'
					}

					


				}
			}



			profile.rt[pkey].propertyLoadReport = uniquePropertyURIs

			profile.rt[pkey].propertyLoadRatio = parseInt(Object.keys(uniquePropertyURIs).filter((k)=>uniquePropertyURIs[k].status).length /Object.keys(uniquePropertyURIs).length * 100)

			
			
			


			
			
			
			
			
			
			











			



		}

		// these RTs did not have any data parsed into them, because they were not present
		// remove them from the profile
		for (let x of toDeleteNoData){
			profile.rt[x].noData=true			
			// profile.rtOrder.splice(profile.rtOrder.indexOf(x), 1);
		}

		
		return profile




	},

	parse: function(xml){

		if (!xml){
			xml = this.testXml
		}	
		// use the browser if we can, should be faster, fall back to the library if not running in the browser
		if (window.DOMParser){
			let parser = new DOMParser();
			this.activeDom = parser.parseFromString(xml, "text/xml");


			// test to see if there are any Items,
			this.hasItem = this.activeDom.getElementsByTagName('bf:Item').length


		// the library very much doesn't work on anything but chrome
		// }else{
		// 	this.activeDom = new jsdom.JSDOM(xml, {
		// 		contentType: "text/xml",
		// 		storageQuota: 10000000
		// 	})
		// 	this.activeDom = this.dom.window.document
		}



		




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