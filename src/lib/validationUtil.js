const validationUtil = {
    
    headingValid: '&#xe820;',
    headingPartiallyValid: '&#xe821;',
    headingInvalid: '&#xe822;',
    headingNotChecked: '&#xe823;',
    
    validateHeading: async function(userData, suppliedScheme = "") {

        // What will a bnode be here?
        if (userData["http://id.loc.gov/ontologies/bibframe/agent"] !== undefined) {
            // We have a contribution resource.
            // Got to get agent uri, if there is one.
            userData = userData["http://id.loc.gov/ontologies/bibframe/agent"][0];
        }
        
        let uri = userData["@id"];

        if (!uri && userData.hintUri && userData[userData.hintUri]){
            userData = userData[userData.hintUri][0]; 
            uri = userData["@id"];          
        }

        if (uri === undefined || uri === null || (uri && uri.indexOf('example.org/') > 0) || (uri && uri.indexOf('/REPLACE/') > 0)) {
                
                
            // We either don't have a URI or we have a dummy URI; Let's see if we can find it.
            var aLabel = this.getLabel(userData);
            if (!aLabel) {
                console.warn("Unable to locate label for validation lookup!");
                return this.headingNotChecked;
            }
            //console.log("Found label: " + aLabel);
            
            var scheme = suppliedScheme;
            if (scheme == "") {
                scheme = this._getScheme(userData);
            }
            if (!scheme) {
                console.warn("Unable to locate scheme for validation lookup!");
                return this.headingNotChecked;
            }
            // console.log("Found scheme: " + scheme);
            
            if (scheme.indexOf('id.loc.gov') > 0) {
                // We have an ID scheme, so we know how 
                // to validate it.
                var response = await this._doLabelLookup(aLabel, scheme);
                var lookupStatus = response.status;
                console.log('response',response)
                console.log('lookupStatus',lookupStatus)
                if (lookupStatus == 200) {
                    var newuri = response.x_uri;
                    userData["@id"] = newuri;
                    
                    if (response.foundLabel != aLabel) {
                        this._setLabel(userData, response.foundLabel);
                    }
                    
                    return this.headingValid; 
                } else if (lookupStatus == 404) {
                    // OK, we got here.  
                    // If this is a ComplexSubject, i.e. multiple components,
                    // we can check for a partial validation.
                    // We could test the type or we could test the number of actual
                    // components. Going to do the latter now since I'm not sure 
                    // we can always trust the type.  Besides, componentList 
                    // must exist any way for this code to process.
                    if ( 
                        userData["http://www.loc.gov/mads/rdf/v1#componentList"] !== undefined && 
                        userData["http://www.loc.gov/mads/rdf/v1#componentList"].length > 1
                        ) {
                            // We're off to the races...
                            userData = userData["http://www.loc.gov/mads/rdf/v1#componentList"][0]
                            //console.log(userData);
                            var componentResult = await this.validateHeading(userData, scheme);
                            if (componentResult == this.headingValid) {
                                return this.headingPartiallyValid;
                            }
                        }
                    return this.headingInvalid;
                } else {
                    console.warn("Validation lookup returned unexpected response: " + lookupStatus);
                    return this.headingInvalid;
                }
            } else {
                console.warn("Scheme for validation not ID.LOC.GOV: " + scheme);
                return this.headingNotChecked;
            }
            
        } else if (uri.indexOf('/resources/works/') > 0 || uri.indexOf('/resources/instances/') > 0 || uri.indexOf('/resources/items/') > 0 ) {
            // dont validate works instances or items
            return this.headingNotChecked;
        } else if (uri.indexOf('id.loc.gov/') > 0) {
            // We have an ID URI.  We're done here, let's go home.
            return this.headingValid;
        } else {
            // URI was not an ID URI and it wasn't a dummy URI 
            // so let's leave it alone.
            return this.headingNotChecked;
        }

    },
    
    _doLabelLookup: async function(label, scheme) {
        const fetchInit =  {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer',
            headers: { "Accept": "application/ld+json" }
        };
        
        var url = scheme + "/label/" + encodeURIComponent(label);
        url = url.replace(/^(http:)/,"https:");
        url = url.replace('//id.loc.gov/','//preprod.id.loc.gov/');

        if (window.location.href.includes('//localhost')){
            url = url.replace('//preprod.id.loc.gov/','//id.loc.gov/');
        }
        console.log('url',url)
        //try {
            const response = await fetch(url, fetchInit);
            if (response.status == 200) {
                var x_uri = response.headers.get("x-uri");
                
                // Obviously this needs to be fixed in Id, but for now....
                x_uri = x_uri.replace('preprod-8080.', '');
                x_uri = x_uri.replace('preprod-8288.', '');
                x_uri = x_uri.replace('preprod.', '');
                response.x_uri = x_uri;
                
                var found_label = response.headers.get("x-preflabel");
                var graph = await response.json();
                
                /*
                    Need to do this because HTTP headers are decoded
                    as ISO-8859-1, not UTF8. While there may be a large
                    number of utilities that regardless support UTF8
                    headers, browsers - Chrome and Firefox certainly - 
                    strictly interpret the HTTP spec and expect these 
                    values to be ISO-8859-1.
                */
                graph.forEach(r => {
                    if (r["@id"] !== undefined && r["@id"] == x_uri) {
                        found_label = this._getLabelFromJSONLD(r);
                        if (found_label !== false) {
                            response.foundLabel = found_label;
                            return response;
                        }
                    }
                });
                return response;
            }
            return response;
        //} catch(err) {
            // There was an error, or just a 404, which is yet another 
            // fix for ID.
        //    console.warn("Label lookup failed for " + url);
        //    return { status: 404 }
        //}
    },
    
    getLabel: function(userData) {
        
        const labelProps = [
                "http://www.loc.gov/mads/rdf/v1#authoritativeLabel",
                "http://www.w3.org/2000/01/rdf-schema#label"
            ];
        for (var p of labelProps) {
            if (userData[p] !== undefined) {
                
                return userData[p][0][p];
            }
        }

        // if we got here it is a slightly more complicated component, with multiple complex lookups
        // we need to use the hint to get what we want
        if (userData.hintUri && userData[userData.hintUri] && userData[userData.hintUri][0]){
            userData = userData[userData.hintUri][0]
            for (var p2 of labelProps) {
                if (userData[p2] !== undefined) {
                    
                    return userData[p2][0][p2];
                }
            }

        }

        return false;
    },
    
    _getLabelFromJSONLD: function(resource) {
        const labelProps = [
                "http://www.loc.gov/mads/rdf/v1#authoritativeLabel",
                "http://www.w3.org/2000/01/rdf-schema#label"
            ];
        for (var p of labelProps) {
            if (resource[p] !== undefined) {
                return resource[p][0]["@value"];
            }
        }
        return false;
    },
    
    _getScheme: function(userData) {
        // This is going to be a nightmare.
        
        /* 
            Let's see if we can identify a scheme.  If a scheme is 
            in the data, then we can be certain we're looking 
            in the right place.
        */
        if (userData["http://www.loc.gov/mads/rdf/v1#isMemberOfMADSScheme"] !== undefined) {
            var foundSchemes = [];
            userData["http://www.loc.gov/mads/rdf/v1#isMemberOfMADSScheme"].forEach( (s) => {
                foundSchemes.push(s["@id"]);
            });
            if ( foundSchemes.includes("http://id.loc.gov/authorities/childrensSubjects") ) {
                // We have to check this one first because there's probably a second 
                // scheme declaration for LCSH General, but we need to search
                // LCSHJ.
                return "http://id.loc.gov/authorities/childrensSubjects";
            } else if (foundSchemes.length > 0) {
                return foundSchemes[0];
            }
        }
        
        /*
            Well, we didn't find a handy scheme declaration.  So now we
            have to deal with the horror that is bf:Source
        */
        if (userData["http://id.loc.gov/ontologies/bibframe/source"] !== undefined) {
            var source = userData["http://id.loc.gov/ontologies/bibframe/source"][0];
            // Does source have an ID from ID?  That would make this much easier.
            if (
                source["@id"] !== undefined && 
                source["@id"].indexOf('id.loc.gov/') > 0 && 
                source["@id"].indexOf('id.loc.gov/vocabulary') === -1 
                ) {
                return source["@id"];
            } else {
                var code = false;
                if (source["http://id.loc.gov/ontologies/bibframe/code"] !== undefined) {
                    code = source["http://id.loc.gov/ontologies/bibframe/code"][0]["http://id.loc.gov/ontologies/bibframe/code"];
                }
                if (code) {
                    const codeSchemeMap = {
                        "lcac": "http://id.loc.gov/authorities/childrensSubjects",
                        "lcshac": "http://id.loc.gov/authorities/childrensSubjects", // Yep, we managed to use the wrong code in our conversion.
                        "lcsh": "http://id.loc.gov/authorities/subjects",
                        "lcnaf": "http://id.loc.gov/authorities/names",
                        "lctgm": "http://id.loc.gov/vocabulary/graphicMaterials",
                        "gmgpc": "http://id.loc.gov/vocabulary/graphicMaterials"
                    }
                    if (codeSchemeMap[code] !== undefined) {
                        return codeSchemeMap[code];
                    }
                }
            }
        }
        
        // So much for indicating from which scheme the term/entity comes.
        // If it is a Person, or the like, we'll look it up in LCNAF.
        var nameTypes = [
                "http://id.loc.gov/ontologies/bibframe/Person",
                "http://id.loc.gov/ontologies/bibframe/Organization",
                "http://id.loc.gov/ontologies/bibframe/Family",
                "http://id.loc.gov/ontologies/bibframe/Jurisdiction",
                "http://id.loc.gov/ontologies/bibframe/Meeting"
            ];
        if (userData["@type"] !== undefined && nameTypes.includes(userData["@type"])) {
            return "http://id.loc.gov/authorities/names";
        }
        
        // Alas...
        return false;
    },
    
    getValidationMessage: function(validationStatus) {
        if (this.headingValid == validationStatus) {
            return "Heading is valid";
        } else if (this.headingPartiallyValid == validationStatus) {
            return "Partial heading validation";
        } else if (this.headingInvalid == validationStatus) {
            return "Invalid heading!";
        } else if (this.headingNotChecked == validationStatus) {
            return "Heading not checked";
        } else {
            return ""
        }
    },
    
    _setLabel: function(userData, label) {
        const labelProps = [
                "http://www.loc.gov/mads/rdf/v1#authoritativeLabel",
                "http://www.w3.org/2000/01/rdf-schema#label"
            ];
        for (var p of labelProps) {
            if (userData[p] !== undefined) {
                userData[p][0][p] = label;
            }
        }
        return userData;
    }

};

export default validationUtil;