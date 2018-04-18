/**
 * GLOBALS
 */
$(document).ajaxStart(function () {
    $('#ajax_indicator').removeClass('done').removeClass('hide').fadeIn('fast');
});
$(document).ajaxComplete(function () {
    $('#ajax_indicator').addClass('done').fadeOut('slow');
});
$(function () {
    // tooltips
    $('[data-toggle="tooltip"]').tooltip()
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
var interval = 800;
    $input = $("#new-supplier-button");
var typingTimer;

$input.keyup(function (event) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping_(event), interval);
});

$input.keydown(function () {
    clearTimeout(typingTimer);
});

function doneTyping_(event) {

    const val = event.target.value,
        lang = $('body').attr('lang'),
        status = $(".choose_name span.indicator span.glyphicon"),
        input = $input,
        btn = $('#check_supplier_id'),
        phoneREGX = /^\d{1,9}$/;

        if ((phoneREGX.test(val))) {
            const data = $.get('/suppliers/' + val)
                .done(function() {
                    if (data.status === 204) {
                        input.removeClass('error');
                        status.removeClass('glyphicon-remove').addClass('glyphicon-ok');
                        btn.removeClass('disabled btn').attr('href', '/' + lang + '/suppliers/new?c=' + val);
                    }                 
                })
                .fail(function(error) {
                    jsonError = error.data.data.message;
                    swal("Error!", `Something went wrong, please try again later \n ${jsonError}`, "error");
                })    
        }
        input.addClass('error');
        status.removeClass('glyphicon-ok').addClass('glyphicon-remove');
        btn.addClass('disabled btn').removeAttr('href');
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

function extractSupplierData() {
    return {
        updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
        supplier_name_en: $('#supplier_name_en').val()|| "empty",
        supplier_name_he: $('#supplier_name_he').val()|| "empty",
        main_contact_name:$('#main_contact_name').val()|| "empty",
        main_contact_position:$('#main_contact_position').val()|| "empty",
        main_contact_phone_number:$('#main_contact_phone_number').val()|| "0",
        supplier_category:$('#supplier_category').val()|| "empty",
        supplier_website_link:$('#supplier_website_link').val()|| "empty",
        supplier_midmarket_link: $('#supplier_midmarket_link').val()|| "empty",
        comments: $('#comments').val()|| "empty",
    };
}

/**
 * Component: Editing supplier
 * (PUT) /suppliers/:supplier_id/edit
 */
$('#supplier_edit_save').click(function () {
    var supplier_id = $('#supplier_edit_supplier_id').val();
    var supplier_data = extractSupplierData();
    var lang = document.getElementById('meta__lang').value;
    $.ajax({
        url: '/suppliers/' + supplier_id + '/edit',
        type: 'PUT',
        data: supplier_data,
        success: function (result) {
            if (lang === 'he') {
                sweetAlert("כל הכבוד", "הספק עודכן, על מנת לראות את השינויים יש לרענן את העמוד", "success");
            } else {
                sweetAlert("You good...", "Supplier details updated! reload the page.", "success");
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
 * Component: Create new supplier with approval modal
 */
$('#supplier_create_save').click(function () {
    var supplier_data = extractSupplierData();
    // show modal & present details in modal
    $('#create_camp_request_modal').modal('show');
    _supplierAppendData();
    // approve create camp
    $('#supplier_create_save_modal_request').click(function () {
        _sendSuppliersRequest();
    });

    function _supplierAppendData() {
        var supplier_id = $('#meta__supplier_id').val();
        $('.supplier_id span').text(': ' + supplier_id).css('font-weight', 'bold');
        $.each(supplier_data, function (label, data) {
            if (data) {
                $('.' + label).show();
                $('.' + label + ' span').text(': ' + data).css('font-weight', 'bold');
            } else {
                $('.' + label).hide();
            }

        })
    }

    function _sendSuppliersRequest($location) {
        const supplier_id = $('#meta__supplier_id').val();
        const lang = document.getElementById('meta__lang').value || 'he';
        
        supplier_data.supplier_id = supplier_id;
        $.ajax({
            url: '/suppliers/new',
            type: 'POST',
            data: supplier_data,
            success: function (result) {
                $('#create_camp_request_modal').find('.modal-body').html('<h4>Supplier created succesfully. <br><span class="Btn Btn__sm Btn__inline">you can edit it: <a href="' + [window.location.origin, $('body').attr('lang')].join('/') + '/suppliers/' + supplier_id + '/edit">here</a><span></h4>');
                $('#create_camp_request_modal').find('#supplier_create_save_modal_request').hide();
                $('#create_camp_request_modal').find('#create_camp_close_btn').hide();
                // 10 sec countdown to close modal
                let sec = 10;
                setInterval(function () {
                    $('#create_camp_request_modal').find('#link_to_supplier').removeClass('hide').text('close '+sec);
                    sec -= 1;
                }, 1000);
                setTimeout(function () {
                    window.location = `/${lang}/suppliers/${supplier_id}`;
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
