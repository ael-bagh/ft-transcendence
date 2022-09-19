
import NavBar from '../components/NavBar';
import ProfileHeader from '../components/profile/ProfileHeader';
import Badges from '../components/profile/Badges';
import MatchHistory from '../components/profile/MatchHistory';
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