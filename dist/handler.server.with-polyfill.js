require('../node_modules/gulp-babel/node_modules/babel-core/polyfill.js');

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = new WeakMap();

var Handler = (function () {
  function Handler(config) {
    _classCallCheck(this, Handler);

    var props = {
      'event': config.event,
      'name': 'component',
      'reporting': config.reporting
    };

    _.set(this, props);

    this.init();
  }

  _createClass(Handler, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var _$get = _.get(this);

      var event = _$get.event;
      var name = _$get.name;
      var reporting = _$get.reporting;

      if (reporting.level > 1) {
        reporting.reporter('-- Response handler registered: ' + name);
      }

      event.publish('response.handler.register', {
        'name': name
      });

      event.subscribe('request.received', function (data) {
        if (reporting.level > 1) {
          reporting.reporter('-- Find component route');
        }

        event.publish('route.find', data);
      });

      event.subscribe('route.found', function (data) {
        if (reporting.level > 1) {
          reporting.reporter('-- Compile components');
        }

        data.components = _this.getComponents(data.route.components);

        event.publish('components.compile', data);
      });

      event.subscribe('route.error', function (data) {
        if (reporting.level > 1) {
          reporting.reporter('-- No response from handler: ' + name);
        }

        event.publish('response.handler.error', {
          'name': name,
          'id': data.id,
          'time': Date.now()
        });
      });

      event.subscribe('components.compiled', function (data) {
        if (reporting.level > 0) {
          reporting.reporter('-- Response sent from handler: ' + name);
        }

        event.publish('response.send', {
          'name': name,
          'id': data.id,
          'time': Date.now(),
          'statusCode': 200,
          'contentType': 'text/html',
          'content': data.content
        });
      });
    }
  }, {
    key: 'getComponents',
    value: function getComponents(components) {
      var _this2 = this;

      var comps = [];

      var id = 1;

      this.iterateComponents({
        'components': components,
        'isArray': true,
        'callback': function callback(data) {
          data.component.id = id;

          var component = {
            'id': id,
            'component': data.component.component,
            'state': 'not rendered',
            'properties': _this2.getProperties(data.component)
          };

          if (data.hasOwnProperty('arrayKey')) {
            component.arrayKey = data.arrayKey;
          }

          if (data.parent) {
            component.parent = data.parent.id;
            component.propertyKey = data.propertyKey;

            for (var i = 0, l = comps.length; i < l; i++) {
              if (comps[i].id === data.parent.id) {
                comps[i].children = comps[i].children || [];
                comps[i].children.push(id);
              }
            }
          }

          comps.push(component);

          id++;
        }
      });

      return comps;
    }
  }, {
    key: 'getProperties',
    value: function getProperties(component) {
      var properties = {};

      if (component.properties) {
        for (var key in component.properties) {
          if (component.properties[key].hasOwnProperty('component')) {
            properties[key] = null;
          } else if (Array.isArray(component.properties[key]) && component.properties[key][0].hasOwnProperty('component')) {
            properties[key] = [];
          } else {
            properties[key] = component.properties[key];
          }
        }
      }

      return properties;
    }
  }, {
    key: 'iterateComponents',
    value: function iterateComponents(data) {
      for (var key in data.components) {
        var component = data.components[key];

        if (component.hasOwnProperty('component')) {
          var componentData = {
            'component': component
          };

          if (data.parent) {
            componentData.parent = data.parent;
            componentData.propertyKey = key;
          }

          if (data.isArray) {
            componentData.arrayKey = parseInt(key, 10);
            componentData.propertyKey = data.propertyKey;
          }

          data.callback.call(this, componentData);

          if (component.hasOwnProperty('properties')) {
            this.iterateComponents({
              'callback': data.callback,
              'components': component.properties,
              'parent': component
            });
          }
        } else if (Array.isArray(component)) {
          this.iterateComponents({
            'callback': data.callback,
            'components': component,
            'parent': data.parent || null,
            'isArray': true,
            'propertyKey': key
          });
        }
      }
    }
  }]);

  return Handler;
})();

exports['default'] = Handler;
module.exports = exports['default'];