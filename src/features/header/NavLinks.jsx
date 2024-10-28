import React from "react";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import { ArxtectrURL } from "@/constant";

const NavLinksLg = () => {
  return (
    <div className="flex justify-between items-center mr-10 ">
      <div className="flex items-center space-x-7">
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-dark hover:text-blue-900 "
          href={`${ArxtectrURL}/#home`}
        >
          Home
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900 "
          href={`${ArxtectrURL}/#about`}
        >
          About
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
          href="/#/project"
        >
          Editor
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
          href="/#/einstein"
        >
          Publishing
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
          href={`${ArxtectrURL}/#social`}
        >
          Social
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis"
          href={`${ArxtectrURL}/contact/#contact`}
        >
          Join us
        </a>
      </div>
      <UserMenu></UserMenu>
    </div>
  );
};

const NavLinksSm = () => {
  return (
    <>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-dark hover:text-blue-900"
        href={`${ArxtectrURL}/#home`}
      >
        Home
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        href={`${ArxtectrURL}/#about`}
      >
        About
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        href="/#/project"
      >
        Editor
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        href="/#/einstein"
      >
        Publishing
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        href={`${ArxtectrURL}/#social`}
      >
        Social
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        href={`${ArxtectrURL}/contact/#contact`}
      >
        Join us
      </a>
      <UserMenu></UserMenu>
    </>
  );
};

export { NavLinksLg, NavLinksSm };
