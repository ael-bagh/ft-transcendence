import {GiRank1} from 'react-icons/gi';
import {GiGamepadCross} from 'react-icons/gi';
import {MdOutlineLeaderboard} from 'react-icons/md';
import { IoMdPersonAdd } from 'react-icons/io';
import {AuthUserContext} from '../../contexts/authUser.context';
import { useContext } from 'react';
import { useUserById } from '../../hooks/api/useUser';
import { useParams } from 'react-router-dom';

function ProfileHeader() {
    const { authUser } = useContext(AuthUserContext);
    let { id } = useParams<{id:string}>();
    const { user, error } = useUserById(id);
    return (
        <div>
            <div className='profile-header'>
                <img src={user?.avatar} alt="avatar" className='avatar z-0'/>
                <img src='https://png.pngtree.com/thumb_back/fh260/background/20201015/pngtree-abstract-futuristic-neon-banner-with-colorful-background-image_417462.jpg' alt='guild' className='guild h-0 invisible md:w-full md:h-72 md:visible absolute top-0 left-0' />
            </div>
            <div className='profileStats relative z-20'> 
                <p><GiRank1 className='inline text-3xl font-extrabold'/> Newbie</p>
                <p><GiGamepadCross className='inline text-3xl font-extrabold'/> 13</p>
                <p><MdOutlineLeaderboard className='inline text-3xl font-extrabold'/> 10023</p>
                <button className='bg-purple-600 p-2 rounded-3xl flex-none text-center font-normal border-2 border-white inline items-center'> <IoMdPersonAdd className='inline'/> Add friend</button>
            </div>
            <div className='playerInfo'>
                <h1 className='text-2xl font-sans font-bold'>{user?.login}</h1>
                <p>Player status</p>
            </div>
        </div>
    )
}

export default ProfileHeader;