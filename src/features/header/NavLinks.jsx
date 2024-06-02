import React from "react";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";

const NavLinksLg = () => {
  return (
    <div className="flex justify-between items-center mr-10 ">
      <div className="flex items-center space-x-7">
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-dark hover:text-blue-900 "
          smooth
          href="/"
        >
          Home
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900 "
          smooth
          href="/#about"
        >
          About
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
          smooth
          href="/project"
        >
          Editor
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
          href="/project/#einstein"
        >
          Publishing
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
          href="/#social"
        >
          Social
        </a>
        <a
          className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis"
          href="/contact/#contact"
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
        smooth
        href="/"
      >
        Home
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        smooth
        href="/#about"
      >
        About
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        smooth
        href="/project"
      >
        Editor
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        href="/project/#einstein"
      >
        Publishing
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        href="/#social"
      >
        Social
      </a>
      <a
        className="px-4 flex justify-center text-[1.1rem] font-[600] text-gray-900 hover:text-blue-900"
        href="/contact/#contact"
      >
        Join us
      </a>
      <UserMenu></UserMenu>
    </>
  );
};

export { NavLinksLg, NavLinksSm };
