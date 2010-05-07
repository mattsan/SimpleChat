<?php

header("Content-type: text/plane; charset=utf-8");

$username  = $_COOKIE["username"];
$statement = $_POST["statement"];
$datetime  = date("YmdHis");
$databasename = "chat";

if(( ! $username) || ($username == ""))
{
    echo "{ \"good\": false, \"what\": \"no username\" }";
    return;
}

if( ! mysql_connect())
{
    echo "{ \"good\": false, \"what\": \"cannot connect DBMS: ".mysql_error()."\" }";
    return;
}

if( ! mysql_select_db($databasename))
{
    echo "{ \"good\": false, \"what\": \"cannot select database: ".mysql_error()."\" }";
    mysql_close();
    return;
}

if(($username != "") && ($statement != ""))
{
    $query = "insert into statements (username, statement, datetime)".
             "  values (\"$username\", \"$statement\", \"$datetime\");";
    $result = mysql_query($query);
    if($result)
    {
        echo "{ \"good\": true }";
        $addresses = array();
        $serial    = 0;

        $query     = "select distinct mailaddress from accounts where mailaddress<>\"\";";
        $resultset = mysql_query($query);
        if($resultset)
        {
            while($a = mysql_fetch_assoc($resultset))
            {
                array_push($addresses, $a["mailaddress"]);
            }
            mysql_free_result($resultset);
        }

        $query     = "select max(serial) from statements;";
        $resultset = mysql_query($query);
        if($resultset)
        {
            $a = mysql_fetch_assoc($resultset);
            $serial = $a["max(serial)"];
            mysql_free_result($resultset);
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
        echo "{ \"good\": false, \"what\": \"write error: ".mysql_error()."\" }";
    }
}

mysql_close();

?>
