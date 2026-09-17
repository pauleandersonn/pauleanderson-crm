import { supabase } from '../supabaseClient';
import { CareRequest, CaregiverProfile, Review } from '../types';

// ===========================================
// CARE REQUESTS SERVICE
// ===========================================

export async function createCareRequest(request: {
  caregiver_id: string;
  family_id: string;
  patient_name: string;
  patient_age: number;
  shift: string;
  care_type: string;
  contract_type?: string;
  agreed_value?: number;
  city?: string;
  district?: string;
  address?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}): Promise<{ data: CareRequest | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('care_requests')
      .insert({
        caregiver_id: request.caregiver_id,
        family_id: request.family_id,
        patient_name: request.patient_name,
        patient_age: request.patient_age,
        shift: request.shift,
        care_type: request.care_type,
        contract_type: request.contract_type,
        agreed_value: request.agreed_value,
        city: request.city,
        district: request.district,
        address: request.address,
        notes: request.notes,
        latitude: request.latitude,
        longitude: request.longitude,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    const mappedData: CareRequest = {
      id: data.id,
      caregiver_id: data.caregiver_id,
      family_id: data.family_id,
      patient_name: data.patient_name,
      patient_age: data.patient_age,
      status: data.status,
      created_at: data.created_at,
      shift: data.shift,
      care_type: data.care_type,
      location_summary: `${data.district || ''} - ${data.city || ''}`,
      notes: data.notes,
      contract_type: data.contract_type,
      agreed_value: data.agreed_value,
      city: data.city,
      district: data.district,
    };

    return { data: mappedData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function fetchCareRequests(userId: string, role: 'family' | 'caregiver'): Promise<CareRequest[]> {
  const column = role === 'family' ? 'family_id' : 'caregiver_id';
  
  const { data, error } = await supabase
    .from('care_requests')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching care requests:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    caregiver_id: d.caregiver_id,
    family_id: d.family_id,
    patient_name: d.patient_name,
    patient_age: d.patient_age,
    status: d.status,
    created_at: d.created_at,
    updated_at: d.updated_at,
    accepted_at: d.accepted_at,
    finished_at: d.finished_at,
    shift: d.shift || 'diurno',
    care_type: d.care_type || 'domiciliar',
    location_summary: `${d.district || ''} - ${d.city || ''}`,
    notes: d.notes,
    contract_type: d.contract_type,
    agreed_value: d.agreed_value,
    city: d.city,
    district: d.district,
    latitude: d.latitude,
    longitude: d.longitude,
  }));
}

export async function fetchPendingRequestsForCaregiver(caregiverId: string): Promise<CareRequest[]> {
  const { data, error } = await supabase
    .from('care_requests')
    .select('*')
    .eq('caregiver_id', caregiverId)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    caregiver_id: d.caregiver_id,
    family_id: d.family_id,
    patient_name: d.patient_name,
    patient_age: d.patient_age,
    status: d.status,
    created_at: d.created_at,
    shift: d.shift || 'diurno',
    care_type: d.care_type || 'domiciliar',
    location_summary: `${d.district || ''} - ${d.city || ''}`,
    notes: d.notes,
    contract_type: d.contract_type,
    agreed_value: d.agreed_value,
    city: d.city,
    district: d.district,
  }));
}

export async function updateCareRequestStatus(
  requestId: string, 
  status: 'accepted' | 'rejected' | 'finished' | 'cancelled'
): Promise<boolean> {
  const updateData: any = { status };
  
  if (status === 'accepted') {
    updateData.accepted_at = new Date().toISOString();
  } else if (status === 'finished') {
    updateData.finished_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('care_requests')
    .update(updateData)
    .eq('id', requestId);

  if (error) {
    console.error('Error updating care request status:', error);
    return false;
  }
  return true;
}

// ===========================================
// CAREGIVERS SERVICE
// ===========================================

export async function fetchCaregivers(): Promise<CaregiverProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'caregiver');

  if (error) {
    console.error('Error fetching caregivers:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    user_id: d.id,
    name: d.name || 'Cuidador',
    bio: d.bio || '',
    experience: d.experience || 'Experiência não informada',
    location: d.city ? `${d.city}, ${d.state || 'BR'}` : 'Localização não informada',
    availability: d.availability || 'A combinar',
    rating: d.rating || 0,
    review_count: d.review_count || 0,
    price_hour: d.price_hour || 0,
    avatar: d.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || 'C')}`,
    is_verified: d.is_verified || false,
    is_featured: d.plan_type === 'featured',
    latitude: d.latitude,
    longitude: d.longitude,
  }));
}

export async function updateCaregiverLocation(
  userId: string, 
  latitude: number, 
  longitude: number
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      latitude, 
      longitude, 
      location_updated_at: new Date().toISOString() 
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating caregiver location:', error);
    return false;
  }
  return true;
}

// ===========================================
// REVIEWS SERVICE
// ===========================================

export async function createReview(review: {
  care_request_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment?: string;
  review_type: 'family_to_caregiver' | 'caregiver_to_family';
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('reviews')
    .insert(review);

  if (error) {
    console.error('Error creating review:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function fetchCaregiverReviews(caregiverId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewed_id', caregiverId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data;
}

export async function getCaregiverRating(caregiverId: string): Promise<{ average: number; count: number }> {
  const { data, error } = await supabase
    .rpc('get_caregiver_rating', { caregiver_uuid: caregiverId });

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  return {
    average: parseFloat(data[0].average_rating) || 0,
    count: parseInt(data[0].total_reviews) || 0,
  };
}

// ===========================================
// PROFILE LOCATION SERVICE
// ===========================================

export async function updateUserLocation(
  userId: string,
  latitude: number,
  longitude: number
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      latitude,
      longitude,
      location_updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user location:', error);
    return false;
  }
  return true;
}
