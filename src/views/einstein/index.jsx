import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Box,
  Container,
  Paper,
  Typography,
  Checkbox,
  Pagination,
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import PreviewImage from "@/components/previewImage";
import { getAllTags, documentSearch } from "services";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { updateDialogLoginOpen } from "@/store";
import { useUserStore } from "store";
import { getPreViewUrl } from "@/util";
import ArButton from "@/components/arButton";

const Einstein = () => {
  const [page, setPage] = React.useState(1);
  const [documentsList, setDocumentsList] = React.useState([]);
  const [keyword, setKeyword] = React.useState("");
  const [customTags, setCustomTags] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const { accessToken, updateAccessToken } = useUserStore();

  const navigate = useNavigate();

  const handleKeywordChange = (event) => {
    // 更新 state 以反映输入框的当前值
    setKeyword(event.target.value);
  };

  const [selectedTags, setSelectedTags] = useState([]);

  const handleSelectTag = (event) => {
    const value = event.target.value;
    setSelectedTags(typeof value === "string" ? value.split(",") : value);
  };

  useEffect(() => {
    setSelectedTags([]);
  }, []);

  const renderSelectedTags = (selected) => {
    console.log(selected, "selected");
    if (selected.length < 2) {
      return selected.join(", ");
    }
    return selected.filter((item) => item !== "All")?.join(", ");
  };

  const getAllTagsList = async () => {
    const list = await getAllTags();
    setCustomTags(list.data.tags);
  };

  useEffect(() => {
    getAllTagsList();
  }, []);

  const searchDocuments = async (page, filter, keyword) => {
    console.log(page, filter, keyword, "page, filter, keyword");
    let searchCondition = {
      pageIndex: page,
      tags: [],
      keyword: "",
    };
    if (filter.length > 0) {
      searchCondition.tags = filter.filter((item) => item !== "All");
    }
    if (keyword && keyword !== "") {
      searchCondition.keyword = keyword;
    }
    let list = await documentSearch(searchCondition);
    setDocumentsList(list.data.documents);
    setTotalDocuments(list.data.total);
    console.log(list.data.documents, "list.data.documents");
  };

  // Custom styles to ensure all elements have the same height
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
    ".MuiSelect-select": { height: "32px", lineHeight: "32px" },
  };

  const itemsPerPage = 10;
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    searchDocuments(newPage, selectedTags, keyword);
  };

  const pageCount = Math.ceil(totalDocuments / itemsPerPage);

  // Get the documents for the current page

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // 调用您的搜索函数
      searchDocuments(1, selectedTags, keyword);
    }
  };
  useEffect(() => {
    searchDocuments(1, selectedTags, keyword);
  }, []);

  const handleToEditor = (StorageKey) => {
    console.log(accessToken, "cookie");
    if (!accessToken || accessToken == "") {
      toast.warning("Please login");
      updateDialogLoginOpen(true);
      return;
    }
    navigate(`/documentdetails?id=${StorageKey}`);
  };

  return (
    <Container>
      <h1 className="text-4xl font-bold mt-10 mb-4">Einstein</h1>
      <p className="mb-10">
        Einstein of powerful LaTeX packages and techniques in use — a great way
        to learn LaTeX by example. Search or browse below.
      </p>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <FormControl
          size="small"
          style={{ width: 150, height: "34px" }}
          sx={commonStyles}
        >
          <InputLabel id="tag-label" className="h-full">
            Tag
          </InputLabel>
          <Select
            labelId="tag-label"
            sx={{ background: "var(--white)", height: "100%" }}
            variant="outlined"
            value={selectedTags?.length != 0 ? selectedTags : ["All"]}
            label="Tag"
            onChange={handleSelectTag}
            className="h-full"
            multiple
            renderValue={(selected) => {
              return renderSelectedTags(selected);
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
        <Box flex={1} ml={2}>
          <TextField
            fullWidth
            id="search"
            label="Search"
            variant="outlined"
            size="small"
            InputLabelProps={{
              style: { lineHeight: "1" },
            }}
            InputProps={{
              style: { height: "32px" },
            }}
            sx={commonStyles}
            value={keyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyDown}
          />
        </Box>
        <ArButton
          className="bg-arxTheme text-white !py-1 rounded hover:bg-primary-dark ml-2"
          onClick={() => searchDocuments(1, selectedTags, keyword)}
        >
          Search
        </ArButton>
      </Box>
      <h2 className="text-3xl font-semibold mb-6 mt-12">Recent</h2>

      <Masonry columns={3} spacing={6}>
        {documentsList.map((doc, index) => (
          <Paper key={doc.id} elevation={3}>
            <Box textAlign="center">
              {/* <PdfImage storageKey={doc.storage_key}></PdfImage> */}
              <PreviewImage pageImage={doc?.cover} />
              {/* StorageKey */}
              <div className="px-4">
                <Typography
                  gutterBottom
                  className="mt-2"
                  sx={{
                    color: "#1f4f33bd", // 设置文字颜色
                    "&:hover": {
                      textDecoration: "underline", // 鼠标悬停时添加下划线
                      cursor: "pointer",
                    },
                    fontFamily: "Lato,sans-serif",
                    fontSize: "16px",
                    lineHeight: 1.5625,
                  }}
                  onClick={() => handleToEditor(doc.storage_key)}
                >
                  {doc.title}
                </Typography>

                <Typography
                  variant="body2"
                  style={{
                    maxHeight: "3em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    fontStyle: "italic",
                    fontSize: "16px",
                  }}
                  className="my-2"
                  title={doc.content}
                >
                  {doc.content}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  gutterBottom
                  style={{
                    fontSize: "16px",
                  }}
                  className="my-2"
                >
                  {doc?.user?.name}
                </Typography>
              </div>
            </Box>
          </Paper>
        ))}
      </Masonry>

      <Box display="flex" justifyContent="flex-start" mt={4} className="pb-5">
        {pageCount > 1 && (
          <Pagination
            count={pageCount}
            page={page}
            onChange={handleChangePage}
            variant="outlined"
            shape="rounded"
          />
        )}
      </Box>
    </Container>
  );
};

export default Einstein;
