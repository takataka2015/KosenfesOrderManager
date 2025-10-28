using System.IO;

public class FilePath
{
    const string filePlace = "../Controller/informationLog";
    
    public string Now { get; private set; }
        =Path.Combine(filePlace, "OrderNow.json");
    public string Request { get; private set; }
        = Path.Combine(filePlace, "OrderClearRequest.json");
    public string Menu { get; private set; }
        = Path.Combine(filePlace, "Config", "menuConfig.json");
}