"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

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
      setMedName(""); //入力欄を空に
    }

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
      {/* 1つ目のカード：今までのお薬飲んだ？の画面 */}
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-white">
        <h1 className={`text-4xl font-bold mb-8 ${status === 1 && isAlert ? "text-red-500" : ""} `}>
          {!hasCurrentMeds
            ?"この時間に飲むお薬はありません。"
            : status === 2 
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
          disabled={status === 2 || !hasCurrentMeds} //飲む薬がある➤飲んだか、まだ飲んでないかor飲む薬がないかでmessageを変更
          className={`w-full font-bold py-4 px-8 rounded-full transition-all duration-200 transform ${
            !hasCurrentMeds
              ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed" //薬なし（影なし・一番薄いグレー）
              : status === 2 
                ? "bg-gray-300 text-gray-600 shadow-inner cursor-not-allowed" //記録完了（少し濃いグレー・へこんだ影）
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl active:scale-95" //未記録（青・浮き出る影）
          }`}
        >
          {!hasCurrentMeds ? "次の時間に忘れずに！" : status === 1 ? "飲んだ！" : "記録完了"}
        </button>
      </div>

      {/* 2つ目のカード：お薬登録フォーム */}
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full border border-white">
        <h2 className="text-xl font-bold mb-5 text-gray-700 text-center">お薬の登録</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600">お薬名</label>
            <input 
              type="text"
              value={medName}
              onChange={(e) => setMedName(e.target.value)} 
              className="w-full border-2 border-gray-200 rounded-lg p-2 focus:outline-none focus:border-blue-400"
              placeholder="例: ロキソニン"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">飲む時間帯</label>
            <select
              value={medTime}
              onChange={(e) => setMedTime(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-2 focus:outline-none focus:border-blue-400 bg-white"
            >
              <option value="morning">朝(morning)</option>
              <option value="noon">昼(noon)</option>
              <option value="evening">夜(evening)</option>
              <option value="night">寝る前(night)</option> 
            </select>
          </div>

          <button
            onClick={handleDrink}
            disabled = {status === 2 || !hasCurrentMeds} 
            className="w-full bg-green-500 bover:bg-green-600 text-white font-bold py-3 rounded-xl shadow transition-colors active:scale-95">
              登録
          </button>

          <div className="mt-6 border-t-2 border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-600 mb-3 text-center">📋 登録済みのお薬</h3>
            
            {medList.length === 0 ? (
              <p className="text-center text-xs text-gray-400">まだ登録されていません</p>
            ) : (
              <ul className="space-y-2">
                {medList.map((med, index) => (
                  <li key={med.id || index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-700">{med.name}</span>
                      <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-bold">
                       {med.time_slot}
                      </span>

                      <button
                        onClick={() => handleDeleteMedication(med.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}