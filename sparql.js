SPARQL = function(o) {
  this.query = function(q) {
    return $.ajax({
      url: o.endpoint,
      accepts: {json: "application/sparql-results+json"},
      data: {query: q, apikey: o.apikey},
      dataType: "json",
    });
  };
};



var bioportal = new SPARQL({ 
           apikey: "YOUR-API-KEY-HERE", 
          
           endpoint: "http://collection.britishart.yale.edu/openrdf-sesame/repositories/ycba"
         });


    var secfl_string = "PREFIX crm: <http://erlangen-crm.org/current/>  \n\
                      PREFIX fts: <http://www.ontotext.com/owlim/fts#> \n\
                            SELECT DISTINCT ?id ?url WHERE { \n\
                           {?Subject crm:P70_is_documented_in ?image_list . \n\
                           ?image_list crm:P70_is_documented_in ?image . \n\
                           ?image crm:P1_is_identified_by ?url . \n\
                           FILTER regex(?url, '.*/format/1')} \n\
                           {?Subject crm:P1_is_identified_by ?objectUri . \n\
                           ?objectUri rdfs:label ?id . \n\
                            FILTER regex(str(?objectUri), '/TMS')} \n\
                            {?Subject crm:P55_has_current_location ?hasValue . \n\
                            ?hasValue rdfs:label ?room . \n\
                            FILTER regex(?room, '209')} \n\
                        }";

    var temp_string = "PREFIX crm: <http://erlangen-crm.org/current/>  \n\
                        PREFIX fts: <http://www.ontotext.com/owlim/fts#> \n\
                          SELECT ?id ?url WHERE { \n\
                          FILTER regex(?url, '.*/format/1') \n\
                          FILTER regex(?val, '4') \n\
                          {?isValueOf crm:P55_has_current_location ?location . \n\
                          ?location rdfs:label ?val .} \n\
                          {?isValueOf crm:P1_is_identified_by ?objectUri . \n\
                          ?objectUri rdfs:label ?id . \n\
                          FILTER regex(str(?objectUri), '/TMS')} \n\
                          {?isValueOf crm:P70_is_documented_in ?image_list . \n\
                          ?image_list crm:P70_is_documented_in ?image . \n\
                          ?image crm:P1_is_identified_by ?url} \n\
                          { ?isValueOf ?property ?Subject } \n\
                          {?Subject rdfs:label ?hasValue . \n\
                          <Bay02:> fts:prefixMatchIgnoreCase ?hasValue.} \n\
                      }";

    var temp_string2 = "PREFIX crm: <http://erlangen-crm.org/current/> \n\
                              SELECT DISTINCT ?title WHERE { \n\
                              {<http://collection.britishart.yale.edu/id/object/499> rdfs:label ?title} \n\
                          } \n\
                          LIMIT 1";

    var temp_string3 = "PREFIX crm: <http://erlangen-crm.org/current/> \n\
                        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n\
                              SELECT DISTINCT ?artist WHERE { \n\
                              {<http://collection.britishart.yale.edu/id/object/499/production/1> crm:P14_carried_out_by ?person . \n\
                              ?person skos:prefLabel ?artist} \n\
                          } \n\
                          LIMIT 1";

function createStr(fl, str) {
    var string = temp_string.replace("Bay02",str);
    var string2 = string.replace("4", fl);
    return string2;
  }

    function enlargeNow(str){
      var Myimage = document.getElementById(str);
      var image = new Image();
      image.src = str;
      Myimage.width=image.naturalWidth;
      Myimage.height=image.naturalHeight;
    }

    function createTAQuery(type, id) {
      var string3 = "";
      if (type == "title"){
        string3 = temp_string2.replace("499", id);
      }else {
        string3 = temp_string3.replace("499", id);
      }
    return string3;
    }

    function show_image(id, src) {
      var img = document.getElementById("placeholder");
      img.src = src;
      var image = new Image();
      image.src = src;
      img.width=image.naturalWidth;
      img.height=image.naturalHeight; 
      var query_string = temp_string2.replace("499", id);
      bioportal.query(query_string).done(displayTitle).error(onFailure);
      query_string = temp_string3.replace("499", id);
      bioportal.query(query_string).done(displayArtist).error(onFailure);
    }

    function displayTitle(json) {
      var value = json.results.bindings[0][json.head.vars[0]];
      var title = value.value;
      document.getElementById("title").innerHTML = "Title: " + title;
    }

    function displayArtist(json) {
      if (json.results.bindings[0] == null){
        document.getElementById("artist").innerHTML = "Artist: None";
        return;
      }
      var value = json.results.bindings[0][json.head.vars[0]];
      var title = value.value;
      document.getElementById("artist").innerHTML = "Artist: " + title;
    }


    function onFailure(xhr, status) {
        document.write(xhr);
        document.write(status);
        document.getElementById("result").innerHTML = status + " (See console.)";
        console.log("error");
        console.log(xhr);
    }

    function onSuccess(json) {
        var html = "<table border='1'>";
        var hits = 0;
        var id = 0;
        for (var b in json.results.bindings) {
            if (hits % 10 == 0){
              html += "<tr>";
            }
            hits++;
            for (var x in json.head.vars) { 

                var value = json.results.bindings[b][json.head.vars[x]];
                console.log(x);
                if (x == 1)
                  html += "<td><img id='" + id + "' src='" + value.value + "' width=\"20\" height=\"20\" onclick=\"show_image(id, src)\"></td>"
                else
                  id = value.value;
            }
        }
        html += "</table>";
        document.getElementById("hits").innerHTML = "Number of results: " + hits;
        document.getElementById("result").innerHTML = html;
    }

    function query(fl, str){
      var query_string = createStr(fl, str);
      bioportal.query(query_string).done(onSuccess).error(onFailure);
    }
