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

$timetable_number_param = $http_method->getParam("timetable_number");
if (is_null($timetable_number_param)) {
    echoJson(HTTP_RESPONSE_CODE_BAD_REQUEST, array(
        "message" => "timetable_numberが正しく指定されていません。"
    ));
}

$timetables = array();
$train_ids = array();
$stations = array();
$station_name_ids = array();

$timetable_numbers = explode(',', $timetable_number_param);
foreach ($timetable_numbers as $timetable_number) {
    if (filter_var($timetable_number, FILTER_VALIDATE_INT) === false) {
        continue;
    }

    $timetable_stations = array();
    $timetable_trains_ids = array();

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
            $timetable_trains_ids[] = $id;
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
                    $station_id = (int)$m[1];
                    $station_name = $m[2];
                    $station = array(
                        "id" => $station_id,
                        "name" => $station_name
                    );
                    $timetable_stations[] = $station;
                    $stations[] = $station;
                    $station_name_ids[$station_name] = $station_id;
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
    $timetable_trains_ids = array_unique($timetable_trains_ids);

    $timetables[$timetable_number] = array(
        "stations" => $timetable_stations,
        "trains" => array()
    );
    foreach ($timetable_trains_ids as $train_id) {
        $timetables[$timetable_number]["trains"][] = array(
            "id" => $train_id
        );
    }
}
$train_ids = array_unique($train_ids);

$count = $http_method->getParam("count");
if ($count) {
    echoJson(HTTP_RESPONSE_CODE_OK, array(
        "count" => count($train_ids),
        "stations" => $stations
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
    $announce_number = null;
    $train_name = null;
    if ($m) {
        $type = trim($m[1]);
        preg_match("/([\s\S]+)\s(\d+)号$/", $type, $m);
        if ($m) {
            $type = trim($m[1]);
            $announce_number = (int)$m[2];
        }
        preg_match("", $type, $m);
        if ($m) {
            $type = $m[1];
            $train_name = $m[2];
        }
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

    preg_match("/<dd><strong>【運転日注意】<\/strong>/", $body, $m);
    $operate_day = array(
        "weekday" => true,
        "weekend" => true,
        "other" => false
    );
    if ($m) {
        preg_match("/<dd><strong>【運転日注意】<\/strong><br>(土曜・休日|平日)のみ運転/", $body, $m);
        if ($m) {
            $operate_day[$m[1] === "平日" ? "weekend" : "weekday"] = false;
        } else {
            $operate_day["other"] = true;
        }
    }

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
            $arr_time = null;
            preg_match("/^\d{1,4}$/", $m[2], $m2);
            if ($m2) {
                $arr_time = $m2[0];
            }
            $dep_time = null;
            preg_match("/^\d{1,4}$/", $m[3], $m2);
            if ($m2) {
                $dep_time = $m2[0];
            }
            $train_stations[] = array(
                "id" => $station_name_ids[$m[1]],
                "arrival_time" => $arr_time,
                "departure_time" => $dep_time,
                "platform" => $m[4] === "<BR>" ? null : $m[4]
            );
        }
    }

    $trains[] = array(
        "id" => (int)$train_id,
        "number" => $number,
        "type" => $type,
        "train_name" => $train_name,
        "announce_number" => $announce_number,
        "from" => $from,
        "to" => $to,
        "operate_day" => $operate_day,
        "stations" => $train_stations
    );

    // break;
}

$train_id_key = array();
foreach ($trains as $key => $train) {
    $train_id_key["{$train['id']}"] = $key;
}

foreach ($timetables as $timetable_number => $timetable) {
    foreach ($timetable["trains"] as $key => $train) {
        $timetables[$timetable_number]["trains"][$key] = $trains[$train_id_key[$train["id"]]];
    }
}

echoJson(HTTP_RESPONSE_CODE_OK, $timetables);
