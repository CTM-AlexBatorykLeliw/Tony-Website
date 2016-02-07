var app = angular.module('portfolio', ['ngRoute']);

app.config(function($routeProvider){
    $routeProvider
        .when('/home', {
            templateUrl: 'partials/home.html',
            controller: 'homeCtrl'
        })
        .when('/media', {
            templateUrl: 'partials/media.html'
        })
        .when('/media/images', {
            templateUrl: 'partials/media/images.html',
            controller: 'imageCtrl',
            resolve: {
                images: function(httpService){
                    return httpService.get('/media/images');
                }
            }
        })        
        .when('/media/audio', {
            templateUrl: 'partials/media/audio.html',
            controller: 'audioCtrl',
            resolve: {
                audio: function(httpService){
                    return httpService.get('/media/audio');
                }
            }
        })        
        .when('/media/videos', {
            templateUrl: 'partials/media/videos.html',
            controller: 'videoCtrl',
            resolve: {
                videos: function(httpService){
                    return httpService.get('/media/videos');
                }
            }
        })
        .when('/contact', {
            templateUrl: 'partials/contact.html',
            controller: 'contactCtrl'
        })
        .when('/articles', {
            templateUrl: 'partials/articles.html',
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
    $scope.links = links.data;
    $scope.PDFs = PDFs.data;

    $scope.click = function(id, type)
    {
        if(type) // For links
            $window.open('http://' + $scope.links[id].link,'_blank');
        else // For PDF's
            $window.open($scope.PDFs[id].path, '_blank');
    }

});

app.controller('imageCtrl', function($scope, images){
    $scope.folders = {};
    for(var i = 0; i < images.data.length; i++)
    {
        var image = images.data[i];
        var flag = image.folder;
        var keys = [];
        for(var k in $scope.folders)
            keys.push(k);
        for(var j = 0; j < keys.length; j++)
        {
            if($scope.folders[j] == images.data[i].folder)
                flag = '';
        }
        // if(flag != '')
             $scope.folders[flag] = [];
console.log(image);
        $scope.folders[flag].push(image);
    }
    console.log($scope.folders);
});

app.controller('videoCtrl', function($scope, videos, $sce){
    //$scope.videos = videos.data;
    $scope.videos = [
    {path: "assets/video/video.mp4", title: "Tony Play"},
    {path: "assets/video/video2.mp4", title: "Tony Play"}
    ];
    $scope.path = "assets/video/video.mp4";
    $scope.title = "Tony Play";
});

app.controller('audioCtrl', function($scope, audio){
    $scope.audio = audio.data;
});

app.controller('uploadCtrl', function($scope, httpService){
    $scope.a = {};

    $scope.add = function()
    {
        var asset = { type: $scope.a.type };
        if(asset.type == 'link')
        {
            asset.title = $scope.a.title,
            asset.desc = $scope.a.desc,
            asset.link = $scope.a.link,
            asset.section = $scope.a.section
        }
        else if(asset.type == 'PDF')
        {
            asset.title = $scope.a.title,
            asset.desc = $scope.a.desc,
            asset.path = 'assets/PDF/' + $scope.a.name,
            asset.section = $scope.a.section
        }
        else
        {
            if(asset.type == 'audio')
                asset.path = 'assets/audio/' + $scope.a.name;
            else if(asset.type == 'video')
                asset.path = 'assets/video/' + $scope.a.name;
            else if(asset.type == 'image')
            {
                asset.folder = $scope.a.folder;
                asset.path = 'assets/image/' + asset.folder + '/' + $scope.a.name;
            }

            asset.title = $scope.a.title

        }

        $scope.a = {};
        addtoDB(asset);
    }

    function addtoDB(asset)
    {
        httpService.post('/uploads/assets', asset).success(function(){
            alert("Added");
        });
    }

    $scope.delete = function(id)
    {
        httpService.delete(id).success(function(){
            console.log("Asset Deleted");
        });
    }
});