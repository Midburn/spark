var BucketViewerController = function(S3, $scope) {
    this.scope = $scope;
    this.scope.s3 = S3;
    this.scope.currentPrefix = '';

    this.scope.home = function() {
        this.scope.currentPrefix = '';
        return this.scope.refresh();
    };

    this.scope.open = function(prefix) {
        this.scope.currentPrefix = this.scope.currentPrefix + prefix;
        return this.scope.refresh();
    };

    this.scope.close = function() {
        if (this.scope.currentPrefix.slice(-1) === '/') { this.scope.currentPrefix = this.scope.currentPrefix.slice(0, -1); }
        this.scope.currentPrefix = this.scope.currentPrefix.substr(0, this.scope.currentPrefix.lastIndexOf('/') + 1);
        return this.scope.refresh();
    };

    this.scope.prefix = function() {
        return this.scope.basePrefix + this.scope.currentPrefix;
    }

    this.scope.updateFiles = function(newFiles) {
        this.scope.files = newFiles;
     }

     this.scope.refresh = function() {
        return this.scope.s3.list(this.scope.prefix())
          .then(data => {
            return data
              .map(el => {
                el.Key = el.Key.substr(this.scope.prefix().length);
                return el;
            }).map(el => {
                if (el.Key.indexOf('/') > -1) {
                  el.type = 'folder';
                  el.Key = el.Key.substr(0, el.Key.indexOf('/') + 1);
                } else {
                  el.type = 'file';
                  el.Key = el.Key.substr(el.Key.lastIndexOf('/') + 1);
                }

                el.url = "about:home";
                //@s3.downloadLink(bucketName, @prefix  + el.Key).then((url) -> el.url = url) if el.type is 'file'
                return el;
              }).reduce(function(a, b) {
                if (a.map(el => el.Key).indexOf(b.Key) < 0) { a.push(b); }
                return a;
              }
              , []);
          }).then(this.scope.updateFiles);
    }
    this.scope.refresh = this.scope.refresh.bind(this);
    this.scope.prefix = this.scope.prefix.bind(this);
    this.scope.updateFiles = this.scope.updateFiles.bind(this);
    this.scope.open = this.scope.open.bind(this);
    this.scope.close = this.scope.close.bind(this);
    return this.scope.refresh();
};

app.directive('bucketViewer', ['S3', function() {
    return {
        templateUrl: '/scripts/directives/bucket-viewer.template.html',
        controller: ['S3', '$scope', BucketViewerController],
        scope: {
            basePrefix: '@'
          }
    }
}]);

