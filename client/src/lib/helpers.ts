export function truncate(str: string | undefined, n: number) {
  return (str && str.length > n) ? str?.substr(0, n - 1) + "..." : str;
}

export function getRoomName(room: Room | null, authUser?: User) : string{
  if (room?.room_direct_message) {
    return room.room_users.filter((user: roomUser) => user.login !== authUser?.login)[0].login;
  }
    return room?.room_name ?? "UNKNOWN";
}