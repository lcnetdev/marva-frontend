// const lookupUtil = require('../src/lib/lookupUtil.js');
import parseProfile from '../src/lib/parseProfile.js'
import 'isomorphic-fetch'

let profile = {
    "eId": "e6969420",
    "id": "Monograph (Non-Latin)",
    "procInfo": "create work",
    "rt": {
        "lc:RT:bf2:MonographNR:Instance": {
            "URI": "http://id.loc.gov/resources/instances/14be66eb-bff0-4916-90e9-f7c9ee8cef40",
            "hasLiteralLangFields": true,
            "instanceOf": "http://id.loc.gov/resources/works/14be66eb-bff0-4916-90e9-f7c9ee8cef40",
            "pt": {
                "http://id.loc.gov/ontologies/bibframe/title|Title Information": {
                    "@guid": "dqLTaVrA57YREBXGqVdZmg",
                    "canBeHidden": false,
                    "mandatory": "true",
                    "parent": "lc:profile:bf2:MonographNRlc:RT:bf2:MonographNR:Instanceeeb006c1-2f72-43e3-a40a-fbadc6e538cf",
                    "parentId": "lc:RT:bf2:MonographNR:Instance",
                    "propertyLabel": "Title Information",
                    "propertyURI": "http://id.loc.gov/ontologies/bibframe/title",
                    "repeatable": "true",
                    "resourceTemplates": [],
                    "type": "resource",
                    "userValue": {
                        "@root": "http://id.loc.gov/ontologies/bibframe/title"
                    },
                    "valueConstraint": {
                        "defaults": [],
                        "useValuesFrom": [],
                        "valueDataType": {},
                        "valueTemplateRefs": [
                            "lc:RT:bf2:MonographNR:InstTitle",
                            "lc:RT:bf2:MonographNR:VarTitle"
                        ]
                    }
                }
            },
            "ptOrder": [
                "http://id.loc.gov/ontologies/bibframe/title|Title Information"
            ]
        },
        "lc:RT:bf2:MonographNR:Work": {
            "URI": "http://id.loc.gov/resources/works/14be66eb-bff0-4916-90e9-f7c9ee8cef40",
            "pt": {
                "http://id.loc.gov/ontologies/bibframe/originDate|Date of Work": {
                    "@guid": "bKE9sMiGN9b2FCGxo3m5qH",
                    "canBeHidden": false,
                    "mandatory": "false",
                    "parent": "lc:profile:bf2:MonographNRlc:RT:bf2:MonographNR:Workeeb006c1-2f72-43e3-a40a-fbadc6e538cf",
                    "parentId": "lc:RT:bf2:MonographNR:Work",
                    "propertyLabel": "Date of Work",
                    "propertyURI": "http://id.loc.gov/ontologies/bibframe/originDate",
                    "remark": "http://access.rdatoolkit.org/6.4.html",
                    "repeatable": "true",
                    "resourceTemplates": [],
                    "type": "literal",
                    "userValue": {
                        "@root": "http://id.loc.gov/ontologies/bibframe/originDate"
                    },
                    "valueConstraint": {
                        "defaults": [],
                        "useValuesFrom": [],
                        "valueDataType": {},
                        "valueTemplateRefs": []
                    }
                },
                "http://id.loc.gov/ontologies/bflc/relationship|Series Hub": {
                    "@guid": "v36a4saACyCEc5WCeM7szj",
                    "canBeHidden": false,
                    "mandatory": "false",
                    "parent": "lc:profile:bf2:Monographlc:RT:bf2:Monograph:Workdaaecaf9-6802-4881-9fd3-f8cb900ed605",
                    "parentId": "lc:RT:bf2:Monograph:Work",
                    "propertyLabel": "Series Hub",
                    "propertyURI": "http://id.loc.gov/ontologies/bflc/relationship",
                    "remark": "",
                    "repeatable": "true",
                    "resourceTemplates": [],
                    "type": "resource",
                    "userValue": {
                        "@root": "http://id.loc.gov/ontologies/bflc/relationship",
                    },
                    "valueConstraint": {
                        "defaults": [],
                        "useValuesFrom": [],
                        "valueDataType": {},
                        "valueTemplateRefs": [
                            "lc:RT:bf2:SeriesHub2"
                        ]
                    }
                }


            },
            "ptOrder": [
                "http://id.loc.gov/ontologies/bibframe/originDate|Date of Work",
                "http://id.loc.gov/ontologies/bflc/relationship|Series Hub"
            ]
        }
    },
    "rtOrder": [
        "lc:RT:bf2:MonographNR:Work",
        "lc:RT:bf2:MonographNR:Instance"
    ],
    "status": "unposted",
    "user": "MATTMATT"
}



