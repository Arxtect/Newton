/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-03 12:43:52
 */
import { toast } from "react-toastify"; // 假设你已经安装了react-toastify
import { refreshAuth } from "./auth";
import { setCookie, deleteCookie, pdfToImageFirst } from "@/utils";
import { updateAccessToken } from "store";
import { apiFetch } from "./apiFetch.js";

// 辅助函数：生成带有统一前缀的URL
function getApiUrl(endpoint) {
  return `/api/v1/documents${endpoint}`;
}

export async function getAllTags() {
  await refreshAuth();
  try {
    const response = await apiFetch(getApiUrl("/tags/list"), "GET");
    return response;
  } catch (error) {
    throw error;
  }
}

export async function documentSearch(search) {
  await refreshAuth();
  try {
    // Initialize the query parameters as an array of strings
    let queryParams = [];

    // Add pageIndex and pageSize with default values if they are not provided
    queryParams.push(`page_index=${search.pageIndex ?? 1}`);
    queryParams.push(`page_size=${search.pageSize ?? 10}`);

    // Add keyword if it exists and is not an empty string
    if (search?.keyword && search.keyword !== "") {
      queryParams.push(`keyword=${encodeURIComponent(search.keyword)}`);
    }

    // Add tags if it exists and is not an empty array
    if (search?.tags?.length > 0) {
      search?.tags.map((tag) => queryParams.push(`tags=${tag}`));
    }

    // Construct the full URL with the query parameters
    const url = `${getApiUrl("/list/search")}?${queryParams.join("&")}`;

    // Perform the GET request using the constructed URL
    const response = await apiFetch(url, "GET");
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getDocumentById(documentId) {
  await refreshAuth();
  if (!documentId) {
    throw new Error("A document ID is required to fetch a document");
  }

  try {
    // Construct the URL with the document ID
    const url = `${getApiUrl("/drafts")}/${documentId}`;

    // Perform the GET request using the constructed URL
    const response = await apiFetch(url, "GET");
    return response;
  } catch (error) {
    toast.error(` ${error}`);
  }
}

export async function getPreviewPdfUrl(storageKey) {
  try {
    await refreshAuth();
    const response = await apiFetch(getApiUrl("/pre/download"), "POST", {
      file_storage_id: storageKey,
    });
    return response;
  } catch (error) {
    toast.error(` ${error}`);
  }
}

export async function uploadDocument({
  uploadType,
  blobUrl,
  content,
  title,
  tags,
  zipFile,
  currentProjectRoot = "document",
}) {
  await refreshAuth();
  // Retrieve the Blob from the Blob URL
  const response = await fetch(blobUrl);
  const blob = await response.blob();

  const coverBlob = await pdfToImageFirst(blobUrl);

  // Create a new FormData object
  const formData = new FormData();
  const file = new File([blob], `${currentProjectRoot}.pdf`, {
    type: blob.type,
  });
  const cover = new File([coverBlob], `${currentProjectRoot}.jpg`, {
    type: coverBlob.type,
  });

  // Append the file (as a Blob) and other parameters to the FormData object
  formData.append("upload_type", uploadType);
  formData.append("file", file);
  formData.append("content", content);
  formData.append("title", title);
  formData.append("tags", JSON.stringify(tags));
  formData.append("zip", zipFile); // 添加 ZIP 文件
  formData.append("cover", cover);

  console.log(zipFile, "zipFile");

  // Perform the fetch operation to upload the form data
  const uploadResponse = await fetch(getApiUrl("/upload"), {
    method: "POST",
    body: formData,
  });

  // Check the response status and return the response or throw an error
  if (uploadResponse.ok) {
    return uploadResponse.json();
  } else if (response.status === 401) {
    // deleteCookie("mojolicious");
    updateAccessToken("");
    toast.error("Login has expired. Please log in again", {
      position: "top-right",
    });
  } else {
    throw new Error("Document upload failed");
  }
}

export async function uploadToS3({ filePath, blob, type }) {
  await refreshAuth();

  const uploadUrlData = await generateS3UploadURL({ filePath });
  const uploadUrl = uploadUrlData["upload_url"];
  const fileKey = uploadUrlData["key"];
  console.log(uploadUrlData, fileKey, uploadUrl, "data");

  const formData = new FormData();
  console.log(blob, "fileBuffer");
  const file = new File([blob], filePath, {
    type: type,
  });
  console.log(filePath, type);
  formData.append("file", file);

  // Perform the fetch operation to upload the form data
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
  });
  console.log(uploadResponse, "uploadResponse");
  // Check the response status and return the response or throw an error
  if (uploadResponse.ok) {
    return fileKey;
  } else {
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
  }
}

export async function generateS3UploadURL({ filePath }) {
  // Perform the fetch operation to upload the form data
  const response = await fetch(getApiUrl("/generateS3UploadURL"), {
    method: "POST",
    body: JSON.stringify({
      filename: filePath,
    }),
  });

  // Check the response status and return the response or throw an error
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    const data = await response.json();
    console.log(data);
    throw new Error(`register failed: ${data.message}`);
  }
}

export async function downloadFileFromS3(key) {
  const response = await fetch(getApiUrl(`/pre/download/${key}`));
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();

  // 将 arrayBuffer 转换为 Uint8Array
  const uint8Array = new Uint8Array(arrayBuffer);
  return Buffer.from(uint8Array);
}
