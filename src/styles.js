/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-02-02 16:18:49
 */
export const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "calc(100vh - 66px)",
  width: "100vw",
  // backgroundColor: '#000000cc',
};

export const box = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};

export const TypographySm = {
  color: "var(--primary)",
  fontWeight: 500,
  fontSize: { xs: "2rem", md: "3rem" },
  mb: 2,
  letterSpacing: 1,
  textShadow: `0px -1px 0px white`,
};

export const formBox = {
  backgroundColor: "var(--second)",
  p: { xs: "1rem", sm: "2rem" },
  borderRadius: 2,
};
