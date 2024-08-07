import {
  Button,
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";

const UploadProgressBar = ({ progress }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      mt={1}
      border="1px solid lightgray"
      borderRadius="4px"
      position="relative"
    >
      <Box width="100%" position="absolute" top={0} left={0}>
        <LinearProgress
          variant="determinate"
          value={progress * 100}
          className="color-[#176cd0] h-[2px]"
        />
      </Box>
      <Box display="flex" p={1.5}>
        <CircularProgress size={20} thickness={5} className="color-[#176cd0]" />
        <Typography variant="body2" ml={1}>
          {`Uploading: ${Math.round(progress * 100)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

export default UploadProgressBar