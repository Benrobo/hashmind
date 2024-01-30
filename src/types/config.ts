import { NotionConnectionSettings, NotionOptions } from "./notion";

export type ConfigNotion = {
  options: NotionOptions;
  connection_settings: NotionConnectionSettings;
};

export type ConfigHashnode = {
  //   connection_settings: HashnodeConnectionSettings;
  connection_settings: any;
  //   options: HashnodeOptions;
  config: any;
};

type Config = {
  hashnode: ConfigHashnode;
};

export default Config;
