import { ContentTypeDefinition } from "@cms/types/content-types";

export const articleContentType: ContentTypeDefinition = {
  name: "article",
  displayName: "Article",
  description: "Blog articles and posts",
  fields: [
    {
      name: "title",
      type: "text",
      displayName: "Title",
      required: true,
      validation: {
        minLength: 1,
        maxLength: 200,
      },
    },
    {
      name: "slug",
      type: "text",
      displayName: "Slug",
      required: true,
      unique: true,
      validation: {
        pattern: "^[a-z0-9-]+$",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      displayName: "Excerpt",
      required: false,
      validation: {
        maxLength: 500,
      },
    },
    {
      name: "content",
      type: "richtext",
      displayName: "Content",
      required: true,
    },
    {
      name: "featuredImage",
      type: "media",
      displayName: "Featured Image",
      required: false,
      validation: {
        accept: ["image/*"],
      },
    },
    {
      name: "published",
      type: "boolean",
      displayName: "Published",
      required: false,
      defaultValue: false,
    },
    {
      name: "publishedAt",
      type: "datetime",
      displayName: "Published At",
      required: false,
    },
    {
      name: "tags",
      type: "text",
      displayName: "Tags",
      multiple: true,
      required: false,
    },
  ],
  options: {
    timestamps: true,
    slugField: "slug",
    titleField: "title",
  },
};
