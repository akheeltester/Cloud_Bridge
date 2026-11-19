import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useActorState } from "@/components/portal/shell";
import { Button } from "@/components/ui/button";
import { Field, SelectField } from "@/components/ui/field";
import { errorText, fileSize, prettyDate } from "@/lib/jigsaw/format";
import { canUpload } from "@/lib/jigsaw/permissions";
import { deleteDocument, downloadDocument, listDocuments, uploadDocument } from "@/lib/jigsaw/server";
import type { DocMeta, Visibility } from "@/lib/jigsaw/types";

export const Route = createFileRoute("/portal/documents")({ component: DocumentsPage });

const TYPES = ["application/pdf", "image/png", "image/jpeg", "text/plain", "text/csv"];

function DocumentsPage() {
  const { actor } = useActorState();
  const [rows, setRows] = useState<DocMeta[] | null>(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<Visibility>(actor.role === "hr" ? "company" : actor.role === "manager" ? "team" : "private");
  const [file, setFile] = useState<{ filename: string; mime: string; contentBase64: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [busyId, setBusyId] = useState("");

  function load() {
    return listDocuments().then(setRows);
  }

  useEffect(() => {
    let cancelled = false;
    load().catch((err) => {
      if (!cancelled) setError(errorText(err));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function onFile(next: File | undefined) {
    setError("");
    setFile(null);
    if (!next) return;
    if (!TYPES.includes(next.type)) {
      setError("Use a PDF, PNG, JPEG, TXT, or CSV.");
      return;
    }
    if (next.size > 750 * 1024) {
      setError("Files must be 750 KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      const contentBase64 = raw.split(",")[1] || "";
      setFile({ filename: next.name, mime: next.type, contentBase64 });
    };
    reader.readAsDataURL(next);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    if (!canUpload(actor.role, visibility)) {
      setError("That visibility is outside your role.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await uploadDocument({ data: { title, visibility, ...file } });
      setTitle("");
      setFile(null);
      await load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  async function download(id: string) {
    setBusyId(id);
    setError("");
    try {
      const doc = await downloadDocument({ data: { id } });
      const binary = atob(doc.contentBase64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      const url = URL.createObjectURL(new Blob([bytes], { type: doc.mime }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = doc.filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusyId("");
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    setError("");
    try {
      await deleteDocument({ data: { id } });
      await load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusyId("");
    }
  }

  const options: Visibility[] =
    actor.role === "hr" ? ["private", "team", "company"] : actor.role === "manager" ? ["private", "team"] : ["private"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl">Documents</h1>
        <p className="mt-2 max-w-xl text-sm text-night-muted">
          You see company files, your own files
          {actor.role === "manager" ? ", and team files in your reporting line" : ""}
          {actor.role === "hr" ? ", and every file in the company" : ""}. PDF, PNG, JPEG, TXT, or CSV, up to 750 KB.
        </p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-night-line bg-night-raise p-4 sm:grid-cols-2">
        <Field night label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <SelectField
          night
          label="Who can read it"
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as Visibility)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option === "company" ? "Whole company" : option === "team" ? "My team" : "Only me"}
            </option>
          ))}
        </SelectField>
        <label className="block space-y-1.5 text-sm sm:col-span-2">
          <span className="font-medium">File</span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.csv,application/pdf,image/png,image/jpeg,text/plain,text/csv"
            className="block w-full text-sm text-night-muted file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-night file:px-3 file:text-night-fg"
            onChange={(event) => onFile(event.target.files?.[0])}
          />
        </label>
        {error ? <p className="text-sm text-copper sm:col-span-2">{error}</p> : null}
        <div>
          <Button type="submit" variant="night" disabled={pending}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </form>
      {!rows && !error ? <div className="h-32 animate-pulse rounded-lg bg-night-raise" /> : null}
      <ul className="space-y-2">
        {rows?.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-night-line px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{doc.title}</p>
              <p className="text-xs text-night-muted">
                {doc.ownerName} · {doc.visibility} · {fileSize(doc.sizeBytes)} · {prettyDate(doc.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="nightLine" size="sm" disabled={busyId === doc.id} onClick={() => download(doc.id)}>
                Download
              </Button>
              {actor.role === "hr" || actor.id === doc.ownerEmployeeId ? (
                <Button variant="nightLine" size="sm" disabled={busyId === doc.id} onClick={() => remove(doc.id)}>
                  Remove
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {rows && rows.length === 0 ? <p className="text-sm text-night-muted">No files in your view yet.</p> : null}
    </div>
  );
}
