/*
 * @Description: 
 * @Author: Devin
 * @Date: 2023-12-05 14:54:03
 */
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

      resolve(jpegDataUrl);
    };

    image.onerror = function () {
      //   reject(new Error("Failed to load EPS image"));
      resolve(epsUrl);
    };
  });
}
