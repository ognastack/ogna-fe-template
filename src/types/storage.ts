export type Bucket = {
  owner: string;
  id: string;
  name: string;
};

export type FileObj = {
  last_modified: string;
  bucket_id: string;
  id: string;
  name: string;
};
