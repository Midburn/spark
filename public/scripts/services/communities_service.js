// angular_getCamps function from supplier_edit.js
app.factory ('communitiesService', ['$http', '$q', communitiesFactory]);

// angular_getCamps function from supplier_edit.js
suppliers_app.factory ('communitiesService', [
  '$http',
  '$q',
  communitiesFactory,
]);

function communitiesFactory ($http, $q) {
  const factory = {};
  console.log ('Starting communities service');
  $http
    .get ('/communities/api/1')
    .then (data => {
      console.log (data);
    })
    .catch (e => {
      console.log (e);
    });

  return factory;
}
