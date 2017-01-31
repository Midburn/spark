var app = angular.module("myApp", []);

app.controller("myCtrl", function($scope) {
  function getMembers(){
    $scope.members = [
      {
    "_id": "5890bdeb1f3184927792f8a0",
    "name": "Wanda Clayton",
    "email": "wandaclayton@maroptic.com",
    "phone": "+972 (858) 481-3724",
    "status": "Waiting",
    "hasTicket": false,
    "earlyArrival": true
  },
      {
    "_id": "5890bdeb4daf31718de90040",
    "name": "Norman Flores",
    "email": "normanflores@maroptic.com",
    "phone": "+972 (893) 455-3969",
    "status": "Waiting",
    "hasTicket": true,
    "earlyArrival": true
  },
      {
    "_id": "5890bdeb512c5d0f21a17ca5",
    "name": "Huffman Manning",
    "email": "huffmanmanning@maroptic.com",
    "phone": "+972 (996) 558-2990",
    "status": "Not in Camp",
    "hasTicket": true,
    "earlyArrival": true
  },
      {
    "_id": "5890bdeb0212fae92603fb9d",
    "name": "Mayra Yang",
    "email": "mayrayang@maroptic.com",
    "phone": "+972 (939) 409-2326",
    "status": "Waiting",
    "hasTicket": false,
    "earlyArrival": false
  },
      {
    "_id": "5890bdeb5f7e569e5fe2e597",
    "name": "Katie Nicholson",
    "email": "katienicholson@maroptic.com",
    "phone": "+972 (820) 507-3433",
    "status": "Waiting",
    "hasTicket": true,
    "earlyArrival": true
  }
    ]
  }
  getMembers();

  $scope.changeOrderBy = function (orderByValue) {
    $scope.orderMembers = orderByValue;
  }
});




// http://www.json-generator.com/
// [
//   '{{repeat(5, 7)}}',
//   {
//     _id: '{{objectId()}}',
//     name: '{{firstName()}} {{surname()}}',
//     email: '{{email()}}',
//     phone: '+972 {{phone()}}',
//     status: '{{random("Approved", "Waiting", "Not in Camp")}}',
//     hasTicket: '{{bool()}}',
//     earlyArrival: '{{bool()}}'
//   }
// ]
