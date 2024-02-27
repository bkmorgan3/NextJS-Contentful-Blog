const POST_GRAPHQL_FIELDS = `
  slug
  title
  coverImage {
    url
  }
  date
  author {
    name
    picture {
      url
    }
  }
  excerpt
  content {
    json
    links {
      assets {
        block {
          sys {
            id
          }
          url
          description
        }
      }
    }
  }
`;

async function fetchGraphQL(query: string, preview = false): Promise<any> {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
      next: { tags: ["posts"] },
    },
  ).then((response) => response.json());
}

function extractPost(fetchResponse: any): any {
  return fetchResponse?.data?.postCollection?.items?.[0];
}

function extractPostEntries(fetchResponse: any): any[] {
  return fetchResponse?.data?.postCollection?.items;
}

function extractPhotoEntries(fetchResponse: any): any[] {
  return fetchResponse?.data?.photoCollection?.items;
}

export async function getPreviewPostBySlug(slug: string | null): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      postCollection(where: { slug: "${slug}" }, preview: true, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    true,
  );
  return extractPost(entry);
}

export async function getPersonalPhotos(isDraftMode: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(`
  query {
  photoCollection( where: {contentfulMetadata: { tags: {id_contains_some: "personal"}}}) {
    items {
      photo {
        url
        width
        title
        description
        height
        contentfulMetadata {
          tags {
            name
            id
          }
        }
      }
    }
  }
}`, isDraftMode)
return extractPhotoEntries(entries)
} 
export async function getCommercialPhotos(isDraftMode: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(`
  query {
  photoCollection( where: {contentfulMetadata: { tags: {id_contains_some: "commercial"}}}) {
    items {
      photo {
        url
        title
        description
        width
        height
        contentfulMetadata {
          tags {
            name
            id
          }
        }
      }
    }
  }
}`, isDraftMode)
return extractPhotoEntries(entries)
} 

export async function getAllPhotos(isDraftMode: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(
    `query {
  photoCollection {
    items {
      photo {
        url
        description
        title
        width
        height
        contentfulMetadata {
          tags {
            name
          }
        }
      }
    }
  }
}`,
isDraftMode,
  )
  return extractPhotoEntries(entries)
};

export async function getAllPosts(isDraftMode: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(
    `query {
      postCollection(where: { slug_exists: true }, order: date_DESC, preview: ${
        isDraftMode ? "true" : "false"
      }) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode,
  );
  return extractPostEntries(entries);
}

export async function getPostAndMorePosts(
  slug: string,
  preview: boolean,
): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      postCollection(where: { slug: "${slug}" }, preview: ${
      preview ? "true" : "false"
    }, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview,
  );
  const entries = await fetchGraphQL(
    `query {
      postCollection(where: { slug_not_in: "${slug}" }, order: date_DESC, preview: ${
      preview ? "true" : "false"
    }, limit: 2) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview,
  );
  return {
    post: extractPost(entry),
    morePosts: extractPostEntries(entries),
  };
}

export function sendEmail(data: FormData) {

  const emailData = {
    name: data.get('fullname'),
    subject: data.get('subject'),
    email: data.get('email'),
    message: data.get('message')
  }

  const apiEndpoint = '/api/email';


  fetch(apiEndpoint, {
    method: 'POST',
    body: JSON.stringify(emailData)
  })
  .then(res => res.json())
  .then(resp => {
    alert(resp.message)
  })
  .catch(err => {
    alert(err.message)
  })
}