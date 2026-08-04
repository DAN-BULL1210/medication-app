type Props = {
  medName: string;
  setMedName: (name: string) => void;
  medTime: string;
  setMedTime:(time: string) => void;
  onAdd: () => void;
};

export default function MedicationForm({ medName, setMedName, medTime, setMedTime, onAdd} : Props) {
  return (
    <div className=" bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full border border-white">
      <h2 className="text-xl font-bold mb-5 text-gray-700 text-center">お薬の登録</h2>
      <div className="space-y-4">

        {/*お薬名の入力*/}
        <div>
          <label className="block text-sm font-bold text-gray-600">お薬名</label>
          <input
            type="text"
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg p-2 focus:outline-none focus:border-blue-400"
            placeholder="例：ロキソニン"
          />
        </div>

        {/*時間帯の選択*/}
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">飲む時間帯</label>
          <select
            value={medTime}
            onChange={(e) => setMedTime(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg p-2 focus:outline-none  focus:border-blue-400"
          >
            <option value="morning">朝(morning)</option>
            <option value="noon">昼(noon)</option>
            <option value="evening">夜(evening)</option>
            <option value="night">寝る前(night)</option>
          </select>
        </div>
        
        {/*登録ボタン*/}
        <button
          onClick={onAdd}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow transition-colors active:scale-95">
            登録
          </button>

      </div>
    </div>
  );
}