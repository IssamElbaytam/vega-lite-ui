'use strict';

describe('Directive: dropzoneDataset', function () {

  // load the directive's module
  beforeEach(module('vlui'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should show correct form', inject(function ($compile) {
    element = angular.element('<dropzone-dataset></dropzone-dataset>');
    element = $compile(element)(scope);

    scope.$digest();
    expect(element.find('textarea').length).to.eql(1);
    // expect(element.find('#dataset-name').length).to.eql(1);
  }));
});
