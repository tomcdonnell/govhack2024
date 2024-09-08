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

      startGameButtonElem.addEventListener('click', showMissionIntroSlide);
//      showMissionIntroSlide();
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

      // Hide start game button.
      startGameButtonElem.style.display = 'none';

      // Initialise mission slides.
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
         name: 'Visit Darwin',
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
                  ' My plane will accelerate towards your mouse pointer.<br/><br/>' +
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
         name: 'The North',
         introSlides:
         [
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'Our trip to Darwin brought back so many memories.<br/><br/>' +
                  'Let me share a few facts about Darwin with you.'
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
                  'My research was about crocodiles!<br/><br/>' +
                  'It is starting to come back to me, but I need more details.<br/><br/>' +
                  "To learn more about crocodiles, let's tour the north!"
               ),
               nextButtonLabel: 'Next'
            },
         ],
         startX: 860,
         startY: 980,
         objectives:
         [
            {
               name: 'Kakadu National Park',
               reached: false,
               x: 430,
               y: 150,
               r: 20,
            },
            {
               name: 'Tiwi Islands',
               reached: false,
               x: 330,
               y: 50,
               r: 20,
            },
            {
               name: 'Garig Gunak Barlu National Park',
               reached: false,
               x: 430,
               y: 30,
               r: 20,
            },
            {
               name: 'Arnhem Land',
               reached: false,
               x: 550,
               y: 120,
               r: 20,
            },
            {
               name: 'Pellew Islands',
               reached: false,
               x: 700,
               y: 305,
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
         name: 'The Ghan',
         introSlides:
         [
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'I have spent a lot of time among the crocodiles in the northern part of NT.' +
                  '<br/><br/>' +
                  "I'll tell you a bit about the places we visited.<br/><br/>" +
                  "Then I'll tell you about some troubling things I have remembered."
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/kakadu_national_park.png',
               text: (
                  'Kakadu is the second-largest National Park in Australia - roughly the' +
                  ' size of Wales.<br/><br/>' +
                  'Most of the park is owned by the Aboriginal traditional owners, who have' +
                  ' occupied the land for around 60,000 years, and today, manage the park' +
                  ' jointly with Parks Australia.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/tiwi_islands.png',
               text: (
                  "The Tiwi Islands comprise Melville Island, Bathurst Island, and nine smaller" +
                  ' uninhabited islands.<br/><br/>' +
                  'They were created by sea level rise at the end of the last ice age, which' +
                  ' finished about 11,700 years ago.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/garig_gunak_barlu_national_park.png',
               text: (
                  'All six species of Australian marine turtle live in the area of ocean which is' +
                  ' included in the park.<br/><br/>' +
                  ' The surrounding ocean is also inhabited by sharks and cetaceans, and' +
                  ' saltwater crocodiles live near the coast.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/arnhem_land.png',
               text: (
                  'The Yolnu culture in East Arnhem Land is one of the oldest living cultures' +
                  ' on Earth, at around 60,000 years old.<br/><br/>' +
                  'DNA studies have confirmed that Aboriginal Australians are one of the oldest' +
                  ' living populations in the world, certainly the oldest outside of Africa.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'Touring these regions has reminded me that I have been working on crocodile' +
                  ' mutations - and that one of my experiments got out of control, which led to' +
                  ' my plane crash.<br/><br/>' +
                  'We will need the help of my friend General Kaiju, who is travelling on the Ghan.'
               ),
               nextButtonLabel: 'Start Mission'
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
         name: 'Return to the north',
         introSlides:
         [
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'We are lucky to have found General Kaiju in Katherine.  We will need his help' +
                  ' to deal with my escaped giant mutant crocodiles.<br/><br/>' +
                  'Yes, giant mutant crocodiles. I was an evil scientist, but following my plane' +
                  ' crash I only want to do good.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_general.png',
               text: (
                  "A fine mess you've gotten us into Professor!<br/><br/>" +
                  'But I have a plan.  The barrels we picked up in Alice Springs contain an' +
                  ' antidote to your mutant poison.<br/><br/>' +
                  'We just need to fly back over the northern regions, and unload these barrels' +
                  ' on all the croc habitats.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_general.png',
               text: (
                  'That will reverse the effect of the mutation.<br/><br/>' +
                  'Our pilot has proved himself worthy of this mission, but time is short.' +
                  '<br/><br/>' +
                  "You've got one shot at this pilot. The fate of the Territory is in your hands."
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'But, wait a minute.<br/><br/>' +
                  'Perhaps while we get the plan prepared I could tell you about my adventures' +
                  ' on the Ghan?'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_general.png',
               text: (
                  'Oh all right Professor.  We do love hearing about your travels.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/ghan_one.png',
               text: (
                  'The Ghan is a tourism-oriented passenger train service that operates between' +
                  ' the northern and southern coasts of Australia<br/><br/>' +
                  'Each train has an average of 28 stainless steel carriages. That makes for a' +
                  ' very long train.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/ghan_two.png',
               text: (
                  "The Ghan passes through Alice Springs, which is the NT's third-largest" +
                  ' settlement after Darwin and Palmerston.<br/><br/>' +
                  'The Arrernte people are the traditional owners of the area and surrounding' +
                  ' MacDonnell Ranges.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/tourism/ghan_three.png',
               text: (
                  'Construction of the Alice Springs-Darwin line was believed to be the' +
                  ' second-largest civil engineering project in Australia, and the largest since' +
                  ' the creation of the Snowy Mountains Scheme.<br/><br/>' +
                  'I look forward to travelling on the Ghan again.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_general.png',
               text: (
                  'Thanks for the tour Professor.  Now we know more about the Territory we must' +
                  ' save.<br/><br/>' +
                  "Now back to business. You've got one shot at this pilot.  The fate of the" +
                  ' Territory is in your hands.'
               ),
               nextButtonLabel: 'Start Mission'
            },
         ],
         startX: 860,
         startY: 980,
         objectives: [
            {
               name: 'Kakadu National Park',
               reached: false,
               x: 430,
               y: 150,
               r: 20,
            },
            {
               name: 'Tiwi Islands',
               reached: false,
               x: 330,
               y: 50,
               r: 20,
            },
            {
               name: 'Garig Gunak Barlu National Park',
               reached: false,
               x: 430,
               y: 30,
               r: 20,
            },
            {
               name: 'Arnhem Land',
               reached: false,
               x: 550,
               y: 120,
               r: 20,
            },
            {
               name: 'Pellew Islands',
               reached: false,
               x: 700,
               y: 305,
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
               text: (
                  "Thanks to your expert piloting skills, and the General's quick thinking, the " +
                  ' Territory has been saved from giant mutant crocodiles.<br/><br/>' +
                  "Professor Fuddlesby, I'm moving you out of scientific duties, and offering" +
                  " you a job as Assistant Tour Guide on the Ghan."
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_scientist.png',
               text: (
                  'Sorry again for letting my experiment get out of control.  I am honoured' +
                  ' to accept that position.'
               ),
               nextButtonLabel: 'Next'
            },
            {
               imageUrl: 'images/people/face_general.png',
               text: (
                  "All's well that end's well.  Now let's ride the Ghan back to Darwin."
               ),
               nextButtonLabel: 'End'
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
   const startGameButtonElem         = document.getElementById('start-game-button');
   const deltaTime                   = 80;
}

/*******************************************END*OF*FILE********************************************/
