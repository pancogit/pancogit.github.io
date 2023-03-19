import { useEffect, useState } from "react";
import { CubeSides } from "../Cube/Cube";

interface Props {
    cubeSide: CubeSides;
}

export default function Title({ cubeSide }: Props) {
    const [headingClasses, setHeadingClasses] = useState("title__heading");

    // when cube side is changed, then do small
    // transition of text on the screen
    useEffect(() => {
        setHeadingClasses("title__heading");

        // add fade in effect
        setTimeout(() => {
            setHeadingClasses("title__heading title__heading--fade-in");
        }, 500);
    }, [cubeSide]);

    return (
        <div className="title">
            <h1 className={headingClasses}>{cubeSide}</h1>
        </div>
    );
}
