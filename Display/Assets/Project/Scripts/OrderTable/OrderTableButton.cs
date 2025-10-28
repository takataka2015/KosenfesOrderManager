using DG.Tweening;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class OrderTableButton : MonoBehaviour,CustomButton
{
    public System.Action onClickCallback;
    GameObject buttonObject;
    Image buttonImage;
    bool isHover;

    protected void Awake()
    {
        buttonObject = transform.parent.GetChild(0).gameObject;
        buttonImage = buttonObject.GetComponent<Image>();
        isHover = false;
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
        onClickCallback?.Invoke();
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