/**
 * Typed API client for Precedent backend endpoints.
 */

export interface Incident {
  id: string;
  title: string;
  status: string;
}

export async function fetchIncident(id: string): Promise<Incident> {
  const response = await fetch(`/v1/incidents/${id}`);
  return response.json();
}
