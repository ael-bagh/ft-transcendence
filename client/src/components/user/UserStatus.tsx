import Status from "./Status"

export default function UserStatus(props:  {username : string, id : number}){
    return (
        <div className="flex flex-row">
            {/* lisen to the user status from sockets probably and update it here*/}
            <Status status="offline"/>
        </div>
    )
}