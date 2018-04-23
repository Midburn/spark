var innerHeightChange = () => {
    var card_height = $('.cards--wrapper .card').not('.card-hide').outerHeight();
    $('.camps .cards--wrapper').css({
        'visibility': 'visible',
        'min-height': card_height + 'px'
    });
}

var closeCards = (currentButton) => {
    $('.card').addClass('card-hide');
}

/**
 * handle sub url for admin panel
 */
let initCardSelect = () => {
    let currPath = window.location.pathname;
    $('a[href="'+currPath+'"]').trigger("click");
}

// Camp details card transition
$('.card-switcher').click(function(e) {
    e.preventDefault();
    // hide all cards
    $('.card-first').addClass('card-hide');
    $('.card-second').addClass('card-hide');
    $('.card-third').addClass('card-hide');
    $('.card-forth').addClass('card-hide');
    $('.card-fifth').addClass('card-hide');
    $('.card-switcher').removeClass('Btn__default');
    $('.card-switcher').removeClass('Btn__transparent');
    if ($(this).attr('href')) { //handle change URL bt click
        let newUrl = $(this).attr('href');
        let state = newUrl.slice(newUrl.lastIndexOf('/') + 1);
        window.history.pushState(state, 'Title', newUrl);
    }
    
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
        case '5':
            $('.card-fifth').removeClass('card-hide');
            $('#5').addClass('Btn__default');
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
// Auto-Open current card
$(document).ready(function() {
    innerHeightChange();
    initCardSelect();
});
