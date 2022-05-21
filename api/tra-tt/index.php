<?php

require_once(__DIR__ ."/../../php/const.php");
require_once(Fetch);
require_once(HttpMethod);

$http_method = new HttpMethod();

$rl_param = $http_method->getParam("RL");
$pg_param = $http_method->getParam("PG");
$per_page = $http_method->getParam("per_page") ?? 1;
$offset_param = $http_method->getParam("offset") ?? "0";
$url = "https://jikoku.toretabi.jp/cgi-bin/tra.cgi/tra-tt?RL={$rl_param}&VT=T&FX=1&PG={$pg_param}&TC=SLERBN&TT=1&DI={$per_page}&PO={$offset_param}";
// var_dump($url);

$response = fetch($url);
preg_match("/charset\=(EUC-JP)/", $response->blob(), $m);
$charset = mb_detect_encoding($response->blob());
if (count($m) === 2) {
    $charset = $m[1];
}
$body = mb_convert_encoding($response->blob(), "UTF-8", $charset);

echo $body;
