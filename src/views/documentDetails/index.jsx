/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-03 22:20:40
 */
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { Tooltip } from "@mui/material";
import PdfImage from "@/components/pdfImage";
import { Container } from "@mui/material";

const DocumentDetails = () => {
  // Fetching the route parameter `id`
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();

  useEffect(() => {
    console.log(query.get("id"), "id");
  }, [query]);

  // Function to format the timestamp
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  return (
    <Container className="mt-10 mb-4">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2">
          <div className="mb-[40px] mt-[20px]">
            <h1 className="text-4xl font-bold">Project Detail</h1>
          </div>
          <div className="mb-4 flex gap-2">
            <Button
              variant="outlined"
              color="secondary"
              data-toggle="modal"
              data-target="#modalViewSource"
              // href={`/project/new/template/21445?id=${id}&latexEngine=pdflatex&mainFile=main.tex&templateName=Example Project&texImage=texlive-full:2023.1`}
            >
              Open Project
            </Button>
            {/* <Button
              variant="outlined"
              color="secondary"
              // Assuming you will handle the modal opening with JavaScript, these data attributes might be handled differently in React.
              data-toggle="modal"
              data-target="#modalViewSource"
            >
              View Source
            </Button> */}
            <Button
              variant="outlined"
              color="secondary"
              href="/latex/templates/example-project/qzykddzqhkwk.pdf"
              target="_blank"
            >
              View PDF
            </Button>
          </div>

          <div className="flex my-8">
            <div className="w-1/4 font-bold">Author</div>
            <div className="w-3/4">Overleaf</div>
          </div>
          <div className="flex my-8">
            <div className="w-1/4 font-bold">Last Updated</div>
            <div className="w-3/4">
              <Tooltip title="23rd Sep 2021, 9:00 am" placement="bottom">
                <span>{formatDate("1632358825")}</span>
              </Tooltip>
            </div>
          </div>
          <div className="flex my-8">
            <div className="w-1/4 font-bold">License</div>
            <div className="w-3/4">Creative Commons CC BY 4.0</div>
          </div>
          <div className="flex my-8">
            <div className="w-1/4 font-bold">Abstract</div>
            <div className="w-3/4">
              <p>An example LaTeX project for starting off your own article</p>
            </div>
          </div>
        </div>
        <div className="w-full m-auto md:w-1/2 flex justify-center">
          <PdfImage
            storageKey={"astronomy.pdf-b78c20"}
            height={500}
            className="w-[80%]"
          ></PdfImage>
        </div>
      </div>
    </Container>
  );
};

export default DocumentDetails;
