<?php

class HttpMethod
{
    public $is_post = false;
    public $is_get = false;
    public $is_put = false;
    public $is_delete = false;
    public $method;
    public $is_api = true;
    private $get_params = array();
    private $post_params = array();
    private $put_params = array();
    private $delete_params = array();

    /**
     * コンストラクタ
     */
    public function __construct() {
        $request_method = $_SERVER["REQUEST_METHOD"];
        $this->method = $request_method;
        $inputs = json_decode(file_get_contents("php://input"), true);
        switch ($request_method) {
            case "POST":
                $this->is_post = true;
                $this->post_params = $inputs ?? $_POST;
                break;
            case "PUT":
                $this->is_put = true;
                $this->put_params = json_decode(file_get_contents("php://input"), true);
                break;
            case "DELETE":
                $this->is_delete = true;
                $this->delete_params = json_decode(file_get_contents("php://input"), true);
                break;
            case "GET":
                $this->is_get = true;
                break;
        }
        $this->get_params = $_GET;
        $this->setIsHttpAccess();
    }

    /**
     * アクセス方法を設定
     */
    private function setIsHttpAccess() {
        $debug_backtrace = debug_backtrace();
        $file = str_replace("\\", "/", $debug_backtrace[count($debug_backtrace) - 1]["file"]);
        if (preg_match("/\/api\//", $file)) {
            $this->is_api = true;
            return;
        }
        $this->is_api = false;
    }

    /**
     * 使用されたHTTPメソッドを返却
     * @return string HTTPメソッド
     */
    public function getMethod() {
        return $this->method;
    }

    /**
     * 値を最適なものにキャスト
     * @param mixed param キャスト対象
     * @return mixed キャスト後
     */
    private function castParam($param) {
        if (is_null($param) || strlen($param) === 0) {
            return $param;
        }
        $param_int = filter_var($param, FILTER_VALIDATE_INT);
        if ($param_int !== false) {
            return $param_int;
        }
        $param_bool = filter_var($param, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if (!is_null($param_bool)) {
            return $param_bool;
        }
        return $param;
    }

    /**
     * key引数が指定されている場合、その値を返却
     * key引数が指定されていない場合、配列を返却
     * @param array param 配列
     * @param mixed key パラメータ
     * @return mixed
     */
    private function returnParam($param, $key = null) {
        if (is_null($key) || strlen($key) === 0) {
            return $param;
        }
        if (!array_key_exists($key, $param)) {
            return null;
        }
        return $this->castParam($param[$key]);
    }

    /**
     * GETパラメータを返却
     * @param mixed {key = null} パラメータのキー
     * @return mixed key引数が指定されている場合GETパラメータの指定値、key引数が指定されていない場合GETパラメータ全体
     */
    public function getParam($key = null) {
        return $this->returnParam($this->get_params, $key);
    }

    /**
     * POSTパラメータを返却
     * @param mixed {key = null} パラメータのキー
     * @return mixed key引数が指定されている場合POSTパラメータの指定値、key引数が指定されていない場合POSTパラメータ全体
     */
    public function postParam($key = null) {
        return $this->returnParam($this->post_params, $key);
    }

    /**
     * PUTパラメータを返却
     * @param mixed {key = null} パラメータのキー
     * @return mixed key引数が指定されている場合PUTパラメータの指定値、key引数が指定されていない場合PUTパラメータ全体
     */
    public function putParam($key = null) {
        return $this->returnParam($this->put_params, $key);
    }

    /**
     * DELETEパラメータを返却
     * @param mixed {key = null} パラメータのキー
     * @return mixed key引数が指定されている場合DELETEパラメータの指定値、key引数が指定されていない場合DELETEパラメータ全体
     */
    public function deleteParam($key = null) {
        return $this->returnParam($this->delete_params, $key);
    }
}
