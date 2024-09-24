export type Message = {
  message_obj_addr: string;
  creator_addr: string;
  creation_timestamp: number;
  last_update_timestamp: number;
  last_update_event_idx: number;
  content: string;
};
