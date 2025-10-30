#Requires AutoHotkey v2
CoordMode "Mouse", "Screen"

ClickCoordinates(targetX,targetY){
    MouseGetPos(&mouseX, &mouseY)
    MouseMove(targetX, targetY)
    Sleep  1000
    MouseMove(mouseX, mouseY)
}

1::{
    ClickCoordinates(2100,300)
}

2::{
    ClickCoordinates(2400,300)
}

3::{
    ClickCoordinates(2700,300)
}

4::{
    ClickCoordinates(3000,300)
}

5::{
    ClickCoordinates(3300,300)
}

6::{
    ClickCoordinates(2100,800)
}

7::{
    ClickCoordinates(2400,800)
}

8::{
    ClickCoordinates(2700,800)
}

9::{
    ClickCoordinates(3000,800)
}

0::{
    ClickCoordinates(3300,800)
}