"use client";
import React, { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20 MB in bytes

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    if (!files) {
      return alert("Please select an image!");
    }

    setLoading(true);
    // const formData = new FormData();
    // formData.append("images", file); // backend supports "images" or "image"
    const formData = new FormData();
    // append each file under the same key 'images'
    files.forEach((f) => formData.append("images", f));
    if (!files || files.length === 0) {
      return alert("Please select one or more images!");
    }

    try {
      // ensure BACKEND_URL is defined at top of file
      // console.log(BACKEND_URL)
      const res = await fetch(`${BACKEND_URL}/api/detect`, {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";

      // Non-OK status: try to read body and throw a helpful error
      if (!res.ok) {
        let bodyText = "";
        try {
          if (contentType.includes("application/json")) {
            const j = await res.json().catch(() => null);
            bodyText = j ? JSON.stringify(j) : await res.text().catch(() => "");
          } else {
            bodyText = await res.text().catch(() => "");
          }
        } catch (readErr) {
          bodyText = `Could not read response body: ${readErr}`;
        }
        throw new Error(`Server error ${res.status}: ${bodyText}`);
      }

      // If content-type is not JSON, it is probably an HTML error page
      if (!contentType.includes("application/json")) {
        const text = await res.text().catch(() => "<failed to read body>");
        throw new Error(
          `Expected JSON but got "${contentType}". Body: ${text}`
        );
      }

      // parse JSON safely
      const data = await res.json();

      // Validate server payload
      if (!data || data.ok !== true) {
        throw new Error(
          data?.error || "Detection failed (server returned ok !== true)"
        );
      }

      if (!Array.isArray(data.results) || data.results.length === 0) {
        throw new Error("No results returned from server");
      }

      // Single-image flow: use first result
      // setResult(data.results[0]);
      // after successful fetch and validation:
      setResults(data.results); // <-- results is an array state (see next step)
    } catch (err: any) {
      console.error("Detect error:", err);
      setError(err?.message || "Something went wrong!");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };
  const renderCounts = (by_class: Record<string, number> | undefined) => {
    if (!by_class) return null;
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {Object.entries(by_class).map(([cls, cnt]) => (
          <div key={cls} className="text-sm bg-black/30 p-2 rounded">
            <strong>{cls}</strong>: {cnt}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
    <div className="grow flex flex-col items-center justify-center p-6 bg-linear-to-br via-black from-purple-900 to-purple-900">
      <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-blue-400 via-pink-400 to-orange-400 bg-clip-text text-transparent text-center  p-4">
        Safety Object Detection🛰️{" "}
      </h1>
      <div className="flex flex-col gap-4 items-center justify-center p-6 ">
        <div className="flex flex-col items-center bg-gray-700/20 rounded-2xl p-4 pb-8">
          <h1 className="text-2xl font-bold mb-4 bg-linear-to-r from-blue-300 via-pink-200 to-orange-300 bg-clip-text text-transparent">
            INPUT{" "}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full px-2 py-2 bg-black text-white placeholder-gray-400 border border-gray-700 rounded-lg shadow-[0_0_5px_3px_rgba(255,255,255,0.2)] hover:text-green-300  hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-white focus:shadow-[0_0_20px_5px_rgba(255,255,255,0.5)] transition duration-300 mb-0"
              onChange={(e) => {
  const selectedFiles = Array.from(e.target.files || []);

  // Calculate total size in bytes
  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  if (totalSize > MAX_TOTAL_SIZE) {
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

    alert(`Total size ${totalMB} MB exceeds 10 MB limit!`);

    // Clear files
    setFiles([]);
    setError("Total file size must be under 10 MB");
    return;
  }

  // If okay — store files
  setFiles(selectedFiles);
  setResults(null);
  setError(null);
}}

            />
            <span className="text-center text-sm text-gray-400">
              <i>max size :20MB</i>
            </span>

            <button
              type="submit"
              // disabled={loading}
              disabled={loading || files.length === 0}
              className=" bg-linear-to-r shadow-[0_0_15px_3px_rgba(255,255,255,0.2)] from-black via-purple-800 to-black text-white px-4 py-2 rounded-lg hover:bg-linear-to-r cursor-pointer hover:from-gray-950 hover:via-purple-700 hover:to-gray-950 transition duration-300"
            >
              {loading ? (
                <span className="text-yellow-400 font-bold">Detecting...</span>
              ) : (
                <span className="font-bold">Detect Objects</span>
              )}
            </button>
          </form>
          <div>
            {/* Preview */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="w-full h-28 bg-black/10 rounded overflow-hidden flex items-center justify-center border border-green-400/20"
                >
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* separation */}
        {results && results.length > 0 && (
          <div className="m-4 w-full h-[3px] bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"></div>
        )}

        {/* MULTI-RESULT OUTPUT BLOCK */}

        {results && results.length > 0 && (
          <div className="w-full flex flex-col items-center gap-4">
            <h2 className="text-2xl text-center font-bold mb-2 bg-linear-to-r from-blue-300 via-pink-200 to-orange-300 bg-clip-text text-transparent">
              OUTPUT
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((resObj, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center bg-gray-700/20 rounded-2xl p-4 pb-6 w-full min-w-0"
                >
                  {/* per-result header */}
                  <div className="w-full flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-300">
                      File: <strong>{resObj.filename}</strong>
                    </div>
                  </div>

                  {/* annotated image (fixed box so it won't expand layout) */}
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[640px] h-[420px] bg-black/10 rounded overflow-hidden flex items-center justify-center">
                      {resObj.image_base64 ? (
                        <img
                          src={
                            String(resObj.image_base64)
                              .trim()
                              .startsWith("data:")
                              ? String(resObj.image_base64).trim()
                              : `data:image/png;base64,${String(
                                  resObj.image_base64
                                ).trim()}`
                          }
                          alt={`result-${idx}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-300">
                          No annotated image returned.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* summary and counts */}
                  <div className="mt-4 w-full">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white">
                          Summary
                        </h3>
                        <div className="text-sm text-gray-300 mt-1">
                          Total objects:{" "}
                          <strong>
                            {resObj.summary?.total ??
                              resObj.detections?.length ??
                              0}
                          </strong>
                        </div>

                        {resObj.summary?.by_class && (
                          <div className="mt-2 text-green-300 grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(
                              resObj.summary.by_class as Record<string, number>
                            ).map(([cls, cnt]) => (
                              <div
                                key={cls}
                                className="bg-black/30 p-2 rounded"
                              >
                                <strong>{cls}</strong>: {cnt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-200 text-right">
                        <div>
                          Detections:{" "}
                          <strong>{resObj.detections?.length ?? 0}</strong>
                        </div>
                      </div>
                    </div>

                    {/* detailed detections (scrollable) */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-white">
                        Detailed Detections
                      </h4>
                      <ul className="mt-2 space-y-2 max-h-48 overflow-auto border rounded-xl border-gray-700 p-2 ">
                        {resObj.detections && resObj.detections.length > 0 ? (
                          resObj.detections.map((d: any, i: number) => (
                            <li
                              key={i}
                              className="p-2 bg-linear-to-b from-black/50 to-gray-950/20 rounded-xl flex justify-between items-center text-gray-300"
                            >
                              <div>
                                <div className="text-sm">
                                  <strong>{d.class_name}</strong> —{" "}
                                  {Number(d.confidence).toFixed(2)}
                                </div>
                                <div className="text-xs ">
                                  bbox: [
                                  {d.bbox
                                    .map((v: number) => Math.round(v))
                                    .join(", ")}
                                  ]
                                </div>
                              </div>
                            </li>
                          ))
                        ) : (
                          <div className="text-gray-300">No detections</div>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    <footer className="w-full bg-black text-gray-300 py-8 border-t border-gray-400">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left - Team Name */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold tracking-wide text-white">VOLTIX ⚡</h2>
          <p className="text-sm text-gray-400">Team participating in HackOfThrone</p>
        </div>
{/* Middle - GitHub Link */}
<div className="flex gap-6 text-sm">
  <a
    href="https://github.com/Yousuf-177/Voltix_Hackathon_Project.git"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-white transition flex items-center gap-2"
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      height="28"
      width="28"
      fill="currentColor"
      className="text-gray-400 hover:text-white transition-colors"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38
      0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
      -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
      0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 012-.27c.68 0
      1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15
      0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2
      0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  </a>
</div>

        {/* Right - Copyright */}
        <div className="text-center md:text-right text-sm">
          <p className="text-gray-400">
            © {new Date().getFullYear()} VOLTIX. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
    </div>
  );
}
