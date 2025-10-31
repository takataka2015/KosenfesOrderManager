#Requires AutoHotkey v2
CoordMode "Mouse", "Screen"

ClickCoordinates(targetX,targetY){
    MouseGetPos(&mouseX, &mouseY)
    MouseMove(targetX, targetY)
    WinActivate("ahk_exe KosenfesOrderManager.exe")    
    Click
    WinActivate("ahk_exe chrome.exe")
    MouseMove(mouseX, mouseY)
}

1::{
    ClickCoordinates(200,300)
}

2::{
    ClickCoordinates(500,300)
}

3::{
    ClickCoordinates(850,300)
}

4::{
    ClickCoordinates(1150,300)
}

5::{
    ClickCoordinates(1500,300)
}

6::{
    ClickCoordinates(200,800)
}

7::{
    ClickCoordinates(500,800)
}

8::{
    ClickCoordinates(850,800)
}

9::{
    ClickCoordinates(1150,800)
}

0::{
    ClickCoordinates(1500,800)
}

-::{
    ClickCoordinates(1800,1000)
}