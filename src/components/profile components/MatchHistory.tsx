function matchHistory (){
    return (
        <div>
            <h1 className='text-3xl font-sans text-center mb-4 font-extrabold'>MATCH HISTORY</h1>
            <div className='matchHistory'>
                <div className='match'>
                    <img src='https://i.pinimg.com/736x/25/78/61/25786134576ce0344893b33a051160b1.jpg' alt="player avatar" className='matchAvatar'/>
                    <div className='matchInfo'>
                        <h1 className='text-2xl font-sans font-bold'>Victory</h1>
                        <p>15 - 3</p>
                    </div>
                    <img src='https://i.pinimg.com/736x/25/78/61/25786134576ce0344893b33a051160b1.jpg' alt="oponenet avatar" className='matchAvatar'/>
                </div>
                <div className='match'>
                    <img src='https://i.pinimg.com/736x/25/78/61/25786134576ce0344893b33a051160b1.jpg' alt="player avatar" className='matchAvatar'/>
                    <div className='matchInfo'>
                        <h1 className='text-2xl font-sans font-bold'>Victory</h1>
                        <p>15 - 3</p>
                    </div>
                    <img src='https://i.pinimg.com/736x/25/78/61/25786134576ce0344893b33a051160b1.jpg' alt="oponenet avatar" className='matchAvatar'/>
                </div>
                <div className='match'>
                    <img src='https://i.pinimg.com/736x/25/78/61/25786134576ce0344893b33a051160b1.jpg' alt="player avatar" className='matchAvatar'/>
                    <div className='matchInfo'>
                        <h1 className='text-2xl font-sans font-bold'>Victory</h1>
                        <p>15 - 3</p>
                    </div>
                    <img src='https://i.pinimg.com/736x/25/78/61/25786134576ce0344893b33a051160b1.jpg' alt="oponenet avatar" className='matchAvatar'/>
                </div>
                <div className='flex justify-center'>
                    <button className='bg-black p-2 rounded-md mt-2 w-1/3 text-2xl'>View all</button>
                </div>
            </div>
        </div>
    )
}
export default matchHistory;