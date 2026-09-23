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

export interface ProjectSummary {
  projectId: string;
  projectName: string;
}

export interface ProjectListResponse {
  projects: ProjectSummary[];
}

export interface ProjectCreateRequest {
  name: string;
}

export interface ProjectCreateResponse {
  projectId: string;
  projectName: string;
}

export interface ProjectRenameRequest {
  projectId: string;
  name: string;
}

export interface ProjectRenameResponse {
  projectId: string;
  projectName: string;
}

export interface ProjectDeleteRequest {
  projectId: string;
}

export interface ProjectDeleteResponse {
  projectId: string;
  deleted: boolean;
}
