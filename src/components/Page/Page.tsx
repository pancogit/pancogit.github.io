import { useState } from "react";
import Cube, { CubeSides } from "../Cube/Cube";
import Title from "../Title/Title";

export default function Page() {
    // which cube side is currently in view
    const [cubeSideInView, setCubeSideInView] = useState<CubeSides | null>(
        null
    );

    function setCubeSide(cubeSide: CubeSides) {
        setCubeSideInView(cubeSide);
    }

    return (
        <div className="page">
            <Cube setCubeSide={setCubeSide} />
            {cubeSideInView && <Title cubeSide={cubeSideInView} />}
        </div>
    );
}
