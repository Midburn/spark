app.factory('S3', ['$http', '$q', function($http, $q) {
    return {
        list: function(prefix) {
            var listPromise = $q.defer()
            $http.post('/en/camp-files-admin', {
                prefix: prefix
            })
            .success(function(res) {
                listPromise.resolve(res.list.Contents)
            })
            .error(function(err) {
                listPromise.reject(err)
            })

            return listPromise.promise;
        }
    }
}])
