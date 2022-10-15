import {useHistory} from '../../hooks/api/useUser'
import {Loading} from '../layout/Loading'
import { useEffect } from 'react';
import UserAvatar from '../user/UserAvatar';
import AvatarByLogin from '../user/AvatarByLogin';

function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}

function matchHistory (props:{user: User}) {
    const {history, loading, error, mutate} = useHistory(props.user?.login)

    useEffect(() => {
        mutate(props.user?.login)
    }, [props.user])
    if (loading)
        return (
        <div className='flex w-screen justify-center items-center'><Loading /></div> 
        )
    else
    return (
        <div>
            <h1 className='text-3xl font-sans text-center mb-4 font-extrabold'>MATCH HISTORY</h1>
            <div className='matchHistory'>
                {history?.map((match: Sett, index: number) => (<div key={index} className={classNames(
                    'w-full justify-between flex flex-row items-center p-2 text-center',
                    (match.set_winner_login === props.user?.login) ? "bg-green-500" : "bg-red-500"
                )} >
                    <AvatarByLogin login={match.set_winner_login} />
                    <div className='flex flex-row justify-between'>
                        <div className='flex flex-col'>
                            <div>{(props.user?.login === match.set_winner_login) ? "Victory" : "Loss"}</div>
                            <div>{match.set_winner_score} - {match.set_loser_score}</div>
                        </div>
                    </div>
                    <AvatarByLogin login={match.set_loser_login} />
                </div>
                ))}
                <div className='flex justify-center'>
                    <button className='bg-black p-2 rounded-md mt-2 w-1/3 text-2xl'>View all</button>
                </div>
            </div>
        </div>
    )
}
export default matchHistory;