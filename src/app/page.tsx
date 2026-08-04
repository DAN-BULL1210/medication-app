"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import MedicationList from "@/components/MedicationList";
import MedicationForm from "@/components/MedicationForm";
import TimerCard from "@/components/TimerCard";

type Medication_logs = {
  user_id: string;
  target_date: string;
  time_slot: string;
};

type Medication = {
  id?: number;
  user_id: string;
  name: string;
  time_slot: string
}
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
  const [medName, setMedName] = useState(""); //薬の名前 
  const [medTime, setMedTime] = useState("morning"); //飲む時間帯

  const [medList, setMedList] = useState<Medication[]>([]);

 //お薬リストを取得する関数
  const fetchMedications = async () => {
    const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', '123e4567-e89b-12d3-a456-426614174000');

      if (error) {
        console.error("お薬リスト取得エラー:", error);
      } else {
        setMedList(data || []);
      }
  };

  //時計とアラートのタイマー
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

     updateTime();
     const timerId = setInterval(updateTime, 1000);
     return () => clearInterval(timerId); 
  },[]);

  //画面が開いた時に「ステータス確認」と「リスト取得」をまとめて行う
  useEffect(() => {
    const initializeApp = async () => {
      //todayとnowを取得して、飲んだかどうかのステータスを確認
      const { todayDate, currentSlot} = getCurrentTimeinfo();
      const { data: logData, error: logError } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('target_date', todayDate)
        .eq('time_slot', currentSlot)

      if (logError) {
        console.error("データ取得エラー:", logError);
      } else if (logData && logData.length > 0) {
        setStatus(2);
      } else {
        setStatus(1);
      }

      //お薬リストも取得して画面にセット
      const { data: medData, error: medError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', '123e4567-e89b-12d3-a456-426614174000');

      if (medError) {
        console.error("お薬リスト取得エラー:", medError);
      } else {
        setMedList(medData || []);
      }
    };

    initializeApp(); // まとめた処理を実行
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
  
  const handleAddMedication = async () => {
    if (!medName) {
      alert("お薬名を入力してください。");
      return;
    }

    const newMed: Medication = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      name: medName,
      time_slot: medTime
    };
    
    const { error } = await supabase
      .from('medications')
      .insert([newMed]);

    if (error) {
      console.error("登録エラー:", error);
      alert("登録に失敗しました。")
    } else {
      alert("お薬を登録しました。");
      setMedName("");
      fetchMedications();
    }
  };
  
  const { currentSlot } = getCurrentTimeinfo();
  const hasCurrentMeds = medList.some((med) => med.time_slot === currentSlot);

  //削除機能
  const handleDeleteMedication = async (id?: number) => {
    if (!id) return;

    if(!window.confirm("本当にこのお薬を削除しますか？")) {
      return; //キャンセル時
    }
    const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id); //渡されたIDと一致するデータを消す

    if (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました。");
    } else {
      fetchMedications();
    }
  };
  
  //[修正] status と isAlert の状態によって見た目を変える
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 space-y-8">
      {/* 1つ目のカード：時間表示・確認ボタン */}
      <TimerCard
        status={status}
        isAlert={isAlert}
        hasCurrentMeds={hasCurrentMeds}
        current={current}
        onDrink={handleDrink}
      />

      {/* 2つ目のカード：登録済みリスト*/}
      <div className="mt-6 border-t-2 border-gray-100 pt-4">
        <MedicationList medList={medList} onDelete={handleDeleteMedication} />
      </div>

      {/* 3つ目のカード：お薬登録フォーム */}
      <MedicationForm
        medName={medName}
        setMedName={setMedName}
        medTime={medTime}
        setMedTime={setMedTime}
        onAdd={handleAddMedication}
      />
    </main>
  )
}