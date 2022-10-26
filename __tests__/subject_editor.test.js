// const lookupUtil = require('../src/lib/lookupUtil.js');
import lookupUtil from '../src/lib/lookupUtil.js'
import 'isomorphic-fetch'

test('temp', () => {
  expect(1).toBe(1)
})

// test('complexAuthorized', async () => {
//   // There is an authorized complex heading
//   let complex = await lookupUtil.subjectLinkModeResolveLCSH('$aeffective teaching$zunited States')
//   expect(complex.hit.uri).toBe('http://id.loc.gov/authorities/subjects/sh2008102486');
//   expect(complex.hit.heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#Topic');

// });

// test('preCoord', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aEffective teaching$zIndonesia$vCongresses')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/subjects/sh95003618');
//   expect(toTest.hit[1].uri).toBe('http://id.loc.gov/authorities/names/n80083633-781');
//   expect(toTest.hit[2].uri).toBe('http://id.loc.gov/authorities/subjects/sh99001533');
//   expect(toTest.hit[2].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#GenreForm');
// });

// test('indirectGeoPreCoord', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aEffective teaching$zIndonesia--Jakarta$vCongresses')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/subjects/sh95003618');
//   expect(toTest.hit[1].uri).toBe('http://id.loc.gov/authorities/names/n80073867-781');
//   expect(toTest.hit[2].uri).toBe('http://id.loc.gov/authorities/subjects/sh99001533');
//   expect(toTest.hit[2].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#GenreForm');
// });

// test('indirectGeoPreCoordLCSH', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aEffective teaching$zKorea (South)--Honam Region$vCongresses')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/subjects/sh95003618');
//   expect(toTest.hit[1].uri).toBe('http://id.loc.gov/authorities/subjects/sh87005734-781');
//   expect(toTest.hit[2].uri).toBe('http://id.loc.gov/authorities/subjects/sh99001533');
//   expect(toTest.hit[2].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#GenreForm');
// });





// test('GeoLCSHPreCoord', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aEffective teaching$zSepik River Valley (Indonesia and Papua New Guinea)$vCongresses')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/subjects/sh95003618');
//   expect(toTest.hit[1].uri).toBe('http://id.loc.gov/authorities/subjects/sh96001008-781');
//   expect(toTest.hit[2].uri).toBe('http://id.loc.gov/authorities/subjects/sh99001533');
//   expect(toTest.hit[2].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#GenreForm');
// });

// test('GeneralSubdivsionTopicalPreCoord', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aOlder people$xEducation$vPeriodicals.')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/subjects/sh85002087');
//   expect(toTest.hit[1].uri).toBe('http://id.loc.gov/authorities/subjects/sh99005758');
//   expect(toTest.hit[2].uri).toBe('http://id.loc.gov/authorities/subjects/sh99001647');
//   expect(toTest.hit[2].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#GenreForm');
// });
// // '‡aOlder people‡xEducation‡vPeriodicals.'


// test('TemporalAuthorizedComplex', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aCivilization, Medieval$y14th century.')
//   expect(toTest.hit.uri).toBe('http://id.loc.gov/authorities/subjects/sh85026466');
//   expect(toTest.hit.heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#Topic');
// });

// test('GeoTopicalPreCoord', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$a San Antonio (Tex.) $x History $y 18th century.')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/names/n79054641');
//   expect(toTest.hit[1].uri).toBe('http://id.loc.gov/authorities/subjects/sh99005024');
//   expect(toTest.hit[2].uri).toBe('http://id.loc.gov/authorities/subjects/sh2002012474');
//   expect(toTest.hit[0].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#Geographic');
// });


// test('PunctTestingLiteralTemporal', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH(' $a English language $y 1933-1945 $x Pronunciation')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/subjects/sh85043413');
//   expect(toTest.hit[1].literal).toBe(true);
//   expect(toTest.hit[2].uri).toBe('http://id.loc.gov/authorities/subjects/sh99005091');
//   expect(toTest.hit[1].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#Temporal');
// });

// test('BadWorkTitle', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aEducational opportunities of Greater Boston')
//   expect(toTest.hit[0].literal).toBe(true);
//   expect(toTest.hit[0].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#Topic');
// });

// test('PunctTopicalHistoryNotSubdivision', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aHistory.$zIndonesia$vCongresses')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/subjects/sh85061212');
//   expect(toTest.hit[1].uri).toBe('http://id.loc.gov/authorities/names/n80083633-781');
//   expect(toTest.hit[2].uri).toBe('http://id.loc.gov/authorities/subjects/sh99001533');
//   expect(toTest.hit[1].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#Geographic');
// });

// test('PerosnalNameAsTopic', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aWoolf, Virginia, 1882-1941$vPeriodicals')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/names/n79041870');
//   expect(toTest.hit[1].uri).toBe('http://id.loc.gov/authorities/subjects/sh99001647');
//   expect(toTest.hit[0].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#PersonalName');
// });


// test('TitleauthorityAsTopic', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aQuennell, Peter, 1905-1993. letter to Mrs. Virginia Woolf$vCommentaries')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/resources/works/10160872');
//   expect(toTest.hit[1].uri).toBe('http://id.loc.gov/authorities/subjects/sh99001404');
//   expect(toTest.hit[0].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#Topic');
// });


// test('Only Geographic', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aIndonesia')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/names/n80083633');
//   expect(toTest.hit[0].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#Geographic');
// });

// test('Only Coporate', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.subjectLinkModeResolveLCSH('$aIndonesia. Dewan Perwakilan Rakyat')
//   expect(toTest.hit[0].uri).toBe('http://id.loc.gov/authorities/names/n81132589');
//   expect(toTest.hit[0].heading.rdfType).toBe('http://www.loc.gov/mads/rdf/v1#CorporateName');
// });


// test('Test returnRDFType 1', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.returnRDFType('https://id.loc.gov/authorities/subjects/sh2002012478')
//   expect(toTest).toBe('http://www.loc.gov/mads/rdf/v1#Temporal');
// });

// test('Test returnRDFType 2', async () => {
//   // There is an authorized complex heading
//   let toTest = await lookupUtil.returnRDFType('https://id.loc.gov/authorities/names/n81132589')
//   expect(toTest).toBe('http://www.loc.gov/mads/rdf/v1#CorporateName');
// });
