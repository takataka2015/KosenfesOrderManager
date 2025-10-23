public class OrderFilePath
{
    const string filePlace = "../Controller/informationLog/";
    const string nowFileName = "OrderNow";
    const string requestFileName = "OrderClearRequest";

    public string Now { get; private set; } = filePlace + nowFileName + ".json";
    public string Request { get; private set; } = filePlace + requestFileName + ".json";
}
