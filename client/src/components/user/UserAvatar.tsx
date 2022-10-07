export default function UserAvatar(props:{avatar: string | undefined}){
    return (
        <img src={props.avatar} alt="avatar" className="h-10 w-10 rounded-full" style={{ minWidth: '2.5rem' }} />
    )
}