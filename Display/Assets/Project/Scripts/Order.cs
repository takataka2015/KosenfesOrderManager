using System;

public class OrderFilePath
{
    const string filePlace = "../Controller/informationLog/";
    const string nowFileName = "OrderNow";
    const string requestFileName = "OrderClearRequest";

    public string Now { get; private set; } = filePlace + nowFileName + ".json";
    public string Request { get; private set; } = filePlace + requestFileName + ".json";
}

[Serializable]
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