/**
 * GLOBALS
 */
$(document).ajaxStart(function() {
    $('#ajax_indicator').removeClass('done').removeClass('hide').fadeIn('fast');
});
$(document).ajaxComplete(function() {
    $('#ajax_indicator').addClass('done').fadeOut('slow');
});
$(function() {
    // tooltips
    $('[data-toggle="tooltip"]').tooltip()
});

/**
 * Scroll to top - footer button
 */
$('#scroll_top').click(function() {
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

$input.keyup(function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, interval);
});

$input.keydown(function() {
    clearTimeout(typingTimer);
});

function doneTyping() {
    var val = $input.val(),
        lang = $('body').attr('lang'),
        status = $(".choose_name span.indicator span.glyphicon"),
        input = $input,
        btn = $('#check_camp_name');
    if (val.length > 3) {
        var data = $.get('../camps/' + val);
        data.done(function() {
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
    var camp_id = 5
    elm = $(elm)

    if (!elm.attr('fetched')) {
        $.getJSON('/camps/' + camp_id + '/members', function(data) {})
        .success((data) => {
          users = [data.users];
          for (var i = 0; i < users.length; i++) {
              elm.append(getUserTemplate(users[i]));
          }
        })
        .error((data) => {
          sweetAlert("Oops...", "No user available!", "error");
        })

        elm.attr('fetched', true);
    }
}
$(function() {
    var user_inputs = '#create_camp_contact_person_id';

    if ($('.camps').is('.camp_create')) {
      fetchUsersOnce(user_inputs);
    }
});
/**
 * getting camp list from API
 */
var fetchedCampsOnce = false,
    $stats_table = $('.camps.camp_admin_index #admin_camps');

function getCampsTemplate(data) {
    var last_update = new Date(data.updated_at).toDateString(),
        created_at = new Date(data.created_at).toDateString(),
        enabled = data.enabled
            ? 'Yes'
            : 'No';
    return "<tr><td>" + data.id + "</td><td><a href='camps/" + data.id + "'>" + data.camp_name_en + "</a></td><td>" + data.contact_person + "</td><td>" + data.status + "</td><td class='hidden-xs'>" + last_update + "</td><td class='hidden-xs'>" + created_at + "</td><td class=''>" + enabled + "</td><td class=''><a href='" + data.facebook_page_url + "' target='_blank'><i class='fa fa-facebook-official'></i></a></td><td><a href='camps/" + data.id + "/edit'><span class='glyphicon glyphicon-pencil'></span><span class='sr-only' aria-hidden='true'>Edit Camp</span></a></td><td><a onclick='_removeCamp(" + data.id + ")'><span class='glyphicon glyphicon-trash'></span><span class='sr-only' aria-hidden='true'>Remove Camp</span></a></td></tr>";
}

var fetchCampsOnce = function() {
    if (!fetchedCampsOnce) {
        var data, // eslint-disable-line no-unused-vars
            tbody = $stats_table.find('tbody');
        tbody.html('');
        $.get('/camps', function(data) {
            camps = data.camps;
            for (var i = 0; i < camps.length; i++) {
                tbody.append(getCampsTemplate(camps[i]));
            }
            data = camps;
            // fix card height after data is appended to table
            innerHeightChange();
        });

        fetchedCampsOnce = true;
    }
}

function _removeCamp(camp_id) { // eslint-disable-line no-unused-vars
    var agree_remove = confirm('Remove camp\n\n\nThis action will remove camp #' + camp_id + '.\n\n\n---\n Are you sure?');
    if (agree_remove) {
        $.get("camps/" + camp_id + "/remove", function(res) {
            window.location.reload();
        });
    }
}
$stats_table.load(fetchCampsOnce());

// Search camp
$('#camps_stats_search_camp').keyup(function(input) {
    $('.camps.stats table').find('tr:not(.headers)').hide();
    var camp_name_en = input.target.value;
    $('.camps.stats table').find('td:contains("' + camp_name_en + '")').parent().show();

});
// TODO: fix inner height for dynamic width size changing
function innerHeightChange() {
    var card_height = $('.cards--wrapper .card').not('.card-hide').outerHeight();
    $('.camps .cards--wrapper').css({
        'visibility': 'visible',
        'min-height': card_height + 'px'
    });
}

function closeCards(currentButton) {
    $('.card').addClass('card-hide');
}

// Camp details card transition
$('.card-switcher').click(function() {
    // hide all cards
    $('.card-first').addClass('card-hide');
    $('.card-second').addClass('card-hide');
    $('.card-third').addClass('card-hide');
    $('.card-forth').addClass('card-hide');
    $('.card-switcher').removeClass('Btn__default');
    $('.card-switcher').removeClass('Btn__transparent');
    // find clicked card and show it
    switch ($(this).attr('id')) {
        // show card 1
        case '1':
            $('.card-first').removeClass('card-hide');
            $('#1').addClass('Btn__default');
            break;
        case '2':
            $('.card-second').removeClass('card-hide');
            $('#2').addClass('Btn__default');
            break;
        case '3':
            $('.card-third').removeClass('card-hide');
            $('#3').addClass('Btn__default');
            break;
        case '4':
            $('.card-forth').removeClass('card-hide');
            $('#4').addClass('Btn__default');
            break;
    }
    innerHeightChange();
});

$('.reveal_create_camp_btn').click(function() {
    if (!($('.choose_name').hasClass('card-hide'))) {
        $('.choose_name').toggleClass('card-hide');
        return;
    } else {
        closeCards();
        $('.choose_name').removeClass('card-hide');
    }
    innerHeightChange();
});
$('.reveal_join_camp_btn').click(function() {
    if (!($('.card-second').hasClass('card-hide'))) {
        $('.card-second').toggleClass('card-hide');
        return;
    } else {
        closeCards();
        $('.card-second').removeClass('card-hide');
    }
    innerHeightChange();
});
$('.reveal_manage_camp_btn').click(function() {
    if (!($('.card-third').hasClass('card-hide'))) {
        $('.card-third').toggleClass('card-hide');
        return;
    } else {
        closeCards();
        $('.card-third').removeClass('card-hide');
    }
    innerHeightChange();
});
$('.card--close').click(function() {
    closeCards();
});

/**
 * Component: View camp details
 */
function _fetchCampContactPersonDetails() {
    $.get('/camps_contact_person/' + contact_person_id, function(res) {
        $('span.contact_person_name').text([res.user.first_name, res.user.last_name].join(' '));
        $('span.contact_person_phone').text(res.user.cell_phone);
        $('span.contact_person_email').text(res.user.email);
    });
}
if ($('.camps').hasClass('camp_details')) {
    var contact_person_id = $('.contact-person').attr('data-camp-contact-person-id');
    if (contact_person_id !== "null") {
        _fetchCampContactPersonDetails();
    }
}
/**
 * Component: Editing camp
 * (PUT) /camps/:camp_id/edit
 */
$('#camp_edit_save').click(function() {
    var type = fetchAllCheckboxValues('camp_type');
    var camp_id = $('#camp_edit_camp_id').val(),
        camp_data = {
            camp_name_he: $('#camp_name_he').val(),
            camp_name_en: $('#camp_name_en').val(),
            camp_desc_he: $('#camp_desc_he').val(),
            camp_desc_en: $('#camp_desc_en').val(),
            contact_person_id: $('#camp_contact_person_id option:selected').attr('value'),
            facebook_page_url: $('#camp_facebook_page_url').val(),
            contact_person_name: $('#camp_contact_person_name').val(),
            contact_person_email: $('#camp_contact_person_email').val(),
            contact_person_phone: $('#camp_contact_person_phone').val(),
            main_contact: $('#camp_main_contact option:selected').val(),
            moop_contact: $('#camp_moop_contact option:selected').val(),
            safety_contact: $('#camp_safety_contact option:selected').val(),
            status: $('#camp_status option:selected').attr('value') || $('label[for="edit_camp_status"]').attr('data-camp-status'),
            type: type,
            enabled: $('#camp_enabled option:selected').val(),
            camp_activity_time: $('#camp_activity_time option:selected').val(),
            child_friendly: $('#camp_child_friendly:checked').length,
            noise_level: $('#camp_noise_level option:selected').val(),
            public_activity_area_sqm: $('#public_activity_area_sqm').val(),
            public_activity_area_desc: $('#public_activity_area_desc').val(),
            support_art: $('#support_art:checked').length,
            location_comments: $('#location_comments').val(),
            camp_location_street: $('#camp_location_street').val(),
            camp_location_street_time: $('#camp_location_street_time').val(),
            camp_location_area: $('#camp_location_area').val(),
            accept_families: $('#camp_accept_families:checked').length
        };
    $.ajax({
        url: '/camps/' + camp_id + '/edit',
        type: 'PUT',
        data: camp_data,
        success: function(result) {
            sweetAlert("You good...", "Camp details updated! reload the page.", "success");
        }
    });
});
$('#camp_edit_publish').click(function() {
    var camp_id = $('#camp_edit_camp_id').val();
    $.ajax({
        url: '/camps/' + camp_id + '/publish',
        type: 'PUT',
        success: function(result) {
            console.log(result);
        }
    });
});
$('#camp_edit_unpublish').click(function() {
    var camp_name = $('#meta__camp_name_en').attr('value'),
        agree_unpublish = confirm('Un-publish camp\n\n\nThis action will remove ' + camp_name + ' from the public camps list.\n\n\n---\n Are you sure?');
    if (agree_unpublish) {
        var camp_id = $('#camp_edit_camp_id').val();
        $.ajax({
            url: '/camps/' + camp_id + '/unpublish',
            type: 'PUT',
            success: function(result) {
                console.log(result);
            }
        });
    }
});

// display other text field if other selected
$('#edit_type_other').click(function() {
    if ($('#edit_type_other').is(':checked')) {
        $('#edit_type_other_text').removeClass('hidden');
    } else {
        $('#edit_type_other_text').addClass('hidden');
    }
})

/**
 * Component: Create new camp with approval modal
 */
$('#camp_create_save').click(function() {
    var type = fetchAllCheckboxValues('camp_type');
    var camp_data = {
        camp_name_he: $('#camp_name_he').val() || 'camp' + (+ new Date()),
        camp_name_en: $('#camp_name_en').val(),
        camp_desc_he: $('#camp_desc_he').val(),
        camp_desc_en: $('#camp_desc_en').val(),
        contact_person_id: $('#camp_contact_person_id option:selected').val(),
        facebook_page_url: $('#camp_facebook_page_url').val(),
        contact_person_name: $('#camp_contact_person_name').val(),
        contact_person_email: $('#camp_contact_person_email').val(),
        contact_person_phone: $('#camp_contact_person_phone').val(),
        accept_families: $('#camp_accept_families:checked').length,
        main_contact: $('#camp_main_contact option:selected').val(),
        moop_contact: $('#camp_moop_contact option:selected').val(),
        safety_contact: $('#camp_safety_contact option:selected').val(),
        type: type,
        camp_status: $('#camp_status option:selected').val(),
        camp_activity_time: $('#camp_activity_time option:selected').val(),
        child_friendly: $('#camp_child_friendly:checked').length,
        noise_level: $('#camp_noise_level option:selected').val(),
        public_activity_area_sqm: $('#camp_public_activity_area_sqm').val(),
        public_activity_area_desc: $('#camp_public_area_desc').val(),
        support_art: $('#support_art:checked').length,
        location_comments: $('#location_comments').val(),
        camp_location_street: $('#camp_location_street').val(),
        camp_location_street_time: $('#camp_location_street_time').val(),
        camp_location_area: $('#camp_location_area').val()
    };
    // show modal & present details in modal
    $('#create_camp_request_modal').modal('show');
    _campAppendData();
    // approve create camp
    $('#camp_create_save_modal_request').click(function() {
        _sendRequest();
    });

    function _campAppendData() {
        $.each(camp_data, function(label, data) {
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
            success: function(result) {
                var camp_id = result.data.camp_id;
                $('#create_camp_request_modal').find('.modal-body').html('<h4>Camp created succesfully. <br><span class="Btn Btn__sm Btn__inline">you can edit it: <a href="' + [window.location.origin, $('body').attr('lang')].join('/') + '/camps/' + camp_id + '/edit">here</a><span></h4>');
                $('#create_camp_request_modal').find('#camp_create_save_modal_request').hide();
                // 10 sec countdown to close modal
                var sec = 10;
                setInterval(function() {
                    $('#create_camp_request_modal').find('#create_camp_close_btn').text('Close ' + sec);
                    sec -= 1;
                }, 1000);
                setTimeout(function() {
                    $('#create_camp_request_modal').modal('hide');
                }, sec * 1000);
            }
        });
    }
});

// display other text field if other selected
$('#camp_type_other').click(function() {
    if ($('#camp_type_other').is(':checked')) {
        $('#camp_type_other_text').removeClass('hidden');
    } else {
        $('#camp_type_other_text').addClass('hidden');
    }
})

// Collect all checkbox values
function fetchAllCheckboxValues(className) {
  var val = [];
  $('.' + className + ':checked').each(function(i) {
    val[i] = $(this).val();
  });
  if (val.indexOf('other') > -1) {
      val.push($('#'+ className + '_other_text').val());
  }
  return val.toString();
}
/*
 * Component: view camp details
 */
// Fetch & inject user data
var user_type;
function _fetchUserData(user_id) {
    $.getJSON('/users/' + user_id, function(response) {
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
    $('.fetch_user_info').click(function() {
        var user_id = $(this).attr('data-user-id')
        user_type = $(this).attr('data-user-type');
        _fetchUserData(user_id);
    })
}

/**
 * Component: camp members
 */

// TODO

/**
 * Component: camp document & forms
 */

// TODO

/**
 * Component: create camp program
 */

 // Auto-Open current card
$(document).ready(function () {
    innerHeightChange();
});
