/**
 * evalute & validate camp name (English) over 3 letters
 */
$("input[name='camp_name_en']").keyup(function() {
    var val = $(this).val(),
        end_point = "camps/",
        message;
    if (val.length > 3) {
        var data = $.get('../' + end_point + val);
        data.done(function() {
            if (data.responseJSON.data === "Available") {
                message = "Available :-)";
                $('#check_camp_name').removeClass('disabled');
            } else {
                message = "Not Available :-(";
                $('#check_camp_name').addClass('disabled');
            }
            $(".choose_name span.indicator").html(message)
        });
    }
});
