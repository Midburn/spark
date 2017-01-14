function Camps() {

    var _usersList = [];
    var _campsList = [];

    //DOM elements
    function _create(type, id, classList) {
        var element = document.createElement(type);
        if (id)
            element.id = id;
        if (classList && Array.isArray(classList))
            element.classList = classList;
        return element;
    }

    function getUsersList() {
        $.getJSON('/users', function(data) {
            _usersList = data.users;
            renderContactsList();
        });
    }

    function getCampsList() {
        $.get('/camps', function(data) {
            _campsList = data.camps;
        });
    }

    function renderCampList() {
        _campsList.forEach(function(camp) {
            //TODO add to camps table
        })
    }

    function renderContactsList() {
        _usersList.forEach(function(user) {
            $("select[name='main_contact'], select[name='moop_contact'], select[name='safety_contact']").each(function(i, elm) {
                var option = _create('option', '', []);
                option.value = user.user_id;
                option.innerHTML = user.fullName;
                $(elm).append(option);
            })
        })
    }

    function render() {
        renderContactsList();
    }

    function fetchData() {
        getUsersList();
        getCampsList();
    }

    function init() {
        fetchData();
    }

    init();

    return {
        render: render
    }
}

var camps_model = new Camps();

function onChangeCallback(res) {
    console.log("multi select callback: " + res);
}

var input = document.querySelector("#create_camp_type"),
    kidsFriendly = document.querySelector("#create_camp_child_friendly");

var kidsFriendlyOptions = {
        options: ['Kids Friendly'],
        shouldAddOther: false,
        onChange: onChangeCallback
    },
    options = {
        options: ['אוכל', 'שתיה', 'מוזיקה'],
        shouldAddOther: true,
        onChange: onChangeCallback
    }
var multiSelect = new MultiChoiceSelector(input, options),
    kidsFriendlySelector = new MultiChoiceSelector(kidsFriendly, kidsFriendlyOptions);
