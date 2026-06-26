"use client";

import {useState, type FormEvent } from "react";

export default function ResumeUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setStatus("Please select your CV first.");
      return;
    }

    setStatus(`Mock upload successful: ${selectedFile.name}`);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Upload CV / Resume</h2>

      <p className="mt-2 text-sm text-slate-500">
        Upload your CV so the system can analyze your skills and recommend
        better internships.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Select CV file
          </label>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              setStatus("");
            }}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
          />
        </div>

        {selectedFile && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold">Selected file:</span>{" "}
              {selectedFile.name}
            </p>
            <p>
              <span className="font-semibold">Size:</span>{" "}
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}

        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Upload CV
        </button>

        {status && <p className="text-sm font-medium text-slate-600">{status}</p>}
      </form>
    </div>
  );
}