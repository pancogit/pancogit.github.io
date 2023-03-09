import { useEffect, useState } from "react";
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
        }
    });

    return (
        <div className="App">
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
