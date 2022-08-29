export default function TextMessage(props:{user: string, message: string, isOwnMessage: boolean}) {
    const css = "w-4/6 m-1 shrink-0 h-14 text-white p-2 font-sans font-bold rounded-md";
    let messageCss = css + ((props.isOwnMessage )? "flex self-start bg-purple-500" : "flex self-end bg-gray-800 m-1 shrink-0 h-14");
    return (
        <div className={messageCss}>{props.message}</div>
    )
}