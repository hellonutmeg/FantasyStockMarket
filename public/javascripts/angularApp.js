
angular.module('flapperNews', ['ui.router'])
.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'StocksCtrl',
      resolve: {
        postPromise: ['stocks', function(stocks){
          return stocks.getEnabled();
        }]
      }
    })
    .state('allStocks', {
        url: '/allStocks',
        templateUrl: '/allStocks.html',
        controller: 'StocksCtrl',
        resolve: {
            postPromise: ['stocks', function(stocks){
                return allStocks.getAll();
            }]
        }
    })
    .state('myTrades', {
        url: '/myTrades',
        templateUrl: '/myTrades.html',
        controller: 'MyTradesCtrl',
        resolve: {
            postPromise: ['myTrades', function(myTrades){
                return myTrades.getAll();
            }]
        }
    })
    .state('allTrades', {
        url: '/allTrades',
        templateUrl: '/allTrades.html',
        controller: 'AllTradesCtrl',
        resolve: {
            postPromise: ['allTrades', function(allTrades){
                return allTrades.getAll();
            }]
        }
    })

    .state('myHoldings', {
        url: '/myHoldings',
        templateUrl: '/myHoldings.html',
        controller: 'MyHoldingsCtrl',
        resolve: {
            postPromise: ['myHoldings', function(myHoldings){
                return myHoldings.getAll();
            }]
        }
    })

    .state('allHoldings', {
        url: '/allHoldings',
        templateUrl: '/allHoldings.html',
        controller: 'AllHoldingsCtrl',
        resolve: {
            postPromise: ['allHoldings', function(allHoldings){
                return allHoldings.getAll();
            }]
        }
    })

      //  .state('trades', {
  //    url: '/posts/{id}',
  //    templateUrl: '/posts.html',
  //    controller: 'PostsCtrl',
  //    resolve: {
  //      post: ['$stateParams', 'posts', function($stateParams, posts) {
  //        return posts.get($stateParams.id);
  //      }]
  //    }
  //  })
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        console.log(auth);
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });

  $urlRouterProvider.otherwise('home');
}])
.factory('stocks', ['$http', 'auth', function($http, auth){
  var o = {
    stocks: []
  };

  o.get = function(id) {
    return $http.get('/stocks/' + id).then(function(res){
      return res.data;
    });
  };

  o.getAll = function() {
    return $http.get('/stocks').success(function(data){
      angular.copy(data, o.stocks);
    });
  };

  o.getEnabled = function() {
      return $http.get('/stocks').success(function(data){
          angular.copy(data, o.stocks);
      });
  };

  o.create = function(stock) {
    return $http.post('/stocks', stock, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.stocks.push(data);
    });
  };

  o.enableStock = function(stock, true) {
    return $http.put('/stocks/' + stock.id + '/enable', {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      stock.enabled = true;
    });
  };

  o.disableStock = function(stock, false) {
      return $http.put('/stocks/' + stock.id + '/disable', {
          headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
          stock.enabled = false;
      });
  };

  return o;
}])
.factory('auth', ['$http', '$window', '$rootScope', function($http, $window, $rootScope){
   var auth = {
    saveToken: function (token){
      $window.localStorage['fantasy-stock-market'] = token;
    },
    getToken: function (){
      return $window.localStorage['fantasy-stock-market'];
    },
    isLoggedIn: function(){
      var token = auth.getToken();

      if(token){
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        
        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    },
    currentUser: function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.username;
      }
    },
    register: function(user){
      console.log(user);

      return $http.post('/register', user).success(function(data){
          console.log(data);
        auth.saveToken(data.token);
      });
    },
    logIn: function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
      });
    },
    logOut: function(){
      $window.localStorage.removeItem('flapper-news-token');
    }
  };

  return auth;
}])
.controller('TradesCtrl', [
'$scope',
'trades',
'auth',
function($scope, trades, auth){
  $scope.trades = trades.trades;
  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.addTrade= function(){
    if($scope.transaction === '') { return; }
    if($scope.stock === '') { return; }
    if($scope.quantity === '' && $scope.value === '') { return; }

    trades.create({
      transaction: $scope.transaction,
      stockId: $scope.stockId,
      price: $scope.price,
      quantity: $scope.quantity,
      value: $scope.value
    });
    $scope.transaction = '';
    $scope.stockId = '';
    $scope.price = '';
    $scope.quantity = '';
    $scope.value = '';
  };
}])
.controller('StocksCtrl', [
'$scope',
'stocks',
'stock',
'auth',
function($scope, stocks, stock, auth){
  $scope.stock = stock;
  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.addStock = function(){
    if($scope.name === '') { return; }
    if($scope.price === '') { return; }
    stocks.add(stock._id, {
      name: $scope.name,
      price: $scope.price,
      lastUpdate: Date.now(),
      enabled: false
    }).success(function(stock) {
      $scope.stocks.push(stock);
    });
    $scope.name = '';
    $scope.price = '';
  };

  $scope.enable = function(stock){
    stocks.enable(stock);
  };
  $scope.disable = function(stock){
      stocks.disable(stock);
  };
}])
.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){

    auth.register($scope.user).error(function(error){
      $scope.error = error;
      console.log(error);
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])
.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);
