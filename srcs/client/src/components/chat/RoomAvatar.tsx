export default function RoomAvatar(props: { avatar: string }) {
  return (
    <span className="inline-block relative">
      <img className="h-10 w-10 rounded-full" src={props.avatar} alt="" />
    </span>
  );
}
