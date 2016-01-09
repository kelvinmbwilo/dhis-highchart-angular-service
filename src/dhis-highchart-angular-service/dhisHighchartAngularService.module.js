(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('dhisHighchartAngularService.config', [])
      .value('dhisHighchartAngularService.config', {
          debug: true
      });

  // Modules
  angular.module('dhisHighchartAngularService.directives', []);
  angular.module('dhisHighchartAngularService.filters', []);
  angular.module('dhisHighchartAngularService.services', ['chartServices']);
  angular.module('dhisHighchartAngularService',
      [
          'dhisHighchartAngularService.config',
          'dhisHighchartAngularService.directives',
          'dhisHighchartAngularService.filters',
          'dhisHighchartAngularService.services',
          'ngResource',
          'ngCookies',
          'ngSanitize'
      ]);

})(angular);
