
export default function Status(props : {status : string}) {
    let color = "bg-red-500";
    if (props.status === "online") {
        color = "bg-green-500";
    }
    else if (props.status === "ingame" || props.status === "inqueue" || props.status === "spectating") {
        color = "bg-yellow-500";
    }
    const css = color + " h-3 w-3 rounded-full"
    return (
        <div className="flex flex-row">
            <div className={css}></div>
            <div className="text-xs text-gray-500 ml-1">{(props.status)}</div>
        </div>
    )
}