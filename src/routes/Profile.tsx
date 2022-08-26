
import NavBar from '../components/NavBar';
import ProfileHeader from '../components/profile components/ProfileHeader';
import Badges from '../components/profile components/Badges';
import MatchHistory from '../components/profile components/MatchHistory';
function Profile() {
  return (
    <div className='text-white'>
    <NavBar />
    <ProfileHeader />
        <Badges />
        <MatchHistory />
    </div>
  );
}

export default Profile;