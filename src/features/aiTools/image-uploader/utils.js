export function getUploadApiUrl() {
  return `/api/v1/chat/upload`;
}

export const upload = (options, url, searchParams) => {
  const urlWithPrefix = `${url.startsWith("/") ? url : `/${url}`}`;
  const defaultOptions = {
    method: "POST",
    url:
      //   (url ? `${urlPrefix}${url}` : `${urlPrefix}/files/upload`) +
      urlWithPrefix + (searchParams || ""),
    data: {},
  };

  options = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers },
  };

  return new Promise((resolve, reject) => {
    const xhr = options.xhr;
    xhr.open(options.method, options.url);
    for (const key in options.headers) {
      xhr.setRequestHeader(key, options.headers[key]);
    }

    xhr.withCredentials = true;
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(xhr);
        }
      }
    };
    xhr.upload.onprogress = options.onprogress;
    xhr.send(options.data);
  });
};

export const imageUpload = (
  { file, onProgressCallback, onSuccessCallback, onErrorCallback },
  currentAppToken,
  url
) => {
  if (!url) {
    url = getUploadApiUrl();
  }
  const formData = new FormData();
  formData.append("file", file);

  const onProgress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.floor((e.loaded / e.total) * 100);
      onProgressCallback(percent);
    }
  };

  upload(
    {
      xhr: new XMLHttpRequest(),
      data: formData,
      onprogress: onProgress,
      headers: {
        "APP-Authorization": `Bearer ${currentAppToken}`,
      },
    },
    url
  )
    .then((res) => {
      onSuccessCallback(res);
    })
    .catch(() => {
      onErrorCallback();
    });
};
