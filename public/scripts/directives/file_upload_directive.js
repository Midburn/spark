app.directive('ngFileUpload', ['fileUploadService', function (fileUploadService) {
    return {
        restrict: 'A',
        link: function ($scope, element, attr) {
            element.bind('change', function () {
                const camp_id = $scope.current_camp_id
                const file = element[0].files[0]

                const camp_file_path = `/camps/${camp_id}/documents/`

                fileUploadService.uploadFile(file, camp_file_path)
                .then(function (files) {
                    console.log('File upload success!')
                    $scope.files = files
                })
                .catch(function (err) {
                    console.log(err)
                    element.val('')
                })
            })
        }
    }
}])
