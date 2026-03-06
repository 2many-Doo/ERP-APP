"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getTasks,
  createTask,
  updateTask,
  getTaskById,
  getTaskTags,
  getTags,
  getUsers,
  uploadTempMedia,
  createTaskTag,
  updateTaskTag,
  deleteTaskTag,
} from "@/lib/api";
import { AlertCircle } from "lucide-react";

import TaskHeader from "./components/TaskHeader";
import TaskTabs from "./components/TaskTabs";
import TasksTable from "./components/TasksTable";
import TagsGrid from "./components/TagsGrid";
import CreateTaskModal from "./components/CreateTaskModal";
import CreateTagModal from "./components/CreateTagModal";
import { TaskItem } from "./components/taskTypes";

const TaskManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tasks" | "tags">("tasks");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [dueDate, setDueDate] = useState(today);
  const [status, setStatus] = useState("new");
  const [urlsInput, setUrlsInput] = useState("");

  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);

  const [tagCreateOpen, setTagCreateOpen] = useState(false);
  const [tagCreateLoading, setTagCreateLoading] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagEditOpen, setTagEditOpen] = useState(false);
  const [tagEditLoading, setTagEditLoading] = useState(false);
  const [editTagName, setEditTagName] = useState("");
  const [editTagId, setEditTagId] = useState<number | null>(null);

  const router = useRouter();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTasks(1, 32);
      if (response.status === 200 && response.data) {
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        const parsed: TaskItem[] = list.map((item: any) => ({
          id: Number(item.id),
          title: item.title ?? item.name ?? "No title",
          description: item.description ?? "",
          status: item.status ?? item.state ?? "",
          status_label: item.status_label ?? "",
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
        setTasks(parsed);
      } else {
        toast.error(response.error || "Даалгавар татахад алдаа гарлаа");
        setError(response.error || "Алдаа гарлаа");
      }
    } catch (err: any) {
      const msg = err?.message || "Алдаа гарлаа";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [tagRes, userRes] = await Promise.all([getTaskTags(), getUsers()]);

      let parsedTags: any[] = [];
      if (tagRes.data) {
        if (Array.isArray(tagRes.data)) parsedTags = tagRes.data;
        else if (Array.isArray(tagRes.data?.data)) parsedTags = tagRes.data.data;
        else
          parsedTags = Object.values(tagRes.data).filter(
            (v: any) => v && typeof v === "object" && "id" in v && "name" in v,
          ) as any[];
      } else {
        const fallback = await getTags();
        if (fallback.data) {
          parsedTags = Array.isArray(fallback.data)
            ? fallback.data
            : Object.values(fallback.data).filter(
              (v: any) => v && typeof v === "object" && "id" in v && "name" in v,
            );
        }
      }

      const parsedUsers =
        userRes.data && Array.isArray(userRes.data.data)
          ? userRes.data.data
          : Array.isArray(userRes.data)
            ? userRes.data
            : [];

      setTags(parsedTags.map((t: any) => ({ id: Number(t.id), name: t.name ?? t.title ?? "Tag" })));
      setUsers(parsedUsers.map((u: any) => ({ id: Number(u.id), name: u.name ?? u.email ?? "" })));
    } catch {
      toast.error("Таг/оролцогч татахад алдаа гарлаа");
    }
  };

  const fetchTagsOnly = async () => {
    try {
      setTagsLoading(true);
      const tagRes = await getTaskTags();
      let parsedTags: any[] = [];
      if (tagRes.data) {
        if (Array.isArray(tagRes.data)) parsedTags = tagRes.data;
        else if (Array.isArray(tagRes.data?.data)) parsedTags = tagRes.data.data;
        else
          parsedTags = Object.values(tagRes.data).filter(
            (v: any) => v && typeof v === "object" && "id" in v && "name" in v,
          ) as any[];
      } else {
        const fallback = await getTags();
        if (fallback.data) {
          parsedTags = Array.isArray(fallback.data)
            ? fallback.data
            : Object.values(fallback.data).filter(
              (v: any) => v && typeof v === "object" && "id" in v && "name" in v,
            );
        }
      }
      setTags(parsedTags.map((t: any) => ({ id: Number(t.id), name: t.name ?? t.title ?? "Tag" })));
    } catch {
      toast.error("Таг татахад алдаа гарлаа");
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (activeTab === "tags" && tags.length === 0 && !tagsLoading) {
      fetchTagsOnly();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <TaskHeader
        tasksCount={tasks.length}
        onNewTask={() => {
          setDueDate(today);
          setSelectedTags([]);
          setSelectedParticipants([]);
          setAttachmentName(undefined);
          setDescription("");
          setTitle("");
          setUrlsInput("");
          fetchMeta();
          setIsCreateOpen(true);
        }}
      />

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-semibold">Алдаа</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <TaskTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "tasks" && (
        <TasksTable
          tasks={tasks}
          loading={loading}
          onRowClick={(id: number) => router.push(`/main/tasks/${id}`)}
          onEdit={async (task) => {
            try {
              setIsCreateOpen(true); // open immediately for better UX
              setCreateLoading(true);
              setIsEdit(true);
              setEditingId(task.id);
              setTitle(task.title ?? "");
              setDescription(task.description ?? "");
              setDueDate(task.created_at ? String(task.created_at).slice(0, 10) : today);
              setStatus(task.status ?? "new");
              setUrlsInput("");
              const needMeta = tags.length === 0 || users.length === 0;
              const metaPromise = needMeta ? fetchMeta() : Promise.resolve();
              const [_, res] = await Promise.all([metaPromise, getTaskById(task.id)]);
              if (res.status === 200 && res.data?.data) {
                const data = res.data.data;
                setTitle(data.title ?? data.name ?? "");
                setDescription(data.description ?? "");
                if (data.due_date) setDueDate(String(data.due_date).slice(0, 10));
                if (data.status) setStatus(String(data.status));
              if (data.status_label && !data.status) setStatus(String(data.status_label));
                const urlsRaw =
                  (Array.isArray(data.urls) && data.urls) ||
                  (Array.isArray(data.urls?.data) && data.urls.data) ||
                  (data.urls && typeof data.urls === "object" ? Object.values(data.urls) : []);
                const urlsParsed: string[] = Array.isArray(urlsRaw)
                  ? urlsRaw.filter((u: any) => typeof u === "string" && u.trim().length > 0)
                  : [];
                setUrlsInput(urlsParsed.join("\n"));
                const tagIds =
                  Array.isArray(data.tags) && data.tags.length
                    ? data.tags.map((t: any) => Number(t.id)).filter((v: any) => Number.isInteger(v))
                    : [];
                const participantIds =
                  Array.isArray(data.participants) && data.participants.length
                    ? data.participants.map((u: any) => Number(u.id)).filter((v: any) => Number.isInteger(v))
                    : [];
                setSelectedTags(tagIds);
                setSelectedParticipants(participantIds);
              }
              setIsCreateOpen(true);
            } catch (err: any) {
              toast.error(err?.message || "Даалгавар дуудахад алдаа гарлаа");
              setIsEdit(false);
              setEditingId(null);
            } finally {
              setCreateLoading(false);
            }
          }}
        />
      )}

      {activeTab === "tags" && (
        <TagsGrid
          tags={tags}
          loading={tagsLoading}
          onCreateTag={() => {
            setNewTagName("");
            setTagCreateOpen(true);
          }}
          onEditTag={(tag) => {
            setEditTagId(tag.id);
            setEditTagName(tag.name ?? "");
            setTagEditOpen(true);
          }}
          onDeleteTag={async (tag) => {
            if (!tag?.id) return;
            const confirmed = window.confirm(`Та \"${tag.name}\" тааг устгах уу?`);
            if (!confirmed) return;
            const res = await deleteTaskTag(tag.id);
            if (res.status === 200 || res.status === 204) {
              toast.success("Таг устгалаа");
              fetchTagsOnly();
              fetchMeta();
            } else {
              toast.error(res.error || res.message || "Таг устгах үед алдаа гарлаа");
            }
          }}
        />
      )}

      <CreateTaskModal
        open={isCreateOpen}
        loading={createLoading}
        title={title}
        description={description}
        dueDate={dueDate}
        status={status}
        tags={tags}
        users={users}
        selectedTags={selectedTags}
        selectedParticipants={selectedParticipants}
        attachmentName={attachmentName}
        uploading={uploading}
        urlsValue={urlsInput}
        showStatusSelect={isEdit}
        onClose={() => setIsCreateOpen(false)}
        onChangeTitle={setTitle}
        onChangeDescription={setDescription}
        onChangeDueDate={setDueDate}
        onChangeStatus={setStatus}
        onChangeUrls={setUrlsInput}
        onSelectTag={(id: number) => !selectedTags.includes(id) && setSelectedTags((prev) => [...prev, id])}
        onRemoveTag={(id: number) => setSelectedTags((prev) => prev.filter((tid) => tid !== id))}
        onSelectParticipant={(id: number) =>
          !selectedParticipants.includes(id) && setSelectedParticipants((prev) => [...prev, id])
        }
        onRemoveParticipant={(id: number) =>
          setSelectedParticipants((prev) => prev.filter((uid) => uid !== id))
        }
        onUpload={async (file: File) => {
          const res = await uploadTempMedia(file);
          if (res.status === 200 || res.status === 201) {
            const name = res.data?.name || res.data?.file || "";
            setAttachmentName(name);
            toast.success("Файл амжилттай хууллаа");
            return true;
          }
          toast.error(res.error || "Файл хуулахад алдаа гарлаа");
          return false;
        }}
        onSubmit={async () => {
          const trimmed = title.trim();
          if (!trimmed) {
            toast.error("Нэр талбар шаардлагатай");
            return;
          }
          try {
            setCreateLoading(true);
            const payload: any = {
              title: trimmed, // backend requires title; keep name for backward compatibility
              name: trimmed,
              description: description.trim(),
            };
            if (dueDate) payload.due_date = dueDate;
            const effectiveStatus = status?.trim() || (isEdit ? undefined : "new");
            if (effectiveStatus) payload.status = effectiveStatus;
            const validTags = selectedTags.filter((id) => Number.isInteger(id) && id > 0);
            const validParticipants = selectedParticipants.filter(
              (id) => Number.isInteger(id) && id > 0,
            );
            if (validTags.length) payload.tags = validTags;
            if (validParticipants.length) payload.participants = validParticipants;
            payload.attachment = attachmentName?.trim() || "";
            const urlsList = urlsInput
              .split(/\r?\n/)
              .map((u) => u.trim())
              .filter((u) => u.length > 0);
            if (urlsList.length) payload.urls = urlsList;
            const res = isEdit && editingId ? await updateTask(editingId, payload) : await createTask(payload);
            const okStatuses = [200, 201, 202, 204];
            if (okStatuses.includes(res.status)) {
              toast.success(isEdit ? "Даалгавар шинэчлэгдлээ" : "Даалгавар үүсгэлээ");
              setIsCreateOpen(false);
              setTitle("");
              setDescription("");
              setDueDate(today);
              setStatus("new");
              setSelectedTags([]);
              setSelectedParticipants([]);
              setAttachmentName(undefined);
              setIsEdit(false);
              setEditingId(null);
              fetchTasks();
            } else {
              toast.error(res.error || res.message || "Үүсгэх/шинэчлэхэд алдаа гарлаа");
            }
          } catch (err: any) {
            toast.error(err?.message || "Үүсгэх/шинэчлэхэд алдаа гарлаа");
          } finally {
            setCreateLoading(false);
          }
        }}
        setUploading={setUploading}
        titleText={isEdit ? "Даалгавар засах" : "Даалгавар үүсгэх"}
        submitText={isEdit ? "Шинэчлэх" : "Үүсгэх"}
      />

      <CreateTagModal
        open={tagCreateOpen}
        loading={tagCreateLoading}
        value={newTagName}
        onClose={() => setTagCreateOpen(false)}
        onChange={setNewTagName}
        onSubmit={async () => {
          const trimmed = newTagName.trim();
          if (!trimmed) {
            toast.error("Тагийн нэр шаардлагатай");
            return;
          }
          try {
            setTagCreateLoading(true);
            const res = await createTaskTag({ name: trimmed });
            if (res.status === 200 || res.status === 201) {
              toast.success("Таг үүслээ");
              setTagCreateOpen(false);
              setNewTagName("");
              fetchTagsOnly();
              fetchMeta();
            } else {
              toast.error(res.error || "Таг үүсгэхэд алдаа гарлаа");
            }
          } catch (err: any) {
            toast.error(err?.message || "Таг үүсгэхэд алдаа гарлаа");
          } finally {
            setTagCreateLoading(false);
          }
        }}
      />

      <CreateTagModal
        open={tagEditOpen}
        loading={tagEditLoading}
        value={editTagName}
        onClose={() => {
          setTagEditOpen(false);
          setEditTagId(null);
        }}
        onChange={setEditTagName}
        onSubmit={async () => {
          const trimmed = editTagName.trim();
          if (!trimmed || !editTagId) {
            toast.error("Тагийн нэр шаардлагатай");
            return;
          }
          try {
            setTagEditLoading(true);
            const res = await updateTaskTag(editTagId, { name: trimmed });
            if (res.status === 200 || res.status === 201) {
              toast.success("Таг шинэчлэгдлээ");
              setTagEditOpen(false);
              setEditTagId(null);
              setEditTagName("");
              fetchTagsOnly();
              fetchMeta();
            } else {
              toast.error(res.error || res.message || "Таг шинэчлэхэд алдаа гарлаа");
            }
          } catch (err: any) {
            toast.error(err?.message || "Таг шинэчлэхэд алдаа гарлаа");
          } finally {
            setTagEditLoading(false);
          }
        }}
        titleText="Тааг засах"
        submitText="Шинэчлэх"
      />
    </div>
  );
};

export default TaskManagement;
