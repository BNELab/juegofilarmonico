<?php

/*
   a88888b.  .88888.  888888ba  .d88888b  d888888P
  d8'   `88 d8'   `8b 88    `8b 88.    "'    88
  88        88     88 88     88 `Y88888b.    88
  88        88     88 88     88       `8b    88
  Y8.   .88 Y8.   .8P 88     88 d8'   .8P    88
   Y88888P'  `8888P'  dP     dP  Y88888P     dP
*/

//Character set for minuet encoding
$digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";




/*
  dP     dP  888888ba  dP
  88     88  88    `8b 88
  88     88 a88aaaa8P' 88
  88     88  88   `8b. 88
  Y8.   .8P  88     88 88
  `Y88888P'  dP     dP 88888888P
*/

//Helper for getting the URL fragments. Returns an array 
function getURLRoutes() {

  /*if (substr($_SERVER['REQUEST_URI'], 0, 9) == '/minueto/'){
    $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], 8);
  }*/

  $basepath = implode('/', array_slice(explode('/', $_SERVER['SCRIPT_NAME']), 0, -1)) . '/';

  $uri = substr($_SERVER['REQUEST_URI'], strlen($basepath));
  if (strstr($uri, '?')) $uri = substr($uri, 0, strpos($uri, '?'));
  $uri = '/' . trim($uri, '/');

  $cleanRoutes = array();
  $routes = explode('/', $uri);

  foreach($routes as $route) {
    if(trim($route) != '') {
      array_push($cleanRoutes, $route);
    }
  }

  return $cleanRoutes;

}




/*
  888888ba   888888ba
  88    `8b  88    `8b
  88     88 a88aaaa8P'
  88     88  88   `8b.
  88    .8P  88    .88
  8888888P   88888888P
*/

function connectDatabase() {

  global $db_server, $db_user, $db_password, $db_name;
  
  $db = new mysqli($db_server, $db_user, $db_password, $db_name);

  //@TODO: mejorar esto
  if ($db->connect_errno) {
      printf("Connect failed: %s\n", $db->connect_error);
      exit();
  }

  return $db;

}




/*
  dP     dP  88888888b dP    dP
  88   .d8'  88        Y8.  .8P
  88aaa8P'  a88aaaa     Y8aa8P
  88   `8b.  88           88
  88     88  88           88
  dP     dP  88888888P    dP
*/

//Creates a base 62 number from the dice throws. We return the base 62 key, 
//the array and the decimal value, but we are not using it anywhere.
function generatePartialKey($posibleValues, $measures) {

  global $digits;

  $sum = '0';
  $valuesArray = array();

  for ($index = 0; $index < $measures; $index++){

    $radix = bcpow("$posibleValues", "$index");
    $dice = rand(0, $posibleValues-1);
    $valuesArray[] = $dice;
    $value = bcmul($radix, $dice);
    $sum = bcadd($sum, $value);

  }

  return array(dec2base($sum, $digits), $valuesArray, $sum);

}


//From a base 62, returns the array of dice throws.
function expandPartialKey($partialKey, $arrayDigits, $measures) {

  global $digits;

  $keyDec = base2dec($partialKey, $digits);
  $valuesArray = array_reverse(str_split(dec2base($keyDec, $arrayDigits)));

  $valuesArray = array_map(
    function($value) {
      return $value=="A"?10:intval($value);
    }, 
    $valuesArray);

  for ($f = count($valuesArray); $f<$measures; $f++) {
    array_push($valuesArray, 0);
  }

  return $valuesArray;

}




/*
8888ba.88ba   .d888888  d888888P dP     dP  .d88888b
88  `8b  `8b d8'    88     88    88     88  88.    "'
88   88   88 88aaaaa88a    88    88aaaaa88a `Y88888b.
88   88   88 88     88     88    88     88        `8b
88   88   88 88     88     88    88     88  d8'   .8P
dP   dP   dP 88     88     dP    dP     dP   Y88888P
*/

function dec2base($dec, $digits) {
  
  $value = '';
  $base  = strlen($digits);
  
  while($dec>$base-1) {
    $rest=bcmod($dec,$base);
    $dec=bcdiv($dec,$base);
    $value = $digits[$rest].$value;
  }

  $value = $digits[intval($dec)].$value;
  return (string) $value;

}



function base2dec($value, $digits) {

  $size = strlen($value);
  $base = strlen($digits);
  $dec = '0';

  for($loop = 0; $loop<$size; $loop++) {
    $element = strpos($digits,$value[$loop]);
    $power = bcpow($base,$size-$loop-1);
    $dec = bcadd($dec,bcmul($element,$power));
  }

  return (string) $dec;
}