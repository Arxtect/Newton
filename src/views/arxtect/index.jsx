/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 13:51:21
 */
// Hooks
import React, { useLayoutEffect, useEffect } from "react";
// Components
import { LatexEditorContainer } from "@/features/latexEditor/LatexEditorContainer";
import { PdfPreview } from "@/features/pdfPreview/PdfPreview";
import { initializeLatexEngines } from "@/features/latexCompilation/latexCompilation";
import { SplitPane } from "@/components/SplitPane";
import { ButtonBarContainer } from "@/features/buttonBar/ButtonBarContainer";
import useSwitchTheme from "@/useHooks/useSwitchTheme";
import { ResizeSlider, ResizeRightSlider } from "./resizeSlider";
import "./index.css";
import { uploadDocument } from "services";

const Arxtect = () => {
  useSwitchTheme();
  // At component mount, setup all of the LaTeX engines
  useLayoutEffect(() => {
    initializeLatexEngines();
  }, []);

  useEffect(() => {
    console.log("1111");
  }, []);

  useEffect(() => {
    uploadDocument({
      upload_type: "1",
      blobUrl: "C:\\Users\\64672\\Downloads\\6584860086012994381482024.pdf",
      content:
        "Blind deconvolution aims to recover an original image from a blurred version in the\ncase where the blurring kernel is unknown. It has wide applications in diverse fields such\nas astronomy, microscopy, and medical imaging. Blind deconvolution is a challenging ill\u0002posed problem that suffers from significant non-uniqueness. Solution methods therefore\nrequire the integration of appropriate prior information. Early approaches rely on\nhand-crafted priors for the original image and the kernel. Recently, deep learning\nmethods have shown excellent performance in addressing this challenge. However, most\nexisting learning methods for blind deconvolution require a paired dataset of original\nand blurred images, which is often difficult to obtain. In this paper, we present a novel\nunsupervised learning approach named ECALL (Expectation-CALibrated Learning)\nthat uses separate unpaired collections of original and blurred images. Key features\nof the proposed loss function are cycle consistency involving the kernel and associated\nreconstruction operator, and terms that use expectation values of data distributions to\nobtain information about the kernel. Numerical results are used to support ECALL.",
      title: "what clash is astronomy ?",
      tags: '["天文"]',
      file_hash: "cdasdtronomy7b788f",
    }).then((res) => {
      console.log(res);
    });
  }, []);
  return (
    <main className="max-w-[99vw]">
      <ResizeSlider>
        <ButtonBarContainer />
        <SplitPane>
          <LatexEditorContainer />
          <ResizeRightSlider>
            <PdfPreview />
          </ResizeRightSlider>
        </SplitPane>
      </ResizeSlider>
    </main>
  );
};

export default React.memo(Arxtect);
