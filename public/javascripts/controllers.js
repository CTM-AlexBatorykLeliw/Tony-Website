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

    var links = MediaService.get('/articles/links');
    var PDFs = MediaService.get('/articles/PDFs');

    $scope.linkCheck = true, $scope.PDFCheck = true;

    $scope.actionArticle = function(id, type)
    {
        if(type)
            $window.open('http://' + $scope.links[id].link,'_blank');
        else
            $window.open($scope.PDFs[id].path, '_blank');
    }

});

app.controller('mediaCtrl', function($scope, MediaService){
    $scope.images = MediaService.get('/media/images');
    $scope.videos = MediaService.get('/media/videos');
    $scope.audio = MediaService.get('/media/audio');
    console.log($scope.images);
});

app.controller('uploadCtrl', function($scope, MediaService, fs, UsersApi){
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

        MediaService.post('/uploads', asset).success(function(){
            alert("Link uploaded");
        });
    }

    $scope.uploadPDF = function()
    {
        var asset = {
            title: $scope.a.title,
            desc: $scope.a.desc,
            type: 'PDF',
            section: $scope.a.section
        };

        uploadFile('PDF');
    }

    $scope.uploadMedia = function(type)
    {
        var asset = {
            title: $scope.a.title,
            desc: $scope.a.desc,
            type: type
        };

        uploadFile(type);
    }

    function uploadFile(type)
    {
        fs.readFile(req.files.fileUpload.path, function(err, data){
            if(err)
                console.log(err);
            
            // If successful read of file, write the file into folder
            var newPath = __dirname + '/assets/' + type + '/' + req.files.fileUpload.name;
            fs.writeFile(newPath, data, function(err){
                if(err)
                    return next(err);

                // If the write of file is successful, add path and send info to DB
                asset.path = newPath;
                MediaService.post('/uploads', asset).success(function(){
                    alert(type + " Upload Complete");
                });
            });
        });
    }

    $scope.delete = function(id)
    {
        MediaService.delete(id).success(function(){
            console.log("Asset Deleted");
        });
    }
});