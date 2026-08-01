"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Medication_logs = {
  user_id: string;
  target_date: string;
  time_slot: string;
};

export default function Home() {
  //[記憶の準備]
  //現在の値の箱と、スイッチを作る
  const [ status, setStatus] = useState(1);
  const [current, setCurrent] = useState("");
  
  useEffect(() => {
    const updateTime =() => {
      const now = new Date();
      setCurrent(now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }));
     };

     updateTime();//1回だけ実行される これを書かないと1秒間時間が表示されない

     //1秒ごとにupdateTimeを繰り返すタイマー
     const timerId = setInterval(updateTime, 1000);

     //画面を閉じるときにタイマー解除　アンマウント
     return () => clearInterval(timerId); //return()クリーンアップ関数
  },[]);

  const handleDrink = async () => {
    const now = new Date();

    //yyyy-mm-dd
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0'); //月は０から始まるから+1をして合わせる。
    const dd = String(now.getDate()).padStart(2, '0');
    const todayDate =`${yyyy}-${mm}-${dd}`; //操作日時

    //操作された時間を取得して時間帯を判定
    const hour = now.getHours();
    let currentSlot = ""; //時間帯を入れる箱

    if (hour >= 5 && hour < 11) {
      currentSlot = "morning";
    } else if (hour >= 11 && hour < 15) {
      currentSlot = "noon";
    } else if (hour >= 15 && hour < 19){
      currentSlot = "evening";
    } else{
      currentSlot = "nigth";
    }

    const insertData: Medication_logs ={
      user_id: '123e4567-e89b-12d3-a456-426614174000',
          target_date: todayDate,
          time_slot: currentSlot
    }

    const {error} = await supabase
      .from('medication_logs')
      .insert([insertData]);

    if (error) {
      console.error("保存エラー:", error);
    } else {
      setStatus(status + 1);
    }
  };
  //[見た目]
  return (
    <main className="p-20 text-center">
      <h1 className="text-4xl font-bold mb-8">
         {status === 1 ? "お薬飲んだ？" : "Good Job"}
      </h1>
      <div className="text-6xl font-mono mb-10 text-gray-700 font-bold tracking-widest">
        {current || "--:--"}
      </div>

      <button 
        onClick={handleDrink}
        disabled = {status === 2}
        className="bg-blue-500 text-white font-bold py-4 px-8 rounded-xl"
        >
          {status === 1 ? "飲んだ" : "完了"}
        </button>
    </main>
  )
}