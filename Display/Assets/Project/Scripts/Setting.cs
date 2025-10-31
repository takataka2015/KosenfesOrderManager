using UnityEngine;

public class Setting : MonoBehaviour
{
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Awake()
    {
        Screen.fullScreenMode = FullScreenMode.FullScreenWindow;
        Application.runInBackground = true;
    }
}
