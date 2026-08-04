//薬データの型定義
export type Medication = {
  id?: number;
  user_id: string;
  name: string;
  time_slot: string;
};

//props
type Props = {
  medList: Medication[];
  onDelete: (id?: number) => void;
};

export default function MedicationList({ medList, onDelete }: Props) {
  return (
    <div className=" bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full border border-white">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-5 text-gray-700 text-center">登録済みのお薬</h2>

        {medList.length === 0 ? (
          <p className="text-center text-xs text-gray-400">まだ登録されていません。</p>
        ) : (
          <ul className="space-y-2">
            {medList.map((med, index) => (
              <li key={med.id || index} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <span className="font-bold text-gray-700 mr-2">{med.name}</span>
                  <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-bold">
                    {med.time_slot}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(med.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                  >
                    削除
                  </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}