import { useEffect, useRef, useState } from "react";
import Cube from "../Cube/Cube";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

function App() {
    // flags when loading screen is loaded and when to close
    // the loading screen with small transition
    const [screenIsLoaded, setScreenIsLoaded] = useState(false);
    const [closeLoadScreen, setCloseLoadScreen] = useState(false);

    // flag for cube to render after quick time when loader finish loading
    // don't wait loader to finish full opacity animation
    const [renderCube, setRenderCube] = useState(false);

    const appRef = useRef<HTMLDivElement | null>(null);
    const appHeightUpdated = useRef(false);

    // when screen is loaded, wait a little more time and then
    // close the screen component to see opacity transition
    // of the closed screen
    // also render cube after quick time
    useEffect(() => {
        if (screenIsLoaded) {
            setTimeout(() => {
                setCloseLoadScreen(true);
            }, 600);

            setTimeout(() => {
                setRenderCube(true);
            }, 300);

            // show background image when loading screen closed
            document.body.className = "body-background";
        }
    });

    /*
    // update height to full height on window resize to
    // support mobile devices height changes
    // css 100vh doesn't work for mobile, it's known bug
    useEffect(() => {
        if (!appHeightUpdated.current) {
            appHeightUpdated.current = true;

            window.addEventListener("resize", () => {
                if (appRef.current) {
                    appRef.current.style.height = `${window.innerHeight}px`;
                }
            });
        }
    }, []);
    */

    return (
        <div className="App" ref={appRef}>
            {!closeLoadScreen && (
                <LoadingScreen setScreenIsLoaded={setScreenIsLoaded} />
            )}

            {/* render cube after loading screen disappears */}
            {/* closeLoadScreen && <Cube /> */}

            {/* or render cube immediately after loading screen reach 100% */}
            {/* screenIsLoaded && <Cube /> */}

            {/* or render cube after quick time before loading screen disappears */}
            {renderCube && <Cube />}
        </div>
    );
}

export default App;
