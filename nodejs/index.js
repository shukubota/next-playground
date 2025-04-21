const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { restResources } = require('@shopify/shopify-api/rest/admin/2024-01');
const { Node: NodeAdapter } = require('@shopify/shopify-api/adapters/node');
const { createStorefrontApiClient } = require('@shopify/storefront-api-client');

// 環境変数が設定されていない場合はダミー値を使用
const apiKey = process.env.SHOPIFY_API_KEY || 'dummy_key';
const apiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || 'dummy_secret';
const shop = process.env.SHOPIFY_SHOP || 'your-store.myshopify.com';
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || 'dummy_token';
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'dummy_storefront_token';

console.log("----------------")
console.log(apiKey)
console.log(apiSecretKey)
console.log(shop)
console.log(accessToken)
console.log("----------------")

// ホスト名はショップURL(.myshopify.comを除いた部分)
const hostName = shop.replace('.myshopify.com', '');

const shopify = shopifyApi({
  apiKey,
  apiSecretKey,
  scopes: ['read_products'],
  hostName,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  customAdapters: NodeAdapter,
  restResources,
});

async function getProducts() {
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

    // プロダクト一覧を取得
    const response = await client.get({
      path: 'products'
    });

    console.log('Products retrieved successfully:');
    console.log(JSON.stringify(response.body.products, null, 2));

    return response.body.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

async function getProductsByStorefront() {
  try {
    // Storefront アクセストークンが存在するか確認
    if (!storefrontAccessToken) {
      throw new Error('Storefront access token is not defined. Please set SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable.');
    }

    console.log(storefrontAccessToken)
    console.log("-------------")

    // 新しいStorefront APIクライアントを作成
    const client = createStorefrontApiClient({
      storeDomain: `https://${shop}`,
      apiVersion: '2024-07',
      publicAccessToken: storefrontAccessToken,
    });

    // GraphQLクエリを定義
    const query = `
      {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
              description
              variants(first: 1) {
                edges {
                  node {
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    // プロダクト一覧を取得
    const response = await client.request(query);

    console.log('Products retrieved successfully via Storefront API:');
    console.log(JSON.stringify(response.data.products.edges, null, 2));

    return response.data.products.edges;
  } catch (error) {
    console.error('Error fetching products via Storefront API:', error);
    throw error;
  }
}

// // REST APIでの商品取得を実行
// getProducts()
//   .then(() => console.log('Finished fetching products'))
//   .catch(err => console.error('Failed to fetch products:', err));

// Storefront APIでの商品取得を実行
getProductsByStorefront()
  .then(() => console.log('Finished fetching products via Storefront API'))
  .catch(err => console.error('Failed to fetch products via Storefront API:', err));
