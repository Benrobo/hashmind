import React from "react";

export default function WaveLoader() {
  return (
    <div className="loading-wave">
      {Array(4)
        .fill(1)
        .map((_, i) => (
          <div className="loading-bar" key={i}></div>
        ))}
    </div>
  );
}
