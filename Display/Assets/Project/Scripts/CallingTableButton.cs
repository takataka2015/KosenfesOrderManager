using TMPro;
using DG.Tweening;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class CallingTableButton : MonoBehaviour, ICustomButton
{
    public System.Action onClickCallback;
    TextMeshProUGUI callingNumber;
    Vector3 baseScale;

    GameObject buttonObject;
    Image buttonImage;
    bool isHover;

    public void Awake()
    {
        buttonObject = transform.parent.GetChild(0).gameObject;
        buttonImage = buttonObject.GetComponent<Image>();
        callingNumber = transform.parent.GetChild(0).GetChild(0).GetComponent<TextMeshProUGUI>();
        baseScale = transform.localScale;
        isHover = false;
        onClickCallback = () => Served();
        SetInActive();
    }

    public void SetCallingNumber(int serial)
    {
        callingNumber.text = $"{serial}";
        SetActive();
    }

    void Served()
    {
        callingNumber.text = "";
        SetInActive();
    }

    public void SetActive()
    {
        transform.localScale = baseScale;
    }

    public void SetInActive()
    {
        transform.localScale = Vector3.zero;
    }

    void Hover()
    {
        isHover = true;
        buttonImage.DOColor(new Color(1f, 1f, 1f, 1f), 0.24f).SetEase(Ease.OutQuad);
    }

    void DeHover()
    {
        isHover = false;
        buttonObject.transform.DOScale(1f, 0.24f).SetEase(Ease.OutQuad);
        buttonImage.DOColor(new Color(1f, 1f, 1f, 0.7f), 0.24f).SetEase(Ease.OutQuad);
    }

    void Push()
    {
        buttonObject.transform.DOScale(0.95f, 0.24f).SetEase(Ease.InOutCubic);
        buttonImage.DOColor(new Color(0.8f, 0.8f, 0.8f, 0.6f), 0.24f).SetEase(Ease.InOutCubic);
    }

    void DePush()
    {
        buttonObject.transform.DOScale(1f, 0.24f).SetEase(Ease.InOutCubic);
        if (isHover)
        {
            buttonImage.DOColor(new Color(1f, 1f, 1f, 0.7f), 0.24f).SetEase(Ease.InOutCubic);
        }
    }

    public void OnPointerClick(PointerEventData eventData)
    {
        onClickCallback.Invoke();
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
