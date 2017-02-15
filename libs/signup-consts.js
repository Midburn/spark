
var i18next = require('i18next');

var countries_ = require('./countries.js').counties; 

var occupations_ = ['artist', 'engineer'];

var hobbies_ = ['music', 'movies'];

var burning_man_events_ = ['1978', '1988']; //add more events

var midburn_events_ = ['2014', '2015','2016'];

var ways_of_paricipation_ = ['theme_camp', 'sound_camp', 'art_installation', 'volunteering', 'havent_decided']; 


module.exports = {
    COUNTRIES: countries_,
    OCCUPATIONS : occupations_,
    HOBBIES : hobbies_,
    BURNING_MAN_EVENTS : burning_man_events_,
    MIDBURN_EVENTS : midburn_events_ ,
    WAYS_OF_PARICIPATION: ways_of_paricipation_
} 
