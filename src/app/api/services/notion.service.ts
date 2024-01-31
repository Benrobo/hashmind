import { NotionOptions } from "@/types/notion";
import { Client } from "@notionhq/client";
import { MdBlock } from "notion-to-md/build/types";
import { NotionToMarkdown } from "notion-to-md";
import { ConfigNotion } from "@/types/config";
import slugify from "slugify";
import HttpException from "../utils/exception";
import { NotionDBPosts, RESPONSE_CODE } from "@/types";

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

  // notion database are like collections in mongodb
  async searchDatabase() {
    const response = await this.notion.search({
      filter: {
        value: "database",
        property: "object",
      },
      sort: {
        direction: "ascending",
        timestamp: "last_edited_time",
      },
    });
    const databaseId = response.results[0].id;
    return {
      databaseId,
    };
  }

  //
  async getDBPosts(databaseId: string) {
    const response = await this.notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          timestamp: "last_edited_time",
          direction: "descending",
        },
      ],
      filter: {
        property: "Status",
        type: "status",
        status: {
          equals: "Done",
        },
      },
    });

    const articles = [];
    for (const data of response.results) {
      // @ts-expect-error
      const properties = data?.properties as any;
      const notionContent = this.n2m.toMarkdownString(
        await this.n2m.pageToMarkdown(data.id)
      );

      const slug = properties["Slug"]?.rich_text[0]?.plain_text;
      const title = properties["Title"]?.title[0]?.plain_text;

      articles.push({
        id: data.id,
        title,
        subtitle: properties["Subtitle"]?.rich_text[0]?.plain_text,
        status: properties["Status"]?.status?.name,
        slug: slugify(slug ?? title.toLowerCase()),
        coverImage: properties["Cover Image"]?.files[0]?.file?.url,
        content: notionContent?.parent,
        // @ts-expect-error
        pageUrl: data?.url,
      });
    }

    return articles as NotionDBPosts[];
  }
}
