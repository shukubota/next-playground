'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  price: number;
  product_name: string;
  product_category: string;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface GTMEventValue {
  products: Array<{
    id: string;
    price: number;
    quantity: number;
    product_category?: string;
    product_name?: string;
  }>;
  transaction_id?: string;
  currency?: string;
  total_amount?: number;
  discount?: number;
  coupon_code?: string;
}

export default function GTMTestPage() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [eventCount, setEventCount] = useState(0);

  const products: Product[] = [
    {
      id: 'SKU_SHIRT_001',
      price: 2980,
      product_name: 'エアリズムTシャツ',
      product_category: 'トップス'
    },
    {
      id: 'SKU_PANTS_002',
      price: 4980,
      product_name: 'スリムジーンズ',
      product_category: 'ボトムス'
    },
    {
      id: 'SKU_SHOES_003',
      price: 7980,
      product_name: 'スニーカー',
      product_category: 'シューズ'
    },
    {
      id: 'SKU_BAG_004',
      price: 5980,
      product_name: 'トートバッグ',
      product_category: 'バッグ'
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const sendGTMEvent = (eventType: string, eventName: string, eventValue: GTMEventValue) => {
    const gtmData = {
      event: eventName,
      event_type: eventType,
      event_name: eventName,
      event_value: JSON.stringify(eventValue),
      member_id: 'user_demo_123456',
      timestamp: new Date().toISOString()
    };

    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(gtmData);
      setEventCount(prev => prev + 1);
      console.log('GTM Event sent:', gtmData);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      let newCart;
      
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }];
      }

      const eventValue: GTMEventValue = {
        products: [{
          id: product.id,
          price: product.price,
          quantity: 1,
          product_category: product.product_category,
          product_name: product.product_name
        }],
        currency: 'JPY'
      };

      sendGTMEvent('add_to_cart', 'add_to_cart_event', eventValue);
      
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePurchase = () => {
    if (cart.length === 0) return;

    const transactionId = `T${Date.now()}`;
    const totalAmount = getTotalAmount();
    
    const eventValue: GTMEventValue = {
      products: cart.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        product_category: item.product_category,
        product_name: item.product_name
      })),
      transaction_id: transactionId,
      currency: 'JPY',
      total_amount: totalAmount
    };

    sendGTMEvent('purchase', 'purchase_event', eventValue);
    
    alert(`購入完了！\n注文ID: ${transactionId}\n合計金額: ¥${totalAmount.toLocaleString()}`);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Home
      </Link>
      
      <h1 className="text-4xl font-bold mb-6">ECサイト GTM テスト</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">商品一覧</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">商品画像</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{product.product_name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.product_category}</p>
                <p className="text-xl font-bold text-green-600 mb-4">¥{product.price.toLocaleString()}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                  カートに追加
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              ショッピングカート ({cart.reduce((total, item) => total + item.quantity, 0)})
            </h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500">カートは空です</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">{item.product_category}</p>
                        <p className="text-green-600 font-semibold">¥{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 ml-2"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">合計金額:</span>
                    <span className="text-xl font-bold text-green-600">
                      ¥{getTotalAmount().toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={handlePurchase}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded transition-colors font-semibold"
                  >
                    購入する
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">GTM デバッグ情報</h3>
            <div className="space-y-2 text-sm">
              <p><strong>送信イベント数:</strong> {eventCount}</p>
              <p><strong>Container ID:</strong> GTM-N62ZNWG6</p>
              <p><strong>Member ID:</strong> user_demo_123456</p>
              {mounted && typeof window !== 'undefined' && window.dataLayer && (
                <div className="mt-4">
                  <p><strong>dataLayer (最新5件):</strong></p>
                  <pre className="bg-gray-100 p-4 text-xs overflow-auto min-h-96 max-h-screen whitespace-pre-wrap break-words border rounded">
                    {JSON.stringify(window.dataLayer.slice(-5), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">GTM イベント仕様</h3>
        <ul className="text-yellow-700 space-y-1 text-sm">
          <li>• <strong>add_to_cart:</strong> 商品をカートに追加時に送信</li>
          <li>• <strong>purchase:</strong> 購入ボタン押下時に送信</li>
          <li>• イベントデータは event_value に JSON 文字列で格納</li>
          <li>• ブラウザの開発者ツールでコンソールログを確認してください</li>
        </ul>
      </div>
    </div>
  );
}