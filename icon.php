<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>アイコン選択</title>

<link rel="stylesheet" href="./default.css" type="text/css" />

<style type="text/css">
img
{
    cursor: pointer;
}
</style>

<script type="text/javascript">

function cancelEvent(event)
{
    if(event.preventDefault)
    {
        event.preventDefault();
        event.stopPropagation();
    }
    else
    {
        event.returnValue = false;
        event.cancelBubble = true;
    }
}

function cancel(event)
{
    cancelEvent(event ? event : window.event);
    close();
}

function showURL(url)
{
    opener.setIconUrl(url);
    close();
}

window.onload = function ()
{
    document.getElementById("cancel").onclick = cancel;
};

</script>

</head>

<body id="body">

<a href="" id="cancel">キャンセル</a>

<table>
<?php

$handle = opendir("icon");
if($handle)
{
    $col = 0;
    echo "<tr>\n";
    while(($file = readdir($handle)) !== false)
    {
        if($file[0] != ".")
        {
            echo "<td style=\"padding: 10px\">".
                 "<img src=\"icon/$file\" onclick=\"showURL('icon/$file');\" />".
                 "</td>";
            ++$col;
            if($col == 8)
            {
                $col = 0;
                echo "</tr>\n<tr>";
            }
        }
    }
    echo "</tr>\n";
    closedir($handle);
}

?>
</table>

</body>

</html>
