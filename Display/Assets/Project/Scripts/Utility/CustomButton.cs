using UnityEngine.EventSystems;
public interface CustomButton : IPointerClickHandler, IPointerDownHandler, IPointerUpHandler, IPointerEnterHandler, IPointerExitHandler
{
    void Hover() { }

    void DeHover() { }

    void Push() { }

    void DePush() { }
}