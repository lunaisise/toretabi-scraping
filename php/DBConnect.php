<?php

define("CONNECTION_ERROR", "データベースへの接続に失敗しました。");
define("SELECT_ERROR", "データの取得に失敗しました。");
define("INSERT_ERROR", "データの追加に失敗しました。");
define("UPDATE_ERROR", "データの更新に失敗しました。");
define("DELETE_ERROR", "データの削除に失敗しました。");

class DBConnect {
    private $pdo;
    private $error_url;
    private $directory;
    
    /**
     * コンストラクタ
     * @param array パラメーター
     *     db_type string データベースタイプ
     *     host string ホスト名
     *     port string ポート番号
     *     db_name string データベース名
     *     user string ユーザー名
     *     password string パスワード
     *     options array PDOオプション
     *     error_message string エラー時にセッションに保存されるメッセージ
     *     error_url string エラー時の移動先
     *     log_directory string ログファイルの保存ディレクトリ
     */
    public function __construct($params = "") {
        $db_type = "pgsql";
        $host = "localhost";
        $port = "5432";
        $db_name = "postgres";
        $user = "postgres";
        $password = "";
        $options = array(
            PDO::ATTR_CASE => PDO::CASE_NATURAL,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_ORACLE_NULLS => PDO::NULL_NATURAL,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        );
        $error_message = CONNECTION_ERROR;
        $error_url = dirname(__FILE__) ."error.php";
        $log_directory = dirname(__FILE__) ."/logs";
        if (is_array($params)) {
            foreach ($params as $key => $value) {
                $$key = $value;
            }
        }
        if (!is_array($options) || count($options) == 0) {
            $options = array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC);
        }
        $this->error_url = $error_url;
        $this->directory = $log_directory;
        
