import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import webpush from "npm:web-push";
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = "mailto:no-reply@photo.yanik.pro";
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error("VAPID keys are not set in environment variables");
}
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
serve(async (req)=>{
  try {
    const { title, body } = await req.json();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({
        error: "Missing Supabase environment variables"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notification_devices?is_active=eq.true`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json"
      }
    });
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: "Failed to fetch devices"
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const devices = await response.json();
    const payload = JSON.stringify({
      title,
      body
    });
    const sendPromises = devices.map((device)=>{
      try {
        const subscription = JSON.parse(device.endpoint);
        return webpush.sendNotification(subscription, payload);
      } catch (e) {
        console.warn("Invalid subscription JSON, skipping device:", device.endpoint, e);
        return null;
      }
    }).filter((p)=>p !== null);
    const results = await Promise.allSettled(sendPromises);
    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
