
import store from "../store";


const uiUtils = {

    globalMoveDown() {

      if (store.state.disableMacroKeyNav){
        return false
      }

      var list = document.getElementsByClassName('selectable-input')

      if (store.state.workingOnMiniProfile){
        list = document.getElementsByClassName('selectable-input-mini')
      }
      console.log(list)
      
      let activeInputIndex = -1
      for (let i = 0; i < list.length; i++) {
        if (list[i].id == this.activeInput){
          activeInputIndex = i
        }
      }
      if (activeInputIndex != -1){
        // see if there is a next input
        if (list[activeInputIndex+1]){
          list[activeInputIndex+1].focus()
        }
      }
    },
    globalMoveUp() {
      if (store.state.disableMacroKeyNav){
        return false
      }        
      var list = document.getElementsByClassName('selectable-input')
      if (store.state.workingOnMiniProfile){
        list = document.getElementsByClassName('selectable-input-mini')
      }

      let activeInputIndex = -1
      for (let i = 0; i < list.length; i++) {
        if (list[i].id == this.activeInput){
          activeInputIndex = i
        }
      }
      console.log("activeInputIndex===",activeInputIndex,list[activeInputIndex-1])
      if (activeInputIndex != -1){
        // see if there is a next input
        if (list[activeInputIndex-1]){
          list[activeInputIndex-1].focus()
        }
      }

      
    },


    // when they hit pageup/down just do it 5 times
    globalMovePageDown(event) {
        this.moveDown()
        this.moveDown()
        this.moveDown()
        this.moveDown()
        this.moveDown()
        event.event.preventDefault()
        return false
    },
    globalMovePageUp(event) {
        this.moveUp()
        this.moveUp()
        this.moveUp()
        this.moveUp()
        this.moveUp()
        event.event.preventDefault()
        return false
    },

    focusCurrentInput() {

      var list = document.getElementsByClassName('selectable-input')
      
      for (let i = 0; i < list.length; i++) {

        // the relace here is removing complex lookup modal window suffixes
        if (list[i].id == this.activeInput || list[i].id == this.activeInput.replace('switch','') || list[i].id == this.activeInput.replace('search','')  ){
          
          list[i].focus()
        }
      }



    },


    focusSidebars(){


      window.setTimeout(()=>{


        if (document.getElementsByClassName('left-menu-list-item-active').length==0){
          return false
        }

        // scroll those elements into view, the left and right
        document.getElementsByClassName('left-menu-list-item-active')[0].scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})

        // not sure why, sometimes it doesn't tirgger
        // the class exists and it finds it in the dom but the above scroll doesn't work, sometimes it does
        // so wait a moment longer and set it again to make sure
        window.setTimeout(function() {
          document.getElementsByClassName('left-menu-list-item-active')[0].scrollIntoView({block: "center"})
        }, 500);
        
        if (document.getElementsByClassName('opac-field-active').length>0){
          
          document.getElementsByClassName('opac-field-active')[0].scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
          window.setTimeout(function() {
            document.getElementsByClassName('opac-field-active')[0].scrollIntoView({block: "center"})
          }, 500);

        }


      },100)


    },

    returnAuthIcon(rdfType){

        const iconPersonal = '&#xe800;'
        const iconCoporate = '&#xe801;'
        const iconTitle = '&#xe802;'
        const iconNameTitle = '&#xe800; + &#xe802;'
        const iconConference = '&#xe803;'
        const iconGeographic = '&#xe805;'
        const iconGenre = '&#xe806;'
        const iconSubjectComplex = '&#xe807;'
        const iconSubjectTopic = '&#xe808;'
        


        
        if (rdfType && typeof rdfType === 'string'){

          rdfType = rdfType.replace('http://www.loc.gov/mads/rdf/v1#','')

          if (rdfType == 'PersonalName') return iconPersonal
          if (rdfType == 'CorporateName') return iconCoporate
          if (rdfType == 'NameTitle') return iconNameTitle
          if (rdfType == 'Title') return iconTitle
          if (rdfType == 'ConferenceName') return iconConference
          if (rdfType == 'Geographic') return iconGeographic
          if (rdfType == 'GenreForm') return iconGenre
          if (rdfType == 'ComplexSubject') return iconSubjectComplex
          if (rdfType == 'Topic') return iconSubjectTopic


          if (rdfType == 'http://id.loc.gov/ontologies/bibframe/Person') return iconPersonal
          if (rdfType == 'http://id.loc.gov/ontologies/bibframe/Place') return iconGeographic
          if (rdfType == 'http://id.loc.gov/ontologies/bibframe/Topic') return iconSubjectTopic
          if (rdfType == 'http://id.loc.gov/ontologies/bibframe/Organization') return iconCoporate




          // if (result.label == 'xxxxxx') return iconPersonal
          // if (result.label == 'xxxxxx') return iconPersonal


        }


        return '&nbsp;'


    },






    dupeProperty(){
        

        if (document.getElementsByClassName('left-menu-list-item-active').length>0){
          document.getElementsByClassName('left-menu-list-item-active')[0].getElementsByClassName('left-menu-button-dupe-blank')[0].click()
        }        


        // let el = document.getElementById(this.activeInput).parentElement
        // while (el.classList.contains('component') === false){
        //     el=el.parentElement
        // }

        // el.getElementsByClassName('property-duplicate')[0].click()
        
    },


    // keep a counter to make a unique ID for each uri+label combo, this is just to get a persistent ID
    assignID(structure){
        let key = `${structure.propertyURI}|${structure.propertyLabel}`
        if (!store.state.activeProfileIdCounter[key]){
            store.state.activeProfileIdCounter[key] = 0
        }
        store.state.activeProfileIdCounter[key]++
        return `${structure.propertyURI}|${structure.propertyLabel}-${store.state.activeProfileIdCounter[key]}`
    },


    renderBorders(refresh){
        setTimeout(() => { // setTimeout to put this into event queue
          var divList = document.querySelectorAll('.component-container-input-container')
          for (let i = 0; i < divList.length; i++) {          
            let inputs = divList[i].getElementsByClassName('component-container-fake-input')
            
            if (refresh){
                for (let x = 0; x < inputs.length; x++) {
                    inputs[x].classList.add("no-upper-right-border-radius");
                    inputs[x].classList.add("no-upper-border");
                    inputs[x].classList.add("no-lower-right-border-radius");
                }
            }
            if (inputs.length>0){
              inputs[0].classList.remove("no-upper-right-border-radius");
              inputs[0].classList.remove("no-upper-border");
              inputs[inputs.length - 1].classList.remove("no-lower-right-border-radius");
            }
          }
        }, 0)
    },


    prettifyXmlJS(xml, tab = '\t', nl = '\n'){
      let formatted = '', indent = '';
      const nodes = xml.slice(1, -1).split(/>\s*</);
      if (nodes[0][0] == '?') formatted += '<' + nodes.shift() + '>' + nl;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node[0] == '/') indent = indent.slice(tab.length); // decrease indent
        formatted += indent + '<' + node + '>' + nl;
        if (node[0] != '/' && node[node.length - 1] != '/' && node.indexOf('</') == -1) indent += tab; // increase indent
      }
      return formatted;
    },

    prettifyXml(sourceXml){

        try{

          var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
          var xsltDoc = new DOMParser().parseFromString([
            // describes how we want to modify the XML - indent everything
              '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
              '  <xsl:strip-space elements="*"/>',
              '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
              '    <xsl:value-of select="normalize-space(.)"/>',
              '  </xsl:template>',
              '  <xsl:template match="node()|@*">',
              '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
              '  </xsl:template>',
              '  <xsl:output indent="yes"/>',
              '</xsl:stylesheet>',
          ].join('\n'), 'application/xml');

          var xsltProcessor = new XSLTProcessor();    
          xsltProcessor.importStylesheet(xsltDoc);
          var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
          var resultXml = new XMLSerializer().serializeToString(resultDoc);
          return resultXml;

        }catch{

          return "Because you are using Firefox or IE Edge I can't make this XML look nice, but here you go anyway:\n\n\n" + sourceXml

        }

    }    


}


export default uiUtils;