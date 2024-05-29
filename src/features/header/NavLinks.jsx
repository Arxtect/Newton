import React from "react";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";

const NavLinksLg = () => {
  return (
    <div className="flex justify-between items-center mr-10 ">
      <div className="flex items-center space-x-7">
        <a
          className="px-4 flex justify-center text-[1.2rem] font-[600] text-dark hover:text-blue-900"
          smooth
          href="/"
        >
          Home
        </a>
        <a
          className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
          smooth
          href="/#about"
        >
          About
        </a>
        <a
          className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
          smooth
          href="/project"
        >
          Editor
        </a>
        <a
          className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
          href="/project/#einstein"
        >
          Publishing
        </a>
        <a
          className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
          href="/#social"
        >
          Social
        </a>
        <a
          className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
          href="/contact/#contact"
        >
          Join us
        </a>
      </div>
      <div className="flex item-center space-x-4 ml-20 ">
        <HashLink
          className="text-gray-900 hover:bg-white-hover inline-flex items-center justify-center px-8 py-2 text-lg font-bold shadow-xl rounded-[0.4rem] border border-gray-900"
          smooth
          to="/login"
        >
          Login
        </HashLink>
        <HashLink
          className="text-white bg-arxTheme hover:bg-arx-theme-hover inline-flex items-center justify-center px-8 py-2 text-lg font-bold shadow-xl rounded-[0.4rem]"
          smooth
          to="/register"
        >
          Sign up
        </HashLink>
      </div>
    </div>
  );
};

const NavLinksSm = () => {
  return (
    <>
      <a
        className="px-4 flex justify-center text-[1.2rem] font-[600] text-dark hover:text-blue-900"
        smooth
        href="/"
      >
        Home
      </a>
      <a
        className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
        smooth
        href="/#about"
      >
        About
      </a>
      <a
        className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
        smooth
        href="/project"
      >
        Editor
      </a>
      <a
        className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
        href="/project/#einstein"
      >
        Publishing
      </a>
      <a
        className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
        href="/#social"
      >
        Social
      </a>
      <a
        className="px-4 flex justify-center text-[1.2rem] font-[600] text-gray-900 hover:text-blue-900"
        href="/contact/#contact"
      >
        Join us
      </a>
      <HashLink
        className="text-gray-900 hover:bg-white-hover inline-flex items-center justify-center px-8 py-2 text-lg font-bold shadow-xl rounded-[0.4rem] border border-gray-900"
        smooth
        to="/login"
      >
        Login
      </HashLink>
      <HashLink
        className="text-white bg-arxTheme hover:bg-arx-theme-hover inline-flex items-center justify-center px-8 py-2 text-lg font-bold shadow-xl rounded-[0.4rem]"
        smooth
        to="/register"
      >
        Sign up
      </HashLink>
    </>
  );
};

export { NavLinksLg, NavLinksSm };
