/**
 * evalute & validate camp name (English) over 3 letters
 */
$("input[name='camp_name_en']").keyup(function() {
    var val = $(this).val(),
        end_point = "camps/",
        message, lang = $('body').attr('lang');
    if (val.length > 3) {
        var data = $.get('../' + end_point + val);
        data.done(function() {
            if (data.status === 204) {
                message = "<span class='glyphicon glyphicon-ok'>Available</span>";
                $('#check_camp_name').removeClass('disabled').attr('href', '/' + lang + '/camps/new?c=' + val);
            } else {
                message = "<span class='glyphicon glyphicon-remove'>Unavailable</span>";
                $('#check_camp_name').addClass('disabled').removeAttr('href');
            }
            $(".choose_name span.indicator").html(message)
        });
    }
});

/**
 * getting user list from API
 */
var fetched = false;

function fetchUsersOnce(elm) {
    if (!fetched) {
        $.getJSON('/users', function(data) {
            users = [data.users];
            for (var i = 0; i < users.length; i++) {
                elm.append(template(users[i]));
            }
        });

        function template(data) {
            return "<option value='" + data.user_id + "'>" + data.fullName + "</option>"
        }
        fetched = true;
    }
}
$("select[name='camp_main_contact']").focus(function() {
    fetchUsersOnce($(this));
});
