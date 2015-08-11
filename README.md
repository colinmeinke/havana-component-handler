# Havana component handler

[![NPM version](https://badge.fury.io/js/havana-component-handler.svg)](http://badge.fury.io/js/havana-component-handler)
[![Build Status](https://travis-ci.org/colinmeinke/havana-component-handler.svg?branch=master)](https://travis-ci.org/colinmeinke/havana-component-handler)
[![Dependency status](https://david-dm.org/colinmeinke/havana-component-handler.svg)](https://david-dm.org/colinmeinke/havana-component-handler.svg)

An HTML response handler.

Havana component handler works with a request/response
dispatcher such as
[Havana server](https://github.com/colinmeinke/havana-server),
[Havana browser](https://github.com/colinmeinke/havana-browser)
or a library with an interchangeable API. When a dispatcher
publishes a `response.received` event Havana component
handler will publish a `route.find` event for consumption by
a router such as
[Havana router](https://github.com/colinmeinke/havana-router)
or a library with an interchangeable API.

Havana component handler consumes routes of the following
structure (note how components can be nested):

```javascript
[
  {
    'url': '/',
    'method': 'GET',
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
          'content': 'Hello world',
        },
      },
    ],
  },
]
```

When the router publishes a `route.found` event Havana
component handler will convert the components array to the
following flattened structure:

```javascript
[
  {
    'children': [ 2 ],
    'component': 'page',
    'id': 1,
    'properties': {
      'content': 'Hello world',
      'header': null,
    },
    'state': 'not rendered',
  },
  {
    'component': 'header',
    'id': 2,
    'parent': 1,
    'properties': {
      'logo': '/public/logo.svg',
    },
    'propertyKey': 'header',
    'state': 'not rendered',
  }
]
```

Havana component handler then publishes a `components.compile`
event for consumption by
[Havana component compiler](https://github.com/colinmeinke/havana-component-compiler)
or a library with an interchangeable API. The component
compiler renders the components array into an HTML string,
publishing a `components.compiled` event when complete.
Havana component handler subscribes to the `components.compiled`
event and in turn publishes a `response.send` event
publishing the rendered HTML string for consumption by the
dispatcher.

## How to install

```
npm install havana-component-handler
```

## How to use

```javascript
import ComponentHandler from 'havana-component-handler';
import Event from 'havana-event';
import Router from 'havana-router';
import Server from 'havana-server';

const event = new Event();

const reporting = {
  'level': 2, 
  'reporter': console.log,
};

const server = new Server({
  'event': event,
  'reporting': reporting,
});

new Router({
  'event': event,
  'reporting': reporting,
  'routes': [
    {
      'url': '/',
      'method': 'GET',
      'components': [
        {
          'component': 'page',
          'properties': {
            'content': 'Hello world',
          },
        },
      ],
    },
  ],
});

// Add a component compiler here

new ComponentHandler({
  'event': event,
  'reporting': reporting,
});

server.listen( 3000 );
```

## Event list

Events take the form of
[Havana event](https://github.com/colinmeinke/havana-event)
or a library with an interchangeable API.

### Publish

- `response.handler.register`: Signifies that Havana component
  handler will now attempt to handle requests.
- `route.find`: Signifies that a request has been received
  and Havana component handler requires a matching route.
- `components.compile`: Signifies that Havana component
  handler requires a components array to be rendered into an
  HTML string.
- `response.send`: Signifies that Havana component handler
  has received an HTML string for consumption by a
  request/response dispatcher.
- `response.handler.error`: Signifies that Havana component
  handler was unable to provide a response.

### Subscribe

- `request.received`: Allows a request/response dispatcher
  to notify Havana component handler that it has received a
  request, publishing the request data for consumption by
  Havana component handler.
- `route.found`: Allows a router to notify Havana component
  Handler that it has found a route, publishing the route
  data for consumption by Havana component handler.
- `components.compiled`: Allows a component compiler to
  notify Havana component handler that it has completed
  rendering the components array into an HTML string.

## ES2015+

Havana component handler is written using ES2015+ syntax.

However, by default this module will use an ES5
compatible file that has been compiled using
[Babel](https://babeljs.io).

In the `dist` directory there are four files, the default
is `handler.server.js`. The default when using a client-side
bundler that supports the
[browser field](https://gist.github.com/defunctzombie/4339901)
spec is `handler.browser.js`.

Havana component handler currently requires the 
[Babel polyfill](https://babeljs.io/docs/usage/polyfill).
You are expected to supply this yourself. However, as a
courtesy you will also find `handler.server.with-polyfill.js`
and `handler.browser.with-polyfill.js` in the `dist`
directory.
