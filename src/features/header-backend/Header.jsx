/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Button,
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import logo from "@/assets/logo.png";
import { getMe } from "services";
import { getCookie } from "@/util";
import { useUserStore } from "store";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { logoutUser } from "@/services"
import { toast } from "react-toastify"
import ArMenu from "@/components/arMenu";

const UserMenu = ({ accessToken, username, onLogout }) => {
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
              <Button
                className="text-black font-normal"
                aria-controls="user-menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                {username}
              </Button>
            }
            menuList={[
              {
                label: "Logout",
                onClick: () => { handleLogout() },
              },
            ]}

          >
          </ArMenu>
          {/* <Button
            className="text-black font-normal"
            aria-controls="user-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            {username}
          </Button> */}
        </>
      ) : (
        <Button component={Link} to="/login" className="text-black font-normal">
          Login
        </Button>
      )}
    </div>
  );
};

export const Header = () => {
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
    logoutUser().then((res) => {
      setUsername("");
    }).catch((error) => {
      toast.error("Error logging out");
    })

  }

  return (
    <header className="flex justify-between items-center">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          sx={{
            backgroundColor: "var(--second) ",
          }}
        >
          <Toolbar>
            {/* <IconButton
              size="large"
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton> */}
            <Typography
              variant="h6"
              component="div"
              className="flex items-center"
              sx={{ flexGrow: 1 }}
            >
              <img src={logo} alt="logo" className="h-12" />
              {/* <div className="text-black font-medium">arXtect</div> */}
            </Typography>
            <Button className="text-black font-normal mr-4">
              <Link to="/">Home</Link>
            </Button>
            <Button className="text-black font-normal mr-4">
              <Link to="/project">Newton</Link>
            </Button>
            <Button className="text-black font-normal mr-4">
              <Link to="/einstein">Einstein</Link>
            </Button>
            {/* <Button className="text-black font-normal  mr-4"> <Link to="/arxtect">newton demo</Link></Button> */}
            {/* <Button className="text-black font-normal">
              {accessToken && username ? (
                username
              ) : (
                <Link to="/login">Login</Link>
              )}
            </Button> */}
            <UserMenu accessToken={accessToken} username={username} onLogout={onLogout}>

            </UserMenu>
          </Toolbar>
        </AppBar>
      </Box>
      {/* <h1 className="inline-block font-bold text-4xl">
        <Link to="/">LaTeX Table Viewer</Link>
      </h1>
      <nav>
        <ul className="list-none inline-flex justify-around items-center gap-12 text-xl text-center">
          <li>
            <NavLink to="/">
              <Button variant="contained">App</Button>
            </NavLink>
          </li>
        </ul>
      </nav> */}
    </header>
  );
};
