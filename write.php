<?php

$username     = $_COOKIE["username"];
$statement    = $_POST["statements"];
$datetime     = date("YmdHis");
$databasename = "chat";

if(( ! $username) || ($username == ""))
{
    echo "{ good: false, what: \"no username\" }";
    return;
}

if( ! mysql_connect())
{
    echo "{ good: false, what: \"cannot connect DBMS: ".mysql_error()."\" }";
    return;
}

if( ! mysql_select_db($databasename))
{
    echo "{ good: false, what: \"cannot select database: ".mysql_error()."\" }";
    mysql_close();
    return;
}

if(($username != "") && ($statement != ""))
{
    $query = "insert into statements (username, statement, datetime)".
             " values (\"$username\", \"$statement\", \"$datetime\");";
    if(mysql_query($resource, $query))
    {
        echo "{ good: true }";
    }
    else
    {
        echo "{ good: false, what: \"write error: ".mysql_error()."\" }";
    }
}

mysql_close();

?>