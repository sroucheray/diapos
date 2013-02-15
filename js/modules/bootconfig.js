/*global define*/
define({
    require: { //RequireJS config
        paths: {
            "libs": "../libs",
            "underscore": "../libs/underscore/underscore-min",
            "bootstrap": "../libs/bootstrap/bootstrap",
            "handlebars": "../libs/handlebars/handlebars-1.0.rc.1",
            "backbone": "../libs/backbone/backbone",
            "registers" :"helpers/registers",
            "text" : "plugins/text",
            "tpl" : "../templates",
            "mousewheel" : "../libs/jquery/jquery.mousewheel",
            "jscrollpane" : "../libs/jquery/jquery.jscrollpane.min"
        },
        shim: {
            "underscore": {
                exports: "_"
            },
            "handlebars": {
                exports: "Handlebars"
            },
            "backbone": {
                deps: ["underscore", "jquery"],
                exports: "Backbone"
            },
            "bootstrap": ['jquery'],
            "jscrollpane": ['jquery', 'mousewheel']
        }
    },
    options: {}, //Bootscope config,
    routes: { //Feature to module mapping
        app : "views/appView"
    },
    globals: { //Any parameter that can be retreived in bootsope.global
        baseUrl : "diapos",
        getUrl : function(subPath){
            return "/" + this.baseUrl + "/" + subPath;
        }
    }
});