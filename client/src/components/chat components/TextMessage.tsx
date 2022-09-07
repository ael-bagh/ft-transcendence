export default function TextMessage(props:{user: string, message: string, isOwnMessage: boolean}) {
    const css = "w-4/6 m-1 shrink-0 h-14 text-white p-2 font-sans font-medium rounded rounded-full";
    let messageCss = css + ((props.isOwnMessage )? "flex self-start rounder-lg bg-purple-400 text-purple-800 border border-purple-800" : "flex self-end bg-gray-200/50 m-1 shrink-0 h-14 border border-gray-200");
    return (
        <div className={messageCss}>{props.message}</div>
    )
}