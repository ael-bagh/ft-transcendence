import NavBar from "../components/NavBar";
import ProfileHeader from "../components/profile/ProfileHeader";
import Badges from "../components/profile/Badges";
import MatchHistory from "../components/profile/MatchHistory";
import MainLayout from "../components/layout/MainLayout";
import { useParams } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import ProfileInfo from "../components/profile/ProfileInfo";
function  Profile() {
  const { data: user } = useLoaderData() as { data: User | null };
  return (
    <MainLayout>
      <div className="flex flex-col flex-grow w-screen">
        <ProfileHeader user={user}/>
        <ProfileInfo user={user}/>
        <Badges />
        <MatchHistory />
      </div>
    </MainLayout>
  );
}

export default Profile;
