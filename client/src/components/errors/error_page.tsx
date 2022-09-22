import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error  = useRouteError() as {statusText:string,message:string};
  return (
    <div className="error-page bg-white text-black">
      <i>{error.statusText || error.message}</i>
    </div>
  );
}