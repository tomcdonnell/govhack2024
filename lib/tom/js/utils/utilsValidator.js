/****************************************************************************************************************************************************\
*
* vim: ts=3 sw=3 et wrap co=150 go-=b
*
* Filename: "utilsValidator.js"
*
* Project: Utilities.
*
* Purpose: Utilities concerning validation.
*
* Author: Tom McDonnell 2008-10-04.
*
\****************************************************************************************************************************************************/

/*
 * Namespace for validation functions.
 */
UTILS.validator = {};

UTILS.validator.skipChecks = false; // Override this in another file to skip the checks for performance reasons.

// Namespace 'UTILS.validator' functions. ////////////////////////////////////////////////////////////////////////////////////////////////////////////

UTILS.validator.checkObject = function (o, typeByRequiredKey, typeByOptionalKey)
{
   if (UTILS.validator.skipChecks) {return;}
   var f = 'UTILS.validator.checkObject()';
   UTILS.assert(f, 0, arguments.length == 2 || arguments.length == 3);
   UTILS.assert(f, 1, typeByRequiredKey.constructor == Object);
   UTILS.assert(f, 2, arguments.length == 2 || typeByOptionalKey.constructor == Object);

   if (o === undefined)
   {
      throw new Exception(f, 'o is undefined.');
   }

   if (typeof typeByOptionalKey == 'undefined')
   {
      typeByOptionalKey = {};
   }

   // Check required keys and types.
   for (var key in typeByRequiredKey)
   {
      var type = typeByRequiredKey[key];

      if (typeof o[key] == 'undefined')
      {
         throw new Exception(f, "Required key '" + key + "' does not exist in object.");
      }

      try {UTILS.validator.checkType(o[key], type);}
      catch (e)
      {
         UTILS.printExceptionToConsole(f, e);
      }
   }

   // Check optional keys and types.
   var keysExtra = UTILS.object.diffKey(o, typeByRequiredKey);
   for (var i = 0, len = keysExtra.length; i < len; ++i)
   {
      var key = keysExtra[i];

      if (typeof typeByOptionalKey[key] == 'undefined')
      {
         throw new Exception(f, "Unexpected key '" + key + "' found.");
      }

      try {UTILS.validator.checkType(o[key], typeByOptionalKey[key]);}
      catch (e)
      {
         UTILS.printExceptionToConsole(f, e);
      }
   }
};

UTILS.validator.checkObjectAndSetDefaults = function (o, typeByRequiredKey, typeAndDefaultByOptionalKey)
{
   if (!UTILS.validator.skipChecks)
   {
      var f = 'UTILS.validator.checkObjectAndSetDefaults()';
      UTILS.assert(f, 0, arguments.length == 2 || arguments.length == 3);
      UTILS.assert(f, 1, typeByRequiredKey.constructor == Object);
      UTILS.assert(f, 2, arguments.length == 2 || typeAndDefaultByOptionalKey.constructor == Object);

      var typeByOptionalKey = {};

      for (key in typeAndDefaultByOptionalKey)
      {
         var typeAndDefault = typeAndDefaultByOptionalKey[key];

         if (typeAndDefault.constructor != Array || typeAndDefault.length != 2)
         {
            throw new Exception(f, 'Type and default value for optional parameter must be two-element array.');
         }

         typeByOptionalKey[key] = typeAndDefault[0];
      }

      UTILS.validator.checkObject(o, typeByRequiredKey, typeByOptionalKey);
   }

   for (key in typeAndDefaultByOptionalKey)
   {
      var typeAndDefault = typeAndDefaultByOptionalKey[key];

      if (typeof o[key] == 'undefined')
      {
         o[key] = typeAndDefault[1];
      }
   }

   return o;
};

