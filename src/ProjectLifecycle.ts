export interface ProjectLoadRequest {
  projectId: string;
  loadId: string;
}

export interface ProjectLoadAcceptedPayload {
  accepted: true;
  projectId: string;
  loadId: string;
}

export interface ProjectLoadedPayload {
  projectId: string;
  loadId: string;
}

export interface ProjectLoadFailedPayload {
  projectId: string;
  loadId: string;
  error: string;
}
