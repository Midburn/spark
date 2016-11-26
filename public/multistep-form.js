
(function (window, $) {

    Object.assign(window.spark, {
        initRegistrationForm: initRegistrationForm
    });


    function initRegistrationForm() {
        const $regForm = $('#registration-form');
        const _currentClass = "is-current";

        const _formSteps = [{

        }];

        _setStep(0);

        $regForm.find('input[type="text"]').on('focus', function () {
            $(this).removeClass('input-error');
        });

        // previous step
        $regForm.find('.btn-previous').on('click', function () {
            _goBack();
        });

        //submit
        $regForm.on('submit', function () {

            $regForm.validator('validate');

            var errGroups = _getCurrentVisibleForm().find('.has-error');

            if (errGroups.length == 0) {
                setTimeout(function() {
                    // Let BS validator finish running its validations
                    _goForward();
                });
            }
        });





        function _goForward() {
            _setStep(_getCurrentStep() + 1);
            _clearFormErrors();
        }

        function _goBack() {
            _setStep(_getCurrentStep() - 1);
        }

        function _getCurrentStep() {
            return $("fieldset." +  _currentClass).index();
        }

        function _setStep(number) {
            $regForm.find('fieldset').eq(number)
                .addClass(_currentClass)
                .siblings().removeClass(_currentClass);
        }

        function _getCurrentVisibleForm() {
            return $regForm.find("." + _currentClass);
        }

        function _clearFormErrors() {
            $regForm.find(".input-error, .has-error, .has-danger")
                .removeClass("input-error has-error has-danger");
        }
    }



})(window, jQuery);
