import React, { useMemo, useRef, useState, useEffect } from "react";
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import ArMenu from "@/components/arMenu";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArDialog from "@/components/arDialog";
import { toast } from "react-toastify";
import { useFileStore } from "store"
import { downloadMultiDirectoryAsZip } from "domain/filesystem"

function ActionBar({ handleCopy, handleRename, selectedRows, getProjectList }) {
    const {
        deleteProject,
    } = useFileStore((state) => ({
        deleteProject: state.deleteProject,
    }));


    const downloadClick = () => {
        if (!selectedRows?.length > 0) {
            toast.warning("Please select project to delete");
            return;
        }
        let rootPathList = selectedRows.map((item) => item.title)
        downloadMultiDirectoryAsZip(rootPathList)
    }


    // delete project
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteProject = async () => {
        if (!selectedRows?.length > 0) {
            toast.warning("Please select project to delete");
            return;
        }

        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        console.log(selectedRows, 'selectedRows')
        for (let item of selectedRows) {
            await deleteProject({ dirpath: item.title });
        }
        getProjectList();
        setDeleteDialogOpen(false);
        toast.success("Delete project successful ");
    };


    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
    };


    return (
        <div className="flex items-center justify-center  p-2 rounded-lg ">

            {/* Group the first three buttons */}
            <div className="flex divide-x divide-gray-300">
                <Tooltip title="Download">
                    <IconButton
                        onClick={downloadClick}
                        variant="outlined"
                        className="rounded-full"
                        sx={{
                            borderColor: 'var(--black)',
                            color: 'var(--black)',
                            '&:hover': {
                                borderColor: '#687384',
                                backgroundColor: 'rgba(104, 115, 132, 0.04)'
                            },
                        }}
                    >
                        <CloudDownloadIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton
                        onClick={handleDeleteProject}
                        variant="outlined"
                        className="rounded-full"
                        sx={{
                            borderColor: 'var(--black)',
                            color: 'var(--black)',
                            '&:hover': {
                                borderColor: '#687384',
                                backgroundColor: 'rgba(104, 115, 132, 0.04)'
                            },
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
                {/* <Tooltip title="Print">
                    <IconButton
                        variant="outlined"
                        className="rounded-full"
                        sx={{
                            borderColor: 'var(--black)',
                            color: 'var(--black)',
                            '&:hover': {
                                borderColor: '#687384',
                                backgroundColor: 'rgba(104, 115, 132, 0.04)'
                            },
                        }}
                    >
                        <PrintIcon />
                    </IconButton>
                </Tooltip> */}
            </div>

            {/* Spacer */}
            {selectedRows.length == 1 && <div className="inline-block w-px h-6 bg-gray-300 mr-3"></div>}

            {/* <ArMenu
                buttonCom={
                    <Button
                        endIcon={<ExpandMoreIcon />}
                        variant="outlined"
                        className="rounded-full"
                        sx={{
                            borderColor: 'var(--black)',
                            color: 'var(--black)',
                            '&:hover': {
                                borderColor: '#687384',
                                backgroundColor: 'rgba(104, 115, 132, 0.04)'
                            },
                            fontWeight: 700,
                        }}
                    >
                        <h3>tag</h3>
                    </Button>
                }
                menuList={[
                    {
                        label: "New Project",
                        onClick: () => { },
                    },
                    {
                        label: "New aProject",
                        onClick: () => { },
                    },
                ]}
                menuProps={{
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'right',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                }}
                widthExtend={false}
            >
            </ArMenu> */}

            {/* More button */}
            {selectedRows.length == 1 && <ArMenu
                buttonCom={
                    <Button
                        endIcon={<ExpandMoreIcon />}
                        variant="outlined"
                        className="rounded-full"
                        sx={{
                            borderColor: 'var(--black)',
                            color: 'var(--black)',
                            '&:hover': {
                                borderColor: '#687384',
                                backgroundColor: 'rgba(104, 115, 132, 0.04)'
                            },
                            fontWeight: 700,
                        }}
                    >
                        <h3>More</h3>
                    </Button>
                }
                menuList={[
                    {
                        label: "Rename",
                        onClick: () => { handleRename(selectedRows?.[0]?.title) },
                    },
                    {
                        label: "Make a copy",
                        onClick: () => { handleCopy(selectedRows?.[0]?.title) },
                    },
                ]}
                menuProps={{
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'right',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                }}
                widthExtend={false}
            >
            </ArMenu>}
            <ArDialog
                title="Delete Project"
                dialogOpen={deleteDialogOpen}
                handleCancel={handleCancelDelete}
                buttonList={[
                    { title: "Cancel", click: handleCancelDelete },
                    { title: "Delete", click: handleConfirmDelete },
                ]}
            >
                <div>
                    <p className="m-[12.5px]">
                        You are about to delete the following projects:
                    </p>
                    <ul className="my-[12.5px] list-disc">
                        {selectedRows.map((item, index) => (
                            <li key={index} className="ml-[7%] mb-2">
                                <b>{item.title}</b>
                            </li>
                        ))}
                    </ul>
                    {/* <p>
                        Trashing projects won’t affect your collaborators.
                        <a href="" target="_blank" rel="noreferrer">Find out more.</a>
                    </p> */}
                </div>

            </ArDialog>
        </div>
    );
}

export default ActionBar;
