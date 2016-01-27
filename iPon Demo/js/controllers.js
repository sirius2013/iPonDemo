angular.module('iPonDemo.controllers', ['ionic', 'ionic.rating', 'ngCordova'])
.constant('baseURL','http://crm.welcomepickups.com/drivers-app/api/v1/')
.constant('api','/some/api/info')
.service('urls',
	function(domain, api) { 
		this.apiUrl = domain+api;
	}
)
.service('sharedProperties', function () {
        var property = {};
        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            }
        };
})
.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                            scope.$eval(attrs.ngEnter);
                    });
                    
                    event.preventDefault();
                }
            });
        };
})

.controller('ConnectCtrl', function($scope, $rootScope, FriendService, $http, $timeout, $ionicLoading,  $interval, $state,  $ionicPopup, $ionicActionSheet, sharedProperties) {	
        
    $scope.bFound = false;
    $scope.device_id = "";
    
    $scope.init = function() {

        $scope.status = {};
        $scope.status.bConnecting = true;
        $scope.status.bConnect = false;    
        $scope.status.bConnected = false;
        
        $scope.status.use_time = "4 Hours 37 Minutes";
        $scope.status.connectedClass = "blue";
        $scope.status.connectedSmallText = "It's time to";
        $scope.status.connectedBigText = "Change";
        
        sharedProperties.setProperty($scope.status);

        $scope.Batt_URL = "img/Batt_0.png";
    };

    
	$scope.scanBLE = function () {
        $scope.bFound = false;
         ble.isEnabled(
            function () {
                //alert("Bluetooth is enabled");
                /*ble.scan([], 15, function(device) {
                    alert(JSON.stringify(device));
                }, function (reason) {
                   alert("BLE Scan failed " + reason);
                });*/
                var scanSeconds = 30;
                alert("Scanning for BLE peripherals for " + scanSeconds + " seconds.");
                ble.scan([], 10, function(device) {
                    console.log("---start Scan----");                    
                    if($scope.bFound == true)
                        return ;
                    
                    console.log(JSON.stringify(device));
                    $scope.bConnect = true;
                    $scope.bFound = true;
                    //alert(JSON.stringify(device));
                    //console.log(device);
                    //console.log(device.id);
                    //console.log(device.name);
                    $scope.device_id = device.id;
                    
                   ble.connect($scope.device_id, connectSuccess, connectFailure);
                   setTimeout(ble.stopScan,
                        1 * 1000,
                        function () {
                            console.log("Scan complete");
                        },
                        function () {
                            console.log("stopScan failed");
                        }
                   );
                    
                }, function (reason) {
                   alert("BLE Scan failed " + reason);
                });
                                
                /*setTimeout(ble.stopScan,
                    scanSeconds * 1000,
                    function () {
                        console.log("Scan complete");
                    },
                    function () {
                        console.log("stopScan failed");
                    }
                );*/
                
            },
            function () {
                alert("Bluetooth is *not* enabled, Please enable Bluetooth");
            }
        );        
    };
    
    var connectSuccess = function(deviceInfo) {
        alert("connectSuccess ");
        alert(JSON.stringify(deviceInfo));
        console.log(JSON.stringify(deviceInfo));
        
        service_uuid = "50000000-dead-beef-cafe-000000000000";
        characteristic_uuid = "50000001-dead-beef-cafe-000000000000";
        //service_uuid = "1800";
        //characteristic_uuid = "2a00";
        //service_uuid = "fff0";
        //characteristic_uuid = "fff8";
        
        setInterval(function(){ 
            ble.read($scope.device_id, service_uuid, characteristic_uuid, readSuccess, readFailure);
          }, 
        3000);
                
        //service_uuid = "f000ffc0-0451-4000-b000-000000000000";
        //characteristic_uuid = "f000ffc2-0451-4000-b000-000000000000";
        
        ble.startNotification($scope.device_id, service_uuid, characteristic_uuid, notifySuccess, notifyFailure);
    };
    
    var readSuccess = function(arrData) {
        console.log("read data = " + JSON.stringify(arrData));
        alert("readSuccess ");
        /*var array = new Uint8Array(arrData.length);
       for (var i = 0, l = string.length; i < l; i++) {
           array[i] = string.charCodeAt(i);
           console.log(array[i]);
        }*/
        //console.log(ab2str(arrData));
        var data = new Uint8Array(arrData);        
        alert("Button state changed to " + data[0]);
    };
    
    var readFailure = function() {
        alert("readFailure");    
    };
    
    var notifySuccess = function(arrData) {
        alert("notifySuccess");        
        console.log("notify data = " + JSON.stringify(arrData));
        // Decode the ArrayBuffer into a typed Array based on the data you expect
        var data = new Uint8Array(arrData);
        //alert("Button state changed to " + data[0]);
    };
    
    var notifyFailure = function() {
        alert("notifyFailure");    
    };


    var connectFailure = function(err) {
        console.log(err);
        alert("connectFailure ");        
    };
    
    $scope.tryConnecting = function() {
        $scope.status.bConnecting = false;
        $scope.status.bConnect = true;
        $scope.status.bConnected = false;
    };
    
    $scope.tryConnect = function() {
       $scope.status.bConnect = false;
        $scope.status.bConnected = true;
        $scope.status.bConnecting = false;
        
        $scope.scanBLE();
    };
    
    $scope.tryConnected = function() {
        $scope.status.bConnect = true;
        $scope.status.bConnected = false;
        $scope.status.bConnecting = false;       
        
    };    
      
   /*$rootScope.$watch('connectedClass', function(newValue, oldValue) {
          //update the DOM with newValue
        console.log(newValue);
       $scope.status.connectedClass = newValue;
        //$scope.$digest();
    });
    
    $rootScope.$watch('bConnected', function(newValue, oldValue) {
          //update the DOM with newValue
        console.log("bConnected = " + newValue);
        $scope.status.bConnected = newValue;
    });
    
    $rootScope.$watch('bConnect', function(newValue, oldValue) {
          //update the DOM with newValue
        console.log("bConnect = " + newValue);
        $scope.status.bConnect = newValue;
    });
    
    $rootScope.$watch('bConnecting', function(newValue, oldValue) {
          //update the DOM with newValue
        console.log("bConnecting = " + newValue);
        $scope.status.bConnecting = newValue;
    });*/    

    $scope.$on('$ionicView.enter', function (viewInfo, state) {
        $scope.status = sharedProperties.getProperty();
    });
    
    
    $scope.goConnect = function () {
		$state.go('connect');
    };
    
    $scope.goSetting = function () {
		$state.go('settings');
    };

    $scope.goAlert = function () {
    	$state.go('alerts');
    };
    
    $scope.goCalendar = function () {
    	$state.go('calendar');
    };
    
    $scope.goBuy = function () {
    	$state.go('buy');
    };
    
    $scope.goHelp = function () {
    	$state.go('help');
    };
    
    $scope.init();
})


