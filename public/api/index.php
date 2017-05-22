<?php

require('../../includes/config.inc.php');
require('../../includes/helpers.php');
require('../../includes/minuetjson.php');

$routes = getURLRoutes();

//Fast route filtering. If something smells fishy, we return an error.
if (count($routes)!==1 && count($routes)!==3) {
  returnMinuetError();
  exit();
}

if ($routes[0]!="piece") {
  returnMinuetError();
  exit();
}

if (count($routes)==3 && ($routes[2]!="plays" && $routes[2]!="name")) {
  returnMinuetError();
  exit();
}


$db = connectDatabase();


if (count($routes)==1) {
  //Sleep, create and return a new minuet
  usleep(10000);
  echo createMinuet();
  exit();
}


$affectedRows = 0;
if ($routes[2]=="plays") {

  //Increment the number of reproductions
  $result = $db->query("UPDATE pieza SET pie_plays = pie_plays + 1 WHERE pie_id = '" . $routes[1] . "'");
  $affectedRows = $db->affected_rows;

} else {

  //Change the name of the piece
  $stmt = $db->prepare('UPDATE pieza SET pie_title = ? WHERE pie_id = ? AND pie_token = ?');
  $stmt->bind_param('sss', $_POST["name"], $routes[1], $_POST["token"]);
  $stmt->execute();
  $affectedRows = 1;
  $stmt->close();

}

if ($affectedRows==1) {

  $result = $db->query("SELECT * FROM pieza WHERE pie_id = '" . $routes[1] . "'");
  $row = $result->fetch_assoc();

  list ($minueKey, $trioKey) = split('-', $routes[1]);

  $minueArray = expandPartialKey($minueKey, "0123456789A",16);
  $trioArray = expandPartialKey($trioKey, "012345",16);

  echo returnMinuetJSON(intval($row["pie_plays"]), $row["pie_title"], false, $routes[1], $minueArray, $trioArray, '');

} else {

  returnMinuetError();

}

exit();