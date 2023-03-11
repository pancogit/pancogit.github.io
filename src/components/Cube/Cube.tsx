import { useEffect, useRef, useState } from "react";

type CubeClasses = [string, string, string, string, string, string];

type CubeRefs = [
    HTMLDivElement | null,
    HTMLDivElement | null,
    HTMLDivElement | null,
    HTMLDivElement | null,
    HTMLDivElement | null,
    HTMLDivElement | null
];

const cubeSidesInit: CubeClasses = [
    "cube__front",
    "cube__back",
    "cube__left",
    "cube__right",
    "cube__top",
    "cube__bottom",
];

const cubeSidesNames = ["Front", "Back", "Left", "Right", "Top", "Bottom"];

export default function Cube() {
    // save state for each cube side in separate array element
    const [cubeClasses, setCubeClasses] = useState<CubeClasses>(cubeSidesInit);

    // save references to all dom elements for each side of cube
    // they are used to dynamically update positioning coordinates
    // of the cube side for animations
    const cubeSidesRef = useRef<CubeRefs>(
        new Array<HTMLDivElement>(6) as CubeRefs
    );

    const cubeWrapperRef = useRef<HTMLDivElement>(null);
    const initFrontClasses = useRef(false);

    // hide all other cube sides which are not in fullscreen
    function hideOtherSides(cubeSideIndex: number) {
        cubeSidesRef.current.forEach((cubeSide, index) => {
            if (cubeSide && index !== cubeSideIndex) {
                cubeSide.style.visibility = "hidden";
            }
        });
    }

    // when cube side is going to the fullscreen, then for smooth
    // animations current and final position coordinates must be set
    // final coordinates are set in the class itself, but current
    // must be set dynamically while doing animation
    function setCurrentCubeSidePositions(cubeSideIndex: number) {
        const currentCubeSide = cubeSidesRef.current[cubeSideIndex];

        if (currentCubeSide) {
            const boxProperties = currentCubeSide.getBoundingClientRect();

            const topCoordinate = boxProperties.top;
            const leftCoordinate = boxProperties.left;

            // set current cube side coordinates for
            // top and left coordinates
            currentCubeSide.style.top = `${topCoordinate}px`;
            currentCubeSide.style.left = `${leftCoordinate}px`;
        }
    }

    // add animation on front side of the cube at the beginning
    useEffect(() => {
        if (!initFrontClasses.current) {
            initFrontClasses.current = true;

            // add animation a little bit after css animation
            // with initial cube rotation is finished
            setTimeout(() => {
                // set top and left coordinates for front side of the cube
                // to allow smooth transition between current cube side
                // position to the another position (0, 0) to the fullscreen
                setCurrentCubeSidePositions(0);

                // put front cube side to the fullscreen by removing
                // container positioning for cube sides to allow them
                // to spread outside of cube wrapper and remove all
                // transformation because they are using negative
                // translations to the left and top
                if (cubeWrapperRef.current) {
                    cubeWrapperRef.current.style.position = "static";
                    cubeWrapperRef.current.style.transform = "none";
                }

                // hide other cube sides than front side
                hideOtherSides(0);

                // when other cube sides are hidden and current side
                // of cube is updated with current coordinates, then
                // immediately update classes for going to the
                // fullscreen and opacity animations
                setTimeout(() => {
                    let allClasses = cubeClasses.slice() as CubeClasses;
                    let allClassesOpacity = cubeClasses.slice() as CubeClasses;

                    // fullscreen animation with half opacity
                    allClasses[0] = `cube__front 
                        cube__side 
                        cube__side--fullscreen
                        cube__side--opacity-fade-in
                    `;

                    // add class which will fullscreen front side of the cube
                    setCubeClasses(allClasses);

                    // fullscreen animation with full opacity
                    allClassesOpacity[0] = `cube__front
                        cube__side 
                        cube__side--fullscreen
                        cube__side--opacity-fade-in
                        cube__side--full-opacity
                    `;

                    // set small fade in effect while going to the fullscreen
                    // after animations are finished, set opacity to 1
                    // for visible page which is in fullscreen
                    setTimeout(() => {
                        setCubeClasses(allClassesOpacity);
                    }, 2500);
                }, 10);
            }, 2550);
        }
    }, [cubeClasses]);

    return (
        <div className="cube" ref={cubeWrapperRef}>
            {cubeClasses.map((cubeClass, index) => (
                <div
                    key={index}
                    className={cubeClass}
                    ref={(refObj) => (cubeSidesRef.current[index] = refObj)}
                >
                    {cubeSidesNames[index]}
                </div>
            ))}
        </div>
    );
}
