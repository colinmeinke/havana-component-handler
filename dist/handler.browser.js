(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.havanaComponentHandler = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])(1)
});