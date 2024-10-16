export default function FileViewImage({ url, filename, onLoad, onError }) {
  return (
    <img
      src={url}
      onLoad={onLoad}
      onError={onError}
      alt={filename}
      className="bg-white border shadow-md block mx-auto mt-3 max-h-[90%] max-w-full"
    />
  );
}
