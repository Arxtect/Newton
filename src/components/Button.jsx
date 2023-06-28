import { Button as MuiButton } from "@mui/material";

export const Button = ({ onClick, sticky = false, children }) => {
  // Base classes
  // const baseClasses =
  //   "inline-block py-2 px-5 font-bold text-black border-2 border-black";
  // // If we want the button to be sticky, flip the colors
  // const dynamicClasses = sticky
  //   ? `border-dotted hover:border-solid`
  //   : `border-solid hover:border-dotted`;

  // Return a styled button, where the text is passed as child prop
  return (
    <MuiButton
      variant="outlined"
      onClick={onClick}
      // className={`${baseClasses} ${dynamicClasses}`}
    >
      {children}
    </MuiButton>
  );
};