UTILS.validator.checkType = function (v, type)
{
   if (UTILS.validator.skipChecks) {return;}
   // NOTE: Must not call UTILS.checkArgs from here as UTILS.checkArgs calls this function
   var f = 'UTILS.validator.checkType()';
   UTILS.assert(f, 0, arguments.length == 2);
   UTILS.assert(f, 1, typeof v != 'undefined');
   UTILS.assert(f, 2, type.constructor === String);

   if (v === null && !(type == 'Defined' || type.substr(0, 4) == 'null'))
   {
      throw new Exception(f, "Expected non-null type '" + type + "'. Received null.");
   }

   var b;

   switch (type)
   {
    // Special type for compatibility with UTILS.checkArgs().
    case 'Defined': b = (typeof v != 'undefined'); break;

    // Null.
    case 'null': b = v === null; break;

    // Basic types.
    case 'array'   : b = (v.constructor == Array                  ); break;
    case 'bool'    : // Fall through.
    case 'boolean' : b = (v.constructor == Boolean                ); break;
    case 'char'    : b = (v.constructor == String && v.length == 1); break;
    case 'number'  : // Fall through.
    case 'float'   : b = (v.constructor == Number                 ); break;
    case 'function': b = (v.constructor == Function               ); break;
    case 'int'     : b = (v.constructor == Number && v % 1 == 0   ); break;
    case 'object'  : b = (v.constructor == Object                 ); break;
    case 'string'  : b = (v.constructor == String                 ); break;

    // Basic types with condition.
    case 'character'       : b = (v.constructor == String && v.length == 1       ); break;
    case 'nonEmptyString'  : b = (v.constructor == String && v.length > 0        ); break;
    case 'nonEmptyArray'   : b = (v.constructor == Array  && v.length > 0        ); break;
    case 'positiveInt'     : b = (v.constructor == Number && v >  0 && v % 1 == 0); break;
    case 'negativeInt'     : b = (v.constructor == Number && v <  0 && v % 1 == 0); break;
    case 'nonNegativeInt'  : b = (v.constructor == Number && v >= 0 && v % 1 == 0); break;
    case 'nonPositiveInt'  : b = (v.constructor == Number && v <= 0 && v % 1 == 0); break;
    case 'positiveFloat'   : b = (v.constructor == Number && v >  0              ); break;
    case 'negativeFloat'   : b = (v.constructor == Number && v <  0              ); break;
    case 'nonNegativeFloat': b = (v.constructor == Number && v >= 0              ); break;
    case 'nonPositiveFloat': b = (v.constructor == Number && v <= 0              ); break;

    // Useful for checking 'tinyint' values intended to behave as boolean.
    case 'blankOrBinaryDigitString': b = (v === '' || v === '0' || v === '1'); break;
    case 'binaryDigitString'       : b = (            v === '0' || v === '1'); break;
    case 'binaryDigit'             : b = (            v ===  0  || v ===  1 ); break;

    // Basic types or null.
    case 'nullOrArray'     : b = (v === null || v.constructor == Array               ); break;
    case 'nullOrBool'      : b = (v === null || v.constructor == Boolean             ); break;
    case 'nullOrFloat'     : b = (v === null || v.constructor == Number              ); break;
    case 'nullOrFunction'  : b = (v === null || v.constructor == Function            ); break;
    case 'nullOrObject'    : b = (v === null || v.constructor == Object              ); break;
    case 'nullOrString'    : b = (v === null || v.constructor == String              ); break;
    case 'nullOrEvent'     : b = (v === null || v.constructor == Event               ); break;
    case 'nullOrMouseEvent': b = (v === null || v.constructor == MouseEvent          ); break;
    case 'nullOrInt'       : b = (v === null || v.constructor == Number && v % 1 == 0); break;

    // HTML elements or null.
    case 'nullOrHTMLCanvasElement': b = (v === null || v.constructor == HTMLCanvasElement); break;

    // Basic types with condition or null.
    case 'nullOrNegativeFloat'   : b = (v === null || v.constructor == Number && v        <  0              ); break;
    case 'nullOrNegativeInt'     : b = (v === null || v.constructor == Number && v        <  0 && v % 1 == 0); break;
    case 'nullOrNonEmptyArray'   : b = (v === null || v.constructor == Array  && v.length >  0              ); break;
    case 'nullOrNonEmptyString'  : b = (v === null || v.constructor == String && v.length >  0              ); break;
    case 'nullOrNonNegativeFloat': b = (v === null || v.constructor == Number && v        >= 0              ); break;
    case 'nullOrNonNegativeInt'  : b = (v === null || v.constructor == Number && v        >= 0 && v % 1 == 0); break;
    case 'nullOrNonPositiveFloat': b = (v === null || v.constructor == Number && v        <= 0              ); break;
    case 'nullOrNonPositiveInt'  : b = (v === null || v.constructor == Number && v        <= 0 && v % 1 == 0); break;
    case 'nullOrPositiveFloat'   : b = (v === null || v.constructor == Number && v        >  0              ); break;
    case 'nullOrPositiveInt'     : b = (v === null || v.constructor == Number && v        >  0 && v % 1 == 0); break;

    // Date strings (format convention is same as used in php function date()).
    case 'date_Y-m-d': b = UTILS.validator.checkDateString(v, 'Y-m-d'); break;
    case 'date_Y/m/d': b = UTILS.validator.checkDateString(v, 'Y/m/d'); break;
    case 'date_d-m-Y': b = UTILS.validator.checkDateString(v, 'd-m-Y'); break;
    case 'date_d/m/Y': b = UTILS.validator.checkDateString(v, 'd/m/Y'); break;

    // Null or date strings (format convention is same as used in php function date()).
    case 'nullOrDate_Y-m-d': b = (v === null || UTILS.validator.checkDateString(v, 'Y-m-d')); break;
    case 'nullOrDate_Y/m/d': b = (v === null || UTILS.validator.checkDateString(v, 'Y/m/d')); break;
    case 'nullOrDate_d-m-Y': b = (v === null || UTILS.validator.checkDateString(v, 'd-m-Y')); break;
    case 'nullOrDate_d/m/Y': b = (v === null || UTILS.validator.checkDateString(v, 'd/m/Y')); break;

    // Blank or date strings (format convention is same as used in php function date()).
    case 'blankOrDate_Y-m-d': b = (v === '' || UTILS.validator.checkDateString(v, 'Y-m-d')); break;
    case 'blankOrDate_Y/m/d': b = (v === '' || UTILS.validator.checkDateString(v, 'Y/m/d')); break;
    case 'blankOrDate_d-m-Y': b = (v === '' || UTILS.validator.checkDateString(v, 'd-m-Y')); break;
    case 'blankOrDate_d/m/Y': b = (v === '' || UTILS.validator.checkDateString(v, 'd/m/Y')); break;

    // Time strings (format convention is same as used in php function date()).
    case 'time_H:i'  : b = UTILS.validator.checkTimeString(v, 'H:i'  ); break;
    case 'time_H:i:s': b = UTILS.validator.checkTimeString(v, 'H:i:s'); break;
    case 'time_h:i-a': b = UTILS.validator.checkTimeString(v, 'h:i a'); break;
    case 'time_g:i-a': b = UTILS.validator.checkTimeString(v, 'g:i a'); break;

    // Null or time strings (format convention is same as used in php function date()).
    case 'nullOrTime_H:i:s': b = (v === null || UTILS.validator.checkTimeString(v, 'H:i:s')); break;
    case 'nullOrTime_h:i-a': b = (v === null || UTILS.validator.checkTimeString(v, 'h:i a')); break;

    // Blank or time strings (format convention is same as used in php function date()).
    case 'blankOrTime_H:i'  : b = (v === '' || UTILS.validator.checkTimeString(v, 'H:i'  )); break;
    case 'blankOrTime_H:i:s': b = (v === '' || UTILS.validator.checkTimeString(v, 'H:i:s')); break;
    case 'blankOrTime_g:i-a': b = (v === '' || UTILS.validator.checkTimeString(v, 'g:i a')); break;
    case 'blankOrTime_h:i-a': b = (v === '' || UTILS.validator.checkTimeString(v, 'h:i a')); break;

    // Numeric strings.
    case 'positiveIntString': // Fall through to 'digitString'.
    case 'digitString'                  : b = (               v.constructor == String && /^\d+$/.test(v)                       ); break;
    case 'blankOrDigitString'           : b = (v === ''   || (v.constructor == String && /^\d+$/.test(v))                      ); break;
    case 'nullOrDigitString'            : b = (v === null || (v.constructor == String && /^\d+$/.test(v))                      ); break;
    case 'floatString'                  : b = (               v.constructor == String && /^[-\d]?\d+\.?\d*$/.test(v)           ); break;
    case 'positiveFloatString'          : b = (               v.constructor == String && /^\d+\.?\d*$/.test(v) && Number(v) > 0); break;
    case 'nonNegativeFloatString'       : b = (               v.constructor == String && /^\d+\.?\d*$/.test(v)                 ); break;
    case 'blankOrFloatString'           : b = (v === ''   || (v.constructor == String && /^[-\d]?\d+\.?\d*$/.test(v))          ); break;
    case 'nullOrFloatString'            : b = (v === null || (v.constructor == String && /^[-\d]?\d+\.?\d*$/.test(v))          ); break;
    case 'blankOrNonNegativeIntString'  : b = (v === ''   || (v.constructor == String && /^\d+$/.test(v))                      ); break;
    case 'blankOrNonNegativeFloatString': b = (v === ''   || (v.constructor == String && /^\d+\.?\d*$/.test(v))                ); break;
    case 'nullOrNonNegativeFloatString' : b = (v === null || (v.constructor == String && /^\d+\.?\d*$/.test(v))                ); break;

    // Miscellaneous.
    case 'nullOrDate': b = (v === null || v.constructor == Date); break;

    default:
      eval('b = ((typeof ' + type + ' != undefined) && (v.constructor == ' + type + '));');
   }

   if (!b)
   {
      throw new Exception(f, "Variable type check failed. Expected '" + type + "', received '" + v + "' with constructor '" + v.constructor + "'.");
   }
};

