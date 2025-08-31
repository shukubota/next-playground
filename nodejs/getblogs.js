const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { restResources } = require('@shopify/shopify-api/rest/admin/2024-01');
const { Node: NodeAdapter } = require('@shopify/shopify-api/adapters/node');
const { createStorefrontApiClient } = require('@shopify/storefront-api-client');

// 環境変数が設定されていない場合はダミー値を使用
// const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || 'dummy_token';
// const accessToken = 'aaa';
const apiKey = process.env.SHOPIFY_API_KEY || 'dummy_key';
const apiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || 'dummy_secret';
const shop = process.env.SHOPIFY_SHOP || 'your-store.myshopify.com';
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'dummy_storefront_token';

// ホスト名はショップURL(.myshopify.comを除いた部分)
const hostName = shop.replace('.myshopify.com', '');

const shopify = shopifyApi({
  apiKey,
  apiSecretKey,
  scopes: ['read_content'],
  hostName,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  customAdapters: NodeAdapter,
  restResources,
});

async function getBlogs() {
  try {
    // アクセストークンが存在するか確認
    if (!accessToken) {
      throw new Error('Access token is not defined. Please set SHOPIFY_ACCESS_TOKEN environment variable.');
    }

    // セッションオブジェクトを正しく作成
    const session = shopify.session.customAppSession(shop);
    session.accessToken = accessToken;

    // REST APIクライアントを作成
    const client = new shopify.clients.Rest({
      session,
      apiVersion: LATEST_API_VERSION
    });

    // ブログ記事一覧を取得
    const response = await client.get({
      path: 'articles'
    });

    // console.log('Blog articles retrieved successfully:');
    // console.log(JSON.stringify(response.body.articles, null, 2));

    return response.body.articles;
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    throw error;
  }
}

async function getBlogsByStorefront() {
  try {
    // Storefront アクセストークンが存在するか確認
    if (!storefrontAccessToken) {
      throw new Error('Storefront access token is not defined. Please set SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable.');
    }

    // console.log(storefrontAccessToken)
    // console.log("-------------")

    // 新しいStorefront APIクライアントを作成
    const client = createStorefrontApiClient({
      storeDomain: `https://${shop}`,
      apiVersion: '2024-07',
      publicAccessToken: storefrontAccessToken,
    });

    // GraphQLクエリを定義
    const query = `
      query {
        blog(handle: "staffblog") {
          id
          title
          articles(first: 10) {
            edges {
              node {
                id
                title
                content
                publishedAt
                author {
                  name
                }
              }
            }
          }
        }
      }
    `;

    // ブログ記事一覧を取得
    const response = await client.request(query);

    return response.data.blog.articles.edges;
  } catch (error) {
    console.error('Error fetching blogs via Storefront API:', error);
    console.error('Error details:', error.response?.errors || error);
    throw error;
  }
}

getBlogsByStorefront()
  .then(() => console.log('Finished fetching blogs via Storefront API'))
  .catch(err => console.error('Failed to fetch blogs via Storefront API:', err));
