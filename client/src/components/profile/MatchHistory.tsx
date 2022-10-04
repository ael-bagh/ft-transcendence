import {useHistory, useUserById} from '../../hooks/api/useUser'
import {AuthUserContext} from '../../contexts/authUser.context'
import { useContext } from 'react'
import {Loading} from '../layout/Loading'
import { useParams } from "react-router-dom";
import { useEffect } from 'react';

function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}

function matchHistory () {
    const {id} = useParams<{id: string | undefined}>()
    const {user} = useUserById(id)
    const {history, loading, error, mutate} = useHistory(user?.login)

    useEffect(() => {
        mutate(user?.login)
    }, [user])
    if (loading)
        return (
        <div className='flex w-screen justify-center items-center'><Loading /></div> 
        )
    else
    return (
        <div>
            <h1 className='text-3xl font-sans text-center mb-4 font-extrabold'>MATCH HISTORY</h1>
            <div className='matchHistory'>
                {history?.slice(0,5).map((match: History, index: number) => (<div key={index} className={classNames(
                    'match',
                    (match.game_winner_login === user?.login) ? "bg-green-500" : "bg-red-500"
                )} >
                    <img src={`https://avatars.dicebear.com/api/avataaars/${match.game_winner_login}.svg`} alt="player avatar" className='matchAvatar rounded-full bg-gray-700'/>
                    <div className='matchInfo'>
                        <h1 className='text-2xl font-sans font-bold'>Victory</h1>
                        <p>{match.game_winner_score} - {match.game_loser_score}</p>
                    </div>
                    <img src={`https://avatars.dicebear.com/api/avataaars/${match.game_loser_login}.svg`} alt="oponenet avatar" className='matchAvatar rounded-full bg-gray-700'/>
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