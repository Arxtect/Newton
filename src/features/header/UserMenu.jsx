/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-30 13:10:13
 */

import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import ArMenuRadix from "@/components/arMenuRadix";
import { logoutUser } from "services";
import { useUserStore } from "store";
import { toast } from "react-toastify";
import { HashLink } from "react-router-hash-link";

const UserMenu = () => {
  const [userInfo, setUserInfo] = useState({});
  const { user,updateUser,accessToken, updateAccessToken } = useUserStore((state) => ({
    user:state.user,
    updateUser:state.updateUser,
    accessToken: state.accessToken,
    updateAccessToken: state.updateAccessToken
  }));



  useEffect(() => {
    setUserInfo(user);
  }, [user]);

  const onLogout = () => {
    logoutUser()
      .then((res) => {
        setUserInfo("");
        updateAccessToken("")
              updateAccessToken("");
        updateUser({})
      })
      .catch((error) => {
        toast.error("Error logging out");
      });
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div>
      {user?.id ? (
        <>
          <div className="lg:ml-8 px-4">
            <ArMenuRadix
              buttonClassName={
                "bg-arxTheme hover:bg-arx-theme-hover text-[1.1rem] text-white font-bold py-2 shadow-xl rounded-[0.4rem] border border-arxTheme px-4 py-2 rounded-md "
              }
              title={"Account"}
              items={[
                {
                  label: userInfo?.email,
                  onSelect: () => console.log("Email Selected"),
                  separator: true,
                },
                {
                  label: "Account Settings",
                  onSelect: () => console.log("Account Settings Selected"),
                  separator: true,
                },
                {
                  label: "Log Out",
                  onSelect: () => handleLogout(),
                },
              ]}
            ></ArMenuRadix>
          </div>
        </>
      ) : (
        <>
          <div className="hidden lg:block lg:flex item-center space-x-4 ml-20">
            <HashLink
              className="text-gray-900 hover:bg-white-hover inline-flex items-center justify-center px-8 py-2 text-[1.1rem] font-bold shadow-xl rounded-[0.4rem] border border-gray-900"
              smooth
              to="/login"
            >
              Login
            </HashLink>
            <HashLink
              className="text-white bg-arxTheme hover:bg-arx-theme-hover inline-flex items-center justify-center px-8 py-2 text-[1.1rem] font-bold shadow-xl rounded-[0.4rem] whitespace-nowrap overflow-hidden text-ellipsis"
              smooth
              to="/register"
            >
              Sign up
            </HashLink>
          </div>
          <div className="sm:block md:block lg:hidden space-y-6 ">
            <HashLink
              className="block text-gray-900 hover:bg-white-hover  items-center justify-center px-8 py-2 text-[1.1rem] font-bold shadow-xl rounded-[0.4rem] border border-gray-900 text-center"
              smooth
              to="/login"
            >
              Login
            </HashLink>
            <HashLink
              className="block  text-white bg-arxTheme hover:bg-arx-theme-hover  items-center justify-center px-8 py-2 text-[1.1rem] font-bold shadow-xl rounded-[0.4rem] whitespace-nowrap"
              smooth
              to="/register"
            >
              Sign up
            </HashLink>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
