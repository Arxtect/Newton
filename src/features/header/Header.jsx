import { Link, NavLink } from "react-router-dom";
// import Button from "@mui/material/Button";

export const Header = () => {
  return (
    <header className="flex justify-between items-center mb-4">
      <h1 className="inline-block font-bold text-4xl">
        <Link to="/">LaTeX Table Viewer</Link>
      </h1>
      <nav>
        <ul className="list-none inline-flex justify-around items-center gap-12 text-xl text-center">
          <li>
            <NavLink to="/">
              App
              {/* <Button variant="contained">App</Button> */}
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};
