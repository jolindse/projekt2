/**
 * Created by Jonas on 2016-04-27.
 */

/**
 * LOGIN-CONTROLLER
 */
myApp.controller("loginCtrl", ['$http','$scope','$location','$rootScope','userService','UserManager', function($http, $scope, $location, $rootScope, userService, UserManager) {
    $scope.errorMessage = "";
    $scope.username = "";
    $scope.password = "";
    $scope.loading = false;
    var counter = 0;

    //Login:
    $scope.attemptLogin = function() {

        $.ajax({
            type: 'post',
            url: '/api/user/login/' + $scope.username,
            data: "password=" + $scope.password,
            dataType: "json",
            traditional: true,

            //If student, send to student-site, if admin send to admin-site:
            success: function (data) {
                if (data.login == true && data.user.admin == false){
                    sessionStorage.setItem('userId', data.user.id);
                    $location.path("/student");
                }
                else if (data.login == true && data.user.admin == true){
                    sessionStorage.setItem('userId', data.user.id);
                    $location.path("/admin");
                }
                else if (data.login == false){
                    console.log(data);
                }

                //Add data to userService:
                userService.login(data.user.firstName, data.user._id, data.user.admin, data.user.testToTake);

                if(!$scope.$$phase) {
                    //https://github.com/yearofmoo/AngularJS-Scope.SafeApply
                    $scope.$apply()
                }

            },
            error: function (errormessage) {
                if (errormessage.responseJSON.message == "Kontrollera användarnamn och lösenord"){
                    counter++;
                }
                if (counter == 3){
                    $scope.loginError = false;
                    $scope.sendPasswordBtn = true;
                    counter = 0;
                }else {
                    $scope.errorMessage = errormessage.responseJSON.message;
                    $scope.loginError = true;
                }

                if(!$scope.$$phase) {
                    //https://github.com/yearofmoo/AngularJS-Scope.SafeApply
                    $scope.$apply();
                }
            }
        });
    };
    $scope.sendPassword = function () {
        $scope.loginError = false;
        $scope.loading = true;

        $http.get("/api/sendpass/" + $scope.username).success(function (data, status) {
            console.log("status = " + status);
            if (status == 200){
                $scope.sendPasswordBtn = false;
                $scope.loginSuccess = true;
                $scope.successMessage = "Mail med lösenord skickat!"
            }
            else {
                $scope.errorMessage = "Kunde inte skicka mail, vänligen försök igen.";
            }
        });
    }
}]);

/**
 * INDEX-CONTROLLER:
 */
myApp.controller('indexCtrl', function ($scope, $location, userService) {

    //When clicking the Newton-logo:
    $scope.clickLogo = function() {
        if (userService.admin == true){
            $location.path("/admin");
        }
        else if (userService.admin == false){
            $location.path("/student");
        }
    };

    //Updating the nav-bar when broadcast is sent:
    $scope.$on('updateNavbarBroadcast', function () {

        if (sessionStorage.getItem('userId') != null) {
            $scope.showLogout = true;

            if (userService.admin == true) {
                $scope.showAdminNav = true;
                $scope.showUserDetailsNav = true;
            }
            else if (userService.admin == false) {
                $scope.showStudentNav = true;
                $scope.showUserDetailsNav = true;
            }
        }
        else {
            $scope.showLogout = false;
            $scope.showAdminNav = false;
            $scope.showStudentNav = false;
            $scope.showUserDetailsNav = false;
        }
    });

    //Logout
    $scope.logout = function () {
        sessionStorage.clear();
        userService.updateNavbar();
    }

});

/**
 * STUDENT-CONTROLLER:
 */
myApp.controller('studentCtrl', function ($location, $scope, UserManager, ExamManager, userService) {
    //Update navbar:
    userService.updateNavbar();

    $scope.user = "";
    $scope.selectedTest = null;

    //Get current student:
    UserManager.getUser(userService.id, function (data) {

        $scope.user = data;
        $scope.tests = [];

        //Get the active tests for the student:
        $scope.user.testToTake.forEach(function(testId) {
            ExamManager.getExam(testId, function (test) {
                $scope.tests.push(test);
            });
        });
    });

    //When selecting an exam in the table:
    $scope.selectExam = function (data) {
        userService.currentExam = data._id;
        $scope.selectedTest = data;
    };

    //When starting exam, remove the test from the users test-array and update the database, then send to /doexam.
    $scope.startExam = function () {
        $scope.user.testToTake.splice($scope.user.testToTake.indexOf(userService.currentExam), 1);
        var currentDate = new Date();
        var hours = currentDate.getHours();
        var minutes = currentDate.getMinutes();
        var currentTime = hours + ":" + minutes;
        userService.startTime = currentTime;
        UserManager.setUser($scope.user);
        $location.path("/doexam");
    }
});

/**
 * ADMIN-CONTROLLER:
 */
