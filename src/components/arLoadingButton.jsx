import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';


const ArLoadingButton = ({ onClick, loading = false, color, variant, children, ...res }) => {
    return <LoadingButton
        variant={variant}
        color={color}
        data-toggle="modal"
        data-target="#modalViewSource"
        onClick={onClick}
        loading={loading}
        loadingIndicator={
            <CircularProgress color={color} size={24} />
        }
        {...res}
    >
        {children}
    </LoadingButton>
}

export default ArLoadingButton