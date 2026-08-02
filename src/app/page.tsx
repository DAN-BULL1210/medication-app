"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Medication_logs = {
  user_id: string;
  target_date: string;
  time_slot: string;
};

const getCurrentTimeinfo = () => {
    const now = new Date();
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
 
    } else {
      currentSlot = "night";
    }

    //計算結果をセットにして返す
    return { todayDate, currentSlot };
};

export default function Home() {
  //[記憶の準備]
  //現在の値の箱と、スイッチを作る
  const [ status, setStatus] = useState(1);
  const [current, setCurrent] = useState("");

  const [isAlert, setIsAlert] = useState(false); //飲み忘れ防止のアラート
  
  useEffect(() => {
    const updateTime =() => {
      const now = new Date();
      setCurrent(now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }));
      
      const hour = now.getHours();
      if (hour === 10 || hour === 14 || hour === 18 || hour === 23) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }

    };

     updateTime();//1回だけ実行される これを書かないと1秒間時間が表示されない

     //1秒ごとにupdateTimeを繰り返すタイマー
     const timerId = setInterval(updateTime, 1000);

     //画面を閉じるときにタイマー解除　アンマウント
     return () => clearInterval(timerId); //return()クリーンアップ関数
  },[]);

  useEffect(() => {
    const checkStatus = async () => {
      //todayとnowを取得
      const { todayDate, currentSlot} =getCurrentTimeinfo();

      //supabaseにtodayかつ今の時間帯のデータがあるか確認
      const { data, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('target_date', todayDate) //日時が一致するデータ
        .eq('time_slot', currentSlot) //時間帯が一致するデータ

      if (error) {
        console.error("データ取得エラー:", error);
        return;
      }

      //データを確認して判定
      if (data && data.length > 0) {
        //データがあれば２（飲んでいるならGood Job）
        setStatus(2);
      } else {
        setStatus(1);
      }
    };

    checkStatus();
  },[]);

  const handleDrink = async () => {
    
    const { todayDate, currentSlot } = getCurrentTimeinfo();
      
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
  //[修正] status と isAlert の状態によって見た目を変える
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-white">
        <h1 className={`text-4xl font-bold mb-8 ${status === 1 && isAlert ? "text-red-500" : ""} `}>
          {status === 2 
            ? "Good Job"
            : isAlert
              ? "飲み忘れていませんか？"
              : "お薬飲んだ？"}
        </h1>
        <div className="text-6xl font-mono mb-10 text-gray-800 font-bold tracking-widest">
          {current || "--:--"}
        </div>

        <button 
          onClick={handleDrink}
          disabled={status === 2}
          className={`w-full font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-200 transform active:scale-95 ${
            status === 2 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-xl"
          }`}
        >
          {status === 1 ? "飲んだ！" : "記録完了"}
        </button>
      </div>
    </main>
  )
}