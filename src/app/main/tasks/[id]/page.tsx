"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createTaskComment, getTaskById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, ClipboardList, AlertCircle } from "lucide-react";

interface TagItem {
  id: number;
  name: string;
}

interface ParticipantItem {
  id: number;
  name: string;
}

interface AttachmentItem {
  id?: number;
  name?: string;
  url?: string;
  mime_type?: string;
  size?: number;
}

interface CommentItem {
  id: number;
  comment: string;
  userName?: string;
  created_at?: string;
}

interface TaskDetail {
  id: number;
  title?: string;
  description?: string;
  status?: string;
  status_label?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  creator_name?: string;
  tags?: TagItem[];
  participants?: ParticipantItem[];
  attachment?: AttachmentItem | null;
  comments?: CommentItem[];
  urls?: string[];
}

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0",
  )}`;
};

const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const buildTmpMediaUrl = (fileName?: string) => {
    if (!fileName) return "";
    const rawBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_PRODUCTION_URL ||
      process.env.NEXT_PUBLIC_BASE_URL_TEST ||
      "";
    const base = rawBaseUrl.trim().replace(/\/+$/, "");
    if (!base) return "";
    return `${base}/tmp/media/${fileName}`;
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskDetail(Number(taskId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const fetchTaskDetail = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTaskById(id);
      const okStatuses = [200, 201, 202];
      if (okStatuses.includes(response.status) && response.data) {
        const data = response.data?.data ?? response.data;
        const tagsRaw =
          (Array.isArray(data.tags) && data.tags) ||
          (Array.isArray(data.tags?.data) && data.tags.data) ||
          (data.tags && typeof data.tags === "object" ? Object.values(data.tags) : []);
        const tags: TagItem[] = Array.isArray(tagsRaw)
          ? tagsRaw
            .filter((t: any) => t && (t.id || t.name))
            .map((t: any) => ({ id: Number(t.id), name: t.name ?? t.title ?? "" }))
          : [];

        const participantsRaw =
          (Array.isArray(data.participants) && data.participants) ||
          (Array.isArray(data.participants?.data) && data.participants.data) ||
          (data.participants && typeof data.participants === "object"
            ? Object.values(data.participants)
            : []);
        const participants: ParticipantItem[] = Array.isArray(participantsRaw)
          ? participantsRaw
            .filter((p: any) => p && (p.id || p.name || p.email))
            .map((p: any) => ({ id: Number(p.id), name: p.name ?? p.email ?? "" }))
          : [];

        const commentsRaw =
          (Array.isArray(data.comments) && data.comments) ||
          (Array.isArray(data.comments?.data) && data.comments.data) ||
          (data.comments && typeof data.comments === "object" ? Object.values(data.comments) : []);
        const comments: CommentItem[] = Array.isArray(commentsRaw)
          ? commentsRaw
            .filter((c: any) => c && (c.id || c.comment))
            .map((c: any) => ({
              id: Number(c.id),
              comment: c.comment ?? "",
              userName: c.user?.name ?? c.user?.email ?? "",
              created_at: c.created_at,
            }))
          : [];
        const urlsRaw =
          (Array.isArray(data.urls) && data.urls) ||
          (Array.isArray(data.urls?.data) && data.urls.data) ||
          (data.urls && typeof data.urls === "object" ? Object.values(data.urls) : []);
        const urls: string[] = Array.isArray(urlsRaw)
          ? urlsRaw.filter((u: any) => typeof u === "string" && u.trim().length > 0)
          : [];
        const attachment: AttachmentItem | null = data.attachment
          ? {
            id: Number(data.attachment.id),
            name: data.attachment.name,
            url: data.attachment.url,
            mime_type: data.attachment.mime_type,
            size: data.attachment.size,
          }
          : null;
        setTask({
          id: Number(data.id),
          title: data.title ?? data.name ?? "No title",
          description: data.description ?? "",
          status_label: data.status_label ?? "",
          status: data.status ?? data.state ?? "",
          due_date: data.due_date,
          created_at: data.created_at,
          updated_at: data.updated_at,
          creator_name: data.creator?.name ?? "",
          tags,
          participants,
          attachment,
          comments,
          urls,
        });
      } else {
        setError(response.error || "Даалгавар олдсонгүй");
      }
    } catch (err: any) {
      setError(err?.message || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!task?.id) return;
    const trimmed = commentText.trim();
    if (!trimmed) {
      toast.error("Сэтгэгдэл хоосон байна");
      return;
    }
    try {
      setCommentLoading(true);
      const res = await createTaskComment(task.id, { comment: trimmed });
      const okStatuses = [200, 201, 202, 204];
      if (okStatuses.includes(res.status)) {
        toast.success("Сэтгэгдэл илгээлээ");
        setCommentText("");
        fetchTaskDetail(task.id);
      } else {
        toast.error(res.error || res.message || "Сэтгэгдэл хадгалах үед алдаа гарлаа");
      }
    } catch (err: any) {
      toast.error(err?.message || "Сэтгэгдэл хадгалах үед алдаа гарлаа");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error || "Даалгавар олдсонгүй"}</p>
          </div>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Буцах
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Button>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-slate-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{task.title}</h1>
              <p className="text-sm text-slate-500">Даалгавар #{task.id}</p>
            </div>
          </div>
        </div>
        {(task.status_label || task.status) && (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {task.status_label || task.status}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="font-semibold text-slate-900">Үүсгэсэн:</span>
            <span>{formatDate(task.created_at)}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-semibold text-slate-900">Зассан:</span>
            <span>{formatDate(task.updated_at)}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-semibold text-slate-900">Дуусах огноо:</span>
            <span>{task.due_date || "—"}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-semibold text-slate-900">Төлөв:</span>
            <span>{task.status_label || task.status || "—"}</span>
          </div>
          {task.creator_name && (
            <div className="flex items-start gap-3">
              <span className="font-semibold text-slate-900">Үүсгэсэн хүн:</span>
              <span>{task.creator_name}</span>
            </div>
          )}
          {task.attachment && (() => {
            const mime = task.attachment?.mime_type?.toLowerCase() || "";
            const url = task.attachment?.url || buildTmpMediaUrl(task.attachment?.name);
            const looksImage = mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(url);
            if (looksImage) {
              return (
                <div className="flex flex-col gap-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-700">Хавсралт</p>
                      <span className="text-[11px] text-slate-500">
                        {task.attachment.mime_type || "image"}{" "}
                        {task.attachment.size ? `• ${(task.attachment.size / 1024).toFixed(1)} KB` : ""}
                      </span>
                    </div>
                    <a href={url} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={url}
                        alt={task.attachment?.name || "attachment"}
                        className="max-h-[360px] w-full rounded-md object-contain bg-white"
                      />
                    </a>
                    {task.attachment.name && (
                      <p className="mt-2 text-xs text-slate-600 break-all">{task.attachment.name}</p>
                    )}
                  </div>
                </div>
              );
            }

            // Non-image: fallback to link + meta
            return (
              <div className="flex items-start gap-3">
                <span className="font-semibold text-slate-900">Хавсралт:</span>
                <div className="flex flex-col gap-1">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {task.attachment.name || "Файл татах"}
                  </a>
                  <span className="text-xs text-slate-500">
                    {task.attachment.mime_type || "mime/type"}{" "}
                    {task.attachment.size ? `• ${(task.attachment.size / 1024).toFixed(1)} KB` : ""}
                  </span>
                </div>
              </div>
            );
          })()}

          {task.urls && task.urls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">Холбоосууд</p>
              <div className="flex flex-col gap-2">
                {task.urls.map((url, idx) => (
                  <a
                    key={`${url}-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline break-all text-sm"
                  >
                    {idx + 1}. {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">Тааг</p>
          {task.tags && task.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Таг алга</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">Гүйцээгчид</p>
          {task.participants && task.participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {task.participants.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {user.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Гүйцээгчид алга</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">Тайлбар</p>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
            {task.description || "—"}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">Сэтгэгдэл</p>
          {task.comments && task.comments.length > 0 ? (
            <div className="space-y-3">
              {task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{comment.userName || "—"}</span>
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{comment.comment || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Сэтгэгдэл алга</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">Сэтгэгдэл нэмэх</p>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Сэтгэгдэл бичих..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommentText("")}
              disabled={commentLoading || commentText.trim().length === 0}
            >
              Цэвэрлэх
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={commentLoading || commentText.trim().length === 0}
            >
              {commentLoading ? "Илгээж байна..." : "Илгээх"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
