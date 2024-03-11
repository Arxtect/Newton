import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import { useEffect } from "react";
import { usePdfPreviewStore, useEngineStatusStore } from "store";

export const EngineStatus = ({ className }) => {
  const { engineStatus, selectFormattedEngineStatus } = useEngineStatusStore();

  const [showTooltip, setShowTooltip] = useState(true);
  const { icon, color, tooltip } = selectFormattedEngineStatus();
  const { toggleCompilerLog, setShowCompilerLog } = usePdfPreviewStore(
    (state) => ({
      toggleCompilerLog: state.toggleCompilerLog,
      setShowCompilerLog: state.setShowCompilerLog,
    })
  );

  useEffect(() => {
    if (engineStatus === 4) {
      setShowCompilerLog(true);
    }
  }, [engineStatus]);

  const handleClick = () => {
    if (engineStatus === 2) {
      toggleCompilerLog();
    }
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <FontAwesomeIcon
        icon={icon}
        className={` text-center  ${color} hover:cursor-pointer`}
        size="xl"
        data-tip={tooltip}
        data-for="engineStatus"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => {
          setShowTooltip(false);
          setTimeout(() => setShowTooltip(true), 50);
        }}
        onClick={handleClick}
      />
      {showTooltip && (
        <ReactTooltip
          id="engineStatus"
          place="bottom"
          type="dark"
          effect="solid"
          html={true}
        />
      )}
    </div>
  );
};
