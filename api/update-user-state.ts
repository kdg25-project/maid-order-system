"use server";

import { updateUser } from "./users";

/**
 * ユーザーのステータスを更新する（Server Action）
 *
 * この関数はサーバー側でのみ実行され、環境変数からAPIキーを取得します。
 * ユーザーが操作する画面から安全に呼び出すことができます。
 *
 * @param userId - 更新対象のユーザーID
 * @param status - 新しいステータス値
 * @returns 更新されたユーザー情報
 */
export async function updateUserState(userId: string, status: string) {
  // 環境変数からAPIキーを取得
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error(
      "APIキーが設定されていません。環境変数を確認してください。",
    );
  }

  try {
    // updateUser関数を使ってステータスを更新
    const response = await updateUser(userId, { status }, apiKey);

    return response;
  } catch (error) {
    console.error("ユーザーステータスの更新に失敗しました:", error);
    throw error;
  }
}
