
(function (window, $) {

    Object.assign(window.spark, {
        initRegistrationForm: initRegistrationForm
    });


    function initRegistrationForm() {
        const $regForm = $('#registration-form');
        const _currentClass = "is-current";

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


        $regForm.find('#address').geocomplete({details : "#registration-form"});

        $regForm.find('#have_medical_training').click(function() {
            var details = $regForm.find('#medical_training_details');
            details[this.checked ? "removeClass" : "addClass"]('display-none');
            if (this.checked)
                details.find('input')[0].setAttribute("required",'');
            else details.find('input')[0].removeAttribute("required");
        });

        $regForm.find('#have_medical_condition').click(function() {

            var details = $regForm.find('#medical_condition_details');
            details[this.checked ? "removeClass" : "addClass"]('display-none');
            if (this.checked)
                details.find('input')[0].setAttribute("required",'');
            else details.find('input')[0].removeAttribute("required");
        });


        /* Private functions */

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

