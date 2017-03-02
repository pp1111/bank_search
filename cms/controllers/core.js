var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {

$scope.filterByEdited = false;
$scope.filterByAlive = false;
$scope.sortOrder = '';
$scope.filterString = '';

var url = window.location.pathname.split('/');

var refresh = function() {
  if (url.length == 3) return; 
  $http.get('/products').success(function(response) {
    $scope.products = response;
    $scope.product = "";
  });
};

refresh();

var init = function () {
    if (window.location.pathname.split('/')[1] == 'selected') {
      $http.get('/products/' + window.location.pathname.split('/')[2]).success(function(response) {
        $scope.product = response;
      });
    } 
};

init();

$scope.addproduct = function() {
  console.log($scope.product);
  $http.post('/products', $scope.product).success(function(response) {
    refresh();
  });
};

$scope.remove = function(id) {
  $http.delete('/products/' + id).success(function(response) {
    refresh();
  });
};

$scope.edit = function(id) {
  $http.get('/products/' + id).success(function(response) {
    $scope.product = response;
  });
};  

$scope.update = function() {
  $http.put('/products/' + $scope.product._id, $scope.product).success(function(response) {
    refresh();
  })
};

$scope.deselect = function() {
  $scope.product = "";
}

}]).directive('ckEditor', function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attr, ngModel) {
      var ck = CKEDITOR.replace(elm[0]);

      if (!ngModel) return;

      ck.on('pasteState', function() {
        scope.$apply(function() {
          ngModel.$setViewValue(ck.getData());
        });
      });

      ngModel.$render = function(value) {
        ck.setData(ngModel.$viewValue);
      };
    }
  };
}).filter('myfilter', function() {
   return function( items, types) {
    var itemsList = [];
    var filterBy = [];
    if (types) {
      if (types.alive) itemsList = itemsList.concat(items.filter(item => item.alive))
      if (types.updated) itemsList = itemsList.concat(items.filter(item => item.updated))
      if (types.notUpdated) itemsList = itemsList.concat(items.filter(item => !item.updated))
      if (types.activeRedirect) itemsList = itemsList.concat(items.filter(item => item.application.isActive))
      if (types.notActiveRedirect) itemsList = itemsList.concat(items.filter(item => !item.application.isActive))

      itemsList = itemsList.filter(function(elem, index, self) {
          return index == self.indexOf(elem);
      })
      return itemsList.length ? itemsList : items;
    } else {
      return items;
    }
  };
});