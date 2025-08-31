const { createStorefrontApiClient } = require('@shopify/storefront-api-client');

// 環境変数の読み込み
const shop = process.env.SHOPIFY_SHOP || 'your-store.myshopify.com';
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'dummy_storefront_token';

async function getCollectionsAndProducts() {
  try {
    if (!storefrontAccessToken || storefrontAccessToken === 'dummy_storefront_token') {
      throw new Error('Valid Storefront access token is not defined.');
    }

    const client = createStorefrontApiClient({
      storeDomain: `https://${shop}`,
      apiVersion: '2025-01',
      publicAccessToken: storefrontAccessToken,
    });

    // まずはアクセス可能な情報を確認
    const availableQuery = `
      query {
        blogs(first: 3) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
        pages(first: 3) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `;

    const response = await client.request(availableQuery);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;

  } catch (error) {
    console.error('Error:', error.message);
    console.log('{}');
    return {};
  }
}

getCollectionsAndProducts();