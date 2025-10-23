using System;

public class OrderTable
{
    public int Serial { get; private set; }
    public int[] Order { get; private set; }

    public OrderTable(int serial, int[] order)
    {
        Serial = serial;
        Order = order;
    }
}

[Serializable]
public class Orders
{
    public OrderJson[] orders;
}

[Serializable]
public class OrderJson
{
    public int serial;
    public Flag[] order;
}

[Serializable]
public class Flag
{
    public int flag;
}