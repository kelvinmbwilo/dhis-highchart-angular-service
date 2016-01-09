'use strict';

describe('', function() {

  var module;
  var dependencies;
  dependencies = [];

  var hasModule = function(module) {
  return dependencies.indexOf(module) >= 0;
  };

  beforeEach(function() {

  // Get module
  module = angular.module('dhisHighchartAngularService');
  dependencies = module.requires;
  });

  it('should load config module', function() {
    expect(hasModule('dhisHighchartAngularService.config')).to.be.ok;
  });

  
  it('should load filters module', function() {
    expect(hasModule('dhisHighchartAngularService.filters')).to.be.ok;
  });
  

  
  it('should load directives module', function() {
    expect(hasModule('dhisHighchartAngularService.directives')).to.be.ok;
  });
  

  
  it('should load services module', function() {
    expect(hasModule('dhisHighchartAngularService.services')).to.be.ok;
  });
  

});