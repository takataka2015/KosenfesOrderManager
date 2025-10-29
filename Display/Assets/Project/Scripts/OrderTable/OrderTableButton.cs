using System.Collections.Generic;
using System.IO;
using System.Linq;
using DG.Tweening;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class OrderTableButton : MonoBehaviour,CustomButton
{
    [SerializeField] GameObject callingTableObject;
    public System.Action onClickCallback;
    FilePath path;
    CallingTable callingTable;
    Vector3 baseScale;
    int serial;
    
    GameObject buttonObject;
    Image buttonImage;
    bool isHover;

    public void Awake()
    {
        path = new();
        buttonObject = transform.parent.GetChild(0).gameObject;
        buttonImage = buttonObject.GetComponent<Image>();
        callingTable = callingTableObject.GetComponent<CallingTable>();
        baseScale = transform.localScale;
        isHover = false;
    }

    public void SetActive(int number)
    {
        serial = number;
        transform.localScale = baseScale;
    }

    public void SetInActive()
    {
        transform.localScale = Vector3.zero;
    }
    
    public void ClearRequest(int serial)
    {
        HashSet<int> request;
        request = JsonUtility.FromJson<SerialJson>(File.ReadAllText(path.Request, System.Text.Encoding.UTF8)).serials.ToHashSet();
        request.Add(serial);
        File.WriteAllText(path.Request, JsonUtility.ToJson(new SerialJson(request.ToArray())));
        callingTable.SetCallingNumber(serial);
    }

    void Hover()
    {
        isHover = true;
        buttonImage.DOColor(new Color(0.7f, 0.7f, 0.7f), 0.24f).SetEase(Ease.OutQuad);
    }

    void DeHover()
    {
        isHover = false;
        buttonObject.transform.DOScale(1f, 0.24f).SetEase(Ease.OutQuad);
        buttonImage.DOColor(new Color(0.5f, 0.5f, 0.5f), 0.24f).SetEase(Ease.OutQuad);
    }

    void Push()
    {
        buttonObject.transform.DOScale(0.95f, 0.24f).SetEase(Ease.InOutCubic);
        buttonImage.DOColor(new Color(0.4f, 0.4f, 0.4f), 0.24f).SetEase(Ease.InOutCubic);
    }

    void DePush()
    {
        buttonObject.transform.DOScale(1f, 0.24f).SetEase(Ease.InOutCubic);
        if (isHover)
        {
            buttonImage.DOColor(new Color(0.7f, 0.7f, 0.7f), 0.24f).SetEase(Ease.InOutCubic);
        }
    }

    public void OnPointerClick(PointerEventData eventData)
    {
        ClearRequest(serial);
    }

    public void OnPointerDown(PointerEventData eventData)
    {
        Push();
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        DePush();
    }

    public void OnPointerEnter(PointerEventData eventData)
    {
        Hover();
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        DeHover();
    }
}