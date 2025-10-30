using System.Linq;
using TMPro;
using UnityEngine;

public class OrderTableObject : MonoBehaviour
{
    public ButtonText text;
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
        button.SetActive(orderJson.serial);
        text.header.text = string.Format("No.{0:0000}", orderJson.serial);
        text.body.text = string.Join("\n-------------------\n",
                        orderJson.order.Select(order => "焼うどん\n" + string.Join("\n", menus
                                       .Where(menu => order.HasFlag(menu.Flag))
                                       .Select(menu => $"  --{menu.Item}"))));
    }

    public void SetInActive()
    {
        button.SetInActive();
        text.header.text = "";
        text.body.text = "";
    }
}

public class ButtonText
{
    public TextMeshProUGUI header;
    public TextMeshProUGUI body;

    public ButtonText(Transform transform)
    {
        header = transform.GetChild(0).GetChild(0).GetComponent<TextMeshProUGUI>();
        body = transform.GetChild(0).GetChild(1).GetComponent<TextMeshProUGUI>();
    }
}