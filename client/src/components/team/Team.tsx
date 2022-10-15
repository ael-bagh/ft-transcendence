import Member from "./Member";
import { Player } from "@lottiefiles/react-lottie-player";
export default function Team() {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-row items-center">
        <h1 className="md:text-4xl text-xl font-bold text-center text-gray-900 font-minecraft inline-block">
          Made with{" "}
        </h1>
        <Player
            autoplay
            loop
            src="https://lottie.host/31135658-43be-485b-bf42-8c1311f2a2bd/CU5BjoVQp9.json"
            style={{ height: "40px", width: "40px" }}
          />
      </div>

      <h2 className="md:text-2xl text-lg text-center text-gray-900 font-minecraft">
        by a wonderful team
      </h2>

      <div className="flex flex-col mt-5 md:flex-wrap">
        <Member
          name="Anas El baghdadi"
          image="https://images.unsplash.com/photo-1594751543129-6701ad444259?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2741&q=80"
          role="front-end dev"
          github="https://github.com/ael-bagh"
          linkedin="https://www.linkedin.com/in/anas-el-baghdadi-77494419b/"
          email="welldonesonreally@gmail.com"
          phone="+212 6 88 11 64 36"
          website="https://ael-bagh.github.io/"
        />
        <Member
          name="Anas El baghdadi"
          image="https://images.unsplash.com/photo-1594751543129-6701ad444259?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2741&q=80"
          role="front-end dev"
          github="https://github.com/ael-bagh"
          linkedin="https://www.linkedin.com/in/anas-el-baghdadi-77494419b/"
          email="welldonesonreally@gmail.com"
          phone="+212 6 88 11 64 36"
          website="https://ael-bagh.github.io/"
        />
        <Member
          name="Anas El baghdadi"
          image="https://images.unsplash.com/photo-1594751543129-6701ad444259?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2741&q=80"
          role="front-end dev"
          github="https://github.com/ael-bagh"
          linkedin="https://www.linkedin.com/in/anas-el-baghdadi-77494419b/"
          email="welldonesonreally@gmail.com"
          phone="+212 6 88 11 64 36"
          website="https://ael-bagh.github.io/"
        />
        <Member
          name="Anas El baghdadi"
          image="https://images.unsplash.com/photo-1594751543129-6701ad444259?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2741&q=80"
          role="front-end dev"
          github="https://github.com/ael-bagh"
          linkedin="https://www.linkedin.com/in/anas-el-baghdadi-77494419b/"
          email="welldonesonreally@gmail.com"
          phone="+212 6 88 11 64 36"
          website="https://ael-bagh.github.io/"
        />
      </div>
    </div>
  );
}
