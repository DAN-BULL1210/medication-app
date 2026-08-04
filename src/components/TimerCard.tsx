import { syncBuiltinESMExports } from "module";

type Props = {
  status: number;
  isAlert: boolean;
  hasCurrentMeds: boolean;
  current: string;
  onDrink: () => void;
};

export default function TimerCard({status, isAlert, hasCurrentMeds, current, onDrink} : Props) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-white">
      <h1 className={`text-4xl font-bold mb-8 ${status === 1 && isAlert ? "text-red-500" : ""} `}>
        {!hasCurrentMeds
          ? "この時間に飲むお薬はありません。"
          : status === 2
            ? "Good Job!"
            : isAlert
              ? "飲み忘れていませんか？"
              : "お薬飲んだ？"}
      </h1>
      <div className="text-6xl font-mono mb-10 text-gray-800 font-bold tracking-widest">
        {current || "--:--"}
      </div>

      <button
        onClick={onDrink}
        disabled={status === 2 || !hasCurrentMeds}
        className={`w-full font-bold py-4 px-8 rounded-full transition-all duration-200 transform ${
          !hasCurrentMeds
            ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed" 
            : status === 2 
              ? "bg-gray-300 text-gray-600 shadow-inner cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl active:scale-95" 
        }`}
      >
        {!hasCurrentMeds ? "次の時間に忘れずに！" : status ===1 ? "飲んだ！" : "記録完了"}
      </button>
    </div>
  );
}