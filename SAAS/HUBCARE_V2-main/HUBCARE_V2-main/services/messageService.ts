import { supabase } from '../supabaseClient';
import { ChatMessage } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

// ===========================================
// MESSAGES SERVICE
// ===========================================

export async function sendMessage(
  careRequestId: string,
  senderId: string,
  content: string
): Promise<{ data: ChatMessage | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        care_request_id: careRequestId,
        sender_id: senderId,
        content,
        message_type: 'text',
      })
      .select()
      .single();

    if (error) throw error;

    const message: ChatMessage = {
      id: data.id,
      request_id: data.care_request_id,
      sender_id: data.sender_id,
      text: data.content,
      message_type: data.message_type,
      is_read: data.is_read,
      created_at: data.created_at,
    };

    return { data: message, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function fetchMessages(careRequestId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('care_request_id', careRequestId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    request_id: d.care_request_id,
    sender_id: d.sender_id,
    text: d.content,
    message_type: d.message_type,
    is_read: d.is_read,
    created_at: d.created_at,
  }));
}

export async function markMessagesAsRead(
  careRequestId: string,
  userId: string
): Promise<void> {
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('care_request_id', careRequestId)
    .neq('sender_id', userId)
    .eq('is_read', false);
}

export async function getUnreadMessageCount(
  userId: string,
  careRequestIds: string[]
): Promise<number> {
  if (careRequestIds.length === 0) return 0;

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('care_request_id', careRequestIds)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

// ===========================================
// REALTIME SUBSCRIPTION
// ===========================================

export function subscribeToMessages(
  careRequestId: string,
  onNewMessage: (message: ChatMessage) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${careRequestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `care_request_id=eq.${careRequestId}`,
      },
      (payload) => {
        const d = payload.new as any;
        const message: ChatMessage = {
          id: d.id,
          request_id: d.care_request_id,
          sender_id: d.sender_id,
          text: d.content,
          message_type: d.message_type,
          is_read: d.is_read,
          created_at: d.created_at,
        };
        onNewMessage(message);
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToCareRequests(
  caregiverId: string,
  onNewRequest: (request: any) => void,
  onStatusChange: (request: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`care_requests:${caregiverId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'care_requests',
        filter: `caregiver_id=eq.${caregiverId}`,
      },
      (payload) => {
        onNewRequest(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'care_requests',
        filter: `caregiver_id=eq.${caregiverId}`,
      },
      (payload) => {
        onStatusChange(payload.new);
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
