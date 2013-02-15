/*global define*/
define(['jquery', 'backbone', 'handlebars', 'underscore','controllers/router'], function($, Backbone, Handlebars, _, Router){
    var router = Router();

    return Backbone.View.extend({
            el: $(".main"),
            events: {
                'click .nav a': 'scroll',
                'click .coverlink' : 'showAlbum'
            },
            initialize: function() {
                this.render();
            },
            render : function(){
                var tpl = Handlebars.compile(this.options.coversTemplate),
                    pagTpl = Handlebars.compile(this.options.paginationTemplate),
                    albums = _.sortBy(this.model, 'year'),
                    tplOut = '',
                    yearKeys = _.uniq(_.pluck(albums, 'year')).sort(function(a, b){
                        if(typeof b === 'string' || a < b){
                            return -1;
                        }else if(typeof a === 'string' || a > b){
                            return 1;
                        }

                        return 0;
                    });

                albums = _.groupBy(albums, 'year');

                //$('.sidebar').html(pagTpl({year : yearKeys}));
                tplOut += pagTpl({year : yearKeys});
                tplOut += '<div class="span10">';
                _.each(yearKeys, function(year){
                    tplOut += tpl({
                        year : year,
                        albums : albums[year].reverse()
                    });
                });
                tplOut += '</div>';
                this.$el.html(tplOut);

                $('.navbar').affix({
                    offset: { top: 180 }
                });
            },
            scroll: function(e) {
                var $e = $(e.currentTarget),
                    id = $e.attr("href");

                $('.nav li').removeClass('active');
                $e.parent().addClass('active');

                if(id === '#'){
                    id = '';
                }
                router.navigate(id, {trigger: true});
                return false;
            },
            showAlbum : function(e){
                var $link = $(e.currentTarget),
                    href = $link.data('href');

                router.navigate('album/' + href, {trigger: true});

                return false;
            }
        });
});