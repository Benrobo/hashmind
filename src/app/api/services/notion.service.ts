import { NotionOptions } from "@/types/notion";
import { Client } from "@notionhq/client";
import { MdBlock } from "notion-to-md/build/types";
import { NotionToMarkdown } from "notion-to-md";
import { ConfigNotion } from "@/types/config";
import slugify from "slugify";
import HttpException from "../utils/exception";
import { RESPONSE_CODE } from "@/types";

export default class NotionService {
  notion: Client;
  n2m: NotionToMarkdown;
  options: NotionOptions;

  constructor(config: ConfigNotion) {
    this.notion = new Client({
      auth: config.connection_settings.token,
    });
    this.n2m = new NotionToMarkdown({
      notionClient: this.notion,
    });
    this.options = config.options;
  }

  async getBlocks(url: string): Promise<MdBlock[]> {
    const pageId = this.getPageIdFromURL(url);
    const blocks = await this.n2m.pageToMarkdown(pageId);

    return blocks.filter((block) => !this.shouldSkipBlock(block.type));
  }

  async getMarkdown(source: string | MdBlock[]) {
    let mdblocks: MdBlock[] = [];
    if (typeof source === "string") {
      const pageId = this.getPageIdFromURL(source);
      mdblocks = await this.n2m.pageToMarkdown(pageId);
    } else {
      mdblocks = source;
    }

    const content = this.n2m.toMarkdownString(mdblocks);
    return content;
  }

  async getArticleProperties(page_id: string): Promise<Record<string, any>> {
    try {
      const response = await this.notion.pages.retrieve({
        page_id,
      });

      //due to an issue in Notion's types we disable ts for this line
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return response.properties;
    } catch (e: any) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        `Notion page notfound. Make sure the page is shared with hashmind integration.`,
        404
      );
    }
  }

  getArticleSlug(title: string): string {
    // return `${encodeURI(slugify(title.toLowerCase()))}`;
    return `${slugify(title.toLowerCase())}`;
  }

  getAttributeValue(attribute: Record<string, any>): string {
    switch (attribute?.type) {
      case "title":
        return attribute.title?.plain_text;
      case "rich_text":
        return attribute.rich_text[0]?.plain_text || "";
      case "date":
        return attribute.date?.start || "";
      default:
        return "";
    }
  }

  // Read more details in Notion's documentation:
  // https://developers.notion.com/docs/working-with-page-content#creating-a-page-with-content
  getPageIdFromURL(url: string): string {
    const urlArr = url.split("-"),
      unformattedId = urlArr[urlArr.length - 1].replace("?pvs=4", "");

    if (unformattedId.length !== 32) {
      throw new HttpException(
        RESPONSE_CODE.INVALID_NOTION_PAGE_URL,
        "Invalid Notion page URL.",
        400
      );
    }

    return (
      `${unformattedId.substring(0, 8)}-${unformattedId.substring(8, 12)}-` +
      `${unformattedId.substring(12, 16)}-${unformattedId.substring(16, 20)}-` +
      `${unformattedId.substring(20)}`
    );
  }

  shouldSkipBlock(type?: string): boolean {
    return (type && this.options.skip_block_types?.includes(type)) || false;
  }
}
