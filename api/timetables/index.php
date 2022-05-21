<?php

require_once(__DIR__ ."/../../php/const.php");
require_once(common);
require_once(Fetch);
require_once(HttpMethod);

$http_method = new HttpMethod();

$id = $http_method->getParam("id");
if (is_null($id) || filter_var($id, FILTER_VALIDATE_INT) === false) {
    echoJson(HTTP_RESPONSE_CODE_BAD_REQUEST, array(
        "message" => "idが正しく指定されていません。"
    ));
}

$url = "https://jikoku.toretabi.jp/cgi-bin/tra.cgi/cond?RL={$id}";

$response = fetch($url);
preg_match("/charset\=(EUC-JP)/", $response->blob(), $m);
$charset = mb_detect_encoding($response->blob());
if (count($m) === 2) {
    $charset = $m[1];
}
$body = mb_convert_encoding($response->blob(), UTF_8, $charset);
// var_dump($body);

preg_match("/SELECT\sname\=\'PG\'\ssize\=\'\d+\'\>[\s\S]+\n\<\/SELECT\>\n/", $body, $m);
// var_dump($m);
if (!$m) {
    echoJson(HTTP_RESPONSE_CODE_BAD_REQUEST, array(
        "message" => "idが正しく指定されていません。"
    ));
}

$ms = explode("</OPTION>", $m[0]);
// var_dump($ms);
$results = array();
foreach ($ms as $string) {
    preg_match("/value\=\'(\d+)\'(\sselected)?\>\d+\.\s([\s\S]+)/", $string, $m);
    if (!$m) {
        continue;
    }
    $results[] = array(
        "number" => (int)$m[1],
        "name" => $m[3]
    );
}
// var_dump($results);

echoJson(HTTP_RESPONSE_CODE_OK, $results);
