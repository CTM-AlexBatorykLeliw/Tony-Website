var app = angular.module('portfolio', ['ngRoute']);

app.config(function($routeProvider){
    $routeProvider
        .when('/home', {
            templateUrl: 'home.html',
            controller: 'homeCtrl'
        })
        .when('/media', {
            templateUrl: 'media.html',
            controller: 'mediaCtrl'
        })
        .when('/contact', {
            templateUrl: 'contact.html',
            controller: 'contactCtrl'
        })
        .when('/articles', {
            templateUrl: 'articles.html',
            controller: 'articlesCtrl',
            resolve: {
                links: function(httpService){
                    return httpService.get('/articles/links');
                },
                PDFs: function(httpService){
                    return httpService.get('/articles/PDFs');
                }
            }
        })
        .otherwise({ redirectTo: '/home' });
});

app.service('httpService', function($http){

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
    $scope.readMore = false;
});

app.controller('contactCtrl', function($scope, httpService){
    $scope.a = {};

    $scope.submit = function()
    {
        var mail = {
            name: $scope.a.name,
            email: $scope.a.email,
            text: $scope.a.text
        };

        httpService.post('/contact', mail).success(function(){
            $scope.submitted = true;
        });
    }
});

app.controller('articlesCtrl',  function($scope, $window, links, PDFs){

    $scope.section = "!!";
    $scope.pdf = true, $scope.link = true;
    // httpService.get('/articles/links').success(function(data){
    //     $scope.links = data;
    // });
    // httpService.get('/articles/PDFs').success(function(data){
    //     $scope.PDFs = data;
    // });

    $scope.click = function(id, type)
    {
        if(type) // For links
            $window.open('http://' + $scope.links[id].link,'_blank');
        else // For PDF's
            $window.open($scope.PDFs[id].path, '_blank');
    }

});

app.controller('mediaCtrl', function($scope, httpService){
    httpService.get('/media/images').success(function(data){
        $scope.images = data;console.log($scope.images);
    });    
    httpService.get('/media/videos').success(function(data){
        $scope.videos = data;
    });    
    httpService.get('/media/audio').success(function(data){
        $scope.audio = data;
    });
});

app.controller('uploadCtrl', function($scope, httpService){
    $scope.a = {};

    $scope.uploadLink = function()
    {
        var asset = {
            title: $scope.a.title,
            desc: $scope.a.desc,
            link: $scope.a.link,
            section: $scope.a.section,
            type: 'link'
        };

        httpService.post('/uploads/links', asset).success(function(){
            alert("Link uploaded");
        });
    }

    $scope.uploadPDF = function()
    {
        var asset = {
            title: $scope.a.title,
            desc: $scope.a.desc,
            type: 'PDF',
            section: $scope.a.section,
            path: $scope.a.path
        };
        console.log($scope.a.path);
        //uploadFile(asset);
    }

    $scope.uploadFile = function(type)
    {
        var asset = {
            title: $scope.a.title,
            desc: $scope.a.desc,
            type: type
        };

        // Upload code here
    }

    function uploadFile(asset)
    {
        httpService.post('/uploads/files', asset).success(function(){
            alert("Asset uploaded");
        });
    }

    $scope.delete = function(id)
    {
        httpService.delete(id).success(function(){
            console.log("Asset Deleted");
        });
    }
});