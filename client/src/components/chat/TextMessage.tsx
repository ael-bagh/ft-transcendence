export default function TextMessage(props:{id: string | number, user: string | undefined, message: string, isOwnMessage: boolean}) {
    const css = "w-4/6 m-1 shrink-0 h-fit text-white p-4 font-sans font-medium rounded ";
    let messageCss = css + ((props.isOwnMessage )? "flex self-start bg-purple-500 break-words" : "flex self-end bg-gray-200/50 m-1 shrink-0 h-fit break-words");
    return (
        <p id={"message-id--" + props.id} className={messageCss}>{props.message}</p>
    )
}