/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-10-16 15:28:13
 */
export default function FileViewPdf({ url, filename }) {
  return (
    <div className="bg-white border shadow-md block mx-auto mt-3 h-[90%] max-w-full">
      <embed src={url} type="application/pdf" width="100%" height={"100%"} />
    </div>
  );
}
