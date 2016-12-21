/**
 * Scroll to top - footer button
 */
$('#scroll_top').click(function() {
    $("html, body").stop().animate({
        scrollTop: 0
    }, '250', 'swing');
});
/**
 * Camps reveal name chooser
 */
$('.camps .reveal_create_camp_btn').click(function() {
    $('.camps .choose_name').toggleClass('hidden');
});
/**
 * evalute & validate camp name (English) over 3 letters
 */
$(".camps input[name='camp_name_en']").keyup(function() {
    var val = $(this).val(),
        lang = $('body').attr('lang'),
        status = $(".choose_name span.indicator span.glyphicon"),
        input = $(".camps .choose_name input[name='camp_name_en']"),
        btn = $('#check_camp_name');
    if (val.length > 3) {
        var data = $.get('../camps/' + val);
        data.done(function() {
            if (data.status === 204) {
                input.removeClass('error');
                status.removeClass('glyphicon-remove').addClass('glyphicon-ok');
                btn.removeClass('hidden').attr('href', '/' + lang + '/camps/new?c=' + val);
            } else {
                input.addClass('error');
                status.removeClass('glyphicon-ok').addClass('glyphicon-remove');
                btn.addClass('hidden').removeAttr('href');
            }
        });
    } else {
        btn.addClass('hidden').removeAttr('href');
        status.removeClass('glyphicon-ok')
    }
});

/**
 * getting user list from API
 */
var fetched = false;

function fetchUsersOnce(elm) {
    if (!fetched) {
        $.getJSON('/users', function(data) {
            users = data.users;
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
/**
 * getting camp list from API
 */
var fetched = false;

function fetchCampsOnce() {
    if (!fetched) {
        var data, tbody = $('.camps.stats > table > tbody');
        tbody.html('');
        $.get('/camp-list', function(data) {
            camps = data.camps;
            for (var i = 0; i < camps.length; i++) {
                tbody.append(template(camps[i]));
            }
            data = camps;
        });

        function template(data) {
            return "<tr><td>" + data.camp_id + "</td><td>" + data.camp_name_en + "</td><td>" + data.camp_name_he + "</td><td>" + data.created_at + "</td></tr>";
        }
    }
}
