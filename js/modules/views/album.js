/*global define require*/
define(['jquery', 'backbone', 'handlebars', 'underscore','controllers/router', 'bootscope'], function($, Backbone, Handlebars, _, Router, bs){
    var router = Router(),
        templateUrl = 'text!' + bs.globals.getUrl('js/templates/carousel.phtml');

    require([templateUrl]);

    /*
    * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
    * Author: Jim Palmer (based on chunking idea from Dave Koelle)
    */
     function naturalSort (a, b) {
        var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
            sre = /(^[ ]*|[ ]*$)/g,
            dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hre = /^0x[0-9a-f]+$/i,
            ore = /^0/,
            i = function(s) { return naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
            // convert all to strings strip whitespace
            x = i(a).replace(sre, '') || '',
            y = i(b).replace(sre, '') || '',
            // chunk/tokenize
            xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            // numeric, hex or date detection
            xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
            yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
            oFxNcL, oFyNcL;
        // first try and sort Hex codes or Dates
        if (yD)
            if ( xD < yD ) return -1;
            else if ( xD > yD ) return 1;
        // natural sorting through split numeric strings and default strings
        for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
            // find floats not starting with '0', string or 0 if not defined (Clint Priest)
            oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
            oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
            // handle numeric vs string comparison - number < string - (Kyle Adams)
            if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
            // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
            else if (typeof oFxNcL !== typeof oFyNcL) {
                oFxNcL += '';
                oFyNcL += '';
            }
            if (oFxNcL < oFyNcL) return -1;
            if (oFxNcL > oFyNcL) return 1;
        }
        return 0;
    }

    return Backbone.View.extend({
            el: $(".main"),
            events: {
                'click h3 a': 'backToCovers',
                'click .diapo' : 'showCarousel',
                'click .modal-body a.left' : 'previous',
                'click .modal-body a.right' : 'next'
            },
            getAlbum : function(){
                var that = this;
                if(this.album){
                    return this.album;
                }else{
                    return (this.album = _.find(this.model, function(album){ return album.id === that.options.albumId; }));
                }
            },
            getDiapoData : function(title){
                return _.find(this.getAlbum().entry, function(entry){ return entry.title === title; });
            },
            initialize: function() {
                var tpl = Handlebars.compile(this.options.albumTemplate),
                    album = this.getAlbum();

                album.entry = album.entry.sort(function(a, b){
                    return  naturalSort(a.title, b.title);
                });
                this.$el.html(tpl(album));
               // $('#myModal').modal('hide');
            },
            backToCovers : function(){
                router.navigate("", {trigger: true});

                return false;
            },
            showCarousel : function(e){
                var $thisDiapo = $(e.currentTarget);

                this.options.index = $thisDiapo.parent().index();

                this.showDiapo();

                return false;
            },
            showDiapo : function(){
                var that = this,
                    $allLis = $('.thumbnails li'),
                    num = $allLis.length,
                    $thisDiapo,
                    title;

                if(this.options.index < 0){
                    this.options.index = num - 1;
                }

                if(this.options.index >= num){
                    this.options.index = 0;
                }

                $thisDiapo = $allLis.eq(this.options.index).find('.diapo');
                title = $thisDiapo.data('title');

                require([templateUrl], function(carouselTemplate){
                    var tpl = Handlebars.compile(carouselTemplate),
                        diapo = that.getDiapoData(title);
                    $('<img />').attr('src', diapo.src).load(function(e){
                        $('#myModal').find('.modal-body').html(tpl({
                            diap : that.getDiapoData(title),
                            width : e.target.naturalWidth,
                            height : e.target.naturalHeight
                        }));
                        $('#myModal').find('h3').text(that.getAlbum().displayTitle + ' > ' + title);
                        $('#myModal').modal('show');
                    });
                });
            },
            previous : function(){
                this.options.index--;
                this.showDiapo();
            },
            next : function(){
                this.options.index++;
                this.showDiapo();
            }

        });
});