import React, { useEffect, useState } from "react";
import logo from "../../logo.svg";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

function App() {
    // flags when loading screen is loaded and when to close
    // the loading screen with small transition
    const [screenIsLoaded, setScreenIsLoaded] = useState(false);
    const [closeLoadScreen, setCloseLoadScreen] = useState(false);

    // when screen is loaded, wait a little more time and then
    // close the screen component to see opacity transition
    // of the closed screen
    useEffect(() => {
        if (screenIsLoaded) {
            setTimeout(() => {
                setCloseLoadScreen(true);
            }, 1000);
        }
    });

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>

                {!closeLoadScreen && (
                    <LoadingScreen setScreenIsLoaded={setScreenIsLoaded} />
                )}
            </header>
        </div>
    );
}

export default App;
