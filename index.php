<?php
/**************************************************************************************************\
*
* vim: ts=3 sw=3 et wrap go-=b
*
* Filename: "index.php"
*
* Project: GovHack 2024.
*
* Purpose: Start page for project.
*
* Author: Tom McDonnell 2024.
*
\**************************************************************************************************/
?>
<!DOCTYPE html>
<html>
 <head>
  <!-- NOTE: Order important. -->
  <script src='lib/tom/js/physics/Particle.js'></script>
  <script src='lib/tom/js/physics/VectorPol2d.js'></script>
  <script src='lib/tom/js/physics/VectorRec2d.js'></script>
  <script src='lib/tom/js/contrib/DomBuilder.js'></script>
  <script src='lib/tom/js/utils/utils.js'></script>
  <script src='lib/tom/js/utils/utilsValidator.js'></script>
  <script src='lib/tom/js/utils/inheritance.js'></script>
  <script src='RaceTrack.js'></script>
  <script src='Racer.js'></script>
  <script src='RacingGame.js'></script>
  <script src='index.js'></script>
  <link rel='stylesheet' href='style.css'/>
  <title>GovHack 2024</title>
 </head>
 <body>
  <div id='side-panel'>
   <h1>NT Flight School</h1>
   <p>A game made for GovHack 2024.</p>
   <h2>
    Mission <span id='mission-number'></span>:<br/>
    <span id='mission-name'></span>
   </h2>
   <h2>Objectives</h2>
   <div id='mission-objectives'></div>
   <h2>Mission Status</h2>
   <p id='mission-status'></p>
  </div>
  <canvas id='canvas' width='1000' height='1000'></canvas>
  <div id='mission-intro-slide' style='display:none'>
   <img id='mission-intro-slide-img' width='200' height='200'/>
   <p id='mission-intro-slide-text'>this is what the mayor says.</p>
   <button id='mission-intro-slide-button'>Next</button>
  </div>
 </body>
</html>
<?php
/*******************************************END*OF*FILE********************************************/
?>
