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

$handle = sqlite3_open("chat.db");

if( ! $handle)
{
    echo "{ good: false, what: \"account database open error: ".sqlite3_error($handle)."\" }";
    return;
}

$query = "select count(*) from sqlite_master where type=\"table\" and name=\"accounts\";";
$resultset = sqlite3_query($handle, $query);

if($resultset)
{
    $a = sqlite3_fetch_array($resultset);
    sqlite3_query_close($resultset);

    if($a["count(*)"] == 0)
    {
        $query = "create table accounts (".
                 "  username    varchar(50) primary key,".
                 "  password    varchar(100),".
                 "  iconurl     varchar(100),".
                 "  mailaddress varchar(100)".
                 ");";
        if( ! sqlite3_exec($handle, $query))
        {
            echo "{ good: false, what: \"cannnot create account table: ".sqlite3_error($handle)."\"}";
            sqlite3_close($handle);
            return;
        }
    }
}

$query = "select username, password, iconurl, mailaddress from accounts where username=\"$username\";";
$resultset = sqlite3_query($handle, $query);
if($resultset)
{
    $a = sqlite3_fetch_array($resultset);
    sqlite3_query_close($resultset);

    if($a["username"] == "")
    {
        $query = "insert into accounts (username, password, iconurl, mailaddress)".
                 "  values (\"$username\", \"$password\", \"\", \"\");";
        if(sqlite3_exec($handle, $query))
        {
            echo "{ good: true, usename: \"$username\", iconurl: \"\", mailaddress: \"\"  }";
        }
        else
        {
            echo "{ good: false, what: \"insert error: ".sqlite3_error($handle)."\" }";
        }
    }
    else if($a["password"] == $password)
    {
        echo "{ good: true, usename: \"$a[username]\", iconurl: \"$a[iconurl]\", mailaddress: \"$a[mailaddress]\"  }";
    }
    else
    {
        echo "{ good: false, what: \"$username - password unmatched\", username: \"$username\" }";
    }
}
else
{
    echo "{ good: false, what: \"no account table: ".sqlite3_error($handle)."\" }";
}

sqlite3_close($handle);

?>