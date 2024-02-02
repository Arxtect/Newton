/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-03-28 11:37:22
 */
import {
  FormHelperText,
  Typography,
  FormControl,
  Input as _Input,
  InputProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Controller, useFormContext } from "react-hook-form";

const Input = styled(_Input)`
  background-color: white;
  padding: 0.4rem 0.7rem;
`;

const FormText = ({ name, label, ...otherProps }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      control={control}
      defaultValue=""
      name={name}
      render={({ field }) => (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ color: "var(--primary);", mb: 1, fontWeight: 500 }}
          >
            {label}
          </Typography>
          <Input
            {...field}
            fullWidth
            disableUnderline
            sx={{ borderRadius: "1rem" }}
            error={!!(errors)[name]}
            {...otherProps}
          />
          <FormHelperText error={!!errors[name]}>
            {(errors )?.[name] ? (errors)?.[name].message : ""}
          </FormHelperText>
        </FormControl>
      )}
    />
  );
};

export default FormText;
