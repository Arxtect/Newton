import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Grid,
  Box,
  Container,
  Paper,
  Typography,
  Checkbox,
  Pagination,
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import PdfImage from "@/components/pdfImage";
import { getAllTags, documentSearch } from "services";

// 假设的文档数据
const popularDocuments = [
  {
    ID: "doc1",
    Title: "The Expansion of the Universe",
    Tags: ["Science", "Research"],
    Content: "A deep dive into cosmic expansion and dark energy.",
  },
  {
    ID: "doc2",
    Title: "Medieval European History",
    Tags: ["History"],
    Content: "An overview of the medieval period in Europe.",
  },
  {
    ID: "doc3",
    Title: "Creative Writing 101",
    Tags: ["Literature", "Fiction"],
    Content: "A beginner's guide to creative writing.",
  },
  {
    ID: "doc4",
    Title: "Annual Tech Conference 2024",
    Tags: ["Events", "Schedules"],
    Content: "Schedule and speaker list for the upcoming tech conference.",
  },
  {
    ID: "doc5",
    Title: "Professional Resume Template",
    Tags: ["Professional", "Jobs"],
    Content: "A template and tips for creating a professional resume.",
  },
  {
    ID: "doc6",
    Title: "Business Correspondence Essentials",
    Tags: ["Correspondence", "Official"],
    Content: "How to write effective business letters and emails.",
  },
  {
    ID: "doc7",
    Title: "Understanding Astrophysics",
    Tags: null, // 这个文档没有标签，将会归类到“Popular”
    Content: "An introductory text to the concepts of astrophysics.",
  },
  // ...更多文档...
];

const Einstein = () => {
  const [page, setPage] = React.useState(1);
  const [documentsList, setDocumentsList] = React.useState([]);
  const [keyword, setKeyword] = React.useState("");
  const [customTags, setCustomTags] = useState([]);
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
    let searchCondition = {
      pageIndex: page,
      tags: [],
      keyword: "",
    };
    if (filter.length > 0) {
      searchCondition.tags = filter;
    }
    if (keyword && keyword !== "") {
      searchCondition.keyword = keyword;
    }
    let list = await documentSearch(searchCondition);
    setDocumentsList(list.data.documents);
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

  const itemsPerPage = 9; // Adjust based on how many items you want per page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const pageCount = Math.ceil(popularDocuments.length / itemsPerPage);

  // Get the documents for the current page
  const documentsToShow = popularDocuments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // 调用您的搜索函数
      searchDocuments(1, selectedTags, keyword);
    }
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
        <Button
          variant="contained"
          color="primary"
          size="small"
          sx={{ ...commonStyles, ml: 2 }}
          onClick={() => searchDocuments(1, selectedTags, keyword)}
        >
          Search
        </Button>
      </Box>
      <h2 className="text-3xl font-semibold mb-6 mt-12">Recent</h2>

      <Masonry columns={3} spacing={6}>
        {documentsToShow.map((doc, index) => (
          <Paper key={doc.ID} elevation={3}>
            <Box textAlign="center">
              {/* <div
                style={{
                  width: "100%",
                  height: `${100 + index * 50}px`,
                  backgroundColor: "#ececec",
                }}
              /> */}
              <PdfImage storageKey={"astronomy.pdf-b78c20"}></PdfImage>
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
                >
                  {doc.Title}
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
                  title={doc.Content}
                >
                  {doc.Content}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  gutterBottom
                  style={{
                    fontSize: "16px",
                  }}
                >
                  {doc.ID}
                </Typography>
              </div>
            </Box>
          </Paper>
        ))}
      </Masonry>

      {pageCount > 1 && (
        <Box display="flex" justifyContent="flex-start" mt={4} className="pb-5">
          <Pagination
            count={pageCount}
            page={page}
            onChange={handleChangePage}
            variant="outlined"
            shape="rounded"
          />
        </Box>
      )}
    </Container>
  );
};

export default Einstein;
