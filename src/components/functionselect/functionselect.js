'use strict';

angular.module('vlui')
  .directive('functionSelect', function(_, consts, vl, Pills, Logger, Schema) {
    return {
      templateUrl: 'components/functionselect/functionselect.html',
      restrict: 'E',
      scope: {
        channelId: '=',
        fieldDef: '='
      },
      link: function(scope /*,element, attrs*/) {
        var BIN='bin', COUNT='count', maxbins;

        scope.func = {
          selected: undefined,
          list: [undefined]
        };

        function getFns(type) {
          if (type === 'temporal') {
            return Schema.schema.definitions.TimeUnit.enum;
          }
          return [];
        }

        function getAggrs(type) {
          if(!type) {
            return [COUNT];
          }

          // HACK
          // TODO: make this correct for temporal as well
          if (type === 'quantitative' ){
            return Schema.schema.definitions.AggregateOp.enum;
          }
          return [];
        }

        scope.selectChanged = function() {
          Logger.logInteraction(Logger.actions.FUNC_CHANGE, scope.func.selected);
        };

        // FIXME func.selected logic should be all moved to selectChanged
        // when the function select is updated, propagates change the parent
        scope.$watch('func.selected', function(selectedFunc) {
          var oldPill = Pills.get(scope.channelId),
            pill = _.clone(oldPill),
            type = pill ? pill.type : '';

          if(!pill){
            return; // not ready
          }

          // reset field def
          // HACK: we're temporarily storing the maxbins in the pill
          pill.bin = selectedFunc === BIN ? true : undefined;
          pill.aggregate = getAggrs(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          pill.timeUnit = getFns(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;

          if(!_.isEqual(oldPill, pill)){
            Pills.set(scope.channelId, pill, true /* propagate change */);
          }
        });

        // when parent objects modify the field
        scope.$watch('fieldDef', function(pill) {
          if (!pill) {
            return;
          }

          var type = pill.field ? pill.type : '';

          // hack: save the maxbins
          if (pill.bin) {
            maxbins = pill.bin.maxbins;
          }

          var isOrdinalShelf = ['row','column','shape'].indexOf(scope.channelId) !== -1,
            isQ = type === vl.type.QUANTITATIVE,
            isT = type === vl.type.TEMPORAL;

          if(pill.field === '*' && pill.aggregate === COUNT){
            scope.func.list=[COUNT];
            scope.func.selected = COUNT;
          } else {
            scope.func.list = ( isOrdinalShelf && (isQ || isT) ? [] : [undefined])
              .concat(getFns(type))
              .concat(getAggrs(type).filter(function(x) { return x !== COUNT; }))
              // TODO: check supported type based on primitive data?
              .concat(type === 'quantitative' ? ['bin'] : []);

            var defaultVal = (isOrdinalShelf &&
              (isQ && BIN) || (isT && consts.defaultTimeFn)
            ) || undefined;

            var selected = pill.bin ? 'bin' :
              pill.aggregate || pill.timeUnit;

            if (scope.func.list.indexOf(selected) >= 0) {
              scope.func.selected = selected;
            } else {
              scope.func.selected = defaultVal;
            }

          }
        }, true);
      }
    };
  });
