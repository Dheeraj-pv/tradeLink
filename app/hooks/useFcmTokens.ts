"use client";

import { useEffect, useState, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase-client";
import { toast } from "sonner";

export function useFcmToken() {
  const [token, setToken] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;

    async function init() {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return;
      }

      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error(
          "Notifications are blocked. Please enable them in your browser settings.",
        );
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      console.log("Service worker registered");

      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      console.log("FCM token obtained");

      if (fcmToken) {
        setToken(fcmToken);
        await fetch("/api/notifications/register-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: fcmToken }),
        });
      }

      // Foreground messages  don't trigger the service worker — handle manually
      onMessage(messaging, (payload) => {
        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title ?? "", {
            body: payload.notification?.body,
          });
        }
      });
    }

    init();

    // Cleanup function
    return () => {
      // Reset the flag when component unmounts
      isInitialized.current = false;
    };
  }, []);

  return token;
}
