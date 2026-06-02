export type StorageRef = {
  bucket: string;
  path: string;
};

const storagePrefix = "storage:";

export function isStorageRef(value: string | null | undefined) {
  return Boolean(value?.startsWith(storagePrefix));
}

export function parseStorageRef(value: string): StorageRef | null {
  if (!isStorageRef(value)) return null;

  const [, bucket, ...pathParts] = value.split(":");
  const path = pathParts.join(":");

  if (!bucket || !path) return null;
  return { bucket, path };
}

export function toStorageRef(bucket: string, path: string) {
  return `${storagePrefix}${bucket}:${path}`;
}

export function fileViewUrl(value: string) {
  return isStorageRef(value) ? `/api/files/view?ref=${encodeURIComponent(value)}` : value;
}
