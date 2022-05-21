<?php

require_once(__DIR__ ."/../../php/const.php");
require_once(Fetch);
require_once(HttpMethod);

$http_method = new HttpMethod();

$rl_param = $http_method->getParam("RL");
$rl = urlencode(mb_convert_encoding($rl_param, EUC_JP, UTF_8));
$url = "https://jikoku.toretabi.jp/cgi-bin/tra.cgi/cond?RL={$rl}";

$response = fetch($url);
preg_match("/charset\=(EUC-JP)/", $response->blob(), $m);
$charset = mb_detect_encoding($response->blob());
if (count($m) === 2) {
    $charset = $m[1];
}
$body = mb_convert_encoding($response->blob(), UTF_8, $charset);

echo $body;
