import React, { useEffect, useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
} from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import { getAllTags, uploadDocument } from "services";
import { useFileStore } from "store";
import { toast } from "react-toastify";
import PreviewPdf from "@/components/previewPdf";
import { saveZipToBlob } from "domain/filesystem";
import ArDialog from "@/components/arDialog";
import ArButton from "@/components/arButton";
import { useUserStore, updateDialogLoginOpen, usePdfPreviewStore } from "store";

import publish from "@/assets/publish.svg";
import Tooltip from "@/components/tooltip";

const ProductDialog = () => {
  const { pdfUrl } = usePdfPreviewStore((state) => ({
    pdfUrl: state.pdfUrl,
  }));
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const { accessToken, updateAccessToken } = useUserStore();
  const handleOpenPublish = () => {
    console.log(accessToken, "cookie");
    if (!accessToken || accessToken == "") {
      updateDialogLoginOpen(true);
      toast.warning("Please login");
      return;
    }
    // if (!pdfUrl) {
    //   toast.warning("Please compile first");
    //   return;
    // }
    setOpenPublishDialog(true);
  };

  const handleClosePublish = () => {
    setOpenPublishDialog(false);
  };

  const { currentProjectRoot } = useFileStore((state) => ({
    currentProjectRoot: state.currentProjectRoot,
  }));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [customTags, setCustomTags] = useState([]);

  const [selectedTags, setSelectedTags] = useState([]);

  const handleSelectTag = (event) => {
    const value = event.target.value;
    setSelectedTags(typeof value === "string" ? value.split(",") : value);
  };

  const renderSelectedTags = (selected) => {
    return selected.join(", ");
  };

  const getAllTagsList = async () => {
    try {
      const list = await getAllTags();
      setCustomTags(list.data.tags);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllTagsList();
  }, []);

  const handleAddCustomTag = () => {
    const newTag = prompt("Enter new tag:");
    if (newTag) {
      setCustomTags((prevTags) => [...prevTags, newTag]);
      //   setTag(newTag);
    }
  };

  const handlePublish = () => {
    setLoading(true);

    if (!pdfUrl) {
      toast.warning("Please compile first");
      setLoading(false);
      return;
    }
    if (!content || !title || !selectedTags || selectedTags.length === 0) {
      // 如果任何一个不存在或为空，则显示警告信息
      toast.warning("Content, title, and tags must not be empty.");
      setLoading(false);
      return; // 阻止执行后续代码
    }
    // downloadDirectoryAsZip(currentProjectRoot)
    saveZipToBlob(currentProjectRoot).then((zipFile) => {
      // 如果pdfUrl存在，则继续执行上传文档的过程
      if (pdfUrl) {
        uploadDocument({
          uploadType: "1",
          blobUrl: pdfUrl,
          content: content,
          title: title,
          tags: selectedTags,
          zipFile,
          currentProjectRoot,
        }).then((res) => {
          handleClosePublish();
          toast.success("Publish success");
          setTitle("");
          setContent("");
          setSelectedTags([]);
          setLoading(false);
        });
      }
    });
  };

  const commonStyles = {
    height: "32px",
    ".MuiInputBase-root": { height: "32px" },
    ".MuiButton-root": { height: "32px", lineHeight: "32px" },
    ".MuiInputLabel-root": {
      lineHeight: "1", // Set line height to 1 for all label states
      "&.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)", // Adjust label position when shrunk
      },
    },
    ".MuiFormControl-root": {
      lineHeight: "1", // Set line height to 1 for all label states
      "&.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)", // Adjust label position when shrunk
      },
    },
  };

  const [previewOpen, setPreviewOpen] = useState(false);

  const handleOpenPreview = () => {
    if (!pdfUrl) {
      toast.warning("Please compile first");
      return;
    }
    setPreviewOpen(true);
  };
  const [loading, setLoading] = useState(false);

  return (
    <React.Fragment>
      <Tooltip content="Share Your Project" position="bottom">
        <button
          className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2] space-x-1 `}
          onClick={() => {
            handleOpenPublish();
          }}
        >
          <img src={publish} alt="" className="w-4 h-4" />
          <span>Publish</span> {/* 使用空格字符 */}
        </button>
      </Tooltip>
      <ArDialog
        title="Publish Product"
        dialogOpen={openPublishDialog}
        handleCancel={handleClosePublish}
        buttonList={[
          { title: "Cancel", click: handleClosePublish },
          { title: "Publish", click: handlePublish, loading: loading },
        ]}
        width={"40vw"}
        PaperProps={{
          style: {
            maxHeight: "70vh",
          },
        }}
      >
        <div className="space-y-6">
          <TextField
            fullWidth
            size="small"
            label="Title"
            variant="outlined"
            value={title}
            InputLabelProps={{
              style: { lineHeight: "1" },
            }}
            InputProps={{
              style: { height: "32px" },
            }}
            sx={commonStyles}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Content"
            variant="outlined"
            multiline
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ background: "var(--white)" }}
          />

          <FormControl
            fullWidth
            size="small"
            style={{ height: "34px" }}
            sx={commonStyles}
          >
            <InputLabel id="tag-label" className="h-full">
              Tag
            </InputLabel>
            <Select
              labelId="tag-label"
              sx={{ background: "var(--white)", height: "100%" }}
              variant="outlined"
              value={selectedTags}
              label="Tag"
              onChange={handleSelectTag}
              className="h-full"
              multiple
              renderValue={renderSelectedTags}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: "150px",
                  },
                },
              }}
            >
              {customTags.map((option) => (
                <MenuItem
                  key={option.name}
                  value={option.name}
                  sx={{ padding: "0" }}
                >
                  <Checkbox
                    checked={selectedTags.includes(option.name)}
                    size="small"
                  />
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="flex items-center gap-2 my-2">
            <TextField
              fullWidth
              size="small"
              label="File"
              id="outlined-disabled"
              variant="outlined"
              value={pdfUrl ? `${currentProjectRoot}.pdf` : ""}
              sx={{
                "& .MuiInputBase-readOnly": {
                  bgcolor: "#a49f9f33 !important", // 覆盖外边框的背景颜色
                },
                ...commonStyles,
              }}
              InputProps={{
                readOnly: true,
                style: { background: "#a49f9f33" },
              }}
            />
            <ArButton
              onClick={() => {
                handleOpenPreview();
              }}
              className="bg-arxTheme text-white py-2 rounded hover:bg-arx-theme-hover rounded-lg text-sm"
            >
              PREVIEW
            </ArButton>
          </div>
        </div>
        <PreviewPdf
          dialogStyle={{
            height: "90vh",
            width: "70vw",
          }}
          open={previewOpen}
          setOpen={setPreviewOpen}
          pdfUrl={pdfUrl}
        />
      </ArDialog>
    </React.Fragment>
  );
};

export default ProductDialog;
