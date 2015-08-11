/* global describe before it */

import chai from 'chai';
import ComponentHandler from '../../dist/handler.server.with-polyfill';
import Event from 'havana-event';

const expect = chai.expect;

const event = new Event();

let handler = new ComponentHandler({
  'event': event,
  'reporting': {
    'level': 0,
    'reporter': console.log,
  },
});

const routeData = {
  'id': 1,
  'route': {
    'components': [
      {
        'component': 'page',
        'properties': {
          'header': {
            'component': 'header',
            'properties': {
              'logo': '/public/logo.svg',
            },
          },
          'content': {
            'component': 'postsList',
            'properties': {
              'posts': [
                {
                  'component': 'post',
                  'properties': {
                    'title': 'Hello world',
                  },
                },
              ],
            },
          },
        },
      },
    ],
  },
};

describe( 'Handler', () => {
  describe( '_', () => {
    it( 'should be private', () => {
      expect( handler ).to.not.have.property( '_' );
    });
  });

  describe( 'event', () => {
    it( 'should be private', () => {
      expect( handler ).to.not.have.property( 'event' );
    });
  });

  describe( 'name', () => {
    it( 'should be private', () => {
      expect( handler ).to.not.have.property( 'name' );
    });
  });

  describe( 'reporting', () => {
    it( 'should be private', () => {
      expect( handler ).to.not.have.property( 'reporting' );
    });
  });

  describe( 'response.handler.register', () => {
    before(() => {
      handler = null;
    });

    it( 'should be published when class is instantiated', done => {
      const token = event.subscribe( 'response.handler.register', () => {
        event.unsubscribe( token );
        done();
      });

      handler = new ComponentHandler({
        'event': event,
        'reporting': {
          'level': 0,
          'reporter': console.log,
        },
      });
    });
  });

  describe( 'route.find', () => {
    it( 'should be published when a dispatcher publishes a request.received event', done => {
      const token = event.subscribe( 'route.find', () => {
        event.unsubscribe( token );
        done();
      });

      event.publish( 'request.received', {});
    });
  });

  describe( 'components.compile', () => {
    it( 'should be published when a router publishes a route.found event', done => {
      const token = event.subscribe( 'components.compile', () => {
        event.unsubscribe( token );
        done();
      });

      event.publish( 'route.found', {
        'route': {
          'components': null,
        },
      });
    });
  });

  describe( 'response.handler.error', () => {
    it( 'should be published when a router publishes a route.error event', done => {
      const token = event.subscribe( 'response.handler.error', () => {
        event.unsubscribe( token );
        done();
      });

      event.publish( 'route.error', {});
    });
  });

  describe( 'response.send', () => {
    it( 'should be published when a component compiler publishes a components.compiled event', done => {
      const token = event.subscribe( 'response.send', () => {
        event.unsubscribe( token );
        done();
      });

      event.publish( 'components.compiled', {
        'id': 1,
        'content': 'Hello world',
      });
    });
  });

  describe( 'getComponents()', () => {
    it( 'should return an array', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data ).to.have.property( 'components' ).that.is.an( 'array' );
        done();
      });

      event.publish( 'route.found', routeData );
    });

    it( 'should give array items an id property', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data.components[ 0 ]).to.have.property( 'id' );
        done();
      });

      event.publish( 'route.found', routeData );
    });

    it( 'should give array items unique id property values', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data.components[ 0 ].id ).to.not.equal( data.components[ 1 ].id );
        done();
      });

      event.publish( 'route.found', routeData );
    });

    it( 'should give array items a state property', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data.components[ 0 ]).to.have.property( 'state' );
        done();
      });

      event.publish( 'route.found', routeData );
    });

    it( 'should give array items an initial state property value of not rendered', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data.components[ 0 ].state ).to.equal( 'not rendered' );
        done();
      });

      event.publish( 'route.found', routeData );
    });

    it( 'should give array items a properties property', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data.components[ 0 ]).to.have.property( 'properties' );
        done();
      });

      event.publish( 'route.found', routeData );
    });

    it( 'should give array items an arrayKey property', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data.components[ 3 ]).to.have.property( 'arrayKey' );
        done();
      });

      event.publish( 'route.found', routeData );
    });

    it( 'should give array items a parent property', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data.components[ 1 ]).to.have.property( 'parent' );
        done();
      });

      event.publish( 'route.found', routeData );
    });

    it( 'should give array items a propertyKey property', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data.components[ 3 ]).to.have.property( 'propertyKey' );
        done();
      });

      event.publish( 'route.found', routeData );
    });

    it( 'should give array items a children property', done => {
      const token = event.subscribe( 'components.compile', data => {
        event.unsubscribe( token );
        expect( data.components[ 0 ]).to.have.property( 'children' );
        done();
      });

      event.publish( 'route.found', routeData );
    });
  });
});
