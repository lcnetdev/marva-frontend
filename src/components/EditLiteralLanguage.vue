<template>

  <div :class="['literal-lang-select-container', {'literal-lang-select-container-temp':false}]">



    <details style="margin:1em; background-color: whitesmoke;">

      <summary style="cursor: pointer;">Click to add more language/script options</summary>
      <div style="display: flex; margin: 0.5em;">

        <div style="flex: 1;">
          <div>Langauge</div>
          <select v-model="languageValue" size="10" style="width: 99%;">
            <option v-for="lang in languages" :key="lang.code">{{lang.name}}</option>
          </select>
        </div>

        <div style="flex: 1;">
          <div>Script</div>
          <select v-model="scriptValue" size="10" style="width: 99%;">
            <option v-for="script in scripts" :key="script.code">{{script.name}}</option>
          </select>
          

        </div>      
      </div>
      <button style="float: right;margin-right: 1em;" @click="addOption">Add</button>

      <div style="clear:both">
        <span style="font-weight: bold;">Current Options</span>
        <ul>
          <li v-for="(val,idx) in availableOptions" :key="idx">Lang: {{val.l.name}}, Script: {{val.s.name}}, Code: @{{val.l.code.toLowerCase()}}-<span v-if="val.s.code">{{val.s.code.toLowerCase()}}</span><span v-else>{{val.s.code2.toLowerCase()}}</span> <button style="font-size:0.75em" @click="removeLangOption(idx)">Remove</button> </li>

        </ul>


      </div>

    </details>

    <div style="text-align:right; padding-right: 10px;">
      <button @click="closeLitLang">Close</button>
    </div>
    <div v-if="Object.keys(literals).length==0" style="text-align: center;">
      <h3>No literals found on this record.</h3>
    </div>

    <div v-for="rtKey in Object.keys(literals)" :key="rtKey" >

      <div v-if="literals[rtKey].length>0" style="padding-left:1em">
        
        <span>{{rtKey.split(':')[rtKey.split(':').length-1]}}</span>

        <div v-for="val in literals[rtKey]" :key="val.guid" style="padding-left: 2em; margin: 0.5em; background-color: whitesmoke; padding: 1em;">
            
            <div>{{val.ptLabel}}:</div>
            <div style="padding-left: 1em;" :id="'literal-lang-'+val.guid">
              <div style="font-size:1.25em; font-weight:bold">{{val.value}}</div>
              <div>
                  
                  <!-- <span class="lang-option">Eng / Latin (Default)</span> -->

                  <span @click="selectLang(val,opt)"  :class="['lang-option',{'selected': (val.language===opt)}]" v-for="opt in Object.keys(availableOptionsCodes)" :key="opt">
                    {{availableOptionsCodes[opt].l.name}} / {{availableOptionsCodes[opt].s.name}}
                  </span>

              </div>
            </div>

        </div>


      </div>
      


    </div>

    <div style="text-align: center; margin-top: 2em; margin-bottom:2em">
      <button @click="closeLitLang">Close</button>
    </div>
  </div>

</template>


<style type="text/css">

    body #app{
      background-color: white !important;
    }


    .lang-option{
      background-color: white;
      border-radius: 1em;
      padding: 0.25em;
      border: 1px solid gray;
      font-size: 0.9em;
      cursor: pointer;
    }

    .lang-option:hover{
      background-color: lightblue;
    }

    .lang-option.selected{
      background-color: lightblue;
      -webkit-box-shadow: inset 0px 0px 5px #c1c1c1;
      -moz-box-shadow: inset 0px 0px 5px #c1c1c1;
      box-shadow: inset 0px 0px 5px #c1c1c1;      
    }

</style>

<script>
// @ is an alias to /src

import { mapState } from 'vuex'
// import parseId from '@/lib/parseId'
// import uiUtils from "@/lib/uiUtils"
// import lookupUtil from "@/lib/lookupUtil"
import parseProfile from '@/lib/parseProfile'






