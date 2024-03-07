let db;
let dbReq = indexedDB.open("latex-asset", 1);
dbReq.onupgradeneeded = function (event) {
  // Set the db variable to our database so we can use it!
  db = event.target.result;

  // Create an object store named notes. Object stores
  // in databases are where data are stored.
  let notes = db.createObjectStore("notes", { keyPath: "url" });
};
dbReq.onsuccess = function (event) {
  db = event.target.result;
};
dbReq.onerror = function (event) {
  console.log("error opening database " + event.target.errorCode);
};

export function convertEPStoJPEG(epsUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = epsUrl;
    image.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);

      const jpegDataUrl = canvas.toDataURL("image/jpeg");

      // Store the data URL in IndexedDB
      let tx = db.transaction(["notes"], "readwrite");
      let store = tx.objectStore("notes");
      let note = { url: epsUrl, data: jpegDataUrl };
      store.put(note);

      resolve(jpegDataUrl);
    };

    image.onerror = function () {
      //   reject(new Error("Failed to load EPS image"));
      resolve(epsUrl);
    };
  });
}

export function getJPEGDataUrl(epsUrl) {
  return new Promise((resolve, reject) => {
    let tx = db.transaction(["notes"], "readonly");
    let store = tx.objectStore("notes");
    let req = store.get(epsUrl);
    req.onsuccess = function (event) {
      if (req.result) {
        // The data URL is in the database, resolve the promise with it
        resolve(req.result.data);
      } else {
        // The data URL is not in the database, convert the EPS to JPEG
        convertEPStoJPEG(epsUrl).then(resolve);
      }
    };
  });
}
