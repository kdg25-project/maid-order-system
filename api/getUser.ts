import { easyFetch } from "@/lib/easyFetch";

type User = {
  data: {
    id: string;
    name: string;
    maid_id: string;
    instax_maid_id: string;
    is_valid: boolean;
    created_at: string;
    updated_at: string;
  };
};

export default async function fetchUser(UserId: string) {
  const response = await easyFetch<User>({
    endpoint: `/api/users/${UserId}`,
    method: "GET",
  });
  return response;
}
