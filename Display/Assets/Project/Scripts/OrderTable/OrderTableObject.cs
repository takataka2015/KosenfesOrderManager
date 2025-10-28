using System.Collections.Generic;
using System.IO;
using System.Linq;
using TMPro;
using Unity.VisualScripting;
using UnityEngine;

public class OrderTableObject : MonoBehaviour
{
    FilePath path;
    ButtonText text;
    OrderTableButton button;

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Awake()
    {
        text = new(transform);
        button = transform.GetChild(1).GetComponent<OrderTableButton>();
    }

    // Update is called once per frame
    void Update()
    {

    }

    public void SetActive(OrderJsonOrder orderJson, Menu[] menus)
    {
        Debug.Log(true);
        text.header.text = string.Format("No.{0:0000}", orderJson.serial);
        text.body.text = string.Join("\n-------------------\n",
                        orderJson.order.Select(order => string.Join("\n", menus
                                       .Where(menu => order.HasFlag(menu.Flag))
                                       .Select(menu => $"  --{menu.Item}"))));
    }

    public void SetInActive()
    {
        text.header.text = "";
        text.body.text = "";
    }

    public void ClearRequest(int serial)
    {
        List<int> request = new();
        foreach (int serialJson in JsonUtility.FromJson<SerialJson>(File.ReadAllText(path.Request, System.Text.Encoding.UTF8)).serials)
        {
            request.Add(serialJson);
        }
        request.Add(serial);
        File.WriteAllText(path.Request, JsonUtility.ToJson(new SerialJson(request.ToArray())));
    }
}

class ButtonText
{
    public TextMeshProUGUI header;
    public TextMeshProUGUI body;

    public ButtonText(Transform transform)
    {
        header = transform.GetChild(0).GetChild(0).GetComponent<TextMeshProUGUI>();
        body = transform.GetChild(0).GetChild(1).GetComponent<TextMeshProUGUI>();
    }
}