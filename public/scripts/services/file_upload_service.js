function files_upload($http, $q) {
    return {
        uploadFile: function (file, uploadUrl) {
            var uploadPromise = $q.defer()
            var fd = new FormData()
            fd.append('file', file)

            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-type': undefined
                }
            })
            .success(function (res) {
                uploadPromise.resolve(res.files)
            })
            .error(function (err) {
                uploadPromise.reject(err)
            });

            return uploadPromise.promise;
        }
    }
}
app.factory('fileUploadService', ['$http', '$q', files_upload])
suppliers_app.factory('fileUploadService', ['$http', '$q', files_upload])
