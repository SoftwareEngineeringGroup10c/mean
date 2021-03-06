'use strict';

angular.module('events').controller('EventsListController', ['$scope', '$window', '$state', '$http', 'Authentication',
  function ($scope, $window, $state, $http, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    $scope.sortType = 'name';
    $scope.sortReverse = false;

    //Initialize some variables
    $scope.editEvent_flag = 0;

    $scope.activeTab = 'requests';

    /*
     Function to set the active tab
     */
    $scope.setActiveTab = function (value) {
      $scope.activeTab = value;
    };


    $scope.name = null;
    $scope.date = null;
    $scope.eTime = null;
    $scope.sTime = null;
    $scope.requireTax = null;
    $scope.banner = null;
    
    $http({
          method: 'POST',
          url: 'api/events/picture',
        }).then(function (res) {
          $scope.banner = res.banner;
          console.log('Successful banner');
        }, function (res) {
          console.log('Failed banner');
        });


    $scope.acceptEvent_flag = 0;

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

    //Sends a delete request to remove a passed in event from the DB
    $scope.deleteEvent = function (event) {
      if ($window.confirm('Are you sure you want to delete this event?')) {
        if (event.organizationsPending.length > 0) {
          //Create a notification when the event was already confirmed
          $http({
            method: 'POST',
            url: 'api/notifications',
            data: {
              data: $scope.authentication.user.displayName + ' has deleted an event on ' + event.dateOfEvent + ' that you requested.',
              userList: event.organizationsPending
            }
          }).then(function (res) {
            console.log('Successful notification');
          }, function (res) {
            console.log('Failed notification');
          });
        }

        //Create a notification when the event was already confirmed
        if (event.organizationConfirmed !== '') {
          $http({
            method: 'POST',
            url: 'api/notifications',
            data: {
              data: $scope.authentication.user.displayName + ' has deleted an event on ' + event.dateOfEvent + ' that you were confirmed for.',
              userList: event.organizationConfirmed
            }
          }).then(function (res) {
            console.log('Successful notification');
          }, function (res) {
            console.log('Failed notification');
          });
        }

        //Send the http request to delete the event
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

      //Create a notification when the event is requested
      $http({
        method: 'POST',
        url: 'api/notifications',
        data: {
          data: $scope.authentication.user.displayName + ' has requested an event on ' + event.dateOfEvent + ' that you created.',
          userList: event.hostOrg
        }
      }).then(function (res) {
        console.log('Successful notification');
      }, function (res) {
        console.log('Failed notification');
      });


      //Create the event via http request
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

    //returns the style of the button if it should be disabled
    $scope.getButtonStyle = function (event) {
      if (event.organizationConfirmed === '') {
        return '';
      } else {
        return 'disabled';
      }
    };

    //returns the style of the button if it should be disabled
    $scope.getButtonStyle_two = function (event) {
      if (event.organizationsPending.length !== 0) {
        return '';
      } else {
        return 'disabled';
      }
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
    $scope.acceptEvent = function (index, event) {
      console.log('here');
      var orgData;
      if (event.organizationsPending.length === 0) {
        return;
      }
      if (index === '') {
        orgData = '';
      } else {
        orgData = event.organizationsPending[index];
      }

      //Sets the confirmed organization when the event is approved
      $http({
        method: 'PUT',
        url: 'api/events/' + event._id,
        data: {
          organizationConfirmed: orgData
        }
      }).then(function (res) {
        console.log('Successful accept');
        console.log(index);
        $scope.loadEventList();
      }, function (res) {
        console.log('Failed accept');
        console.log(res);
      });

      //Send a notification to the accepted user
      $http({
        method: 'POST',
        url: 'api/notifications',
        data: {
          data: $scope.authentication.user.displayName + ' approved your request for an event on ' + event.dateOfEvent,
          userList: orgData
        }
      }).then(function (res) {
        console.log('Successful notification');
      }, function (res) {
        console.log('Failed notification');
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
      console.log(event.organizationsPending.splice(event.organizationsPending.indexOf($scope.authentication.user.displayName), 1));

      var newConfirmed = event.organizationConfirmed;

      if ($window.confirm('Are you sure you want to cancel this request?')) {

        console.log(event.organizationsPending.splice(event.organizationsPending.indexOf($scope.authentication.user.displayName), 1));

        if (newConfirmed === $scope.authentication.user.displayName) {
          newConfirmed = '';
        }

        //If the organization was confirmed, send a notification to the business
        if (event.organizationConfirmed === $scope.authentication.user.displayName) {
          $http({
            method: 'POST',
            url: 'api/notifications',
            data: {
              data: $scope.authentication.user.displayName + ' cancelled an event that was previously approved on ' + event.dateOfEvent,
              userList: event.hostOrg
            }
          }).then(function (res) {
            console.log('Successful notification');
          }, function (res) {
            console.log('Failed notification');
          });
        }

        //Update the event to reflect the updated request list
        $http({
          method: 'PUT',
          url: 'api/events/' + event._id,
          data: {
            organizationsPending: event.organizationsPending.splice(event.organizationsPending.indexOf($scope.authentication.user.displayName), 0),
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

    //Deleted the organization request without a confirmation alert
    $scope.deleteOrgRequestNoNote = function (event) {

      var newConfirmed = event.organizationConfirmed;

      if (newConfirmed === $scope.authentication.user.displayName) {
        newConfirmed = '';
      }

      //If the organization was confirmed, send a notification to the business
      if (event.organizationConfirmed === $scope.authentication.user.displayName) {
        console.log(event.user.displayName);
        $http({
          method: 'POST',
          url: 'api/notifications',
          data: {
            data: $scope.authentication.user.displayName + ' cancelled an event that was previously approved on ' + event.dateOfEvent,
            userList: event.hostOrg
          }
        }).then(function (res) {
          console.log('Successful notification');
        }, function (res) {
          console.log('Failed notification');
        });
      }

      var newPending = event.organizationsPending.splice(event.organizationsPending.indexOf($scope.authentication.user.displayName), 0);
      console.log($scope.authentication.user.displayName);
      console.log(newPending);

      //Update the event to reflect the updated request list
      $http({
        method: 'PUT',
        url: 'api/events/' + event._id,
        data: {
          organizationsPending: newPending,
          organizationConfirmed: newConfirmed
        }
      }).then(function (res) {
        console.log('Successful org event delete');
      }, function (res) {
        console.log('Failed org event delete');
        console.log(res);
      });
    };

    //Initially loading the events
    $scope.loadEventList();

    //Checks if the event was made by the user
    $scope.filterByUser = function (event) {
      console.log($scope.authentication.user);
      console.log(event.hostOrg);
      return event.hostOrg === $scope.authentication.user.displayName;
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

    // Returns true if the user signed in is the same one who has the event accepted
    $scope.filterAcceptedEvents = function (event) {
      return event.organizationConfirmed === $scope.authentication.user.displayName;
    };

    //Allows a business to create an event
    $scope.createEvent = function () {
      console.log($scope.name);
      //console.log($scope.date);
      //console.log($scope.sTime);
      
        //Add the picture
        $http({
          method: 'POST',
          url: 'api/events/picture',
        }).then(function (res) {
          $scope.banner = res.banner;
          console.log('Successful banner');
        }, function (res) {
          console.log('Failed banner');
        });



      //Create the event object in the database
      $http({
        method: 'POST',
        url: '/api/events',
        data: {
          name: $scope.name,
          dateOfEvent: $scope.date,
          startTime: $scope.sTime,
          endTime: $scope.eTime,
          location: $scope.location,
          taxIdRequired: $scope.requireTax,
          hostOrg: $scope.authentication.user.displayName,
          banner: $scope.banner
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
      console.log($scope.globalEvent);
    };

    //Obsolete
    $scope.refreshHandler = function () {
      console.log('refresh');
      if ($scope.authentication.user.roles.indexOf('Organization') >= 0) {
        $state.go('home.orgDash.eventList');
      }
    };

  }
]);
