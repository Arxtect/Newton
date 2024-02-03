import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogActions,
  Checkbox,
  InputAdornment,
  TextareaAutosize,
} from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import { getAllTags, uploadDocument } from "services";
import { useFileStore } from "store";
import { toast } from "react-toastify";

const ProductDialog = ({ open, pdfUrl, handleClosePublish }) => {
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
    const list = await getAllTags();
    setCustomTags(list.data.tags);
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
    if (!pdfUrl) {
      toast.warning("Please compile first");
      return;
    }
    if (!content || !title || !selectedTags || selectedTags.length === 0) {
      // 如果任何一个不存在或为空，则显示警告信息
      toast.warning("Content, title, and tags must not be empty.");
      return; // 阻止执行后续代码
    }

    // 如果pdfUrl存在，则继续执行上传文档的过程
    if (pdfUrl) {
      uploadDocument({
        uploadType: "1",
        blobUrl: pdfUrl,
        content: content,
        title: title,
        tags: selectedTags,
        fileHash: "cdasdtronomy7b788f",
      }).then((res) => {
        console.log(res);
        handleClosePublish();
        toast.success("Publish success");
      });
    }
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

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClosePublish}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          maxHeight: "70vh",
        },
      }}
    >
      <DialogTitle>Publish Product</DialogTitle>
      <DialogContent className="pt-[20px]">
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
                  key={option.Name}
                  value={option.Name}
                  sx={{ padding: "0" }}
                >
                  <Checkbox
                    checked={selectedTags.includes(option.Name)}
                    size="small"
                  />
                  {option.Name}
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
            <Button
              onClick={() => {
                handleOpenPreview();
              }}
              variant="contained"
              sx={{ height: "32px" }}
            >
              Preview
            </Button>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClosePublish}>Cancel</Button>
        <Button onClick={handlePublish}>Publish</Button>
      </DialogActions>
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            height: "90vh",
            width: "70vw",
          },
        }}
      >
        <DialogContent className="p-0">
          <embed
            src={pdfUrl}
            width="100%"
            height="100%"
            type="application/pdf"
            className="h-full w-full"
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ProductDialog;
