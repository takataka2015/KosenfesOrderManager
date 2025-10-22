using System;

[Serializable]
public class SerialJson
{
    public int[] serials;
    
    public SerialJson(int[] requestSerials)
    {
        serials = requestSerials;
    }
}