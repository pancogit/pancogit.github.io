import { useEffect, useRef, useState } from "react";

type CubeClasses = [string, string, string, string, string, string];

const cubeSidesInit: CubeClasses = [
    "cube__front",
    "cube__back",
    "cube__left",
    "cube__right",
    "cube__top",
    "cube__bottom",
];

export default function Cube() {
    // save state for each cube side in separate array element
    const [cubeClasses, setCubeClasses] = useState<CubeClasses>(cubeSidesInit);

    const initFrontClasses = useRef(false);

    // hide all other cube sides which are not in fullscreen
    function hideOtherSides(
        fullscreenSideIndex: number,
        allClasses: CubeClasses
    ) {
        for (let i = 0; i < allClasses.length; i++) {
            if (i !== fullscreenSideIndex) {
                allClasses[i] =
                    cubeSidesInit[i] + " cube__side cube__side--hide";
            }
        }
    }

    // add animation on front side of the cube at the beginning
    useEffect(() => {
        if (!initFrontClasses.current) {
            initFrontClasses.current = true;

            setTimeout(() => {
                let allClasses = cubeClasses.slice() as CubeClasses;
                let allClassesOpacity = cubeClasses.slice() as CubeClasses;

                allClasses[0] = `cube__front 
                    cube__side 
                    cube__side--fullscreen
                    cube__side--opacity-fade-in
                `;

                // hide other sides of cube when cube is
                // starting to go into fullscreen
                hideOtherSides(0, allClasses);

                // add class which will fullscreen front side of the cube
                setCubeClasses(allClasses);

                allClassesOpacity[0] = `cube__front
                    cube__side 
                    cube__side--fullscreen
                    cube__side--opacity-fade-in
                    cube__side--full-opacity
                `;

                // set small fade in effect while going to the fullscreen
                // after animations are finished, fix opacity to 1
                // for visible page which is in fullscreen
                // also hide other sides of cube when cube is
                // starting to go into full opacity
                setTimeout(() => {
                    hideOtherSides(0, allClassesOpacity);
                    setCubeClasses(allClassesOpacity);
                }, 2500);
            }, 2500);
        }
    }, [cubeClasses]);

    return (
        <div className="cube">
            <div className={cubeClasses[0]}>Front</div>
            <div className={cubeClasses[1]}>Back</div>
            <div className={cubeClasses[2]}>Left</div>
            <div className={cubeClasses[3]}>Right</div>
            <div className={cubeClasses[4]}>Top</div>
            <div className={cubeClasses[5]}>Bottom</div>
        </div>
    );
}
