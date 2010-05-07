<?php

header("Content-type: text/plane; charset=utf-8");

$username = $_COOKIE["username"];
$password = $_POST["password"];
$databasename = "chat";


if(( ! $username) || ($username == ""))
{
    echo "{ \"good\": false, \"what\": \"no username\" }";
    return;
}

if(( ! $password) || ($password == ""))
{
    echo "{ \"good\": false, \"what\": \"no password\" }";
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

$query = "select username, password, iconurl, mailaddress from accounts where username=\"$username\";";
$resultset = mysql_query($query);
if($resultset)
{
    $a = mysql_fetch_assoc($resultset);
    mysql_free_result($resultset);

    if($a["username"] == "")
    {
        $today = date("YmdHis");
        $query = "insert into accounts (username, password, iconurl, mailaddress, established)".
                 "  values (\"$username\", \"$password\", \"\", \"\", \"$today\");";
        if(mysql_query($query))
        {
            $username = mb_convert_encoding($username, "utf-8");
            echo "{ \"good\": true, \"usename\": \"$username\", \"iconurl\": \"\", mailaddress: \"\"  }";
        }
        else
        {
            echo "{ \"good\": false, \"what\": \"insert error: ".mysql_error()."\" }";
        }
    }
    else if($a["password"] == $password)
    {
        $username = mb_convert_encoding($a["username"], "utf-8");
        echo "{ \"good\": true, \"usename\": \"$username\", \"iconurl\": \"$a[iconurl]\", \"mailaddress\": \"$a[mailaddress]\"  }";
    }
    else
    {
        $username = mb_convert_encoding($username, "utf-8");
        echo "{ \"good\": false, \"what\": \"$username - password unmatched\", \"username\": \"$username\" }";
    }
}
else
{
    echo "{ \"good\": false, \"what\": \"no account table: ".mysql_error()."\" }";
}

mysql_close();

?>
