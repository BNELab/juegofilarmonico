<?php

  require('../includes/config.inc.php');
  require('../includes/helpers.php');
  require('../includes/minuetjson.php');

  $db = connectDatabase();

  $routes = getURLRoutes();

  $templateData["count"] = countMinuets();
  $templateData["minuetData"] = "";

   $templateData["robots"]='<meta name="robots" content="noindex, follow" />';

  if (count($routes)==1 && $routes[0]=="historia") {
    generateMarkup("misterio.html", $templateData);
    exit;
  }

  if (count($routes)==2 && $routes[0]=="minueto" && preg_match("/[a-zA-Z0-9]{10}-[a-zA-Z0-9]{7}/", $routes[1]) == 1) {

    $templateData["hiddenWhenShared"] = "oculto";
    $templateData["visibleWhenShared"] = "";

    $minuet = minuetFromKey($routes[1]);


    if (!is_null($minuet)) {

      $minuetArray = json_decode($minuet, true);

    }else{

      // no existe el minueto pasamos un -1 y un codigo de error para que haga la redireccion
      $responseArray = array(
         "error" => "Error 1809"
      );
      $responseJson = json_encode($responseArray);
      $minuet=$responseJson;
      $minuetArray["key"]=-1;

    }

    $templateData["minuetData"] =
    '<script type="text/javascript">
            var jsonMinueto =\'' . $minuet . '\';
            var idMinueto = "' . $minuetArray["key"] . '";
        </script>
    ';
    $templateData["robots"]='<meta name="robots" content="noindex, follow" />';


    generateMarkup("main.html", $templateData);
    exit;


  }

  $templateData["hiddenWhenShared"] = "";
  $templateData["visibleWhenShared"] = "oculto";

  generateMarkup("main.html", $templateData);
  exit;

  function generateMarkup($filename, $data) {
    $contents = file_get_contents($filename);
    foreach ($data as $key => $value) {
      $contents = str_replace("{{@$key}}", $value, $contents);
    }
    echo $contents;

  }