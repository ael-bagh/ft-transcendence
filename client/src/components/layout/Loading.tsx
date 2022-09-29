import {Player} from '@lottiefiles/react-lottie-player'
export function Loading(){
    return (    
    <div className="items-center justify-center bg-black text-white h-fit w-fit">
    <Player
      autoplay
      loop
      src="https://assets6.lottiefiles.com/packages/lf20_3oNnuO.json"
      style={{ height: "300px", width: "300px" }}
    ></Player>
  </div>)
}

export function Searching(){
  return (    
  <div className="items-center justify-center bg-black text-white h-fit w-fit">
  <Player
    autoplay
    loop
    src="https://assets3.lottiefiles.com/packages/lf20_cdlaxvqk.json"
    style={{ height: "15px", width: "15px" }}
  ></Player>
</div>)
}