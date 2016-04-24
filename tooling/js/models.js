/**
 * Created by Johan on 2016-04-24.
 */
/***
 * MODELS and MODELMANAGERS for use in controllers.
 *
 * as derived from http://www.webdeveasy.com/angularjs-data-model/
 *
 */

/**
 * User
 */

uat.factory('User', [$http, function($http){
    function User(userData) {
        if (userData) {
            this.setData(userData);
        }
    };

    User.prototype = {
        setData: function(userData) {
            angular.extend(this, userData);
        },
        delete: function () {
            $http.delete('http://localhost:3000/api/user/'+userId);
        },
        update: function() {
            $http.put('http://localhost:3000/api/user/'+userId, this);
        }
    };
    return User;
}]);


uat.factory('userManager', [$http, $q, User, function($http, $q, User) {
    var userManager = {
        _pool: {},
        _retriveInstance: function(userId, userData) {
            var instance = this._pool[userId];

            if (instance) {
                instance.setData(userData);
            } else {
                instance = new User(userData);
                this._pool[userId] = instance;
            }

            return instance;
        },
        _search: function(userId) {
            return this._pool[userId];
        },
        _load: function(userId, deferred) {
            var scope = this;

            $http.get('http://localhost:3000/api/user/'+userId)
                .success(function(userData){
                  var user = scope._retriveInstance(userData._id, userData);
                    deferred.resolve(user);
                })
                .error(function(){
                    deferred.reject();
                });
        },
        /* Public methods */
        getUser: function (userId) {
            var deferred = $q.defer();
            var user = this._search(userId);
            if (user) {
                deferred.resolve(user);
            } else {
                this._load(userId, deferred);
            }
            return deferred.promise;
        },
        getAllUsers: function () {
            var deferred = $q.defer();
            var scope = this;
            $http.get('http://localhost:3000/api/user')
                .success(function(userArray){
                    var users = [];
                    userArray.forEach(function(userData){
                        var user = scope._retriveInstance(userData._id, userData);
                        users.push(user);
                    });
                    deferred.resolve(users);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        setUser: function(userData) {
            var scope = this;
            var user = this._search(userData._id);
            if (user) {
                user.setData(userData);
            } else {
                user = scope._retriveInstance(userData);
            }
            return user;
        },

    };
    return userManager;
}]);