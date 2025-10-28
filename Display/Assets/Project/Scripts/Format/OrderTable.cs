using System;
using System.Linq;

public class OrderTable
{
    public int Serial { get; private set; }
    public int CasherId { get; private set; }
    public int PaymentType { get; private set; }
    public long ReceptionTime { get; private set; }
    public Flag[] Order { get; private set; }

    public OrderTable(OrderJsonOrder orderJson)
    {
        Serial = orderJson.serial;
        CasherId = orderJson.casherId;
        PaymentType = orderJson.paymentType;
        ReceptionTime = orderJson.receptionTime;
        Order = orderJson.order;
    }
}

[Serializable]
public class OrderJson
{
    public OrderJsonOrder[] data;
}

[Serializable]
public class OrderJsonOrder
{
    public int serial;
    public int casherId;
    public int paymentType;
    public long receptionTime;
    public Flag[] order;
}

[Serializable]
public class Flag
{
    public int flag;

    public bool HasFlag(int number)
    {
        return number == (flag & number);
    }
}