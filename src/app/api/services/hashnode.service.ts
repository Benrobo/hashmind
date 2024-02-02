import axios from "axios";
import HttpException from "../utils/exception";
import { RESPONSE_CODE, ReturnedUserArticles } from "@/types";
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
  author: { username: string };
  cuid: string;
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
    contentMarkdown?: string;
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
  publicationId: string;
  databaseId: string;
  pageId: string;
  apiKey: string;
  notionToken: string;
  type: "UPDATE" | "CREATE";
  article_id?: string;
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
                author {
                  username
                }
                cuid
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
      console.log(msg, e.response?.data);
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Something went wrong creating article.`,
        400
      );
    }
  }

  async getUserArticles(apiKey: string, publicationId: string) {
    if (!apiKey) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Unauthorized, missing api key.`,
        401
      );
    }

    const funcResp: FuncResp = { error: null, success: null, data: null };
    try {
      // fetch articles from users personal blog only
      // const reqBody = {
      //   query: `query GetPost {
      //     me {
      //       posts(pageSize:5, page:1) {
      //         nodes {
      //           id
      //           title
      //           url
      //           coverImage {
      //             url
      //           }
      //           slug
      //           views
      //           readTimeInMinutes
      //           likedBy(first: 1000) {
      //             totalDocuments
      //           }
      //         }
      //       }
      //     }
      //   }`,
      // };

      // fetch articles based on the user blog
      const reqBody = {
        query: `query Publication(
          $id: ObjectId!
        ) {
          publication(
            id: $id
          ) {
            posts(first: 20) {
              edges{
                node{
                  id
                  slug
                  title
                  url
                  coverImage {
                    url
                  }
                  slug
                  views
                  readTimeInMinutes
                  likedBy(first: 10) {
                    totalDocuments
                  }
                }
              }
            }
          }
        }`,
        variables: {
          id: publicationId,
        },
      };

      const resp = await $http({
        method: "POST",
        data: reqBody,
        headers: {
          Authorization: apiKey,
        },
      });

      const respData = resp.data?.data;
      const articles = respData.publication.posts
        .edges as UserArticlesRespData[];
      funcResp.success = "Article fetched successfully";
      funcResp.data = articles as UserArticlesRespData[];
      return funcResp;
    } catch (e: any) {
      const msg = e.response?.data?.errors[0]?.message ?? e.message;
      console.log(msg);
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Something went wrong fetching article.`,
        400
      );
    }
  }

  async getArticleById({
    id,
    apiKey,
    publicationId,
  }: {
    apiKey: string;
    id: string;
    publicationId: string;
  }) {
    if (!apiKey || !id || !publicationId) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Unauthorized, missing api key or article id.`,
        400
      );
    }

    const funcResp: FuncResp = { error: null, success: null, data: null };

    const resp = await this.getUserArticles(apiKey, publicationId);
    const articles = resp.data as ReturnedUserArticles[];
    const modifiedArticles = articles.map(art=> {
      return {
        ...art.node
      }
    })

    const article = modifiedArticles.find((art) => art.id === id);
    
    console.log({
      modifiedArticles,
      article,
    });

    if (!article) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_FETCHING_ARTICLE,
        `Article not found.`,
        404
      );
    }
    funcResp.success = "Article fetched successfully";
    funcResp.data = article as ArticleById;

    return funcResp;
  }

  async updateArticle({ apiKey, update }: UpdateArticle) {
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
              url
              author {
                username
              }
              cuid
              title
              slug
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

    if (resp.data?.errors?.length > 0) {
      console.log(resp?.data?.errors);
      const err = resp?.data?.errors[0];
      const { code } = err?.extensions;
      const notFound = code === "NOT_FOUND";
      throw new HttpException(
        notFound
          ? RESPONSE_CODE.NOT_FOUND
          : RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        notFound
          ? `Article notfound.`
          : `Something went wrong updating article`,
        notFound ? 404 : 400
      );
    }

    funcResp.success = "Article updated successfully";
    funcResp.data = respData?.updatePost.post as PublishedArtRespData;
    return funcResp;
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
    const {
      apiKey,
      publicationId,
      notionToken,
      type,
      article_id,
      pageId,
      databaseId,
    } = props;

    if (!apiKey || !publicationId || !notionToken) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_POST,
        `Unauthorized, missing api key or publication id`,
        401
      );
    }

    const notionService = new NotionService({
      connection_settings: {
        token: notionToken!,
      },
      options: {
        skip_block_types: [""],
      },
    });

    const posts = await notionService.getDBPosts(databaseId);

    const post = posts.find((p) => p.id == pageId);

    let publishedArticle;

    if (type === "CREATE") {
      // publish to hashnode
      publishedArticle = await this.createPost({
        apiKey,
        contentMarkdown: post?.content ?? "Default content",
        publicationId,
        title:
          post?.title!.length !== 6 ? `${post?.title!} Title` : post?.title!,
        subtitle: post?.subtitle ?? "",
        tags: [],
        slug: post?.slug,
        coverImageOptions: {
          coverImageURL: post?.coverImage!,
        },
      });
    } else {
      // check if article exists
      if (article_id) {
        const article = await this.getArticleById({
          apiKey,
          id: article_id!,
          publicationId,
        });

        if (article.error) {
          throw new HttpException(
            RESPONSE_CODE.ERROR_CREATING_POST,
            `Article not found`,
            404
          );
        }
      }

      publishedArticle = await this.updateArticle({
        apiKey,
        update: {
          id: article_id!,
          contentMarkdown: post?.content ?? "Default content",
          title: post?.title!,
          subtitle: post?.subtitle ?? "",
          tags: [],
          slug: post?.slug,
          coverImageOptions: {
            coverImageURL: post?.coverImage!,
          },
        },
      });
    }

    return publishedArticle;
  }
}

const hashnodeService = new HashnodeService();
export default hashnodeService;
