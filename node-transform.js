/*global require console*/
var fs = require('fs'),
    $ = require('jquery'),
    xmlFile = 'albums.xml',
    jsonFile = 'albums.json',
    $doc,
    output = [],
    linkRegEx = /picasaweb.google.com\/([0-9]*)\/[^\?]*\?(.*)$/,
    guidRegEx = /([0-9]*)\?/,
    promises = [],
    titleMap = {"1962-- A":"1er album",
        "1962-- B":"2ème album",
        "1962-C- VACANCES 1962 - SAINT NICOLAS":"Vacances Saint-Nicolas",
        "1962-D- VACANCES 1962 - SAINT NICOLAS":"Vacances Saint-Nicolas (bis)",
        "1963 - TOUR DE FRANCE":"Tour de France",
        "1963-E- VACANCES 1963 - SAINT NICOLAS - CHEZ GERVAISE":"Saint-Nicolas – Gervaise",
        "1963-F- VACANCES 1963 - SAINT NICOLAS (AIGUILLE DU MIDI)":"Aiguille du Midi",
        "1964 - PORTRAIT DE FAMILLE ROUCHERAY":"Portrait",
        "1964-G- VACANCES 1964 - SAINT NICOLAS (VOGUES FLUMET)":"Vogue de Flumet",
        "1964-H- VACANCES 1964 - SAINT NICOLAS (VOGUE - MONTREUX)":"Vogue – Montreux",
        "1965-I- MAI 1965 (COMMUNION-JEAN-LUC)":"Communion Jean-Luc",
        "1965-J- NOVEMBRE 1965":"Novembre 1965",
        "1966-K- VACANCES 1966":"Vacances 1966",
        "1966-L- VACANCES MONTAGNE":"Vacances 1966 (bis)",
        "1967-05- FRANCOISE REINE DU MUGUET":"Reine du Muguet",
        "1967-M- VACANCES 1967":"Vacances 1967",
        "1967-N- VACANCES 1967":"Vacances 1967 (bis)",
        "1967-O- OCTOBRE 1967 VACANCES":"Octobre 1967",
        "1967-P- NOVEMBRE 1967 - FIANCAILLES FRANCOISE & DANIEL":"Fiançailles Françoise & Daniel",
        "1968-03 - FIANCAILLES JEAN-MICHEL & MARIE-CLAUDE":"Fiançailles Marie-Claude et Jean-Michel",
        "1968-07 - MARIAGE JEAN-MICHEL & MARIE-CLAUDE":"Mariage Marie-Claude & Jean-Michel",
        "1968-07 - MARIAGE JEAN-MICHEL & MARIE-CLAUDE (BIS)":"Mariage Marie-Claude & Jean-Michel (BIS)",
        "1968-07 - MARIAGE JEAN-MICHEL & MARIE-CLAUDE (TER)":"Mariage Marie-Claude & Jean-Michel (TER)",
        "1968-Q- - MARIAGE FRANCOISE & DANIEL":"Mariage Françoise & Daniel",
        "1968-T- VACANCES 1968":"Vacances 1968",
        "1968-U- VACANCES 1968 BIS":"Vacances 1968 (bis)",
        "1969-03":"Mars 1969",
        "1969-04 - ANNIVERSAIRE MARIAGE FRANCOISE & DANIEL":"Anniv. Mariage Françoise & Daniel",
        "1969-07 - BAPTEME CHRISTOPHE":"Baptême Christophe",
        "1969-12 - FETE - SCENE MARIONNETTE":"Fête",
        "1970-07":"Juillet 1970",
        "1970-07 - SAINT JEAN DE MONTS":"Saint Jean de Monts",
        "1971-07 - R -":"Juillet 1971",
        "1971-08":"Août 1971",
        "1972-06 - R -":"Juin 1972",
        "1972-09":"Septembre 1972",
        "1973-01":"Janvier 1973",
        "1974-03":"Mars 1974",
        "1974-07":"Juillet 1974",
        "1976-01":"Janvier 1976",
        "1976-12":"Décembre 1976",
        "1976-12 - BARBECUE & CONSTRUCTION":"Barbecue et Chantier",
        "1977-06 - MARIAGE JEAN-LUC & AGNES":"Mariage Jean-Luc & Agnès",
        "1977-11":"Novembre 1977",
        "1978-10 - R -":"Octobre 1978",
        "1978-10 - R - (BIS)":"Octobre 1978 (bis)",
        "1979-04":"Avril 1979",
        "1979-09 - R -":"Septembre 1979",
        "1979-11 - MAINVILLIERS & SAINT JEAN DE MAURIENNE":"Mainvilliers et St Jean de Maurienne",
        "1980-08":"Août 1980",
        "1981-05":"Mai 1981",
        "BATIMENTS - FORGE BEUDIN":"Bâtiments – Forge Beudin",
        "CHEVAL":"Cheval",
        "COL-PAYSAGES - R -":"Paysages du Col – Valloire",
        "COL-TRAVAUX - R -":"Travaux au Col – Valloire",
        "FILMS & NEGATIFS":"Films & Négatifs",
        "GRECE - R -":"Voyage en Grèce",
        "IMMEUBLES":"Immeubles",
        "MONTAGNE":"Montagne",
        "MONTAGNE - JEAN-PIERRE":"Montagne (bis)",
        "MONTAGNE (SUISSE...) - R -":"Montagne (ters)",
        "ROU-JACQUES":"Jacques et Raymonde",
        "VAC-MONTAGNE":"Vacances à la montagne",
        "VOYAGE (BONNE SOEUR, SUISSE) - R -":"Voyage Suisse"};


