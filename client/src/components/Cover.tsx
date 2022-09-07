import Button from './Button'
import cover from './imgs/gamecover.png'

function play(){
    console.log("Play");
}

function Cover(){
    return (
        <div className="cover flex pt-10 gap-3 h-fit">
            <img src={cover} alt="cover" className='imgcover z-10'/>
            <p className='sm:text-2xl text-xl z-20 md:mt-36 sm-40'>THE FINAL PROJECT</p>
            <p className='sm:text-6xl text-4xl font-extrabold font-sans z-20'>WRITTEN WITH PASSION</p>
            <p className='sm:text-xl text-base font-extrabold italic z-20 m-3 bg-purple-400 bg-opacity-40 rounded-md'>"By the laziest people on earth"<span className='font-extralight bg-purple-500'> - just an unpopular opinion</span></p>
            <Button className='primary z-20 mt-6' label='PLAY NOW' onClick={play}/>
        </div>
    )
}
 export default Cover