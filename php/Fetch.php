<?php

/**
 * Fetch実行
 * @param string $url URL
 * @param array $options [$options = array()] オプション
 * @param object レスポンス
 */
function fetch($url, $options = array()) {
    $fetch = new Fetch($url, $options);
    return $fetch->getResponse();
}

class Fetch
{
    private $url;
    private $options = array();

    private $method = "GET";
    private $body;
    private $headers = array();

    private $fetch_response;

    /**
     * Fetch コンストラクタ
     * @param string $url URL
     * @param array $options [array $options = array()] オプション
     */
    public function __construct($url, $options = array()) {
        $this->url = $url;

        foreach ($options as $key => $value) {
            $key_lower = strtolower($key);
            switch ($key_lower) {
                case "method":
                    $this->setMethod($value);
                    break;
                case "body":
                    $this->body = $value;
                    break;
                case "headers":
                    $this->headers = $value;
                    break;
                case "cookie":
                    $this->cookie = $value;
                    break;
            }
        }

        switch ($this->method) {
            case "GET":
                $this->getCurl();
                break;
            case "POST":
                $this->postCurl();
                break;
            case "PUT":
                break;
            case "DELETE":
                // $this->deleteCurl();
                break;
        }
    }

    /**
     * HTTPメソッドを設定
     * @param string $value [string $value = null] HTTPメソッド
     */
    private function setMethod($value = null) {
        $value_upper = strtoupper($value);
        switch ($value_upper) {
            case "POST":
                $this->method = "POST";
                return;
            case "PUT":
                $this->method = "PUT";
                return;
            case "DELETE":
                $this->method = "DELETE";
                return;
            default:
                $this->method = "GET";
                return;
        }
    }

    /**
     * GET実行
     */
    private function getCurl() {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $this->url);
        if (count($this->headers) !== 0) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, $this->headers);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_COOKIEFILE, "");

        $response = curl_exec($curl);
        $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $this->fetch_response = new FetchResponse($curl, $response);
        curl_close($curl);
    }

    /**
     * POST実行
     */
    private function postCurl() {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $this->url);
        curl_setopt($curl, CURLOPT_POST, true);
        if (count($this->headers) !== 0) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, $this->headers);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        if (is_array($this->body)) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($this->body));
        } else {
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($this->body));
        }

        $response = curl_exec($curl);
        $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $this->fetch_response = new FetchResponse($curl, $response);
        curl_close($curl);
    }

    /**
     * DELETE実行
     */
    private function deleteCurl() {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $this->url);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
        if (count($this->headers) !== 0) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, $this->headers);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_COOKIEFILE, "");

        $response = curl_exec($curl);
        $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $this->fetch_response = new FetchResponse($curl, $response);
        curl_close($curl);
    }

    /**
     * Fetch結果を返却
     * @return object レスポンス
     */
    public function getResponse() {
        return $this->fetch_response;
    }
}

class FetchResponse
{
    private $body;
    // public $headers;
    public $ok;
    public $redirected;
    public $status;
    // public $statusText;
    public $url;
    public $info;

    /**
     * FetchResponse コンストラクタ
     * @param object $curl Curl
     * @param object $response Curl結果
     */
    public function __construct($curl, $response) {
        // $header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
        // $header = substr($response, 0, $header_size);
        // $body = substr($response, $header_size);

        $this->body = $response;
        // $this->headers = $header;
        $this->status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $this->ok = 200 <= $this->status && $this->status < 300;
        $this->redirected = 300 <= $this->status && $this->status < 400;
    }

    /**
     * 結果をそのまま返却
     * @return string Curl結果
     */
    public function blob() {
        return $this->body;
    }

    /**
     * 結果をJSON形式で返却
     * @return string Curl結果(JSON)
     */
    public function json() {
        return json_decode($this->body, true);
    }
}
