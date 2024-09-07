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

      drawObjectivesForMission();

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

         racer.accelerate(vectorRacerMouse.getAngle(), deltaTime);

         // Update position taking into account collisions with barriers.
         if (raceTrack.racerHasCrashed(racer.pos))
         {
            window.clearInterval(timerId);
            var p = document.getElementById('mission-status');
            p.innerHTML = 'Failed';
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

   // Mission functions. ----------------------------------------------------------------------//

   /*
    *
    */
   function drawObjectivesForMission()
   {
      var missionData = missionDataByMissionNo[missionNo];
      var objectives  = missionData.objectives;

      missionNumberElem.innerHTML = missionNo + 1;
      missionNameElem.innerHTML   = missionData.name;
      missionStatusElem.innerHTML = 'Not yet started';

      const canvas = document.getElementById(canvasIdAttr);
      const ctx    = canvas.getContext('2d');

      ctx.strokeStyle = 'rgb(0,0,0)';
      ctx.fillStyle   = 'rgb(255,0,0)';
      ctx.font        = 'bold 16px Arial';

      for (var i = 0; i < objectives.length; ++i)
      {
         var o = objectives[i];

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

   /*
    *
    */
   function updateMissionStatus(pos)
   {
      var missionData         = missionDataByMissionNo[missionNo];
      var objectives          = missionData.objectives;
      var posX                = pos.getX();
      var posY                = pos.getY();
      var unmetObjectiveFound = false;

console.info('posX, posY: ', posX, posY);

      for (var i = 0; i < objectives.length; ++i)
      {
         var o = objectives[i];

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
            }

            break;
         }
      }

      if (!unmetObjectiveFound)
      {
         // The mission has been completed successfully.
         window.clearInterval(timerId);
         var p = document.getElementById('mission-status');
         p.innerHTML = 'Success!';

         if (missionNo === missionDataByMissionNo.length -1)
         {
            // All missions completed.
            console.info('All missions completed');
            console.info('missionNo: ', missionNo);
            console.info('missionDataByMissionNo: ', missionDataByMissionNo.length);
         }
         else
         {
            const canvas       = document.getElementById(canvasIdAttr);
            const canvasWidth  = Number(canvas.getAttribute('width' ));
            const canvasHeight = Number(canvas.getAttribute('height'));
            const ctx          = canvas.getContext('2d');

            // Clear canvas.
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Clear side panel for new mission.
            missionObjectivesElem.innerHTML = '';

            ++missionNo;
            drawObjectivesForMission();

            // Start new mission.
            timerId = setInterval(onTimerFire, deltaTime);
         }
      }
   }

   // Private variables. ////////////////////////////////////////////////////////////////////////

   var raceTrack              = new RaceTrack(canvasIdAttr, sidePanelIdAttr);
   var racer                  = new Racer(raceTrack, IMG({src: 'images/racers/plane10.png'}), 2);
   var mousePos               = null;
   var missionTime            = null;
   var timerId                = null;
   var missionNo              = 0;
   var missionDataByMissionNo =
   [
      {
         name: 'Test flight',
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
      {
         name: 'Pickup gear',
         objectives:
         [
            {
               name: 'New Place 1',
               reached: false,
               x: 350,
               y: 550,
               r: 20,
            },
            {
               name: 'New Place 2',
               reached: false,
               x: 350,
               y: 750,
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
   const missionNumberElem     = document.getElementById('mission-number');
   const missionNameElem       = document.getElementById('mission-name');
   const missionObjectivesElem = document.getElementById('mission-objectives');
   const missionStatusElem     = document.getElementById('mission-status');
   const deltaTime             = 80;
}

/*******************************************END*OF*FILE********************************************/
