
var i18next = require('i18next');

var countries_ = ['Israel', 'United_States'];

var Choices = function() {};

    

    Choices.prototype.countries = function () {
        return countries_.map(function(identifier){
            return i18next.t(identifier);
        });
    };

    Choices.prototype.occupations = function () {
        return ['Artist', 'Engineer'];
    };

    Choices.prototype.hobbies = function () {
        return ['Music', 'Movies'];
    };
    Choices.prototype.burning_man_events = function () {

       return ['1978', '1988'];
    };
    Choices.prototype.midburn_events = function () {return  ['2014', '2015','2016'];};

    Choices.prototype.ways_of_paricipation = function () {
        return ["Theme Camp", "Sound Camp", "Art Installation", "Volunteering During The Event", "Havn't decided yet"]; 

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