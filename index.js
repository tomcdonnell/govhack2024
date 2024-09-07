/**************************************************************************************************\
*
* vim: ts=3 sw=3 et wrap co=100 go-=b
*
* Filename: "index.js"
*
* Project: Racing.
*
* Purpose: Starting point for the client-side code.
*
* Author: Tom McDonnell 2007.
*
\**************************************************************************************************/

// Globally executed code. /////////////////////////////////////////////////////////////////////////

if (document.readyState !== 'loading') {
   onDocumentReady();
} else {
   document.addEventListener('DOMContentLoaded', onDocumentReady);
}

/*
 *
 */
function onDocumentReady(e)
{
   try
   {
      var f = 'onDocumentReady()';
      UTILS.checkArgs(f, arguments, ['Event']);

      var racingGame = new RacingGame('canvas', 'side-panel');

      racingGame.init();
   }
   catch (e)
   {
      UTILS.printExceptionToConsole(f, e);
   }
}

/*******************************************END*OF*FILE********************************************/
