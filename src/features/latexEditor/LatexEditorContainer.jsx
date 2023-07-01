// Hooks
import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
// Components
import { LatexEditor } from "./LatexEditor";
// Redux
import {
  setPreamble,
  setBody,
  selectBody,
  selectFullSourceCode,
  selectShowFullSourceCode,
} from "./latexEditorSlice";
import demo from "./demo";

export const LatexEditorContainer = () => {
  const body = useSelector(selectBody);
  const fullSourceCode = useSelector(selectFullSourceCode);
  const showFullSource = useSelector(selectShowFullSourceCode);
  const dispatch = useDispatch();

  const handleChange = (editorValue) => {
    if (showFullSource) {
      let [newPreamble, newBody] = editorValue.split("\\begin{document}");
      newBody = newBody.split("\\end{document}")[0].trim();
      dispatch(setPreamble(newPreamble + "\\begin{document}\n\n"));
      dispatch(setBody(newBody));
    } else {
      dispatch(setBody(editorValue));
    }
  };

  // const handleChange = useCallback(
  //   (editorValue) => {
  //     let sourceCode = showFullSource ? fullSourceCode : body;
  //     // console.log(sourceCode, "123", sourceCode != editorValue);
  //     if (sourceCode != editorValue) {
  //       let [newPreamble, newBody] = editorValue?.split("\\begin{document}");
  //       newBody = newBody?.split("\\end{document}")[0].trim();
  //       dispatch(setPreamble(newPreamble + "\\begin{document}\n\n"));
  //       dispatch(setBody(newBody));
  //     } else {
  //       dispatch(setBody(editorValue));
  //     }
  //   },
  //   [showFullSource, body, fullSourceCode]
  // );

  // useEffect(() => {
  //   console.log(body, "fullSourceCode");
  // }, [body]);

  useEffect(() => {
    let [newPreamble, newBody] = demo.split("\\begin{document}");
    newBody = newBody.split("\\end{document}")[0].trim();
    dispatch(setPreamble(newPreamble + "\\begin{document}\n\n"));
    dispatch(setBody(newBody));
  }, []);

  return (
    <LatexEditor
      handleChange={handleChange}
      sourceCode={showFullSource ? fullSourceCode : body}
    />
  );
};
