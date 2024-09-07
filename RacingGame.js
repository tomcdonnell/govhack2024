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

         var missionStatus = racer.accelerate(vectorRacerMouse.getAngle(), deltaTime);

         switch (missionStatus)
         {
          case -1:
            // Player has crashed.
            console.info('Clearing interval ', timerId);
            window.clearInterval(timerId);
            break;
          case  0:
            // No progress, but all fine.
            break;
          default:
            throw new Exception(f, 'Unknown missionStatus: ', missionStatus);
         }

//         sidePanel.setCurrentLapTime(missionTime);
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

   // Private variables. ////////////////////////////////////////////////////////////////////////

   var raceTrack   = new RaceTrack(canvasIdAttr, sidePanelIdAttr);
   var racer       = new Racer(raceTrack, IMG({src: 'images/racers/racer5.jpg'}), 2);
   var mousePos    = null;
   var missionTime = null;
   var timerId     = null;

   const sidePanel = document.getElementById(sidePanelIdAttr);
   const deltaTime = 80;
}

/*******************************************END*OF*FILE********************************************/
