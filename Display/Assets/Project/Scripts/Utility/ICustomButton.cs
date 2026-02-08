using UnityEngine.EventSystems;
public interface ICustomButton : IPointerClickHandler, IPointerDownHandler, IPointerUpHandler, IPointerEnterHandler, IPointerExitHandler
{
    void Hover() { }

    void DeHover() { }

    void Push() { }

    void DePush() { }
}