;(function () {
  'use strict';

  var robotFactory = require('./src/robot'),
      astroBoy     = robotFactory({x: 23, y: 14});

  console.log(astroBoy.instruct('flrlrrlflflfllrlrrlfllflrlf'));
} ());
