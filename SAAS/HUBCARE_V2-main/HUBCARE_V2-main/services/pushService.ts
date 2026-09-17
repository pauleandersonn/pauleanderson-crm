// Push Notification Service
// Gerencia Web Push Notifications

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notificações foram bloqueadas pelo usuário');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não suportado');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registrado:', registration);
    return registration;
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
    return null;
  }
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    
    console.log('Push subscription criada:', subscription);
    return subscription;
  } catch (error) {
    console.error('Erro ao criar push subscription:', error);
    return null;
  }
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<boolean> {
  // Import statically to avoid dynamic import warning
  const { supabase } = await import(/* @vite-ignore */ '../supabaseClient');
  
  const subscriptionData = subscription.toJSON();
  
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      endpoint: subscriptionData.endpoint,
      p256dh: subscriptionData.keys?.p256dh || '',
      auth: subscriptionData.keys?.auth || '',
    }, {
      onConflict: 'user_id,endpoint'
    });

  if (error) {
    console.error('Erro ao salvar push subscription:', error);
    return false;
  }
  return true;
}

export function showLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      ...options,
    });
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Initialize push notifications
export async function initializePushNotifications(userId: string): Promise<boolean> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return false;

  const registration = await registerServiceWorker();
  if (!registration) return false;

  const subscription = await subscribeToPushNotifications(registration);
  if (!subscription) return false;

  const saved = await savePushSubscription(userId, subscription);
  return saved;
}
