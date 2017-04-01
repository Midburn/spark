/*eslint-disable */
function Camps() {

    var _usersList = [];
    var _campsList = [];

    //DOM elements
    function _create(type, id, classList) {
        var element = document.createElement(type);
        if (id) {
            element.id = id;
        }
        if (classList && Array.isArray(classList)) {
            element.classList = classList;
        }
        return element;
    }

    function getUsersList() {
        $.getJSON('/users', function (data) {
            _usersList = data.users;
            renderContactsList();
        });
    }

    function getCampsList() {
        $.get('/camps', function (data) {
            _campsList = data.camps;
        });
    }

    /*eslint-disable */
    function renderCampList() {
        _campsList.forEach(function (camp) {
            //TODO add to camps table
        })
    }
    /*eslint-enable */

    function renderContactsList() {
        _usersList.forEach(function (user) {
            $("select[name='main_contact'], select[name='moop_contact'], select[name='safety_contact']").each(function (i, elm) {
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

// var camps_model = new Camps(); // eslint-disable-line no-unused-vars
// removed by asi, at the moment we are not using it.

function onChangeCallback(res) {
    console.log("multi select callback: " + res);
}

// New Program multiSelect
var program1 = document.querySelector("#create_prog_type1"),
    program2 = document.querySelector("#create_prog_type2"),
    childFriendlyProg = document.querySelector("#create_prog_child_friendly"),
    adultOnly = document.querySelector("#create_prog_adult_only");
var programOptions1 = {
        options: ['Wrokshop', 'Party', 'Lecture', 'Show'],
        shouldAddOther: false,
        onChange: onChangeCallback
    },
    programOptions2 = {
        options: ['Tour', 'Game', 'Movie'],
        shouldAddOther: true,
        onChange: onChangeCallback
    },
    childFriendlyProgOptions = {
        options: ['Kids Friendly'],
        shouldAddOther: false,
        onChange: onChangeCallback
    },
    adultOnlylyOptions = {
        options: ['Adult Only'],
        shouldAddOther: false,
        onChange: onChangeCallback
    };
if (program1 != null && program2 != null && adultOnly != null) {
    /*eslint-disable */
    var programSelect1 = new MultiChoiceSelector(program1, programOptions1),
        programSelect2 = new MultiChoiceSelector(program2, programOptions2),
        childFriendlyProgSelector = new MultiChoiceSelector(childFriendlyProg, childFriendlyProgOptions),
        adultOnlySelector = new MultiChoiceSelector(adultOnly, adultOnlylyOptions);
    /*eslint-enable */
}

// New Camp multiSelect

var input = document.querySelector("#create_camp_type");

/*eslint-disable */
var kidsFriendlyOptions = {
        options: ['Kids Friendly'],
        shouldAddOther: false,
        onChange: onChangeCallback
    },
    options = {
        options: ['אוכל', 'שתיה', 'מוזיקה'],
        shouldAddOther: true,
        onChange: onChangeCallback
    };
/*eslint-enable */

if (input != null) {
    var multiSelect = new MultiChoiceSelector(input, options); // eslint-disable-line no-unused-vars
}