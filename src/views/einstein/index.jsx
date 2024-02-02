import React from "react";
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
  Pagination,
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import PdfImage from "./pdfImage";

const categories = [
  {
    title: "Academic Journal",
    image: "library-shelves",
    tags: ["Science", "Research"],
  },
  {
    title: "Bibliography",
    image: "colorful-books-on-shelf",
    tags: ["History", "Literature"],
  },
  { title: "Book", image: "open-book", tags: ["Fiction", "Non-Fiction"] },
  { title: "Calendar", image: "clock-face", tags: ["Events", "Schedules"] },
  {
    title: "Résumé / CV",
    image: "person-sitting-on-bench",
    tags: ["Professional", "Jobs"],
  },
  {
    title: "Formal Letter",
    image: "typewriter-keys",
    tags: ["Correspondence", "Official"],
  },
];

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
  // State for the selected filter
  const [filter, setFilter] = React.useState("all");

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
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

  const [page, setPage] = React.useState(1);
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
          variant="outlined"
          size="small"
          sx={{ width: 150, ...commonStyles }}
        >
          <InputLabel id="filter-select-label">Filters</InputLabel>
          <Select
            labelId="filter-select-label"
            id="filter-select"
            value={filter}
            onChange={handleFilterChange}
            label="Filters"
            sx={commonStyles}
            MenuProps={{
              ModalProps: {
                keepMounted: true,
                disableScrollLock: true,
              },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="templates">Templa11111tes</MenuItem>
            <MenuItem value="examples">Examples</MenuItem>
            <MenuItem value="articles">Articles</MenuItem>
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
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="small"
          sx={{ ...commonStyles, ml: 2 }}
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
              <PdfImage
                fileUrl={
                  "http://dev.nas.corp.jancsitech.net:9000/chatcro-test-file/Randomness.pdf-3fda40?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=jancsitech%2F20240202%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240202T140359Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=e4902c1443b23a21f2a9d2ede7f7f33b2484e93d6a1ce8290a0117884778d7c4"
                }
              ></PdfImage>
              <div className="px-4">
                <Typography
                  gutterBottom
                  className="mt-2"
                  sx={{
                    color: "#1f4f33bd", // 设置文字颜色
                    "&:hover": {
                      textDecoration: "underline", // 鼠标悬停时添加下划线
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

      <Box display="flex" justifyContent="flex-start" mt={4} className="pb-5">
        <Pagination
          count={pageCount}
          page={page}
          onChange={handleChangePage}
          variant="outlined"
          shape="rounded"
        />
      </Box>
    </Container>
  );
};

export default Einstein;
