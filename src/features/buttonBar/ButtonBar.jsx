/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
import { SplitPane } from "../../components/SplitPane";
import { Button, CustomSplitButton } from "../../components/Button";
import { EngineStatus } from "../engineStatus/EngineStatus";
import FileUpload from "../../components/FileUpload";
import { useSelector, useDispatch } from "react-redux";

export const ButtonBar = ({
  toggleVisibility,
  compile,
  showLog,
  showFullSourceCode,
}) => {
  const toggleText = showFullSourceCode
    ? "Hide full source code"
    : "Show full source code";

  return (
    <SplitPane>
      <aside className="flex flex-row justify-end gap-2 my-2">
        {/* <Button onClick={toggleVisibility} sticky={showFullSourceCode}>{toggleText}</Button> */}
        {/* <FileUpload></FileUpload> */}
        {/* <Button onClick={compile}>Compile</Button> */}
        <CustomSplitButton
          multi
          buttonList={[
            { key: "1", label: "COPOILE", onClick: compile },
            { key: "2", label: "SHOWLOG", onClick: showLog },
          ]}
        ></CustomSplitButton>
        <EngineStatus />
      </aside>
    </SplitPane>
  );
};
