/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
import { Link, NavLink } from "react-router-dom";
import {
  Button,
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import logo from '../../assets/logo.png';

export const Header = () => {
  return (
    <header className="flex justify-between items-center">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" className="flex items-center" sx={{ flexGrow: 1 }}>
              <img src={logo} alt="logo" className="h-12" />
              {/* <div className="text-black font-medium">arXtect</div> */}
            </Typography>
            <Button className="text-black font-normal mr-4"> <Link to="/">Home</Link></Button>
            <Button className="text-black font-normal  mr-4"> <Link to="/arxtect">ArXtect</Link></Button>
            <Button className="text-black font-normal">Login</Button>
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
