<?php

require_once(__DIR__ ."/../../php/const.php");
require_once(common);
require_once(Fetch);
require_once(HttpMethod);

$http_method = new HttpMethod();

$name = $http_method->getParam("name");
if (is_null($name)) {
    echoJson(HTTP_RESPONSE_CODE_BAD_REQUEST, array(
        "message" => "nameが指定されていません。"
    ));
}

$rl = urlencode(mb_convert_encoding($name, EUC_JP, UTF_8));
$url = "https://jikoku.toretabi.jp/cgi-bin/tra.cgi/cond?RL={$rl}";

$response = fetch($url);
preg_match("/charset\=(EUC-JP)/", $response->blob(), $m);
$charset = mb_detect_encoding($response->blob());
if (count($m) === 2) {
    $charset = $m[1];
}
$body = mb_convert_encoding($response->blob(), UTF_8, $charset);
// var_dump($body);

preg_match("/\<SELECT\sname\=\'RL\'\>[\s\S]+\<\/SELECT\>\<\/td\>/", $body, $m);
if ($m) {
    $ms = explode("</OPTION>", $m[0]);
    $results = array();
    foreach ($ms as $string) {
        preg_match("/value\=\'(\d+)\'\>([\s\S]+)/", $string, $m);
        if (!$m) {
            continue;
        }
        $results[] = array(
            "id" => (int)$m[1],
            "name" => $m[2]
        );
    }

    echoJson(HTTP_RESPONSE_CODE_OK, $results);
}

preg_match("/\<INPUT\stype\=\'hidden\'\sname\=\'RL\'\svalue\=\'(\d+)'\>/", $body, $m);
// var_dump($m);
if ($m) {
    echoJson(HTTP_RESPONSE_CODE_OK, array(
        array(
            "id" => (int)$m[1],
            "name" => $name
        )
    ));
}

echoJson(HTTP_RESPONSE_CODE_OK, array());
