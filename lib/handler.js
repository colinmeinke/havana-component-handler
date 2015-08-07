const _ = new WeakMap();

class Handler {
  constructor ( config ) {
    const props = {
      'event': config.event,
      'name': 'component',
      'reporting': config.reporting,
    };

    _.set( this, props );

    this.init();
  }

  init () {
    const { event, name, reporting } = _.get( this );

    if ( reporting.level > 1 ) {
      reporting.reporter( `-- Response handler registered: ${name}` );
    }

    event.publish( 'response.handler.register', {
      'name': name,
    });

    event.subscribe( 'request.received', data => {
      if ( reporting.level > 1 ) {
        reporting.reporter( '-- Find component route' );
      }

      event.publish( 'route.find', data );
    });

    event.subscribe( 'route.found', data => {
      if ( reporting.level > 1 ) {
        reporting.reporter( '-- Compile components' );
      }

      data.components = this.getComponents( data.route.components );

      event.publish( 'components.compile', data );
    });

    event.subscribe( 'route.error', data => {
      if ( reporting.level > 1 ) {
        reporting.reporter( `-- No response from handler: ${name}` );
      }

      event.publish( 'response.handler.error', {
        'name': name,
        'id': data.id,
        'time': Date.now(),
      });
    });

    event.subscribe( 'components.compiled', data => {
      if ( reporting.level > 0 ) {
        reporting.reporter( `-- Response sent from handler: ${name}` );
      }

      event.publish( 'response.send', {
        'name': name,
        'id': data.id,
        'time': Date.now(),
        'statusCode': 200,
        'contentType': 'text/html',
        'content': data.content,
      });
    });
  }

  getComponents ( components ) {
    const comps = [];

    let id = 1;

    this.iterateComponents({
      'components': components,
      'isArray': true,
      'callback': data => {
        data.component.id = id;

        const component = {
          'id': id,
          'component': data.component.component,
          'state': 'not rendered',
          'properties': this.getProperties( data.component ),
        };

        if ( data.hasOwnProperty( 'arrayKey' )) {
          component.arrayKey = data.arrayKey;
        }

        if ( data.parent ) {
          component.parent = data.parent.id;
          component.propertyKey = data.propertyKey;

          for ( let i = 0, l = comps.length; i < l; i++ ) {
            if ( comps[ i ].id === data.parent.id ) {
              comps[ i ].children = comps[ i ].children || [];
              comps[ i ].children.push( id );
            }
          }
        }

        comps.push( component );

        id++;
      },
    });

    return comps;
  }

  getProperties ( component ) {
    const properties = {};

    if ( component.properties ) {
      for ( let key in component.properties ) {
        if ( component.properties[ key ].hasOwnProperty( 'component' )) {
          properties[ key ] = null;
        } else if ( Array.isArray( component.properties[ key ]) &&
          component.properties[ key ][ 0 ].hasOwnProperty( 'component' )) {
          properties[ key ] = [];
        } else {
          properties[ key ] = component.properties[ key ];
        }
      }
    }

    return properties;
  }

  iterateComponents ( data ) {
    for ( let key in data.components ) {
      const component = data.components[ key ];

      if ( component.hasOwnProperty( 'component' )) {
        const componentData = {
          'component': component,
        };

        if ( data.parent ) {
          componentData.parent = data.parent;
          componentData.propertyKey = key;
        }

        if ( data.isArray ) {
          componentData.arrayKey = parseInt( key, 10 );
          componentData.propertyKey = data.propertyKey;
        }

        data.callback.call( this, componentData );

        if ( component.hasOwnProperty( 'properties' )) {
          this.iterateComponents({
            'callback': data.callback,
            'components': component.properties,
            'parent': component,
          });
        }
      } else if ( Array.isArray( component )) {
        this.iterateComponents({
          'callback': data.callback,
          'components': component,
          'parent': data.parent || null,
          'isArray': true,
          'propertyKey': key,
        });
      }
    }
  }
}

export default Handler;
