import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <p className="flex flex-row items-center justify-center mt-20 text-lg text-gray-600 gap-2">
      Loading...
      <Spinner />
    </p>
  );
}
