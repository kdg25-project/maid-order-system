import { getUserById } from "@/api/users";
import RedirectPage from "./redirect";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getUserById(id);
  if (res.data.success === false) {
    return <div>error:ユーザーが見つかりません。</div>;
  }
  const data = res.data.data;
  return <RedirectPage userdata={data} />;
}
