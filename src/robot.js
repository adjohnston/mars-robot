//  robot factory
//  -------------------------------------------------------------------------------------
//  the robotFactory is a factory method used for creating new robots to explore Mars.
//  there is a dependency on Underscore for some object extension although this could
//  have been written as a constructor or in the future using the native Object.assign().
//
//  ==  EXAMPLE   =======================================================================
//
//  var robotFactory = require('./src/robot'),
//      dave = robotFacotry({x: 27, y: 12, heading: 'E'});
//
//  dave.instruct('lrlflfrlflrfffrlfl');
//  -------------------------------------------------------------------------------------

;(function (_, undefined) {

  'use strict';

  module.exports = (function () {
    var losses  = [],
        compass = ['N', 'E', 'S', 'W'],
        bounds  = {
          min: { x: 0,  y: 0  },
          max: { x: 50, y: 25 }
        };

    return function (options) {
      var defaults = _.extendOwn({
            x: 0,
            y: 0,
            heading: 'N'
          }, options),

          //  moves
          //  -------------------------------------
          //  a collection of the robot's movements
          //  which could be useful.
          //  -------------------------------------
          moves = [],

          //  is within bounds?
          //  --------------------------------------
          //  check whether a set of coordinates are
          //  within a set boundary.
          //  ======================================
          //  @arg      {object}  coords
          //  @returns  {boolean}
          //  --------------------------------------
          isWithinBounds = function (coords) {
            if (!coords instanceof Object)
              throw new TypeError();

            var lastMove = moves[moves.length - 1],
                move     = _.extend({}, lastMove, coords);

            return ((move.x >= bounds.min.x && move.x <= bounds.max.x) &&
                    (move.y >= bounds.min.y && move.y <= bounds.max.y));
          },

          //  add move
          //  ----------------------------------------------------------------
          //  checks whether the latest coordinates are within the boundaries
          //  or if it the robot has been lost, if it is it'll add a new entry
          //  to the moves collection else it will also add the coordinates to
          //  the losses collection.
          //  ================================================================
          //  @arg      {object}  coords
          //  ----------------------------------------------------------------
          addMove = function (coords) {
            if (!coords instanceof Object)
              throw new TypeError();

            var lastMove = moves[moves.length - 1],
                move     = _.extend({}, lastMove, coords);

            if (lastMove.lost)
              return;

            if (isWithinBounds(move)) {
              moves.push(move);
            } else {
              if (!(_.filter(losses, function (loss) {
                return [loss.x, loss.y].toString() === [move.x, move.y].toString();
              }).length)) {
                moves.push(_.extend({lost: true}, move));
                losses.push(move);
              }
            }
          },

          //  turn
          //  -------------------------------------------
          //  gets the current heading of the robot,
          //  updates the heading and calls addMove to
          //  add a new movement to the moves collection.
          //  ===========================================
          //  @arg      {number}  dir
          //  -------------------------------------------
          turn = function (dir) {
            if (typeof dir !== 'number')
              throw new TypeError();

            var lastMove = moves[moves.length - 1],
                currentHeading = compass.indexOf(lastMove.heading);

            currentHeading = currentHeading + dir;

            if (currentHeading < 0)
              currentHeading = 3;

            else if (currentHeading > 3)
              currentHeading = 0;

            addMove({
              heading: compass[currentHeading]
            });
          },

          //  move
          //  -------------------------------------------------
          //  checks which way to move the robot and then calls
          //  the addMove method to perform the checks and add
          //  to the collection.
          //  -------------------------------------------------
          move = function () {
            var move = {},
                lastMove = moves[moves.length - 1];

            if (lastMove.heading.match(/n/i))
              move.y = lastMove.y + 1;

            else if (lastMove.heading.match(/e/i))
              move.x = lastMove.x + 1;

            else if (lastMove.heading.match(/s/i))
              move.y = lastMove.y - 1;

            else if (lastMove.heading.match(/w/i))
              move.x = lastMove.x - 1;

            addMove(move);
          };

      //  add an initial position when the robot created.
      moves.push({
        x: defaults.x,
        y: defaults.y,
        heading: defaults.heading
      });

      return {
        //  instruct
        //  ------------------------------------------------------
        //  this method allows you to give your robot instructions
        //  on how to move over the surface of Mars.
        //  ======================================================
        //  @arg      {string}  instructions
        //  @returns  {string}  last position
        //  ------------------------------------------------------
        instruct: function (instructions) {
          if (typeof instructions !== 'string')
            throw new TypeError();

          if (instructions.length >= 100)
            throw new Error('Instruction string must be less than 100 characters');

          if (instructions.match(/^[l|r|f]*$/i)) {
            instructions.split('').forEach(function (instruction) {
              if (instruction.match(/l/i))
                turn(-1);

              else if (instruction.match(/r/i))
                turn(1);

              else if (instruction.match(/f/i))
                move();
            });

            var lastMove = moves[moves.length - 1];

            return lastMove.x + ' ' + lastMove.y + ' ' + lastMove.heading +
              ((lastMove.lost) ? ' LOST' : '');
          } else
            throw new Error('Instructions can only include a combination of L, R and F');
        }
      };
    };
  } ());

} (require('underscore')));
