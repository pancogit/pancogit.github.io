import { useEffect, useRef, useState } from "react";
import Loader from "../Loader/Loader";

interface Props {
    setScreenIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LoadingScreen({ setScreenIsLoaded }: Props) {
    // level of the progress bar in percentages
    // init progress bar from 7% to 10%
    const [progressLevel, setProgressLevel] = useState<number>(
        Math.floor(7 + Math.random() * 5)
    );

    const progressLevelRef = useRef(progressLevel);
    const intervalID = useRef(0);
    const startLoading = useRef(false);

    const screenClasses = getScreenClasses();

    // add fade away class to the loading screen if
    // progress bar is finished
    function getScreenClasses() {
        let screenClasses = "loading-screen";

        if (progressLevelRef.current === 100) {
            screenClasses += " loading-screen__fade-away";
        }

        return screenClasses;
    }

    function increaseProgressBar() {
        progressLevelRef.current = Math.floor(
            progressLevelRef.current + 1 + Math.random() * 10
        );

        // progress bar is filled 100%, screen loading is
        // finished and destroy interval running
        if (progressLevelRef.current >= 100) {
            progressLevelRef.current = 100;

            setScreenIsLoaded(true);
            clearInterval(intervalID.current);
        }

        setProgressLevel(progressLevelRef.current);
    }

    // increase progress bar percentages by random value after some time
    useEffect(() => {
        if (!startLoading.current) {
            const time = 300 + Math.random() * 100;

            // increase progress bar in the interval
            // run interval only once and when loading is finished,
            // then destroy the interval
            intervalID.current = window.setInterval(async () => {
                const timeout = 200 + Math.random() * 200;

                // for each interval running, run timeout with different
                // time to increase progress bar at random times
                // resolve promise when timeout is finished to be
                // able to wait for timeout to finish inside
                // called interval
                async function runTimeout() {
                    return new Promise<boolean>((resolve, reject) => {
                        setTimeout(() => {
                            increaseProgressBar();

                            resolve(true);
                        }, timeout);
                    });
                }

                // don't finish current interval until timeout is finished
                // each time when progress bar is waiting for increment,
                // then wait for it to finish before continue to the
                // next interval
                await runTimeout();
            }, time);

            startLoading.current = true;
        }
    });

    return (
        <div className={screenClasses}>
            <Loader percentage={progressLevel} />
        </div>
    );
}
