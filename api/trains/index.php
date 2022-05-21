<?php

set_time_limit(0);

require_once(__DIR__ ."/../../php/const.php");
require_once(common);
require_once(Fetch);
require_once(HttpMethod);

$http_method = new HttpMethod();

$route_id = $http_method->getParam("route_id");
if (is_null($route_id) || filter_var($route_id, FILTER_VALIDATE_INT) === false) {
    echoJson(HTTP_RESPONSE_CODE_BAD_REQUEST, array(
        "message" => "route_idが正しく指定されていません。"
    ));
}

$timetable_number = $http_method->getParam("timetable_number");
if (is_null($timetable_number) || filter_var($timetable_number, FILTER_VALIDATE_INT) === false) {
    echoJson(HTTP_RESPONSE_CODE_BAD_REQUEST, array(
        "message" => "timetable_numberが正しく指定されていません。"
    ));
}

$train_ids = array();
$stations = array();
$station_name_ids = array();
$i = 0;
while (true) {
    $offset = 100 * $i;
    $url = "https://jikoku.toretabi.jp/cgi-bin/tra.cgi/tra-tt?RL={$route_id}&PG={$timetable_number}&TT=1&DI=100&PO={$offset}";
    // var_dump($url);

    $response = fetch($url);
    preg_match("/charset\=(EUC-JP)/", $response->blob(), $m);
    $charset = mb_detect_encoding($response->blob());
    if (count($m) === 2) {
        $charset = $m[1];
    }
    $body = mb_convert_encoding($response->blob(), UTF_8, $charset);
    // var_dump($body);

    preg_match_all("/TR\=(\d+)\s/", $body, $m);
    foreach ($m[1] as $id) {
        $train_ids[] = $id;
    }

    if ($i === 0) {
        $strings = explode("</SELECT>", $body);
        foreach ($strings as $string) {
            preg_match("/\<SELECT\sname\=\'EX\'[\s\S]+/", $string, $m);
            if (!$m) {
                continue;
            }

            $options = explode("</OPTION>", $m[0]);
            foreach ($options as $option) {
                preg_match("/value\=\'(\d+)\'\>([\s\S]+)/", $option, $m);
                if (!$m) {
                    continue;
                }
                $stations[] = array(
                    "id" => (int)$m[1],
                    "name" => $m[2]
                );
                $station_name_ids[$m[2]] = (int)$m[1];
            }
            break;
        }
    }

    preg_match("/\'\>\<IMG\ssrc\=\'\/img\/ttnext\.gif/", $body, $m);
    if ($m) {
        $i++;
        continue;
    }
    break;
}
$train_ids = array_unique($train_ids);

$count = $http_method->getParam("count");
if ($count) {
    echoJson(HTTP_RESPONSE_CODE_OK, array(
        "count" => count($train_ids)
    ));
}

$trains = array();
foreach ($train_ids as $train_id) {
    sleep(1);

    $url = "https://jikoku.toretabi.jp/cgi-bin/trinf.cgi/route/trinf?TR={$train_id}";

    $response = fetch($url);
    preg_match("/charset\=(EUC-JP)/", $response->blob(), $m);
    $charset = mb_detect_encoding($response->blob());
    if (count($m) === 2) {
        $charset = $m[1];
    }
    $body = mb_convert_encoding($response->blob(), UTF_8, $charset);
    // var_dump($body);

    preg_match("/\<dt\>([\s\S]+)\<\/dt\>/", $body, $m);
    $type = null;
    if ($m) {
        $type = trim($m[1]);
    }

    preg_match("/<dd><strong>【([\s\S]+)\s発\s\〜\s([\s\S]+)\s行】/", $body, $m);
    $from = null;
    $to = null;
    if ($m) {
        $from = $m[1];
        $to = $m[2];
    }

    preg_match("/列車番号\<\/strong\>\[(\S+)\]/", $body, $m);
    $number = null;
    if ($m) {
        $number = $m[1];
    }

    $operate_day = null;

    $train_stations = array();
    $tables = explode("</table>", $body);
    foreach ($tables as $table) {
        preg_match("/trinf_table_border/", $table, $m);
        if (!$m) {
            continue;
        }
        $trs = explode("<TR", $table);
        foreach ($trs as $tr) {
            preg_match("/\<TD\>([\s\S]+)\<\/TD\>\<TD\>([\s\S]+)\<\/TD\>\<TD\>([\s\S]+)\<\/TD\>\<TD\>([\s\S]+)\<\/TD\>/", $tr, $m);
            if (!$m) {
                continue;
            }
            // var_dump($m);
            $m2 = filter_var(ltrim($m[2], "0"), FILTER_VALIDATE_INT);
            $m3 = filter_var(ltrim($m[3], "0"), FILTER_VALIDATE_INT);
            $train_stations[] = array(
                "id" => $station_name_ids[$m[1]],
                "arrival_time" => $m2 === false ? null : $m2,
                "departure_time" => $m3 === false ? null : $m3,
                "platform" => $m[4] === "<BR>" ? null : $m[4]
            );
        }
    }

    $trains[] = array(
        "id" => (int)$train_id,
        "number" => $number,
        "from" => $from,
        "to" => $to,
        "operate_day" => $operate_day,
        "stations" => $train_stations
    );

    // break;
}

echoJson(HTTP_RESPONSE_CODE_OK, array(
    "stations" => $stations,
    "trains" => $trains
));
