<?php

function createMinuet() {

  global $db;

  $retries = 10;
  $couldCreate = false;

  do {


    list($minueKey, $minueArray, ) = generatePartialKey(11,16);
    list($trioKey, $trioArray, ) = generatePartialKey(6,16);

    $minueKey = str_pad ($minueKey , 10, '0', STR_PAD_LEFT);
    $trioKey = str_pad ($trioKey , 7, '0', STR_PAD_LEFT);

    $fullKey = "$minueKey-$trioKey";

    $token = bin2hex(mcrypt_create_iv(16, MCRYPT_DEV_URANDOM));

    $couldCreate = $db->query("INSERT INTO pieza(pie_id, pie_date, pie_token) VALUES ('$fullKey', now(), '$token')");
    if ($couldCreate === true) {
      break;
    }

    $retries--;

  } while ($retries > 0 && $couldCreate === false);

  if ($couldCreate === false) {

    returnMinuetError();
    exit();

  }

  return returnMinuetJSON(0, '', true, $fullKey, $minueArray, $trioArray, $token);

}



function minuetFromKey($key) {

  global $db;

  $result = $db->query("SELECT * FROM pieza WHERE pie_id = '" . $key . "'");
  if ($result->num_rows == 1) {

    $row = $result->fetch_assoc();

    list ($minueKey, $trioKey) = split('-', $key);

    $minueArray = expandPartialKey($minueKey, "0123456789A",16);
    $trioArray = expandPartialKey($trioKey, "012345",16);

    return returnMinuetJSON(intval($row["pie_plays"]), $row["pie_title"], false, $key, $minueArray, $trioArray, '');

  } 

  return null;

}



function returnMinuetJSON($plays, $title, $isNew, $key, $minueArray, $trioArray, $token){

  $responseArray = array (
    "plays" => $plays,
    "title" => $title,
    "isNew" => $isNew,
    "key" => $key,
    "measures" => array ("minue" => $minueArray,
                         "trio" => $trioArray),
    "token" => $token
  );

  $responseJson = json_encode($responseArray);
  return print_r($responseJson, true);

}



function countMinuets() {

  global $db;

  $result = $db->query("SELECT COUNT(pie_id) FROM pieza");
  $row = $result->fetch_row();

  return $row[0];

}



function countMinuetsJSON($pieces){

  $responseArray = array (
    "count" => intval($pieces)
  );

  $responseJson = json_encode($responseArray);
  print_r($responseJson);

}



function returnMinuetError() {

  $responseArray = array(
    "error" => "Error 1809"
  );
  $responseJson = json_encode($responseArray);
  print_r($responseJson);

}