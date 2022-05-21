<?php

function echoJson($response_code = 200, $body = null) {
    header("content-type: application/json; charset=utf-8");
    if (PHP_VERSION_ID < 50400) {
        header("http", true, $response_code);
    } else {
        http_response_code($response_code);
    }
    if (200 !== $response_code) {
        die();
    }
    if (!is_array($body)) {
        $body = array(
            "message" => $body
        );
    }
    echo json_encode($body);
    die();
}
