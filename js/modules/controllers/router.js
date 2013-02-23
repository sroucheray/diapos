/*global define _gaq*/
define(['jquery', 'backbone', 'handlebars', 'underscore', 'bootscope', 'require', 'bootstrap', 'registers'], function($, Backbone, Handlebars, _, bs, require){
    var AppRouter,
        router,
        albumsDeffered = $.getJSON("/diapos/albums.json"),
        cover,
        prevAlbumView,
        currentYear;

    function scrollTo(id, preventAnimation){
        var scrollToSize = 0,
            offset;

        if(id !== '#'){
            offset = $('#' + id).offset();
            if(offset){
                scrollToSize = offset.top;
            }
        }

        $(window).off('scroll', scrollMonitor);

        $('html, body').animate({
            scrollTop:scrollToSize
        }, preventAnimation ? 0 : 'slow', 'swing', function(){
            setTimeout(function(){
                $(window).scroll(scrollMonitor);
            }, 100);
        });
    }

    function scrollMonitor() {
        var $selectedAnchor, diff = Infinity,
            $el,
            id, hash;

        $(".anchor").each(function(b, c) {
            var $c = $(c),
                dir = $c.offset().top - $(window).scrollTop(),
                currentDiff = Math.abs(dir);

            if (currentDiff < diff) {
                $selectedAnchor = $c;
                diff = currentDiff;
            }
        });
        if($selectedAnchor){
            id = $selectedAnchor.attr('id');
        }
        if (id) {
            hash = '#' + id;

            $el = $('.nav a[href*="' + hash + '"]');

            $('.nav li').removeClass('active');
            $el.parent().addClass('active');

            router.navigate(id, {
                trigger: false,
                replace : true
            });
        }
    }

    AppRouter = Backbone.Router.extend({
        routes: {
            "" : "covers",
            ":year" : "coversYear",
            "album/:cover(/:mode)(/:image)": "diapos",
            ":albums": "albums"
        },
        buildBreadCumb : function(album, year){
            var $bc = $('.breadcrumb'),
                $lis = $bc.find('li');

            $lis.first().find('.divider').remove();
            $lis.slice(1).remove();

            if(album){
                $('<li><a href="#" class="active">' + album + '</a> <a class="show-in-google" target="_blank" data-toggle="tooltip" data-placement="bottom" title="Afficher l\'album sur Google Picasa / Google Plus"><i class="icon-share icon-white"></i></a></li>').insertAfter($bc.find('li').last());
                $lis.first().append(' <span class="divider">/</span>');
                $lis.first().children('a').attr('href', year).text('Retour à la liste des albums').removeClass('active');
            }else{
                $lis.first().children('a').text('Liste des albums').addClass('active');
            }

            _gaq.push(['_trackPageview']);
        },
        covers : function(){
            var that = this,
                $modal = $('#myModal');

            if($modal.length > 0){
                $modal.modal('hide');
            }

            albumsDeffered.done(function(albums){
                require(['views/covers'], function(CoversView){
                        if(!cover){
                            cover = new CoversView({model : albums});
                        }else{
                            cover.render();
                        }

                        if(currentYear){
                            scrollTo(currentYear);
                        }else{
                            scrollTo('#');

                        }

                        this.currentView = cover;

                        that.buildBreadCumb();
                    }
                );
            });

            _gaq.push(['_trackPageview']);
        },
        coversYear : function(year){
            var $modal = $('#myModal');

            if($modal.length > 0){
                $modal.modal('hide');
            }

            albumsDeffered.done(function(albums){
                require(['views/covers'], function(CoversView){
                        if(!cover){
                            cover = new CoversView({model : albums});
                        }else if(this.currentView !== cover){
                            cover.render();
                        }

                        scrollTo(year);

                        this.currentView = cover;
                    }
                );
            });

            _gaq.push(['_trackPageview']);
        },

        diapos: function(albumId, mode, image) {
            var that = this,
                displayAsList = (mode === 'liste') ? true : false;
            albumsDeffered.done(function(albums){
                require(['views/album'], function(AlbumView){
                        if(prevAlbumView){
                            prevAlbumView.undelegateEvents();
                        }
                        prevAlbumView = new AlbumView({
                            model : albums,
                            displayList : (mode === 'liste'),
                            displayCarousel : (mode === 'lightbox') ? image : false,
                            albumId : albumId,
                            displayAsList : displayAsList
                        });

                        this.currentView = prevAlbumView;


                        var alb = _.filter(albums, function(itAlb){
                            return itAlb.id === albumId;
                        });
                        that.buildBreadCumb(alb[0].displayTitle, (alb[0].year + '').toLowerCase().replace(/ /g, '-'));

                        $('.show-in-google').attr('href', alb[0].link);
                        $('[data-toggle="tooltip"]').tooltip();

                        if(image){
                            scrollTo('image' + image.replace('.jpg', ''), true);
                        }else{
                            scrollTo('#', true);
                        }
                    }
                );
            });

            _gaq.push(['_trackPageview']);
        },
        initialize : function(){
            $('.breadcrumb a').click(function(){
                var $this = $(this),
                    href = $this.attr('href');

                if(href === '#'){
                    href = '';
                }

                router.navigate(href, {
                    trigger: true
                });

                return false;
            });


            $(window).scroll(scrollMonitor);
        }
    });

    return function(){
        if(!router){
            router = new AppRouter();

            Backbone.history.start({
                root: bs.globals.baseUrl,
                pushState: true
            });
        }

        return router;
    };
});