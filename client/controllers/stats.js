myApp.controller('statsCtrl', [
    '$scope',
    '$uibModalInstance',
    'statsParam',
    '$http',
    'APIBASEURL',
    'UserManager',
    'ExamManager',
    function ($scope,
              $uibModalInstance,
              statsParam,
              $http,
              APIBASEURL) {

        $scope.statsList = statsParam;
        $scope.statsObj = "";
        $scope.stats = $scope.statsObj;


        $scope.buildUser = function (id) {
            $http.get(APIBASEURL + '/api/statistics/user/' + id)
                .success(function (data) {
                    $scope.stats = data;
                });
        };

        $scope.buildExam = function (id) {
            $http.get(APIBASEURL + '/api/statistics/exam/' + id)
                .success(function (data) {
                    $scope.stats = data;
                });
        };

        $scope.buildClass = function (id) {
            $http.get(APIBASEURL + '/api/statistics/class/' + id)
                .success(function (data) {
                    $scope.stats = data;
                });
        };

        // MODAL

        /**
         * Cancel modal
         */
        $scope.close = function () {
            $uibModalInstance.dismiss();
        };

        switch(statsParam.type) {
            case 'user':
                $scope.buildUser(statsParam.id);
                break;
            case 'class':
                $scope.buildClass(statsParam.id);
                break;
            case 'exam':
                $scope.buildExam(statsParam.id);
                break;
        }




    }
]);