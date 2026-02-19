import { useState, useEffect } from 'react';
import { contactMessagesApi, type ContactMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { setPageTitle } from '@/lib/page-title';
import { Mail, MailOpen, Trash2, RefreshCw, Loader2, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesIndex() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  useEffect(() => {
    setPageTitle('Messages');
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await contactMessagesApi.getAll();
      setMessages(res.data.data || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to load messages' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.is_read) {
      await contactMessagesApi.markRead(msg.id, true);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleToggleRead = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRead = !msg.is_read;
    await contactMessagesApi.markRead(msg.id, newRead);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: newRead } : m));
    setUnreadCount((c) => newRead ? Math.max(0, c - 1) : c + 1);
    if (selected?.id === msg.id) setSelected({ ...selected, is_read: newRead });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await contactMessagesApi.delete(deleteTarget.id);
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      if (!deleteTarget.is_read) setUnreadCount((c) => Math.max(0, c - 1));
      if (selected?.id === deleteTarget.id) setSelected(null);
      toast({ variant: 'success', title: 'Message deleted' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">{unreadCount}</Badge>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">{messages.length} message{messages.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadMessages} disabled={loading} className="h-8 gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Inbox className="h-10 w-10 opacity-30" />
          <p className="text-sm">No messages yet</p>
        </div>
      ) : (
        /* Two-pane layout */
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4 items-start">
          {/* Message list */}
          <div className="rounded-lg border bg-card overflow-hidden">
            {messages.map((msg, i) => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-accent/50
                  ${selected?.id === msg.id ? 'bg-accent' : ''}
                  ${i !== 0 ? 'border-t' : ''}`}
              >
                <div className={`mt-0.5 shrink-0 rounded-full p-1.5 ${msg.is_read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                  {msg.is_read ? <MailOpen className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-sm truncate ${!msg.is_read ? 'font-semibold' : 'font-medium'}`}>{msg.name}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{msg.message}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Detail pane */}
          {selected ? (
            <div className="rounded-lg border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">{selected.name}</h3>
                  <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">{selected.email}</a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline" size="sm"
                    onClick={(e) => handleToggleRead(selected, e)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {selected.is_read ? <><Mail className="h-3.5 w-3.5" />Mark Unread</> : <><MailOpen className="h-3.5 w-3.5" />Mark Read</>}
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setDeleteTarget(selected)}
                    className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />Delete
                  </Button>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
              <div className="pt-2">
                <a
                  href={`mailto:${selected.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-20 text-muted-foreground gap-2">
              <MailOpen className="h-8 w-8 opacity-30" />
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Message"
        description={`Delete message from ${deleteTarget?.name}? This cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
