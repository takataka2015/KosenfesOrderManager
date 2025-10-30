using System.Linq;
using TMPro;
using UnityEngine;

public class RequireTable : MonoBehaviour
{
    TextMeshProUGUI requireText;
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Awake()
    {
        requireText = transform.GetChild(0).GetChild(1).GetComponent<TextMeshProUGUI>();
    }

    public void SetRequireTable(OrderJsonOrder[] orderJsons, Menu[] menus)
    {
        requireText.text = string.Join("\n", orderJsons.SelectMany(orderJson => orderJson.order)
                                 .SelectMany(order => menus.Where(menu => order.HasFlag(menu.Flag)).Select(menu => menu.Item))
                                 .GroupBy(itemGroups => itemGroups).Select(itemGroups => $"{itemGroups.Key}×{itemGroups.Count()}"));
    }
}
