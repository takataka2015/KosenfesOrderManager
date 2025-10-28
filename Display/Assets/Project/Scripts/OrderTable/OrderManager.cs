using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Unity.VisualScripting;
using UnityEngine;

public class OrderManager : MonoBehaviour
{
    FilePath path = new();
    OrderTableObject[] orderObjects;
    Menu[] menus;

    int count = 0;
    const int interval = 50;

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Awake()
    {
        orderObjects = transform.GetComponentsInChildren<OrderTableObject>();
        ReadMenuJson();
        ReadOrderJson();
    }

    void Start()
    {

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

    void ReadOrderJson()
    {
        
    }

    void ReadMenuJson()
    {
        menus = JsonUtility.FromJson<MenuJson>(File.ReadAllText(path.Menu, System.Text.Encoding.UTF8)).data
                        .Select((item, index) => new Menu(item, index)).ToArray();
    }
}