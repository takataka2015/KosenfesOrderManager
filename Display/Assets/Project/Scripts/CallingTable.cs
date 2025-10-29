using TMPro;
using UnityEngine;

public class CallingTable : MonoBehaviour
{
    TextMeshProUGUI callingNumber;
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        callingNumber = transform.GetChild(2).GetChild(0).GetComponent<TextMeshProUGUI>();
    }
    
    public void SetCallingNumber(int serial)
    {
        callingNumber.text = $"{serial}";
    }
}
