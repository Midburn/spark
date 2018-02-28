var BucketViewerController = function(S3, $scope) {
    this.scope = $scope;
    this.s3 = S3;
    this.currentPrefix = '';
    this.updateFiles = this.updateFiles.bind(this)
    return this.refresh();
};

BucketViewerController.prototype.home = function() {
    this.currentPrefix = '';
    return this.refresh();
};

BucketViewerController.prototype.open = function(prefix) {
    this.currentPrefix = this.currentPrefix + prefix;
    return this.refresh();
};

BucketViewerController.prototype.close = function() {
    if (this.currentPrefix.slice(-1) === '/') { this.currentPrefix = this.currentPrefix.slice(0, -1); }
    this.currentPrefix = this.currentPrefix.substr(0, this.currentPrefix.lastIndexOf('/') + 1);
    return this.refresh();
};

BucketViewerController.prototype.prefix = function() {
    return this.scope.basePrefix + this.currentPrefix;
}

BucketViewerController.prototype.updateFiles = function(newFiles) {
    this.files = newFiles;
    //return this.scope.$digest();
}

BucketViewerController.prototype.refresh = function() {
    return this.s3.list(this.prefix())
      .then(data => {
        return data
          .map(el => {
            el.Key = el.Key.substr(this.prefix().length);
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
      }).then(this.updateFiles);
}

app.directive('bucketViewer', ['S3', function() {
    return {
        templateUrl: '/scripts/directives/bucket-viewer.template.html',
        controller: ['S3', '$scope', BucketViewerController],
        scope: {
            basePrefix: '@'
          }
    }
}]);

