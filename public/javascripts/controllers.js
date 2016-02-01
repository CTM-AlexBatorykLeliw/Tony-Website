var app = angular.module('portfolio', ['ngRoute']);

app.config(function($routeProvider){
    $routeProvider
        .when('/home', {
            templateUrl: 'home.html',
            controller: 'homeCtrl',
            activetab: 'home'
        })
        .when('/media', {
            templateUrl: 'media.html',
            controller: 'mediaCtrl',
            activetab: 'media'
        })
        .when('/contact', {
            templateUrl: 'contact.html',
            controller: 'contactCtrl',
            activetab: 'contact'
        })
        .when('/articles', {
            templateUrl: 'articles.html',
            controller: 'articlesCtrl',
            resolve: {
                postPromise: ['MediaService', function(MediaService){
                    return MediaService.get('/articles');
                }]
            },
            activetab: 'articles'
        })
        .otherwise({ redirectTo: '/home' });
});

app.service('MediaService', function($http){

    this.get = function(url)
    {
        return $http.get(url);
    }

    this.post = function(url, data)
    {
        return $http.post(url, data);
    }

    this.put = function(url, data)
    {
        return $http.put(url, data);
    }

    this.delete = function(url)
    {
        return $http.delete(url);
    }
});

app.controller('homeCtrl', function($scope, $route){
    $scope.$route = $route;
});

app.controller('contactCtrl', function($scope){

    $scope.submit = function()
    {
        var mail = {
            from: $scope.name + "<" + $scope.email + ">",
            //to: "tony.leliw@sky.com",
            to: "alex.batoryk.leliw@hotmail.com",
            subject: $scope.subject,
            text: $scope.moreinfo
        }
        smtpTransport.sendMail(mail, function(err, res){
            if(err)
                console.log(err);
            else
                console.log("Message sent: " + res.message);
            
            smtpTransport.close();
        });
    }
});

app.controller('articlesCtrl',  function($scope, $window){

    // $scope.section = "!!";

    // $scope.linkCheck = true, $scope.PDFCheck = true;
    // $scope.linkShow = $scope.linkCheck && links.length == 0;
    // $scope.PDFShow = $scope.PDFCheck && PDFs.length == 0;
    // $scope.errMsg = !links.length == 0 && !PDFs.length == 0;

    // for(var i = 0; i < $scope.articleList.length; i++)
    // {
    //     if($scope.articleList[i].type === "PDF")
    //         $scope.PDFs.push($scope.articleList[i])
    //     else if($scope.articleList[i].type === "link")
    //         $scope.links.push($scope.articleList[i]);
    // }

    // $scope.gotoArticle = function(id, type)
    // {
    //     if(type === "link")
    //         $window.open('http://' + $scope.links[id].link,'_blank');
    //     else if(type === 'PDF')
    //         $window.open($scope.PDFs[id].link);
    // }

});

app.controller('mediaCtrl', function($scope){

});