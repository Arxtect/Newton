/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-30 13:10:13
 */

import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import ArMenu from "@/components/arMenu";
import { getMe, logoutUser } from "services";
import { useUserStore } from "store";
import { toast } from "react-toastify";
import { HashLink } from "react-router-hash-link";

const UserMenu = () => {
  const [username, setUsername] = useState("");
  const { accessToken, updateAccessToken } = useUserStore((state) => ({
    accessToken: state.accessToken,
  }));

  useEffect(() => {
    getMe()
      .then((res) => {
        if (res?.data) {
          setUsername(res.data.user.name);
        } else {
          setUsername("");
        }
      })
      .catch((error) => {
        setUsername("");
      });
  }, [accessToken]);

  const onLogout = () => {
    logoutUser()
      .then((res) => {
        setUsername("");
      })
      .catch((error) => {
        toast.error("Error logging out");
      });
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    handleClose();
  };

  return (
    <div>
      {accessToken && username ? (
        <>
          <ArMenu
            buttonCom={
              <a
                className="lg:ml-8 px-4 flex justify-center text-[1.1rem] text-gray-900 font-[600] cursor-pointer  hover:text-blue-900"
                aria-controls="user-menu"
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                {username}
              </a>
            }
            menuList={[
              {
                label: "Logout",
                onClick: () => {
                  handleLogout();
                },
              },
            ]}
          ></ArMenu>
        </>
      ) : (
        <>
          <div className="hidden lg:block lg:flex item-center space-x-4 ml-20">
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
          <div className="sm:block md:block lg:hidden space-y-6 ">
            <HashLink
              className="block text-gray-900 hover:bg-white-hover  items-center justify-center px-8 py-2 text-lg font-bold shadow-xl rounded-[0.4rem] border border-gray-900"
              smooth
              to="/login"
            >
              Login
            </HashLink>
            <HashLink
              className="block  text-white bg-arxTheme hover:bg-arx-theme-hover  items-center justify-center px-8 py-2 text-lg font-bold shadow-xl rounded-[0.4rem]"
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
