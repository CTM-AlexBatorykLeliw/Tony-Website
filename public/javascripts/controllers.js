var app = angular.module('portfolio', ['ngRoute', 'fs']);

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
                postPromise: ['MediaService', function(MediaService){
                    return MediaService.get('/articles');
                }]
            }
        })
        .when('/uploads', {
            templateUrl: 'uploads.html',
            controller: 'uploadCtrl',
            resolve: {
                postPromise: ['MediaService', function(MediaService){
                    return MediaService.get('/media');
                }]
            }
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
        };

        smtpTransport.sendMail(mail, function(err, res){
            if(err)
                console.log(err);
            else
                console.log("Message sent: " + res.message);
            
            smtpTransport.close();
        });
    }
});

app.controller('articlesCtrl',  function($scope, $window, MediaService){

    var links = MediaService.get('/articles/links');
    var PDFs = MediaService.get('/articles/PDFs')

    $scope.linkCheck = true, $scope.PDFCheck = true;

    $scope.actionArticle = function(id, type)
    {
        if(type)
            $window.open('http://' + $scope.links[id].link,'_blank');
        else
            $window.open($scope.PDFs[id].link, '_blank');
    }

});

app.controller('mediaCtrl', function($scope){
    $scope.images = MediaService.get('/');
});

app.controller('uploadCtrl', function($scope, MediaService, fs){
    $scope.a = {};

    $scope.uploadArticle = function()
    {
        var asset = {
            title: $scope.a.title,
            desc: $scope.a.desc,
            link: $scope.a.link,
            section: $scope.a.section,
            type: $scope.a.type,
            path: $scope.a.path
        };

        MediaService.post('/uploads', asset).success(function(){
            fs.readFile(req.files.displayImage.path, function(err, data){
                if(err)
                    console.log(err);
                
                var newPath = __dirname + '/uploads/uploadedFileName';
                fs.writeFile(newPath, data, function(err){
                    res.redirect("back");
                });
            });
            console.log("Upload Complete");
        });
    }

    $scope.delete = function(id)
    {
        MediaService.delete(id).success(function(){
            console.log("Asset Deleted");
        });
    }
});