<?php

  require_once('../includes/codebird.php');
  require_once('../includes/config.inc.php');
  require_once('../includes/helpers.php');
  require_once('../includes/minuetjson.php');


  \Codebird\Codebird::setConsumerKey($conKey, $conSecret);
  $cb = \Codebird\Codebird::getInstance();
  $cb->setToken($accTok, $accTokSecret);

  
  $db = connectDatabase();
  $minuet_data = json_decode(createMinuet(), true);

  if (!isset($minuet_data["key"])) {
    exit;
  }

  $minuet_url = $url_service . 'minueto/' . $minuet_data["key"];
  $minuet_tweet = "Escucha el minueto de hoy: $minuet_url #BNE";

  $params = array(
    'status' => $minuet_tweet
  );
  $reply = $cb->statuses_update($params);


