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

// Directive which performs the typing animation
app.directive('typed', ['$parse', function($parse){
    return {
        restrict: 'A',
        scope: {},
        link: function(scope, element, attrs){
            element.typed({
                strings: ["TONY LELIW"],
                typeSpeed: 250,
                startDelay: 100
            });
            setTimeout(function(){
                $('.typed-cursor').css('visibility', 'hidden');     
            }, 5000);
        }
    };
}]);

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

app.controller('articlesCtrl',  function($scope, $location, $window, links, PDFs, httpService){
    $scope.section = "!!", $scope.sort = "-visits";
    $scope.pdf = true, $scope.link = true;
    $scope.links = links.data, $scope.PDFs = PDFs.data;

    $scope.click = function(id, index, type)
    {
        // Adds a visit, through a click of an article
        httpService.put('/articles/' + id + '/visit', {});

        // Puts the user through to the chosen asset
        if(type == 'links')
            $window.open('/articles/link/' + $scope[type][index].name);
        else
            $window.open($scope[type][index].path);
    }
});

app.controller('imageCtrl', function($scope, images){
    $scope.folders = {}, $scope.loaded = false;
    for(var i = 0; i < images.data.length; i++)
    {
        var image = images.data[i], folder = image.folder, flag = true, keys = [];

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
        $location.path('/media/videos').search({v: id});
        $scope.sIndex = id;
    }
});

app.controller('audioCtrl', function($scope, audio){
    $scope.audio = audio.data;
});

app.controller('uploadCtrl', function($scope, httpService){
    $scope.e = {}, $scope.editTab = false, $scope.folders = [];
    function getAssets()
    {
        httpService.get('/info').success(function(assets){
            $scope.assets = assets;
        });
    }
    getAssets();

    function getFolders()
    {
        httpService.get('/info/image/folders').success(function(data){
            $scope.folders = data;
        });
    }
    getFolders();

    $scope.addFolder = function()
    {
        httpService.post('/info/image/folders/add', { name: $scope.folName }).success(function(){
            getFolders();
        });
    }

    $scope.delete = function(id)
    {
        if(confirm("Are you sure you want to delete this?"))
            httpService.delete('/info/' + id).success(function(){
                getAssets();
            });
    }

    $scope.edit = function(id)
    {
        httpService.get('/info/' + id).success(function(data){
            $scope.e = {
                title: data.title,
                desc: data.desc,
                section: data.section,
                folder: data.folder,
                path: data.path,
                name: data.name,
                id: id
            };
        });
        $scope.editTab = true;
    }

    $scope.makeChange = function(id)
    {
        httpService.put('/info/' + id, $scope.e).success(function(){
            getAssets();
        });
        $scope.e = {}, $scope.editTab = false;
    }
});