import Button from './Button'
import cover from './imgs/gamecover.png'
import Sample from './imgs/sample.mp4'
import {useState, useEffect, useRef} from 'react'



function Cover(){
    const videoRef = useRef<HTMLVideoElement>(null) as React.MutableRefObject<HTMLVideoElement>
    const [play, setPlay] = useState(false);
    useEffect(() => {
        videoRef.current.play();
        const timer = setTimeout(() => {
            videoRef.current.pause();
          }, 4500);
          return () => clearTimeout(timer);
    }, [play])
    return (
        <div className="relative top-0 left-0">
            <video className='cover videoTag w-full' ref={videoRef} autoPlay muted>
                <source src={Sample} type='video/mp4' />
            </video>
            <a className='absolute p-4 text-purple-600 text-9xl text-center hover:cursor-pointer top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-levi' href='http://backend.transcendance.com/auth/login' onClick={()=> {setPlay(true)}}>Play</a>
        </div>
        // <div className="cover flex pt-10 gap-3 h-fit">
        //     <img src={cover} alt="cover" className='imgcover z-10'/>
        //     <p className='sm:text-2xl text-xl z-20 md:mt-36 sm-40'>THE FINAL PROJECT</p>
        //     <p className='sm:text-6xl text-4xl font-extrabold font-sans z-20'>WRITTEN WITH PASSION</p>
        //     <p className='sm:text-xl text-base font-extrabold italic z-20 m-3 bg-purple-400 bg-opacity-40 rounded-md'>"By the laziest people on earth"<span className='font-extralight bg-purple-500'> - just an unpopular opinion</span></p>
        //     <Button className='primary z-20 mt-6' label='PLAY NOW' onClick={play}/>
        // </div>
    )
}
 export default Cover