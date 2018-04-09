/**
 * GLOBALS
 */
$(window).load(function () {
    var isLight = sessionStorage.getItem("theme");
    $('body').toggleClass('light', isLight === 'light');
    $("#cover").fadeOut(200);
    toggleTheme();
});

$(document).ajaxStart(function () {
    $('#ajax_indicator').removeClass('done').removeClass('hide').fadeIn('fast');
});
$(document).ajaxComplete(function () {
    $('#ajax_indicator').addClass('done').fadeOut('slow');
});
$(function () {
    // tooltips
    $('[data-toggle="tooltip"]').tooltip();
});

// bind Twitter Bootstrap tooltips to dynamically created elements
$("body").tooltip({
    selector: '[data-toggle="tooltip"]'
});

/**
 * Scroll to top - footer button
 */
$('#scroll_top').click(function () {
    $("html, body").stop().animate({
        scrollTop: 0
    }, '250', 'swing');
});
/**
 * evalute & validate camp name (English) must be > 3 letters
 * listen to change with timer, to prevent redundant http requests
 */
var interval = 800,
    typingTimer,
    $input = $(".camps input[name='camp_name_en']");

$input.keyup(function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, interval);
});

$input.keydown(function () {
    clearTimeout(typingTimer);
});

// toggleTheme (default or light)
function toggleTheme() {
    $('#toggleTheme').on('click', function() {
        isLight = sessionStorage.getItem("theme");
        isLight = isLight === '' ? 'light' : '';
        $('body').toggleClass('light', isLight === 'light');
        sessionStorage.setItem("theme", isLight);
    });
}

function doneTyping() {
    var val = $input.val(),
        lang = $('body').attr('lang'),
        status = $(".choose_name span.indicator span.glyphicon"),
        input = $input,
        btn = $('#check_camp_name');
    if (val.length > 3) {
        var data = $.get('/camps/' + val);
        data.done(function () {
            if (data.status === 204) {
                input.removeClass('error');
                status.removeClass('glyphicon-remove').addClass('glyphicon-ok');
                btn.removeClass('disabled btn').attr('href', '/' + lang + '/camps/new?c=' + val);
            } else {
                input.addClass('error');
                status.removeClass('glyphicon-ok').addClass('glyphicon-remove');
                btn.addClass('disabled btn').removeAttr('href');
            }
        });
    } else {
        btn.addClass('disabled btn').removeAttr('href');
        status.removeClass('glyphicon-ok')
    }
}

function getUserTemplate(data) {
    if (data !== undefined) {
        return "<option value='" + data.user_id + "'>" + data.fullName + "</option>"
    }
}
/**
 * getting user list from API
 */
function fetchUsersOnce(elm) {
    var lang = document.getElementById('meta__lang').value;
    var camp_id = 5
    elm = $(elm)

    if (!elm.attr('fetched')) {
        $.getJSON('/camps/' + camp_id + '/members', function (data) { })
            .success((data) => {
                users = [data.users];
                for (var i = 0; i < users.length; i++) {
                    elm.append(getUserTemplate(users[i]));
                }
            })
            .error((data) => {
                if (lang === 'he') {
                    sweetAlert("אופס...", "אין משתמשים פעילים!", "error");
                } else {
                    sweetAlert("Oops...", "No user available!", "error");
                }
            })

        elm.attr('fetched', true);
    }
}
$(function () {
    var user_inputs = '#create_camp_contact_person_id';
    if ($('.camps').is('.camp_create')) {
        fetchUsersOnce(user_inputs);
    }
});

/**
 * Component: View camp details
 */
// function _fetchCampContactPersonDetails() {
//     $.get('/camps_contact_person/' + contact_person_id, function (res) {
//         $('span.contact_person_name').text([res.user.first_name, res.user.last_name].join(' '));
//         $('span.contact_person_phone').text(res.user.cell_phone);
//         $('span.contact_person_email').text(res.user.email);
//     });
// }
// if ($('.camps').hasClass('camp_details')) {
//     var contact_person_id = $('.contact-person').attr('data-camp-contact-person-id');
//     if (contact_person_id !== "null") {
//         _fetchCampContactPersonDetails();
//     }
// }

function extractCampData(isNew) {
    var activity_time = fetchAllCheckboxValues('camp_activity_time');
    var type = fetchAllCheckboxValues('camp_type');
    const loggedInUser = $('#logged_user_id').val();

    return {
        camp_name_he: $('#camp_name_he').val() || 'camp' + (+new Date()),
        camp_name_en: $('#camp_name_en').val(),
        camp_desc_he: $('#camp_desc_he').val() || '',
        camp_desc_en: $('#camp_desc_en').val() || '',
        contact_person_id: isNew ? loggedInUser : $('#camp_contact_person_id option:selected').val() || '',
        facebook_page_url: $('#camp_facebook_page_url').val() || '',
        contact_person_name: $('#camp_contact_person_name').val() || '',
        contact_person_email: $('#camp_contact_person_email').val() || '',
        contact_person_phone: $('#camp_contact_person_phone').val() || '',
        accept_families: $('#camp_accept_families:checked').length,
        main_contact: isNew ? loggedInUser : $('#camp_main_contact option:selected').val() || '',
        moop_contact: isNew ? loggedInUser : $('#camp_moop_contact option:selected').val() || '',
        safety_contact: isNew ? loggedInUser : $('#camp_safety_contact option:selected').val() || '',
        type: type || '',
        camp_status: $('#camp_status option:selected').val() || '',
        camp_activity_time: activity_time || '',
        child_friendly: $('#camp_child_friendly:checked').length,
        noise_level: $('#camp_noise_level option:selected').val() || '',
        public_activity_area_sqm: $('#camp_public_activity_area_sqm').val() || 0,
        public_activity_area_desc: $('#camp_public_area_desc').val() || '',
        support_art: $('#support_art:checked').length,
        location_comments: $('#location_comments').val() || '',
        camp_location_street: $('#camp_location_street').val() || '',
        camp_location_street_time: $('#camp_location_street_time').val() || '',
        camp_location_area: $('#camp_location_area').val() || '',
        entrance_quota : $('#entrance_quota').val() || '',
        pre_sale_tickets_quota : $('#pre_sale_tickets_quota').val() || ''
    };
}

