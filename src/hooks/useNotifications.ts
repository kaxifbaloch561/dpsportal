import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Browser Notification hook — requests permission and shows native notifications
 * for new messages, announcements, account status, and discussion messages.
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const permissionRef = useRef<NotificationPermission>("default");

  // Request permission on mount
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      permissionRef.current = "granted";
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((p) => {
        permissionRef.current = p;
      });
    }
  }, []);

  const showNotification = useCallback((title: string, body: string, icon?: string) => {
    if (permissionRef.current !== "granted") return;
    try {
      const notif = new Notification(title, {
        body,
        icon: icon || "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: `dps-${Date.now()}`,
        vibrate: [200, 100, 200],
      });
      notif.onclick = () => { window.focus(); notif.close(); };
    } catch { /* SW context fallback - ignore */ }
  }, []);

  useEffect(() => {
    if (!user?.email || user.role !== "teacher") return;

    // 1. Listen for new inbox messages
    const msgChannel = supabase
      .channel("notif-inbox")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "admin_messages",
        filter: `recipient_email=eq.${user.email}`,
      }, (payload: any) => {
        const msg = payload.new;
        showNotification(
          `📩 New Message: ${msg.subject || "No Subject"}`,
          msg.message?.substring(0, 100) || "You have a new message",
        );
      })
      .subscribe();

    // 2. Listen for new announcements
    const annChannel = supabase
      .channel("notif-announcements")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "announcements",
      }, (payload: any) => {
        const ann = payload.new;
        if (ann.is_active) {
          showNotification(
            `📢 ${ann.title || "New Announcement"}`,
            ann.message?.substring(0, 100) || "Check the latest announcement",
          );
        }
      })
      .subscribe();

    // 3. Listen for account status changes
    const accountChannel = supabase
      .channel("notif-account")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "teacher_accounts",
        filter: `email=eq.${user.email}`,
      }, (payload: any) => {
        const updated = payload.new;
        const oldStatus = payload.old?.status;
        if (updated.status !== oldStatus) {
          const statusMap: Record<string, string> = {
            approved: "✅ Your account has been approved!",
            paused: "⏸️ Your account has been paused.",
            rejected: "❌ Your account has been rejected.",
            removed: "🚫 Your account has been removed.",
          };
          showNotification(
            "Account Update",
            statusMap[updated.status] || `Account status: ${updated.status}`,
          );
        }
      })
      .subscribe();

    // 4. Listen for discussion messages (from others)
    const discChannel = supabase
      .channel("notif-discussion")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "discussion_messages",
      }, (payload: any) => {
        const msg = payload.new;
        // Don't notify for own messages
        if (msg.sender_email === user.email) return;
        showNotification(
          `💬 ${msg.sender_name || "Someone"} in Discussion`,
          msg.message?.substring(0, 100) || "Sent a message in the discussion room",
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(annChannel);
      supabase.removeChannel(accountChannel);
      supabase.removeChannel(discChannel);
    };
  }, [user?.email, user?.role, showNotification]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === "granted";
  }, []);

  return { requestPermission, showNotification, permission: permissionRef.current };
};
