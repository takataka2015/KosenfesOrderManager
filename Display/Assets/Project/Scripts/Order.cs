public class OrderTable
{
    public int Serial { get; private set; }
    public int[] Order { get; private set; }

    public OrderTable(int number, int[] array)
    {
        Serial = number;
        Order = array;
    }
}

public class ToppingFlag
{
    public const int Seafood = 2;
    public const int Meat = 3;
    public const int Vegetable = 5;
    public const int Cheese = 7;
    int current;

    ToppingFlag(int order)
    {
        current = order;
    }

    public bool HasFlag(int flag)
    {
        return current % flag == 0;
    }
}