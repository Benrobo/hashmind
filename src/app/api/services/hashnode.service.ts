import axios from "axios";
import HttpException from "../utils/exception";
import { RESPONSE_CODE } from "@/types";
import NotionService from "./notion.service";

const $http = axios.create({
  baseURL: "https://gql.hashnode.com",
  timeout: 30000,
});

export type CreatePostType = {
  title: string;
  subtitle: string;
  contentMarkdown: string;
  tags: {
    id: string;
  }[];
  coverImageOptions?: {
    coverImageURL: string;
  };
  slug?: string;
  publicationId: string;
  apiKey: string;
  metaTags?: {
    title: string;
    description: string;
    image: string;
  };
};

type FuncResp = {
  error?: null | string;
  success?: null | string;
  data?: null | any | PublishedArtRespData;
};

export type PublishedArtRespData = {
  id: string;
  url: string;
};

export type UserArticlesRespData = {
  id: string;
  title: string;
};

export type ArticleById = {
  id: string;
  title: string;
  content?: {
    markdown: string;
  };
  subtitle?: string;
};

type UpdateArticle = {
  apiKey: string;
  update: {
    id: string;
    title?: string;
    subtitle?: string;
    contentMarkdown?: {
      markdown: string;
    };
    tags?: {
      id: string;
    }[];
    coverImageOptions?: {
      coverImageURL: string;
    };
    slug?: string;
    metaTags?: {
      title: string;
      description: string;
      image: string;
    };
  };
};

type notionToHashnodeType = {
  url: string;
  publicationId: string;
  apiKey: string;
  notionToken: string;
};

