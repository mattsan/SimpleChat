<?php

$username = $_COOKIE["username"];
$password = $_POST["password"];

if(( ! $username) || ($username == ""))
{
    echo "{ good: false, what: \"no username\" }";
    return;
}

if(( ! $password) || ($password == ""))
{
    echo "{ good: false, what: \"no password\" }";
    return;
}

$resource = sqlite3_open("account.db");

if( ! $resource)
{
    echo "{ good: false, what: \"account database open error\" }";
    return;
}

$resultset = sqlite3_query($resource, "select count(*) from 'sqlite_master' where type='table' and name='accounts';");

if($resultset)
{
    $a = sqlite3_fetch_array($resultset);
    if($a["count(*)"] == 0)
    {
        sqlite3_exec($resource, "create table 'accounts' (".
                                " username varchar2(30) primary key,".
                                " password varchar(140));");
    }
    sqlite3_query_close($resultset);
}

$resultset = sqlite3_query($resource, "select username, password from 'accounts' where username='$username';");
if($resultset)
{
    $a = sqlite3_fetch_array($resultset);
    sqlite3_query_close($resultset);

    if($a["username"] == "")
    {
        sqlite3_exec($resource, "insert into 'accounts' (username, password)".
                                " values (\"$username\", \"$password\");");
        echo "{ good: true, usename: \"$username\" }";
    }
    else if($a["password"] == $password)
    {
        echo "{ good: true }";
    }
    else
    {
        echo "{ good: false, what: \"$username - password unmatched\", username: \"$username\" }";
    }
}
else
{
    echo "{ good: false, what: \"no account table\" }";
}

sqlite3_close($resource);

?>