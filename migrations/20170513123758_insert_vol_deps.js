let constants = require('../models/constants');
exports.up = function(knex, Promise) {
    return Promise.all([
        knex(constants.VOLUNTEERS_TABLE_NAME).del()
        .then(knex(constants.VOL_DEPARTMENTS_TABLE_NAME).del())
        .then(() => {
            return knex(constants.VOL_DEPARTMENTS_TABLE_NAME).insert([
                
{'name_en': 'Art', 'name_he': 'אמנות'},
{'name_en': 'Safety', 'name_he': 'בטיחות'},
{'name_en': 'Spokesmen', 'name_he': 'דוברות'},
{'name_en': 'Legal','name_he':'ייעוץ משפטי'},
{'name_en': 'Permit', 'name_he': 'רישוי'},
{'name_en': 'Finance', 'name_he': 'כספים'},
{'name_en': 'Tech','name_he':'מערך טכנולוגי'},
{'name_en': 'Knowledge Management','name_he':'ניהול ידע ותוכן'},
{'name_en': 'Art Fund','name_he':'קרן האמנות'},
{'name_en': 'Strategic Relations','name_he':'קשרים אסטרטגיים'},
{'name_en': 'Support', 'name_he': 'תמיכה'},
{'name_en': 'Communication', 'name_he': 'תקשורת'},
{'name_en': 'Gate', 'name_he': 'גייט'},
{'name_en': 'Greeters', 'name_he': 'גריטרס'},
{'name_en': 'Accessibility', 'name_he': 'הנגשה'},
{'name_en': 'Technical Production','name_he': 'הפקה טכנית'},
{'name_en': 'Chabak (Control Room)','name_he': 'חב"ק'},
{'name_en': 'Meal-Burn','name_he':'מטבח מתנדבים'},
{'name_en': 'Vision', 'name_he': 'חזון'},
{'name_en': 'Traffic', 'name_he': 'חניה'},
{'name_en': 'Lighthouse', 'name_he': 'מגדלור'},
{'name_en': 'Planning','name_he': 'מו"ת'},
{'name_en': 'Theme Camps','name_he': 'מחנות נושא'},
{'name_en': 'Mapatz','name_he': 'מפ"צ'},
{'name_en': 'Playa Info','name_he': 'מרכזיה'},
{'name_en': 'Health Care','name_he': 'מרפאה'},
{'name_en': 'Nomads', 'name_he': 'נוודים'},
{'name_en': 'Arctica', 'name_he': 'קרחנה'},
{'name_en': 'Fire', 'name_he': 'אש'},
{'name_en': 'Matar (LNT)','name_he': 'מטר'},
{'name_en': 'Volunteers','name_he': 'הון אנושי/ מתנדבים'},
{'name_en': 'Salon', 'name_he': 'סלון'}
            ])
         }
        )
    ]);  
};

exports.down = function(knex, Promise) {
  
};
