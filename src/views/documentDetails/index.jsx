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
import { useNavigate } from "react-router-dom";
import { getPreViewUrl } from "@/util";

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
      if (res?.data) {
        setPdfUrl(getPreViewUrl(res.data.StorageKey));
        getZipUrl(res.data.StorageZip);
        setDocumentInfo(res.data);
      }
    });
  }, []);

  // Function to format the timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp); // 直接使用 ISO 8601 格式的字符串
    return date.toLocaleString(); // 格式化为本地日期和时间
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [zipUrl, setZipUrl] = useState("");

  useEffect(() => {
    // getPdfUrl();
  }, []);

  const getZipUrl = async (storageKey) => {
    try {
      setZipUrl(getPreViewUrl(storageKey));
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
  function extractProjectName(zipFileName) {
    const parts = zipFileName.split(/-|\./);
    return parts[parts.length - 2];
  }
  const downloadZipAndUpload = async (url, dirpath, reload, projectName) => {
    console.log(url, "url");
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

      const blob = await response.blob(); // 在浏览器环境中使用
      // 或者使用 response.arrayBuffer() 如果你需要 ArrayBuffer
      projectName = extractProjectName(projectName) || "";
      // 调用 uploadZip 函数，传入下载的文件
      await uploadZip(blob, dirpath, reload, projectName);
      navigate("/arxtect");
    } catch (error) {
      console.error(`Failed to download or upload ZIP from ${url}:`, error);
    }
  };

  const handleOpenProject = async () => {
    console.log(zipUrl, "zipUrl");
    if (!zipUrl || zipUrl == "") {
      toast.warning("project source not exist yet");
      return;
    }
    try {
      downloadZipAndUpload(zipUrl, ".", repoChanged, documentInfo?.StorageZip);
    } catch (error) {
      toast.error(`get project source failed:${error}`);
    }
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
            storageKey={documentInfo?.StorageKey}
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
