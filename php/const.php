<?php

if (!defined("common")) {
    define("ROOT_DIR", __DIR__ ."/..");
    define("common", __DIR__ ."/common.php");
    define("Fetch", __DIR__ ."/Fetch.php");
    define("HttpMethod", __DIR__ ."/HttpMethod.php");

    define("EUC_JP", "EUC-JP");
    define("UTF_8", "UTF-8");

    /**
     * 200 OK
     */
    define("HTTP_RESPONSE_CODE_OK", 200);
    /**
     * 201 Created
     */
    define("HTTP_RESPONSE_CODE_CREATED", 201);
    /**
     * 204 NO Content
     */
    define("HTTP_RESPONSE_CODE_NO_CONTENT", 204);
    /**
     * 400 Bad Request
     */
    define("HTTP_RESPONSE_CODE_BAD_REQUEST", 400);
    /**
     * 401 Unauthorized
     */
    define("HTTP_RESPONSE_CODE_UNAUTHORIZED", 401);
    /**
     * 404 Not Found
     */
    define("HTTP_RESPONSE_CODE_NOT_FOUND", 404);
    /**
     * 405 Method Not Allowed
     */
    define("HTTP_RESPONSE_CODE_METHOD_NOT_ALLOWED", 405);
    /**
     * 500 Internal Server Error
     */
    define("HTTP_RESPONSE_CODE_INTERNAL_SERVER_ERROR", 500);
}
