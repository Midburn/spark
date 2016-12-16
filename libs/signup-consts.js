
var i18next = require('i18next');

var countries_ = ['Israel', 'United_States'];


var occupations_ = ['artist', 'engineer'];

var hobbies_ = ['music', 'movies'];

var burning_man_events_ = ['1978', '1988']; //add more events

var midburn_events_ = ['2014', '2015','2016'];

var ways_of_paricipation_ = ['theme_camp', 'sound_camp', 'art_installation', 'volunteering', 'havent_decided']; 
//["Theme Camp", "Sound Camp", "Art Installation", "Volunteering During The Event", "Havn't decided yet"];

function  translate(identifier, lang) {
    return { "identifier" : identifier , "translation" : i18next.t("signup." + identifier, {lng : lang}) };
}

var Choices = function() {};

    

    Choices.prototype.countries = function (lang) {
        var res = countries_.map(function (x) {return translate ("countries." + x, lang);}); 
        return res ;
    };

    Choices.prototype.occupations = function (lang) {
        var res = occupations_.map(function (x) {return translate ("occupations." + x, lang);});
        return res ;
    };

    Choices.prototype.hobbies = function (lang) {
        var res = hobbies_.map(function (x) {return translate ("hobbies." + x, lang);});
        return res ;
    };
    Choices.prototype.burning_man_events = function () {
       return burning_man_events_;
    };
    Choices.prototype.midburn_events = function () {
        return midburn_events_;
    };

    Choices.prototype.ways_of_paricipation = function (lang) {
        var res = ways_of_paricipation_.map(function (x) {return translate ("participation." + x, lang);});
        return res ; 

    };


/*
var choices = {
    countries: ['Israel', 'United States'],
    occupations: ['Artist', 'Engineer'],
    hobbies: ['Music', 'Movies'],
    burn_man_events: ['1978', '1988'],
    midburn_events: ['2014', '2015','2016'],
    ways_of_paricipation : ["Theme Camp", "Sound Camp", "Art Installation", "Volunteering During The Event", "Havn't decided yet"]


};


*/




module.exports = new Choices();