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

         missionStatus = getNewMissionStatus(racer.pos);

         // Update position taking into account collisions with barriers.
         if (raceTrack.racerHasCrashed(racer.pos))
         {
            missionStatus = -1;
            window.clearInterval(timerId);
         }

         if (missionStatus != oldMissionStatus)
         {
            missionStatusElem.innerHTML = missionStatus;
         }
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

   // Mission functions. ----------------------------------------------------------------------//

   /*
    *
    */
   function getNewMissionStatus(pos)
   {
      //Optimised for speed. var f = 'Racetrack.dealWithLapTimeIssues()';
      //Optimised for speed. UTILS.checkArgs(f, arguments, ['VectorRec2d', 'VectorRec2d']);

      // TODO: If hit objective, increment missionStatus.

      return missionStatus; // No progress, but all fine.
   }


   // Private variables. ////////////////////////////////////////////////////////////////////////

   var raceTrack     = new RaceTrack(canvasIdAttr, sidePanelIdAttr);
   var racer         = new Racer(raceTrack, IMG({src: 'images/racers/plane10.png'}), 2);
   var mousePos      = null;
   var missionTime   = null;
   var timerId       = null;
   var missionStatus = 0;

   const sidePanelElem     = document.getElementById(sidePanelIdAttr);
   const missionStatusElem = document.getElementById('mission-status');
   const deltaTime         = 80;
}

/*******************************************END*OF*FILE********************************************/
