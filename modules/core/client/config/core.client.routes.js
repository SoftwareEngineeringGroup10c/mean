'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/core/client/views/home.client.view.html'
      })
      .state('about', {
        url: '/about',
        templateUrl: 'modules/core/client/views/about.client.view.html'
      })
      .state('faq', {
        url: '/faq',
        templateUrl: 'modules/core/client/views/faq.client.view.html'
      })
      .state('orgDash', {
        url: '/orgDashboard',
        templateUrl: 'modules/core/client/views/orgDash.client.view.html',
        data: {
          roles: ['Organization']
        }
      })
      .state('orgDash.eventList', {
        url: '/eventList',
        templateUrl: 'modules/core/client/views/orgDash.eventList.client.view.html'
      })
      .state('orgDash.calendar', {
        url: '/calendar',
        templateUrl: 'modules/core/client/views/orgDash.calendar.client.view.html'
      })
      .state('orgDash.notifications', {
      url: '/notifications',
      templateUrl: 'modules/core/client/views/orgDash.notifications.client.view.html'
      })
      .state('orgDash.pastEvents', {
        url: '/pastEvents',
        templateUrl: 'modules/core/client/views/orgDash.pastEvents.client.view.html'
      })
      .state('requestEvent', {
        url: '/requestEvent',
        templateUrl: 'modules/core/client/views/orgDash.requestEvent.client.view.html'
      })
      .state('bizDash', {
        url: '/bizDashboard',
        templateUrl: 'modules/core/client/views/bizDash.client.view.html',
        data: {
          roles: ['Business']
        }
      })
      .state('bizDash.eventList', {
        url: '/eventList',
        templateUrl: 'modules/core/client/views/bizDash.eventList.client.view.html'
      })
      .state('bizDash.calendar', {
        url: '/calendar',
        templateUrl: 'modules/core/client/views/bizDash.calendar.client.view.html'
      })
      .state('bizDash.notifications', {
      url: '/notifications',
      templateUrl: 'modules/core/client/views/bizDash.notifications.client.view.html'
      })
      .state('bizDash.pastEvents', {
        url: '/pastEvents',
        templateUrl: 'modules/core/client/views/bizDash.pastEvents.client.view.html'
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/404.client.view.html',
        data: {
          ignoreState: true
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/400.client.view.html',
        data: {
          ignoreState: true
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true
        }
      });
  }
]);
