export default function UserAvatar(props:{avatar: string | undefined}){
    return (
            <img src={props.avatar} alt="avatar" className="h-14 w-14 rounded-full" />
    )
}