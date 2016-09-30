var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {

var refresh = function() {
  $http.get('/products').success(function(response) {
    console.log("I got the data I requested");
    $scope.products = response;
    $scope.product = "";
  });
};

refresh();

$scope.addproduct = function() {
  console.log($scope.product);
  $http.post('/products', $scope.product).success(function(response) {
    console.log(response);
    refresh();
  });
};

$scope.remove = function(id) {
  console.log(id);
  $http.delete('/products/' + id).success(function(response) {
    refresh();
  });
};

$scope.edit = function(id) {
  console.log(id);
  $http.get('/products/' + id).success(function(response) {
    $scope.product = response;
  });
};  

$scope.update = function() {
  console.log($scope.product._id);
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
});