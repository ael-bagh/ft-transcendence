import { useContext } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import Badges from "../components/profile/Badges";
import MatchHistory from "../components/profile/MatchHistory";
import MainLayout from "../components/layout/MainLayout";
import ProfileInfo from "../components/profile/ProfileInfo";
import { AuthUserContext } from "../contexts/authUser.context";

export default function Profile() {
  const { authUser } = useContext(AuthUserContext);

  return (
    <MainLayout>
      {authUser && (
        <div className="flex flex-col flex-grow w-screen">
          <ProfileHeader user={authUser} />
          <ProfileInfo user={authUser} />
          <Badges />
          <MatchHistory />
        </div>
      )}
    </MainLayout>
  );
}
