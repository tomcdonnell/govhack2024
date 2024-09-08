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

      showMissionIntroSlide();
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
            p.innerHTML = 'Failed (presumed crashed)';
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
   function showMissionIntroSlide()
   {
      var missionData = missionDataByMissionNo[missionNo];
      var slides      = missionData.introSlides;
      var slide       = slides[missionSlideNo];

      missionIntroSlideImgElem.setAttribute('src', slide.imageUrl);
      missionIntroSlideTextElem.innerHTML = slide.text;
      missionIntroSlideElem.style.display = 'block';

      // Remove all event listeners that might previously have been added.
      missionIntroSlideButtonElem.removeEventListener('click', startMission);
      missionIntroSlideButtonElem.removeEventListener('click', showNextSlide);
      missionIntroSlideButtonElem.removeEventListener('click', refreshPage);

      if (missionSlideNo < slides.length - 1)
      {
         // This is not the last intro slide, so set button to next slide.
         missionIntroSlideButtonElem.innerHTML = slide.nextButtonLabel;
         missionIntroSlideButtonElem.addEventListener('click', showNextSlide);
      }
      else
      {
         // This is the last intro slide.
         missionIntroSlideButtonElem.innerHTML = slide.nextButtonLabel

         if (missionData.objectives.length > 0)
         {
            missionIntroSlideButtonElem.addEventListener('click', startMission);
         }
         else
         {
            // This is the end-game slideshow.  Change the button to a refresh
            missionIntroSlideButtonElem.addEventListener('click', refreshPage);
         }
      }
   }

   /*
    *
    */
   function showNextSlide(ev)
   {
       missionSlideNo++;
       showMissionIntroSlide();
   }

   /*
    *
    */
   function refreshPage(ev)
   {
      document.location.reload(true);
   }

   /*
    *
    */
   function startMission()
   {
      // Hide mission intro slide.
      missionIntroSlideElem.style.display = 'none';

      // Clear canvas.
      const canvas       = document.getElementById(canvasIdAttr);
      const canvasWidth  = Number(canvas.getAttribute('width' ));
      const canvasHeight = Number(canvas.getAttribute('height'));
      const ctx          = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Get mission data.
      var missionData = missionDataByMissionNo[missionNo];
      var objectives  = missionData.objectives;

      // Prepare side panel.
      missionObjectivesElem.innerHTML = '';
      missionNumberElem.innerHTML     = missionNo + 1;
      missionNameElem.innerHTML       = missionData.name;
      missionStatusElem.innerHTML     = 'Not yet started';
      missionSlideNo                  = 0;

      // Draw mission objective circles on map.
      ctx.strokeStyle = 'rgb(0,0,0)';
      ctx.fillStyle   = 'rgb(255,0,0)';
      ctx.font        = 'bold 16px Arial';
      for (var i = 0; i < objectives.length; ++i)
      {
         var o = objectives[i];

         // Draw circle.
         ctx.beginPath();
         ctx.arc(o.x, o.y, o.r, 0, 2 * Math.PI);
         ctx.stroke();
         ctx.fillText((i + 1) + ': ' + o.name, o.x - 15, o.y + 5);

         // Draw label.
         var p = document.createElement('p');
         p.innerHTML = (i + 1) + ': ' + o.name;
         p.setAttribute('id', 'objective-' + i);
         missionObjectivesElem.append(p);
      }

      // Start the mission.
      racer.setPos(missionData.startX, missionData.startY);
      timerId = window.setInterval(onTimerFire, deltaTime);
      missionStatusElem.innerHTML = 'Ongoing';
   }

   /*
    *
    */
   function updateMissionStatus(pos)
   {
      const canvas = document.getElementById(canvasIdAttr);
      const ctx    = canvas.getContext('2d');

      var missionData         = missionDataByMissionNo[missionNo];
      var objectives          = missionData.objectives;
      var posX                = pos.getX();
      var posY                = pos.getY();
      var unmetObjectiveFound = false;

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

               // Colour circle green to indicate objective met.
               ctx.strokeStyle = 'rgb(255,255,255)';
               ctx.beginPath();
               ctx.arc(o.x, o.y, o.r, 0, 2 * Math.PI);
               ctx.stroke();

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

         if (missionNo < missionDataByMissionNo.length -1)
         {
            // Prepare for the next mission.
            missionNo     += 1;
            missionSlideNo = 0;
            showMissionIntroSlide();
         }
      }
   }

   // Private variables. ////////////////////////////////////////////////////////////////////////

   var mousePos               = null;
   var timerId                = null;
   var missionTime            = null;
   var missionNo              = 0;
   var missionSlideNo         = 0;
   var missionDataByMissionNo =
   [
      {
         name: 'Test flight',
         introSlides:
         [
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'Hello there.  My name is Professor Lyle Fuddlesby.<br/><br/>' +
                  'My plane crashed a short distance from here.  I have repaired it, but I can' +
                  ' no longer fly it due to my injuries.<br/><br/>' +
                  'Will you fly my plane for me?  I will teach you how.'
               ),
               nextButtonLabel: 'Yes'
            },
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'Before my plane crashed, I was working on something very important.' +
                  " But now I can't remember what that was.<br/><br/>" +
                  'I do remember that my work started in Darwin.<br/><br/>' +
                  'You must take me back to Darwin.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'My plane is the red dot at the bottom-right corner of the map,' +
                  ' here in Birdsville.<br/><br/>' +
                  ' My plane will accellerate towards your mouse pointer.<br/><br/>' +
                  'Keep the mouse pointer close to the plane to keep the plane under control.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'Complete a mission by visiting all the objectives in the correct order.' +
                  '<br/><br/>' +
                  ' The first mission has two objectives: Darwin, then back to' +
                  ' Birdsville.<br/><br/>' +
                  'Remember, keep the mouse pointer close to the red dot!'
               ),
               nextButtonLabel: 'Start Mission'
            },
         ],
         startX: 860,
         startY: 980,
         objectives:
         [
            {
               name: 'Darwin',
               reached: false,
               x: 350,
               y: 100,
               r: 20,
            },
            {
               name: 'Birdsville',
               reached: false,
               x: 860,
               y: 980,
               r: 20,
            }
         ]
      },
      {
         name: 'Pickup gear',
         introSlides:
         [
            {
               imageUrl: 'images/people/face_scientist.png',
               text: 'Our trip to Darwin brought back so many memories.',
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/darwin_city.png',
               text: (
                  'Darwin is a beautiful city, and rich in history.<br/><br/>' +
                  'Did you know Darwin was bombed in World War 2?' +
                  ' Also it was devastated by Cyclone Tracy in 1974.<br/><br/>' +
                  ' Over 50% of the population of NT live in Darwin.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/darwin_city.png',
               text: (
                  'Darwin is a beautiful city, and rich in history.<br/><br/>' +
                  'Did you know Darwin was bombed in World War 2?' +
                  ' Also it was devastated by Cyclone Tracy in 1974.<br/><br/>' +
                  ' Over 50% of the population of NT live in Darwin.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/darwin_crocosaurus_cove.png',
               text: (
                  'Darwin is also home to Crocosaurus Cove, where I did some of my research.' +
                  '<br/><br/>' +
                  "Crocosaurus Cove has the world's largest display of Australian reptiles," +
                  ' including the iconic saltwater crocodile.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'Next I want you to take me along the route of the Ghan Railroad.<br/><br/>' +
                  ''
               ),
               nextButtonLabel: 'Next'
            },
         ],
         startX: 860,
         startY: 980,
         objectives:
         [
            {
               name: 'Ghan',
               reached: false,
               x: 470,
               y: 945,
               r: 20,
            },
            {
               name: 'Alice Springs',
               reached: false,
               x: 520,
               y: 850,
               r: 20,
            },
            {
               name: 'Davenport',
               reached: false,
               x: 540,
               y: 650,
               r: 20,
            },
            {
               name: 'Pamayu',
               reached: false,
               x: 520,
               y: 480,
               r: 20,
            },
            {
               name: 'Katherine',
               reached: false,
               x: 430,
               y: 230,
               r: 20,
            },
            {
               name: 'Birdsville',
               reached: false,
               x: 860,
               y: 980,
               r: 20,
            }
         ]
      },
      {
         name: 'Rejoice!',
         introSlides:
         [
            {
               imageUrl: 'images/people/face_mayor.png',
               text: 'This is the end.  All missions have been completed.'
            },
         ],
         startX: 860,
         startY: 980,
         objectives: [] // The final mission has no objectives.  It is just a slideshow.
      },
   ];

   var raceTrack = new RaceTrack(canvasIdAttr, sidePanelIdAttr);
   var racer     = new Racer
   (
      raceTrack,
      IMG({src: 'images/racers/plane10.png'}),
      2,
      missionDataByMissionNo[0].startX,
      missionDataByMissionNo[0].startY
   );

   const sidePanelElem               = document.getElementById(sidePanelIdAttr);
   const missionNumberElem           = document.getElementById('mission-number');
   const missionNameElem             = document.getElementById('mission-name');
   const missionIntroSlideElem       = document.getElementById('mission-intro-slide');
   const missionIntroSlideImgElem    = document.getElementById('mission-intro-slide-img');
   const missionIntroSlideTextElem   = document.getElementById('mission-intro-slide-text');
   const missionIntroSlideButtonElem = document.getElementById('mission-intro-slide-button');
   const missionObjectivesElem       = document.getElementById('mission-objectives');
   const missionStatusElem           = document.getElementById('mission-status');
   const deltaTime                   = 80;
}

/*******************************************END*OF*FILE********************************************/