test('Add and edit 1 level deep literal value', async () => {
	let testProfile = JSON.parse(JSON.stringify(profile))

	let results = await parseProfile.setValueLiteral(testProfile, 'bKE9sMiGN9b2FCGxo3m5qH', null, 1999, [{level:0, propertyURI:'http://id.loc.gov/ontologies/bibframe/originDate'}])

	let newVal = results.currentState.rt['lc:RT:bf2:MonographNR:Work'].pt['http://id.loc.gov/ontologies/bibframe/originDate|Date of Work']['userValue']

	let newGuid = results.newGuid

	expect(newVal['http://id.loc.gov/ontologies/bibframe/originDate'][0]['http://id.loc.gov/ontologies/bibframe/originDate']).toBe(1999)
	expect(newVal['http://id.loc.gov/ontologies/bibframe/originDate'][0]['@guid']).toBe(newGuid)

	// now try to edit it
	results = await parseProfile.setValueLiteral(results.currentState, 'bKE9sMiGN9b2FCGxo3m5qH', results.newGuid, 2022, [{level:0, propertyURI:'http://id.loc.gov/ontologies/bibframe/originDate'}])
	newVal = results.currentState.rt['lc:RT:bf2:MonographNR:Work'].pt['http://id.loc.gov/ontologies/bibframe/originDate|Date of Work']['userValue']

	expect(newVal['http://id.loc.gov/ontologies/bibframe/originDate'][0]['http://id.loc.gov/ontologies/bibframe/originDate']).toBe(2022)
	expect(newVal['http://id.loc.gov/ontologies/bibframe/originDate'][0]['@guid']).toBe(newGuid)


})

test('Add and edit 2 level deep literal value', async () => {
	let testProfile = JSON.parse(JSON.stringify(profile))

	let results = await parseProfile.setValueLiteral(testProfile, 'dqLTaVrA57YREBXGqVdZmg', null, "Test Title", [{level:0, propertyURI:'http://id.loc.gov/ontologies/bibframe/title'},{level:1, propertyURI:'http://id.loc.gov/ontologies/bibframe/mainTitle'}])

	let newVal = results.currentState.rt['lc:RT:bf2:MonographNR:Instance'].pt['http://id.loc.gov/ontologies/bibframe/title|Title Information']['userValue']

	let newGuid = results.newGuid

	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle']).toBe('Test Title')
	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][0]['@guid']).toBe(results.newGuid)

	// now try to edit it
	results = await parseProfile.setValueLiteral(results.currentState, 'dqLTaVrA57YREBXGqVdZmg', newGuid, 'Another One', [{level:0, propertyURI:'http://id.loc.gov/ontologies/bibframe/title'},{level:1, propertyURI:'http://id.loc.gov/ontologies/bibframe/mainTitle'}])
	newVal = results.currentState.rt['lc:RT:bf2:MonographNR:Instance'].pt['http://id.loc.gov/ontologies/bibframe/title|Title Information']['userValue']
	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle']).toBe('Another One')
	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][0]['@guid']).toBe(newGuid)
})

