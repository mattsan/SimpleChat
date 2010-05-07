<?php

header("Content-type: text/plane; charset=utf-8");

$username  = $_COOKIE["username"];
$statement = $_POST["statement"];
$datetime  = date("YmdHis");

$handle = sqlite3_open("chat.db");

if( ! $handle)
{
    echo "{ \"good\": false, \"what\": \"cannot open database: ".sqlite3_error($handle)."\"}";
    return;
}

$query = "select count(*) from sqlite_master where type=\"table\" and name=\"statements\"";
$resultset = sqlite3_query($handle, $query);

if( ! $resultset)
{
    echo "{ \"good\": false, \"what\": \"".sqlite3_error($handle)."\" }";
    sqlite3_close($handle);
    return;
}

$a = sqlite3_fetch_array($resultset);
sqlite3_query_close($resultset);

if($a["count(*)"] == 0)
{
    $query = "create table statements (".
             " serial integer not null primary key,".
             " username varchar(50),".
             " statement varchar(255),".
             " datetime char(14) );";
    if( ! sqlite3_exec($handle, $query))
    {
        echo "{ \"good\": false, \"what\": \"".sqlite3_error($handle)."\" }";
        sqlite3_close($handle);
        return;
    }
}

if(($username != "") && ($statement != ""))
{
    $query = "insert into statements (username, statement, datetime)".
             "  values (\"$username\", \"$statement\", \"$datetime\");";
    $result = sqlite3_exec($handle, $query);
    if($result)
    {
        echo "{ \"good\": true }";
        $addresses = array();
        $serial    = 0;

        $query     = "select distinct mailaddress from accounts where mailaddress<>\"\";";
        $resultset = sqlite3_query($handle, $query);
        if($resultset)
        {
            while($a = sqlite3_fetch_array($resultset))
            {
                array_push($addresses, $a["mailaddress"]);
            }
            sqlite3_query_close($resultset);
        }

        $query     = "select max(serial) from statements;";
        $resultset = sqlite3_query($handle, $query);
        if($resultset)
        {
            $a = sqlite3_fetch_array($resultset);
            $serial = $a["max(serial)"];
            sqlite3_query_close($resultset);
        }

        if(count($addresses) > 0)
        {
            $subject  = sprintf("[chat:%08d] %s said...", $serial, mb_convert_encoding($username, "ISO-2022-JP"));
            $subject  = mb_encode_mimeheader($subject);
            $additionalMessage = "(this message send from chat site http://xxx.xxx.xxx.xxx/ )";
            $mailbody = sprintf("%s > %s - (No.%08d - %s)\n\n%s\n",
                                $username,
                                $statement,
                                $serial,
                                date("Y/m/d-H:i:s"),
                                $additionalMessage);
            $mailbody = mb_convert_encoding($mailbody, "ISO-2022-JP");

            mail(join($addresses, ","), $subject, $mailbody);
        }
    }
    else
    {
        echo "{ \"good\": false, \"what\": \"write error: ".sqlite3_error($handle)."\" }";
    }
}

sqlite3_close($handle);

?>
