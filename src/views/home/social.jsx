import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/Button";

const Social = () => {
  return (
    <div className="flex w-full bg-white">
      <div className="w-1/2 p-4">
        <ul className="list-disc pl-5 mb-[80px]">
          <li className="my-8">
            <strong>Research network based SocialFi</strong>
            <ul className="list-circle pl-4 space-y-1  mt-4">
              <li className="my-2">
                chance to talk with academic leaders (key)
              </li>
              <li className="my-2">engage users from Editor</li>
            </ul>
          </li>
          <li className="my-8">
            <strong>A free space talk about research</strong>
            <ul className="list-circle pl-4 space-y-1  mt-4">
              <li className="my-2">instead of LinkedIn, IG, FB, X</li>
              <li className="my-2">team up with online researchers</li>
            </ul>
          </li>
          <li className="my-8">
            <strong>Community based research</strong>
            <ul className="list-circle pl-4 space-y-1  mt-4">
              <li className="my-2">get help from other researchers</li>
              <li className="my-2">easier interdisciplinary research</li>
              <li className="my-2">find under table project to invest</li>
            </ul>
          </li>
        </ul>
        <div className="flex flex-wrap -mx-2 mt-4">
          <div className="w-1/3 px-2 mb-4">
            <button className="border border-black rounded py-2 px-4 w-full bg-[#eeeeee]">
              Profile
            </button>
          </div>
          <div className="w-1/3 px-2 mb-4">
            <button className="border border-black rounded py-2 px-4 w-full bg-[#eeeeee]">
              Post
            </button>
          </div>
          <div className="w-1/3 px-2 mb-4">
            <button className="border border-black rounded py-2 px-4 w-full bg-[#eeeeee]">
              Follow
            </button>
          </div>
          <div className="w-1/3 px-2 mb-4">
            <button className="border border-black rounded py-2 px-4 w-full bg-[#eeeeee]">
              Chat
            </button>
          </div>
          <div className="w-1/3 px-2 mb-4">
            <button className="border border-black rounded py-2 px-4 w-full bg-[#eeeeee]">
              Community
            </button>
          </div>
          <div className="w-1/3 px-2 mb-4">
            <button className="border border-black rounded py-2 px-4 w-full bg-[#eeeeee]">
              Bounty
            </button>
          </div>
        </div>
      </div>
      <div className="w-1/2">
        <img
          src="./assets/social1.png"
          alt="Research Image"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

export default Social;
