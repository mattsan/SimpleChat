<?php

$username  = $_COOKIE["username"];
$statement = $_POST["statement"];
$datetime  = date("YmdHis");


$resource = sqlite3_open("chat.db");

if( ! $resource)
{
    echo "{ good: false, what: \"cannot open database\"}";
    return;
}

$resultset = sqlite3_query($resource, "select count(*) from 'sqlite_master' where type='table' and name='statements'");

if( ! $resultset)
{
    echo "{ good: false, what: \"".sqlite3_error($resouce)."\" }";
    sqlite3_close($resource);
    return;
}

$a = sqlite3_fetch_array($resultset);
if($a["count(*)"] == 0)
{
    sqlite3_exec($resource, "create table statements (".
                            " serial integer primary key,".
                            " username varchar2(30),".
                            " statement varchar(140),".
                            " datetime char(14) );");
}
sqlite3_query_close($resultset);

if(($username != "") && ($statement != ""))
{
    $result = sqlite3_exec($resource, "insert into 'statements' (serial, username, statement, datetime) values (null, \"$username\", \"$statement\", \"$datetime\");");
    if($result)
    {
        echo "{ good: true }";
    }
    else
    {
        echo "{ good: false, what: \"".sqlite3_error($resource)."\" }";
    }
}

sqlite3_close($resource);

?>