test('Add and edit 2 level deep multi literal values', async () => {

	let testProfile = JSON.parse(JSON.stringify(profile))

	let results = await parseProfile.setValueLiteral(testProfile, 'dqLTaVrA57YREBXGqVdZmg', null, "Test Title 1", [{level:0, propertyURI:'http://id.loc.gov/ontologies/bibframe/title'},{level:1, propertyURI:'http://id.loc.gov/ontologies/bibframe/mainTitle'}])
	let newGuid1 = results.newGuid

	results = await parseProfile.setValueLiteral(testProfile, 'dqLTaVrA57YREBXGqVdZmg', null, "Test Title 2", [{level:0, propertyURI:'http://id.loc.gov/ontologies/bibframe/title'},{level:1, propertyURI:'http://id.loc.gov/ontologies/bibframe/mainTitle'}])

	let newVal = results.currentState.rt['lc:RT:bf2:MonographNR:Instance'].pt['http://id.loc.gov/ontologies/bibframe/title|Title Information']['userValue']
	console.log(newVal)
	let newGuid2 = results.newGuid
	// add in the second literal val

	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle']).toBe('Test Title 1')
	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][0]['@guid']).toBe(newGuid1)

	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][1]['http://id.loc.gov/ontologies/bibframe/mainTitle']).toBe('Test Title 2')
	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][1]['@guid']).toBe(newGuid2)

	// now try to edit the second one
	results = await parseProfile.setValueLiteral(results.currentState, 'dqLTaVrA57YREBXGqVdZmg', newGuid2, 'Changed the second one :)', [{level:0, propertyURI:'http://id.loc.gov/ontologies/bibframe/title'},{level:1, propertyURI:'http://id.loc.gov/ontologies/bibframe/mainTitle'}])
	// newVal = results.currentState.rt['lc:RT:bf2:MonographNR:Instance'].pt['http://id.loc.gov/ontologies/bibframe/title|Title Information']['userValue']
	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][1]['http://id.loc.gov/ontologies/bibframe/mainTitle']).toBe('Changed the second one :)')
	expect(newVal['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][1]['@guid']).toBe(newGuid2)

})

test('Add and edit 3 level deep values', async () => {

    let testProfile = JSON.parse(JSON.stringify(profile))

    let results = await parseProfile.setValueLiteral(testProfile, 'v36a4saACyCEc5WCeM7szj', null, "Test Title", [{level:0, propertyURI:'http://id.loc.gov/ontologies/bflc/relationship'},{level:1, propertyURI:'http://id.loc.gov/ontologies/bibframe/relatedTo'},{level:2, propertyURI:'http://id.loc.gov/ontologies/bibframe/title'},{level:3, propertyURI:'http://id.loc.gov/ontologies/bibframe/mainTitle'}])
    console.log(results)
    let newVal = results.currentState.rt['lc:RT:bf2:MonographNR:Work'].pt['http://id.loc.gov/ontologies/bflc/relationship|Series Hub']['userValue']

    let newGuid = results.newGuid
    console.log(newVal)
    expect(newVal['http://id.loc.gov/ontologies/bflc/relationship'][0]['http://id.loc.gov/ontologies/bibframe/relatedTo'][0]['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle']).toBe('Test Title')


    //now try to edit it
    results = await parseProfile.setValueLiteral(results.currentState, 'v36a4saACyCEc5WCeM7szj', newGuid, 'Another One', [{level:0, propertyURI:'http://id.loc.gov/ontologies/bflc/relationship'},{level:1, propertyURI:'http://id.loc.gov/ontologies/bibframe/relatedTo'},{level:2, propertyURI:'http://id.loc.gov/ontologies/bibframe/title'},{level:3, propertyURI:'http://id.loc.gov/ontologies/bibframe/mainTitle'}])
    newVal = results.currentState.rt['lc:RT:bf2:MonographNR:Work'].pt['http://id.loc.gov/ontologies/bflc/relationship|Series Hub']['userValue']
    expect(newVal['http://id.loc.gov/ontologies/bflc/relationship'][0]['http://id.loc.gov/ontologies/bibframe/relatedTo'][0]['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle']).toBe('Another One')
    expect(newVal['http://id.loc.gov/ontologies/bflc/relationship'][0]['http://id.loc.gov/ontologies/bibframe/relatedTo'][0]['http://id.loc.gov/ontologies/bibframe/title'][0]['http://id.loc.gov/ontologies/bibframe/mainTitle'][0]['@guid']).toBe(newGuid)

})




test('temp', () => {
  expect(1).toBe(1)
})

