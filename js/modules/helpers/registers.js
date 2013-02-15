define(['handlebars'], function(Handlebars){
    var months = [{
            s: 'jan',
            l: 'janvier'
        }, {
            s: 'fév',
            l: 'février'
        }, {
            s: 'mar',
            l: 'marw'
        }, {
            s: 'avr',
            l: 'avril'
        }, {
            s: 'mai',
            l: 'mai'
        }, {
            s: 'jui',
            l: 'juin'
        }, {
            s: 'juil',
            l: 'juillet'
        }, {
            s: 'aoû',
            l: 'août'
        }, {
            s: 'sep',
            l: 'septembre'
        }, {
            s: 'oct',
            l: 'octobre'
        }, {
            s: 'nov',
            l: 'novembre'
        }, {
            s: 'déc',
            l: 'décembre'
    }];

    Handlebars.registerHelper('newLabel', function(date, lastUpdate) {
        if(date > lastUpdate){
            return 'label-success';
        }

        return '';
    });

    Handlebars.registerHelper('encode', function(text) {
        return (text+'').toLowerCase().replace(/ /g, '-');
    });

    Handlebars.registerHelper('longDate', function(date) {
        if(date){
            date = new Date(date);
            return date.getDate() + " " + (months[date.getMonth()].l) + " " + date.getFullYear();
        }

        return '';
    });

    Handlebars.registerHelper('shortDate', function(date) {
        if(date){
            date = new Date(date);
            return date.getDate() + " " + (months[date.getMonth()].s) + " " + date.getFullYear();
        }

        return '';
    });

    return Handlebars;
});