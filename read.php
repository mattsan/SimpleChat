<?php

$greater      = $_POST["greater"];
$less         = $_POST["less"];
$count        = $_POST["count"];
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

$query = "select serial, statements.username, statement, datetime, iconurl".
         "  from statements natural left join accounts";
if($greater && $less)
{
    $query .= " where (serial < $less) and ($greater < serial)";
}
else if($greater)
{
    $query .= " where ($greater < serial)";
}
else if($less)
{
    $query .= " where (serial < $less)";
}

$query .= " order by serial desc";
if($count)
{
    $query .= " limit 0, $count";
}
$query .= ";";

$resultset = mysql_query($query);
if()
{
    echo "{ good: true, statements: [";
    while($a = mysql_fetch_assoc($resultset))
    {
        echo "{ serial    : \"$a[serial]\",".
             "  username  : \"$a[username]\",".
             "  statement : \"$a[statement]\",".
             "  datetime  : \"$a[datetime]\",".
             "  iconurl   : \"$a[iconurl]\"".
             "},\n";
    }
    mysql_free_result($resultset);
    echo "] }";
}
else
{
    echo "{ good: false, what: \"read statements error: ".mysql_error()."\" }";
}

mysql_close();

?>