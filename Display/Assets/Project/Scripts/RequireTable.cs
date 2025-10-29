using System.Collections.Generic;
using System.Linq;
using TMPro;
using UnityEngine;

public class RequireTable : MonoBehaviour
{
    TextMeshProUGUI requireText;
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        requireText = transform.GetChild(0).GetChild(1).GetComponent<TextMeshProUGUI>();
    }
    
    public void SetRequireTable(OrderJsonOrder[] orderJsons,Menu[] menus)
    {
        /*
        List<string> items = new();
        orderJsons.ToList().ForEach(orderJson => orderJson.order.ToList().ForEach(order => menus
                                       .Where(menu => order.HasFlag(menu.Flag))
                                       .ToList().ForEach(menu => items.Add(menu.Item))));
        requireText.text = string.Join("\n", );
        */
    }
}
