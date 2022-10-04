export default function ProfileInfo(props: { user: User | null }) {
  return (
    <div className="flex flex-col text-center mt-2">
      <h1 className="text-3xl font-sans text-center mb-4 font-extrabold">
        Profile informations:
      </h1>
      <h2 className="text-base font-sans font-bold"><span>Login:</span>{props.user?.login}</h2>
      <h3 className="ext-base font-sans font-bold"> <span>Nickname:</span>{props.user?.nickname}</h3>
      <p>{props.user?.status}</p>
    </div>
  );
}