UTILS.validator.checkObjectReturnBool = function (o, typeByRequiredKey, typeByOptionalKey)
{
   if (UTILS.validator.skipChecks) {return true;}
   try
   {
      if (typeByOptionalKey === undefined)
      {
         // Cannot pass undefined variable to another function.
         typeByOptionalKey = {};
      }

      UTILS.validator.checkObject(o, typeByRequiredKey, typeByOptionalKey);
   }
   catch (e)
   {
      return false;
   }

   return true;
};

UTILS.validator.checkTypeReturnBool = function (v, type)
{
   if (UTILS.validator.skipChecks) {return true;}
   try
   {
      UTILS.validator.checkType(v, type);
   }
   catch (e)
   {
      return false;
   }

   return true;
};

UTILS.validator.checkEmailAddressReturnBool = function (str)
{
   if (UTILS.validator.skipChecks) {return true;}
   var f = 'UTILS.validator.checkEmailAddressReturnBool()';
   UTILS.checkArgs(f, arguments, ['string']);

   var regEx = new RegExp("^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*\\.(\\w{2}|(com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum))$");

   return regEx.test(str.toLowerCase()); // NOTE: The regEx above will not work for uppercase domains eg. ".COM".
};

UTILS.validator.checkDateString = function (dateStr, format)
{
   if (UTILS.validator.skipChecks) {return true;}
   var f = 'UTILS.validator.checkDateString()';
   UTILS.checkArgs(f, arguments, ['string', 'string']);

   if (typeof UTILS.dateTime == 'undefined')
   {
      throw new Exception('UTILS.dateTime is not defined!.');
   }

   try
   {
      var date = UTILS.dateTime.parseDateString(dateStr, format);
   }
   catch (e)
   {
      return false;
   }

   return true;
};

UTILS.validator.checkTimeString = function (timeStr, format)
{
   if (UTILS.validator.skipChecks) {return true;}
   var f = 'UTILS.validator.checkTimeString()';
   UTILS.checkArgs(f, arguments, ['string', 'string']);

   if (typeof UTILS.dateTime == 'undefined')
   {
      throw new Exception('UTILS.dateTime is not defined!.');
   }

   try
   {
      var time = UTILS.dateTime.parseTimeString(timeStr, format);
   }
   catch (e)
   {
      return false;
   }

   return true;
};

/********************************************************************END*OF*FILE*********************************************************************/