/**
 * Component: Editing camp
 * (PUT) /camps/:camp_id/edit
 */
$('#camp_edit_save').click(function () {
    var camp_id = $('#camp_edit_camp_id').val();
    var camp_data = extractCampData(true);
    var lang = document.getElementById('meta__lang').value;

    $.ajax({
        url: '/camps/' + camp_id + '/edit',
        type: 'PUT',
        data: camp_data,
        success: function (result) {
            if (lang === 'he') {
                sweetAlert("כל הכבוד", "המחנה עודכן, על מנת לראות את השינויים יש לרענן את העמוד", "success");
            } else {
                sweetAlert("You good...", "Camp details updated! reload the page.", "success");
            }
        }
    });
});
$('#camp_edit_publish').click(function () {
    var camp_id = $('#camp_edit_camp_id').val();
    $.ajax({
        url: '/camps/' + camp_id + '/publish',
        type: 'PUT',
        success: function (result) {
            console.log(result);
        }
    });
});
$('#camp_edit_unpublish').click(function () {
    var camp_name = $('#meta__camp_name_en').attr('value'),
        agree_unpublish = confirm('Un-publish camp\n\n\nThis action will remove ' + camp_name + ' from the public camps list.\n\n\n---\n Are you sure?');
    if (agree_unpublish) {
        var camp_id = $('#camp_edit_camp_id').val();
        $.ajax({
            url: '/camps/' + camp_id + '/unpublish',
            type: 'PUT',
            success: function (result) {
                console.log(result);
            }
        });
    }
});

// display other text field if other selected
$('#edit_type_other').click(function () {
    if ($('#edit_type_other').is(':checked')) {
        $('#edit_type_other_text').removeClass('hidden');
    } else {
        $('#edit_type_other_text').addClass('hidden');
    }
})

/**
 * Component: Create new camp with approval modal
 */
$('#camp_create_save').click(function () {
    var camp_data = extractCampData();

    // show modal & present details in modal
    $('#create_camp_request_modal').modal('show');
    _campAppendData();
    // approve create camp
    $('#camp_create_save_modal_request').click(function () {
        _sendRequest();
    });

    function _campAppendData() {
        $.each(camp_data, function (label, data) {
            if (data) {
                $('.' + label).show();
                $('.' + label + ' span').text(': ' + data).css('font-weight', 'bold');
            } else {
                $('.' + label).hide();
            }

        })
    }

    function _sendRequest() {
        $.ajax({
            url: '/camps/new',
            type: 'POST',
            data: camp_data,
            success: function (result) {
                var camp_id = result.data.camp_id;
                $('#create_camp_request_modal').find('.modal-body').html('<h4>Camp created succesfully. <br><span class="Btn Btn__sm Btn__inline">you can edit it: <a href="' + [window.location.origin, $('body').attr('lang')].join('/') + '/camps/' + camp_id + '/edit">here</a><span></h4>');
                $('#create_camp_request_modal').find('#camp_create_save_modal_request').hide();
                // 10 sec countdown to close modal
                var sec = 10;
                setInterval(function () {
                    $('#create_camp_request_modal').find('#create_camp_close_btn').text('Close ' + sec);
                    sec -= 1;
                }, 1000);
                setTimeout(function () {
                    $('#create_camp_request_modal').modal('hide');
                }, sec * 1000);
            }
        });
    }
});

// display other text field if other selected
$('#camp_type_other_checkbox').click(function () {
    if ($('#camp_type_other_checkbox').is(':checked')) {
        $('#camp_type_other_text').removeClass('hidden');
    } else {
        $('#camp_type_other_text').addClass('hidden');
    }
})

// Collect all checkbox values
function fetchAllCheckboxValues(className) {
    var val = [];
    $('.' + className + ':checked').each(function (i) {
        val[i] = $(this).val();
        if (val[i] === 'other') {
            val[i] = $('#' + className + '_other_text').val()
        }
    });
    return val.toString();
}
/*
 * Component: view camp details
 */
// Fetch & inject user data
var user_type;
function _fetchUserData(user_id) {
    $.getJSON('/users/' + user_id, function (response) {
        _injectUserData(response)
    })
}
function _injectUserData(user_data) {
    var name = user_data.name,
        email = user_data.email,
        cell_phone = user_data.cell_phone,
        type = '.info.' + user_type;
    $(type + ' .contact_person_name').text(name);
    $(type + ' .contact_person_phone').text(email);
    $(type + ' .contact_person_email').text(cell_phone);
    $(type).removeClass('hidden').fadeIn('fast');
}
if ($('.camp_details')) {
    $('.fetch_user_info').click(function () {
        var user_id = $(this).attr('data-user-id')
        user_type = $(this).attr('data-user-type');
        _fetchUserData(user_id);
    })
}
