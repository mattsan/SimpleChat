<?php

$username     = $_COOKIE["username"];
$iconurl      = $_POST["iconurl"];
$mailaddress  = $_POST["mailaddress"];
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

$query = "update accounts set iconurl=\"$iconurl\", mailaddress=\"$mailaddress\" where username=\"$username\";";
if(mysql_query($query))
{
    echo "{ good: true, username: \"$username\", iconurl: \"$iconurl\", mailaddress: \"$mailaddress\" }";
}
else
{
    echo "{ good: false, what: \"update error: ".mysql_error()."\" }";
}

mysql_close();

?>