fs.readFile(xmlFile, 'utf-8', function(err, docStr) {
    if (err) {throw err;}
    var Dom = require('xmldom').DOMParser,
        doc = new Dom().parseFromString(docStr),
        $doc = $(doc);

        $doc.find('item').each(function(i, item){
        var $item = $(item),
            it = {
                title : $item.find('title').first().text(),
                thumb : $item.find('media\\:group').find('media\\:thumbnail').attr('url'),
                link : $item.find('link').first().text()
            },
            year = new Date($item.find('pubDate').text()).getFullYear(),
            parsedYear,
            linkMatch = it.link.match(linkRegEx),
            guidMatch = $item.find('guid').first().text().match(guidRegEx),
            promise;

        it.displayTitle = titleMap[it.title] || it.title;

        if(!titleMap[it.title]){
            console.log("Exclure cet album", it.title);
            return;
        }


        it.id = encodeURI(it.displayTitle.toLowerCase().replace('?', '').replace(/ /g, '-'));
        parsedYear = parseInt(it.title, 10);
        if(!isNaN(parsedYear)){
            year = parsedYear;
        }

        if(year >= 2012){
            year = "Sans date";
        }

        it.year = year;
        //console.log($item.find('link').text(), linkMatch);

        if(linkMatch && guidMatch){
            it.rss = "http://picasaweb.google.com/data/feed/base/user/"+linkMatch[1]+"/albumid/"+guidMatch[1]+"?alt=json&kind=photo&"+linkMatch[2]+"&hl=fr";
            promise = $.getJSON(it.rss, function(data){
                console.log("Loaded", it.rss);
                //it.entry = data.feed.entry;
                it.entry = [];
                $.each(data.feed.entry, function(i, entry){
                    var entryObj = {
                        src : entry.content.src,
                        title : entry.title.$t,
                        thumbs : []
                    };

                    $.each(entry.link, function(k, link){
                        if(link.rel === "alternate"){
                            entryObj.link = link.href;
                            return false;
                        }
                    });


                    $.each(entry.media$group.media$thumbnail, function(j, thumb){
                        entryObj.thumbs.push({
                            url : thumb.url,
                            width : thumb.width,
                            height : thumb.height
                        });
                    });

                    it.entry.push(entryObj);
                });

                /*$.each(data.feed.entry, function(i, entry){

                });*/
                //console.log('ok', data);
            }).fail(function(error){
                console.log('error', it.title, error);
            });
            promises.push(promise);
        }else{
            console.log("No rss link on " + it.title);
            //console.log(">", $item.find('link').text());
        }
        output.push(it);
        //console.log(it.url);
    });
    $.when.apply($, promises).always(function(){
        console.log("Process finished");
        //$pre.text(JSON.stringify(output, null, 4));
        //console.log(JSON.stringify(output, null, 4));
        fs.writeFile(jsonFile, JSON.stringify(output/*, null, 4*/), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log(jsonFile, " was saved!");
            }
        });
    });
    //console.log($doc)



//    console.log(output[0].rss);
    /*$.getJSON(output[0].rss, function(data){
        console.log(data);
    });*/
});