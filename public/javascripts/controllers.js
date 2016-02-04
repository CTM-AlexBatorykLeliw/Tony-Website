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
            controller: 'articlesCtrl'
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
    $scope.readMore = false;
});

app.controller('contactCtrl', function($scope, MediaService){

    $scope.submit = function()
    {
        var mail = {
            name: $scope.name,
            email: $scope.email,
            text: $scope.text
        }; // Fix this later, text and name not pulling through
console.log($scope);
        MediaService.post('/contact', mail).success(function(){
            $scope.submitted = true;
        });
    }
});

app.controller('articlesCtrl',  function($scope, $window, MediaService){

    $scope.section = "!!";
    $scope.pdf = true, $scope.link = true;
    $pdfChecked = $scope.pdfCheck && $scope.PDFs.length == 0;
    MediaService.get('/articles/links').success(function(data){
        $scope.links = data;
    });
    MediaService.get('/articles/PDFs').success(function(data){
        $scope.PDFs = data;
    });

    $scope.click = function(id, type)
    {
        if(type) // For links
            $window.open('http://' + $scope.links[id].link,'_blank');
        else // For PDF's
            $window.open($scope.PDFs[id].path, '_blank');
    }

});

app.controller('mediaCtrl', function($scope, MediaService){
    $scope.images = MediaService.get('/media/images');
    $scope.videos = MediaService.get('/media/videos');
    $scope.audio = MediaService.get('/media/audio');
    console.log($scope.images);
});

app.controller('uploadCtrl', function($scope, MediaService, $http){
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

        MediaService.post('/uploads/links', asset).success(function(){
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

        var file = $scope.myFile;
        var fd = new FormData();
        //fd.append('file', file);
console.log(file, fd);
        // $http.post('/uploads/files', fd, {
        //     transformRequest: angular.identity,
        //     headers: {'Content-Type': undefined}
        // })
        // .success(function(){
        //     console.log('success');
        // })
        // .error(function(err){
        //     console.log(err);
        // });
    }

    function uploadFile(asset)
    {
        MediaService.post('/uploads/files', asset).success(function(){
            alert("Asset uploaded");
        });
    }

    $scope.delete = function(id)
    {
        MediaService.delete(id).success(function(){
            console.log("Asset Deleted");
        });
    }
});