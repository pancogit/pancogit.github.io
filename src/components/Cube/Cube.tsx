import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
    setCubeSide(cubeSide: CubeSides): void;
}

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

export type CubeSides = "Front" | "Back" | "Left" | "Right" | "Top" | "Bottom";

const cubeSidesNames: CubeSides[] = [
    "Front",
    "Back",
    "Left",
    "Right",
    "Top",
    "Bottom",
];

export default function Cube({ setCubeSide }: Props) {
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

    // while cube is rotating, set cube side which is
    // the most in the view, for example if there are
    // two cube sides in the view, then set the most one
    // as current cube side
    const setCurrentCubeSide = useCallback(() => {
        if (!cubeSidesRef.current) return;
        if (!cubeWrapperRef.current) return;

        let transformCube = cubeWrapperRef.current.style.transform;

        // parse X and Y degrees from rotate transformations
        // for example rotateX(60deg), first parse rotateX/Y
        // transformation function, then brackets () and
        // finally degree deg to get the number in string
        // after that parse string to integer and that's it
        let rotateXvalue = parseInt(
            transformCube
                .split("rotateX")[1]
                .split("(")[1]
                .split(")")[0]
                .split("deg")[0]
        );

        let rotateYvalue = parseInt(
            transformCube
                .split("rotateY")[1]
                .split("(")[1]
                .split(")")[0]
                .split("deg")[0]
        );

        // set normalized rotation degree value if it's
        // over 360 degrees or negative
        rotateXvalue = correctRotationValue(rotateXvalue);
        rotateYvalue = correctRotationValue(rotateYvalue);

        // get cube side for rotation on X and Y axis
        let currentCubeSideX = getRotationCubeSideX(rotateXvalue);
        let currentCubeSideY = getRotationCubeSideY(rotateYvalue);

        // for cube sides on X and Y axis, get cube
        // side which is in current view
        const currentCubeSide = getRotationCubeSideXY(
            currentCubeSideX,
            currentCubeSideY
        );

        setCubeSide(currentCubeSide);
    }, [setCubeSide]);

    // X cube rotation from 0 - 360
    // ( and ) are exclusive ranges, [ and ] are inclusive
    // bottom cube side: (45deg, 135deg]
    // back cube side: (135deg, 225deg]
    // top cube side: (225deg, 315deg]
    // front cube side: (315deg, 45deg]
    function getRotationCubeSideX(rotateXvalue: number) {
        let currentCubeSideX: CubeSides = "Front";

        if (rotateXvalue > 45 && rotateXvalue <= 135) {
            currentCubeSideX = "Bottom";
        } else if (rotateXvalue > 135 && rotateXvalue <= 225) {
            currentCubeSideX = "Back";
        } else if (rotateXvalue > 225 && rotateXvalue <= 315) {
            currentCubeSideX = "Top";
        } else if (
            (rotateXvalue > 315 && rotateXvalue <= 360) ||
            (rotateXvalue >= 0 && rotateXvalue <= 45)
        ) {
            currentCubeSideX = "Front";
        }

        return currentCubeSideX;
    }

    // Y cube rotation from 0 - 360
    // ( and ) are exclusive ranges, [ and ] are inclusive
    // left cube side: (45deg, 135deg]
    // back cube side: (135deg, 225deg]
    // right cube side: (225deg, 315deg]
    // front cube side: (315deg, 45deg]
    function getRotationCubeSideY(rotateYvalue: number) {
        let currentCubeSideY: CubeSides = "Front";

        if (rotateYvalue > 45 && rotateYvalue <= 135) {
            currentCubeSideY = "Left";
        } else if (rotateYvalue > 135 && rotateYvalue <= 225) {
            currentCubeSideY = "Back";
        } else if (rotateYvalue > 225 && rotateYvalue <= 315) {
            currentCubeSideY = "Right";
        } else if (
            (rotateYvalue > 315 && rotateYvalue <= 360) ||
            (rotateYvalue >= 0 && rotateYvalue <= 45)
        ) {
            currentCubeSideY = "Front";
        }

        return currentCubeSideY;
    }

    // if cube side on Y axis is front side, that means
    // cube is rotating near or around X axis and use
    // coordinates from X axis
    // otherwise, if cube side on X axis is front side,
    // that means cube is rotating near or around Y axis
    // and use coordinates from Y axis instead
    function getRotationCubeSideXY(
        currentCubeSideX: CubeSides,
        currentCubeSideY: CubeSides
    ) {
        let currentCubeSide: CubeSides = "Front";

        if (currentCubeSideY === "Front") {
            currentCubeSide = currentCubeSideX;
        } else if (currentCubeSideX === "Front") {
            currentCubeSide = currentCubeSideY;
        } else {
            currentCubeSide = currentCubeSideX;
        }

        return currentCubeSide;
    }

    // rotation degrees can be more than 360 or negative
    // in both cases do necessary modulo / addition
    // to get number between 0 - 360 and to use correct
    // value for set the current cube side
    function correctRotationValue(rotationDegree: number) {
        if (rotationDegree === 360) return 0;

        // modulo by 360 to get real degree value
        if (rotationDegree > 360) {
            return rotationDegree % 360;
        }

        // if degree is negative, then set appropriate
        // positive degree value
        if (rotationDegree < 0) {
            let modulo = rotationDegree;

            // do modulo if number of higher than -360
            if (-rotationDegree > 360) {
                modulo = rotationDegree % 360;
            }

            let positiveDegree = modulo + 360;
            let degree = positiveDegree;

            // do another modulo if it's very high
            if (positiveDegree > 360) {
                degree = positiveDegree % 360;
            }

            return degree;
        }

        // otherwise, just return normal degree value
        return rotationDegree;
    }

    // move mouse around window to detect mouse drag effect
    // for manually rotating 3d cube
    const windowMouseMove = useCallback(
        (event: MouseEvent) => {
            if (!firstAnimationFinished.current) return;
            if (!mouseDrag.current) return;

            // save current mouse coordinates in local ref
            // instead of state because it's changing rapidly
            // for y axis use inverse path, because coordinate
            // system starts on top left corner for css rotations
            let mouseX = event.clientX;
            let mouseY = -event.clientY;

            // first mouse move is detected
            // set difference in degree step from the
            // centered cube to the first cube rotation
            if (!mousePositions.current && cubeWrapperRef.current) {
                const cubeRect = cubeWrapperRef.current.getBoundingClientRect();

                // subtract x axis of corner to get first delta distance
                // for x, and also do the same for y axis except that's
                // already negative and just use positive adding
                mouseX -= cubeRect.x;
                mouseY += cubeRect.y;
            }

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

            setCurrentCubeSide();
        },
        [setCurrentCubeSide]
    );

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