export default {
  name: "EditLiteralLanguage",
  components: {
    // HelloWorld
    
  },

  data: function() {
    return {

      
      // 2 char lang
      iso639_1: [{"code":"ab","name":"Abkhaz"},{"code":"aa","name":"Afar"},{"code":"af","name":"Afrikaans"},{"code":"ak","name":"Akan"},{"code":"sq","name":"Albanian"},{"code":"am","name":"Amharic"},{"code":"ar","name":"Arabic"},{"code":"an","name":"Aragonese"},{"code":"hy","name":"Armenian"},{"code":"as","name":"Assamese"},{"code":"av","name":"Avaric"},{"code":"ae","name":"Avestan"},{"code":"ay","name":"Aymara"},{"code":"az","name":"Azerbaijani"},{"code":"bm","name":"Bambara"},{"code":"ba","name":"Bashkir"},{"code":"eu","name":"Basque"},{"code":"be","name":"Belarusian"},{"code":"bn","name":"Bengali; Bangla"},{"code":"bh","name":"Bihari"},{"code":"bi","name":"Bislama"},{"code":"bs","name":"Bosnian"},{"code":"br","name":"Breton"},{"code":"bg","name":"Bulgarian"},{"code":"my","name":"Burmese"},{"code":"ca","name":"Catalan; Valencian"},{"code":"ch","name":"Chamorro"},{"code":"ce","name":"Chechen"},{"code":"ny","name":"Chichewa; Chewa; Nyanja"},{"code":"zh","name":"Chinese"},{"code":"cv","name":"Chuvash"},{"code":"kw","name":"Cornish"},{"code":"co","name":"Corsican"},{"code":"cr","name":"Cree"},{"code":"hr","name":"Croatian"},{"code":"cs","name":"Czech"},{"code":"da","name":"Danish"},{"code":"dv","name":"Divehi; Dhivehi; Maldivian;"},{"code":"nl","name":"Dutch"},{"code":"dz","name":"Dzongkha"},{"code":"en","name":"English"},{"code":"eo","name":"Esperanto"},{"code":"et","name":"Estonian"},{"code":"ee","name":"Ewe"},{"code":"fo","name":"Faroese"},{"code":"fj","name":"Fijian"},{"code":"fi","name":"Finnish"},{"code":"fr","name":"French"},{"code":"ff","name":"Fula; Fulah; Pulaar; Pular"},{"code":"gl","name":"Galician"},{"code":"ka","name":"Georgian"},{"code":"de","name":"German"},{"code":"el","name":"Greek, Modern"},{"code":"gn","name":"GuaranÃ­"},{"code":"gu","name":"Gujarati"},{"code":"ht","name":"Haitian; Haitian Creole"},{"code":"ha","name":"Hausa"},{"code":"he","name":"Hebrew (modern)"},{"code":"hz","name":"Herero"},{"code":"hi","name":"Hindi"},{"code":"ho","name":"Hiri Motu"},{"code":"hu","name":"Hungarian"},{"code":"ia","name":"Interlingua"},{"code":"id","name":"Indonesian"},{"code":"ie","name":"Interlingue"},{"code":"ga","name":"Irish"},{"code":"ig","name":"Igbo"},{"code":"ik","name":"Inupiaq"},{"code":"io","name":"Ido"},{"code":"is","name":"Icelandic"},{"code":"it","name":"Italian"},{"code":"iu","name":"Inuktitut"},{"code":"ja","name":"Japanese"},{"code":"jv","name":"Javanese"},{"code":"kl","name":"Kalaallisut, Greenlandic"},{"code":"kn","name":"Kannada"},{"code":"kr","name":"Kanuri"},{"code":"ks","name":"Kashmiri"},{"code":"kk","name":"Kazakh"},{"code":"km","name":"Khmer"},{"code":"ki","name":"Kikuyu, Gikuyu"},{"code":"rw","name":"Kinyarwanda"},{"code":"ky","name":"Kyrgyz"},{"code":"kv","name":"Komi"},{"code":"kg","name":"Kongo"},{"code":"ko","name":"Korean"},{"code":"ku","name":"Kurdish"},{"code":"kj","name":"Kwanyama, Kuanyama"},{"code":"la","name":"Latin"},{"code":"lb","name":"Luxembourgish, Letzeburgesch"},{"code":"lg","name":"Ganda"},{"code":"li","name":"Limburgish, Limburgan, Limburger"},{"code":"ln","name":"Lingala"},{"code":"lo","name":"Lao"},{"code":"lt","name":"Lithuanian"},{"code":"lu","name":"Luba-Katanga"},{"code":"lv","name":"Latvian"},{"code":"gv","name":"Manx"},{"code":"mk","name":"Macedonian"},{"code":"mg","name":"Malagasy"},{"code":"ms","name":"Malay"},{"code":"ml","name":"Malayalam"},{"code":"mt","name":"Maltese"},{"code":"mi","name":"MÄori"},{"code":"mr","name":"Marathi (MarÄá¹­hÄ«)"},{"code":"mh","name":"Marshallese"},{"code":"mn","name":"Mongolian"},{"code":"na","name":"Nauru"},{"code":"nv","name":"Navajo, Navaho"},{"code":"nb","name":"Norwegian BokmÃ¥l"},{"code":"nd","name":"North Ndebele"},{"code":"ne","name":"Nepali"},{"code":"ng","name":"Ndonga"},{"code":"nn","name":"Norwegian Nynorsk"},{"code":"no","name":"Norwegian"},{"code":"ii","name":"Nuosu"},{"code":"nr","name":"South Ndebele"},{"code":"oc","name":"Occitan"},{"code":"oj","name":"Ojibwe, Ojibwa"},{"code":"cu","name":"Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic"},{"code":"om","name":"Oromo"},{"code":"or","name":"Oriya"},{"code":"os","name":"Ossetian, Ossetic"},{"code":"pa","name":"Panjabi, Punjabi"},{"code":"pi","name":"PÄli"},{"code":"fa","name":"Persian (Farsi)"},{"code":"pl","name":"Polish"},{"code":"ps","name":"Pashto, Pushto"},{"code":"pt","name":"Portuguese"},{"code":"qu","name":"Quechua"},{"code":"rm","name":"Romansh"},{"code":"rn","name":"Kirundi"},{"code":"ro","name":"Romanian, [])"},{"code":"ru","name":"Russian"},{"code":"sa","name":"Sanskrit (Saá¹ská¹›ta)"},{"code":"sc","name":"Sardinian"},{"code":"sd","name":"Sindhi"},{"code":"se","name":"Northern Sami"},{"code":"sm","name":"Samoan"},{"code":"sg","name":"Sango"},{"code":"sr","name":"Serbian"},{"code":"gd","name":"Scottish Gaelic; Gaelic"},{"code":"sn","name":"Shona"},{"code":"si","name":"Sinhala, Sinhalese"},{"code":"sk","name":"Slovak"},{"code":"sl","name":"Slovene"},{"code":"so","name":"Somali"},{"code":"st","name":"Southern Sotho"},{"code":"es","name":"Spanish; Castilian"},{"code":"su","name":"Sundanese"},{"code":"sw","name":"Swahili"},{"code":"ss","name":"Swati"},{"code":"sv","name":"Swedish"},{"code":"ta","name":"Tamil"},{"code":"te","name":"Telugu"},{"code":"tg","name":"Tajik"},{"code":"th","name":"Thai"},{"code":"ti","name":"Tigrinya"},{"code":"bo","name":"Tibetan Standard, Tibetan, Central"},{"code":"tk","name":"Turkmen"},{"code":"tl","name":"Tagalog"},{"code":"tn","name":"Tswana"},{"code":"to","name":"Tonga (Tonga Islands)"},{"code":"tr","name":"Turkish"},{"code":"ts","name":"Tsonga"},{"code":"tt","name":"Tatar"},{"code":"tw","name":"Twi"},{"code":"ty","name":"Tahitian"},{"code":"ug","name":"Uyghur, Uighur"},{"code":"uk","name":"Ukrainian"},{"code":"ur","name":"Urdu"},{"code":"uz","name":"Uzbek"},{"code":"ve","name":"Venda"},{"code":"vi","name":"Vietnamese"},{"code":"vo","name":"VolapÃ¼k"},{"code":"wa","name":"Walloon"},{"code":"cy","name":"Welsh"},{"code":"wo","name":"Wolof"},{"code":"fy","name":"Western Frisian"},{"code":"xh","name":"Xhosa"},{"code":"yi","name":"Yiddish"},{"code":"yo","name":"Yoruba"},{"code":"za","name":"Zhuang, Chuang"},{"code":"zu","name":"Zulu"}],
      // 4 char lang
      iso639_2: [{"alpha_2":"aa","alpha_3":"aar","name":"Afar"},{"alpha_2":"ab","alpha_3":"abk","name":"Abkhazian"},{"alpha_3":"ace","name":"Achinese"},{"alpha_3":"ach","name":"Acoli"},{"alpha_3":"ada","name":"Adangme"},{"alpha_3":"ady","name":"Adyghe; Adygei"},{"alpha_3":"afa","name":"Afro-Asiatic languages"},{"alpha_3":"afh","name":"Afrihili"},{"alpha_2":"af","alpha_3":"afr","name":"Afrikaans"},{"alpha_3":"ain","name":"Ainu"},{"alpha_2":"ak","alpha_3":"aka","name":"Akan"},{"alpha_3":"akk","name":"Akkadian"},{"alpha_3":"ale","name":"Aleut"},{"alpha_3":"alg","name":"Algonquian languages"},{"alpha_3":"alt","name":"Southern Altai"},{"alpha_2":"am","alpha_3":"amh","name":"Amharic"},{"alpha_3":"ang","name":"English, Old (ca. 450-1100)"},{"alpha_3":"anp","name":"Angika"},{"alpha_3":"apa","name":"Apache languages"},{"alpha_2":"ar","alpha_3":"ara","name":"Arabic"},{"alpha_3":"arc","name":"Official Aramaic (700-300 BCE); Imperial Aramaic (700-300 BCE)"},{"alpha_2":"an","alpha_3":"arg","name":"Aragonese"},{"alpha_3":"arn","name":"Mapudungun; Mapuche"},{"alpha_3":"arp","name":"Arapaho"},{"alpha_3":"art","name":"Artificial languages"},{"alpha_3":"arw","name":"Arawak"},{"alpha_2":"as","alpha_3":"asm","name":"Assamese"},{"alpha_3":"ast","name":"Asturian; Bable; Leonese; Asturleonese"},{"alpha_3":"ath","name":"Athapascan languages"},{"alpha_3":"aus","name":"Australian languages"},{"alpha_2":"av","alpha_3":"ava","name":"Avaric"},{"alpha_2":"ae","alpha_3":"ave","name":"Avestan"},{"alpha_3":"awa","name":"Awadhi"},{"alpha_2":"ay","alpha_3":"aym","name":"Aymara"},{"alpha_2":"az","alpha_3":"aze","name":"Azerbaijani"},{"alpha_3":"bad","name":"Banda languages"},{"alpha_3":"bai","name":"Bamileke languages"},{"alpha_2":"ba","alpha_3":"bak","name":"Bashkir"},{"alpha_3":"bal","name":"Baluchi"},{"alpha_2":"bm","alpha_3":"bam","name":"Bambara"},{"alpha_3":"ban","name":"Balinese"},{"alpha_3":"bas","name":"Basa"},{"alpha_3":"bat","name":"Baltic languages"},{"alpha_3":"bej","name":"Beja; Bedawiyet"},{"alpha_2":"be","alpha_3":"bel","name":"Belarusian"},{"alpha_3":"bem","name":"Bemba"},{"alpha_2":"bn","alpha_3":"ben","common_name":"Bangla","name":"Bengali"},{"alpha_3":"ber","name":"Berber languages"},{"alpha_3":"bho","name":"Bhojpuri"},{"alpha_2":"bh","alpha_3":"bih","name":"Bihari languages"},{"alpha_3":"bik","name":"Bikol"},{"alpha_3":"bin","name":"Bini; Edo"},{"alpha_2":"bi","alpha_3":"bis","name":"Bislama"},{"alpha_3":"bla","name":"Siksika"},{"alpha_3":"bnt","name":"Bantu (Other)"},{"alpha_2":"bo","alpha_3":"bod","bibliographic":"tib","name":"Tibetan"},{"alpha_2":"bs","alpha_3":"bos","name":"Bosnian"},{"alpha_3":"bra","name":"Braj"},{"alpha_2":"br","alpha_3":"bre","name":"Breton"},{"alpha_3":"btk","name":"Batak languages"},{"alpha_3":"bua","name":"Buriat"},{"alpha_3":"bug","name":"Buginese"},{"alpha_2":"bg","alpha_3":"bul","name":"Bulgarian"},{"alpha_3":"byn","name":"Blin; Bilin"},{"alpha_3":"cad","name":"Caddo"},{"alpha_3":"cai","name":"Central American Indian languages"},{"alpha_3":"car","name":"Galibi Carib"},{"alpha_2":"ca","alpha_3":"cat","name":"Catalan; Valencian"},{"alpha_3":"cau","name":"Caucasian languages"},{"alpha_3":"ceb","name":"Cebuano"},{"alpha_3":"cel","name":"Celtic languages"},{"alpha_2":"cs","alpha_3":"ces","bibliographic":"cze","name":"Czech"},{"alpha_2":"ch","alpha_3":"cha","name":"Chamorro"},{"alpha_3":"chb","name":"Chibcha"},{"alpha_2":"ce","alpha_3":"che","name":"Chechen"},{"alpha_3":"chg","name":"Chagatai"},{"alpha_3":"chk","name":"Chuukese"},{"alpha_3":"chm","name":"Mari"},{"alpha_3":"chn","name":"Chinook jargon"},{"alpha_3":"cho","name":"Choctaw"},{"alpha_3":"chp","name":"Chipewyan; Dene Suline"},{"alpha_3":"chr","name":"Cherokee"},{"alpha_2":"cu","alpha_3":"chu","name":"Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic"},{"alpha_2":"cv","alpha_3":"chv","name":"Chuvash"},{"alpha_3":"chy","name":"Cheyenne"},{"alpha_3":"cmc","name":"Chamic languages"},{"alpha_3":"cop","name":"Coptic"},{"alpha_2":"kw","alpha_3":"cor","name":"Cornish"},{"alpha_2":"co","alpha_3":"cos","name":"Corsican"},{"alpha_3":"cpe","name":"Creoles and pidgins, English based"},{"alpha_3":"cpf","name":"Creoles and pidgins, French-based"},{"alpha_3":"cpp","name":"Creoles and pidgins, Portuguese-based"},{"alpha_2":"cr","alpha_3":"cre","name":"Cree"},{"alpha_3":"crh","name":"Crimean Tatar; Crimean Turkish"},{"alpha_3":"crp","name":"Creoles and pidgins"},{"alpha_3":"csb","name":"Kashubian"},{"alpha_3":"cus","name":"Cushitic languages"},{"alpha_2":"cy","alpha_3":"cym","bibliographic":"wel","name":"Welsh"},{"alpha_3":"dak","name":"Dakota"},{"alpha_2":"da","alpha_3":"dan","name":"Danish"},{"alpha_3":"dar","name":"Dargwa"},{"alpha_3":"day","name":"Land Dayak languages"},{"alpha_3":"del","name":"Delaware"},{"alpha_3":"den","name":"Slave (Athapascan)"},{"alpha_2":"de","alpha_3":"deu","bibliographic":"ger","name":"German"},{"alpha_3":"dgr","name":"Dogrib"},{"alpha_3":"din","name":"Dinka"},{"alpha_2":"dv","alpha_3":"div","name":"Divehi; Dhivehi; Maldivian"},{"alpha_3":"doi","name":"Dogri"},{"alpha_3":"dra","name":"Dravidian languages"},{"alpha_3":"dsb","name":"Lower Sorbian"},{"alpha_3":"dua","name":"Duala"},{"alpha_3":"dum","name":"Dutch, Middle (ca. 1050-1350)"},{"alpha_3":"dyu","name":"Dyula"},{"alpha_2":"dz","alpha_3":"dzo","name":"Dzongkha"},{"alpha_3":"efi","name":"Efik"},{"alpha_3":"egy","name":"Egyptian (Ancient)"},{"alpha_3":"eka","name":"Ekajuk"},{"alpha_2":"el","alpha_3":"ell","bibliographic":"gre","name":"Greek, Modern (1453-)"},{"alpha_3":"elx","name":"Elamite"},{"alpha_2":"en","alpha_3":"eng","name":"English"},{"alpha_3":"enm","name":"English, Middle (1100-1500)"},{"alpha_2":"eo","alpha_3":"epo","name":"Esperanto"},{"alpha_2":"et","alpha_3":"est","name":"Estonian"},{"alpha_2":"eu","alpha_3":"eus","bibliographic":"baq","name":"Basque"},{"alpha_2":"ee","alpha_3":"ewe","name":"Ewe"},{"alpha_3":"ewo","name":"Ewondo"},{"alpha_3":"fan","name":"Fang"},{"alpha_2":"fo","alpha_3":"fao","name":"Faroese"},{"alpha_2":"fa","alpha_3":"fas","bibliographic":"per","name":"Persian"},{"alpha_3":"fat","name":"Fanti"},{"alpha_2":"fj","alpha_3":"fij","name":"Fijian"},{"alpha_3":"fil","name":"Filipino; Pilipino"},{"alpha_2":"fi","alpha_3":"fin","name":"Finnish"},{"alpha_3":"fiu","name":"Finno-Ugrian languages"},{"alpha_3":"fon","name":"Fon"},{"alpha_2":"fr","alpha_3":"fra","bibliographic":"fre","name":"French"},{"alpha_3":"frm","name":"French, Middle (ca. 1400-1600)"},{"alpha_3":"fro","name":"French, Old (842-ca. 1400)"},{"alpha_3":"frr","name":"Northern Frisian"},{"alpha_3":"frs","name":"Eastern Frisian"},{"alpha_2":"fy","alpha_3":"fry","name":"Western Frisian"},{"alpha_2":"ff","alpha_3":"ful","name":"Fulah"},{"alpha_3":"fur","name":"Friulian"},{"alpha_3":"gaa","name":"Ga"},{"alpha_3":"gay","name":"Gayo"},{"alpha_3":"gba","name":"Gbaya"},{"alpha_3":"gem","name":"Germanic languages"},{"alpha_3":"gez","name":"Geez"},{"alpha_3":"gil","name":"Gilbertese"},{"alpha_2":"gd","alpha_3":"gla","name":"Gaelic; Scottish Gaelic"},{"alpha_2":"ga","alpha_3":"gle","name":"Irish"},{"alpha_2":"gl","alpha_3":"glg","name":"Galician"},{"alpha_2":"gv","alpha_3":"glv","name":"Manx"},{"alpha_3":"gmh","name":"German, Middle High (ca. 1050-1500)"},{"alpha_3":"goh","name":"German, Old High (ca. 750-1050)"},{"alpha_3":"gon","name":"Gondi"},{"alpha_3":"gor","name":"Gorontalo"},{"alpha_3":"got","name":"Gothic"},{"alpha_3":"grb","name":"Grebo"},{"alpha_3":"grc","name":"Greek, Ancient (to 1453)"},{"alpha_2":"gn","alpha_3":"grn","name":"Guarani"},{"alpha_3":"gsw","name":"Swiss German; Alemannic; Alsatian"},{"alpha_2":"gu","alpha_3":"guj","name":"Gujarati"},{"alpha_3":"gwi","name":"Gwich'in"},{"alpha_3":"hai","name":"Haida"},{"alpha_2":"ht","alpha_3":"hat","name":"Haitian; Haitian Creole"},{"alpha_2":"ha","alpha_3":"hau","name":"Hausa"},{"alpha_3":"haw","name":"Hawaiian"},{"alpha_2":"he","alpha_3":"heb","name":"Hebrew"},{"alpha_2":"hz","alpha_3":"her","name":"Herero"},{"alpha_3":"hil","name":"Hiligaynon"},{"alpha_3":"him","name":"Himachali languages; Western Pahari languages"},{"alpha_2":"hi","alpha_3":"hin","name":"Hindi"},{"alpha_3":"hit","name":"Hittite"},{"alpha_3":"hmn","name":"Hmong; Mong"},{"alpha_2":"ho","alpha_3":"hmo","name":"Hiri Motu"},{"alpha_2":"hr","alpha_3":"hrv","name":"Croatian"},{"alpha_3":"hsb","name":"Upper Sorbian"},{"alpha_2":"hu","alpha_3":"hun","name":"Hungarian"},{"alpha_3":"hup","name":"Hupa"},{"alpha_2":"hy","alpha_3":"hye","bibliographic":"arm","name":"Armenian"},{"alpha_3":"iba","name":"Iban"},{"alpha_2":"ig","alpha_3":"ibo","name":"Igbo"},{"alpha_2":"io","alpha_3":"ido","name":"Ido"},{"alpha_2":"ii","alpha_3":"iii","name":"Sichuan Yi; Nuosu"},{"alpha_3":"ijo","name":"Ijo languages"},{"alpha_2":"iu","alpha_3":"iku","name":"Inuktitut"},{"alpha_2":"ie","alpha_3":"ile","name":"Interlingue; Occidental"},{"alpha_3":"ilo","name":"Iloko"},{"alpha_2":"ia","alpha_3":"ina","name":"Interlingua (International Auxiliary Language Association)"},{"alpha_3":"inc","name":"Indic languages"},{"alpha_2":"id","alpha_3":"ind","name":"Indonesian"},{"alpha_3":"ine","name":"Indo-European languages"},{"alpha_3":"inh","name":"Ingush"},{"alpha_2":"ik","alpha_3":"ipk","name":"Inupiaq"},{"alpha_3":"ira","name":"Iranian languages"},{"alpha_3":"iro","name":"Iroquoian languages"},{"alpha_2":"is","alpha_3":"isl","bibliographic":"ice","name":"Icelandic"},{"alpha_2":"it","alpha_3":"ita","name":"Italian"},{"alpha_2":"jv","alpha_3":"jav","name":"Javanese"},{"alpha_3":"jbo","name":"Lojban"},{"alpha_2":"ja","alpha_3":"jpn","name":"Japanese"},{"alpha_3":"jpr","name":"Judeo-Persian"},{"alpha_3":"jrb","name":"Judeo-Arabic"},{"alpha_3":"kaa","name":"Kara-Kalpak"},{"alpha_3":"kab","name":"Kabyle"},{"alpha_3":"kac","name":"Kachin; Jingpho"},{"alpha_2":"kl","alpha_3":"kal","name":"Kalaallisut; Greenlandic"},{"alpha_3":"kam","name":"Kamba"},{"alpha_2":"kn","alpha_3":"kan","name":"Kannada"},{"alpha_3":"kar","name":"Karen languages"},{"alpha_2":"ks","alpha_3":"kas","name":"Kashmiri"},{"alpha_2":"ka","alpha_3":"kat","bibliographic":"geo","name":"Georgian"},{"alpha_2":"kr","alpha_3":"kau","name":"Kanuri"},{"alpha_3":"kaw","name":"Kawi"},{"alpha_2":"kk","alpha_3":"kaz","name":"Kazakh"},{"alpha_3":"kbd","name":"Kabardian"},{"alpha_3":"kha","name":"Khasi"},{"alpha_3":"khi","name":"Khoisan languages"},{"alpha_2":"km","alpha_3":"khm","name":"Central Khmer"},{"alpha_3":"kho","name":"Khotanese; Sakan"},{"alpha_2":"ki","alpha_3":"kik","name":"Kikuyu; Gikuyu"},{"alpha_2":"rw","alpha_3":"kin","name":"Kinyarwanda"},{"alpha_2":"ky","alpha_3":"kir","name":"Kirghiz; Kyrgyz"},{"alpha_3":"kmb","name":"Kimbundu"},{"alpha_3":"kok","name":"Konkani"},{"alpha_2":"kv","alpha_3":"kom","name":"Komi"},{"alpha_2":"kg","alpha_3":"kon","name":"Kongo"},{"alpha_2":"ko","alpha_3":"kor","name":"Korean"},{"alpha_3":"kos","name":"Kosraean"},{"alpha_3":"kpe","name":"Kpelle"},{"alpha_3":"krc","name":"Karachay-Balkar"},{"alpha_3":"krl","name":"Karelian"},{"alpha_3":"kro","name":"Kru languages"},{"alpha_3":"kru","name":"Kurukh"},{"alpha_2":"kj","alpha_3":"kua","name":"Kuanyama; Kwanyama"},{"alpha_3":"kum","name":"Kumyk"},{"alpha_2":"ku","alpha_3":"kur","name":"Kurdish"},{"alpha_3":"kut","name":"Kutenai"},{"alpha_3":"lad","name":"Ladino"},{"alpha_3":"lah","name":"Lahnda"},{"alpha_3":"lam","name":"Lamba"},{"alpha_2":"lo","alpha_3":"lao","name":"Lao"},{"alpha_2":"la","alpha_3":"lat","name":"Latin"},{"alpha_2":"lv","alpha_3":"lav","name":"Latvian"},{"alpha_3":"lez","name":"Lezghian"},{"alpha_2":"li","alpha_3":"lim","name":"Limburgan; Limburger; Limburgish"},{"alpha_2":"ln","alpha_3":"lin","name":"Lingala"},{"alpha_2":"lt","alpha_3":"lit","name":"Lithuanian"},{"alpha_3":"lol","name":"Mongo"},{"alpha_3":"loz","name":"Lozi"},{"alpha_2":"lb","alpha_3":"ltz","name":"Luxembourgish; Letzeburgesch"},{"alpha_3":"lua","name":"Luba-Lulua"},{"alpha_2":"lu","alpha_3":"lub","name":"Luba-Katanga"},{"alpha_2":"lg","alpha_3":"lug","name":"Ganda"},{"alpha_3":"lui","name":"Luiseno"},{"alpha_3":"lun","name":"Lunda"},{"alpha_3":"luo","name":"Luo (Kenya and Tanzania)"},{"alpha_3":"lus","name":"Lushai"},{"alpha_3":"mad","name":"Madurese"},{"alpha_3":"mag","name":"Magahi"},{"alpha_2":"mh","alpha_3":"mah","name":"Marshallese"},{"alpha_3":"mai","name":"Maithili"},{"alpha_3":"mak","name":"Makasar"},{"alpha_2":"ml","alpha_3":"mal","name":"Malayalam"},{"alpha_3":"man","name":"Mandingo"},{"alpha_3":"map","name":"Austronesian languages"},{"alpha_2":"mr","alpha_3":"mar","name":"Marathi"},{"alpha_3":"mas","name":"Masai"},{"alpha_3":"mdf","name":"Moksha"},{"alpha_3":"mdr","name":"Mandar"},{"alpha_3":"men","name":"Mende"},{"alpha_3":"mga","name":"Irish, Middle (900-1200)"},{"alpha_3":"mic","name":"Mi'kmaq; Micmac"},{"alpha_3":"min","name":"Minangkabau"},{"alpha_3":"mis","name":"Uncoded languages"},{"alpha_2":"mk","alpha_3":"mkd","bibliographic":"mac","name":"Macedonian"},{"alpha_3":"mkh","name":"Mon-Khmer languages"},{"alpha_2":"mg","alpha_3":"mlg","name":"Malagasy"},{"alpha_2":"mt","alpha_3":"mlt","name":"Maltese"},{"alpha_3":"mnc","name":"Manchu"},{"alpha_3":"mni","name":"Manipuri"},{"alpha_3":"mno","name":"Manobo languages"},{"alpha_3":"moh","name":"Mohawk"},{"alpha_2":"mn","alpha_3":"mon","name":"Mongolian"},{"alpha_3":"mos","name":"Mossi"},{"alpha_2":"mi","alpha_3":"mri","bibliographic":"mao","name":"Maori"},{"alpha_2":"ms","alpha_3":"msa","bibliographic":"may","name":"Malay"},{"alpha_3":"mul","name":"Multiple languages"},{"alpha_3":"mun","name":"Munda languages"},{"alpha_3":"mus","name":"Creek"},{"alpha_3":"mwl","name":"Mirandese"},{"alpha_3":"mwr","name":"Marwari"},{"alpha_2":"my","alpha_3":"mya","bibliographic":"bur","name":"Burmese"},{"alpha_3":"myn","name":"Mayan languages"},{"alpha_3":"myv","name":"Erzya"},{"alpha_3":"nah","name":"Nahuatl languages"},{"alpha_3":"nai","name":"North American Indian languages"},{"alpha_3":"nap","name":"Neapolitan"},{"alpha_2":"na","alpha_3":"nau","name":"Nauru"},{"alpha_2":"nv","alpha_3":"nav","name":"Navajo; Navaho"},{"alpha_2":"nr","alpha_3":"nbl","name":"Ndebele, South; South Ndebele"},{"alpha_2":"nd","alpha_3":"nde","name":"Ndebele, North; North Ndebele"},{"alpha_2":"ng","alpha_3":"ndo","name":"Ndonga"},{"alpha_3":"nds","name":"Low German; Low Saxon; German, Low; Saxon, Low"},{"alpha_2":"ne","alpha_3":"nep","name":"Nepali"},{"alpha_3":"new","name":"Nepal Bhasa; Newari"},{"alpha_3":"nia","name":"Nias"},{"alpha_3":"nic","name":"Niger-Kordofanian languages"},{"alpha_3":"niu","name":"Niuean"},{"alpha_2":"nl","alpha_3":"nld","bibliographic":"dut","name":"Dutch; Flemish"},{"alpha_2":"nn","alpha_3":"nno","name":"Norwegian Nynorsk; Nynorsk, Norwegian"},{"alpha_2":"nb","alpha_3":"nob","name":"Bokmål, Norwegian; Norwegian Bokmål"},{"alpha_3":"nog","name":"Nogai"},{"alpha_3":"non","name":"Norse, Old"},{"alpha_2":"no","alpha_3":"nor","name":"Norwegian"},{"alpha_3":"nqo","name":"N'Ko"},{"alpha_3":"nso","name":"Pedi; Sepedi; Northern Sotho"},{"alpha_3":"nub","name":"Nubian languages"},{"alpha_3":"nwc","name":"Classical Newari; Old Newari; Classical Nepal Bhasa"},{"alpha_2":"ny","alpha_3":"nya","name":"Chichewa; Chewa; Nyanja"},{"alpha_3":"nym","name":"Nyamwezi"},{"alpha_3":"nyn","name":"Nyankole"},{"alpha_3":"nyo","name":"Nyoro"},{"alpha_3":"nzi","name":"Nzima"},{"alpha_2":"oc","alpha_3":"oci","name":"Occitan (post 1500); Provençal"},{"alpha_2":"oj","alpha_3":"oji","name":"Ojibwa"},{"alpha_2":"or","alpha_3":"ori","name":"Oriya"},{"alpha_2":"om","alpha_3":"orm","name":"Oromo"},{"alpha_3":"osa","name":"Osage"},{"alpha_2":"os","alpha_3":"oss","name":"Ossetian; Ossetic"},{"alpha_3":"ota","name":"Turkish, Ottoman (1500-1928)"},{"alpha_3":"oto","name":"Otomian languages"},{"alpha_3":"paa","name":"Papuan languages"},{"alpha_3":"pag","name":"Pangasinan"},{"alpha_3":"pal","name":"Pahlavi"},{"alpha_3":"pam","name":"Pampanga; Kapampangan"},{"alpha_2":"pa","alpha_3":"pan","name":"Panjabi; Punjabi"},{"alpha_3":"pap","name":"Papiamento"},{"alpha_3":"pau","name":"Palauan"},{"alpha_3":"peo","name":"Persian, Old (ca. 600-400 B.C.)"},{"alpha_3":"phi","name":"Philippine languages"},{"alpha_3":"phn","name":"Phoenician"},{"alpha_2":"pi","alpha_3":"pli","name":"Pali"},{"alpha_2":"pl","alpha_3":"pol","name":"Polish"},{"alpha_3":"pon","name":"Pohnpeian"},{"alpha_2":"pt","alpha_3":"por","name":"Portuguese"},{"alpha_3":"pra","name":"Prakrit languages"},{"alpha_3":"pro","name":"Provençal, Old (to 1500)"},{"alpha_2":"ps","alpha_3":"pus","name":"Pushto; Pashto"},{"alpha_3":"qaa-qtz","name":"Reserved for local use"},{"alpha_2":"qu","alpha_3":"que","name":"Quechua"},{"alpha_3":"raj","name":"Rajasthani"},{"alpha_3":"rap","name":"Rapanui"},{"alpha_3":"rar","name":"Rarotongan; Cook Islands Maori"},{"alpha_3":"roa","name":"Romance languages"},{"alpha_2":"rm","alpha_3":"roh","name":"Romansh"},{"alpha_3":"rom","name":"Romany"},{"alpha_2":"ro","alpha_3":"ron","bibliographic":"rum","name":"Romanian; Moldavian; Moldovan"},{"alpha_2":"rn","alpha_3":"run","name":"Rundi"},{"alpha_3":"rup","name":"Aromanian; Arumanian; Macedo-Romanian"},{"alpha_2":"ru","alpha_3":"rus","name":"Russian"},{"alpha_3":"sad","name":"Sandawe"},{"alpha_2":"sg","alpha_3":"sag","name":"Sango"},{"alpha_3":"sah","name":"Yakut"},{"alpha_3":"sai","name":"South American Indian (Other)"},{"alpha_3":"sal","name":"Salishan languages"},{"alpha_3":"sam","name":"Samaritan Aramaic"},{"alpha_2":"sa","alpha_3":"san","name":"Sanskrit"},{"alpha_3":"sas","name":"Sasak"},{"alpha_3":"sat","name":"Santali"},{"alpha_3":"scn","name":"Sicilian"},{"alpha_3":"sco","name":"Scots"},{"alpha_3":"sel","name":"Selkup"},{"alpha_3":"sem","name":"Semitic languages"},{"alpha_3":"sga","name":"Irish, Old (to 900)"},{"alpha_3":"sgn","name":"Sign Languages"},{"alpha_3":"shn","name":"Shan"},{"alpha_3":"sid","name":"Sidamo"},{"alpha_2":"si","alpha_3":"sin","name":"Sinhala; Sinhalese"},{"alpha_3":"sio","name":"Siouan languages"},{"alpha_3":"sit","name":"Sino-Tibetan languages"},{"alpha_3":"sla","name":"Slavic languages"},{"alpha_2":"sk","alpha_3":"slk","bibliographic":"slo","name":"Slovak"},{"alpha_2":"sl","alpha_3":"slv","name":"Slovenian"},{"alpha_3":"sma","name":"Southern Sami"},{"alpha_2":"se","alpha_3":"sme","name":"Northern Sami"},{"alpha_3":"smi","name":"Sami languages"},{"alpha_3":"smj","name":"Lule Sami"},{"alpha_3":"smn","name":"Inari Sami"},{"alpha_2":"sm","alpha_3":"smo","name":"Samoan"},{"alpha_3":"sms","name":"Skolt Sami"},{"alpha_2":"sn","alpha_3":"sna","name":"Shona"},{"alpha_2":"sd","alpha_3":"snd","name":"Sindhi"},{"alpha_3":"snk","name":"Soninke"},{"alpha_3":"sog","name":"Sogdian"},{"alpha_2":"so","alpha_3":"som","name":"Somali"},{"alpha_3":"son","name":"Songhai languages"},{"alpha_2":"st","alpha_3":"sot","name":"Sotho, Southern"},{"alpha_2":"es","alpha_3":"spa","name":"Spanish; Castilian"},{"alpha_2":"sq","alpha_3":"sqi","bibliographic":"alb","name":"Albanian"},{"alpha_2":"sc","alpha_3":"srd","name":"Sardinian"},{"alpha_3":"srn","name":"Sranan Tongo"},{"alpha_2":"sr","alpha_3":"srp","name":"Serbian"},{"alpha_3":"srr","name":"Serer"},{"alpha_3":"ssa","name":"Nilo-Saharan languages"},{"alpha_2":"ss","alpha_3":"ssw","name":"Swati"},{"alpha_3":"suk","name":"Sukuma"},{"alpha_2":"su","alpha_3":"sun","name":"Sundanese"},{"alpha_3":"sus","name":"Susu"},{"alpha_3":"sux","name":"Sumerian"},{"alpha_2":"sw","alpha_3":"swa","name":"Swahili"},{"alpha_2":"sv","alpha_3":"swe","name":"Swedish"},{"alpha_3":"syc","name":"Classical Syriac"},{"alpha_3":"syr","name":"Syriac"},{"alpha_2":"ty","alpha_3":"tah","name":"Tahitian"},{"alpha_3":"tai","name":"Tai languages"},{"alpha_2":"ta","alpha_3":"tam","name":"Tamil"},{"alpha_2":"tt","alpha_3":"tat","name":"Tatar"},{"alpha_2":"te","alpha_3":"tel","name":"Telugu"},{"alpha_3":"tem","name":"Timne"},{"alpha_3":"ter","name":"Tereno"},{"alpha_3":"tet","name":"Tetum"},{"alpha_2":"tg","alpha_3":"tgk","name":"Tajik"},{"alpha_2":"tl","alpha_3":"tgl","name":"Tagalog"},{"alpha_2":"th","alpha_3":"tha","name":"Thai"},{"alpha_3":"tig","name":"Tigre"},{"alpha_2":"ti","alpha_3":"tir","name":"Tigrinya"},{"alpha_3":"tiv","name":"Tiv"},{"alpha_3":"tkl","name":"Tokelau"},{"alpha_3":"tlh","name":"Klingon; tlhIngan-Hol"},{"alpha_3":"tli","name":"Tlingit"},{"alpha_3":"tmh","name":"Tamashek"},{"alpha_3":"tog","name":"Tonga (Nyasa)"},{"alpha_2":"to","alpha_3":"ton","name":"Tonga (Tonga Islands)"},{"alpha_3":"tpi","name":"Tok Pisin"},{"alpha_3":"tsi","name":"Tsimshian"},{"alpha_2":"tn","alpha_3":"tsn","name":"Tswana"},{"alpha_2":"ts","alpha_3":"tso","name":"Tsonga"},{"alpha_2":"tk","alpha_3":"tuk","name":"Turkmen"},{"alpha_3":"tum","name":"Tumbuka"},{"alpha_3":"tup","name":"Tupi languages"},{"alpha_2":"tr","alpha_3":"tur","name":"Turkish"},{"alpha_3":"tut","name":"Altaic languages"},{"alpha_3":"tvl","name":"Tuvalu"},{"alpha_2":"tw","alpha_3":"twi","name":"Twi"},{"alpha_3":"tyv","name":"Tuvinian"},{"alpha_3":"udm","name":"Udmurt"},{"alpha_3":"uga","name":"Ugaritic"},{"alpha_2":"ug","alpha_3":"uig","name":"Uighur; Uyghur"},{"alpha_2":"uk","alpha_3":"ukr","name":"Ukrainian"},{"alpha_3":"umb","name":"Umbundu"},{"alpha_3":"und","name":"Undetermined"},{"alpha_2":"ur","alpha_3":"urd","name":"Urdu"},{"alpha_2":"uz","alpha_3":"uzb","name":"Uzbek"},{"alpha_3":"vai","name":"Vai"},{"alpha_2":"ve","alpha_3":"ven","name":"Venda"},{"alpha_2":"vi","alpha_3":"vie","name":"Vietnamese"},{"alpha_2":"vo","alpha_3":"vol","name":"Volapük"},{"alpha_3":"vot","name":"Votic"},{"alpha_3":"wak","name":"Wakashan languages"},{"alpha_3":"wal","name":"Walamo"},{"alpha_3":"war","name":"Waray"},{"alpha_3":"was","name":"Washo"},{"alpha_3":"wen","name":"Sorbian languages"},{"alpha_2":"wa","alpha_3":"wln","name":"Walloon"},{"alpha_2":"wo","alpha_3":"wol","name":"Wolof"},{"alpha_3":"xal","name":"Kalmyk; Oirat"},{"alpha_2":"xh","alpha_3":"xho","name":"Xhosa"},{"alpha_3":"yao","name":"Yao"},{"alpha_3":"yap","name":"Yapese"},{"alpha_2":"yi","alpha_3":"yid","name":"Yiddish"},{"alpha_2":"yo","alpha_3":"yor","name":"Yoruba"},{"alpha_3":"ypk","name":"Yupik languages"},{"alpha_3":"zap","name":"Zapotec"},{"alpha_3":"zbl","name":"Blissymbols; Blissymbolics; Bliss"},{"alpha_3":"zen","name":"Zenaga"},{"alpha_3":"zgh","name":"Standard Moroccan Tamazight"},{"alpha_2":"za","alpha_3":"zha","name":"Zhuang; Chuang"},{"alpha_2":"zh","alpha_3":"zho","bibliographic":"chi","name":"Chinese"},{"alpha_3":"znd","name":"Zande languages"},{"alpha_2":"zu","alpha_3":"zul","name":"Zulu"},{"alpha_3":"zun","name":"Zuni"},{"alpha_3":"zxx","name":"No linguistic content; Not applicable"},{"alpha_3":"zza","name":"Zaza; Dimili; Dimli; Kirdki; Kirmanjki; Zazaki"}],
      
      // script      
      iso15924: [{"alpha_4":"Adlm","name":"Adlam","numeric":"166"},{"alpha_4":"Afak","name":"Afaka","numeric":"439"},{"alpha_4":"Aghb","name":"Caucasian Albanian","numeric":"239"},{"alpha_4":"Ahom","name":"Ahom, Tai Ahom","numeric":"338"},{"alpha_4":"Arab","name":"Arabic","numeric":"160"},{"alpha_4":"Aran","name":"Arabic (Nastaliq variant)","numeric":"161"},{"alpha_4":"Armi","name":"Imperial Aramaic","numeric":"124"},{"alpha_4":"Armn","name":"Armenian","numeric":"230"},{"alpha_4":"Avst","name":"Avestan","numeric":"134"},{"alpha_4":"Bali","name":"Balinese","numeric":"360"},{"alpha_4":"Bamu","name":"Bamum","numeric":"435"},{"alpha_4":"Bass","name":"Bassa Vah","numeric":"259"},{"alpha_4":"Batk","name":"Batak","numeric":"365"},{"alpha_4":"Beng","name":"Bengali","numeric":"325"},{"alpha_4":"Bhks","name":"Bhaiksuki","numeric":"334"},{"alpha_4":"Blis","name":"Blissymbols","numeric":"550"},{"alpha_4":"Bopo","name":"Bopomofo","numeric":"285"},{"alpha_4":"Brah","name":"Brahmi","numeric":"300"},{"alpha_4":"Brai","name":"Braille","numeric":"570"},{"alpha_4":"Bugi","name":"Buginese","numeric":"367"},{"alpha_4":"Buhd","name":"Buhid","numeric":"372"},{"alpha_4":"Cakm","name":"Chakma","numeric":"349"},{"alpha_4":"Cans","name":"Unified Canadian Aboriginal Syllabics","numeric":"440"},{"alpha_4":"Cari","name":"Carian","numeric":"201"},{"alpha_4":"Cham","name":"Cham","numeric":"358"},{"alpha_4":"Cher","name":"Cherokee","numeric":"445"},{"alpha_4":"Cirt","name":"Cirth","numeric":"291"},{"alpha_4":"Copt","name":"Coptic","numeric":"204"},{"alpha_4":"Cprt","name":"Cypriot","numeric":"403"},{"alpha_4":"Cyrl","name":"Cyrillic","numeric":"220"},{"alpha_4":"Cyrs","name":"Cyrillic (Old Church Slavonic variant)","numeric":"221"},{"alpha_4":"Deva","name":"Devanagari (Nagari)","numeric":"315"},{"alpha_4":"Dsrt","name":"Deseret (Mormon)","numeric":"250"},{"alpha_4":"Dupl","name":"Duployan shorthand, Duployan stenography","numeric":"755"},{"alpha_4":"Egyd","name":"Egyptian demotic","numeric":"070"},{"alpha_4":"Egyh","name":"Egyptian hieratic","numeric":"060"},{"alpha_4":"Egyp","name":"Egyptian hieroglyphs","numeric":"050"},{"alpha_4":"Elba","name":"Elbasan","numeric":"226"},{"alpha_4":"Ethi","name":"Ethiopic (Geʻez)","numeric":"430"},{"alpha_4":"Geok","name":"Khutsuri (Asomtavruli and Nuskhuri)","numeric":"241"},{"alpha_4":"Geor","name":"Georgian (Mkhedruli)","numeric":"240"},{"alpha_4":"Glag","name":"Glagolitic","numeric":"225"},{"alpha_4":"Goth","name":"Gothic","numeric":"206"},{"alpha_4":"Gran","name":"Grantha","numeric":"343"},{"alpha_4":"Grek","name":"Greek","numeric":"200"},{"alpha_4":"Gujr","name":"Gujarati","numeric":"320"},{"alpha_4":"Guru","name":"Gurmukhi","numeric":"310"},{"alpha_4":"Hanb","name":"Han with Bopomofo (alias for Han + Bopomofo)","numeric":"503"},{"alpha_4":"Hang","name":"Hangul (Hangŭl, Hangeul)","numeric":"286"},{"alpha_4":"Hani","name":"Han (Hanzi, Kanji, Hanja)","numeric":"500"},{"alpha_4":"Hano","name":"Hanunoo (Hanunóo)","numeric":"371"},{"alpha_4":"Hans","name":"Han (Simplified variant)","numeric":"501"},{"alpha_4":"Hant","name":"Han (Traditional variant)","numeric":"502"},{"alpha_4":"Hatr","name":"Hatran","numeric":"127"},{"alpha_4":"Hebr","name":"Hebrew","numeric":"125"},{"alpha_4":"Hira","name":"Hiragana","numeric":"410"},{"alpha_4":"Hluw","name":"Anatolian Hieroglyphs (Luwian Hieroglyphs, Hittite Hieroglyphs)","numeric":"080"},{"alpha_4":"Hmng","name":"Pahawh Hmong","numeric":"450"},{"alpha_4":"Hrkt","name":"Japanese syllabaries (alias for Hiragana + Katakana)","numeric":"412"},{"alpha_4":"Hung","name":"Old Hungarian (Hungarian Runic)","numeric":"176"},{"alpha_4":"Inds","name":"Indus (Harappan)","numeric":"610"},{"alpha_4":"Ital","name":"Old Italic (Etruscan, Oscan, etc.)","numeric":"210"},{"alpha_4":"Jamo","name":"Jamo (alias for Jamo subset of Hangul)","numeric":"284"},{"alpha_4":"Java","name":"Javanese","numeric":"361"},{"alpha_4":"Jpan","name":"Japanese (alias for Han + Hiragana + Katakana)","numeric":"413"},{"alpha_4":"Jurc","name":"Jurchen","numeric":"510"},{"alpha_4":"Kali","name":"Kayah Li","numeric":"357"},{"alpha_4":"Kana","name":"Katakana","numeric":"411"},{"alpha_4":"Khar","name":"Kharoshthi","numeric":"305"},{"alpha_4":"Khmr","name":"Khmer","numeric":"355"},{"alpha_4":"Khoj","name":"Khojki","numeric":"322"},{"alpha_4":"Kitl","name":"Khitan large script","numeric":"505"},{"alpha_4":"Kits","name":"Khitan small script","numeric":"288"},{"alpha_4":"Knda","name":"Kannada","numeric":"345"},{"alpha_4":"Kore","name":"Korean (alias for Hangul + Han)","numeric":"287"},{"alpha_4":"Kpel","name":"Kpelle","numeric":"436"},{"alpha_4":"Kthi","name":"Kaithi","numeric":"317"},{"alpha_4":"Lana","name":"Tai Tham (Lanna)","numeric":"351"},{"alpha_4":"Laoo","name":"Lao","numeric":"356"},{"alpha_4":"Latf","name":"Latin (Fraktur variant)","numeric":"217"},{"alpha_4":"Latg","name":"Latin (Gaelic variant)","numeric":"216"},{"alpha_4":"Latn","name":"Latin","numeric":"215"},{"alpha_4":"Leke","name":"Leke","numeric":"364"},{"alpha_4":"Lepc","name":"Lepcha (Róng)","numeric":"335"},{"alpha_4":"Limb","name":"Limbu","numeric":"336"},{"alpha_4":"Lina","name":"Linear A","numeric":"400"},{"alpha_4":"Linb","name":"Linear B","numeric":"401"},{"alpha_4":"Lisu","name":"Lisu (Fraser)","numeric":"399"},{"alpha_4":"Loma","name":"Loma","numeric":"437"},{"alpha_4":"Lyci","name":"Lycian","numeric":"202"},{"alpha_4":"Lydi","name":"Lydian","numeric":"116"},{"alpha_4":"Mahj","name":"Mahajani","numeric":"314"},{"alpha_4":"Mand","name":"Mandaic, Mandaean","numeric":"140"},{"alpha_4":"Mani","name":"Manichaean","numeric":"139"},{"alpha_4":"Marc","name":"Marchen","numeric":"332"},{"alpha_4":"Maya","name":"Mayan hieroglyphs","numeric":"090"},{"alpha_4":"Mend","name":"Mende Kikakui","numeric":"438"},{"alpha_4":"Merc","name":"Meroitic Cursive","numeric":"101"},{"alpha_4":"Mero","name":"Meroitic Hieroglyphs","numeric":"100"},{"alpha_4":"Mlym","name":"Malayalam","numeric":"347"},{"alpha_4":"Modi","name":"Modi, Moḍī","numeric":"324"},{"alpha_4":"Mong","name":"Mongolian","numeric":"145"},{"alpha_4":"Moon","name":"Moon (Moon code, Moon script, Moon type)","numeric":"218"},{"alpha_4":"Mroo","name":"Mro, Mru","numeric":"199"},{"alpha_4":"Mtei","name":"Meitei Mayek (Meithei, Meetei)","numeric":"337"},{"alpha_4":"Mult","name":"Multani","numeric":"323"},{"alpha_4":"Mymr","name":"Myanmar (Burmese)","numeric":"350"},{"alpha_4":"Narb","name":"Old North Arabian (Ancient North Arabian)","numeric":"106"},{"alpha_4":"Nbat","name":"Nabataean","numeric":"159"},{"alpha_4":"Newa","name":"Newa, Newar, Newari, Nepāla lipi","numeric":"333"},{"alpha_4":"Nkgb","name":"Nakhi Geba ('Na-'Khi ²Ggŏ-¹baw, Naxi Geba)","numeric":"420"},{"alpha_4":"Nkoo","name":"N’Ko","numeric":"165"},{"alpha_4":"Nshu","name":"Nüshu","numeric":"499"},{"alpha_4":"Ogam","name":"Ogham","numeric":"212"},{"alpha_4":"Olck","name":"Ol Chiki (Ol Cemet’, Ol, Santali)","numeric":"261"},{"alpha_4":"Orkh","name":"Old Turkic, Orkhon Runic","numeric":"175"},{"alpha_4":"Orya","name":"Oriya","numeric":"327"},{"alpha_4":"Osge","name":"Osage","numeric":"219"},{"alpha_4":"Osma","name":"Osmanya","numeric":"260"},{"alpha_4":"Palm","name":"Palmyrene","numeric":"126"},{"alpha_4":"Pauc","name":"Pau Cin Hau","numeric":"263"},{"alpha_4":"Perm","name":"Old Permic","numeric":"227"},{"alpha_4":"Phag","name":"Phags-pa","numeric":"331"},{"alpha_4":"Phli","name":"Inscriptional Pahlavi","numeric":"131"},{"alpha_4":"Phlp","name":"Psalter Pahlavi","numeric":"132"},{"alpha_4":"Phlv","name":"Book Pahlavi","numeric":"133"},{"alpha_4":"Phnx","name":"Phoenician","numeric":"115"},{"alpha_4":"Piqd","name":"Klingon (KLI pIqaD)","numeric":"293"},{"alpha_4":"Plrd","name":"Miao (Pollard)","numeric":"282"},{"alpha_4":"Prti","name":"Inscriptional Parthian","numeric":"130"},{"alpha_4":"Qaaa","name":"Reserved for private use (start)","numeric":"900"},{"alpha_4":"Qabx","name":"Reserved for private use (end)","numeric":"949"},{"alpha_4":"Rjng","name":"Rejang (Redjang, Kaganga)","numeric":"363"},{"alpha_4":"Roro","name":"Rongorongo","numeric":"620"},{"alpha_4":"Runr","name":"Runic","numeric":"211"},{"alpha_4":"Samr","name":"Samaritan","numeric":"123"},{"alpha_4":"Sara","name":"Sarati","numeric":"292"},{"alpha_4":"Sarb","name":"Old South Arabian","numeric":"105"},{"alpha_4":"Saur","name":"Saurashtra","numeric":"344"},{"alpha_4":"Sgnw","name":"SignWriting","numeric":"095"},{"alpha_4":"Shaw","name":"Shavian (Shaw)","numeric":"281"},{"alpha_4":"Shrd","name":"Sharada, Śāradā","numeric":"319"},{"alpha_4":"Sidd","name":"Siddham, Siddhaṃ, Siddhamātṛkā","numeric":"302"},{"alpha_4":"Sind","name":"Khudawadi, Sindhi","numeric":"318"},{"alpha_4":"Sinh","name":"Sinhala","numeric":"348"},{"alpha_4":"Sora","name":"Sora Sompeng","numeric":"398"},{"alpha_4":"Sund","name":"Sundanese","numeric":"362"},{"alpha_4":"Sylo","name":"Syloti Nagri","numeric":"316"},{"alpha_4":"Syrc","name":"Syriac","numeric":"135"},{"alpha_4":"Syre","name":"Syriac (Estrangelo variant)","numeric":"138"},{"alpha_4":"Syrj","name":"Syriac (Western variant)","numeric":"137"},{"alpha_4":"Syrn","name":"Syriac (Eastern variant)","numeric":"136"},{"alpha_4":"Tagb","name":"Tagbanwa","numeric":"373"},{"alpha_4":"Takr","name":"Takri, Ṭākrī, Ṭāṅkrī","numeric":"321"},{"alpha_4":"Tale","name":"Tai Le","numeric":"353"},{"alpha_4":"Talu","name":"New Tai Lue","numeric":"354"},{"alpha_4":"Taml","name":"Tamil","numeric":"346"},{"alpha_4":"Tang","name":"Tangut","numeric":"520"},{"alpha_4":"Tavt","name":"Tai Viet","numeric":"359"},{"alpha_4":"Telu","name":"Telugu","numeric":"340"},{"alpha_4":"Teng","name":"Tengwar","numeric":"290"},{"alpha_4":"Tfng","name":"Tifinagh (Berber)","numeric":"120"},{"alpha_4":"Tglg","name":"Tagalog (Baybayin, Alibata)","numeric":"370"},{"alpha_4":"Thaa","name":"Thaana","numeric":"170"},{"alpha_4":"Thai","name":"Thai","numeric":"352"},{"alpha_4":"Tibt","name":"Tibetan","numeric":"330"},{"alpha_4":"Tirh","name":"Tirhuta","numeric":"326"},{"alpha_4":"Ugar","name":"Ugaritic","numeric":"040"},{"alpha_4":"Vaii","name":"Vai","numeric":"470"},{"alpha_4":"Visp","name":"Visible Speech","numeric":"280"},{"alpha_4":"Wara","name":"Warang Citi (Varang Kshiti)","numeric":"262"},{"alpha_4":"Wole","name":"Woleai","numeric":"480"},{"alpha_4":"Xpeo","name":"Old Persian","numeric":"030"},{"alpha_4":"Xsux","name":"Cuneiform, Sumero-Akkadian","numeric":"020"},{"alpha_4":"Yiii","name":"Yi","numeric":"460"},{"alpha_4":"Zinh","name":"Code for inherited script","numeric":"994"},{"alpha_4":"Zmth","name":"Mathematical notation","numeric":"995"},{"alpha_4":"Zsye","name":"Symbols (Emoji variant)","numeric":"993"},{"alpha_4":"Zsym","name":"Symbols","numeric":"996"},{"alpha_4":"Zxxx","name":"Code for unwritten documents","numeric":"997"},{"alpha_4":"Zyyy","name":"Code for undetermined script","numeric":"998"},{"alpha_4":"Zzzz","name":"Code for uncoded script","numeric":"999"}],

      
      languageValue: null,
      scriptValue: null,

      availableOptions: [],

      literals: {},


    }
  },

  computed: mapState({
      profilesLoaded: 'profilesLoaded',
      activeProfile: 'activeProfile', 
      idWorkSearchResults: 'idWorkSearchResults',
      rtLookup:'rtLookup',
      profiles: 'profiles',
      idXML:'idXML',

      contextData: 'contextData',


      /**
      * Returns the current scripts defined in th embdeded data
      * @return {array} results - array of scripts
      */  
      scripts: function(){

        let results = this.iso15924.map((d)=>{return {code:d.alpha_4, numeric: d.numeric,name:d.name}})
        results = results.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
        return results
      },
      /**
      * Merges ISO639 arrays into one langauge array and reutrns them
      * @return {array} results - array of languages
      */  
      languages: function(){

        // merge the two arrays of lang codes togther, if 15924 has a 2 char code that was already included ignore it
        let results = this.iso639_1.map((d)=>{return {code:d.code,name:d.name}})
        let iso639_1_names = this.iso639_1.map((d)=>{return d.name})

        let iso639_2Array = this.iso639_2.map((d)=>{ return {code: (d.alpha_3) ? d.alpha_3 : d.alpha_2 , name:d.name}})

        iso639_2Array.forEach((c)=>{
          if (iso639_1_names.indexOf(c.name)===-1){
            results.push(c)
          }

        })


        // results = results.filter((d)=>{ return d})

        // sort by label 
        results = results.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))



        return results


      }, 

      /**
      * Returns the current codes to set script lang, used in template
      * @return {object} results - object of codes
      */  
      availableOptionsCodes: function(){

        let results = {}
        for (let opt of this.availableOptions){
          let code = opt.l.code.toLowerCase() + '-' + opt.s.code.toLowerCase()
          results[code] = opt
        }
        return results
      }

      

    }),
  methods: {

    /**
    * kicks off the dispatch event to store the sepcified lang/script to a literal in the profile userValue
    * @return {void} 
    */  
    selectLang: function(literalObj,lang){
      this.$store.dispatch("setLangLiterals", { self: this, literalObj:literalObj, lang:lang }).then(() => {
        this.refreshDisplay()
      })
    },

    /**
    * refreshes the data so the template can update
    * @return {void} 
    */  
    refreshDisplay: function(){

      // load the saved langauge options
      if (localStorage.getItem('bfeLiteralLanguageOptions')!== null){
        this.availableOptions = JSON.parse(localStorage.getItem('bfeLiteralLanguageOptions'))
      }


      // scan for existing literals in the record
      this.literals = parseProfile.returnLiterals(this.activeProfile)

      // we want to review the langues returned from the found literals so they are an option and show selected
      for (let key in this.literals){
        for (let literal of this.literals[key]){
          if (literal.language){
            if (literal.language.indexOf('-')>-1){
              let codes = literal.language.split('-')
              let l = this.languages.filter((d) => { if (d.code.toLowerCase() === codes[0].toLowerCase()){ return true}else{return false} })
              let s = this.scripts.filter((d) => { if (d.code.toLowerCase() === codes[1].toLowerCase()){ return true}else{return false} })
                
              if (l.length>0 && s.length>0){
                this.availableOptions.push({l:l[0],s:s[0]})
              }

              let exsitingCodes = []
              let toAdd = []
              for (let opt of this.availableOptions){
                let c = opt.s.code + '-' + opt.l.code
                if (exsitingCodes.indexOf(c) === -1){
                  exsitingCodes.push(c)
                  toAdd.push(opt)
                }
              }


              this.availableOptions = toAdd
              localStorage.setItem('bfeLiteralLanguageOptions',JSON.stringify(toAdd))

            }
          }
        }
      }
    },

    /**
    * Remove one of the default options and updates local storage
    * @return {void} 
    */  
    removeLangOption: function(idx){

      this.availableOptions.splice(idx, 1)
      localStorage.setItem('bfeLiteralLanguageOptions',JSON.stringify(this.availableOptions))

    },

    /**
    * stores an script/lang in the localSotrage and current display
    * @return {void} 
    */  
    addOption: function(){


      if (this.languageValue && this.scriptValue){

        let l = this.languages.filter((d) => { if (d.name === this.languageValue){ return true}else{return false} })
        l = l[0]

        let s = this.scripts.filter((d) => { if (d.name === this.scriptValue){ return true}else{return false} })
        s = s[0]

        this.availableOptions.push({l:l,s:s})


        localStorage.setItem('bfeLiteralLanguageOptions',JSON.stringify(this.availableOptions))



      }


    },

    /**
    * Calles an event on the parent to close this modal
    * @return {void} 
    */  
    closeLitLang: function(){
      this.$parent.toggleLiteralLanguage()
    }
  },




  created: function () {


  },


  mounted: function () {
    


  }
};
</script>
