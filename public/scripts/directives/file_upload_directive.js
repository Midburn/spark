function upload(fileUploadService) {
    return {
        restrict: 'A',
        link: function ($scope, element, attr) {
            console.log("uploadFiles enter")
            let id,path;
            if (element[0].id === 'supplier_file_input') {        
                id = $scope.current_supplier_id;
                path = `/suppliers/${id}/contract/`;
            }
            else if (element[0].id === 'camp_file_input') {        
                id = $scope.current_camp_id;
                path = `/camps/${id}/documents/`;
            }
            element.bind('change', function () {
                const file = element[0].files[0];  
                fileUploadService
                    .uploadFile(file, path)
                    .then(function (files) {
                        console.log('File upload success!')
                        $scope.files = files
                        $scope.getFiles();
                    })
                    .catch(function (err) {
                        sweetAlert("!oops","could not upload file!", "warning");
                        console.log('error:', err);
                        element.val('')
                    })
            })
        }
    }
}

app.directive('ngFileUpload', ['fileUploadService', upload.bind(this)]);
suppliers_app.directive('ngFileUpload', ['fileUploadService', upload.bind(this)])