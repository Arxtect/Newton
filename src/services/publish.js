/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-03 12:43:52
 */
import { toast } from "react-toastify"; // 假设你已经安装了react-toastify

// 辅助函数：生成带有统一前缀的URL
function getApiUrl(endpoint) {
  return `/api/v1/documents${endpoint}`;
}

export async function getAllTags() {
  const response = await fetch(getApiUrl("/tags/list"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
}

export async function documentSearch(search) {
  // Initialize the query parameters as an array of strings
  let queryParams = [];

  // Add pageIndex and pageSize with default values if they are not provided
  queryParams.push(`pageIndex=${search.pageIndex ?? 1}`);
  queryParams.push(`pageSize=${search.pageSize ?? 10}`);

  // Add keyword if it exists and is not an empty string
  if (search?.keyword && search.keyword !== "") {
    queryParams.push(`keyword=${encodeURIComponent(search.keyword)}`);
  }

  // Add tags if it exists and is not an empty array
  if (search?.tags?.length > 0) {
    queryParams.push(`tags=${encodeURIComponent(search.tags.join(","))}`);
  }

  // Construct the full URL with the query parameters
  const url = `${getApiUrl("/list/search")}?${queryParams.join("&")}`;

  // Perform the GET request using the constructed URL
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new Error("get document list failed");
  }
}

export async function getPreviewPdfUrl(storageKey) {
  const response = await fetch(getApiUrl("/pre/download"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file_storage_id: storageKey,
    }),
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new Error("get preview pdf url failed");
  }
}

export async function uploadDocument({
  uploadType,
  blobUrl,
  content,
  title,
  tags,
}) {
  // Retrieve the Blob from the Blob URL
  const response = await fetch(blobUrl);
  const blob = await response.blob();

  // Create a new FormData object
  const formData = new FormData();
  const file = new File([blob], "document.pdf", { type: blob.type });
  console.log(blob.type, "blob.type");
  // Append the file (as a Blob) and other parameters to the FormData object
  formData.append("upload_type", uploadType);
  formData.append("file", file);
  formData.append("content", content);
  formData.append("title", title);
  formData.append("tags", JSON.stringify(tags));

  // Perform the fetch operation to upload the form data
  const uploadResponse = await fetch(getApiUrl("/upload"), {
    method: "POST",
    body: formData,
  });

  // Check the response status and return the response or throw an error
  if (uploadResponse.ok) {
    return uploadResponse.json();
  } else {
    throw new Error("Document upload failed");
  }
}
