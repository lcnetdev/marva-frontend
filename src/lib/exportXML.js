// import store from "../store";
import lookupUtil from "./lookupUtil";




const parser = new DOMParser();


const exportXML = {

	namespace: {
		'bflc': 'http://id.loc.gov/ontologies/bflc/',
		'bf':'http://id.loc.gov/ontologies/bibframe/',		
		'madsrdf': 'http://www.loc.gov/mads/rdf/v1#',
		'rdfs':'http://www.w3.org/2000/01/rdf-schema#',
		'rdf' : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		'lclocal':'http://id.loc.gov/ontologies/lclocal/', 		
		'pmo' :'http://performedmusicontology.org/ontology/',
		'datatypes': 'http://id.loc.gov/datatypes/',
		'xsd': 'http://www.w3.org/2001/XMLSchema#',
		'void':'http://rdfs.org/ns/void#',
	},


	// ignore these beause we do something very structural to the document 
	ignoreProperties: [

		'http://id.loc.gov/ontologies/bibframe/instanceOf'

	],

	// from URI to prefixed
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


	createElByBestNS: function(elStr){


		for (let ns of Object.keys(this.namespace)){
				
			if (elStr.includes(this.namespace[ns])){
				
				return document.createElementNS(this.namespace[ns],this.namespaceUri(elStr))
			}

			//rdf.setAttributeNS("http://www.w3.org/2000/xmlns/", `xmlns:${ns}`, this.namespace[ns])

		}

		console.error('could not find namespace for ', elStr)
		return null
	},

	specialTransforms: {

		'bf:example' : function(xml,profile){
			return profile
		}



	},


	suggestType: async function(propertyURI){


		// at this point we have a well cached lookup of the whole onotlogy in localstorage
		// ask for this one, if it idoesnt have it, it will relookup (or if it is expired)
		let propXml = await lookupUtil.fetchOntology(propertyURI)
		let prop = parser.parseFromString(propXml, "text/xml");
		let range = prop.getElementsByTagName("rdfs:range")

		// if it has a range return it
		if (range){
			range=range[0]
			if (range.attributes['rdf:resource']){
				return range.attributes['rdf:resource'].value
			}
		}

		// no range, do something else to try to figure out what the rdf:type is
		// TODO if needed



		// if fails
		return false





	},



	toBFXML: async function(profile){



		let tleWork = []
		let tleInstance = []
		let tleItem = []

		let rdf = document.createElementNS(this.namespace.rdf, "RDF");


		for (let ns of Object.keys(this.namespace)){
			
			rdf.setAttributeNS("http://www.w3.org/2000/xmlns/", `xmlns:${ns}`, this.namespace[ns])

		}

		let xmlVoidDataRtsUsed = []
		let xmlVoidDataType = []
		let xmlVoidExternalID = []
		let xmlVoidDataTitle = ""
		let xmlVoidDataContributor = ""
		let xmlVoidDataLccn = ""

		



		for (let rt of profile.rtOrder){


			if (profile.rt[rt].noData) continue

				console.log(profile.rt[rt])

			let tleArray
			let rootEl
			let rootElName

			if (rt.endsWith(':Work')){
				tleArray = tleWork
				rootEl = document.createElementNS(this.namespace.bf,"bf:Work");
				rootElName = "Work"
			}else if (rt.endsWith(':Instance')){
				tleArray = tleInstance
				rootEl = document.createElementNS(this.namespace.bf,"bf:Instance");
				rootElName = "Instance"
			}else if (rt.endsWith(':Item')){
				tleArray = tleItem
				rootEl = document.createElementNS(this.namespace.bf,"bf:Item");
				rootElName = "Item"
			}

			rdf.appendChild(rootEl)

			console.log(profile.rt[rt])
			if (profile.rt[rt].URI){
				rootEl.setAttributeNS(this.namespace.rdf, 'rdf:about', profile.rt[rt].URI)
				xmlVoidExternalID.push(profile.rt[rt].URI)
			}
			if (profile.rt[rt]['@type']){

				let type = this.createElByBestNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
				type.setAttributeNS(this.namespace.rdf, 'rdf:resource', profile.rt[rt]['@type'])
				rootEl.appendChild(type)				
			}


			for (let pt of profile.rt[rt].ptOrder){

				let ptObj = profile.rt[rt].pt[pt]

				if (this.ignoreProperties.indexOf(ptObj.propertyURI) > -1){
					
					continue
				}

				// does it even have any userValues?
				if (Object.keys(ptObj.userValue).length>0){

					console.log(rt,xmlVoidDataRtsUsed.indexOf(rt),xmlVoidDataRtsUsed)
					if (xmlVoidDataRtsUsed.indexOf(rt)==-1){
						xmlVoidDataRtsUsed.push(rt)
					}
					if (xmlVoidDataType.indexOf(rootElName)==-1){
						xmlVoidDataType.push(rootElName)
					}

					// does it have a root @type, meaning it is a blank node
					if (ptObj.userValue['@type']){

						// construct the predicate
						let p = this.createElByBestNS(ptObj.propertyURI)
						rootEl.appendChild(p)

						// the bnode
						let bnode = this.createElByBestNS(ptObj.userValue['@type'])
						p.appendChild(bnode)


						// now loop through all the properties to go into this bnode
						for (let key of Object.keys(ptObj.userValue)){

							// we already handled this guy
							if (key === '@type'){ continue }

							if (key === 'URI' && !ptObj.userValue[key]){ 
								continue 
							}else if (key === 'URI' && ptObj.userValue[key]){ 								
								bnode.setAttributeNS(this.namespace.rdf, 'rdf:about', ptObj.userValue[key])
								continue
							}

							// just to be safe, is the URI prefixed? If so expand it

							let pURI = key
							if (!pURI.includes('http://') && !pURI.includes('https://')){
								pURI = this.UriNamespace(pURI)
							}

							// create the property
							
							let bnodeProperty = this.createElByBestNS(pURI)
							bnode.appendChild(bnodeProperty)

							let values = ptObj.userValue[key]

							// make it an array if it is singular
							if (!Array.isArray(values)){
								values = [values]
							}
							console.log(ptObj,"<<ptObj")

							for (let value of values){

								// we have the bnode predicate URI now, test to see if this is a stright literal or if we need to do something special
								if (typeof value === 'string' || value instanceof String){

									// just a literal set the internal value of the element to the value
									bnodeProperty.innerHTML = value


								} else if (!isNaN(value)){ 

									// a number literal
									bnodeProperty.innerHTML = value

								}else if (typeof value === 'object' && value !== null){

									// it is another blank node 
									// THIS CODE IS REPEATED BELOW - TODO function
									if (value['@type'] || value['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']){

										let subBnodeType = (value['@type'] ? value['@type'] : value['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'])
										
										// create the subBnodeBro
										let subBnode = this.createElByBestNS(subBnodeType)
										bnodeProperty.appendChild(subBnode)

										// do the same thing at this level
										for (let subKey of Object.keys(value)){

											console.log(subKey, value[subKey])

											if (subKey!=='@type' && subKey!=='http://www.w3.org/1999/02/22-rdf-syntax-ns#type'){
												

												if (subKey=='URI'){

													// does it have a URI
													if (value[subKey]){
														// it is the URI of this entitiy, make it the RDF:about
														subBnode.setAttributeNS(this.namespace.rdf, 'rdf:about', value[subKey])
													// }else{

													}else{
														console.warn("URI defined but no value",value)
													}



												}else if(subKey=='http://www.w3.org/2000/01/rdf-schema#label'){

													// create a rdf:label for it
													// test to see it isnt null too
													if (value[subKey]){
														let subBnodeLabel = this.createElByBestNS(this.namespace.rdfs + 'label')
														subBnodeLabel.innerHTML = value[subKey]
														subBnode.appendChild(subBnodeLabel)
													}

												}else{
													

													// add it in if it is a literal
													if (typeof value[subKey] === 'string' || value[subKey] instanceof String){
														
														let subpURI = subKey
														if (!subpURI.includes('http://') && !subpURI.includes('https://')){
															subpURI = this.UriNamespace(subpURI)
														}


														let subBnodeLabel = this.createElByBestNS(subpURI)
														subBnodeLabel.innerHTML = value[subKey]
														subBnode.appendChild(subBnodeLabel)

													}else{
														console.warn("Don't know what to do with this subkey:",subKey, 'in',value)

													}

												}


											}


										}


									}else{



										// there is no @type, since they created it in the editor
										// refer to the ontology to see if it knows what type this should be
										let suggestedType = await this.suggestType(pURI)

										
										
										

										
										
										if (suggestedType){


											let subBnodeType = suggestedType
											
											// create the subBnodeBro
											let subBnode = this.createElByBestNS(subBnodeType)
											bnodeProperty.appendChild(subBnode)

											// do the same thing at this level
											for (let subKey of Object.keys(value)){

												if (subKey!=='@type' && subKey!=='http://www.w3.org/1999/02/22-rdf-syntax-ns#type'){
													

													if (subKey=='URI'){

																												
														if (value[subKey]){
															// it is the URI of this entitiy, make it the RDF:about
															subBnode.setAttributeNS(this.namespace.rdf, 'rdf:about', value[subKey])
														// }else{

														}

													}else if(subKey=='http://www.w3.org/2000/01/rdf-schema#label'){

														// create a rdf:label for it
														// test to see it isnt null too
														if (value[subKey]){
															let subBnodeLabel = this.createElByBestNS(this.namespace.rdfs + 'label')
															subBnodeLabel.innerHTML = value[subKey]
															subBnode.appendChild(subBnodeLabel)
														}

													}else{
														console.warn("Don't know what to do with this subkey:",subKey, 'in',value)
													}


												}


											}






										}else{

											console.warn("This bnode does not have a type:",value)

										}





									}
										

								}else{


									// this is somrthing else
									console.warn("EKSE!!!!",value)



								}
							}


						}



						


					}else{


						// no @type, maybe it is a literal

						if (ptObj.type==='literal'){

							for (let key of Object.keys(ptObj.userValue)){

								if (key == '@type'){
									continue
								}else if (key == ptObj.propertyURI){
									// if it is itself, then it is just a plain literal, make the text node

									let value = ptObj.userValue[key]

									if (typeof value === 'string' || value instanceof String){

										// just a literal set the internal value of the element to the value
										// construct the predicate
										let p = this.createElByBestNS(ptObj.propertyURI)
										rootEl.appendChild(p)

										p.innerHTML = value	

										


									} else{

										console.warn('dunno what to do with this key', key, 'in', ptObj, ' not a string literal')
									
									}								




								}else{

									console.warn('dunno what to do with this key', key, 'in', ptObj)
								}

								
								



							}


						}else{

							console.warn('not sure what to do with this property',ptObj)


						}

						


					}



				}


			}



			// add in the admindata
			rootEl.appendChild(profile.rt[rt].adminMetadataData)
			
			

			tleArray.push(rootEl)
			console.log(rootEl)
			// let strXml = (new XMLSerializer()).serializeToString(rdf)

			

		}

		if (rdf.getElementsByTagName("bf:mainTitle")){
			xmlVoidDataTitle = rdf.getElementsByTagName("bf:mainTitle")[0].innerHTML
		}else{
			console.warn('no title found for db')
		}


		if (rdf.getElementsByTagName("bf:Lccn")){
			xmlVoidDataLccn = rdf.getElementsByTagName("bf:Lccn")[0].innerText || rdf.getElementsByTagName("bf:Lccn")[0].textContent
		}else{
			console.warn('no bf:Lccn found for db')
		}


		// create the holder
		let datasetDescriptionEl = document.createElementNS(this.namespace.void,'void:DatasetDescription')

		datasetDescriptionEl.setAttributeNS("http://www.w3.org/2000/xmlns/", `xmlns:void`, this.namespace.void)
		datasetDescriptionEl.setAttributeNS("http://www.w3.org/2000/xmlns/", `xmlns:lclocal`, this.namespace.lclocal)
		let el


		for (let x of xmlVoidDataRtsUsed){
			el = document.createElementNS(this.namespace.lclocal, 'lclocal:rtsused')
			el.innerHTML = x
			datasetDescriptionEl.appendChild(el)
		}

		for (let x of xmlVoidDataType){
			el = document.createElementNS(this.namespace.lclocal, 'lclocal:profiletypes')
			el.innerHTML = x
			datasetDescriptionEl.appendChild(el)
		}


		el = document.createElementNS(this.namespace.lclocal, 'lclocal:title')
		el.innerHTML = xmlVoidDataTitle
		datasetDescriptionEl.appendChild(el)


		el = document.createElementNS(this.namespace.lclocal, 'lclocal:contributor')
		el.innerHTML = xmlVoidDataContributor
		datasetDescriptionEl.appendChild(el)

		el = document.createElementNS(this.namespace.lclocal, 'lclocal:lccn')
		el.innerHTML = xmlVoidDataLccn
		datasetDescriptionEl.appendChild(el)

		el = document.createElementNS(this.namespace.lclocal, 'lclocal:user')
		el.innerHTML = profile.user
		datasetDescriptionEl.appendChild(el)

		el = document.createElementNS(this.namespace.lclocal, 'lclocal:status')
		el.innerHTML = profile.status
		datasetDescriptionEl.appendChild(el)

		el = document.createElementNS(this.namespace.lclocal, 'lclocal:eid')
		el.innerHTML = profile.eId
		datasetDescriptionEl.appendChild(el)

		el = document.createElementNS(this.namespace.lclocal, 'lclocal:typeid')
		el.innerHTML = profile.id
		datasetDescriptionEl.appendChild(el)

		for (let x of xmlVoidExternalID){
			el = document.createElementNS(this.namespace.lclocal, 'lclocal:externalid')
			el.innerHTML = x
			datasetDescriptionEl.appendChild(el)
		}


		rdf.append(datasetDescriptionEl)

		let strXml = (new XMLSerializer()).serializeToString(rdf)
		console.log(strXml)
		


		console.log(profile)
		console.log(datasetDescriptionEl)






  // <void:DatasetDescription rdf:about="" xmlns:void="http://rdfs.org/ns/void#">
  //   <foaf:primaryTopic xmlns:foaf="http://xmlns.com/foaf/0.1/" rdf:resource="http://id.loc.gov/resources/works/21026276" />
  // </void:DatasetDescription>

		const putMethod = {
			method: 'PUT', // Method itself
			headers: {
				'Content-type': 'application/xml', // Indicates the content 
				'Custom-header': "YESY"
			},
			body: strXml // We send data in JSON format
		}

		let url = 'http://localhost:9400/api-staging/ldp/' + profile.eId
		fetch(url, putMethod)
		.then(response => console.log(response.text))
		// .then(data => console.log(data)) // Manipulate the data retrieved back, if we want to do something with it
		.catch(err => console.log(err)) // Do something with the error


		return profile

	}






}


export default exportXML;