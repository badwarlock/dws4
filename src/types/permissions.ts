export type PlatformPermissionDependencyInstance = {
  id: string;
  code: string;
  name: string;
};

export type PlatformPermissionInstance = {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  dependencies: Array<PlatformPermissionDependencyInstance>;
  created: string;
};
