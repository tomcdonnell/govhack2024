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
   <h1>GovHack 2024</h1>
   <p>This is my entry to GovHack 2024.</p>
  </div>
  <canvas id='canvas' width='1000' height='1000'></canvas>
 </body>
</html>
<?php
/*******************************************END*OF*FILE********************************************/
?>
