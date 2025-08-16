import React, { useState } from "react";

const Tooltip = ({ text, position = "top", children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      style={{ display: "inline-block", position: "relative" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: "absolute",
            [position]: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: position === "top" ? "-8px" : "8px",
            background: "black",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            zIndex: 1000
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
