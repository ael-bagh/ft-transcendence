export default function Status(props : {status : boolean}) {
    const css = props.status ? "h-3 w-3 bg-green-500 rounded-full" : "h-3 w-3 bg-red-500 rounded-full"
    return (
        <div className="flex flex-row">
            <div className={css}></div>
            <div className="text-xs text-gray-500 ml-1">{(props.status)? "Online" : "Offline"}</div>
        </div>
    )
}