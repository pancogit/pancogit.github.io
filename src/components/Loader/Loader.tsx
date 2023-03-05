interface Props {
    percentage: number;
}

export default function Loader({ percentage }: Props) {
    // get percentage of progress bar by subtracting 100% of width
    // with desired percentage to get positioned distance from right
    // edge of the progress bar
    const progressPercentage = 100 - percentage;

    const progressStyle: React.CSSProperties = {
        right: progressPercentage + "%",
    };

    return (
        <div className="loader">
            <div className="loader__inner">
                <div className="loader__progress" style={progressStyle}></div>
                <span className="loader__text">Loading...{percentage}%</span>
                <span className="loader__background"></span>
            </div>
        </div>
    );
}
