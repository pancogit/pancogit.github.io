import { useCallback, useEffect, useRef, useState } from "react";

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
    const addCubeSidesEventListeners = useRef(false);

    // set to true when first animation with cube rotation is finished
    const firstAnimationFinished = useRef(false);

    // 17 rems = 17 * 16 px = 272 px
    const cubeSize = useRef(17 * 16);

    // detect when mouse drag starts (mouse down)
    // and when is finished (mouse up)
    const mouseDrag = useRef(false);

    // hide all other cube sides which are not in fullscreen
    function hideOtherSides(cubeSideIndex: number) {
        cubeSidesRef.current.forEach((cubeSide, index) => {
            if (cubeSide && index !== cubeSideIndex) {
                cubeSide.classList.add("cube__side--hide");
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

                        firstAnimationFinished.current = true;

                        // when window is resized, then update
                        // coordinates for all cube sides
                        // add event listener when first animation is finished
                        window.addEventListener("resize", () =>
                            updateCubeSidesPositions()
                        );
                    }, 2500);
                }, 10);
            }, 2600);
        }
    }, [cubeClasses]);

    // get out of fullscreen to the screen center animation
    // for the given cube side
    const cubeSideMouseDown = useCallback(
        (event: MouseEvent, cubeSideIndex: number) => {
            if (!firstAnimationFinished.current) return;

            // mouse drag starts
            mouseDrag.current = true;

            const cubeSide = cubeSidesRef.current[cubeSideIndex];

            // exit from fullscreen and fade out to the screen center
            if (cubeSide) {
                cubeSide.classList.remove("cube__side--opacity-fade-in");
                cubeSide.classList.add("cube__side--opacity-fade-out");
                cubeSide.classList.remove("cube__side--fullscreen");

                // remove full opacity and use cube side default
                // half opacity for centered cube
                cubeSide.classList.remove("cube__side--full-opacity");

                // show other cube sides with opacity transition
                cubeSidesRef.current.forEach((cubeSide, index) => {
                    if (cubeSide) {
                        // do fade in effect for other cube sides
                        // and showing them slowly after current side
                        // exit from fullscreen
                        setTimeout(() => {
                            if (index !== cubeSideIndex) {
                                cubeSide.classList.add(
                                    "cube__side--opacity-fade-in-quick"
                                );

                                cubeSide.classList.remove("cube__side--hide");
                            }
                        }, 700);

                        // exit from fullscreen for all cube sides to allow
                        // transitions of whole cube to the screen center
                        // when window is resized
                        cubeSide.classList.add("cube__side--exit-fullscreen");
                    }
                });

                // set screen centered coordinates for each cube side
                updateCubeSidesPositions();
            }
        },
        []
    );

    // go to the fullscreen again from current selected cube side
    const cubeSideMouseUp = useCallback((event: MouseEvent) => {
        if (!firstAnimationFinished.current) return;

        // mouse drag ends
        mouseDrag.current = false;
    }, []);

    // move mouse around window to detect mouse drag effect
    // for manually rotating 3d cube
    const windowMouseMove = useCallback((event: MouseEvent) => {
        if (!firstAnimationFinished.current) return;

        if (mouseDrag.current) {
            console.log("Mouse is moving with dragging...");
        }

        console.log("Window mouse moving");
    }, []);

    // when mouse is dragged, then get out of the fullscreen
    // and return cube side to the screen center again
    // where cube can be rotated in 3d
    useEffect(() => {
        if (!addCubeSidesEventListeners.current) {
            addCubeSidesEventListeners.current = true;

            let cubeSide: HTMLDivElement | null;

            for (let i = 0; i < cubeSidesRef.current.length; i++) {
                cubeSide = cubeSidesRef.current[i];

                // add event listeners to the each cube side
                // get out from fullscreen when cube side is clicked
                if (cubeSide) {
                    cubeSide.addEventListener("mousedown", (event) =>
                        cubeSideMouseDown(event, i)
                    );
                }
            }

            // add event listener when mouse is released
            // it can be done anywhere on window while dragging
            window.addEventListener("mouseup", (event) =>
                cubeSideMouseUp(event)
            );

            // add event listener for mouse moving to detect
            // mouse drag for the cube rotation
            window.addEventListener("mousemove", (event) =>
                windowMouseMove(event)
            );
        }
    }, [cubeSideMouseDown, cubeSideMouseUp, windowMouseMove]);

    // update coordinates for all cube sides
    function updateCubeSidesPositions() {
        const bodyHeight = document.body.clientHeight;
        const bodyWidth = document.body.clientWidth;
        const cubeSideTop = bodyHeight / 2 - cubeSize.current / 2;
        const cubeSideLeft = bodyWidth / 2 - cubeSize.current / 2;

        // set current cube side coordinates
        cubeSidesRef.current.forEach((cubeSide, index) => {
            if (cubeSide) {
                cubeSide.style.left = `${cubeSideLeft.toString()}px`;
                cubeSide.style.top = `${cubeSideTop.toString()}px`;
            }
        });
    }

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
