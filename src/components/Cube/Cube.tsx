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

interface MousePositions {
    x: number;
    y: number;
}

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

    const [cubeWrapperClasses, setCubeWrapperClasses] = useState("cube");

    const cubeWrapperRef = useRef<HTMLDivElement>(null);
    const initFrontClasses = useRef(false);
    const addCubeSidesEventListeners = useRef(false);

    // set to true when first animation with cube rotation is finished
    const firstAnimationFinished = useRef(false);

    // 11.7 rems = 11.7 * 16 px = 187.2 px - full cube size
    // 11.7 / 2 rems = 5.85 rem = 11.7 / 2 * 16 px = 93.6 px - half cube size
    const cubeSizeHalf = useRef(5.85);

    // detect when mouse drag starts (mouse down)
    // and when is finished (mouse up)
    const mouseDrag = useRef(false);

    // coordinates for mouse moving
    const mousePositions = useRef<MousePositions>();

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
    // it is first animation
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

                    // when window is resized, then remove
                    // all cube sides transitions
                    // add event listener when first animation
                    // is finished
                    window.addEventListener("resize", () => {
                        removeCubeSidesTransition();
                    });

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

                        // when first animation is finished, then add class on the cube
                        // itself to rotate cube around center in 3d, not around edges
                        setCubeWrapperClasses("cube cube--center-rotation");
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

            const currentCubeSide = cubeSidesRef.current[cubeSideIndex];

            // exit from fullscreen and fade out to the screen center
            if (currentCubeSide) {
                // remove all transitions for each cube side
                removeCubeSidesTransition();

                // if window is resized, then transition is removed
                // to avoid cube running across the screen
                // if that's the case, remove inline transition
                // and use class based one
                currentCubeSide.style.transition = "";

                currentCubeSide.classList.remove("cube__side--opacity-fade-in");
                currentCubeSide.classList.add("cube__side--opacity-fade-out");
                currentCubeSide.classList.remove("cube__side--fullscreen");

                // remove full opacity and use cube side default
                // half opacity for centered cube
                currentCubeSide.classList.remove("cube__side--full-opacity");

                // show other cube sides with opacity transition
                cubeSidesRef.current.forEach((cubeSide, index) => {
                    if (cubeSide) {
                        // remove transition for other cube sides also
                        cubeSide.style.transition = "";

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

                            // remove coordinates for all cube sides
                            // to allow cube rotation around its own axis
                            removeCubeSidesPositions();

                            // remove inline positioning and transformations
                            // to allow cube rotation around its own axis
                            if (cubeWrapperRef.current) {
                                cubeWrapperRef.current.style.position = "";
                                cubeWrapperRef.current.style.transform = "";
                            }

                            // mouse drag starts when mouse down (click)
                            // is finished, but with small delay
                            setTimeout(() => {
                                mouseDrag.current = true;
                            }, 100);
                        }, 700);

                        // exit from fullscreen for all cube sides to allow
                        // transitions of whole cube to the screen center
                        // when window is resized
                        cubeSide.classList.add("cube__side--exit-fullscreen");
                    }
                });
            }
        },
        []
    );

    // go to the fullscreen again from current selected cube side
    const windowMouseUp = useCallback((event: MouseEvent) => {
        if (!firstAnimationFinished.current) return;

        // mouse drag ends
        mouseDrag.current = false;
    }, []);

    // move mouse around window to detect mouse drag effect
    // for manually rotating 3d cube
    const windowMouseMove = useCallback((event: MouseEvent) => {
        if (!firstAnimationFinished.current) return;
        if (!mouseDrag.current) return;

        // save current mouse coordinates in local ref
        // instead of state because it's changing rapidly
        const mouseX = event.clientX;
        const mouseY = -event.clientY;

        // save coordinates in local ref
        mousePositions.current = { x: mouseX, y: mouseY };

        // for rotating cube on X axis use mouse Y coordinates
        // because when mouse is moving up / down, then it's
        // rotating cube around X axis
        // the same is for rotating cube on Y axis using
        // mouse X coordinates because when mouse is moving
        // left / right, then it's rotating cube around Y axis
        // there is no need to rotate cube on Z axis
        rotateCube(mousePositions.current.y, mousePositions.current.x);
    }, []);

    // rotate cube using given coordinates
    function rotateCube(x: number, y: number) {
        if (!cubeWrapperRef.current) return;

        // keep using 3d translation to center cube on screen
        // while using 3d rotations
        // for Z axis, don't do any rotation, it's not needed
        cubeWrapperRef.current.style.transform = `
            translate3d(
                -${cubeSizeHalf.current}rem,
                -${cubeSizeHalf.current}rem, 
                -${cubeSizeHalf.current}rem
            )
            rotateX(${x}deg)
            rotateY(${y}deg)
            rotateZ(0deg)
        `;
    }

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
            window.addEventListener("mouseup", (event) => windowMouseUp(event));

            // add event listener for mouse moving to detect
            // mouse drag for the cube rotation
            window.addEventListener("mousemove", (event) =>
                windowMouseMove(event)
            );
        }
    }, [cubeSideMouseDown, windowMouseUp, windowMouseMove]);

    // remove transition on all cube sides while resizing
    // window to avoid cube running across the screen
    function removeCubeSidesTransition() {
        cubeSidesRef.current.forEach((cubeSide, index) => {
            if (cubeSide) {
                cubeSide.style.transition = "none";
            }
        });
    }

    // remove coordinates for all cube sides
    function removeCubeSidesPositions() {
        cubeSidesRef.current.forEach((cubeSide, index) => {
            if (cubeSide) {
                cubeSide.style.left = "";
                cubeSide.style.top = "";
            }
        });
    }

    return (
        <div className={cubeWrapperClasses} ref={cubeWrapperRef}>
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