myApp.controller('adminCtrl', function (APIBASEURL, $http, $scope, StudentClassManager, UserManager, ExamManager, userService) {
    userService.updateNavbar();

    //Current user:
    $scope.user = "";

    //All exams:
    $scope.tests = [];

    //The selected exam (for sharing):
    $scope.selectedTest = null;
    //Array with studentId's (for email-notification)
    var recObj = {
        rec: []
    };

    //Usertable:
    $scope.users = [];

    //All studentclasses:
    $scope.studentClasses = [];

    //Array holding students, studentclasses and a boolean if selected or not in the table:
    $scope.selectedStudents = [];

    //For sorting the usertable when sharing an exam:
    $scope.sortType     = 'name';
    $scope.sortReverse  = false;
    $scope.searchUser   = '';
    //Loading animation when sharing exam:
    $scope.loading = false;
    //When a sharing an exam successfully:
    $scope.successShare = false;
    $scope.successShare = false;
    $scope.successMessage = null;
    $scope.errorMessage = null;

    //Get all exams:
    ExamManager.getAllExams(function (test) {
        $scope.tests = test;
    });

    //Get the user who has logged in:
    UserManager.getUser(userService.id, function (data) {
        $scope.user = data;
    });

    //Get all users (shows in table):
    UserManager.getAllUsers(function (data) {
        $scope.users = data;

        //Loop trough users and add students(not admin), classes and a selected boolean to the array "selectedStudents":
        $scope.users.forEach(function (student) {
            if (student.admin == false) {
                $scope.selectedStudents.push(
                    {
                        user: student,
                        studentClass: "",
                        selected: false
                    }
                );
            }
        });

        //Get all studentClasses:
        StudentClassManager.getAllStudentClasses(function (data) {
            $scope.studentClasses = data;

            //Add classes to the array "selectedStudents":
            $scope.selectedStudents.forEach(function (student) {
                $scope.studentClasses.forEach(function (studentClass) {
                    studentClass.students.forEach(function (studentId) {
                        if (student.user._id == studentId){
                            student.studentClass = studentClass.name;
                        }
                    })
                })

            });
        });
    });

    //Get selected exam from the table when sharing an exam:
    $scope.selectExam = function (data) {

        //Get the exam:
        ExamManager.getExam(data._id, function (data) {
            $scope.selectedTest = data;
        });

        //Check which students have access to the test:
        $scope.selectedStudents.forEach(function (selectedStudent) {
            selectedStudent.user.testToTake.forEach(function (selectedTest) {
                if (selectedTest == $scope.selectedTest._id){
                    selectedStudent.selected = true;
                }
            });
        });
    };

    //Listener for the button "share exam":
    $scope.shareExam = function () {
        $scope.loading = true;

        //Loop trough the array selectedStudents:
        $scope.selectedStudents.forEach(function (student) {

                //If the variable "selected" is true, then the student was selected in the list:
                if (student.selected == true) {

                    //Push to the array "testToTake" and update the student in the database:
                    if (student.user.testToTake.indexOf($scope.selectedTest._id) == -1){
                        student.user.testToTake.push($scope.selectedTest._id);
                        UserManager.setUser(student.user);
                        recObj.rec.push(student.user._id);
                    }
                }
                else if(student.selected == false){
                    //Remove the test and update student:
                    if (student.user.testToTake.indexOf($scope.selectedTest._id) != -1){
                        student.user.testToTake.splice(student.user.testToTake.indexOf($scope.selectedTest._id), 1);
                        UserManager.setUser(student.user);
                    }
                }
            }
        );

        /* MAIL FUNCTION DISABLED PREVENTING SPAM WHEN TESTING <-------------------------*/
        if (recObj.rec.length > 0) {
            console.log("innan mail " + JSON.stringify(recObj));

            $http.post("/api/mail", JSON.stringify(recObj))
                .success(function (data, status) {
                console.log("status = " + status);
                console.log("data = " + data);

                if (status == 200){
                    $scope.loading = false;
                    $scope.successShare = true;
                    $scope.successMessage = "Du har nu delat provet " + $scope.selectedTest.title + "och studenterna har informerats via email.";
                }
                else {
                    $scope.loading = false;
                    $scope.errorShare = true;
                    $scope.errorMessage = "Du har nu delat provet " + $scope.selectedTest.title + " men tyvärr har inget email skickats iväg, vänligen försök igen..";
                }
            })
                .error(function (data, status) {
                $scope.loading = false;

                $scope.errorShare = true;
                $scope.errorMessage = "Du har nu delat provet " + $scope.selectedTest.title + " men tyvärr har inget email skickats iväg, vänligen försök igen..";

                console.log(data);
                console.log(status);
            });
        }
        else {
            $scope.loading = false;
        }


    };
});

/**
 * USERDETAIL-CONTROLLER:
 */
myApp.controller('userDetailCtrl', function ($scope, $route, UserManager, userService) {
    $scope.user = "";
    $scope.firstNameDisabled = true;
    $scope.lastNameDisabled = true;
    $scope.passwordDisabled = true;
    $scope.emailDisabled = true;
    $scope.detailsChanged = false;
    $scope.showbutton = false;


    //Get current user:
    UserManager.getUser(userService.id, function (data) {
        $scope.user = data;
    });

    //Change first name:
    $scope.changeFirstName = function () {
        $scope.firstNameDisabled = false;
        $scope.showbutton = true;
    };

    //Change last name:
    $scope.changeLastName = function () {
        $scope.lastNameDisabled = false;
        $scope.showbutton = true;
    };

    //Change password:
    $scope.changePassword = function () {
        $scope.passwordDisabled = false;
        $scope.showbutton = true;
    };

    //Change email:
    $scope.changeEmail = function () {
        $scope.emailDisabled = false;
        $scope.showbutton = true;
    };

    //Update the user:
    $scope.updateUser = function () {
        UserManager.setUser($scope.user);
        $scope.firstNameDisabled = true;
        $scope.lastNameDisabled = true;
        $scope.passwordDisabled = true;
        $scope.emailDisabled = true;
        $scope.detailsChanged = true;
        $scope.showbutton = false;
    };

});
