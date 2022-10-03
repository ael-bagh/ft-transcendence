import NavBar from "../components/NavBar";
import ProfileHeader from "../components/profile/ProfileHeader";
import Badges from "../components/profile/Badges";
import MatchHistory from "../components/profile/MatchHistory";
import MainLayout from "../components/layout/MainLayout";
import { useParams } from "react-router-dom";
function  Profile() {
  const {id} = useParams<{id: string | undefined}>()
  return (
    <MainLayout>
      <div className="flex flex-col flex-grow w-screen">
        <ProfileHeader />
        <Badges />
        <MatchHistory />
      </div>
    </MainLayout>
  );
}

export default Profile;
