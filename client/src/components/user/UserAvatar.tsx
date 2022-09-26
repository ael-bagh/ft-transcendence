export default function UserAvatar(props:{user: User}){
    return (
            <img src={props.user?.avatar} alt="avatar" className="h-14 w-14 rounded-full" />
    )
}