import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";

const ArLoadingButton = ({
  onClick,
  loading = false,
  color,
  variant,
  children,
  ...res
}) => {
  return (
    <LoadingButton
      variant={variant}
      color={color}
      data-toggle="modal"
      data-target="#modalViewSource"
      onClick={onClick}
      loading={loading}
      loadingIndicator={<CircularProgress color={color} size={24} />}
      sx={{
        "&.MuiLoadingButton-loading": {
          color: "inherit", // 覆盖透明色
        },
        "&.Mui-disabled": {
          color: "#6c757d7d", // 覆盖禁用颜色
          border: `1px solid`,
        },
      }}
      {...res}
    >
      {children}
    </LoadingButton>
  );
};

export default ArLoadingButton;
