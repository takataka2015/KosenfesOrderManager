using System;
using System.IO;
using System.Linq;
using UnityEngine;

public class OrderManager : MonoBehaviour
{
    [SerializeField]
    GameObject requireTableObject;
    FilePath path = new();
    RequireTable requireTable;
    OrderTableObject[] orderObjects;
    Menu[] menus;

    int count = 0;
    const int interval = 25;

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Awake()
    {
        requireTable = requireTableObject.GetComponent<RequireTable>();
        orderObjects = transform.GetComponentsInChildren<OrderTableObject>();
        ReadMenuJson();
    }

    void Start()
    {
        ReadOrderJson();
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
        OrderJsonOrder[] orderJsons = JsonUtility.FromJson<OrderJson>(@"{""data"":" + File.ReadAllText(path.Now, System.Text.Encoding.UTF8) + "}").data;

        orderObjects.Zip(orderJsons, (orderObject, orderJson) => (Action)(() => orderObject.SetActive(orderJson, menus)))
        .Concat(orderObjects.Skip(orderJsons.Length).Select(orderObject => (Action)(() => orderObject.SetInActive())))
        .ToList().ForEach(function => function());

        requireTable.SetRequireTable(orderJsons,menus);
    }

    void ReadMenuJson()
    {
        menus = JsonUtility.FromJson<MenuJson>(File.ReadAllText(path.Menu, System.Text.Encoding.UTF8)).data
                        .Select((item, index) => new Menu(item, index)).ToArray();
    }
}