.controller('SettingCtrl', function($scope, $rootScope, FriendService, $timeout, $ionicLoading,  $interval, $state, $ionicScrollDelegate, $ionicTabsDelegate, sharedProperties) {
    
    $scope.$on('$ionicView.enter', function (viewInfo, state) {
        $ionicTabsDelegate.select(-1);
    });
    
    $scope.goConnect = function () {
		$state.go('connect');
    };
    
    $scope.goSetting = function () {
		$state.go('settings');
    };

    $scope.goAlert = function () {
    	$state.go('alerts');
    };
    
    $scope.goCalendar = function () {
    	$state.go('calendar');
    };
    
    $scope.goBuy = function () {
    	$state.go('buy');
    };
    
    $scope.goHelp = function () {
    	$state.go('help');
    };
    
     $scope.selectProduct = function(idx) {
         if(idx === 1) {
           //alert("Tampon");
           $rootScope.connectedClass = "blue";
           $rootScope.connectedSmallText = "It's time to";
           $rootScope.connectedBigText = "Change";
             
           var property = {};
           property = {};
           property.bConnect = false;
           property.bConnected = true;
           property.bConnecting = false;
           property.use_time = "4 Hours 37 Minutes";
           property.connectedClass = "blue";
           property.connectedSmallText = "It's time to";
           property.connectedBigText = "Change";
           
           sharedProperties.setProperty(property);
             
           $scope.goConnect();
                      
         } else {
           //alert("Pantiliner");
           $rootScope.connectedClass = "light-blue";
           $rootScope.connectedSmallText = "You're doing";
           $rootScope.connectedBigText = "Great";
             
           var property = {};
           property = {};
           property.bConnect = false;
           property.bConnected = true;
           property.bConnecting = false;
           property.use_time = "2 Hours 23 Minutes";
           property.connectedClass = "light-blue";
           property.connectedSmallText = "You're doing";
           property.connectedBigText = "Great";
           
           sharedProperties.setProperty(property);
             
           $scope.goConnect();
             
         }
    };    
})

