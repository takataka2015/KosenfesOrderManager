using System;

public class Menu
{
    public string Item { get; private set; }
    public int Flag { get; private set; }

    public Menu(MenuJsonMenu menu, int index)
    {
        Item = menu.item;
        Flag = 2 ^ index;
    }
}

[Serializable]
public class MenuJson
{
    public MenuJsonMenu[] data;
}

[Serializable]
public class MenuJsonMenu
{
    public string item;
}