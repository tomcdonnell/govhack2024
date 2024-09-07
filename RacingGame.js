/**************************************************************************************************\
*
* vim: ts=3 sw=3 et wrap co=100 go-=b
*
* Filename: "RacingGame.js"
*
* Project: RacingGame.
*
* Purpose: Definition of the RacingGame object.
*
* Author: Tom McDonnell 2007.
*
\**************************************************************************************************/

// Functions. //////////////////////////////////////////////////////////////////////////////////////

/*
 *
 */
function RacingGame(canvasIdAttr, sidePanelIdAttr)
{
   var f = 'RacingGame()';
   UTILS.checkArgs(f, arguments, ['string', 'string']);

   // Public functions. /////////////////////////////////////////////////////////////////////////

   /*
    *
    */
   this.init = function ()
   {
      var f = 'RacingGame.init()';
      UTILS.checkArgs(f, arguments, []);

      const body = document.querySelector('body');

      drawObjectivesForLevel();

      body.appendChild(racer.getImg());

      mousePos = racer.pos.clone();

      window.addEventListener('mousemove', onMouseMove, false);

      timerId = setInterval(onTimerFire, deltaTime);
   };


   // Private functions. ////////////////////////////////////////////////////////////////////////

   /*
    * Main game loop.
    */
   function onTimerFire()
   {
      try
      {
         var f = 'onTimerFire()';
         UTILS.checkArgs(f, arguments, []);

         // NOTE: Must convert mousePos to raceTrack coordinates to match racer.pos before
         //       calculating vectorRacerMouse.  Must also convert back since otherwise if mouse
         //       stops moving, mousePos will be in incorrect coordinates.
         raceTrack.convertCoordinatesWindowToTrack(mousePos);
         var vectorRacerMouse = mousePos.subtract(racer.pos);
         raceTrack.convertCoordinatesTrackToWindow(mousePos);

         var oldMissionStatus = missionStatus;

         racer.accelerate(vectorRacerMouse.getAngle(), deltaTime);

         // Update position taking into account collisions with barriers.
         if (raceTrack.racerHasCrashed(racer.pos))
         {
            missionStatus = -1;
            window.clearInterval(timerId);
         }

         updateMissionStatus(racer.pos);
      }
      catch (e)
      {
         UTILS.printExceptionToConsole(f, e);
      }
   }

   /*
    *
    */
   function onMouseMove(e)
   {
      try
      {
         // Optimised for speed. var f = 'onMouseMove';
         // Optimised for speed. UTILS.checkArgs(f, arguments, ['MouseEvent']);

         mousePos.setX(e.clientX);
         mousePos.setY(e.clientY);
      }
      catch (e)
      {
         UTILS.printExceptionToConsole(f, e);
      }
   }

   /*
    *
    */
   function drawObjectivesForLevel()
   {
      var levelData       = levelDataByLevelNo[levelNo];
      var levelObjectives = levelData.objectives;

      const canvas = document.getElementById(canvasIdAttr);
      const ctx    = canvas.getContext('2d');

      ctx.strokeStyle = 'rgb(0,0,0)';
      ctx.fillStyle   = 'rgb(255,0,0)';
      ctx.font        = 'bold 16px Arial';

      for (var i = 0; i < levelObjectives.length; ++i)
      {
         var o = levelObjectives[i];

         // Draw white circle.
         ctx.beginPath();
         ctx.arc(o.x, o.y, o.r, 0, 2 * Math.PI);
         ctx.stroke();
         ctx.fillText((i + 1) + ': ' + o.name, o.x - 15, o.y + 5);

         var p = document.createElement('p');
         p.innerHTML = (i + 1) + ': ' + o.name;
         p.setAttribute('id', 'objective-' + i);
         missionObjectivesElem.append(p);
      }
   }

   // Mission functions. ----------------------------------------------------------------------//

   /*
    *
    */
   function updateMissionStatus(pos)
   {
      var levelData           = levelDataByLevelNo[levelNo];
      var levelObjectives     = levelData.objectives;
      var posX                = pos.getX();
      var posY                = pos.getY();
      var unmetObjectiveFound = false;

      // If hit objective, increment missionStatus.
      for (var i = 0; i < levelObjectives.length; ++i)
      {
         var o = levelObjectives[i];

         if (!o.reached)
         {
            unmetObjectiveFound = true;

            // If pos is inside objective...
            if
            (
               posX > (o.x - o.r) && posX < (o.x + o.r) &&
               posY > (o.y - o.r) && posY < (o.y + o.r)
            )
            {
               o.reached = true;
               var p = document.getElementById('objective-' + i);
               p.innerHTML = (i + 1) + ': Completed';
               missionStatus++;
               continue;
            }
         }
      }

      if (!unmetObjectiveFound)
      {
         missionStatus = 1;
         window.clearInterval(timerId);
      }
   }

   // Private variables. ////////////////////////////////////////////////////////////////////////

   var raceTrack          = new RaceTrack(canvasIdAttr, sidePanelIdAttr);
   var racer              = new Racer(raceTrack, IMG({src: 'images/racers/plane10.png'}), 2);
   var mousePos           = null;
   var missionTime        = null;
   var timerId            = null;
   var missionStatus      = 0;
   var levelNo            = 0;
   var levelDataByLevelNo =
   [
      // Level 0.
      {
         name: 'Level 1: ',
         objectives:
         [
            {
               name: 'Sturt Creek',
               reached: false,
               x: 150,
               y: 550,
               r: 20,
            },
            {
               name: 'Home',
               reached: false,
               x: 880,
               y: 980,
               r: 20,
            }
         ]
      },

   ];

   const sidePanelElem         = document.getElementById(sidePanelIdAttr);
   const missionObjectivesElem = document.getElementById('mission-objectives');
   const deltaTime             = 80;
}

/*******************************************END*OF*FILE********************************************/
