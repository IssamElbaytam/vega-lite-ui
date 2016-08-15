'use strict';

/**
 * @ngdoc directive
 * @name vlui.directive:bookmarkList
 * @description
 * # bookmarkList
 */
angular.module('vlui')
  .directive('bookmarkList', function (Bookmarks, consts) {
    return {
      templateUrl: 'components/bookmarklist/bookmarklist.html',
      restrict: 'E',
      replace: true,
      scope: {
        highlighted: '='
      },
      link: function postLink(scope /*, element, attrs*/) {
        scope.Bookmarks = Bookmarks;
        scope.consts = consts;
      }
    };
  });
