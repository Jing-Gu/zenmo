export interface Memo {
  id: number;
  title: string;
  content: string;
  creationTime: Date;
  modifiedTime?: Date | null;
  pinned?: boolean | null;
}
