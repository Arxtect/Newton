/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-03 22:20:40
 */
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { Tooltip } from "@mui/material";
import PdfImage from "@/components/pdfImage";
import { Container } from "@mui/material";
import PreviewPdf from "@/components/previewPdf";
import { toast } from "react-toastify";
import { getPreviewPdfUrl, getDocumentById } from "services";
import { useFileStore } from "store";
import { uploadZip } from "domain/filesystem";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

const DocumentDetails = () => {
  const { repoChanged } = useFileStore((state) => ({
    repoChanged: state.repoChanged,
  }));

  // Fetching the route parameter `id`
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const navigate = useNavigate();

  const [documentInfo, setDocumentInfo] = useState({});

  useEffect(() => {
    if (!query.get("id")) {
      return;
    }
    console.log(query.get("id"), "id");
    getDocumentById(query.get("id")).then((res) => {
      console.log(res, "res");
      getPdfUrl(res.data.StorageKey);
      setDocumentInfo(res.data);
    });
  }, [query]);

  // Function to format the timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp); // 直接使用 ISO 8601 格式的字符串
    return date.toLocaleString(); // 格式化为本地日期和时间
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    // getPdfUrl();
  }, []);

  const getPdfUrl = async (storageKey) => {
    try {
      const response = await getPreviewPdfUrl(storageKey);
      setPdfUrl(response.data.preview);
    } catch (error) {
      console.error("Fetching PDF failed:", error);
    }
  };
  const handleOpenPreview = () => {
    if (!pdfUrl) {
      toast.warning("document not exist yet");
      return;
    }
    setPreviewOpen(true);
  };

  const downloadZipAndUpload = async (url, dirpath, reload) => {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

      const blob = await response.blob(); // 在浏览器环境中使用
      // 或者使用 response.arrayBuffer() 如果你需要 ArrayBuffer

      // 调用 uploadZip 函数，传入下载的文件
      await uploadZip(blob, dirpath, reload);
    } catch (error) {
      console.error(`Failed to download or upload ZIP from ${url}:`, error);
    }
  };

  const handleOpenProject = async () => {
    // const file = documentInfo?.StorageKey;
    const url =
      "http://10.10.99.141:9000/chatcro-test-file/321.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=JINUGN0GD2PI17JN7016%2F20240204%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240204T135222Z&X-Amz-Expires=604800&X-Amz-Security-Token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJKSU5VR04wR0QyUEkxN0pONzAxNiIsImV4cCI6MTcwNzA1ODMyOSwicGFyZW50IjoiamFuY3NpdGVjaCJ9.u1E508ZtAzCxfmLQ2rTQ8nC3jyCGXJguyKqiwymDJS3GfIEm72urKGAQeiKFXGHQ4Z9tLv4TuZ8sgfUQAw9H5w&X-Amz-SignedHeaders=host&versionId=null&X-Amz-Signature=ad486f418ca0d658bd824f6f3b708d83997742b11dbfa0895c8ef32ebd78e77b";

    downloadZipAndUpload(url, ".", repoChanged).then(() => {
      navigate("/arxtect");
    });
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
              onClick={handleOpenProject}
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
              // href="/latex/templates/example-project/qzykddzqhkwk.pdf"
              target="_blank"
              onClick={handleOpenPreview}
            >
              View PDF
            </Button>
          </div>

          <div className="flex my-8">
            <div className="w-1/4 font-bold">Author</div>
            <div className="w-3/4">{documentInfo?.User?.Name}</div>
          </div>

          <div className="flex my-8">
            <div className="w-1/4 font-bold">Title</div>
            <div className="w-3/4">{documentInfo?.Title}</div>
          </div>
          <div className="flex my-8">
            <div className="w-1/4 font-bold">Content</div>
            <div className="w-3/4">
              <p>{documentInfo?.Content}</p>
            </div>
          </div>
          <div className="flex my-8">
            <div className="w-1/4 font-bold">Last Updated</div>
            <div className="w-3/4">
              <Tooltip title="23rd Sep 2021, 9:00 am" placement="bottom">
                <span>{formatDate(documentInfo?.UpdatedAt)}</span>
              </Tooltip>
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
      <PreviewPdf
        dialogStyle={{
          height: "90vh",
          width: "70vw",
        }}
        open={previewOpen}
        setOpen={setPreviewOpen}
        pdfUrl={pdfUrl}
      />
    </Container>
  );
};

export default DocumentDetails;
