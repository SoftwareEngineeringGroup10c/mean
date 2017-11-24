'use strict';

angular.module('events').controller('EventsListController', ['$scope', '$window', '$state', '$http', 'Authentication',
  function ($scope, $window, $state, $http, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    $scope.sortType = 'name';
    $scope.sortReverse = false;

    //Initialize some variables
    $scope.editEvent_flag = 0;


    $scope.name = null;
    $scope.date = null;
    $scope.eTime = null;
    $scope.sTime = null;
    $scope.requireTax = null;

    $scope.acceptEvent_flag = 0;

    $scope.eventList = [
      {
        bizName: 'Blaze',
        date: '10/17/17',
        status: 'Pending'
      }, {
        bizName: 'Taco Bell',
        date: '11/12/23',
        status: 'Confirmed'
      }, {
        bizName: 'Blaze',
        date: '10/17/17',
        status: 'Pending'
      }, {
        bizName: 'Taco Bell',
        date: '11/12/23',
        status: 'Confirmed'
      }];


    //Sends a delete request to remove a passed in event from the DB
    $scope.deleteEvent = function (event) {
      if ($window.confirm('Are you sure you want to delete this event?')) {

        $http({
          method: 'DELETE',
          url: 'api/events/' + event._id
        }).then(function (res) {
          console.log('Successful delete');
        }, function (res) {
          console.log('Failed delete');
        });
      }

      $scope.loadEventList();
    };

    //Adds the organization name to the organizationsPending list
    $scope.requestEvent = function (event) {
      if (event.organizationsPending.indexOf($scope.authentication.user.displayName) === -1) {
        event.organizationsPending.push($scope.authentication.user.displayName);
      } else {
        return;
      }
      $http({
        method: 'PUT',
        url: 'api/events/' + event._id,
        data: {
          organizationsPending: event.organizationsPending
        }
      }).then(function (res) {
        console.log('Successful request');
      }, function (res) {
        console.log('Failed request');
        console.log(res);
      });
    };

    //Determines whether or not the current user is confirmed for an event
    $scope.generateStatus = function (event) {
      if (event.organizationConfirmed === $scope.authentication.user.displayName) {
        return 'Accepted';
      } else {
        return 'Pending';
      }
    };

    //Allows a business to change the confirmed org based on it's index in the organizationsPending array
    $scope.acceptEvent = function (index) {
      if ($scope.globalEvent.organizationsPending.length === 0) {
        return;
      }
      $http({
        method: 'PUT',
        url: 'api/events/' + $scope.globalEvent._id,
        data: {
          organizationConfirmed: $scope.globalEvent.organizationsPending[index]
        }
      }).then(function (res) {
        console.log('Successful accept');
        console.log(index);
        console.log($scope.globalEvent);
        console.log($scope.globalEvent.organizationsPending[index]);
      }, function (res) {
        console.log('Failed accept');
        console.log(res);
      });
    };

    //Returns true if the organization's name is not on the organizationsPending array
    $scope.displayOrgNonRequest = function (event) {
      console.log($scope.eventList);
      console.log(event.organizationsPending === []);
      if (event.organizationsPending === []) {
        return true;
      }
      return event.organizationsPending.indexOf($scope.authentication.user.displayName) === -1;
    };

    //Allows an organizations to delete their name from the event that is passed in
    $scope.deleteOrgRequest = function (event) {
      var newConfirmed = event.organizationConfirmed;

      if ($window.confirm('Are you sure you want to cancel this request?')) {

        console.log(event.organizationsPending.splice(event.organizationsPending.indexOf($scope.authentication.user.displayName), 1));

        if (newConfirmed === $scope.authentication.user.displayName) {
          newConfirmed = '';
        }

        $http({
          method: 'PUT',
          url: 'api/events/' + event._id,
          data: {
            organizationsPending: event.organizationsPending.splice(event.organizationsPending.indexOf($scope.authentication.user.displayName), 1),
            organizationConfirmed: newConfirmed
          }
        }).then(function (res) {
          console.log('Successful org event delete');
        }, function (res) {
          console.log('Failed org event delete');
          console.log(res);
        });
      }
    };

    //Loads the events database list into the eventList scope variable
    $scope.loadEventList = function () {
      $http({
        method: 'GET',
        url: '/api/events'
      }).then(function (res) {
        console.log('Successful');
        console.log(res);
        $scope.eventList = res.data;
      }, function (res) {
        console.log('Failed');
        console.log(res);
      });
    };

    //Initially loading the events
    $scope.loadEventList();

    //Checks if the event was made by the user
    $scope.filterByUser = function (event) {
      return event.user.displayName === $scope.authentication.user.displayName;
    };

    //Checks if the user's name is in the organizationsPending list of an event
    $scope.filterOrgEvents = function (event) {
      return event.organizationsPending.indexOf($scope.authentication.user.displayName) !== -1;
    };

    // Checks if the date of the event has already passed or not
    $scope.filterEventsDate = function (event) {
      var dte = new Date();
      console.log('Event Date: ' + event.dateOfEvent);
      console.log('Current Date: ' + dte.toISOString());
      return dte.toISOString() > event.dateOfEvent;
    };

    //Allows a business to create an event
    $scope.createEvent = function () {
      console.log($scope.name);
      //console.log($scope.date);
      //console.log($scope.sTime);

      $http({
        method: 'POST',
        url: '/api/events',
        data: {
          name: $scope.name,
          dateOfEvent: $scope.date,
          startTime: $scope.sTime,
          endTime: $scope.eTime,
          location: $scope.location,
          taxIdRequired: $scope.requireTax
        }
      }).then(function (res) {
        console.log('Successful event');
      }, function (res) {
        console.log('Failed event');
        console.log(res);
        console.log(name);
        //console.log(date);
        //console.log(sTime);
      });

      /*$scope.name = null;
       $scope.date = null;
       $scope.sTime = null;
       $scope.eTime = null;
       $scope.location = null;
       $scope.requireTax = null;*/
    };

    //Toggles the acceptEvent flag
    $scope.toggleAcceptFlag = function () {
      $scope.acceptEvent_flag = !$scope.acceptEvent_flag;
      console.log('toggled accept flag');
    };

    //Sets some global event variable to a variable
    $scope.setGlobalEvent = function (event) {
      console.log('setting event');
      $scope.globalEvent = event;
    };

    $scope.refreshHandler = function () {
      console.log('refresh');
      if ($scope.authentication.user.roles.indexOf('Organization') >= 0) {
        $state.go('home.orgDash.eventList');
      }
    };

  }
]);