class HashnodeService {
  async createPost({
    title,
    subtitle,
    contentMarkdown,
    slug,
    publicationId,
    apiKey,
    ...config
  }: CreatePostType) {
    if (!apiKey || !publicationId) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Unauthorized, missing api key or publication id`,
        401
      );
    }

    const funcResp: FuncResp = { error: null, success: null, data: null };
    try {
      const reqBody = {
        query: `mutation PublishPost($input: PublishPostInput!) {
            publishPost(input: $input) {
              post {
                id
                url
              }
            }
        }`,
        variables: {
          input: {
            title,
            subtitle,
            publicationId,
            contentMarkdown,
            slug,
            ...config,
          },
        },
      };

      const resp = await $http({
        method: "POST",
        data: reqBody,
        headers: {
          Authorization: apiKey,
        },
      });

      const respData = resp.data;

      if (respData.errors) {
        throw new HttpException(
          RESPONSE_CODE.ERROR_CREATING_POST,
          `Something went wrong creating article. ${respData.errors[0].message}`,
          400
        );
      }

      funcResp.success = "Article created successfully";
      funcResp.data = respData?.data?.publishPost.post as PublishedArtRespData;
      return funcResp;
    } catch (e: any) {
      const msg = e.response?.data?.errors[0]?.message ?? e.message;
      console.log(msg, e);
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Something went wrong creating article.`,
        400
      );
    }
  }

  async getUserArticles(apiKey: string) {
    if (!apiKey) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Unauthorized, missing api key.`,
        401
      );
    }

    const funcResp: FuncResp = { error: null, success: null, data: null };
    try {
      const reqBody = {
        query: `query GetPost {
          me {
            posts(pageSize:20, page:1) {
              nodes {
                id
                title
              }
            }
          }
        }`,
      };

      // ! Uncomment this once you're done
      const resp = await $http({
        method: "POST",
        data: reqBody,
        headers: {
          Authorization: apiKey,
        },
      });

      const respData = resp.data?.data;
      // const respData = {
      //   publishPost: {
      //     post: {
      //       id: "123",
      //       url: "https://google.com",
      //     },
      //   },
      // };
      funcResp.success = "Article created successfully";
      funcResp.data = respData.me.posts.nodes as UserArticlesRespData;
      return funcResp;
    } catch (e: any) {
      const msg = e.response?.data?.errors[0]?.message ?? e.message;
      console.log(msg);
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Something went wrong creating article.`,
        400
      );
    }
  }

  async getArticleById({ id, apiKey }: { apiKey: string; id: string }) {
    if (!apiKey || !id) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Unauthorized, missing api key or article id.`,
        400
      );
    }

    const funcResp: FuncResp = { error: null, success: null, data: null };
    try {
      const reqBody = {
        query: `query Post($id: ID!) {
          post(id: $id){
            id
            title
            subtitle
            content {
              markdown
            }
          }
        }`,
        variables: { id },
      };

      const resp = await $http({
        method: "POST",
        data: reqBody,
        headers: {
          Authorization: apiKey,
        },
      });

      const respData = resp.data?.data;
      funcResp.success = "Article fetched successfully";
      funcResp.data = respData.post as ArticleById;
      return funcResp;
    } catch (e: any) {
      const msg = e.response?.data?.errors[0]?.message ?? e.message;
      console.log(msg);
      throw new HttpException(
        RESPONSE_CODE.ERROR_FETCHING_ARTICLE,
        `Something went wrong fetching article.`,
        400
      );
    }
  }

  async updateArticle({ apiKey, update }: UpdateArticle) {
    try {
      if (!apiKey) {
        throw new HttpException(
          RESPONSE_CODE.ERROR_CREATING_POST,
          `Unauthorized, missing api key`,
          401
        );
      }

      const funcResp: FuncResp = { error: null, success: null, data: null };

      const reqBody = {
        query: `mutation UpdatePost($input: UpdatePostInput!) {
          updatePost(input: $input) {
            post{
              id
            }
          }
        }`,
        variables: {
          input: {
            ...update,
          },
        },
      };

      // ! Uncomment this once you're done
      const resp = await $http({
        method: "POST",
        data: reqBody,
        headers: {
          Authorization: apiKey,
        },
      });

      const respData = resp.data?.data;

      funcResp.success = "Article updated successfully";
      funcResp.data = respData?.updatePost.post as UpdateArticle;
      return funcResp;
    } catch (e: any) {
      const msg = e.response?.data?.errors[0]?.message ?? e.message;
      console.log(msg);
      console.log(e);
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Something went wrong updating article.`,
        400
      );
    }
  }

  async deleteArticle({ id, apiKey }: { apiKey: string; id: string }) {
    if (!apiKey) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_DELETING_ARTICLE,
        `Unauthorized, missing api key`,
        401
      );
    }

    const funcResp: FuncResp = { error: null, success: null, data: null };
    try {
      const reqBody = {
        query: `mutation RemovePost($input: RemovePostInput!) {
            removePost(input: $input) {
              post {
                id
                title
              }
            }
        }`,
        variables: {
          input: {
            id,
          },
        },
      };

      // ! Uncomment this once you're done
      const resp = await $http({
        method: "POST",
        data: reqBody,
        headers: {
          Authorization: apiKey,
        },
      });

      const respData = resp.data?.data;
      funcResp.success = "Article created successfully";
      funcResp.data = respData.removePost.post as { id: string; title: string };
      return funcResp;
    } catch (e: any) {
      const msg = e.response?.data?.errors[0]?.message ?? e.message;
      console.log(msg);
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Something went wrong creating article.`,
        400
      );
    }
  }

  async notionTohashnode(props: notionToHashnodeType) {
    const { apiKey, publicationId, url, notionToken } = props;

    if (!url) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Notion page url is missing.`,
        401
      );
    }

    if (!apiKey || !publicationId || !notionToken) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Unauthorized, missing api key or publication id`,
        401
      );
    }

    const notionService = new NotionService({
      connection_settings: {
        token: notionToken,
      },
      options: {
        skip_block_types: [""],
      },
    });

    const pageId = notionService.getPageIdFromURL(url);
    const blocks = await notionService.getBlocks(url);
    const content = await notionService.getMarkdown(blocks);
    const properties = await notionService.getArticleProperties(pageId);
    const markdown = content.parent;
    const title = properties?.title?.title?.[0]?.plain_text;
    const slug = notionService.getArticleSlug(title!);

    // publish to hashnode
    const publishedArticle = await this.createPost({
      apiKey,
      contentMarkdown: markdown ?? "Default content",
      publicationId,
      title,
      subtitle: "",
      tags: [],
      slug,
    });

    return publishedArticle;
  }
}

const hashnodeService = new HashnodeService();
export default hashnodeService;
