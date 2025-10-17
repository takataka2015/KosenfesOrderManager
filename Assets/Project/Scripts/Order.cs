public class Order
{
    int[] order;
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