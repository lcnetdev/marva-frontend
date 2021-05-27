// braks non-chromium browsers
// const jsdom = require("jsdom");
import store from "../store";
const short = require('short-uuid');

const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)


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

		// just testing a few name spaces here
		if (uri.match(/bf:[A-Z]/)){
			return true
		}
		if (uri.match(/bflc:[A-Z]/)){
			return true
		}
		if (uri.match(/madsrdf:[A-Z]/)){
			return true
		}
		if (uri.match(/rdfs:[A-Z]/)){
			return true
		}
		if (uri.match(/rdf:[A-Z]/)){
			return true
		}
		if (uri.match(/lclocal:[A-Z]/)){
			return true
		}

		// for (let nsKey of Object.keys(this.namespace)){

		// 	let pattern = `${nsKey}:[A-Z]/`
		// 	let re = new RegExp(pattern,"g");

		// 	if (re.match(uri)){
		// 		return true
		// 	}

		// }



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
			console.log(el)
			if (el.parentNode.tagName === requiredParent){
				return el
			}
		}

		return false

	},

	activeDom: null,
	hasItem: false,


	specialTransforms: {


		// 'bf:subject' : function(xml,profile){

		// 	//   <bf:subject>
		// 	//      <bf:Place>
		// 	//        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
		// 	//        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Skye, Island of (Scotland)--Fiction.</rdfs:label>
		// 	//        <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Skye, Island of (Scotland)--Fiction.</madsrdf:authoritativeLabel>
		// 	//        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
		// 	//        <madsrdf:componentList rdf:parseType="Collection" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">
		// 	//          <madsrdf:Geographic>
		// 	//            <madsrdf:authoritativeLabel>Skye, Island of (Scotland)</madsrdf:authoritativeLabel>
		// 	//          </madsrdf:Geographic>
		// 	//          <madsrdf:GenreForm>
		// 	//            <madsrdf:authoritativeLabel>Fiction</madsrdf:authoritativeLabel>
		// 	//          </madsrdf:GenreForm>
		// 	//        </madsrdf:componentList>
		// 	//        <bflc:aap-normalized xmlns:bflc="http://id.loc.gov/ontologies/bflc/">skyeislandof(scotland)fiction</bflc:aap-normalized>
		// 	//      </bf:Place>
		// 	//    </bf:subject>

		// 	// ---------------------

		// 	// <bf:subject xmlns:bf="http://id.loc.gov/ontologies/bibframe/">
		// 	//   <bf:Topic xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" rdf:about="http://bibframe.example.org/21468042#Topic650-26">
		// 	//     <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Historians--Russia--Congresses.</rdfs:label>
		// 	//     <madsrdf:isMemberOfMADSScheme xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#" rdf:resource="http://id.loc.gov/authorities/subjects"/>
		// 	//     <madsrdf:componentList xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#" rdf:parseType="Collection">
		// 	//       <madsrdf:Topic>
		// 	//         <madsrdf:authoritativeLabel>Historians</madsrdf:authoritativeLabel>
		// 	//       </madsrdf:Topic>
		// 	//       <madsrdf:Geographic rdf:about="https://id.loc.gov/authorities/names/n80001203">
		// 	//         <madsrdf:authoritativeLabel>Russia</madsrdf:authoritativeLabel>
		// 	//       </madsrdf:Geographic>
		// 	//       <madsrdf:GenreForm>
		// 	//         <madsrdf:authoritativeLabel>Congresses</madsrdf:authoritativeLabel>
		// 	//       </madsrdf:GenreForm>
		// 	//     </madsrdf:componentList>
		// 	//     <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Historians--Russia--Congresses.</madsrdf:authoritativeLabel>
		// 	//     <bf:source>
		// 	//       <bf:Source>
		// 	//         <bf:code>lcsh</bf:code>
		// 	//       </bf:Source>
		// 	//     </bf:source>
		// 	//   </bf:Topic>
		// 	// </bf:subject>

		// 	// grab the label and uri and type
		// 	let typeNode = xml.children[0]
		// 	if (!typeNode){
		// 		console.error('xml.children[0] for this subject does not exist')
		// 		return profile
		// 	}

		// 	profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {}
		// 	let userValue = profile.userValue['http://www.w3.org/2002/07/owl#sameAs']




		// 	userValue['@type'] = this.UriNamespace(typeNode.tagName)
		// 	userValue['URI'] = null
		// 	let label = null

		// 	if (typeNode.attributes && typeNode.attributes['rdf:about']){
		// 		userValue['URI'] = typeNode.attributes['rdf:about'].value
		// 	}

		// 	for (let el of typeNode.children){
		// 		if (el.tagName == 'madsrdf:authoritativeLabel' || el.tagName == this.UriNamespace('madsrdf:authoritativeLabel') ){
		// 			label = el.innerHTML
		// 			userValue['http://www.loc.gov/mads/rdf/v1#authoritativeLabel'] = el.innerHTML
		// 		}else if (el.tagName == 'http://www.loc.gov/mads/rdf/v1#isMemberOfMADSScheme' || el.tagName == this.UriNamespace('madsrdf:isMemberOfMADSScheme') ){
		// 			if (el.attributes && el.attributes['rdf:resource']){
		// 				userValue['http://www.loc.gov/mads/rdf/v1#isMemberOfMADSScheme'] = el.attributes['rdf:resource'].value
		// 			}
		// 		}


		// 	}

		// 	for (let el of typeNode.children){
		// 		if ( (el.tagName == 'rdfs:label' || el.tagName == this.UriNamespace('rdfs:label ')) && label === null ){
		// 			label = el.innerHTML
		// 		}
		// 	}

		// 	if (typeNode.getElementsByTagName('bf:Source').length>0){
		// 		for (let el of typeNode.getElementsByTagName('bf:Source')){

		// 			userValue[this.UriNamespace('bf:source')] = {}

		// 			for (let elc of el.children){
		// 				userValue[this.UriNamespace('bf:source')][this.UriNamespace(elc.tagName)] = elc.innerHTML
		// 			}

		// 		}
		// 	}else if (typeNode.getElementsByTagName('bf:source').length>0){

				
		// 		let s = xml.getElementsByTagName('bf:source')[0]
		// 		if (s.attributes && s.attributes['rdf:resource']){
		// 			profile.userValue[this.UriNamespace('bf:source')] ={'URI':s.attributes['rdf:resource'].value, 'http://www.w3.org/2000/01/rdf-schema#label': null}
					
		// 		}


		// 	}



		// 	let componentList = []

			
		// 	userValue['http://www.w3.org/2000/01/rdf-schema#label'] = label

		// 	let allCLabels = []


		// 	if (typeNode.getElementsByTagName('madsrdf:componentList').length>0){

		// 		for (let child of typeNode.getElementsByTagName('madsrdf:componentList')[0].children){

		// 			let ctype = this.UriNamespace(child.tagName)
		// 			let clabel = null
		// 			if (child.getElementsByTagName('madsrdf:authoritativeLabel').length>0){
		// 				clabel = child.getElementsByTagName('madsrdf:authoritativeLabel')[0].innerHTML
		// 			}
		// 			if (child.getElementsByTagName('rdfs:label').length>0){
		// 				clabel = child.getElementsByTagName('rdfs:label')[0].innerHTML
		// 			}

		// 			let URI = null

					
		// 			if (child.attributes && child.attributes['rdf:about']){
		// 				URI = child.attributes['rdf:about'].value
		// 			}

		// 			if (clabel){
		// 				allCLabels.push(clabel)
		// 			}
		// 			componentList.push({'http://www.w3.org/2000/01/rdf-schema#label':clabel, URI:URI, '@type':ctype})


		// 		}

		// 	}

		// 	// if there was no label for the whole thing use the components to build one
		// 	if (!userValue['http://www.w3.org/2000/01/rdf-schema#label']){
		// 		if (allCLabels.length>0){
		// 			userValue['http://www.w3.org/2000/01/rdf-schema#label'] = allCLabels.join('--')
		// 		}
		// 	}
			

		// 	userValue['http://www.loc.gov/mads/rdf/v1#componentList'] = componentList


		// 	if (userValue['http://id.loc.gov/ontologies/bibframe/source']){
		// 		if (userValue['http://id.loc.gov/ontologies/bibframe/source']['http://id.loc.gov/ontologies/bibframe/code']){
		// 			if (userValue['http://id.loc.gov/ontologies/bibframe/source']['http://id.loc.gov/ontologies/bibframe/code']=='lcsh' && !userValue['http://id.loc.gov/ontologies/bibframe/source'].URI){
		// 				userValue['http://id.loc.gov/ontologies/bibframe/source']['@id'] = 'http://id.loc.gov/vocabulary/subjectSchemes/lcsh'
		// 			}
		// 		}
		// 	}

		// 	if (userValue['http://id.loc.gov/ontologies/bibframe/source']){
		// 		if (userValue['http://id.loc.gov/ontologies/bibframe/source']['http://www.w3.org/2000/01/rdf-schema#label']){
		// 			if (userValue['http://id.loc.gov/ontologies/bibframe/source']['http://www.w3.org/2000/01/rdf-schema#label']=='lcsh' && !userValue['http://id.loc.gov/ontologies/bibframe/source'].URI){
		// 				userValue['http://id.loc.gov/ontologies/bibframe/source']['@id'] = 'http://id.loc.gov/vocabulary/subjectSchemes/lcsh'
		// 			}
		// 		}
		// 	}

			
			
			

		// 	return profile


		// },
		// // 'bf:Work' : function(xml,profile){

			
			
		// // 	let titleStr = xml.attributes['rdf:about'].value
			
		// // 	let titleEl = xml.getElementsByTagName("bflc:aap")[0]
		// // 	if (titleEl){
		// // 		titleStr = titleEl.innerHTML
		// // 	}

		// // 	// "http://www.w3.org/2002/07/owl#sameAs": {
		// // 	profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {
		// // 		'http://www.w3.org/2000/01/rdf-schema#label': titleStr,
		// // 		'URI' : xml.attributes['rdf:about'].value
		// // 	}

		


		// // 	profile.userValue['@id'] = xml.attributes['rdf:about'].value
		// // 	profile.userValue['http://www.w3.org/2000/01/rdf-schema#label'] = titleStr
		// // 	return profile
		// // },


		// 'bf:contribution' : function(xml,profile){


		// 	// <bf:contribution>
		// 	//   <bf:Contribution>
		// 	//     <bf:agent>
		// 	//       <bf:Agent rdf:about="http://id.loc.gov/rwo/agents/n87899079">
		// 	//         <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
		// 	//         <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Kemp, Sandra.</rdfs:label>
		// 	//         <madsrdf:isIdentifiedByAuthority rdf:resource="http://id.loc.gov/authorities/names/n87899079" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"/>
		// 	//       </bf:Agent>
		// 	//     </bf:agent>
		// 	//     <bf:role>
		// 	//       <bf:Role rdf:about="http://id.loc.gov/vocabulary/relators/ctb">
		// 	//         <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Contributor</rdfs:label>
		// 	//       </bf:Role>
		// 	//     </bf:role>
		// 	//   </bf:Contribution>
		// 	// </bf:contribution>



		// 	let madsToBf = {

		// 		//http://id.loc.gov/ontologies/bibframe/Jurisdiction

		// 		'http://www.loc.gov/mads/rdf/v1#CorporateName': 'http://id.loc.gov/ontologies/bibframe/Organization',
		// 		'http://www.loc.gov/mads/rdf/v1#ConferenceName': 'http://id.loc.gov/ontologies/bibframe/Meeting',
		// 		'http://www.loc.gov/mads/rdf/v1#PersonalName': 'http://id.loc.gov/ontologies/bibframe/Person',
		// 		'http://www.loc.gov/mads/rdf/v1#FamilyName': 'http://id.loc.gov/ontologies/bibframe/Family'
		// 	}










		// 	// a little tricky here because there are possibly multiple bf:contributor properties, one might be the primary contributor
		// 	// the others are just other contributor
		// 	// so test to see if they match, if we have the primary contributor xml and not the primary contributor PT then kick back
		// 	// so it can be picked up by another correct PT

		// 	let isPrimaryContribXML = false

		// 	for (let el of xml.getElementsByTagName('rdf:type')){
		// 		if (el.attributes['rdf:resource'] && el.attributes['rdf:resource'].value == 'http://id.loc.gov/ontologies/bflc/PrimaryContribution'){
		// 			isPrimaryContribXML = true
		// 		}
		// 	}


		// 	if (profile.valueConstraint.valueDataType.dataTypeURI && profile.valueConstraint.valueDataType.dataTypeURI == "http://id.loc.gov/ontologies/bflc/PrimaryContribution"){
		// 		// the profile says yes, if the xml doesn't kick it back
		// 		if (!isPrimaryContribXML){
					
		// 			return false
		// 		}
		// 	}else{
		// 		// the profile says no, if the xml says yesh then kick it back
		// 		if (isPrimaryContribXML){
					
		// 			return false
		// 		}
		// 	}



			

		// 	// grab the label and uri and type
		// 	let typeNode = xml.getElementsByTagName("bf:agent")[0].children[0]

		// 	if (typeNode){

		// 		profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {}

		// 		profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type'] = this.UriNamespace(typeNode.tagName)
		// 		profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = null
		// 		let label = null

		// 		if (typeNode.getElementsByTagName('rdf:type').length>0){
		// 			profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type'] = typeNode.getElementsByTagName('rdf:type')[0].attributes['rdf:resource'].value
		// 		}

		// 		if (typeNode.attributes && typeNode.attributes['rdf:about']){
		// 			profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = typeNode.attributes['rdf:about'].value
		// 		}

		// 		if (typeNode.getElementsByTagName('madsrdf:authoritativeLabel').length>0){
		// 			label = typeNode.getElementsByTagName('madsrdf:authoritativeLabel')[0].innerHTML
		// 		}else if (typeNode.getElementsByTagName('rdfs:label').length>0){
		// 			label = typeNode.getElementsByTagName('rdfs:label')[0].innerHTML
		// 		}

		

		// 		profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.w3.org/2000/01/rdf-schema#label'] = label


		// 		// add in any other properties in the agent bnode
		// 		for (let c of typeNode.children){

		// 			if (c.tagName != 'rdfs:label' && c.tagName != 'rdf:type'){
		// 				profile.userValue['http://www.w3.org/2002/07/owl#sameAs'][this.UriNamespace(c.tagName)] = c.innerHTML
		// 			}

		// 		}



		// 	}else{

		// 		// no <bf:agent><bf:Person> or whatever
		// 		// just <bf:agent/> with a rdf:resource

		// 		//console.error('xml.children[0] for this agent does not exist')
		// 		//return profile

		// 		let justAgent = xml.getElementsByTagName("bf:agent")[0]

		// 		profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] = {}

		// 		profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type'] = this.UriNamespace("bf:Agent")
		// 		profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = null
		// 		let label = null


		// 		if (justAgent.attributes && justAgent.attributes['rdf:about']){
		// 			profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = justAgent.attributes['rdf:about'].value
		// 		}
		// 		if (justAgent.attributes && justAgent.attributes['rdf:resource']){
		// 			profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['URI'] = justAgent.attributes['rdf:resource'].value
		// 		}

		// 		if (justAgent.getElementsByTagName('madsrdf:authoritativeLabel').length>0){
		// 			label = justAgent.getElementsByTagName('madsrdf:authoritativeLabel')[0].innerHTML
		// 		}else if (justAgent.getElementsByTagName('rdfs:label').length>0){
		// 			label = justAgent.getElementsByTagName('rdfs:label')[0].innerHTML
		// 		}

		// 		profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['http://www.w3.org/2000/01/rdf-schema#label'] = label


		// 	}




		// 	if (xml.getElementsByTagName('bf:Role').length>0){

		// 		for (let roleEl of xml.getElementsByTagName('bf:Role')){

					


		// 			let roleuri = null
		// 			let rolelabel = null
		// 			if (roleEl.attributes && roleEl.attributes['rdf:about']){
		// 				roleuri = roleEl.attributes['rdf:about'].value
		// 			}

		// 			if (roleEl.getElementsByTagName('rdfs:label').length>0){
		// 				rolelabel= roleEl.getElementsByTagName('rdfs:label')[0].innerHTML
		// 			}

					
	



		// 			//if it already exists then there are multiple
		// 			if (profile.userValue['http://id.loc.gov/ontologies/bibframe/role']){
		// 				if (!Array.isArray(profile.userValue['http://id.loc.gov/ontologies/bibframe/role'])){
		// 					profile.userValue['http://id.loc.gov/ontologies/bibframe/role'] = [profile.userValue['http://id.loc.gov/ontologies/bibframe/role']]
		// 				}
						
		// 				let val = {'URI':roleuri, 'http://www.w3.org/2000/01/rdf-schema#label': rolelabel}

		// 				// if it does not have a URI then it is a non controlled term
		// 				if (!roleuri){
		// 					val.BFE2METAnotControled = true 
		// 				}

		// 				profile.userValue['http://id.loc.gov/ontologies/bibframe/role'].push(val)


		// 			}else{
		// 				profile.userValue['http://id.loc.gov/ontologies/bibframe/role'] = {'URI':roleuri, 'http://www.w3.org/2000/01/rdf-schema#label': rolelabel}	
		// 				if (!roleuri){
		// 					profile.userValue['http://id.loc.gov/ontologies/bibframe/role'].BFE2METAnotControled = true 
		// 				}

		// 			}



					



		// 		}

		// 	}else if (xml.getElementsByTagName('bf:role').length>0){

		// 		profile.userValue['http://id.loc.gov/ontologies/bibframe/role'] = []

		// 		for (let role of xml.getElementsByTagName('bf:role')){
		// 			if (role.attributes && role.attributes['rdf:resource']){						
		// 				profile.userValue['http://id.loc.gov/ontologies/bibframe/role'].push({'URI':role.attributes['rdf:resource'].value, 'http://www.w3.org/2000/01/rdf-schema#label': null})
		// 			}
		// 		}

				
		// 	}else{

		// 		// no role? make a empty bnode just so it doesn't mess up the display

		// 		profile.userValue['http://id.loc.gov/ontologies/bibframe/role'] = []



		// 	}


		// 	// if it has a MADs try to map it
		// 	if (profile.userValue['http://www.w3.org/2002/07/owl#sameAs'] && profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type']){
		// 		if (madsToBf[profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type']]){
		// 			profile.userValue["@type"] = madsToBf[profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type']]
		// 		}else if (profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type'].includes('/bibframe/')){
		// 			// if it is arleady a bibframe type set it
		// 			profile.userValue["@type"] = profile.userValue['http://www.w3.org/2002/07/owl#sameAs']['@type']
		// 		}
		// 	}
			

		// 	return profile


		// }



	},

	returnLookupListFromURI: function(uri){

		// its an ID vocab, just split off the end and use that 
		if (uri.includes('http://id.loc.gov/vocabulary/') || uri.includes('https://id.loc.gov/vocabulary/')){

			uri = uri.split('/')
			uri.splice(-1,1)

			uri = uri.join('/')

			return uri
		}


		
		return false
	},


	// this reutrns a obj that fits into a resource templates pt array
	// we dont need everything that is already in the processed pt
	buildCleanPtfromExisting: function(pt){
		return {
			"mandatory": pt.mandatory,
			"propertyLabel": pt.propertyLabel,
			"propertyURI": pt.propertyURI,
			"repeatable": pt.repeatable,
			"resourceTemplates": JSON.parse(JSON.stringify(pt.resourceTemplates)),
			"dynamic": true,
			'@guid': short.generate(),
			"type": pt.type,
			"userValue": {"@root":pt.propertyURI},
			"valueConstraint": JSON.parse(JSON.stringify(pt.valueConstraint))
		}

	},


	buildDynamicResourceTemplate: function(pt, missingProperty){



		// make a unique id from the property and the xmlsource
		let uniqueHash = hashCode(pt.propertyURI + pt.xmlSource)


		if (missingProperty == 'http://id.loc.gov/ontologies/bibframe/source'){


			// with a source we need to try to find out if the existing value has a URI
			// if it does then we can customize the bf:source proerty to use the correct 
			// lookup list

			// this is a bad default, but if we cant do it
			let useSource = 'http://id.loc.gov/vocabulary/subjectSchemes'


			if (pt.userValue && pt.userValue['http://id.loc.gov/ontologies/bibframe/source'] && pt.userValue['http://id.loc.gov/ontologies/bibframe/source'][0]){
				if (pt.userValue['http://id.loc.gov/ontologies/bibframe/source'][0]['@id']){
					let u = this.returnLookupListFromURI(pt.userValue['http://id.loc.gov/ontologies/bibframe/source'][0]['@id'])
					if (u){
						useSource = u
					}
				}

			}

			let rtName = `dynamic:RT:bf2:Source:${uniqueHash}`

			// init the new dynamic RT
			store.state.rtLookup[rtName] = {
				"id": rtName,
				"propertyTemplates": [
					{
						"mandatory": false,
						"propertyLabel": "Thesaurus",
						"propertyURI": "http://id.loc.gov/ontologies/bibframe/source",
						"repeatable": true,
						"resourceTemplates": [],
						"dynamic": true,
						'@guid': short.generate(),
						"type": "resource",
						"userValue": {"@root":"http://id.loc.gov/ontologies/bibframe/source"},
						"valueConstraint": {
							"defaults": [],
							"useValuesFrom": [
								useSource
							],
							"valueDataType": {
								"dataTypeURI": "http://id.loc.gov/ontologies/bibframe/Source"
							},
							"valueTemplateRefs": []
						}
					}
				],
				"resourceLabel": "Source",
				"resourceURI": "http://id.loc.gov/ontologies/bibframe/Source"
			}		


			// add in the orginal property to the beginning
			store.state.rtLookup[rtName].propertyTemplates.unshift(this.buildCleanPtfromExisting(pt))
			
			// console.log(store.state.rtLookup[rtName])
			// console.log("^^^^^^^^^")
			// console.log(store.state.rtLookup)

			// add it to the tempTemplates so it knows in the next parse to use it
			this.tempTemplates[uniqueHash] = rtName





		}

// resultsTest.rt[rtKey].pt[pt].valueConstraint.valueTemplateRefs.
								// if (missingProperty.includes('/source')){


								// 	console.log("Here",pt, missingProperty,resultsTest.rt[rtKey].pt[pt])

								// 	store.state.rtLookup['dynamic:RT:bf2:Source'] = {
								// 		"id": "dynamic:RT:bf2:Source",
								// 		"propertyTemplates": [
								// 			{
								// 				"mandatory": "false",
								// 				"propertyLabel": "Thesaurus",
								// 				"propertyURI": "http://id.loc.gov/ontologies/bibframe/source",
								// 				"repeatable": "true",
								// 				"resourceTemplates": [],
								// 				"dynamic": true,
								// 				'@guid': short.generate(),
								// 				"type": "resource",
								// 				"userValue": {"@root":"http://id.loc.gov/ontologies/bibframe/source"},
								// 				"valueConstraint": {
								// 					"defaults": [],
								// 					"useValuesFrom": [
								// 						"http://id.loc.gov/vocabulary/subjectSchemes"
								// 					],
								// 					"valueDataType": {
								// 					"dataTypeURI": "http://id.loc.gov/ontologies/bibframe/Source"
								// 				},
								// 				"valueTemplateRefs": []
								// 				}
								// 			}
								// 		],
								// 		"resourceLabel": "Source",
								// 		"resourceURI": "http://id.loc.gov/ontologies/bibframe/Source"
								// 	}


								// 	// make a copy of the current property
								// 	let ptCopy = JSON.parse(JSON.stringify(resultsTest.rt[rtKey].pt[pt]))


								// 	// add it to the temp resource template
								// 	store.state.rtLookup['dynamic:RT:bf2:Source'].propertyTemplates.unshift(ptCopy)
								// 	console.log('dynamic:RT:bf2:Source')
								// 	console.log(store.state.rtLookup['dynamic:RT:bf2:Source'])

								// 	resultsTest.rt[rtKey].pt[pt].valueConstraint.valueTemplateRefs.push('dynamic:RT:bf2:Source')

								// 	this.tempTemplates[hashCode(resultsTest.rt[rtKey].pt[pt].propertyURI + resultsTest.rt[rtKey].pt[pt].xmlSource)] = 'dynamic:RT:bf2:Source'
								// 	console.log(store.state.rtLookup)
								// 	console.log(resultsTest.rt[rtKey].pt[pt].propertyURI)
								// }







	},


	// this tries its best to build a pt from the hints it has from the XML
	buildRootLvlProperty: function(mp){


		if (mp.isLiteral && !mp.hasResource){

			// this is just a normal top level literal property
			return {
				"mandatory": false,
				"propertyLabel": mp.property.replace('http://id.loc.gov/ontologies/bibframe/','bf:'),
				"propertyURI": mp.property,
				"repeatable": true,
				"resourceTemplates": [],
				"missingProfile": [],
				"dynamic": true,
				'@guid': short.generate(),
				"type": "literal",
				"userValue": {"@root":mp.property},
				"valueConstraint": {
					"defaults": [],
					"useValuesFrom": [],
					"valueDataType": {},
				"valueTemplateRefs": []				
				}
			}



		}else if (mp.isLiteral && mp.hasResource){

			let lookup = this.returnLookupListFromURI(mp.hasResource)
			if (!lookup){
				if (mp.hasResource.includes('id.loc.gov/resources/works/')){
					lookup = 'https://preprod-8230.id.loc.gov/resources/works'
				}
				if (mp.hasResource.includes('id.loc.gov/resources/instances/')){
					lookup = 'https://preprod-8230.id.loc.gov/resources/instances'
				}
			}

			if (lookup != false){

				return {
					"mandatory": false,
					"propertyLabel": mp.property.replace('http://id.loc.gov/ontologies/bibframe/','bf:'),
					"propertyURI": mp.property,
					"repeatable": true,
					"resourceTemplates": [],
					"missingProfile": [],
					"dynamic": true,
					'@guid': short.generate(),
					"type": "lookup",
					"userValue": {"@root":mp.property},
					"valueConstraint": {
						"defaults": [],
						"useValuesFrom": [lookup],
						"valueDataType": {},
					"valueTemplateRefs": []				
					}
				}





			}




		}


		return false

	},

	// this builds a new pt to go into an existing resource template
	buildDynamicProperty: function(propertyURI){




		// start out conservative with some common known use cases
		if (propertyURI == 'http://id.loc.gov/ontologies/bibframe/note'){

			return {
				"mandatory": false,
				"propertyLabel": "Notes about the Instance",
				"propertyURI": "http://id.loc.gov/ontologies/bibframe/note",
				"remark": "http://access.rdatoolkit.org/2.17.html",
				"repeatable": true,
				"resourceTemplates": [],
				"dynamic": true,
				'@guid': short.generate(),
				"type": "resource",
				"userValue": {"@root":"http://id.loc.gov/ontologies/bibframe/note"},
				"valueConstraint": {
				"defaults": [],
				"useValuesFrom": [],
				"valueDataType": {},
				"valueTemplateRefs": [
					"lc:RT:bf2:Note"
					]
				}
			}

		}else if (propertyURI == 'http://id.loc.gov/ontologies/bibframe/source'){

			return {
				"mandatory": false,
				"propertyLabel": "Thesaurus",
				"propertyURI": "http://id.loc.gov/ontologies/bibframe/source",
				"repeatable": true,
				"resourceTemplates": [],
				"dynamic": true,
				'@guid': short.generate(),
				"type": "resource",
				"userValue": {"@root":"http://id.loc.gov/ontologies/bibframe/source"},
				"valueConstraint": {
					"defaults": [],
					"useValuesFrom": [
						"http://id.loc.gov/vocabulary/subjectSchemes"
					],
					"valueDataType": {
					"dataTypeURI": "http://id.loc.gov/ontologies/bibframe/Source"
				},
				"valueTemplateRefs": []
				}
			}
		}else if (propertyURI == 'http://id.loc.gov/ontologies/bibframe/part'){

			return {
				"mandatory": false,
				"propertyLabel": "Part",
				"propertyURI": "http://id.loc.gov/ontologies/bibframe/part",
				"repeatable": true,
				"resourceTemplates": [],
				"dynamic": true,
				'@guid': short.generate(),
				"type": "literal",
				"userValue": {"@root":"http://id.loc.gov/ontologies/bibframe/part"},
				"valueConstraint": {
					"defaults": [],
					"useValuesFrom": [],
					"valueDataType": {},
				"valueTemplateRefs": []
				}
			}






			// return {
			// 	"mandatory": "false",
			// 	"propertyLabel": "Source of identifier",
			// 	"propertyURI": "http://id.loc.gov/ontologies/bibframe/source",
			// 	"repeatable": "true",
			// 	"resourceTemplates": [],
			// 	"dynamic": true,
			// 	"type": "resource",
			// 	"userValue": {"@root":"http://id.loc.gov/ontologies/bibframe/source"},
			// 	"valueConstraint": {
			// 		"defaults": [],
			// 		"useValuesFrom": [],
			// 		"valueDataType": {},
			// 		"valueTemplateRefs": [
			// 			"lc:RT:bf2:Agent:Identifier:Source"
			// 			]
			// 		}
			// 	}

		}





		return false

	},





	returnUnusedProperties: function(xml){

		let parser = new DOMParser();
		let xmlDom = parser.parseFromString(xml, "text/xml");
		let propertyDupeCheck = []
		let propertiesObj = []
		if (xmlDom.children.length>0){
			for (const child of xmlDom.children[0].children){
				let puri
				if (!child.tagName.includes('http://')&&!child.tagName.includes('https://')){
					puri =  this.UriNamespace(child.tagName)
				}else{
					puri = child.tagName
				}


				if (propertyDupeCheck.indexOf(puri)==-1){

					propertyDupeCheck.push(puri)
					propertiesObj.push({
						property: puri,
						isLiteral: (child.children.length==0) ? true : false,
						hasResource: (child.attributes['rdf:resource']) ? child.attributes['rdf:resource'].value : false
					})
				}
			}
		}else{
			console.warn('no children found in unused XML, good?')
		}

		// console.log(propertiesObj)

		return propertiesObj

	},


	transform: async function(profile){ 

		this.tempTemplates = {}


		let profileOrginal = JSON.parse(JSON.stringify(profile))
		let resultsTest = await this.transformRts(profileOrginal,true)

		

		// find the unused properties and see if we can add them into the profile ad hoc


		for (const rtKey in resultsTest.rt) {

			// first look for just missing properties, not incuded in the profile
			let missingPT = this.returnUnusedProperties(resultsTest.rt[rtKey].unusedXml)


			for (let mp of missingPT){

				let dynamicRootLvlProperty = this.buildRootLvlProperty(mp)


				if (dynamicRootLvlProperty){

					// make a random label for it


					for (let rt in profile.rt){
						if (rt==rtKey){

							// console.log('store.state.profiles[p].rt[rtKey]',rtKey)
							// console.log(profile.rt[rtKey])
							let label = dynamicRootLvlProperty.propertyURI + '_' + short.generate()

							profile.rt[rtKey].pt[label] = dynamicRootLvlProperty
							profile.rt[rtKey].ptOrder.push(label)
							// console.log(profile)

						}
					}

					// add it to the pt list and order
					// store.state.rtLookup[rtKey].pt[label] = dynamicRootLvlProperty
					// store.state.rtLookup[rtKey].ptOrder.push(label)

				}

			}

			for (const pt in resultsTest.rt[rtKey].pt){


				if (resultsTest.rt[rtKey].pt[pt].missingProfile && resultsTest.rt[rtKey].pt[pt].missingProfile.length>0){
					
					for (let missingProperty of resultsTest.rt[rtKey].pt[pt].missingProfile){

						let dynamicProperty = this.buildDynamicProperty(missingProperty)

						if (dynamicProperty){

							// if it has a RT already, just add the missing property into the existing one,
							// basically make the orginal RT better
							for (let vtr of resultsTest.rt[rtKey].pt[pt].valueConstraint.valueTemplateRefs){

								let currentPts = store.state.rtLookup[vtr].propertyTemplates.map((p)=>{ return p.propertyURI})
								
								if (currentPts.indexOf(missingProperty) == -1){

									store.state.rtLookup[vtr].propertyTemplates.push(dynamicProperty)

								}
							}

							// it has no existing RTs
							if (resultsTest.rt[rtKey].pt[pt].valueConstraint.valueTemplateRefs.length==0){

								// if (resultsTest.rt[rtKey].pt[pt].missingProfile.length>1){
								// 	console.log('-------resultsTest.rt[rtKey].pt[pt].missingProfile')
								// 	console.log(resultsTest.rt[rtKey].pt[pt].missingProfile)
								// 	console.log(resultsTest.rt[rtKey].pt[pt])
								// }

								// this is an easy usecase, the pt has no refTemplates already,
								// so if we know what it should look like we can build a unique RT just 
								// for this property and any missing properties
								this.buildDynamicResourceTemplate(resultsTest.rt[rtKey].pt[pt], missingProperty)

								
							}

						}



					}
				}

			}


		// 	// for (const pt in results.rt[rtKey].pt) {
		// 	// 	console.log(pt)
		// 	// }

		// 	// ALSO Look inside, at the missingProperties for each component, things like
		// 	// http://id.loc.gov/ontologies/bibframe/agent in the provision activity


		}

		// console.log(results)

		

		let results = await this.transformRts(profile)

		return results
	},


	transformRts: async function(profile,testRun){

		let toDeleteNoData = []

				

		for (const pkey in profile.rt) {


			

			let tle = ""			
			if (pkey.includes(':Work')){
				tle = "bf:Work"
			}else if (pkey.includes(':Instance')){
				tle = "bf:Instance"
			}else if (pkey.includes(':Item')){
				tle = "bf:Item"
			}

			// select the right part of the profile
			let pt = profile.rt[pkey].pt
			
			// select the right part of the XML
			let xml
			if (testRun){
				xml = this.testDom.getElementsByTagName(tle)
			}else{
				xml = this.activeDom.getElementsByTagName(tle)
			}
			
			console.log(this.activeDom)
			
			console.log(tle)
			console.log(xml)
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
						ptk.userValue={
							'@root': 'http://id.loc.gov/ontologies/bibframe/Work',
							'@guid': short.generate() ,
							'@id': profile.rt[pkey].URI,
						}
						
					}
					
					pt[k] = ptk
					continue

				}




				
				
				

				if (el.length>0){


					// we have that element
					sucessfulProperties.push(prefixURI)

					

					// loop through all of them
					let counter = 0
					for (let e of el){



						// some special checks here first

						// differentiate between creator and contributor
						if (ptk.propertyURI == 'http://id.loc.gov/ontologies/bibframe/contribution'){
							let isPrimaryContribXML = false
							for (let typeEl of e.getElementsByTagName('rdf:type')){
								if (typeEl.attributes['rdf:resource'] && typeEl.attributes['rdf:resource'].value == 'http://id.loc.gov/ontologies/bflc/PrimaryContribution'){
									isPrimaryContribXML = true
								}
							}

							if (ptk.valueConstraint.valueDataType.dataTypeURI && ptk.valueConstraint.valueDataType.dataTypeURI == "http://id.loc.gov/ontologies/bflc/PrimaryContribution"){
								// the ptk says yes, if the xml doesn't jump to next
								if (!isPrimaryContribXML){
									
									continue
								}
							}else{
								// the ptk says no, if the xml says yesh jump to next
								if (isPrimaryContribXML){
									
									continue
								}
							}
						}





						

						// start populating the data
						let populateData = null
						populateData = JSON.parse(JSON.stringify(ptk))
						// save the source xml for later display
						populateData.xmlSource = e.outerHTML

						populateData['@guid'] = short.generate()


						//
						if (this.tempTemplates[hashCode(populateData.propertyURI + populateData.xmlSource)]){
							
							populateData.valueConstraint.valueTemplateRefs.push(this.tempTemplates[hashCode(populateData.propertyURI + populateData.xmlSource)])

							// populateData.valueConstraint.valueTemplateRefs.push('lc:RT:bf2:Note')
							
						}


						
						// we have some special functions to deal with tricky elements
						if (this.specialTransforms[prefixURI]){
							// make sure to pass the current 'this' context to the functions that use helper functions at this level like this.UriNamespace
							populateData = this.specialTransforms[prefixURI].call(this,e,populateData)	
							

						}else if (e.children.length == 0){


							
							// if (!populateData.userValue){
								populateData.userValue['@guid'] = short.generate()
							// }

							let eProperty = this.UriNamespace(e.tagName)

							// could be a first level bnode with no children

							if (this.isClass(e.tagName)){
								populateData.userValue['@type'] = this.UriNamespace(e.tagName)

								// check for URI
								if (e.attributes && e.attributes['rdf:about']){
									populateData.userValue['@id'] = e.attributes['rdf:about'].value
								}else if (e.attributes && e.attributes['rdf:resource']){
									populateData.userValue['@id'] = e.attributes['rdf:resource'].value
								}else{
									// console.log('No URI for this child property')
								}

							}else if (this.UriNamespace(e.tagName) == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'){

								// if there is a RDF type node here it is the parent's type
								// overwrite the basic type that was set via the bnode type
								if (e.attributes && e.attributes['rdf:about']){
									populateData.userValue['@type'] = e.attributes['rdf:about'].value
								}else if (e.attributes && e.attributes['rdf:resource']){
									populateData.userValue['@type'] = e.attributes['rdf:resource'].value
								}else{
									console.warn('---------------------------------------------')
									console.warn('There was a e RDF Type node but could not extract the type')
									console.warn(e)
									console.warn('---------------------------------------------')
								}


							}else if (e.attributes['rdf:resource'] && e.innerHTML.trim() == ''){
								// it is a property pointing to another resource with no label or anything
								populateData.userValue['@guid'] = short.generate()
								populateData.userValue['@id'] = e.attributes['rdf:resource'].value

							}else{


								if (!populateData.userValue[eProperty]){
									populateData.userValue[eProperty] = []
								}

								// it doesn't have any children, so it will be a literal or something like that
								let eData = {'@guid': short.generate()}

								if (e.attributes && e.attributes['rdf:about']){
									eData['@id'] = e.attributes['rdf:about'].value
								}else if (e.attributes && e.attributes['rdf:resource']){
									eData['@id'] = e.attributes['rdf:resource'].value
								}else{
									// console.log('No URI for this child property')
								}

								if (e.innerHTML != null && e.innerHTML.trim() != ''){
									eData[eProperty] = e.innerHTML

									// does it have a data type or lang									
									if (e.attributes && e.attributes['rdf:datatype']){
										eData['@datatype'] = e.attributes['rdf:datatype'].value
									}
									if (e.attributes && e.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype']){
										eData['@datatype'] = e.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype'].value
									}
									if (e.attributes && e.attributes['xml:lang']){
										eData['@language'] = e.attributes['xml:lang'].value
									}
									if (e.attributes && e.attributes['rdf:parseType']){
										eData['@parseType'] = e.attributes['rdf:parseType'].value
									}									


								}

								populateData.userValue[eProperty].push(eData)


							}



							
							// if (e.attributes && e.attributes['rdf:about'] && e.innerHTML.length == 0){
							// 	populateData.userValue[this.UriNamespace(prefixURI)] ={
							// 		URI: e.attributes['rdf:about'].value,
							// 		label: null
							// 	} 
							// }
							// if (e.attributes && e.attributes['rdf:resource']){
							// 	populateData.userValue[this.UriNamespace(prefixURI)] ={
							// 		URI: e.attributes['rdf:resource'].value,
							// 		label: null
							// 	} 								
							// }	


							// if (e.innerHTML && e.innerHTML.length!=0){
							// 	populateData.userValue[this.UriNamespace(prefixURI)] =e.innerHTML								

							// }


										
						}else{



							if (e.children.length > 1){
								console.error('---------------------------------------------')
								console.error('There are more than one 1st lvl bnodes!!!!!!!')
								console.error(e)
								console.error('---------------------------------------------')
							}


							// loop through.... though don't really need to loop, 
							// this is the main bnode <bf:title><bf:Title> 
							for (let child of e.children){

								// the inital bnode
								populateData.userValue['@guid'] = short.generate()

								// set the type of this bnode
								populateData.userValue['@type'] = this.UriNamespace(child.tagName)

								// does this thing have a URI?
								// <bf:title><bf:Title rdf:about="http://...."> 

								if (child.attributes && child.attributes['rdf:about']){
									populateData.userValue['@id'] = child.attributes['rdf:about'].value
								}else if (child.attributes && child.attributes['rdf:resource']){
									populateData.userValue['@id'] = child.attributes['rdf:resource'].value
								}else{


									// console.warn(this.UriNamespace(child.tagName), 'Does not have a RDF Type')
									// this is okay, it mostly won't
								}

								// now loop through all the children 
								for (let gChild of child.children){


									if (this.UriNamespace(gChild.tagName) == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'){

										// if there is a RDF type node here it is the parent's type
										// overwrite the basic type that was set via the bnode type
										if (gChild.attributes && gChild.attributes['rdf:about']){
											populateData.userValue['@type'] = gChild.attributes['rdf:about'].value
										}else if (gChild.attributes && gChild.attributes['rdf:resource']){
											populateData.userValue['@type'] = gChild.attributes['rdf:resource'].value
										}else{
											console.warn('---------------------------------------------')
											console.warn('There was a gChild RDF Type node but could not extract the type')
											console.warn(gChild)
											console.warn('---------------------------------------------')
										}
									}else if (gChild.children.length ==0){

										let gChildProperty = this.UriNamespace(gChild.tagName)


										// if it a one liner Class w/ no children add it in as its own obj otherwise it is a 
										// literal or something
										if (this.isClass(gChild.tagName)){
											let gChildData = {'@guid': short.generate()}
											populateData.userValue[gChildProperty].push(gChildData)

										}else{


											if (!populateData.userValue[gChildProperty]){
												populateData.userValue[gChildProperty] = []
											}

											// it doesn't have any children, so it will be a literal or something like that
											let gChildData = {'@guid': short.generate()}

											if (gChild.attributes && gChild.attributes['rdf:about']){
												gChildData['@id'] = gChild.attributes['rdf:about'].value
											}else if (gChild.attributes && gChild.attributes['rdf:resource']){
												gChildData['@id'] = gChild.attributes['rdf:resource'].value
											}else{
												// console.log('No URI for this child property')
											}

											if (gChild.innerHTML != null && gChild.innerHTML.trim() != ''){
												gChildData[gChildProperty] = gChild.innerHTML
												
												// does it have a data type or lang									
												if (gChild.attributes && gChild.attributes['rdf:datatype']){
													gChildData['@datatype'] = gChild.attributes['rdf:datatype'].value
												}
												if (gChild.attributes && gChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype']){
													gChildData['@datatype'] = gChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype'].value
												}
												if (gChild.attributes && gChild.attributes['xml:lang']){
													gChildData['@language'] = gChild.attributes['xml:lang'].value
												}
												if (gChild.attributes && gChild.attributes['rdf:parseType']){
													gChildData['@parseType'] = gChild.attributes['rdf:parseType'].value
												}	

											}

											populateData.userValue[gChildProperty].push(gChildData)


										}


									

									}else{

										// example > <bf:title><bf:Title> <bf:mainTitle>

										// if we dont have that property yet add it
										let gChildProperty = this.UriNamespace(gChild.tagName)

										if (!populateData.userValue[gChildProperty]){
											populateData.userValue[gChildProperty] = []
										}

										let gChildData = {'@guid': short.generate()}




										for (let ggChild of gChild.children){



											// if its a bnode then loop through the children, 
											if (this.isClass(ggChild.tagName)){

												// mint a new one for this iteration, since there could be multiple classes nested
												gChildData = {'@guid': short.generate()}

												// <bf:genreForm xmlns:bf="http://id.loc.gov/ontologies/bibframe/">
												//   <bf:GenreForm xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" rdf:about="https://id.loc.gov/authorities/genreForms/gf2014026639">
												//     <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
												//     <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Art music.</rdfs:label>
												//     <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Art music.</madsrdf:authoritativeLabel>
												//     <bf:source>
												//       <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/fast">
												//         <bf:code>fast</bf:code>
												//       </bf:Source>
												//     </bf:source>
												//     <bf:identifiedBy>
												//       <bf:Identifier> ~~~~~~~~~~~~~YOU ARE HERE ~~~~~~~~~~~~
												//         <rdf:value>fst01920007</rdf:value>
												//         <bf:source>
												//           <bf:Source> 
												//             <bf:code>OCoLC</bf:code>
												//           </bf:Source>
												//         </bf:source>
												//       </bf:Identifier>
												//     </bf:identifiedBy>
												//   </bf:GenreForm>
												// </bf:genreForm>




												gChildData['@type'] = this.UriNamespace(ggChild.tagName)

												// check for URI
												if (ggChild.attributes && ggChild.attributes['rdf:about']){
													gChildData['@id'] = ggChild.attributes['rdf:about'].value
												}else if (ggChild.attributes && ggChild.attributes['rdf:resource']){
													gChildData['@id'] = ggChild.attributes['rdf:resource'].value
												}else{
													// console.log('No URI for this child property')
												}



												// now loop through these ggchildren, they are properties of this bnode
												for (let gggChild of ggChild.children){



													// not a bnode, just a one liner property of the bnode			
													if (this.UriNamespace(gggChild.tagName) == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'){


														if (gggChild.attributes && gggChild.attributes['rdf:about']){
															gChildData['@type'] = gggChild.attributes['rdf:about'].value
														}else if (gggChild.attributes && gggChild.attributes['rdf:resource']){
															gChildData['@type'] = gggChild.attributes['rdf:resource'].value
														}else{
															console.warn('---------------------------------------------')
															console.warn('There was a gggChild RDF Type node but could not extract the type')
															console.warn(gggChild)
															console.warn('---------------------------------------------')
														}


													}else if (gggChild.children.length ==0){


															let gggChildProperty = this.UriNamespace(gggChild.tagName)

															if (!gChildData[gggChildProperty]){
																gChildData[gggChildProperty] = []
															}

															// it doesn't have any children, so it will be a literal or something like that
															let gggChildData = {'@guid': short.generate()}
															if (gggChild.attributes && gggChild.attributes['rdf:about']){
																gggChildData['@id'] = gggChild.attributes['rdf:about'].value
															}else if (gggChild.attributes && gggChild.attributes['rdf:resource']){
																gggChildData['@id'] = gggChild.attributes['rdf:resource'].value
															}else{
																// console.log('No URI for this child property')
															}

															if (gggChild.innerHTML != null && gggChild.innerHTML.trim() != ''){
																gggChildData[gggChildProperty] = gggChild.innerHTML
																// does it have a data type or lang									
																if (gggChild.attributes && gggChild.attributes['rdf:datatype']){
																	gggChildData['@datatype'] = gggChild.attributes['rdf:datatype'].value
																}
																if (gggChild.attributes && gggChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype']){
																	gggChildData['@datatype'] = gggChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype'].value
																}
																if (gggChild.attributes && gggChild.attributes['xml:lang']){
																	gggChildData['@language'] = gggChild.attributes['xml:lang'].value
																}
																if (gggChild.attributes && gggChild.attributes['rdf:parseType']){
																	gggChildData['@parseType'] = gggChild.attributes['rdf:parseType'].value
																}	


															}

															gChildData[gggChildProperty].push(gggChildData)



													}else{


														// if it has children then it means it is a predicate to another nested
														// bnode

														// so create a new obj and load it into the structure
														let gggChildProperty = this.UriNamespace(gggChild.tagName)


														if (!gChildData[gggChildProperty]){
															gChildData[gggChildProperty] = []
														}

														// new obj
														let gggData = {'@guid': short.generate()}


														for (let ggggChild of gggChild.children){


															if (this.isClass(ggggChild.tagName)){


																// <bf:genreForm xmlns:bf="http://id.loc.gov/ontologies/bibframe/">
																//   <bf:GenreForm xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" rdf:about="https://id.loc.gov/authorities/genreForms/gf2014026639">
																//     <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
																//     <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Art music.</rdfs:label>
																//     <madsrdf:authoritativeLabel xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">Art music.</madsrdf:authoritativeLabel>
																//     <bf:source>
																//       <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/fast">
																//         <bf:code>fast</bf:code>
																//       </bf:Source>
																//     </bf:source>
																//     <bf:identifiedBy>
																//       <bf:Identifier>
																//         <rdf:value>fst01920007</rdf:value>
																//         <bf:source>
																//           <bf:Source> ~~~~~~~~~~~~~YOU ARE HERE ~~~~~~~~~~~~
																//             <bf:code>OCoLC</bf:code>
																//           </bf:Source>
																//         </bf:source>
																//       </bf:Identifier>
																//     </bf:identifiedBy>
																//   </bf:GenreForm>
																// </bf:genreForm>


																gggData['@type'] = this.UriNamespace(ggggChild.tagName)


																// check for URI
																if (ggggChild.attributes && ggggChild.attributes['rdf:about']){
																	gggData['@id'] = ggggChild.attributes['rdf:about'].value
																}else if (ggggChild.attributes && ggggChild.attributes['rdf:resource']){
																	gggData['@id'] = ggggChild.attributes['rdf:resource'].value
																}else{
																	// console.log('No URI for this child property')
																}




																// now loop through this bnodes decendents, this is the limit tho

																for (let gggggChild of ggggChild.children){


																	let gggggChildProperty = this.UriNamespace(gggggChild.tagName)

																	if (this.UriNamespace(gggggChild.tagName) == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'){


																		if (gggggChild.attributes && gggggChild.attributes['rdf:about']){
																			gggData['@type'] = gggggChild.attributes['rdf:about'].value
																		}else if (gggggChild.attributes && gggggChild.attributes['rdf:resource']){
																			gggData['@type'] = gggggChild.attributes['rdf:resource'].value
																		}else{
																			console.warn('---------------------------------------------')
																			console.warn('There was a gggChild RDF Type node but could not extract the type')
																			console.warn(gggggChild)
																			console.warn('---------------------------------------------')
																		}


																	}else if (gggggChild.children.length ==0){



																			if (!gggData[gggggChildProperty]){
																				gggData[gggggChildProperty] = []
																			}

																			// it doesn't have any children, so it will be a literal or something like that
																			let ggggChildData = {'@guid': short.generate()}

																			if (gggggChild.attributes && gggggChild.attributes['rdf:about']){
																				gggData['@id'] = gggggChild.attributes['rdf:about'].value
																			}else if (gggggChild.attributes && gggggChild.attributes['rdf:resource']){
																				gggData['@id'] = gggggChild.attributes['rdf:resource'].value
																			}else{
																				// console.log('No URI for this child property')
																			}

																			if (gggggChild.innerHTML != null && gggggChild.innerHTML.trim() != ''){
																				ggggChildData[gggggChildProperty] = gggggChild.innerHTML
																				
																				// does it have a data type or lang									
																				if (gggggChild.attributes && gggggChild.attributes['rdf:datatype']){
																					ggggChildData['@datatype'] = gggggChild.attributes['rdf:datatype'].value
																				}
																				if (gggggChild.attributes && gggggChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype']){
																					ggggChildData['@datatype'] = gggggChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype'].value
																				}
																				if (gggggChild.attributes && gggggChild.attributes['xml:lang']){
																					ggggChildData['@language'] = gggggChild.attributes['xml:lang'].value
																				}
																				if (gggggChild.attributes && gggggChild.attributes['rdf:parseType']){
																					ggggChildData['@parseType'] = gggggChild.attributes['rdf:parseType'].value
																				}	


																			}

																			gggData[gggggChildProperty].push(ggggChildData)



																	}else{
																			console.warn('---------------------------------------------')
																			console.warn('Reached the max depth for hiearchy, cannot read the properties nested below')
																			console.warn(gggggChild)
																			console.warn(ggggChild)
																			console.warn('---------------------------------------------')
																	}





																}



															}else{


																let ggggChildProperty = this.UriNamespace(ggggChild.tagName)

																if (!gggData[ggggChildProperty]){
																	gggData[ggggChildProperty] = []
																}

																// it doesn't have any children, so it will be a literal or something like that

																if (ggggChild.attributes && ggggChild.attributes['rdf:about']){
																	gggData['@id'] = ggggChild.attributes['rdf:about'].value
																}else if (ggggChild.attributes && ggggChild.attributes['rdf:resource']){
																	gggData['@id'] = ggggChild.attributes['rdf:resource'].value
																}else{
																	// console.log('No URI for this child property')
																}
																
																let ggggChildData = {'@guid': short.generate()}

																if (ggggChild.innerHTML != null && ggggChild.innerHTML.trim() != ''){
																	ggggChildData[ggggChildProperty] = ggggChild.innerHTML

																	// does it have a data type or lang									
																	if (ggggChild.attributes && ggggChild.attributes['rdf:datatype']){
																		ggggChildData['@datatype'] = ggggChild.attributes['rdf:datatype'].value
																	}
																	if (ggggChild.attributes && ggggChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype']){
																		ggggChildData['@datatype'] = ggggChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype'].value
																	}
																	if (ggggChild.attributes && ggggChild.attributes['xml:lang']){
																		ggggChildData['@language'] = ggggChild.attributes['xml:lang'].value
																	}
																	if (ggggChild.attributes && ggggChild.attributes['rdf:parseType']){
																		ggggChildData['@parseType'] = ggggChild.attributes['rdf:parseType'].value
																	}	


																}

																gggData[ggggChildProperty].push(ggggChildData)



																

															}




														}






														// last thing is add it to the lat structure
														gChildData[gggChildProperty].push(gggData)

													}														







												}

												populateData.userValue[gChildProperty].push(gChildData)

												gChildData = false

											}else{

												// its something else
												if (this.UriNamespace(ggChild.tagName) == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'){


													if (ggChild.attributes && ggChild.attributes['rdf:about']){
														gChildData['@type'] = ggChild.attributes['rdf:about'].value
													}else if (ggChild.attributes && ggChild.attributes['rdf:resource']){
														gChildData['@type'] = ggChild.attributes['rdf:resource'].value
													}else{
														console.warn('---------------------------------------------')
														console.warn('There was a ggChild RDF Type node but could not extract the type')
														console.warn(ggChild)
														console.warn('---------------------------------------------')
													}


												}else if (ggChild.children.length ==0){


														let ggChildProperty = this.UriNamespace(ggChild.tagName)

														if (!gChildData[ggChildProperty]){
															gChildData[ggChildProperty] = []
														}

														// it doesn't have any children, so it will be a literal or something like that
														let ggChildData = {'@guid': short.generate()}
														if (ggChild.attributes && ggChild.attributes['rdf:about']){
															ggChildData['@id'] = ggChild.attributes['rdf:about'].value
														}else if (ggChild.attributes && ggChild.attributes['rdf:resource']){
															ggChildData['@id'] = ggChild.attributes['rdf:resource'].value
														}else{
															// console.log('No URI for this child property')
														}

														if (ggChild.innerHTML != null && ggChild.innerHTML.trim() != ''){
															ggChildData[ggChildProperty] = ggChild.innerHTML
															// does it have a data type or lang									
															if (ggChild.attributes && ggChild.attributes['rdf:datatype']){
																ggChildData['@datatype'] = ggChild.attributes['rdf:datatype'].value
															}
															if (ggChild.attributes && ggChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype']){
																ggChildData['@datatype'] = ggChild.attributes['http://www.w3.org/1999/02/22-rdf-syntax-ns#datatype'].value
															}
															if (ggChild.attributes && ggChild.attributes['xml:lang']){
																ggChildData['@language'] = ggChild.attributes['xml:lang'].value
															}
															if (ggChild.attributes && ggChild.attributes['rdf:parseType']){
																ggChildData['@parseType'] = ggChild.attributes['rdf:parseType'].value
															}	


														}

														gChildData[ggChildProperty].push(ggChildData)



												}else{

													console.warn('---------------------------------------------')
													console.warn('There was a ggChild that was not a class, but has children')
													console.warn(ggChild)
													console.warn(gChild)
													console.warn(this.isClass(ggChild.tagName))
													console.warn(ggChild.tagName)
													console.warn('---------------------------------------------')

												}
											}

										}
										// when there are multiple nested bnodes we take 
										// care of adding them to the structure above
										// and then set the last one to false
										// so dont add 
										if (gChildData !== false){
											populateData.userValue[gChildProperty].push(gChildData)	
										}
										

									}
								}

							}
						}

						sucessfulElements.push(e.outerHTML)
						

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
			if (xml.children.length == 0){
				profile.rt[pkey].unusedXml = false
			}

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

					// now look into the rt of this propertiy to see what properties we have sucuessfully mapped and things we did not map
					let allUris = [profile.rt[pkey].pt[key].propertyURI]
					profile.rt[pkey].pt[key].valueConstraint.valueTemplateRefs.forEach((rtName)=>{
						// console.log('----')
						// console.log(profile.rt[pkey].pt[key])
						// console.log(pkey,key)
						// console.log(profile.rt[pkey].pt[key].valueConstraint.valueTemplateRefs)
						// console.log(rtName)
						store.state.rtLookup[rtName].propertyTemplates.forEach((ptObj)=>{
							if (allUris.indexOf(ptObj.propertyURI)==-1){
								allUris.push(ptObj.propertyURI)
							}

						})	
					})


					
					
					profile.rt[pkey].pt[key].missingProfile = []
					// loop though the URIs we have
					Object.keys(profile.rt[pkey].pt[key].userValue).forEach((userURI)=>{
						if (!userURI.includes('@')){
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



	testProfiles: function(profiles){

		// console.log(profiles)

		let workEl = this.activeDom.getElementsByTagName('bf:Work')
		let instanceEl = this.activeDom.getElementsByTagName('bf:Instance')

		let toWork = []

		if (workEl.length>0){
			toWork.push(workEl[0])
		}

		if (instanceEl.length>0){
			toWork.push(instanceEl[0])
		}		

		// first look for the bflc:profile property
		let suggestedProfileNameByTag = []
		for (let el of toWork){
			// console.log(el)
			let p = el.getElementsByTagName('bflc:profile')
			if (p.length>0){
				for (let pName in profiles){
					for (let rtName in profiles[pName].rt){
						if (p[0].innerHTML == rtName){
							if (suggestedProfileNameByTag.indexOf(rtName)==-1){
								suggestedProfileNameByTag.push(rtName)
							}
						}
					}
				}
			}

		}

		// now compare it to all the profiles
		let dataProperties = []
		for (let el of toWork){
			
			// first see if all the properties in the data are in this pts
			for (let child of el.children){
				if (dataProperties.indexOf(child.tagName)==-1){
					dataProperties.push(child.tagName)
				}
			}
		}

		let scoreResults = []
		for (let pName in profiles){
			// console.log(pName)
			let pts = []
			let instanceID = null
			for (let rtName in profiles[pName].rt){
				
				if (rtName.includes(":Work")||rtName.includes(":Instance")){
					if (rtName.includes(":Instance")){
						instanceID = rtName
					}
					for (let pt in profiles[pName].rt[rtName].pt){
						// pts.push(profiles[pName].rt[rtName].pt[pt].propertyURI)
						pts.push(this.namespaceUri(profiles[pName].rt[rtName].pt[pt].propertyURI))	
					}
				}
			}

			let score = 0
			for (let dpt of dataProperties){
				if (pts.indexOf(dpt)>-1){
					score=score+1
				}else{
					score=score-1
				}
			}

			for (let pt of pts){
				if (dataProperties.indexOf(pt)>-1){
					score=score+1
				}else{
					score=score-1
				}
			}


			// console.log(pName)
			// console.log(pts)
			// console.log("dataProperties",dataProperties.length)			
			// console.log("pts",pts.length)			
			// console.log(score)

			scoreResults.push({score:score,id:instanceID, profile:pName})

		}




		scoreResults.sort((a, b) => b.score - a.score);

		if (suggestedProfileNameByTag.length==0){
			suggestedProfileNameByTag=false
		}

		return {
			hardCoded: suggestedProfileNameByTag,
			scoreResults: scoreResults

		}

	},

	parse: function(xml){

		if (!xml){
			xml = this.testXml
		}	

		console.log(xml)
		// use the browser if we can, should be faster, fall back to the library if not running in the browser
		if (window.DOMParser){
			let parser = new DOMParser();
			this.activeDom = parser.parseFromString(xml, "text/xml");
			this.testDom = parser.parseFromString(xml, "text/xml");


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

















	testXmlInstance: `<?xml version="1.0" encoding="UTF-8"?>
						<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:bf="http://id.loc.gov/ontologies/bibframe/" xmlns:bflc="http://id.loc.gov/ontologies/bflc/" xmlns:lclocal="http://id.loc.gov/ontologies/lclocal/" xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:pmo="http://performedmusicontology.org/ontology/"><bf:Instance rdf:about="http://id.loc.gov/resources/instances/c0056343030001"><bf:issuance>
						      <bf:Issuance rdf:about="http://id.loc.gov/vocabulary/issuance/mono"/>
						    </bf:issuance><bf:soundCharacteristic>
						      <bf:PlayingSpeed rdf:about="http://id.loc.gov/vocabulary/mplayspeed/f">
						        <rdfs:label>1.4 m. per sec.</rdfs:label>
						      </bf:PlayingSpeed>
						    </bf:soundCharacteristic><bf:soundCharacteristic>
						      <bf:PlaybackChannels rdf:about="http://id.loc.gov/vocabulary/mplayback/ste">
						        <rdfs:label>stereo</rdfs:label>
						      </bf:PlaybackChannels>
						    </bf:soundCharacteristic><bf:baseMaterial>
						      <bf:BaseMaterial rdf:about="http://id.loc.gov/vocabulary/mmaterial/pla">
						        <rdfs:label>plastic</rdfs:label>
						      </bf:BaseMaterial>
						    </bf:baseMaterial><bf:baseMaterial>
						      <bf:BaseMaterial rdf:about="http://id.loc.gov/vocabulary/mmaterial/mtl">
						        <rdfs:label>metal</rdfs:label>
						      </bf:BaseMaterial>
						    </bf:baseMaterial><bf:soundCharacteristic>
						      <bf:RecordingMethod rdf:about="http://id.loc.gov/vocabulary/mrectype/digital">
						        <rdfs:label>digital</rdfs:label>
						      </bf:RecordingMethod>
						    </bf:soundCharacteristic><bf:soundCharacteristic>
						      <bflc:CaptureStorage rdf:about="http://id.loc.gov/vocabulary/mcapturestorage/dist">
						        <rdfs:label>Electrical capture, digital storage</rdfs:label>
						      </bflc:CaptureStorage>
						    </bf:soundCharacteristic><bf:provisionActivity>
						      <bf:ProvisionActivity>
						        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Distribution"/>
						        <bf:date rdf:datatype="http://id.loc.gov/datatypes/edtf">1990</bf:date>
						        <bf:place>
						          <bf:Place rdf:about="http://id.loc.gov/vocabulary/countries/gw"/>
						        </bf:place>
						      </bf:ProvisionActivity>
						    </bf:provisionActivity><bf:provisionActivity>
						      <bf:ProvisionActivity>
						        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Production"/>
						        <bf:date rdf:datatype="http://id.loc.gov/datatypes/edtf">1989</bf:date>
						      </bf:ProvisionActivity>
						    </bf:provisionActivity><bf:identifiedBy>
						      <bf:Lccn>
						        <rdf:value>   91754962 </rdf:value>
						      </bf:Lccn>
						    </bf:identifiedBy><bf:identifiedBy>
						      <bf:Identifier>
						        <rdf:value>011790209128</rdf:value>
						      </bf:Identifier>
						    </bf:identifiedBy><bf:identifiedBy>
						      <bf:Upc>
						        <rdf:value>1179020912</rdf:value>
						      </bf:Upc>
						    </bf:identifiedBy><bf:identifiedBy>
						      <bf:Upc>
						        <rdf:value>4011790209128</rdf:value>
						      </bf:Upc>
						    </bf:identifiedBy><bf:identifiedBy>
						      <bf:AudioIssueNumber>
						        <rdf:value>C 209 901A</rdf:value>
						        <bf:assigner>
						          <bf:Agent>
						            <rdfs:label>Orfeo</rdfs:label>
						          </bf:Agent>
						        </bf:assigner>
						      </bf:AudioIssueNumber>
						    </bf:identifiedBy><bf:identifiedBy>
						      <bf:Local>
						        <rdf:value>ocm23722496</rdf:value>
						        <bf:assigner>
						          <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/ocolc"/>
						        </bf:assigner>
						      </bf:Local>
						    </bf:identifiedBy><rdfs:label>Orchesterlieder</rdfs:label><bf:responsibilityStatement>Max Reger</bf:responsibilityStatement><bf:title>
						      <bf:Title>
						        <rdfs:label>Orchesterlieder</rdfs:label>
						        <bflc:titleSortKey>Orchesterlieder</bflc:titleSortKey>
						        <bf:mainTitle>Orchesterlieder</bf:mainTitle>
						      </bf:Title>
						    </bf:title><bf:provisionActivity>
						      <bf:ProvisionActivity>
						        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Publication"/>
						        <bf:place>
						          <bf:Place>
						            <rdfs:label>München</rdfs:label>
						          </bf:Place>
						        </bf:place>
						        <bf:agent>
						          <bf:Agent rdf:about="https://id.loc.gov/entities/providers/adf466d570b7884201b25c7a8d331aa4">
						            <rdfs:label>Orfeo</rdfs:label>
						          </bf:Agent>
						        </bf:agent>
						        <bf:date>1990</bf:date>
						      </bf:ProvisionActivity>
						    </bf:provisionActivity><bf:provisionActivityStatement>München : Orfeo, [1990]</bf:provisionActivityStatement><bf:copyrightDate>℗1990</bf:copyrightDate><bf:extent>
						      <bf:Extent>
						        <rdfs:label>1 audio disc</rdfs:label>
						      </bf:Extent>
						    </bf:extent><bf:note>
						      <bf:Note>
						        <bf:noteType>Physical details</bf:noteType>
						        <rdfs:label>digital, stereo</rdfs:label>
						      </bf:Note>
						    </bf:note><bf:dimensions>4 3/4 in.</bf:dimensions><bf:duration rdf:datatype="http://www.w3.org/2001/XMLSchema#duration">001330</bf:duration><bf:duration rdf:datatype="http://www.w3.org/2001/XMLSchema#duration">001338</bf:duration><bf:duration rdf:datatype="http://www.w3.org/2001/XMLSchema#duration">001604</bf:duration><bf:duration rdf:datatype="http://www.w3.org/2001/XMLSchema#duration">001229</bf:duration><bf:media>
						      <bf:Media rdf:about="http://id.loc.gov/vocabulary/mediaTypes/s">
						        <rdfs:label>audio</rdfs:label>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/rdamedia"/>
						        </bf:source>
						      </bf:Media>
						    </bf:media><bf:carrier>
						      <bf:Carrier rdf:about="http://id.loc.gov/vocabulary/carriers/sd">
						        <rdfs:label>audio disc</rdfs:label>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/rdacarrier"/>
						        </bf:source>
						      </bf:Carrier>
						    </bf:carrier><bf:soundCharacteristic>
						      <bf:RecordingMethod rdf:about="http://id.loc.gov/vocabulary/mrectype/digital">
						        <rdfs:label>digital</rdfs:label>
						        <bf:source>
						          <bf:Source>
						            <bf:code>rdatr</bf:code>
						          </bf:Source>
						        </bf:source>
						      </bf:RecordingMethod>
						    </bf:soundCharacteristic><bf:soundCharacteristic>
						      <bf:RecordingMedium rdf:about="http://id.loc.gov/vocabulary/mrecmedium/opt">
						        <rdfs:label>optical</rdfs:label>
						        <bf:source>
						          <bf:Source>
						            <bf:code>rdarm</bf:code>
						          </bf:Source>
						        </bf:source>
						      </bf:RecordingMedium>
						    </bf:soundCharacteristic><bf:soundCharacteristic>
						      <bf:PlaybackChannels rdf:about="http://id.loc.gov/vocabulary/mplayback/ste">
						        <rdfs:label>stereo</rdfs:label>
						        <bf:source>
						          <bf:Source>
						            <bf:code>rdacpc</bf:code>
						          </bf:Source>
						        </bf:source>
						      </bf:PlaybackChannels>
						    </bf:soundCharacteristic><bf:digitalCharacteristic>
						      <bf:FileType rdf:about="http://id.loc.gov/vocabulary/mfiletype/audio">
						        <rdfs:label>audio file</rdfs:label>
						        <bf:source>
						          <bf:Source>
						            <bf:code>rdaft</bf:code>
						          </bf:Source>
						        </bf:source>
						      </bf:FileType>
						    </bf:digitalCharacteristic><bf:digitalCharacteristic>
						      <bf:EncodingFormat>
						        <rdfs:label>CD audio</rdfs:label>
						      </bf:EncodingFormat>
						    </bf:digitalCharacteristic><bf:note>
						      <bf:Note>
						        <rdfs:label>Title from disc label.</rdfs:label>
						      </bf:Note>
						    </bf:note><bf:credits>Dietrich Fischer-Dieskau, baritone ; St. Michaels-Chor ; Monteverdi-Chor, Hamburg ; Philharmonisches Staatsorchester Hamburg ; Gerd Albrecht, conductor.</bf:credits><bf:note>
						      <bf:Note>
						        <rdfs:label>Texts set: Joseph von Eichendorff (op. 144a), Ludwig Jacobowski (op. 136), Friedrich Hennel (op. 144b), after Friedrich Hölderlin (op. 124).</rdfs:label>
						      </bf:Note>
						    </bf:note><bf:credits>G. Götze, recording supervision; K. O. Bremer, recording engineer; S. Woellner, S. Kaufmann, T. v. Geest, editing.</bf:credits><bf:note>
						      <bf:Note>
						        <rdfs:label>"Eine Coproduktion mit der Philharmonie Hamburg und dem NDR"--Insert.</rdfs:label>
						      </bf:Note>
						    </bf:note><bf:note>
						      <bf:Note>
						        <rdfs:label>Booklet includes program notes in German, English and French and German texts with English and French translations (14 unnumbered pages) inserted in container.</rdfs:label>
						      </bf:Note>
						    </bf:note><bf:instanceOf rdf:resource="http://id.loc.gov/resources/works/c005634303"/><bf:hasItem rdf:resource="http://id.loc.gov/resources/items/c0056343030001-1"/><bf:adminMetadata>
						      <bf:AdminMetadata>
						        <bf:generationProcess>
						          <bf:GenerationProcess>
						            <rdfs:label>DLC marc2bibframe2 v1.7.0-SNAPSHOT</rdfs:label>
						            <bf:generationDate rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2021-04-21T01:32:00-04:00</bf:generationDate>
						          </bf:GenerationProcess>
						        </bf:generationProcess>
						        <bf:status>
						          <bf:Status>
						            <rdfs:label>corrected or revised</rdfs:label>
						            <bf:code>c</bf:code>
						          </bf:Status>
						        </bf:status>
						        <bflc:encodingLevel>
						          <bflc:EncodingLevel rdf:about="http://id.loc.gov/vocabulary/menclvl/f">
						            <rdfs:label>full</rdfs:label>
						          </bflc:EncodingLevel>
						        </bflc:encodingLevel>
						        <bf:descriptionConventions>
						          <bf:DescriptionConventions rdf:about="http://id.loc.gov/vocabulary/descriptionConventions/isbd">
						            <rdfs:label>isbd</rdfs:label>
						          </bf:DescriptionConventions>
						        </bf:descriptionConventions>
						        <bf:identifiedBy>
						          <bf:Local>
						            <rdf:value>5634303</rdf:value>
						            <bf:assigner>
						              <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
						                <bf:code>DLC</bf:code>
						              </bf:Agent>
						            </bf:assigner>
						          </bf:Local>
						        </bf:identifiedBy>
						        <bf:changeDate rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2021-04-20T17:20:50</bf:changeDate>
						        <bf:creationDate rdf:datatype="http://www.w3.org/2001/XMLSchema#date">1991-07-12</bf:creationDate>
						        <bf:assigner>
						          <bf:Agent>
						            <bf:code>DMM</bf:code>
						          </bf:Agent>
						        </bf:assigner>
						        <bf:descriptionLanguage>
						          <bf:Language rdf:about="http://id.loc.gov/vocabulary/languages/eng"/>
						        </bf:descriptionLanguage>
						        <bf:descriptionModifier>
						          <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
						            <bf:code>DLC</bf:code>
						          </bf:Agent>
						        </bf:descriptionModifier>
						        <bf:descriptionConventions>
						          <bf:DescriptionConventions rdf:about="http://id.loc.gov/vocabulary/descriptionConventions/rda">
						            <rdf:value>rda</rdf:value>
						          </bf:DescriptionConventions>
						        </bf:descriptionConventions>
						        <bf:descriptionAuthentication>
						          <bf:DescriptionAuthentication rdf:about="http://id.loc.gov/vocabulary/marcauthen/lccopycat">
						            <bf:code>lccopycat</bf:code>
						          </bf:DescriptionAuthentication>
						        </bf:descriptionAuthentication>
						      </bf:AdminMetadata>
						    </bf:adminMetadata></bf:Instance><bf:Work rdf:about="http://id.loc.gov/resources/works/c005634303"><bf:adminMetadata>
						      <bf:AdminMetadata>
						        <bf:generationProcess>
						          <bf:GenerationProcess>
						            <rdfs:label>DLC marc2bibframe2 v1.7.0-SNAPSHOT</rdfs:label>
						            <bf:generationDate rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2021-04-21T01:32:00-04:00</bf:generationDate>
						          </bf:GenerationProcess>
						        </bf:generationProcess>
						        <bf:status>
						          <bf:Status>
						            <rdfs:label>corrected or revised</rdfs:label>
						            <bf:code>c</bf:code>
						          </bf:Status>
						        </bf:status>
						        <bflc:encodingLevel>
						          <bflc:EncodingLevel rdf:about="http://id.loc.gov/vocabulary/menclvl/f">
						            <rdfs:label>full</rdfs:label>
						          </bflc:EncodingLevel>
						        </bflc:encodingLevel>
						        <bf:descriptionConventions>
						          <bf:DescriptionConventions rdf:about="http://id.loc.gov/vocabulary/descriptionConventions/isbd">
						            <rdfs:label>isbd</rdfs:label>
						          </bf:DescriptionConventions>
						        </bf:descriptionConventions>
						        <bf:identifiedBy>
						          <bf:Local>
						            <rdf:value>5634303</rdf:value>
						            <bf:assigner>
						              <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
						                <bf:code>DLC</bf:code>
						              </bf:Agent>
						            </bf:assigner>
						          </bf:Local>
						        </bf:identifiedBy>
						        <bf:changeDate rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2021-04-20T17:20:50</bf:changeDate>
						        <bf:creationDate rdf:datatype="http://www.w3.org/2001/XMLSchema#date">1991-07-12</bf:creationDate>
						        <bf:assigner>
						          <bf:Agent>
						            <bf:code>DMM</bf:code>
						          </bf:Agent>
						        </bf:assigner>
						        <bf:descriptionLanguage>
						          <bf:Language rdf:about="http://id.loc.gov/vocabulary/languages/eng"/>
						        </bf:descriptionLanguage>
						        <bf:descriptionModifier>
						          <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
						            <bf:code>DLC</bf:code>
						          </bf:Agent>
						        </bf:descriptionModifier>
						        <bf:descriptionConventions>
						          <bf:DescriptionConventions rdf:about="http://id.loc.gov/vocabulary/descriptionConventions/rda">
						            <rdf:value>rda</rdf:value>
						          </bf:DescriptionConventions>
						        </bf:descriptionConventions>
						        <bf:descriptionAuthentication>
						          <bf:DescriptionAuthentication rdf:about="http://id.loc.gov/vocabulary/marcauthen/lccopycat">
						            <bf:code>lccopycat</bf:code>
						          </bf:DescriptionAuthentication>
						        </bf:descriptionAuthentication>
						      </bf:AdminMetadata>
						    </bf:adminMetadata><rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Audio"/><bf:language>
						      <bf:Language rdf:about="http://id.loc.gov/vocabulary/languages/ger"/>
						    </bf:language><bf:supplementaryContent>
						      <bf:SupplementaryContent rdf:about="http://id.loc.gov/vocabulary/msupplcont/libretto">
						        <rdfs:label>libretto or text</rdfs:label>
						      </bf:SupplementaryContent>
						    </bf:supplementaryContent><bf:supplementaryContent>
						      <bf:SupplementaryContent rdf:about="http://id.loc.gov/vocabulary/msupplcont/creatorbio">
						        <rdfs:label>biography of composer or author</rdfs:label>
						      </bf:SupplementaryContent>
						    </bf:supplementaryContent><bf:supplementaryContent>
						      <bf:SupplementaryContent rdf:about="http://id.loc.gov/vocabulary/msupplcont/techmusic">
						        <rdfs:label>technical information on music</rdfs:label>
						      </bf:SupplementaryContent>
						    </bf:supplementaryContent><bf:capture>
						      <bf:Capture>
						        <bf:date rdf:datatype="http://id.loc.gov/datatypes/edtf">1989-07-10/1989-07-14</bf:date>
						      </bf:Capture>
						    </bf:capture><bf:capture>
						      <bf:Capture>
						        <bf:date rdf:datatype="http://id.loc.gov/datatypes/edtf">1989-07-10/1989-07-14</bf:date>
						      </bf:Capture>
						    </bf:capture><bf:language>
						      <bf:Language>
						        <bf:part>sung or spoken text</bf:part>
						        <rdf:value rdf:resource="http://id.loc.gov/vocabulary/languages/ger"/>
						      </bf:Language>
						    </bf:language><bf:language>
						      <bf:Language>
						        <bf:part>libretto</bf:part>
						        <rdf:value rdf:resource="http://id.loc.gov/vocabulary/languages/ger"/>
						      </bf:Language>
						    </bf:language><bf:language>
						      <bf:Language>
						        <bf:part>libretto</bf:part>
						        <rdf:value rdf:resource="http://id.loc.gov/vocabulary/languages/eng"/>
						      </bf:Language>
						    </bf:language><bf:language>
						      <bf:Language>
						        <bf:part>accompanying material</bf:part>
						        <rdf:value rdf:resource="http://id.loc.gov/vocabulary/languages/ger"/>
						      </bf:Language>
						    </bf:language><bf:language>
						      <bf:Language>
						        <bf:part>accompanying material</bf:part>
						        <rdf:value rdf:resource="http://id.loc.gov/vocabulary/languages/eng"/>
						      </bf:Language>
						    </bf:language><bf:voice>
						      <bf:MusicVoice>
						        <bf:voiceType>voice</bf:voiceType>
						        <rdfs:label>bass</rdfs:label>
						        <bf:count>1</bf:count>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/musiccodeschemes/marcmusperf"/>
						        </bf:source>
						      </bf:MusicVoice>
						    </bf:voice><bf:voice>
						      <bf:MusicVoice>
						        <bf:voiceType>chorus</bf:voiceType>
						        <rdfs:label>mixed chorus</rdfs:label>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/musiccodeschemes/marcmusperf"/>
						        </bf:source>
						      </bf:MusicVoice>
						    </bf:voice><bf:ensemble>
						      <bf:MusicEnsemble>
						        <bf:ensembleType>instrumental</bf:ensembleType>
						        <rdfs:label>orchestra</rdfs:label>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/musiccodeschemes/marcmusperf"/>
						        </bf:source>
						      </bf:MusicEnsemble>
						    </bf:ensemble><bf:contribution>
						      <bf:Contribution>
						        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bflc/PrimaryContribution"/>
						        <bf:agent>
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n79108398">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
						            <bflc:name00MatchKey>Reger, Max, 1873-1916,</bflc:name00MatchKey>
						            <bflc:primaryContributorName00MatchKey>Reger, Max, 1873-1916,</bflc:primaryContributorName00MatchKey>
						            <bflc:name00MarcKey>1001 $aReger, Max,$d1873-1916,$ecomposer.</bflc:name00MarcKey>
						            <rdfs:label>Reger, Max, 1873-1916,</rdfs:label>
						          </bf:Agent>
						        </bf:agent>
						        <bf:role>
						          <bf:Role>
						            <rdfs:label>composer.</rdfs:label>
						          </bf:Role>
						        </bf:role>
						      </bf:Contribution>
						    </bf:contribution><rdfs:label>Vocal music. Selections</rdfs:label><bf:title>
						      <bf:Title>
						        <bflc:title40MatchKey>Vocal music. Selections</bflc:title40MatchKey>
						        <bflc:title40MarcKey>24010$aVocal music.$kSelections</bflc:title40MarcKey>
						        <rdfs:label>Vocal music. Selections</rdfs:label>
						        <bflc:titleSortKey>Vocal music. Selections</bflc:titleSortKey>
						        <bf:mainTitle>Vocal music. Selections</bf:mainTitle>
						      </bf:Title>
						    </bf:title><bf:content>
						      <bf:Content rdf:about="http://id.loc.gov/vocabulary/contentTypes/prm">
						        <rdfs:label>performed music</rdfs:label>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/rdacontent"/>
						        </bf:source>
						      </bf:Content>
						    </bf:content><bf:musicMedium>
						      <bf:MusicMedium>
						        <rdfs:label>baritone voice soloist</rdfs:label>
						        <bf:count>1</bf:count>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/musiccodeschemes/lcmpt">
						            <bf:code>lcmpt</bf:code>
						          </bf:Source>
						        </bf:source>
						        <bflc:appliesTo>
						          <bflc:AppliesTo>
						            <rdfs:label>Hymnus der Liebe, An die Hoffnung</rdfs:label>
						          </bflc:AppliesTo>
						        </bflc:appliesTo>
						      </bf:MusicMedium>
						    </bf:musicMedium><bf:musicMedium>
						      <bf:MusicMedium rdf:about="https://id.loc.gov/authorities/performanceMediums/mp2013015516">
						        <rdfs:label>orchestra</rdfs:label>
						        <bf:count>1</bf:count>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/musiccodeschemes/lcmpt">
						            <bf:code>lcmpt</bf:code>
						          </bf:Source>
						        </bf:source>
						        <bflc:appliesTo>
						          <bflc:AppliesTo>
						            <rdfs:label>Hymnus der Liebe, An die Hoffnung</rdfs:label>
						          </bflc:AppliesTo>
						        </bflc:appliesTo>
						      </bf:MusicMedium>
						    </bf:musicMedium><bf:musicMedium>
						      <bf:MusicMedium>
						        <bf:note>
						          <bf:Note>
						            <rdfs:label>Total performers alongside ensembles: 1</rdfs:label>
						          </bf:Note>
						        </bf:note>
						        <bflc:appliesTo>
						          <bflc:AppliesTo>
						            <rdfs:label>Hymnus der Liebe, An die Hoffnung</rdfs:label>
						          </bflc:AppliesTo>
						        </bflc:appliesTo>
						      </bf:MusicMedium>
						    </bf:musicMedium><bf:musicMedium>
						      <bf:MusicMedium>
						        <bf:note>
						          <bf:Note>
						            <rdfs:label>Total ensembles: 1</rdfs:label>
						          </bf:Note>
						        </bf:note>
						        <bflc:appliesTo>
						          <bflc:AppliesTo>
						            <rdfs:label>Hymnus der Liebe, An die Hoffnung</rdfs:label>
						          </bflc:AppliesTo>
						        </bflc:appliesTo>
						      </bf:MusicMedium>
						    </bf:musicMedium><bf:musicMedium>
						      <bf:MusicMedium>
						        <rdfs:label>baritone voice soloist</rdfs:label>
						        <bf:count>1</bf:count>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/musiccodeschemes/lcmpt">
						            <bf:code>lcmpt</bf:code>
						          </bf:Source>
						        </bf:source>
						        <bflc:appliesTo>
						          <bflc:AppliesTo>
						            <rdfs:label>Einsiedler, Requiem</rdfs:label>
						          </bflc:AppliesTo>
						        </bflc:appliesTo>
						      </bf:MusicMedium>
						    </bf:musicMedium><bf:musicMedium>
						      <bf:MusicMedium rdf:about="https://id.loc.gov/authorities/performanceMediums/mp2013015146">
						        <rdfs:label>mixed chorus</rdfs:label>
						        <bf:count>1</bf:count>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/musiccodeschemes/lcmpt">
						            <bf:code>lcmpt</bf:code>
						          </bf:Source>
						        </bf:source>
						        <bflc:appliesTo>
						          <bflc:AppliesTo>
						            <rdfs:label>Einsiedler, Requiem</rdfs:label>
						          </bflc:AppliesTo>
						        </bflc:appliesTo>
						      </bf:MusicMedium>
						    </bf:musicMedium><bf:musicMedium>
						      <bf:MusicMedium rdf:about="https://id.loc.gov/authorities/performanceMediums/mp2013015516">
						        <rdfs:label>orchestra</rdfs:label>
						        <bf:count>1</bf:count>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/musiccodeschemes/lcmpt">
						            <bf:code>lcmpt</bf:code>
						          </bf:Source>
						        </bf:source>
						        <bflc:appliesTo>
						          <bflc:AppliesTo>
						            <rdfs:label>Einsiedler, Requiem</rdfs:label>
						          </bflc:AppliesTo>
						        </bflc:appliesTo>
						      </bf:MusicMedium>
						    </bf:musicMedium><bf:musicMedium>
						      <bf:MusicMedium>
						        <bf:note>
						          <bf:Note>
						            <rdfs:label>Total performers alongside ensembles: 1</rdfs:label>
						          </bf:Note>
						        </bf:note>
						        <bflc:appliesTo>
						          <bflc:AppliesTo>
						            <rdfs:label>Einsiedler, Requiem</rdfs:label>
						          </bflc:AppliesTo>
						        </bflc:appliesTo>
						      </bf:MusicMedium>
						    </bf:musicMedium><bf:musicMedium>
						      <bf:MusicMedium>
						        <bf:note>
						          <bf:Note>
						            <rdfs:label>Total ensembles: 2</rdfs:label>
						          </bf:Note>
						        </bf:note>
						        <bflc:appliesTo>
						          <bflc:AppliesTo>
						            <rdfs:label>Einsiedler, Requiem</rdfs:label>
						          </bflc:AppliesTo>
						        </bflc:appliesTo>
						      </bf:MusicMedium>
						    </bf:musicMedium><bf:language>
						      <bf:Language>
						        <bf:note>
						          <bf:Note>
						            <rdfs:label>Sung in German</rdfs:label>
						          </bf:Note>
						        </bf:note>
						      </bf:Language>
						    </bf:language><bf:capture>
						      <bf:Capture>
						        <bf:date>1989 July 10-14</bf:date>
						        <bf:note>
						          <bf:Note>
						            <rdfs:label>Recorded</rdfs:label>
						          </bf:Note>
						        </bf:note>
						        <bf:place>
						          <bf:Place>
						            <rdfs:label>at the Norddeutscher Rundfunk Studio 10.</rdfs:label>
						          </bf:Place>
						        </bf:place>
						      </bf:Capture>
						    </bf:capture><bf:tableOfContents>
						      <bf:TableOfContents>
						        <rdfs:label>Der Einsiedler : op. 144a : für gemischten Chor, Bariton und Orchester (13:30) -- Hymnus der Liebe : op. 136 : für Bariton und Orchester (13:38) -- Requiem : op. 144b : für gemischten Chor, Bariton und Orchester (16:04) -- An die Hoffnung : op. 124 : für Bariton und Orchester (12:29).</rdfs:label>
						      </bf:TableOfContents>
						    </bf:tableOfContents><bf:subject>
						      <bf:Topic rdf:about="https://id.loc.gov/authorities/subjects/sh85024915">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
						        <rdfs:label>Choruses, Secular (Mixed voices) with orchestra.</rdfs:label>
						        <madsrdf:authoritativeLabel>Choruses, Secular (Mixed voices) with orchestra.</madsrdf:authoritativeLabel>
						        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						            <bf:code>lcsh</bf:code>
						          </bf:Source>
						        </bf:source>
						      </bf:Topic>
						    </bf:subject><bf:subject>
						      <bf:Topic rdf:about="https://id.loc.gov/authorities/subjects/sh85125186">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
						        <rdfs:label>Songs (Medium voice) with orchestra.</rdfs:label>
						        <madsrdf:authoritativeLabel>Songs (Medium voice) with orchestra.</madsrdf:authoritativeLabel>
						        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						            <bf:code>lcsh</bf:code>
						          </bf:Source>
						        </bf:source>
						      </bf:Topic>
						    </bf:subject><bf:subject>
						      <bf:Topic rdf:about="http://bibframe.example.org/5634303#Topic600-50">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
						        <madsrdf:authoritativeLabel>Eichendorff, Joseph, Freiherr von, 1788-1857--Musical settings.</madsrdf:authoritativeLabel>
						        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						            <bf:code>lcsh</bf:code>
						          </bf:Source>
						        </bf:source>
						        <madsrdf:componentList rdf:parseType="Collection">
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n81047567">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
						            <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#PersonalName"/>
						            <madsrdf:authoritativeLabel>Eichendorff, Joseph, Freiherr von, 1788-1857</madsrdf:authoritativeLabel>
						            <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						            <bflc:name00MatchKey>Eichendorff, Joseph, Freiherr von, 1788-1857</bflc:name00MatchKey>
						            <bflc:name00MarcKey>60010$aEichendorff, Joseph,$cFreiherr von,$d1788-1857$vMusical settings.</bflc:name00MarcKey>
						            <rdfs:label>Eichendorff, Joseph, Freiherr von, 1788-1857</rdfs:label>
						            <bf:source>
						              <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						                <bf:code>lcsh</bf:code>
						              </bf:Source>
						            </bf:source>
						          </bf:Agent>
						          <madsrdf:GenreForm rdf:about="https://id.loc.gov/authorities/subjects/sh2002006133">
						            <madsrdf:authoritativeLabel>Musical settings</madsrdf:authoritativeLabel>
						          </madsrdf:GenreForm>
						        </madsrdf:componentList>
						      </bf:Topic>
						    </bf:subject><bf:subject>
						      <bf:Topic rdf:about="http://bibframe.example.org/5634303#Topic600-51">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
						        <madsrdf:authoritativeLabel>Jacobowski, Ludwig, 1868-1900--Musical settings.</madsrdf:authoritativeLabel>
						        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						            <bf:code>lcsh</bf:code>
						          </bf:Source>
						        </bf:source>
						        <madsrdf:componentList rdf:parseType="Collection">
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n93098601">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
						            <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#PersonalName"/>
						            <madsrdf:authoritativeLabel>Jacobowski, Ludwig, 1868-1900</madsrdf:authoritativeLabel>
						            <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						            <bflc:name00MatchKey>Jacobowski, Ludwig, 1868-1900</bflc:name00MatchKey>
						            <bflc:name00MarcKey>60010$aJacobowski, Ludwig,$d1868-1900$vMusical settings.</bflc:name00MarcKey>
						            <rdfs:label>Jacobowski, Ludwig, 1868-1900</rdfs:label>
						            <bf:source>
						              <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						                <bf:code>lcsh</bf:code>
						              </bf:Source>
						            </bf:source>
						          </bf:Agent>
						          <madsrdf:GenreForm rdf:about="https://id.loc.gov/authorities/subjects/sh2002006133">
						            <madsrdf:authoritativeLabel>Musical settings</madsrdf:authoritativeLabel>
						          </madsrdf:GenreForm>
						        </madsrdf:componentList>
						      </bf:Topic>
						    </bf:subject><bf:subject>
						      <bf:Topic rdf:about="http://bibframe.example.org/5634303#Topic600-52">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
						        <madsrdf:authoritativeLabel>Hebbel, Friedrich, 1813-1863--Musical settings.</madsrdf:authoritativeLabel>
						        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						            <bf:code>lcsh</bf:code>
						          </bf:Source>
						        </bf:source>
						        <madsrdf:componentList rdf:parseType="Collection">
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n50025657">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
						            <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#PersonalName"/>
						            <madsrdf:authoritativeLabel>Hebbel, Friedrich, 1813-1863</madsrdf:authoritativeLabel>
						            <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						            <bflc:name00MatchKey>Hebbel, Friedrich, 1813-1863</bflc:name00MatchKey>
						            <bflc:name00MarcKey>60010$aHebbel, Friedrich,$d1813-1863$vMusical settings.</bflc:name00MarcKey>
						            <rdfs:label>Hebbel, Friedrich, 1813-1863</rdfs:label>
						            <bf:source>
						              <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						                <bf:code>lcsh</bf:code>
						              </bf:Source>
						            </bf:source>
						          </bf:Agent>
						          <madsrdf:GenreForm rdf:about="https://id.loc.gov/authorities/subjects/sh2002006133">
						            <madsrdf:authoritativeLabel>Musical settings</madsrdf:authoritativeLabel>
						          </madsrdf:GenreForm>
						        </madsrdf:componentList>
						      </bf:Topic>
						    </bf:subject><bf:subject>
						      <bf:Topic rdf:about="http://bibframe.example.org/5634303#Topic600-53">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#ComplexSubject"/>
						        <madsrdf:authoritativeLabel>Hölderlin, Friedrich, 1770-1843--Musical settings.</madsrdf:authoritativeLabel>
						        <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						            <bf:code>lcsh</bf:code>
						          </bf:Source>
						        </bf:source>
						        <madsrdf:componentList rdf:parseType="Collection">
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n79115224">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
						            <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#PersonalName"/>
						            <madsrdf:authoritativeLabel>Hölderlin, Friedrich, 1770-1843</madsrdf:authoritativeLabel>
						            <madsrdf:isMemberOfMADSScheme rdf:resource="http://id.loc.gov/authorities/subjects"/>
						            <bflc:name00MatchKey>Hölderlin, Friedrich, 1770-1843</bflc:name00MatchKey>
						            <bflc:name00MarcKey>60010$aHölderlin, Friedrich,$d1770-1843$vMusical settings.</bflc:name00MarcKey>
						            <rdfs:label>Hölderlin, Friedrich, 1770-1843</rdfs:label>
						            <bf:source>
						              <bf:Source rdf:about="http://id.loc.gov/authorities/subjects">
						                <bf:code>lcsh</bf:code>
						              </bf:Source>
						            </bf:source>
						          </bf:Agent>
						          <madsrdf:GenreForm rdf:about="https://id.loc.gov/authorities/subjects/sh2002006133">
						            <madsrdf:authoritativeLabel>Musical settings</madsrdf:authoritativeLabel>
						          </madsrdf:GenreForm>
						        </madsrdf:componentList>
						      </bf:Topic>
						    </bf:subject><bf:subject>
						      <bf:Topic rdf:about="http://bibframe.example.org/5634303#Topic650-54">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
						        <rdfs:label>Choruses, Secular (Mixed voices) with orchestra.</rdfs:label>
						        <madsrdf:authoritativeLabel>Choruses, Secular (Mixed voices) with orchestra.</madsrdf:authoritativeLabel>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/subjectSchemes/fast">
						            <bf:code>fast</bf:code>
						          </bf:Source>
						        </bf:source>
						        <bf:identifiedBy>
						          <bf:Identifier>
						            <rdf:value>fst00858811</rdf:value>
						            <bf:source>
						              <bf:Source>
						                <bf:code>OCoLC</bf:code>
						              </bf:Source>
						            </bf:source>
						          </bf:Identifier>
						        </bf:identifiedBy>
						      </bf:Topic>
						    </bf:subject><bf:subject>
						      <bf:Topic rdf:about="http://bibframe.example.org/5634303#Topic650-55">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
						        <rdfs:label>Songs (Medium voice) with orchestra.</rdfs:label>
						        <madsrdf:authoritativeLabel>Songs (Medium voice) with orchestra.</madsrdf:authoritativeLabel>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/subjectSchemes/fast">
						            <bf:code>fast</bf:code>
						          </bf:Source>
						        </bf:source>
						        <bf:identifiedBy>
						          <bf:Identifier>
						            <rdf:value>fst01126191</rdf:value>
						            <bf:source>
						              <bf:Source>
						                <bf:code>OCoLC</bf:code>
						              </bf:Source>
						            </bf:source>
						          </bf:Identifier>
						        </bf:identifiedBy>
						      </bf:Topic>
						    </bf:subject><bf:genreForm>
						      <bf:GenreForm rdf:about="https://id.loc.gov/authorities/genreForms/gf2014026639">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
						        <rdfs:label>Art music.</rdfs:label>
						        <madsrdf:authoritativeLabel>Art music.</madsrdf:authoritativeLabel>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/fast">
						            <bf:code>fast</bf:code>
						          </bf:Source>
						        </bf:source>
						        <bf:identifiedBy>
						          <bf:Identifier>
						            <rdf:value>fst01920007</rdf:value>
						            <bf:source>
						              <bf:Source>
						                <bf:code>OCoLC</bf:code>
						              </bf:Source>
						            </bf:source>
						          </bf:Identifier>
						        </bf:identifiedBy>
						      </bf:GenreForm>
						    </bf:genreForm><bf:genreForm>
						      <bf:GenreForm rdf:about="https://id.loc.gov/authorities/genreForms/gf2014027103">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
						        <rdfs:label>Songs.</rdfs:label>
						        <madsrdf:authoritativeLabel>Songs.</madsrdf:authoritativeLabel>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/fast">
						            <bf:code>fast</bf:code>
						          </bf:Source>
						        </bf:source>
						        <bf:identifiedBy>
						          <bf:Identifier>
						            <rdf:value>fst01726744</rdf:value>
						            <bf:source>
						              <bf:Source>
						                <bf:code>OCoLC</bf:code>
						              </bf:Source>
						            </bf:source>
						          </bf:Identifier>
						        </bf:identifiedBy>
						      </bf:GenreForm>
						    </bf:genreForm><bf:genreForm>
						      <bf:GenreForm rdf:about="https://id.loc.gov/authorities/genreForms/gf2014027103">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
						        <rdfs:label>Songs.</rdfs:label>
						        <madsrdf:authoritativeLabel>Songs.</madsrdf:authoritativeLabel>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/lcgft">
						            <bf:code>lcgft</bf:code>
						          </bf:Source>
						        </bf:source>
						      </bf:GenreForm>
						    </bf:genreForm><bf:genreForm>
						      <bf:GenreForm rdf:about="https://id.loc.gov/authorities/genreForms/gf2014026639">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
						        <rdfs:label>Art music.</rdfs:label>
						        <madsrdf:authoritativeLabel>Art music.</madsrdf:authoritativeLabel>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/lcgft">
						            <bf:code>lcgft</bf:code>
						          </bf:Source>
						        </bf:source>
						      </bf:GenreForm>
						    </bf:genreForm><bf:genreForm>
						      <bf:GenreForm rdf:about="https://id.loc.gov/authorities/genreForms/gf2017026061">
						        <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#Topic"/>
						        <rdfs:label>Musical settings.</rdfs:label>
						        <madsrdf:authoritativeLabel>Musical settings.</madsrdf:authoritativeLabel>
						        <bf:source>
						          <bf:Source rdf:about="http://id.loc.gov/vocabulary/genreFormSchemes/lcgft">
						            <bf:code>lcgft</bf:code>
						          </bf:Source>
						        </bf:source>
						      </bf:GenreForm>
						    </bf:genreForm><bf:contribution>
						      <bf:Contribution>
						        <bf:agent>
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n50003091">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
						            <bflc:name00MatchKey>Fischer-Dieskau, Dietrich, 1925-2012,</bflc:name00MatchKey>
						            <bflc:name00MarcKey>7001 $aFischer-Dieskau, Dietrich,$d1925-2012,$esinger.</bflc:name00MarcKey>
						            <rdfs:label>Fischer-Dieskau, Dietrich, 1925-2012,</rdfs:label>
						          </bf:Agent>
						        </bf:agent>
						        <bf:role>
						          <bf:Role>
						            <rdfs:label>singer.</rdfs:label>
						          </bf:Role>
						        </bf:role>
						      </bf:Contribution>
						    </bf:contribution><bf:contribution>
						      <bf:Contribution>
						        <bf:agent>
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n79146137">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
						            <bflc:name00MatchKey>Albrecht, Gerd, 1935-2014,</bflc:name00MatchKey>
						            <bflc:name00MarcKey>7001 $aAlbrecht, Gerd,$d1935-2014,$econductor.</bflc:name00MarcKey>
						            <rdfs:label>Albrecht, Gerd, 1935-2014,</rdfs:label>
						          </bf:Agent>
						        </bf:agent>
						        <bf:role>
						          <bf:Role>
						            <rdfs:label>conductor.</rdfs:label>
						          </bf:Role>
						        </bf:role>
						      </bf:Contribution>
						    </bf:contribution><bflc:relationship>
						      <bflc:Relationship>
						        <bflc:relation>
						          <bflc:Relation rdf:about="https://id.loc.gov/entities/relationships/containerof">
						            <rdfs:label>Container of (work)</rdfs:label>
						          </bflc:Relation>
						        </bflc:relation>
						        <bf:relatedTo rdf:resource="http://bibframe.example.org/5634303#Work700-63"/>
						      </bflc:Relationship>
						    </bflc:relationship><bflc:relationship>
						      <bflc:Relationship>
						        <bflc:relation>
						          <bflc:Relation rdf:about="https://id.loc.gov/entities/relationships/containerof">
						            <rdfs:label>Container of (work)</rdfs:label>
						          </bflc:Relation>
						        </bflc:relation>
						        <bf:relatedTo rdf:resource="http://bibframe.example.org/5634303#Work700-64"/>
						      </bflc:Relationship>
						    </bflc:relationship><bflc:relationship>
						      <bflc:Relationship>
						        <bflc:relation>
						          <bflc:Relation rdf:about="https://id.loc.gov/entities/relationships/containerof">
						            <rdfs:label>Container of (work)</rdfs:label>
						          </bflc:Relation>
						        </bflc:relation>
						        <bf:relatedTo rdf:resource="http://bibframe.example.org/5634303#Work700-65"/>
						      </bflc:Relationship>
						    </bflc:relationship><bflc:relationship>
						      <bflc:Relationship>
						        <bflc:relation>
						          <bflc:Relation rdf:about="https://id.loc.gov/entities/relationships/containerof">
						            <rdfs:label>Container of (work)</rdfs:label>
						          </bflc:Relation>
						        </bflc:relation>
						        <bf:relatedTo rdf:resource="http://bibframe.example.org/5634303#Work700-66"/>
						      </bflc:Relationship>
						    </bflc:relationship><bf:contribution>
						      <bf:Contribution>
						        <bf:agent>
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n86133933">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Organization"/>
						            <bflc:name10MatchKey>Philharmonisches Staatsorchester Hamburg,</bflc:name10MatchKey>
						            <bflc:name10MarcKey>7102 $aPhilharmonisches Staatsorchester Hamburg,$einstrumentalist.</bflc:name10MarcKey>
						            <rdfs:label>Philharmonisches Staatsorchester Hamburg,</rdfs:label>
						          </bf:Agent>
						        </bf:agent>
						        <bf:role>
						          <bf:Role>
						            <rdfs:label>instrumentalist.</rdfs:label>
						          </bf:Role>
						        </bf:role>
						      </bf:Contribution>
						    </bf:contribution><bf:contribution>
						      <bf:Contribution>
						        <bf:agent>
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n2021021421">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Organization"/>
						            <bflc:name10MatchKey>Hauptkirche St. Michaelis (Hamburg, Germany). Chor.</bflc:name10MatchKey>
						            <bflc:name10MarcKey>7102 $aHauptkirche St. Michaelis (Hamburg, Germany).$bChor.$4prf</bflc:name10MarcKey>
						            <rdfs:label>Hauptkirche St. Michaelis (Hamburg, Germany). Chor.</rdfs:label>
						          </bf:Agent>
						        </bf:agent>
						        <bf:role>
						          <bf:Role rdf:about="http://id.loc.gov/vocabulary/relators/prf"/>
						        </bf:role>
						      </bf:Contribution>
						    </bf:contribution><bf:contribution>
						      <bf:Contribution>
						        <bf:agent>
						          <bf:Agent rdf:about="https://id.loc.gov/authorities/names/n85031418">
						            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Organization"/>
						            <bflc:name10MatchKey>Monteverdi-Chor Hamburg,</bflc:name10MatchKey>
						            <bflc:name10MarcKey>7102 $aMonteverdi-Chor Hamburg,$esinger.</bflc:name10MarcKey>
						            <rdfs:label>Monteverdi-Chor Hamburg,</rdfs:label>
						          </bf:Agent>
						        </bf:agent>
						        <bf:role>
						          <bf:Role>
						            <rdfs:label>singer.</rdfs:label>
						          </bf:Role>
						        </bf:role>
						      </bf:Contribution>
						    </bf:contribution><bf:relatedTo rdf:resource="http://id.loc.gov/resources/works/n2021021408"/><bf:relatedTo rdf:resource="http://id.loc.gov/resources/works/c012289535"/><bf:relatedTo rdf:resource="http://id.loc.gov/resources/works/no98013521"/><bf:relatedTo rdf:resource="http://id.loc.gov/resources/works/c012289535"/><bf:relatedTo rdf:resource="http://id.loc.gov/resources/works/n82001901"/><bf:relatedTo rdf:resource="http://id.loc.gov/resources/works/c012289535"/><bf:relatedTo rdf:resource="http://id.loc.gov/resources/works/no97073651"/><bf:relatedTo rdf:resource="http://id.loc.gov/resources/works/c012289535"/><bf:relatedTo rdf:resource="http://id.loc.gov/resources/works/c012289535"/></bf:Work><bf:Item rdf:about="http://id.loc.gov/resources/items/c0056343030001-1"><bf:heldBy>
						          <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
						            <bf:code>DLC</bf:code>
						          </bf:Agent>
						        </bf:heldBy><bf:shelfMark>
						          <bf:ShelfMark>
						            <rdfs:label>SDD 43569</rdfs:label>
						            <bf:assigner>
						              <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc"/>
						            </bf:assigner>
						          </bf:ShelfMark>
						        </bf:shelfMark><bflc:derivedFrom rdf:resource="http://id.loc.gov/resources/bibs/5634303"/><bf:itemOf rdf:resource="http://id.loc.gov/resources/instances/c0056343030001"/></bf:Item></rdf:RDF>
`,

	// testXmlInstance : `<?xml version="1.0" encoding="UTF-8"?>
	// 					<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	// 					  <bf:Instance rdf:about="http://id.loc.gov/resources/instances/c0010058400001" xmlns:bf="http://id.loc.gov/ontologies/bibframe/">
	// 					    <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Print"/>
	// 					    <bf:issuance>
	// 					      <bf:Issuance rdf:about="http://id.loc.gov/vocabulary/issuance/mono"/>
	// 					    </bf:issuance>
	// 					    <bf:provisionActivity>
	// 					      <bf:ProvisionActivity>
	// 					        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Publication"/>
	// 					        <bf:date rdf:datatype="http://id.loc.gov/datatypes/edtf">1988</bf:date>
	// 					        <bf:place>
	// 					          <bf:Place rdf:about="http://id.loc.gov/vocabulary/countries/nyu"/>
	// 					        </bf:place>
	// 					      </bf:ProvisionActivity>
	// 					    </bf:provisionActivity>
	// 					    <bf:identifiedBy>
	// 					      <bf:Lccn>
	// 					        <rdf:value>87023915 </rdf:value>
	// 					      </bf:Lccn>
	// 					    </bf:identifiedBy>
	// 					    <bf:acquisitionTerms>$24.50</bf:acquisitionTerms>
	// 					    <bf:identifiedBy>
	// 					      <bf:Isbn>
	// 					        <rdf:value>1555460348</rdf:value>
	// 					        <bf:qualifier>alk. paper</bf:qualifier>
	// 					      </bf:Isbn>
	// 					    </bf:identifiedBy>
	// 					    <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Virginia Woolf's To the lighthouse</rdfs:label>
	// 					    <bf:title>
	// 					      <bf:Title>
	// 					        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Virginia Woolf's To the lighthouse</rdfs:label>
	// 					        <bflc:titleSortKey xmlns:bflc="http://id.loc.gov/ontologies/bflc/">Virginia Woolf's To the lighthouse</bflc:titleSortKey>
	// 					        <bf:mainTitle>Virginia Woolf's To the lighthouse</bf:mainTitle>
	// 					      </bf:Title>
	// 					    </bf:title>
	// 					    <bf:responsibilityStatement>edited and with an introduction by Harold Bloom</bf:responsibilityStatement>
	// 					    <bf:provisionActivity>
	// 					      <bf:ProvisionActivity>
	// 					        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Publication"/>
	// 					        <bf:place>
	// 					          <bf:Place>
	// 					            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">New York</rdfs:label>
	// 					          </bf:Place>
	// 					        </bf:place>
	// 					        <bf:agent>
	// 					          <bf:Agent rdf:about="https://id.loc.gov/entities/providers/c1d5943c1d6758970d330c5ac19b7955">
	// 					            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Chelsea House</rdfs:label>
	// 					          </bf:Agent>
	// 					        </bf:agent>
	// 					        <bf:date>1988</bf:date>
	// 					      </bf:ProvisionActivity>
	// 					    </bf:provisionActivity>
	// 					    <bf:provisionActivityStatement>New York : Chelsea House, 1988.</bf:provisionActivityStatement>
	// 					    <bf:extent>
	// 					      <bf:Extent>
	// 					        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">vii, 164 p.</rdfs:label>
	// 					      </bf:Extent>
	// 					    </bf:extent>
	// 					    <bf:dimensions>24 cm.</bf:dimensions>
	// 					    <bf:seriesStatement>Modern critical interpretations</bf:seriesStatement>
	// 					    <bf:note>
	// 					      <bf:Note>
	// 					        <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">Includes index.</rdfs:label>
	// 					      </bf:Note>
	// 					    </bf:note>
	// 					    <bf:instanceOf rdf:resource="http://id.loc.gov/resources/works/c001005840"/>
	// 					    <bf:adminMetadata>
	// 					      <bf:AdminMetadata>
	// 					        <bf:generationProcess>
	// 					          <bf:GenerationProcess>
	// 					            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">DLC marc2bibframe2 v1.6.0-SNAPSHOT</rdfs:label>
	// 					            <bf:generationDate rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2020-06-26T05:25:04-04:00</bf:generationDate>
	// 					          </bf:GenerationProcess>
	// 					        </bf:generationProcess>
	// 					        <bf:status>
	// 					          <bf:Status>
	// 					            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">increase in encoding level from prepublication</rdfs:label>
	// 					            <bf:code>p</bf:code>
	// 					          </bf:Status>
	// 					        </bf:status>
	// 					        <bflc:encodingLevel xmlns:bflc="http://id.loc.gov/ontologies/bflc/">
	// 					          <bflc:EncodingLevel rdf:about="http://id.loc.gov/vocabulary/menclvl/f">
	// 					            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">full</rdfs:label>
	// 					          </bflc:EncodingLevel>
	// 					        </bflc:encodingLevel>
	// 					        <bf:descriptionConventions>
	// 					          <bf:DescriptionConventions rdf:about="http://id.loc.gov/vocabulary/descriptionConventions/aacr">
	// 					            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">aacr</rdfs:label>
	// 					          </bf:DescriptionConventions>
	// 					        </bf:descriptionConventions>
	// 					        <bf:identifiedBy>
	// 					          <bf:Local>
	// 					            <rdf:value>1005840</rdf:value>
	// 					            <bf:assigner>
	// 					              <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc"/>
	// 					            </bf:assigner>
	// 					          </bf:Local>
	// 					        </bf:identifiedBy>
	// 					        <bf:changeDate rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">1988-07-25T00:00:00</bf:changeDate>
	// 					        <bf:creationDate rdf:datatype="http://www.w3.org/2001/XMLSchema#date">1987-08-13</bf:creationDate>
	// 					        <bf:source>
	// 					          <bf:Source rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
	// 					            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Agent"/>
	// 					            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">DLC</rdfs:label>
	// 					          </bf:Source>
	// 					        </bf:source>
	// 					        <bf:source>
	// 					          <bf:Source rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
	// 					            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Agent"/>
	// 					            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">DLC</rdfs:label>
	// 					          </bf:Source>
	// 					        </bf:source>
	// 					        <bf:descriptionModifier>
	// 					          <bf:Agent rdf:about="http://id.loc.gov/vocabulary/organizations/dlc">
	// 					            <rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">DLC</rdfs:label>
	// 					          </bf:Agent>
	// 					        </bf:descriptionModifier>
	// 					      </bf:AdminMetadata>
	// 					    </bf:adminMetadata>
	// 					  </bf:Instance>
	// 					</rdf:RDF>`,


	testXmlWork: ``




}


export default parseBfdb;