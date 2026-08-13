import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Service Role Keyを使ってSupabaseの制限（RLS）をすり抜けて接続
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 現在の日本時間を取得
    const now = new Date();
    const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const currentHours = String(japanTime.getUTCHours()).padStart(2, '0');
    const currentMinutes = String(japanTime.getUTCMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    //設定された時間に該当するお薬データを検索
    const { data: medications, error } = await supabaseAdmin
      .from('medications')
      .select('name, time, user_id')
      .eq('time', currentTimeStr);

    if (error) {
      console.error('Database Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!medications || medications.length === 0) {
      return NextResponse.json({ message: `対象のお薬はありません。 (${currentTimeStr})` });
    }

    //対象のユーザーへLINE通知を送信
    for (const med of medications) {
      // user_id ("line|U...") から LINEのユーザーID ("U...") を抽出
      const rawUserId = med.user_id;
      const lineUserId = rawUserId.includes('|') ? rawUserId.split('|')[1] : rawUserId;

      await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.LINE_BOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: lineUserId,
          messages: [
            {
              type: 'text',
              text: `お薬の時間です💊\n\n【お薬】${med.name}\n【設定時間】${med.time}\n\n飲んだらアプリで「飲んだ」をTAP`,
            },
          ],
        }),
      });
    }

    return NextResponse.json({ 
      message: `${medications.length}件の通知を送信しました。 (${currentTimeStr})` 
    });

  } catch (err) {
    console.error('Server Error:', err);
    return NextResponse.json({ error: '通知処理でエラーが発生しました。' }, { status: 500 });
  }
}