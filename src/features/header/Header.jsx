import { Link, NavLink } from "react-router-dom";

export const Header = () => {
  return (
    <header className="flex justify-between items-center mb-4">
      <h1 className="inline-block font-bold text-4xl">
        <Link to="/">LaTeX Table Viewer</Link>
      </h1>
      <nav>
        <ul className="list-none inline-flex justify-around items-center gap-12 text-xl text-center">
          <li>
            <NavLink to="/">App</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};
