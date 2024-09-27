import React, { useMemo, useRef, useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@/components/tooltip";

import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArDialog from "@/components/arDialog";
import { toast } from "react-toastify";
import { useFileStore } from "store";
import { downloadMultiDirectoryAsZip } from "domain/filesystem";
import ArMenuRadix from "@/components/arMenuRadix";

function ActionBar({
  handleCopy,
  handleRename,
  selectedRows,
  getProjectList,
  auth,
  user,
}) {
  const { deleteProject } = useFileStore((state) => ({
    deleteProject: state.deleteProject,
  }));

  const downloadClick = () => {
    const isAuth = auth(!user || JSON.stringify(user) === "{}", () => {
      let rootPathList = selectedRows.map((item) => item.title);
      downloadMultiDirectoryAsZip(rootPathList);
    });
    if (isAuth) return;
    if (!selectedRows?.length > 0) {
      toast.warning("Please select project to delete");
      return;
    }
    let rootPathList = selectedRows.map((item) => item.title);
    downloadMultiDirectoryAsZip(rootPathList);
  };

  // delete project
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteProject = async () => {
    const isAuth = auth(!user || JSON.stringify(user) === "{}", () => {
      setDeleteDialogOpen(true);
    });
    if (isAuth) return;
    if (!selectedRows?.length > 0) {
      toast.warning("Please select project to delete");
      return;
    }

    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    console.log(selectedRows, "selectedRows");
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
    <div className="flex items-center justify-center px-2 rounded-lg ">
      {/* Group the first three buttons */}
      <div className="flex">
        <Tooltip content="Download" position="bottom">
          <IconButton
            onClick={downloadClick}
            variant="outlined"
            className="rounded-full"
            sx={{
              borderColor: "var(--black)",
              color: "var(--black)",
              "&:hover": {
                borderColor: "#687384",
                backgroundColor: "rgba(104, 115, 132, 0.04)",
              },
            }}
          >
            <CloudDownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Delete" position="bottom">
          <IconButton
            onClick={handleDeleteProject}
            variant="outlined"
            className="rounded-full"
            sx={{
              borderColor: "var(--black)",
              color: "var(--black)",
              "&:hover": {
                borderColor: "#687384",
                backgroundColor: "rgba(104, 115, 132, 0.04)",
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>

      {/* Spacer */}
      {selectedRows.length == 1 && (
        <div className="inline-block w-px h-6 bg-gray-300 mr-3"></div>
      )}

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
      {selectedRows.length == 1 && (
        <ArMenuRadix
          align="left"
          buttonClassName={
            "border-1 border-black text-black hover:border-[#687384] hover:bg-[#687384]/[.04] font-bold rounded-xl px-2 py-1"
          }
          title={"More"}
          items={[
            {
              label: "Rename",
              onSelect: () => {
                handleRename(selectedRows?.[0]?.title);
              },
            },
            {
              label: "Make a copy",
              onSelect: () => {
                handleCopy(selectedRows?.[0]?.title);
              },
            },

            // {
            //   label: "Templates",
            //   separator: true,
            //   type: "radio",
            //   onSelect: (v) => console.log("Book", v),
            //   value: "book",
            //   subMenu: [
            //     {
            //       label: "Academic Journal",
            //       value: "Academic",
            //     },
            //     {
            //       label: "Book",
            //       value: "book",
            //     },
            //   ],
            // },
          ]}
        ></ArMenuRadix>
      )}
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
