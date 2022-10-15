// import social media icons from react-icons
import {FaGithub, FaLinkedin, FaTwitter} from "react-icons/fa"

export default function Member(props:{name: string , role: string , image: string , github: string | undefined, linkedin: string | undefined, email: string | undefined, phone: string | undefined, website: string| undefined}) {
  return (
  <div className="m-auto mb-1">
    <div className="flex flex-col text-start">
      <div className="flex flex-row gap-2">
        <img className="h-16 w-16 grayscale" src="https://randomuser.me/api/portraits/men/78.jpg" alt="" />
        <div className="flex flex-col text-left">
          <div className="font-medium text-base text-gray-100">Terry Sherman</div>
          <div className="text-gray-500 text-sm whitespace-nowrap">Senior Software Developer</div>
          <div className="flex flex-row gap-4 text-gray-100">
            <a href="#" className="hover:text-gray-500 w-2 h-2"> <FaGithub className="w-4 h-4" /> </a>
            <a href="#" className="hover:text-gray-500 w-2 h-2"> <FaLinkedin className="w-4 h-4" /> </a>
            <a href="#" className="hover:text-gray-500 w-2 h-2"> <FaTwitter className="w-4 h-4" /> </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
