import { error } from "console";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
  try {
    //clientから送られてくるメッセージの内容を受け取る
    const { message } = await request.json();

    //.env.localから鍵と宛先を取り出す
    const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const USER_ID = process.env.LINE_MY_USER_ID;

    //鍵が設定されていない場合のエラーチェック
    if (!TOKEN || !USER_ID) {
      console.error("LINEのキーが設定されていません。");
      return NextResponse.json({ success: false, error: "Missing LINE API keys" }, { status: 500 });
    }

    //LINEの公式サーバーにデータを送る
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        to: USER_ID, //宛先
        messages: [
          {
            type: 'text',
            text: message, //画面から受け取ったメッセージ
          },
        ],
      }),
    });

    //送信失敗時のエラーチェック
    if (!response.ok) {
      const errorData = await response.text();
      console.error("LINE送信エラー", errorData);
      throw new Error('LINE API Error');
    }

    return NextResponse.json({ success: true });//
  } catch (error) {
    console.error("予期せぬエラー:", error);
    return NextResponse.json({ success: false }, { status: 500 })
  }
}