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

export const Header = () => {
  return (
    <header className="flex justify-between items-center mb-3">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" className="bg-primary">
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <div className="text-black font-light	">LaTeX</div>
            </Typography>
            <Button className="text-black font-normal	">Login</Button>
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
