'use client'; // Client Component であることを明示

// 3. 必要なインポートのみ残す
import { useActionState } from 'react';
import { useState, useEffect } from 'react';

// 4. actions.ts から型と関数をインポート
import { type FormState, submitAction } from './submit'; // (パスは適宜調整してください)

export default function TimeCardForm() {

    // 5. Server Action (submit) 関数は削除する
    // async function submit(...) { ... } // ← このブロック全体を削除

    // 6. useFormState の設定
    const initialState: FormState = { message: '' };
    // ↓ インポートした submitAction を渡す
    const [state, formAction] = useActionState(submitAction, initialState);

    // 7. 入力値をClient Stateで管理
    const [employeeId, setEmployeeId] = useState('');

    // 8. Server Actionの実行結果(state)を監視
    useEffect(() => {
        if (state.success) {
            setEmployeeId('');
        }
    }, [state]);

    return (
        <>
            {/* 9. form の action に formAction を設定 (ここは変更なし) */}
            <form action={formAction}>
                <div className="mt-1">
                    <input
                        name="employeeId"
                        className="border border-gray-700"
                        type="number"
                        placeholder="出席番号を入力"
                        required
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        onKeyDown={(e)=>{
                            if(e.key==='Enter')
                            {
                                e.preventDefault();
                            }
                        }}
                    />
                    <button
                        type="submit" name="action" value="check"
                        className="bg-gray-600 text-white font-bold py-2 px4 rounded ml-10 ...">出席番号確認</button>
                </div>

                <div className="mt-5">
                    <button
                        type="submit"
                        name="action"
                        value="clock-in"
                        className="bg-lime-600 text-white font-bold py-2 px-4 rounded mr-10 ...">出勤</button>
                    <button
                        type="submit"
                        name="action"
                        value="clock-out"
                        className="bg-amber-600 text-white font-bold py-2 px-4 rounded ...">退勤</button>
                </div>
            </form>

            {/* 10. メッセージ表示 (ここは変更なし) */}
            {state.message && (
                <div className="mt-4 p-2 bg-gray-100 border border-gray-300 rounded">
                    <p>{state.message}</p>
                </div>
            )}
        </>
    )
}