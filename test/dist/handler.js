/* global describe before it */

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _distHandlerWithPolyfill = require('../../dist/handler.with-polyfill');

var _distHandlerWithPolyfill2 = _interopRequireDefault(_distHandlerWithPolyfill);

var _havanaEvent = require('havana-event');

var _havanaEvent2 = _interopRequireDefault(_havanaEvent);

var expect = _chai2['default'].expect;

var event = new _havanaEvent2['default']();

var handler = new _distHandlerWithPolyfill2['default']({
  'event': event,
  'reporting': {
    'level': 0,
    'reporter': console.log
  }
});

var routeData = {
  'id': 1,
  'route': {
    'components': [{
      'component': 'page',
      'properties': {
        'header': {
          'component': 'header',
          'properties': {
            'logo': '/public/logo.svg'
          }
        },
        'content': {
          'component': 'postsList',
          'properties': {
            'posts': [{
              'component': 'post',
              'properties': {
                'title': 'Hello world'
              }
            }]
          }
        }
      }
    }]
  }
};

describe('Static', function () {
  describe('_', function () {
    it('should be private', function () {
      expect(handler).to.not.have.property('_');
    });
  });

  describe('event', function () {
    it('should be private', function () {
      expect(handler).to.not.have.property('event');
    });
  });

  describe('name', function () {
    it('should be private', function () {
      expect(handler).to.not.have.property('name');
    });
  });

  describe('reporting', function () {
    it('should be private', function () {
      expect(handler).to.not.have.property('reporting');
    });
  });

  describe('response.handler.register', function () {
    before(function () {
      handler = null;
    });

    it('should be published when class is instantiated', function (done) {
      var token = event.subscribe('response.handler.register', function () {
        event.unsubscribe(token);
        done();
      });

      handler = new _distHandlerWithPolyfill2['default']({
        'event': event,
        'reporting': {
          'level': 0,
          'reporter': console.log
        }
      });
    });
  });

  describe('route.find', function () {
    it('should be published when a dispatcher publishes a request.received event', function (done) {
      var token = event.subscribe('route.find', function () {
        event.unsubscribe(token);
        done();
      });

      event.publish('request.received', {});
    });
  });

  describe('components.compile', function () {
    it('should be published when a router publishes a route.found event', function (done) {
      var token = event.subscribe('components.compile', function () {
        event.unsubscribe(token);
        done();
      });

      event.publish('route.found', {
        'route': {
          'components': null
        }
      });
    });
  });

  describe('response.handler.error', function () {
    it('should be published when a router publishes a route.error event', function (done) {
      var token = event.subscribe('response.handler.error', function () {
        event.unsubscribe(token);
        done();
      });

      event.publish('route.error', {});
    });
  });

  describe('response.send', function () {
    it('should be published when a component compiler publishes a components.compiled event', function (done) {
      var token = event.subscribe('response.send', function () {
        event.unsubscribe(token);
        done();
      });

      event.publish('components.compiled', {
        'id': 1,
        'content': 'Hello world'
      });
    });
  });

  describe('getComponents()', function () {
    it('should return an array', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data).to.have.property('components').that.is.an('array');
        done();
      });

      event.publish('route.found', routeData);
    });

    it('should give array items an id property', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data.components[0]).to.have.property('id');
        done();
      });

      event.publish('route.found', routeData);
    });

    it('should give array items unique id property values', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data.components[0].id).to.not.equal(data.components[1].id);
        done();
      });

      event.publish('route.found', routeData);
    });

    it('should give array items a state property', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data.components[0]).to.have.property('state');
        done();
      });

      event.publish('route.found', routeData);
    });

    it('should give array items an initial state property value of not rendered', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data.components[0].state).to.equal('not rendered');
        done();
      });

      event.publish('route.found', routeData);
    });

    it('should give array items a properties property', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data.components[0]).to.have.property('properties');
        done();
      });

      event.publish('route.found', routeData);
    });

    it('should give array items an arrayKey property', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data.components[3]).to.have.property('arrayKey');
        done();
      });

      event.publish('route.found', routeData);
    });

    it('should give array items a parent property', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data.components[1]).to.have.property('parent');
        done();
      });

      event.publish('route.found', routeData);
    });

    it('should give array items a propertyKey property', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data.components[3]).to.have.property('propertyKey');
        done();
      });

      event.publish('route.found', routeData);
    });

    it('should give array items a children property', function (done) {
      var token = event.subscribe('components.compile', function (data) {
        event.unsubscribe(token);
        expect(data.components[0]).to.have.property('children');
        done();
      });

      event.publish('route.found', routeData);
    });
  });
});