        if ($db_type === "sqlite") {
            $dsn = "{$db_type}:{$host}";
        } else {
            $dsn = "{$db_type}:host={$host};port={$port};dbname={$db_name}";
        }
        try {
            $this->pdo = new PDO($dsn, $user, $password, $options);
        } catch (PDOException $e) {
            $this->errorProcess($e, "Connection", $error_message);
            throw new Exception;
        }
    }
    
    /**
     * エラーログ記述
     * @param string $error エラー文言
     */
    private function errorOccurred($error) {
        $date = date("Ymd");
        $now = date("Y-m-d H:i");
        error_log($now ." | ERROR: " .$error ."\n", 3, "{$this->directory}/{$date}.log");
    }
    
    /**
     * エラー処理
     * @param object $e PDOException
     * @param string $when_error どの段階でエラーが発生したか
     * @param string $error_message エラー時にセッションに保存されるメッセージ
     */
    private function errorProcess($e, $when_error, $error_message) {
        $error = $when_error ." Failed: " .$e->getMessage();
        $this->errorOccurred($error);
        var_dump($e);
        die();
        session_start();
        $_SESSION["error_message"] = $error_message;
        header("location: {$this->error_url}");
//        header('Content-Type: text/plain; charset=UTF-8', true, 500);
        die();
    }
    
    /**
     * SELECT文実行
     * @param string $sql SELECT文
     * @param string or array [$statements = "データの取得に失敗しました。"] プリペアドステートメントを使わない場合はエラー文言、使う場合はプリペアドステートメント配列
     * @param string [$error_message = "データの取得に失敗しました。"] エラー時にセッションに保存されるメッセージ
     * @return array データ取得結果連想配列
     */
    public function select($sql, $statements = SELECT_ERROR, $error_message = SELECT_ERROR) {
        try {
            if (is_array($statements)) {
                return $this->pdoQueryPrepare($sql, $statements, $error_message);
            }
            $error_message = $statements;
            return $this->pdoQuery($sql, $error_message);
        } catch (Exception $e) {
            throw new Exception;
        }
    }
    
    /**
     * SQL実行 SELECT文 SQLのみ
     * @param string $sql SELECT文
     * @param string $error_message エラー時にセッションに保存されるメッセージ
     * @return array データ取得結果連想配列
     */
    public function pdoQuery($sql, $error_message) {
        $pdo = $this->pdo;
        try {
            $stmt = $pdo->query($sql);
            return $stmt->fetchAll();
            // return $stmt;
        } catch (PDOException $e) {
            $this->errorProcess($e, "SELECT", $error_message);
            throw new Exception;
        }
    }
    
    /**
     * SQL実行 SELECT文 プレースホルダとプリペアドステートメント
     * @param string $sql プレースホルダ入りSQL
     * @param array $statements プリペアドステートメント
     * @param string $error_message エラー時にセッションに保存されるメッセージ
     * @return array データ取得結果連想配列
     */
    public function pdoQueryPrepare($sql, $statements, $error_message) {
        $pdo = $this->pdo;
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($statements);
            return $stmt->fetchAll();
            // return $stmt;
        } catch (PDOException $e) {
            $this->errorProcess($e, "SELECT", $error_message);
            throw new Exception;
        }
    }
    
    /**
     * INSERT文実行
     * @param string $sql INSERT文
     * @param string or array [$statements = INSERT_ERROR] プリペアドステートメントを使わない場合はエラー文言、使う場合はプリペアドステートメント配列
     * @param string [$error_message = INSERT_ERROR] エラー時にセッションに保存されるメッセージ
     * @return integer 最後にインサートした行のSERIAL値
     */
    public function insert($sql, $statements = INSERT_ERROR, $error_message = INSERT_ERROR) {
        $pdo = $this->pdo;
        $pdo->beginTransaction();
        try {
            if (is_array($statements)) {
                $stmt = $pdo->prepare($sql);
                foreach ($statements as $statement) {
                    $stmt->execute($statement);
                }
            } else {
                $pdo->exec($sql);
            }
            $last_insert_id = $pdo->lastInsertId();
            $pdo->commit();
            return $last_insert_id;
        } catch (PDOException $e) {
            $pdo->rollBack();
            $this->errorProcess($e, "INSERT", $error_message);
            throw new Exception;
        }
    }
    
    /**
     * INSERT文実行
     * @param string $sql INSERT文
     * @param string or array [$statements = UPDATE_ERROR] プリペアドステートメントを使わない場合はエラー文言、使う場合はプリペアドステートメント配列
     * @param string [$error_message = UPDATE_ERROR] エラー時にセッションに保存されるメッセージ
     * @return boolean true 成功
     */
    public function insertReturnBool($sql, $statements = INSERT_ERROR, $error_message = INSERT_ERROR) {
        try {
            if (is_array($statements)) {
                return $this->pdoExecPrepare($sql, $statements, $error_message, "INSERT");
            }
            $error_message = $statements;
            return $this->pdoExec($sql, $error_message, "INSERT");
        } catch (Exception $e) {
            throw new Exception;
        }
    }
    
    /**
     * UPDATE文実行
     * @param string $sql UPDATE文
     * @param string or array [$statements = UPDATE_ERROR] プリペアドステートメントを使わない場合はエラー文言、使う場合はプリペアドステートメント配列
     * @param string [$error_message = UPDATE_ERROR] エラー時にセッションに保存されるメッセージ
     * @return boolean true 成功
     */
    public function update($sql, $statements = UPDATE_ERROR, $error_message = UPDATE_ERROR) {
        try {
            if (is_array($statements)) {
                return $this->pdoExecPrepare($sql, $statements, $error_message, "UPDATE");
            }
            $error_message = $statements;
            return $this->pdoExec($sql, $error_message, "UPDATE");
        } catch (Exception $e) {
            throw new Exception;
        }
    }
    
    /**
     * DELETE文実行
     * @param string $sql DELETE文
     * @param string or array [$statements = DELETE_ERROR] プリペアドステートメントを使わない場合はエラー文言、使う場合はプリペアドステートメント配列
     * @param string [$error_message = DELETE_ERROR] エラー時にセッションに保存されるメッセージ
     * @return boolean true 成功
     */
    public function delete($sql, $statements = DELETE_ERROR, $error_message = DELETE_ERROR) {
        try {
            if (is_array($statements)) {
                return $this->pdoExecPrepare($sql, $statements, $error_message, "DELETE");
            }
            $error_message = $statements;
            return $this->pdoExec($sql, $error_message, "DELETE");
        } catch (Exception $e) {
            throw new Exception;
        }
    }
    
    /**
     * SQL実行 UPDATE文 or DELETE文 SQLのみ
     * @param string $sql INSERT文 or UPDATE文 or DELETE文
     * @param string $error_message エラー時にセッションに保存されるメッセージ
     * @param string [$exec_type = "Exec"] SQLのタイプ
     * @return boolean true 成功
     */
    public function pdoExec($sql, $error_message, $exec_type = "EXEC") {
        $pdo = $this->pdo;
        $pdo->beginTransaction();
        try {
            $pdo->exec($sql);
            return $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $this->errorProcess($e, $exec_type, $error_message);
            throw new Exception;
        }
    }
    
    /**
     * SQL実行 UPDATE文 or DELETE文 プレースホルダとプリペアドステートメント
     * @param string $sql プレースホルダ入りSQL
     * @param array $statements プリペアドステートメント
     * @param string $error_message エラー時にセッションに保存されるメッセージ
     * @param string [$exec_type = "Exec"] SQLのタイプ
     * @return boolean true 成功
     */
    public function pdoExecPrepare($sql, $statements, $error_message, $exec_type = "EXEC") {
        $pdo = $this->pdo;
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare($sql);
            foreach ($statements as $statement) {
                $stmt->execute($statement);
            }
            return $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $this->errorProcess($e, $exec_type, $error_message);
            throw new Exception;
        }
    }
}
