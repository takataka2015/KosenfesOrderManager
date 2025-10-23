using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEngine;

public class OrderManager : MonoBehaviour
{
    [SerializeField] GameObject orderTable;
    GameObject[] tables;
    OrderFilePath filePath = new();
    List<OrderTable> order = new();
    int count = 0;
    const int interval = 50;

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        ReadOrderJson();
        ClearRequest(1);
    }

    void FixedUpdate()
    {
        if (interval <= count)
        {
            ReadOrderJson();
            count = 0;
        }
        else
        {
            count++;
        }
    }


    int ClearRequest(int serial)
    {
        List<int> request = new();
        foreach (int serialJson in JsonUtility.FromJson<SerialJson>(File.ReadAllText(filePath.Request, System.Text.Encoding.UTF8)).serials)
        {
            request.Add(serialJson);
        }
        if (order.FindIndex(element => element.Serial == serial) != -1)
        {
            request.Add(serial);
            File.WriteAllText(filePath.Request, JsonUtility.ToJson(new SerialJson(request.ToArray())));
            return 0;
        }
        else
        {
            return 1;
        }
    }

    void ReadOrderJson()
    {
        foreach (OrderJson orderJson in JsonUtility.FromJson<Orders>(@"{""orders"":" + File.ReadAllText(filePath.Now, System.Text.Encoding.UTF8) + "}").orders)
        {
            order.Add(new OrderTable(orderJson.serial, orderJson.order));
        }
    }
}