<?php

$username  = $_COOKIE["username"];
$statement = $_POST["statement"];
$datetime  = date("YmdHis");


$resource = sqlite3_open("chat.db");

if($resource)
{
    $resultset = sqlite3_query($resource, "select count(*) from 'sqlite_master' where type='table' and name='statements'");

    if($resultset)
    {
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
    }
    if(($username != "") && ($statement != ""))
    {
        sqlite3_exec($resource, "insert into 'statements' (serial, username, statement, datetime) values (null, \"$username\", \"$statement\", \"$datetime\");");
    }
    sqlite3_close($resource);
}

?>