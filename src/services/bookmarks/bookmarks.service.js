'use strict';

/**
 * @ngdoc service
 * @name vlui.Bookmarks
 * @description
 * # Bookmarks
 * Service in the vlui.
 */
angular.module('vlui')
  .service('Bookmarks', function(_, vl, localStorageService, Logger, Dataset) {
    var Bookmarks = function() {
      this.dict = [];
      this.length = 0;
      this.isSupported = localStorageService.isSupported;

      this.clearDeprecatedBookmarks();
    };

    var proto = Bookmarks.prototype;

    proto.updateLength = function() {
      this.length = this.dict.length;
    };

    proto.save = function() {
      localStorageService.set('bookmarks', this.dict);
    };

    proto.load = function() {
      this.dict = localStorageService.get('bookmarks') || [];
      this.updateLength();
    };

    /**
     * Clear deprecated bookmarks in localStorage. 
     * We switched from this.dict = {} to this.dict = [],
     * this.dict = {} may be still in localStorage and cause problems on this.load() 
     * This function is mostly beneficial to developers working on this repo.
     */
    proto.clearDeprecatedBookmarks = function() {
      if ( localStorageService.keys().includes('bookmarks') &&
        localStorageService.get('bookmarks').constructor !== Array ) {
          localStorageService.remove('bookmarks'); // remove deprecated bookmarks where this.dict === {}
          this.save(); // save new bookmarks where this.dict === []
      }
    }
    
    proto.clear = function() {
      this.dict.splice(0, this.dict.length);
      this.updateLength();
      this.save();

      Logger.logInteraction(Logger.actions.BOOKMARK_CLEAR);
    };

    proto.toggle = function(chart) {

      var shorthand = chart.shorthand;

      if (this.isBookmarked(shorthand)) {
        this.remove(chart);
      } else {
        this.add(chart);
      }
    };

    proto.add = function(chart) {
      var shorthand = chart.shorthand;

      console.log('adding', chart.vlSpec, shorthand);

      chart.timeAdded = (new Date().getTime());

      chart.stats = Dataset.stats;

      this.dict.push({shorthand: shorthand, chart: _.cloneDeep(chart)});

      this.updateLength();
      this.save();

      Logger.logInteraction(Logger.actions.BOOKMARK_ADD, shorthand);
    };

    proto.remove = function(chart) {
      var shorthand = chart.shorthand;

      console.log('removing', chart.vlSpec, shorthand);

      var index = this.dict.findIndex(function(bookmark) { return bookmark.shorthand === shorthand; });
      if (index >= 0) {
        this.dict.splice(index, 1);
      }
      this.updateLength();
      this.save();

      Logger.logInteraction(Logger.actions.BOOKMARK_REMOVE, shorthand);
    };

    proto.isBookmarked = function(shorthand) {
      return this.dict.some(function(bookmark) { return bookmark.shorthand === shorthand; });
    };

    return new Bookmarks();
  });
