// import store from "../store";
import lookupUtil from "./lookupUtil";
import uiUtils from "./uiUtils";
import parseProfile from "./parseProfile";




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

		'http://id.loc.gov/ontologies/bibframe/instanceOf',
		'http://id.loc.gov/ontologies/bibframe/hasItem',
		'http://id.loc.gov/ontologies/bibframe/itemOf',
		'http://id.loc.gov/ontologies/bibframe/hasInstance',
		'http://id.loc.gov/ontologies/bibframe/Work'

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

		// if the elString is not a expanded URI
		if (!elStr.startsWith('http')){
			elStr = this.UriNamespace(elStr)
		}

		for (let ns of Object.keys(this.namespace)){
				
			if (elStr.startsWith(this.namespace[ns])){
				
				return document.createElementNS(this.namespace[ns],this.namespaceUri(elStr))
			}

			//rdf.setAttributeNS("http://www.w3.org/2000/xmlns/", `xmlns:${ns}`, this.namespace[ns])

		}

		console.error('could not find namespace for ', elStr)
		return null
	},

	specialTransforms: {

		// 'bf:example' : function(xml,profile){
		// 	return profile
		// },


		'bf:subject' : function(ptObj){



			if (ptObj.userValue['http://www.w3.org/2002/07/owl#sameAs']){

				let sameAs = ptObj.userValue['http://www.w3.org/2002/07/owl#sameAs']

				let subject = document.createElementNS(this.namespace.bf,"bf:subject")

				let subjectNode = this.createElByBestNS(sameAs['@type'])
				subject.appendChild(subjectNode)

				if (sameAs.URI){
					subjectNode.setAttributeNS(this.namespace.rdf, 'rdf:about', sameAs.URI)
				}				

				if (sameAs['http://www.w3.org/2000/01/rdf-schema#label']){

					let label = document.createElementNS(this.namespace.rdfs,"rdfs:label")
					label.innerHTML = sameAs['http://www.w3.org/2000/01/rdf-schema#label']
					subjectNode.appendChild(label)

					let label2 = document.createElementNS(this.namespace.madsrdf,"madsrdf:authoritativeLabel")
					label2.innerHTML = sameAs['http://www.w3.org/2000/01/rdf-schema#label']
					subjectNode.appendChild(label2)

				}


				if (sameAs['http://id.loc.gov/ontologies/bibframe/source']){

					let sourceNode = document.createElementNS(this.namespace.bf,"bf:Source")
					subjectNode.appendChild(sourceNode)

					if (sameAs['http://id.loc.gov/ontologies/bibframe/source'].URI){
						sourceNode.setAttributeNS(this.namespace.rdf, 'rdf:about', sameAs['http://id.loc.gov/ontologies/bibframe/source'].URI)
					}
					if (sameAs['http://id.loc.gov/ontologies/bibframe/source']['http://id.loc.gov/ontologies/bibframe/code']){

						let label = document.createElementNS(this.namespace.bf,"bf:code")
						label.innerHTML = sameAs['http://id.loc.gov/ontologies/bibframe/source']['http://id.loc.gov/ontologies/bibframe/code']
						sourceNode.appendChild(label)
					}

				}


				if (sameAs['http://www.loc.gov/mads/rdf/v1#componentList']){

					let componentListPredicate = document.createElementNS(this.namespace.madsrdf,"madsrdf:componentList")
					
					subjectNode.appendChild(componentListPredicate)

					for (let c of sameAs['http://www.loc.gov/mads/rdf/v1#componentList']){


						let n = this.createElByBestNS(c['@type'])
						if (c.URI){
							n.setAttributeNS(this.namespace.rdf, 'rdf:about', c.URI)
						}	

						if (c['http://www.w3.org/2000/01/rdf-schema#label']){

							let label = document.createElementNS(this.namespace.rdfs,"rdfs:label")
							label.innerHTML = c['http://www.w3.org/2000/01/rdf-schema#label']
							n.appendChild(label)

							let label2 = document.createElementNS(this.namespace.madsrdf,"madsrdf:authoritativeLabel")
							label2.innerHTML = c['http://www.w3.org/2000/01/rdf-schema#label']
							n.appendChild(label2)

						}

						componentListPredicate.appendChild(n)



					}

				}




				return subject

			}else{


				console.error('No same as for the this subject',ptObj)
			}


		},


		'bf:contribution' : function(ptObj){

			let userValue = ptObj.userValue
			let dataTypeURI = null
			if (ptObj.valueConstraint && ptObj.valueConstraint.valueDataType && ptObj.valueConstraint.valueDataType.dataTypeURI){
				dataTypeURI = ptObj.valueConstraint.valueDataType.dataTypeURI
			}

			// if primary it goes
			// <contribution> 
			//   <bflc:PrimaryContribution>
			//     <agent>
			//       <bf:$TYPE>
			
			let contribution
			let agent = document.createElementNS(this.namespace.bf,"bf:agent")


			if (dataTypeURI == 'http://id.loc.gov/ontologies/bflc/PrimaryContribution'){
				contribution = document.createElementNS(this.namespace.bf,"bf:contribution")

				// if it is primary contribution then add a rdf type node to it
				// let pContribution = document.createElementNS(this.namespace.bflc,"bflc:PrimaryContribution")
				// contribution.appendChild(pContribution)				

				let type = this.createElByBestNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
				type.setAttributeNS(this.namespace.rdf, 'rdf:resource', "http://id.loc.gov/ontologies/bflc/PrimaryContribution")
				contribution.appendChild(type)
				contribution.appendChild(agent)


				

			}else{
				contribution = document.createElementNS(this.namespace.bf,"bf:contribution")
				contribution.appendChild(agent)

			}
			

			// is there a role?
			if (userValue['http://id.loc.gov/ontologies/bibframe/role']){

				let rolePredicate = document.createElementNS(this.namespace.bf,"bf:role")

				if (!Array.isArray(userValue['http://id.loc.gov/ontologies/bibframe/role'])){
					userValue['http://id.loc.gov/ontologies/bibframe/role'] = [userValue['http://id.loc.gov/ontologies/bibframe/role']]
				}

				for (let role of userValue['http://id.loc.gov/ontologies/bibframe/role']){

					
					contribution.appendChild(rolePredicate)

					let roleBnode = document.createElementNS(this.namespace.bf,"bf:Role")
					rolePredicate.appendChild(roleBnode)

					if (role.URI){
						roleBnode.setAttributeNS(this.namespace.rdf, 'rdf:about', role.URI)
					}
					if (role['http://www.w3.org/2000/01/rdf-schema#label']){

						let label = document.createElementNS(this.namespace.rdfs,"rdfs:label")
						label.innerHTML = role['http://www.w3.org/2000/01/rdf-schema#label']
						roleBnode.appendChild(label)
					}



				}


			}


			// build the agent based on the type of agent it is
			// if we have a @type we can make that bnode otherwise make a Agent
			if (userValue['http://www.w3.org/2002/07/owl#sameAs']){

				let sameAs = userValue['http://www.w3.org/2002/07/owl#sameAs']

				let agentBnode

				// see if outside the sameAs we have the BF type that it is

				if (userValue['@type']){
					let bftype = this.namespaceUri(userValue['@type'])
					agentBnode = document.createElementNS(this.namespace.bf,bftype)
				}else{
					agentBnode = document.createElementNS(this.namespace.bf,'bf:Agent')
				}


				// but add a rdf type to it if we have the MADs too
				if (sameAs['@type']){
					let type = this.createElByBestNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
					type.setAttributeNS(this.namespace.rdf, 'rdf:resource', sameAs['@type'])
					agentBnode.appendChild(type)
				}

				if (sameAs.URI){
					agentBnode.setAttributeNS(this.namespace.rdf, 'rdf:about', sameAs.URI)
				}

				if (sameAs["http://www.w3.org/2000/01/rdf-schema#label"]){

					let label = document.createElementNS(this.namespace.rdfs,"rdfs:label")
					label.innerHTML = sameAs['http://www.w3.org/2000/01/rdf-schema#label']
					agentBnode.appendChild(label)
				}
				

				for (let key of Object.keys(sameAs)){

					// there are some special keys we want to not try to serailize 
					if (key == '@type' || key == 'rdfs:label' || key == 'http://www.w3.org/2000/01/rdf-schema#label' || key == 'URI' || key == 'context' || key.startsWith('BFE2META')){continue}


					// should only be literals, if not we need to handle that differently
					if (typeof sameAs[key] === 'string' || sameAs[key] instanceof String){

						let pp = this.createElByBestNS(key)
						pp.innerHTML = sameAs[key]
						agentBnode.appendChild(pp)

					}else if (sameAs[key] === null){

						console.warn('null value for ',key, 'in', ptObj)

					}else{

						console.error("In a sameAs entitiy with a non-literal value, don't know what to do!", ptObj)

					}

				}


				agent.appendChild(agentBnode)



			}else{

				console.error("There is no sameAS for this contributor:", ptObj)
			}






			return contribution


		},


	},


	suggestType: async function(propertyURI){

		console.log('propertyURI:',propertyURI)

		// at this point we have a well cached lookup of the whole onotlogy in localstorage
		// ask for this one, if it idoesnt have it, it will relookup (or if it is expired)
		let propXml = await lookupUtil.fetchOntology(propertyURI)
		let prop = parser.parseFromString(propXml, "text/xml");
		let range = prop.getElementsByTagName("rdfs:range")

		// if it has a range return it
		if (range.length>0){
			range=range[0]
			if (range.attributes['rdf:resource']){
				return range.attributes['rdf:resource'].value
			}
		}

		let profileLookup = parseProfile.suggestType(propertyURI)
		if (profileLookup != false){
			return profileLookup
		}

		// some try something else
		// TODO if needed


		// if fails
		return false





	},



	toBFXML: async function(profile){




		try{
			return await this.toBFXMLProcess(profile)	
		}catch{

			alert("There was an error building the XML - Please 'Report Error'")
			return false
		}
		


	},



	toBFXMLProcess: async function(profile){

		let orginalProfile = profile
		// cut the ref to the orginal
		profile = JSON.parse(JSON.stringify(profile))




		let tleWork = []
		let tleInstance = []
		let tleItem = []

		let rdf = document.createElementNS(this.namespace.rdf, "RDF");
		let rdfBasic = document.createElementNS(this.namespace.rdf, "RDF");


		for (let ns of Object.keys(this.namespace)){
			
			rdf.setAttributeNS("http://www.w3.org/2000/xmlns/", `xmlns:${ns}`, this.namespace[ns])
			rdfBasic.setAttributeNS("http://www.w3.org/2000/xmlns/", `xmlns:${ns}`, this.namespace[ns])

		}

		let xmlVoidDataRtsUsed = []
		let xmlVoidDataType = []
		let xmlVoidExternalID = []
		let xmlVoidDataTitle = ""
		let xmlVoidDataContributor = ""
		let xmlVoidDataLccn = ""

		
		let tleLookup = {
			Work: {},
			Instance: {},
			Item: {},
		}


		for (let rt of profile.rtOrder){

			console.log(profile)

			if (profile.rt[rt].noData) continue

				

			let tleArray
			let rootEl
			let rootElName

			if (rt.includes(':Work')){
				tleArray = tleWork
				rootEl = document.createElementNS(this.namespace.bf,"bf:Work");
				rootElName = "Work"
			}else if (rt.includes(':Instance')){
				tleArray = tleInstance
				rootEl = document.createElementNS(this.namespace.bf,"bf:Instance");
				rootElName = "Instance"
			}else if (rt.includes(':Item')){
				tleArray = tleItem
				rootEl = document.createElementNS(this.namespace.bf,"bf:Item");
				rootElName = "Item"
			}

			// rdf.appendChild(rootEl,tleArray)
			console.log(tleArray)
			
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


					// keep track of what resource teplates we used in this record
					if (xmlVoidDataRtsUsed.indexOf(rt)==-1){
						xmlVoidDataRtsUsed.push(rt)
					}
					if (xmlVoidDataType.indexOf(rootElName)==-1){
						xmlVoidDataType.push(rootElName)
					}



					// is this one of the special transforms
					if (this.specialTransforms[this.namespaceUri(ptObj.propertyURI)]){


						let resultEl = this.specialTransforms[this.namespaceUri(ptObj.propertyURI)].call(this,ptObj)	

						if (resultEl){
							rootEl.appendChild(resultEl)
						}else{
							console.error('Need to special transform', ptObj.propertyURI,resultEl)			
						}

						


					// does it only have a sameAs property, a entitiy lookup complex + simple?
					}else if (ptObj.userValue['http://www.w3.org/2002/07/owl#sameAs'] && Object.keys(ptObj.userValue).length == 1){

						// if its not an array then make it
						if (!Array.isArray(ptObj.userValue['http://www.w3.org/2002/07/owl#sameAs'])){
							ptObj.userValue['http://www.w3.org/2002/07/owl#sameAs'] = [ptObj.userValue['http://www.w3.org/2002/07/owl#sameAs']]

						}


						for (let sameAs of ptObj.userValue['http://www.w3.org/2002/07/owl#sameAs']){

							if (!sameAs['URI'] || !sameAs['@type']){
								console.error("Missing URI or @type for this bnode, cannot export:",ptObj)
								continue
							}


							// construct the predicate
							let p = this.createElByBestNS(ptObj.propertyURI)
							rootEl.appendChild(p)

							// the bnode
							let bnode = this.createElByBestNS(sameAs['@type'])
							p.appendChild(bnode)

							//set the URI
							bnode.setAttributeNS(this.namespace.rdf, 'rdf:about', sameAs['URI'])

							// loop through the rest of the properties and create them
							for (let key of Object.keys(sameAs)){

								// there are some special keys we want to not try to serailize 
								if (key == '@type' || key == 'URI' || key == 'context' || key.startsWith('BFE2META')){continue}

								// should only be literals, if not we need to handle that differently
								if (typeof sameAs[key] === 'string' || sameAs[key] instanceof String){

									let pp = this.createElByBestNS(key)
									pp.innerHTML = sameAs[key]
									bnode.appendChild(pp)
								}else if (sameAs[key] === null){

									console.warn('null value for ',key, 'in', ptObj)

								}else{

									console.error("In a sameAs entitiy with a non-literal value, don't know what to do!", ptObj)

								}

							}


						}

					// there is a lookup and other things to handel as well
					}else if (ptObj.userValue['http://www.w3.org/2002/07/owl#sameAs'] && Object.keys(ptObj.userValue).length > 1){

						// we are going to make the bnode from the sameAs then add in the other properties into that bnode
						let sameAs = ptObj.userValue['http://www.w3.org/2002/07/owl#sameAs']

						// construct the predicate
						let p = this.createElByBestNS(ptObj.propertyURI)
						rootEl.appendChild(p)

						// the bnode
						let bnode = this.createElByBestNS(sameAs['@type'])
						p.appendChild(bnode)

						//set the URI
						bnode.setAttributeNS(this.namespace.rdf, 'rdf:about', sameAs['URI'])

						// loop through the rest of the properties and create them
						for (let key of Object.keys(sameAs)){

							// there are some special keys we want to not try to serailize 
							if (key == '@type' || key == 'URI' || key == 'context' || key.startsWith('BFE2META')){continue}

							// should only be literals, if not we need to handle that differently
							if (typeof sameAs[key] === 'string' || sameAs[key] instanceof String){

								let pp = this.createElByBestNS(key)
								pp.innerHTML = sameAs[key]
								bnode.appendChild(pp)
							}else if (sameAs[key] === null){
								console.warn('null value for ',key, 'in', ptObj)
							}else{
								console.error("In a sameAs entitiy with a non-literal value, don't know what to do!", ptObj)
							}
						}

						for (let key of Object.keys(ptObj.userValue)){

							let value = ptObj.userValue[key]

							// we just did this one above
							if (key == 'http://www.w3.org/2002/07/owl#sameAs'){ continue}

								
							if (key.startsWith('BFE2META')){continue}

							// no nulls plz
							if (value===null){ continue}

							// if it is an object we need to create another bnode, but make it inside the one
							// created for the sameAs entitiy lookup
							
							if (typeof value === 'object' && value !== null){

								// make sure we know what to make
								if (!value['@type']){
									// figure out the type it should be from the ontology
									value['@type'] = await this.suggestType(key);	
								}

								if (value['@type']){


									// construct the predicate
									let pp = this.createElByBestNS(key)
									bnode.appendChild(pp)

									// the bnode
									let bnodeChild = this.createElByBestNS(value['@type'])
									pp.appendChild(bnodeChild)

									if (value['URI']){
										bnodeChild.setAttributeNS(this.namespace.rdf, 'rdf:about', value['URI'])
									}



									// populate the rest of the properties in the subbnode
									for (let subkey of Object.keys(value)){

										// there are some special keys we want to not try to serailize 
										if (subkey == '@type' || subkey == 'URI' || subkey == 'context' || subkey.startsWith('BFE2META')){continue}

										// should only be literals, if not we need to handle that differently
										if (typeof value[subkey] === 'string' || value[subkey] instanceof String){

											let ppp = this.createElByBestNS(subkey)
											ppp.innerHTML = value[subkey]
											bnodeChild.appendChild(ppp)

										}else if (sameAs[key] === null){
											console.warn('null value for ',subkey, 'in', ptObj)
										}else{
											console.error("In a sameAs entitiy with a non-literal value, don't know what to do!", ptObj)
										}
									}

								}else{


									console.error('could not make bnode from ', value, 'in',ptObj)
								}



							}else{

								let pp = this.createElByBestNS(key)
								pp.innerHTML = value
								bnode.appendChild(pp)

								



							}




						}



					// it does not have entitiy lookup, but it is a resource and needs a bnode 
					}else if (ptObj.type == "resource"){

						let userValue = ptObj.userValue;


						// // is there only one key, and is it the same as the propertyuri?
						// let allKeys = Object.keys(userValue).filter((k)=>{ return (k != '@type') })						
						// // over write the uservalue with just that key 
						// if (allKeys.length==1){		
						// 	// and it is a property
						// 	if (typeof userValue[allKeys[0]] == 'object'){
						// 		userValue = userValue[allKeys[0]]
						// 	}
						// }




						if (!userValue['@type']){
							// figure out the type it should be from the ontology
							userValue['@type'] = await this.suggestType(ptObj.propertyURI);	
						}

						

						// if that worked
						if (userValue['@type']){

							// construct the predicate
							let p = this.createElByBestNS(ptObj.propertyURI)
							rootEl.appendChild(p)

							// the bnode
							let bnode = this.createElByBestNS(userValue['@type'])
							p.appendChild(bnode)

							// if it has a URI
							if (userValue['URI']){
								bnode.setAttributeNS(this.namespace.rdf, 'rdf:about', userValue['URI'])
							}

							console.log('userValue:',userValue)

							// // now loop through all the other properties here and build the bnode out
							for (let subkey of Object.keys(userValue)){

								console.log('typeof userValue[subkey]:',typeof userValue[subkey])

								// there are some special keys we want to not try to serailize 
								if (subkey == '@type' || subkey == 'URI' || subkey == 'context' || subkey.startsWith('BFE2META')){continue}

								// should only be literals, if not we need to handle that differently
								if (typeof userValue[subkey] === 'string' || userValue[subkey] instanceof String){

									let pp = this.createElByBestNS(subkey)
									pp.innerHTML = userValue[subkey]
									bnode.appendChild(pp)

								}else if (userValue[subkey] === null){

									console.warn('null value for ',subkey, 'in', ptObj)

								}else if (typeof userValue[subkey] === 'object' && userValue[subkey] !== null){




									// do the same thing...
									let userChildValues = userValue[subkey];

									if (!Array.isArray(userChildValues)){
										userChildValues = [userChildValues]
									}


									if (Array.isArray(userChildValues)){
										console.log("userChildValueuserChildValueuserChildValue is array")
									}

									if (subkey == 'http://id.loc.gov/ontologies/bibframe/frequency'){
										console.log('----herez')
										console.log("userChildValueuserChildValueuserChildValue:",userChildValues)
										console.log("subkey:",subkey)
										console.log(Array.isArray(userValue[subkey]))

									}

									let iterCount = 0

									for (let userChildValue of userChildValues){


										if (!userChildValue['@type']){
											// figure out the type it should be from the ontology
											userChildValue['@type'] = await this.suggestType(subkey);	
										}



										// if that worked
										if (userChildValue['@type']){

											let ppp
											let childBnode

											// if it is the same type as the parent, attach to parent
											if (userChildValue['@type'] == userValue['@type']){

												// only on the first occurance though, if we have repeated fields
												// then make a new bnode for it to live in
												if (iterCount==0){
													ppp = p
													childBnode = bnode
												}else{

													ppp = p
													childBnode = this.createElByBestNS(userChildValue['@type'])
													ppp.appendChild(childBnode)
												}


											}else{

												// construct the predicate
												ppp = this.createElByBestNS(subkey)
												bnode.appendChild(ppp)

												// the bnode
												childBnode = this.createElByBestNS(userChildValue['@type'])
												ppp.appendChild(childBnode)

											}

	
											// if it has a URI
											if (userChildValue['URI']){
												childBnode.setAttributeNS(this.namespace.rdf, 'rdf:about', userChildValue['URI'])
											}

											// add in all the other properties, special usecase for rdf:type

											for (let subChildkey of Object.keys(userChildValue)){

												// there are some special keys we want to not try to serailize 
												if (subChildkey == '@type' || subChildkey == 'URI' || subChildkey == 'context' || subChildkey.startsWith('BFE2META')){continue}
												let subChildkeyFull = subChildkey
												if (!subChildkey.startsWith('http')){
													subChildkeyFull = this.UriNamespace(subChildkey)
												}

												// should only be literals, if not we need to handle that differently
												if (typeof userChildValue[subChildkey] === 'string' || userChildValue[subChildkey] instanceof String){


													if (subChildkeyFull == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'){

														let pppp = this.createElByBestNS(subChildkey)
														pppp.setAttributeNS(this.namespace.rdf, 'rdf:resource', userChildValue[subChildkey])
														childBnode.appendChild(pppp)


													}else{

														let pppp = this.createElByBestNS(subChildkey)
														pppp.innerHTML = userChildValue[subChildkey]
														childBnode.appendChild(pppp)

													}



												}else if (userChildValue[subChildkey] === null){
													console.warn('null value for ',subChildkey, 'in', ptObj)

												}else{

													console.error('could not make bnode from ', subChildkey, 'in',ptObj)

												}


											}



										}else{
											console.error("In a sameAs entitiy with a non-literal value, don't know what to do!", ptObj)
										}

										iterCount++

									}

								}
							}





						}else{

							console.error('Could not figure out the @type for this uservalue', userValue, ' in ', ptObj)


						}
						



					// a literal value, loop through the keys and make itself
					}else if (ptObj.type == "literal"){

						let testtype = await this.suggestType(ptObj.propertyURI);	


						if (testtype === 'http://www.w3.org/2000/01/rdf-schema#Literal'){

							for (let key of Object.keys(ptObj.userValue)){

								// there are some special keys we want to not try to serailize 
								if (key == '@type' || key == 'URI' || key == 'context' || key.startsWith('BFE2META')){continue}

								let p = this.createElByBestNS(key)


								if (typeof ptObj.userValue[key] === 'string' || ptObj.userValue[key] instanceof String){

									p.innerHTML = ptObj.userValue[key]
								}else{
									console.warn("This node is marked to be literal, but the userValue is not a string:", ptObj)
								}




								rootEl.appendChild(p)


							}




						}else{

							console.warn("This node is marked to be literal, but it supposed to be a bnode:", ptObj)

						}




					}else{

						console.warn("usecase not handled:",ptObj )


					}

				}
			}


			// add in the admindata
			if (orginalProfile.rt[rt].adminMetadataData){

				
				let parser = new DOMParser();
				let adm = parser.parseFromString(orginalProfile.rt[rt].adminMetadataData, "text/xml");

				adm = adm.children[0]

				if (adm.getElementsByTagName('bflc:procInfo').length>0){
					adm.getElementsByTagName('bflc:procInfo')[0].remove()
				}
				let p = this.createElByBestNS('bflc:procInfo')
				p.innerHTML = profile.rt[rt].procInfo


				adm.getElementsByTagName('bf:AdminMetadata')[0].appendChild(p)
				
				

				rootEl.appendChild(adm)
			}



			if (orginalProfile.rt[rt].unusedXml){
				console.log(orginalProfile.rt[rt].unusedXml)
				let parser = new DOMParser();

				let unusedXmlNode = parser.parseFromString(orginalProfile.rt[rt].unusedXml, "text/xml")
				unusedXmlNode = unusedXmlNode.children[0]

				for (let el of unusedXmlNode.children){
					console.log("UNUSED XML DOING:",el)
					if (el.tagName != 'rdfs:label'){
						rootEl.appendChild(el)
					}

				}

			}

			// console.log(rootEl,orginalProfile.rt[rt].unusedXmlNodes,orginalProfile.rt[rt].unusedXml)


			console.log(rootEl)

			// build the lookup

			tleLookup[rootElName][orginalProfile.rt[rt].URI] = rootEl


		}


		// console.log(tleLookup)
		// console.log(tleLookup)
		// console.log(orginalProfile)

		// also just build a basic version tosave

		let parser = new DOMParser();


		
		for (let URI in tleLookup['Work']){
			
			let theWork = (new XMLSerializer()).serializeToString(tleLookup['Work'][URI])
			theWork = parser.parseFromString(theWork, "text/xml").children[0];

			rdfBasic.appendChild(theWork)
		}

		for (let URI in tleLookup['Instance']){

			// let instance = tleLookup['Instance'][URI].cloneNode( true )

			let instance = (new XMLSerializer()).serializeToString(tleLookup['Instance'][URI])
			instance = parser.parseFromString(instance, "text/xml").children[0];



			let items = this.returnHasItem(URI,orginalProfile,tleLookup)
			// alert(items.length)s
			for (let item of items){
				let uri = null
				if (item.attributes['rdf:resource']){
					uri = item.attributes['rdf:resource'].value
				}else if(item.attributes['rdf:about']){
					uri = item.attributes['rdf:about'].value
				}	

				if (uri){
					let hasItem = this.createElByBestNS('bf:hasItem')
					hasItem.setAttributeNS(this.namespace.rdf, 'rdf:resource', uri)
					instance.appendChild(hasItem)
				}
			}

			// there is only one work, so add it as the instanceOf
			for (let WorkURI in tleLookup['Work']){
				let instanceOf = this.createElByBestNS('bf:instanceOf')
				instanceOf.setAttributeNS(this.namespace.rdf, 'rdf:resource', WorkURI)
				instance.appendChild(instanceOf)
			}



			rdfBasic.appendChild(instance)

		}
		for (let URI in tleLookup['Item']){
			// rdfBasic.appendChild(tleLookup['Item'][URI].cloneNode( true ))

			let item = (new XMLSerializer()).serializeToString(tleLookup['Item'][URI])
			item = parser.parseFromString(item, "text/xml").children[0];

			rdfBasic.appendChild(item)

		}

		if (orginalProfile.procInfo.includes("update")){

			//build it cenered around the instance
			for (let URI in tleLookup['Instance']){

				// let instance = tleLookup['Instance'][URI].cloneNode( true )



				let instance = (new XMLSerializer()).serializeToString(tleLookup['Instance'][URI])
				instance = parser.parseFromString(instance, "text/xml").children[0];


				let items = this.returnHasItem(URI,orginalProfile,tleLookup)

				if (items.length > 0){

					let p = this.createElByBestNS('bf:hasItem')

					for (let item of items){
						p.appendChild(item)
						
					}

					instance.appendChild(p)


				}
				


				let work = this.returnWorkFromInstance(URI,orginalProfile,tleLookup)

				if (work){
					let p = this.createElByBestNS('bf:instanceOf')

					p.appendChild(work)
					instance.appendChild(p)


				}

				// console.log(instance)
				// console.log(orginalProfile)

				// console.log(work)

				rdf.appendChild(instance)

			}

			// console.log(rdf)



		}else{

			// FIX CHANGE NOT RIGHT ECT!!
			for (let URI in tleLookup['Instance']){

			// let instance = tleLookup['Instance'][URI].cloneNode( true )



			let instance = (new XMLSerializer()).serializeToString(tleLookup['Instance'][URI])
			instance = parser.parseFromString(instance, "text/xml").children[0];


			let items = this.returnHasItem(URI,orginalProfile,tleLookup)

			if (items.length > 0){

				let p = this.createElByBestNS('bf:hasItem')

				for (let item of items){
					p.appendChild(item)
					
				}

				instance.appendChild(p)


			}



			let work = this.returnWorkFromInstance(URI,orginalProfile,tleLookup)
			console.log('da work:',work)
			console.log(URI,orginalProfile,tleLookup)
			if (work){
				let p = this.createElByBestNS('bf:instanceOf')

				p.appendChild(work)
				instance.appendChild(p)
				console.log(instance,'instance')

			}

			// console.log(instance)
			// console.log(orginalProfile)

			// console.log(work)

			rdf.appendChild(instance)

			}






			console.log('NOT AN UPDATE XML GEN')

		}







		console.log("$$$$$$$$$$$$$$")
		console.log(rdfBasic)
		console.log(rdf)
		console.log(tleLookup)
	
		if (rdfBasic.getElementsByTagName("bf:mainTitle").length>0){
			xmlVoidDataTitle = rdfBasic.getElementsByTagName("bf:mainTitle")[0].innerHTML
		}else{
			console.warn('no title found for db')
		}


		if (rdfBasic.getElementsByTagName("bflc:PrimaryContribution").length>0){

			if (rdfBasic.getElementsByTagName("bflc:PrimaryContribution")[0].getElementsByTagName("rdfs:label").length>0){
				xmlVoidDataContributor = rdfBasic.getElementsByTagName("bflc:PrimaryContribution")[0].getElementsByTagName("rdfs:label")[0].innerHTML
			}
			
		}else{
			console.warn('no PrimaryContribution found for db')
		}



		if (rdfBasic.getElementsByTagName("bf:Lccn").length>0){
			xmlVoidDataLccn = rdfBasic.getElementsByTagName("bf:Lccn")[0].innerText || rdfBasic.getElementsByTagName("bf:Lccn")[0].textContent
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

		el = document.createElementNS(this.namespace.lclocal, 'lclocal:procinfo')
		el.innerHTML = orginalProfile.procInfo
		datasetDescriptionEl.appendChild(el)


		for (let x of xmlVoidExternalID){
			el = document.createElementNS(this.namespace.lclocal, 'lclocal:externalid')
			el.innerHTML = x
			datasetDescriptionEl.appendChild(el)
		}

		let strXmlFormatted = (new XMLSerializer()).serializeToString(rdf)

		strXmlFormatted = uiUtils.prettifyXmlJS(strXmlFormatted, ' ')





		rdfBasic.appendChild(datasetDescriptionEl)




		let strXmlBasic = (new XMLSerializer()).serializeToString(rdfBasic)

		let strXml = (new XMLSerializer()).serializeToString(rdf)
		// console.log(strXml)
		


		// console.log(profile)
		// console.log(datasetDescriptionEl)


		return {
			xmlDom: rdf,
			xmlStringFormatted: strXmlFormatted,
			xlmString: strXml,
			xlmStringBasic: strXmlBasic
		}





	},


	returnHasItem: function(URI,profile,tleLookup){

		let results = []
		let parser = new DOMParser();

		for (let rt in profile.rt){

			if (profile.rt[rt].itemOf && profile.rt[rt].itemOf == URI){

				let item = (new XMLSerializer()).serializeToString(tleLookup['Item'][profile.rt[rt].URI])
				item = parser.parseFromString(item, "text/xml").children[0];

				results.push(item)

				// results.push(tleLookup['Item'][profile.rt[rt].URI].cloneNode( true ))

			}

		}


		return results

	},
	returnWorkFromInstance: function(instanceURI,profile,tleLookup){
		let parser = new DOMParser();

		let results = null

		for (let rt in profile.rt){

			if (profile.rt[rt].instanceOf && profile.rt[rt].URI == instanceURI){

				results = (new XMLSerializer()).serializeToString(tleLookup['Work'][profile.rt[rt].instanceOf])
				results = parser.parseFromString(results, "text/xml").children[0];


				// results = tleLookup['Work'][profile.rt[rt].instanceOf].cloneNode( true )

			}

		}

		// if that didnt work just pick the first work
		if (!results){
			for (let wUri in tleLookup['Work']){
				results = tleLookup['Work'][wUri]
				break
			}

		}


		return results

	}	





}


export default exportXML;