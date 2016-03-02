var app = angular.module('portfolio', ['ngRoute', 'ngAnimate']);

app.config(function($routeProvider){
    $routeProvider
        .when('/home', {
            templateUrl: 'partials/home.html'
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
    $scope.folders = {}, $scope.loaded = false;
    for(var i = 0; i < images.data.length; i++)
    {
        var image = images.data[i], folder = image.folder;
        var flag = true, keys = [];

        for(var k in $scope.folders)
            keys.push(k);

        for(var j = 0; j < keys.length; j++)
            if(keys[j] == folder)
                flag = false;

        if(flag)
             $scope.folders[folder] = [];

        $scope.folders[folder].push(image);
    }

    $scope.selectFolder = function(key)
    {
        $scope.sFolder = $scope.folders[key], $scope.sIndex = 0, $scope.loaded = true;
    }

    $scope.nextSlide = function()
    {
        $scope.sIndex = ($scope.sIndex < $scope.sFolder.length -1) ? ++$scope.sIndex : 0;
    }

    $scope.prevSlide = function()
    {
        $scope.sIndex = ($scope.sIndex > 0) ? --$scope.sIndex : $scope.sFolder.length - 1;
    }

    $scope.goToSelection = function()
    {
        $scope.sFolder = [], $scope.loaded = false, $scope.sIndex = 0;
    }
});

app.controller('videoCtrl', function($scope, videos, $location){
    $scope.videos = videos.data;
    $scope.sIndex = -1;

    if($location.search().v != null)
        $scope.sIndex = $location.search().v;

    $scope.selectVideo = function(id)
    {
        $scope.sIndex = id;
    }
});

app.controller('audioCtrl', function($scope, audio){
    $scope.audio = audio.data;
});

app.controller('uploadCtrl', function($scope, httpService){
    $scope.a = {}, $scope.e = {}, $scope.editTab = false;
    function getAssets()
    {
        httpService.get('/info').success(function(assets){
            $scope.assets = assets;
        });
    }
    getAssets();

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
            {
                asset.desc = $scope.a.desc;
                asset.path = 'assets/video/' + $scope.a.name;
            }
            else if(asset.type == 'image')
            {
                asset.folder = $scope.a.folder;
                asset.path = 'assets/image/' + asset.folder + '/' + $scope.a.name;
            }
            asset.title = $scope.a.title
        }

        $scope.a = {};
        httpService.post('/info/', asset).success(function(){
            alert("Added");
        });
        getAssets();
    }

    $scope.delete = function(id)
    {
        if(confirm("Are you sure you want to delete this?"))
            httpService.delete('info/' + id).success(function(){
                getAssets();
            });
    }

    $scope.edit = function(id)
    {
        httpService.get('/info/' + id, function(data){
            $scope.e.title = data.title;
            $scope.e.desc = data.desc;
            $scope.e.section = data.section;
            $scope.e.link = data.link;
            $scope.e.name = data.name;
            $scope.e.folder = data.folder;
        });
        $scope.editTab = true;
    }

    $scope.makeChange = function(id)
    {
        var updatedInfo = {}, keys = [];
        for(var k in $scope.e)
            if($scope.e !== '')
                updatedInfo[k] = $scope.e[k];

        httpService.put('/info/' + id, updatedInfo, function(){
            getAssets();
        });

        $scope.editTab = false;
    }
});