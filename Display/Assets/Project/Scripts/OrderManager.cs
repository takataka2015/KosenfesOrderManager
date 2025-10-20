using System;
using System.IO;
using UnityEngine;

public class OrderManager : MonoBehaviour
{
    [SerializeField] GameObject orderTable;
    OrderFilePath filePath=new();
    GameObject[] tables;
    OrderTable[] order;

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        ReadOrderJson();
    }

    // Update is called once per frame
    void Update()
    {

    }

    void ReadOrderJson()
    {
        order=JsonUtility.FromJson<OrderTable[]>(File.ReadAllText(filePath.now, System.Text.Encoding.UTF8));
        Debug.Log(order);
    }
}