<?php

header("Content-type: text/plane; charset=utf-8");

$username    = $_COOKIE["username"];
$iconurl     = $_POST["iconurl"];
$mailaddress = $_POST["mailaddress"];

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
sqlite3_query_close($resultset);

$query = "update accounts set iconurl=\"$iconurl\", mailaddress=\"$mailaddress\" where username=\"$username\";";
if(sqlite3_exec($handle, $query))
{
    $username = mb_convert_encoding($username, "utf-8");
    echo "{ \"good\": true, \"username\": \"$username\", \"iconurl\": \"$iconurl\", \"mailaddress\": \"$mailaddress\" }";
}
else
{
    echo "{ \"good\": false, \"what\": \"update error: ".sqlite3_error($handle)."\" }";
}

sqlite3_close($handle);

?>
