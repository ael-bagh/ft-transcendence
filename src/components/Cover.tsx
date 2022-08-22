import Button from './Button'

function play(){
    console.log("Play");
}

function Cover(){
    return (
        <div className="cover flex pt-10 gap-3 h-fit">
            <p className='text-2xl'>The final Project</p>
            <p className='text-6xl font-extrabold'>Written with passion</p>
            <p className='text-xl font-extrabold italic'>"By the laziest people on earth" - just an unpopular opinion</p>
            <Button className='primary' label='PLAY NOW' onClick={play}/>
            <img src="https://img.freepik.com/premium-vector/game-neon-signs-design-template-neon-sign_77399-998.jpg" alt="cover" />
        </div>
    )
}
 export default Cover