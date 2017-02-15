// This file has the following responsibilities:
// 1. Take care of the client scripts initialization

(function(window, $){

    window.spark = {};

    const _spark = window.spark;


    // Single entry point for the client when document is ready
    $(document).ready(function () {
        _spark.initRegistrationForm();

        _afterLoad();
    });



    function _afterLoad() {
        // fix bug in chrome mac (http://stackoverflow.com/questions/34184377/chrome-shows-blank-page-on-rtl-language-site-until-window-is-resized)
        $('html, body').animate({scrollTop: 1}, 0);
    }
})(window, jQuery);