.controller('AlertCtrl', function($scope, $rootScope, FriendService, $timeout, $ionicLoading,  $interval, $state, $ionicScrollDelegate, $ionicTabsDelegate, sharedProperties) {
    
    $scope.$on('$ionicView.enter', function (viewInfo, state) {
        $ionicTabsDelegate.select(1);
    });
    
    $scope.goConnect = function () {
		$state.go('connect');
    };
    
    $scope.goSetting = function () {
		$state.go('settings');
    };

    $scope.goAlert = function () {
    	$state.go('alerts');
    };
    
    $scope.goCalendar = function () {
    	$state.go('calendar');
    };
    
    $scope.goBuy = function () {
    	$state.go('buy');
    };
    
    $scope.goHelp = function () {
    	$state.go('help');
    };
})

.controller('CalendarCtrl', function($scope, $rootScope, FriendService, $timeout, $ionicLoading,  $interval, $state, $ionicScrollDelegate, $ionicTabsDelegate, sharedProperties) {
    
    $scope.$on('$ionicView.enter', function (viewInfo, state) {
        $ionicTabsDelegate.select(2);
    });
    
    $scope.goConnect = function () {
		$state.go('connect');
    };
    
    $scope.goSetting = function () {
		$state.go('settings');
    };

    $scope.goAlert = function () {
    	$state.go('alerts');
    };
    
    $scope.goCalendar = function () {
    	$state.go('calendar');
    };
    
    $scope.goBuy = function () {
    	$state.go('buy');
    };
    
    $scope.goHelp = function () {
    	$state.go('help');
    };
})

.controller('BuyCtrl', function($scope, $rootScope, FriendService, $timeout, $ionicLoading,  $interval, $state, $ionicScrollDelegate, $compile, $ionicTabsDelegate, sharedProperties) {

    $scope.$on('$ionicView.enter', function (viewInfo, state) {
        $ionicTabsDelegate.select(3);
    });
    
    $scope.goConnect = function () {
		$state.go('connect');
    };
    
    $scope.goSetting = function () {
		$state.go('settings');
    };

    $scope.goAlert = function () {
    	$state.go('alerts');
    };
    
    $scope.goCalendar = function () {
    	$state.go('calendar');
    };
    
    $scope.goBuy = function () {
    	$state.go('buy');
    };
    
    $scope.goHelp = function () {
    	$state.go('help');
    };
    

    /*function initialize() {
        var myLatlng = new google.maps.LatLng(43.07493,-89.381388);
        
        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map-area"),
            mapOptions);
        
        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'Uluru (Ayers Rock)'
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        $scope.map = map;
      }
      google.maps.event.addDomListener(window, 'load', initialize);
      
      $scope.centerOnMe = function() {
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
      };
      
      $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
      };*/
})

.controller('HelpCtrl', function($scope, $rootScope, FriendService, $timeout, $ionicLoading,  $interval, $state, $ionicScrollDelegate, $ionicTabsDelegate, sharedProperties) {

    $scope.$on('$ionicView.enter', function (viewInfo, state) {
        $ionicTabsDelegate.select(3);
    });
    
    $scope.goConnect = function () {
		$state.go('connect');
    };
    
    $scope.goSetting = function () {
		$state.go('settings');
    };

    $scope.goAlert = function () {
    	$state.go('alerts');
    };
    
    $scope.goCalendar = function () {
    	$state.go('calendar');
    };
    
    $scope.goBuy = function () {
    	$state.go('buy');
    };
    
    $scope.goHelp = function () {
    	$state.go('help');
    };
});


function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}